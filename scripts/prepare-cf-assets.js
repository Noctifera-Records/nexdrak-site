const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const sourceDir = path.join(projectRoot, '.open-next');
const assetsDir = path.join(sourceDir, 'assets');

/**
 * Helper: Recursively copy a directory from src to dest.
 */
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Helper: Copy a single file.
 */
function copyFile(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dest);
}

/**
 * Helper: Inject node: prefix into builtin modules in JS files.
 */
function fixBuiltinRequires(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const builtins = ['fs', 'path', 'crypto', 'stream', 'buffer', 'util', 'http', 'https', 'os', 'url', 'vm', 'async_hooks', 'zlib', 'events'];
  let changed = false;
  for (const mod of builtins) {
    const regex = new RegExp(`require\\(["']${mod}["']\\)`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `require("node:${mod}")`);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(filePath, content);
}

function walkAndFix(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walkAndFix(filePath);
    } else if (filePath.endsWith('.js') || filePath.endsWith('.mjs')) {
      fixBuiltinRequires(filePath);
    }
  }
}

console.log('--- Preparing Cloudflare Pages Assets ---');

// 1. Copy technical directories
['.build', 'server-functions', 'middleware', 'cloudflare'].forEach(dir => {
  const src = path.join(sourceDir, dir);
  if (fs.existsSync(src)) {
    console.log(`  Copying ${dir}...`);
    copyDirRecursive(src, path.join(assetsDir, dir));
  }
});

// 2. Identify and copy _worker.js
let workerSrc = path.join(sourceDir, 'worker.js');
if (!fs.existsSync(workerSrc)) workerSrc = path.join(sourceDir, 'cloudflare', '_worker.js');

if (fs.existsSync(workerSrc)) {
  copyFile(workerSrc, path.join(assetsDir, '_worker.js'));
  console.log('  Copied: _worker.js');
} else {
  console.error('CRITICAL: Worker source not found!');
  process.exit(1);
}

// 3. Fix Node.js builtin imports in ALL JS files in assets
console.log('  Fixing node: imports in assets...');
walkAndFix(assetsDir);

// 4. Generate _routes.json
const routesConfig = {
  version: 1,
  include: ['/*'],
  exclude: [
    '/_next/static/*', '/.build/*', '/server-functions/*', '/middleware/*', '/cloudflare/*',
    '/img/*', '/favicon.ico', '/robots.txt', '/site.webmanifest', '/*.png', '/*.jpg', '/*.svg', '/*.ico', '/*.webp', '/*.txt'
  ],
};
fs.writeFileSync(path.join(assetsDir, '_routes.json'), JSON.stringify(routesConfig, null, 2));
console.log('  Written: .open-next/assets/_routes.json');

console.log('\nDeployment assets ready in .open-next/assets/');
