import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const styleExtensions = new Set(['.css', '.sass', '.scss']);
const rawColorExpression = /#[\da-f]{3,8}\b|\b(?:rgb|hsl)a?\s*\(/giu;
const dimensionExpression = /(?<![\w.])[-+]?(?:\d*\.)?\d+(?:px|r?em|vh|vw|dvh|dvw|ms|s)\b/giu;

export function stripStyleComments(source) {
  return source
    .replace(/<!--[\s\S]*?-->/gu, (comment) => comment.replace(/[^\n]/gu, ' '))
    .replace(/\/\*[\s\S]*?\*\//gu, (comment) => comment.replace(/[^\n]/gu, ' '))
    .replace(/(?<!:)\/\/[^\n]*/gu, (comment) => comment.replace(/[^\n]/gu, ' '));
}

export function isTokenDefinition(projectPath) {
  return /(?:^|\/)_[^/]*tokens\.s[ac]ss$/u.test(projectPath);
}

export function inspectStyleSource(source, projectPath) {
  const uncommented = stripStyleComments(source);
  const violations = [];

  if (projectPath !== 'styles/_tokens.scss') {
    for (const match of uncommented.matchAll(rawColorExpression)) {
      violations.push(toViolation(source, match, projectPath, 'raw colour'));
    }
  }

  if (!isTokenDefinition(projectPath)) {
    for (const match of uncommented.matchAll(dimensionExpression)) {
      violations.push(toViolation(source, match, projectPath, 'unit-bearing dimension'));
    }
  }

  return violations;
}

export function inspectInlineStyleSurfaces(source, projectPath) {
  const violations = [];
  const uncommented = stripStyleComments(source);
  const expression =
    extname(projectPath) === '.html'
      ? /\bstyle\s*=|\[(?:ngStyle|style(?:\.[^\]]+)?)\]\s*=/giu
      : /\bstyles\s*:|['"]\[style(?:\.[^\]]+)?\]['"]\s*:/giu;

  for (const match of uncommented.matchAll(expression)) {
    violations.push(toViolation(source, match, projectPath, 'inline style surface'));
  }

  return violations;
}

export async function collectSourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      return entry.isDirectory() ? collectSourceFiles(path) : [path];
    }),
  );

  return files.flat();
}

export async function inspectProject(sourceRoot) {
  const files = await collectSourceFiles(sourceRoot);
  const violations = [];
  let consumerStyleCount = 0;

  for (const file of files) {
    const projectPath = relative(sourceRoot, file);
    const extension = extname(file);

    if (styleExtensions.has(extension)) {
      const source = await readFile(file, 'utf8');
      violations.push(...inspectStyleSource(source, projectPath));
      consumerStyleCount += Number(!isTokenDefinition(projectPath));
    } else if (extension === '.html' || extension === '.ts') {
      const source = await readFile(file, 'utf8');
      violations.push(...inspectInlineStyleSurfaces(source, projectPath));
    }
  }

  return { consumerStyleCount, violations };
}

function toViolation(source, match, projectPath, label) {
  return {
    label,
    line: source.slice(0, match.index).split('\n').length,
    match: match[0],
    projectPath,
  };
}
