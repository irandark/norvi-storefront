import { readdir, readFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';

import ts from 'typescript';

const FEATURE_MARKER = ['src', 'app', 'features'];
const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx']);
const STORAGE_GLOBALS = new Set(['indexedDB', 'localStorage', 'sessionStorage']);
const GLOBAL_OBJECTS = new Set(['globalThis', 'self', 'window']);

export async function inspectArchitecture(projectRoot, options = {}) {
  const root = resolve(projectRoot);
  const tsconfigPath = resolve(root, options.tsconfigPath ?? 'tsconfig.json');
  const sourceRoot = resolve(root, options.sourceRoot ?? 'src');
  const config = readTsConfig(tsconfigPath);
  const sourceFiles = (await collectTypeScriptFiles(sourceRoot)).sort();
  const program = ts.createProgram({
    rootNames: sourceFiles,
    options: {
      ...config.options,
      noEmit: true,
    },
  });
  const checker = program.getTypeChecker();
  const violations = [];

  for (const sourceFile of program.getSourceFiles()) {
    if (!isWithin(sourceFile.fileName, sourceRoot) || sourceFile.isDeclarationFile) {
      continue;
    }

    inspectSourceFile({
      checker,
      compilerOptions: config.options,
      projectRoot: root,
      sourceFile,
      violations,
    });
  }

  return violations.sort(compareViolations);
}

export function formatArchitectureViolation(violation) {
  return `${violation.projectPath}:${violation.line} [${violation.rule}] ${violation.reason}`;
}

async function collectTypeScriptFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectTypeScriptFiles(path);
      }
      return SOURCE_EXTENSIONS.has(extname(entry.name)) && !entry.name.endsWith('.d.ts')
        ? [path]
        : [];
    }),
  );
  return files.flat();
}

function readTsConfig(tsconfigPath) {
  const loaded = ts.readConfigFile(tsconfigPath, ts.sys.readFile);
  if (loaded.error) {
    throw new Error(ts.flattenDiagnosticMessageText(loaded.error.messageText, '\n'));
  }
  return ts.parseJsonConfigFileContent(loaded.config, ts.sys, dirname(tsconfigPath));
}

function inspectSourceFile(context) {
  const sourceBoundary = featureBoundary(context.sourceFile.fileName);
  const sourceProjectPath = projectPath(context.projectRoot, context.sourceFile.fileName);
  const isAppConfig = sourceProjectPath === 'src/app/app.config.ts';
  const isAppRoutes = sourceProjectPath === 'src/app/app.routes.ts';

  const visit = (node) => {
    const dependency = dependencyAt(node);
    if (dependency) {
      inspectExternalDependency({
        ...context,
        dependency,
        isAppConfig,
        sourceBoundary,
        sourceProjectPath,
      });
      const resolvedTarget = resolveDependency(
        dependency.specifier,
        context.sourceFile.fileName,
        context.compilerOptions,
      );
      if (resolvedTarget) {
        inspectDependency({
          ...context,
          dependency,
          isAppConfig,
          isAppRoutes,
          resolvedTarget,
          sourceBoundary,
          sourceProjectPath,
        });
      }
    }

    if (
      sourceBoundary?.layer === 'domain' &&
      ts.isIdentifier(node) &&
      isBrowserStorageReference(node, context.checker)
    ) {
      addViolation(context, node, sourceProjectPath, 'domain-browser-storage', 'Domain must not use browser storage globals.');
    }
    if (
      sourceBoundary?.layer === 'domain' &&
      ts.isElementAccessExpression(node) &&
      isComputedBrowserStorageReference(node, context.checker)
    ) {
      addViolation(context, node, sourceProjectPath, 'domain-browser-storage', 'Domain must not use browser storage globals.');
    }

    ts.forEachChild(node, visit);
  };
  visit(context.sourceFile);
}

function dependencyAt(node) {
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
    return node.moduleSpecifier && ts.isStringLiteralLike(node.moduleSpecifier)
      ? { node: node.moduleSpecifier, specifier: node.moduleSpecifier.text, kind: 'static' }
      : undefined;
  }
  if (
    ts.isCallExpression(node) &&
    node.expression.kind === ts.SyntaxKind.ImportKeyword &&
    node.arguments.length === 1 &&
    ts.isStringLiteralLike(node.arguments[0])
  ) {
    return { node: node.arguments[0], specifier: node.arguments[0].text, kind: 'dynamic' };
  }
  return undefined;
}

function inspectExternalDependency(context) {
  if (
    context.sourceBoundary?.layer === 'presentation' &&
    isAngularHttp(context.dependency.specifier)
  ) {
    addViolation(context, context.dependency.node, context.sourceProjectPath, 'presentation-http', 'Presentation must not import Angular HTTP APIs.');
  }
  if (
    context.sourceBoundary?.layer === 'domain' &&
    isAngularHttp(context.dependency.specifier)
  ) {
    addViolation(context, context.dependency.node, context.sourceProjectPath, 'domain-http', 'Domain must not import Angular HTTP APIs.');
  }
}

function inspectDependency(context) {
  const targetBoundary = featureBoundary(context.resolvedTarget);

  if (context.isAppConfig) {
    if (targetBoundary?.layer === 'presentation') {
      addViolation(context, context.dependency.node, context.sourceProjectPath, 'composition-root-presentation', 'app.config.ts may compose feature domain and data-access dependencies, but not presentation.');
    }
    return;
  }

  if (!context.sourceBoundary) {
    if (!targetBoundary) {
      return;
    }
    const routeException =
      context.isAppRoutes &&
      context.dependency.kind === 'dynamic' &&
      targetBoundary.layer === 'presentation';
    if (!routeException) {
      addViolation(context, context.dependency.node, context.sourceProjectPath, 'application-feature-internals', 'Application code may access feature internals only from app.config.ts or dynamic route loading in app.routes.ts.');
    }
    return;
  }

  if (!targetBoundary) {
    return;
  }

  const crossFeature = context.sourceBoundary.feature !== targetBoundary.feature;
  if (crossFeature) {
    if (
      targetBoundary.layer !== 'domain' ||
      !isDomainIndex(context.resolvedTarget, targetBoundary)
    ) {
      addViolation(context, context.dependency.node, context.sourceProjectPath, 'cross-feature-public-api', 'Cross-feature imports must resolve exactly to the target feature domain/index.ts public API.');
    }
    return;
  }

  if (
    context.sourceBoundary.layer === 'presentation' &&
    targetBoundary.layer === 'data-access'
  ) {
    addViolation(context, context.dependency.node, context.sourceProjectPath, 'presentation-data-access', 'Presentation must not depend on data-access internals.');
  }
  if (context.sourceBoundary.layer === 'domain' && targetBoundary.layer === 'data-access') {
    addViolation(context, context.dependency.node, context.sourceProjectPath, 'domain-data-access', 'Domain must not depend on data-access internals or DTOs.');
  }
  if (context.sourceBoundary.layer === 'domain' && targetBoundary.layer === 'presentation') {
    addViolation(context, context.dependency.node, context.sourceProjectPath, 'domain-presentation', 'Domain must not depend on presentation or component types.');
  }
}

function resolveDependency(specifier, containingFile, compilerOptions) {
  const result = ts.resolveModuleName(specifier, containingFile, compilerOptions, ts.sys);
  const fileName = result.resolvedModule?.resolvedFileName;
  return fileName ? normalize(fileName.replace(/\.d\.ts$/u, '.ts')) : undefined;
}

function featureBoundary(fileName) {
  const parts = normalize(fileName).split('/');
  const markerIndex = findSequence(parts, FEATURE_MARKER);
  if (markerIndex < 0 || parts.length <= markerIndex + 4) {
    return undefined;
  }
  const feature = parts[markerIndex + 3];
  const layer = parts[markerIndex + 4];
  if (!['data-access', 'domain', 'presentation'].includes(layer)) {
    return undefined;
  }
  return {
    feature,
    layer,
    layerRoot: parts.slice(0, markerIndex + 5).join('/'),
  };
}

function isDomainIndex(fileName, boundary) {
  return normalize(fileName) === `${boundary.layerRoot}/index.ts`;
}

function isBrowserStorageReference(node, checker) {
  if (!STORAGE_GLOBALS.has(node.text)) {
    return false;
  }
  if (
    (ts.isPropertyAccessExpression(node.parent) && node.parent.name === node) ||
    (ts.isPropertyAssignment(node.parent) && node.parent.name === node)
  ) {
    if (
      ts.isPropertyAccessExpression(node.parent) &&
      ts.isIdentifier(node.parent.expression) &&
      GLOBAL_OBJECTS.has(node.parent.expression.text) &&
      isAmbientGlobal(node.parent.expression, checker)
    ) {
      return true;
    }
    return false;
  }
  return isAmbientGlobal(node, checker);
}

function isComputedBrowserStorageReference(node, checker) {
  return (
    ts.isIdentifier(node.expression) &&
    GLOBAL_OBJECTS.has(node.expression.text) &&
    isAmbientGlobal(node.expression, checker) &&
    node.argumentExpression !== undefined &&
    ts.isStringLiteralLike(node.argumentExpression) &&
    STORAGE_GLOBALS.has(node.argumentExpression.text)
  );
}

function isAmbientGlobal(node, checker) {
  const symbol = checker.getSymbolAtLocation(node);
  if (hasTopLevelShadow(node.getSourceFile(), node.text)) {
    return false;
  }
  if (!symbol) {
    return true;
  }
  return (symbol.declarations ?? []).every(
    (declaration) =>
      declaration.getSourceFile().isDeclarationFile &&
      !normalize(declaration.getSourceFile().fileName).includes('/src/'),
  );
}

function hasTopLevelShadow(sourceFile, name) {
  return sourceFile.statements.some((statement) => {
    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isEnumDeclaration(statement)) &&
      statement.name?.text === name
    ) {
      return true;
    }
    if (!ts.isVariableStatement(statement)) {
      return false;
    }
    return statement.declarationList.declarations.some(
      (declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === name,
    );
  });
}

function addViolation(context, node, sourceProjectPath, rule, reason) {
  const position = context.sourceFile.getLineAndCharacterOfPosition(node.getStart());
  context.violations.push({
    line: position.line + 1,
    projectPath: sourceProjectPath,
    reason,
    rule,
  });
}

function compareViolations(left, right) {
  return (
    left.projectPath.localeCompare(right.projectPath) ||
    left.line - right.line ||
    left.rule.localeCompare(right.rule)
  );
}

function projectPath(root, fileName) {
  return normalize(relative(root, fileName));
}

function normalize(path) {
  return path.split(sep).join('/');
}

function isWithin(fileName, directory) {
  const path = relative(directory, fileName);
  return path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

function findSequence(items, sequence) {
  return items.findIndex((_, index) =>
    sequence.every((part, offset) => items[index + offset] === part),
  );
}

function isAngularHttp(specifier) {
  return specifier === '@angular/common/http' || specifier.startsWith('@angular/common/http/');
}
