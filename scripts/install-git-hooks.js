const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const hooksDir = path.join(root, '.git', 'hooks');
const hookPath = path.join(hooksDir, 'pre-commit');

if (!fs.existsSync(hooksDir)) {
  console.log('No .git/hooks directory found; skipping local hook installation.');
  process.exit(0);
}

const hook = `#!/bin/sh
echo "Running STEMM Games pre-commit checks..."
npm run secrets:scan:staged
`;

fs.writeFileSync(hookPath, hook, { mode: 0o755 });
console.log('Installed .git/hooks/pre-commit secret scanner.');
