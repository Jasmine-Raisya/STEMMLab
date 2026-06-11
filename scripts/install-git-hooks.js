const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const hooksDir = path.join(root, '.git', 'hooks');
const hookPath = path.join(hooksDir, 'pre-commit');

if (!fs.existsSync(hooksDir)) {
  console.log('No .git/hooks directory found; skipping local hook installation.');
  process.exit(0);
}

const hook = `#!/usr/bin/env node
const { spawnSync } = require('child_process');

console.log('Running STEMM Games pre-commit checks...');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCommand, ['run', 'secrets:scan:staged'], {
  stdio: 'inherit',
});

process.exit(result.status || 0);
`;

fs.writeFileSync(hookPath, hook, { mode: 0o755 });
console.log('Installed .git/hooks/pre-commit secret scanner.');
