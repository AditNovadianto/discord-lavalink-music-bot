const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;

    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith('.js')) files.push(fullPath);
  }
}

walk(root);

let failed = false;

for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], {
    stdio: 'inherit',
  });

  if (result.status !== 0) failed = true;
}

if (failed) process.exit(1);

console.log(`✅ ${files.length} file JavaScript lolos pemeriksaan sintaks.`);
