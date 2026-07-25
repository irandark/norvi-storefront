import process from 'node:process';
import { fileURLToPath } from 'node:url';

import { formatArchitectureViolation, inspectArchitecture } from './architecture-guard.mjs';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const violations = await inspectArchitecture(projectRoot);

if (violations.length > 0) {
  console.error(
    ['Architecture guard failed.', ...violations.map(formatArchitectureViolation)].join('\n'),
  );
  process.exitCode = 1;
} else {
  console.log('Architecture guard passed.');
}
