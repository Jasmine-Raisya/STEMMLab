const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const safeRoot = root.replace(/\\/g, '/');
const stagedOnly = process.argv.includes('--staged');

const blockedFileNames = new Set([
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
  'google-services.json',
  'GoogleService-Info.plist',
  'service-account-key.json',
  'secrets.properties',
  'keys.properties',
  'signing.properties',
]);

const blockedExtensions = new Set(['.jks', '.keystore', '.p12', '.p8', '.pem']);

const ignoredDirs = new Set([
  '.git',
  '.expo',
  '.codex-backups',
  'android',
  'build',
  'coverage',
  'ios',
  'node_modules',
]);

const privateKeyBlockPattern = ['-----BEGIN (RSA |DSA |EC |OPENSSH |)?', 'PRIVATE KEY-----'].join('');
const googlePrivateKeyPattern = ['"private_key"\\s*:\\s*"', '-----BEGIN ', 'PRIVATE KEY-----'].join('');

const secretPatterns = [
  {
    name: 'private key block',
    pattern: new RegExp(privateKeyBlockPattern, 'i'),
  },
  {
    name: 'Google service account private key',
    pattern: new RegExp(googlePrivateKeyPattern, 'i'),
  },
  {
    name: 'GitHub token',
    pattern: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{30,}\b/,
  },
  {
    name: 'Firebase/Google API key assignment',
    pattern: /(firebase|google|api)[A-Za-z0-9_ -]*(key|token|secret)\s*[:=]\s*["'][A-Za-z0-9_\-]{25,}["']/i,
  },
  {
    name: 'generic secret assignment',
    pattern: /(password|secret|private_key|client_secret|access_token|refresh_token)\s*[:=]\s*["'][^"']{12,}["']/i,
  },
  {
    name: 'AWS access key',
    pattern: /\bAKIA[0-9A-Z]{16}\b/,
  },
];

function runGit(args) {
  return execFileSync('git', ['-c', `safe.directory=${safeRoot}`, ...args], {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  })
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else {
      files.push(path.relative(root, fullPath).replace(/\\/g, '/'));
    }
  }
  return files;
}

function getFilesToScan() {
  try {
    if (stagedOnly) {
      return runGit(['diff', '--cached', '--name-only', '--diff-filter=ACMR']);
    }
    return runGit(['ls-files']);
  } catch {
    return stagedOnly ? [] : walk(root);
  }
}

function isBinary(buffer) {
  return buffer.includes(0);
}

function isBlockedPath(file) {
  const baseName = path.basename(file);
  const extension = path.extname(file);
  return blockedFileNames.has(baseName) || blockedExtensions.has(extension);
}

function main() {
  const findings = [];
  const files = getFilesToScan();

  for (const file of files) {
    const fullPath = path.join(root, file);
    if (!fs.existsSync(fullPath)) continue;

    if (isBlockedPath(file)) {
      findings.push(`${file}: blocked credential/config file must not be committed`);
      continue;
    }

    const buffer = fs.readFileSync(fullPath);
    if (isBinary(buffer)) continue;

    const text = buffer.toString('utf8');
    for (const { name, pattern } of secretPatterns) {
      if (pattern.test(text)) {
        findings.push(`${file}: possible ${name}`);
      }
    }
  }

  if (findings.length > 0) {
    console.error('\nSecret scan failed. Remove these values before committing:\n');
    findings.forEach((finding) => console.error(`- ${finding}`));
    console.error('\nUse .env files locally and GitHub repository secrets in Actions.\n');
    process.exit(1);
  }

  console.log(`Secret scan passed (${files.length} ${stagedOnly ? 'staged ' : ''}files checked).`);
}

main();
