import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { inspectProject } from './style-token-guard.mjs';

const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url));
const { consumerStyleCount, violations } = await inspectProject(sourceRoot);

if (violations.length > 0) {
  console.error(
    [
      'Style-token guard failed.',
      'Move shared values to an owned token file and remove inline styles:',
      ...violations.map(
        ({ label, line, match, projectPath }) => `- ${projectPath}:${line} ${label}: ${match}`,
      ),
    ].join('\n'),
  );
  process.exitCode = 1;
} else {
  console.log(`Style-token guard passed for ${consumerStyleCount} consumer files.`);
}
