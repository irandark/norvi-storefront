import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { formatArchitectureViolation, inspectArchitecture } from './architecture-guard.mjs';

async function inspectFixture(files, compilerOptions = {}) {
  const root = await mkdtemp(join(tmpdir(), 'architecture-guard-'));
  try {
    await writeFixture(root, 'tsconfig.json', JSON.stringify({
      compilerOptions: {
        module: 'preserve',
        moduleResolution: 'bundler',
        target: 'ES2022',
        ...compilerOptions,
      },
    }));
    await Promise.all(
      Object.entries(files).map(([path, source]) => writeFixture(root, path, source)),
    );
    return await inspectArchitecture(root);
  } finally {
    await rm(root, { recursive: true });
  }
}

async function writeFixture(root, path, contents) {
  const file = join(root, path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, contents);
}

test('allows dependencies inside the documented direction', async () => {
  const violations = await inspectFixture({
    'src/app/features/catalog/domain/models/product.ts': 'export interface Product {}',
    'src/app/features/catalog/domain/services/catalog.ts':
      "import type { Product } from '../models/product'; export type Result = Product;",
    'src/app/features/catalog/data-access/repository.ts':
      "import type { Product } from '../domain/models/product'; export type Result = Product;",
    'src/app/features/catalog/presentation/page.ts':
      "import type { Product } from '../domain/models/product'; export type Result = Product;",
  });
  assert.deepEqual(violations, []);
});

test('rejects presentation access to data access through every dependency syntax', async () => {
  const violations = await inspectFixture({
    'src/app/features/catalog/data-access/dto/product.ts': 'export interface ProductDto {}',
    'src/app/features/catalog/presentation/a.ts':
      "import type { ProductDto } from '../data-access/dto/product';",
    'src/app/features/catalog/presentation/b.ts':
      "export { ProductDto } from '../data-access/dto/product';",
    'src/app/features/catalog/presentation/c.ts':
      "export type { ProductDto } from '../data-access/dto/product';",
    'src/app/features/catalog/presentation/d.ts':
      "export const load = () => import('../data-access/dto/product');",
  });
  assert.deepEqual(violations.map(({ rule }) => rule), [
    'presentation-data-access',
    'presentation-data-access',
    'presentation-data-access',
    'presentation-data-access',
  ]);
});

test('rejects presentation Angular HTTP and domain forbidden layers', async () => {
  const violations = await inspectFixture({
    'src/app/features/catalog/data-access/dto/product.ts': 'export interface ProductDto {}',
    'src/app/features/catalog/presentation/page.ts':
      "import { HttpClient } from '@angular/common/http'; void HttpClient;",
    'src/app/features/catalog/presentation/view.ts': 'export class View {}',
    'src/app/features/catalog/domain/a.ts':
      "import type { ProductDto } from '../data-access/dto/product';",
    'src/app/features/catalog/domain/b.ts':
      "import { HttpClient } from '@angular/common/http/testing'; void HttpClient;",
    'src/app/features/catalog/domain/c.ts':
      "import type { View } from '../presentation/view'; export type T = View;",
  });
  assert.deepEqual(violations.map(({ rule }) => rule), [
    'domain-data-access',
    'domain-http',
    'domain-presentation',
    'presentation-http',
  ]);
});

test('rejects installed Angular HTTP even when module resolution succeeds', async () => {
  const root = process.cwd();
  const violations = await inspectArchitecture(root);
  assert.equal(
    violations.some(({ rule }) => rule === 'presentation-http'),
    false,
    'the valid project itself must remain clean',
  );

  const fixture = await inspectFixture(
    {
      'src/app/features/catalog/presentation/page.ts':
        "import { HttpClient } from '@angular/common/http'; void HttpClient;",
    },
    {
      baseUrl: root,
      paths: {
        '@angular/*': ['node_modules/@angular/*'],
      },
    },
  );
  assert.deepEqual(fixture.map(({ rule }) => rule), ['presentation-http']);
});

test('enforces exact cross-feature domain index including aliases and traversal', async () => {
  const violations = await inspectFixture(
    {
      'src/app/features/cart/domain/index.ts': "export type { Cart } from './model';",
      'src/app/features/cart/domain/model.ts': 'export interface Cart {}',
      'src/app/features/cart/presentation/page.ts': 'export class Page {}',
      'src/app/features/cart/data-access/repository.ts': 'export class Repository {}',
      'src/app/features/catalog/presentation/allowed.ts':
        "import type { Cart } from '@features/cart/domain'; export type T = Cart;",
      'src/app/features/catalog/presentation/deep.ts':
        "import type { Cart } from '../../cart/domain/model'; export type T = Cart;",
      'src/app/features/catalog/domain/presentation.ts':
        "import type { Page } from '../../cart/presentation/page'; export type T = Page;",
      'src/app/features/catalog/data-access/repository.ts':
        "import type { Repository } from '@features/cart/data-access/repository'; export type T = Repository;",
    },
    {
      baseUrl: '.',
      paths: { '@features/*': ['src/app/features/*'] },
    },
  );
  assert.deepEqual(violations.map(({ projectPath, rule }) => [projectPath, rule]), [
    ['src/app/features/catalog/data-access/repository.ts', 'cross-feature-public-api'],
    ['src/app/features/catalog/domain/presentation.ts', 'cross-feature-public-api'],
    ['src/app/features/catalog/presentation/deep.ts', 'cross-feature-public-api'],
  ]);
});

test('rejects a public domain index that launders owned feature internals', async () => {
  const violations = await inspectFixture({
    'src/app/features/cart/data-access/repository.ts': 'export class Repository {}',
    'src/app/features/cart/presentation/page.ts': 'export class Page {}',
    'src/app/features/cart/domain/index.ts': `
      export { Repository } from '../data-access/repository';
      export { Page } from '../presentation/page';
    `,
  });
  assert.deepEqual(violations.map(({ rule }) => rule), [
    'domain-data-access',
    'domain-presentation',
  ]);
});

test('allows only the narrow application composition exceptions', async () => {
  const violations = await inspectFixture({
    'src/app/features/catalog/domain/index.ts': 'export interface Catalog {}',
    'src/app/features/catalog/data-access/repository.ts': 'export class Repository {}',
    'src/app/features/catalog/presentation/page.ts': 'export class Page {}',
    'src/app/app.config.ts':
      "import { Repository } from './features/catalog/data-access/repository'; void Repository;",
    'src/app/app.routes.ts':
      "export const route = () => import('./features/catalog/presentation/page');",
    'src/app/bad-route.ts':
      "export { Page } from './features/catalog/presentation/page';",
    'src/app/also-bad.ts':
      "import type { Catalog } from './features/catalog/domain'; export type T = Catalog;",
  });
  assert.deepEqual(violations.map(({ projectPath, rule }) => [projectPath, rule]), [
    ['src/app/also-bad.ts', 'application-feature-internals'],
    ['src/app/bad-route.ts', 'application-feature-internals'],
  ]);
});

test('allows only dynamic presentation loading from the exact app.routes file', async () => {
  const violations = await inspectFixture({
    'src/app/features/catalog/presentation/page.ts': 'export class Page {}',
    'src/app/app.routes.ts': `
      import { Page } from './features/catalog/presentation/page';
      export const eager = Page;
      export const lazy = () => import('./features/catalog/presentation/page');
    `,
  });
  assert.deepEqual(violations.map(({ rule }) => rule), ['application-feature-internals']);
});

test('rejects feature presentation imported by the exact app.config composition root', async () => {
  const violations = await inspectFixture({
    'src/app/features/catalog/presentation/page.ts': 'export class Page {}',
    'src/app/app.config.ts':
      "import { Page } from './features/catalog/presentation/page'; void Page;",
  });
  assert.deepEqual(violations.map(({ rule }) => rule), ['composition-root-presentation']);
});

test('rejects browser storage globals in domain but respects shadowing', async () => {
  const violations = await inspectFixture({
    'src/app/features/catalog/domain/storage.ts': `
      localStorage.getItem('a');
      window.sessionStorage.getItem('b');
      globalThis.indexedDB;
      window['localStorage'].getItem('c');
      globalThis['sessionStorage'].getItem('d');
      self['indexedDB'];
    `,
    'src/app/features/catalog/domain/shadowed.ts': `
      export function useOwnedStorage() {
        const localStorage = { getItem: (_key: string) => null };
        const window = { sessionStorage: { getItem: (_key: string) => null } };
        localStorage.getItem('a');
        window.sessionStorage.getItem('b');
        window['localStorage'].getItem('c');
        const model = { indexedDB: 'legal similar name', ProductDto: 'also legal' };
        void model;
      }
    `,
  });
  assert.deepEqual(violations.map(({ rule }) => rule), [
    'domain-browser-storage',
    'domain-browser-storage',
    'domain-browser-storage',
    'domain-browser-storage',
    'domain-browser-storage',
    'domain-browser-storage',
  ]);
});

test('respects top-level shadows of browser global names', async () => {
  const violations = await inspectFixture({
    'src/app/features/catalog/domain/shadowed-globals.ts': `
      const globalThis = { localStorage: { getItem: (_key: string) => null } };
      const sessionStorage = { getItem: (_key: string) => null };
      function indexedDB() { return 'domain operation'; }
      globalThis['localStorage'].getItem('a');
      sessionStorage.getItem('b');
      indexedDB();
    `,
  });
  assert.deepEqual(violations, []);
});

test('ignores comments, strings, unresolved imports, and legal similar names', async () => {
  const violations = await inspectFixture({
    'src/app/features/catalog/domain/model.spec.ts': `
      // import('../data-access/dto/product')
      const note = "localStorage and DTO are domain words here";
      interface ProductDtoLikeDomainModel { note: string }
      import type { Missing } from './not-created';
      export type Result = ProductDtoLikeDomainModel | Missing;
      void note;
    `,
  });
  assert.deepEqual(violations, []);
});

test('applies the same rules to colocated specs but allows domain Angular test utilities', async () => {
  const violations = await inspectFixture({
    'src/app/features/catalog/data-access/transport/http.ts': 'export class Http {}',
    'src/app/features/catalog/domain/legal.spec.ts':
      "import { TestBed } from '@angular/core/testing'; void TestBed;",
    'src/app/features/catalog/domain/illegal.spec.ts':
      "import { provideHttpClientTesting } from '@angular/common/http/testing'; void provideHttpClientTesting;",
    'src/app/features/catalog/presentation/page.spec.ts':
      "import { Http } from '../data-access/transport/http'; void Http;",
  });
  assert.deepEqual(violations.map(({ rule }) => rule), [
    'domain-http',
    'presentation-data-access',
  ]);
});

test('reports stable project-relative diagnostics ordered by file and line', async () => {
  const violations = await inspectFixture({
    'src/app/features/catalog/data-access/x.ts': 'export const x = 1;',
    'src/app/features/catalog/presentation/z.ts':
      "\nimport { x } from '../data-access/x';\nimport { HttpClient } from '@angular/common/http';\nvoid x; void HttpClient;",
    'src/app/features/catalog/presentation/a.ts':
      "import { x } from '../data-access/x'; void x;",
  });
  assert.deepEqual(violations.map(formatArchitectureViolation), [
    'src/app/features/catalog/presentation/a.ts:1 [presentation-data-access] Presentation must not depend on data-access internals.',
    'src/app/features/catalog/presentation/z.ts:2 [presentation-data-access] Presentation must not depend on data-access internals.',
    'src/app/features/catalog/presentation/z.ts:3 [presentation-http] Presentation must not import Angular HTTP APIs.',
  ]);
});
