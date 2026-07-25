import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  inspectInlineStyleSurfaces,
  inspectProject,
  inspectStyleSource,
  isTokenDefinition,
  stripStyleComments,
} from './style-token-guard.mjs';

test('rejects positive and negative dimensions in consumer styles', () => {
  const violations = inspectStyleSource(
    '.card { margin: 1rem; letter-spacing: -0.06em; }',
    'app/card.scss',
  );

  assert.deepEqual(
    violations.map(({ label, match }) => [label, match]),
    [
      ['unit-bearing dimension', '1rem'],
      ['unit-bearing dimension', '-0.06em'],
    ],
  );
});

test('rejects raw colour functions and literals case-insensitively', () => {
  const violations = inspectStyleSource(
    '.card { color: #AbC; background: RGB(0 0 0); }',
    'app/card.scss',
  );

  assert.equal(violations.length, 2);
  assert.ok(violations.every(({ label }) => label === 'raw colour'));
});

test('ignores comments while preserving source line numbers', () => {
  const source = '/* keep 16px and #fff in this note */\n.card { margin: 1rem; }';

  assert.equal(stripStyleComments(source).split('\n').length, 2);
  assert.deepEqual(inspectStyleSource(source, 'app/card.scss'), [
    {
      label: 'unit-bearing dimension',
      line: 2,
      match: '1rem',
      projectPath: 'app/card.scss',
    },
  ]);
});

test('allows dimensions in owned token files but only global palette colours', () => {
  assert.equal(isTokenDefinition('styles/_tokens.scss'), true);
  assert.equal(isTokenDefinition('app/_catalog-tokens.scss'), true);
  assert.equal(
    inspectStyleSource(':root { --space: 1rem; --ink: #fff; }', 'styles/_tokens.scss').length,
    0,
  );
  assert.deepEqual(
    inspectStyleSource(
      ':host { --local-size: 1rem; --local-ink: #fff; }',
      'app/_catalog-tokens.scss',
    ).map(({ label }) => label),
    ['raw colour'],
  );
});

test('allows intrinsic values and semantic colour keywords', () => {
  const source = `
    .card {
      margin: 0;
      width: 100%;
      grid-template-columns: 1fr 2fr;
      aspect-ratio: 4 / 3;
      line-height: 1.5;
      color: currentColor;
      background: transparent;
    }
  `;

  assert.deepEqual(inspectStyleSource(source, 'app/card.scss'), []);
});

test('rejects Angular inline and template style surfaces', () => {
  assert.equal(
    inspectInlineStyleSurfaces("@Component({ styles: ['.card { margin: 1rem }'] })", 'app/card.ts')
      .length,
    1,
  );
  assert.equal(
    inspectInlineStyleSurfaces('<div style="margin: 1rem"></div>', 'app/card.html').length,
    1,
  );
  assert.equal(
    inspectInlineStyleSurfaces(
      '<div [style.color]="color" [ngStyle]="layout"></div>',
      'app/card.html',
    ).length,
    2,
  );
  assert.equal(
    inspectInlineStyleSurfaces("@Component({ host: { '[style.color]': 'color' } })", 'app/card.ts')
      .length,
    1,
  );
  assert.equal(
    inspectInlineStyleSurfaces(
      '// styles: []\n@Component({ styleUrl: "./card.scss" })',
      'app/card.ts',
    ).length,
    0,
  );
  assert.equal(
    inspectInlineStyleSurfaces('<!-- <div style="margin: 1rem"></div> -->', 'app/card.html').length,
    0,
  );
});

test('scans nested CSS, Sass, SCSS, TypeScript, and template consumers', async () => {
  const sourceRoot = await mkdtemp(join(tmpdir(), 'style-token-guard-'));

  try {
    const nestedRoot = join(sourceRoot, 'app', 'feature');
    await mkdir(nestedRoot, { recursive: true });
    await Promise.all([
      writeFile(join(nestedRoot, 'card.css'), '.card { margin: 1rem; }'),
      writeFile(join(nestedRoot, 'card.sass'), '.card\n  color: #fff\n'),
      writeFile(join(nestedRoot, 'card.scss'), '.card { padding: -1rem; }'),
      writeFile(join(nestedRoot, 'card.ts'), '@Component({ styles: [] })'),
      writeFile(join(nestedRoot, 'card.html'), '<div style="margin: 0"></div>'),
    ]);

    const { consumerStyleCount, violations } = await inspectProject(sourceRoot);

    assert.equal(consumerStyleCount, 3);
    assert.deepEqual(violations.map(({ label }) => label).sort(), [
      'inline style surface',
      'inline style surface',
      'raw colour',
      'unit-bearing dimension',
      'unit-bearing dimension',
    ]);
  } finally {
    await rm(sourceRoot, { recursive: true });
  }
});
