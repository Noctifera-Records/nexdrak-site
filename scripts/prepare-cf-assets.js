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
 * Helper: Copy a single file, creating parent dirs as needed.
 */
function copyFile(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`  Copied: ${path.relative(projectRoot, dest)}`);
}

console.log('--- Preparing Cloudflare Pages Assets ---');

// Clean start for assets (optional but recommended)
// if (fs.existsSync(assetsDir)) fs.rmSync(assetsDir, { recursive: true, force: true });

// 1. Copy _headers from root if present
const headersPath = path.join(projectRoot, '_headers');
if (fs.existsSync(headersPath)) {
  copyFile(headersPath, path.join(assetsDir, '_headers'));
}

// 2. Copy main worker.js as _worker.js (Pages entry point)
const workerSrc = path.join(sourceDir, 'worker.js');
if (fs.existsSync(workerSrc)) {
  copyFile(workerSrc, path.join(assetsDir, '_worker.js'));
} else {
  // If not in root, try inside cloudflare/ (some OpenNext versions)
  const workerCfSrc = path.join(sourceDir, 'cloudflare', '_worker.js');
  if (fs.existsSync(workerCfSrc)) {
    copyFile(workerCfSrc, path.join(assetsDir, '_worker.js'));
  } else {
    console.error('CRITICAL: .open-next/worker.js not found! Run npm run build:cf first.');
    process.exit(1);
  }
}

// 3. Copy ALL essential directories to assets root
// When splitting is enabled, _worker.js uses relative imports. 
// These folders MUST be in the same directory as _worker.js.
const essentialDirs = ['.build', 'server-functions', 'middleware', 'cloudflare'];

for (const dirName of essentialDirs) {
  const src = path.join(sourceDir, dirName);
  if (fs.existsSync(src)) {
    console.log(`  Copying ${dirName} directory...`);
    copyDirRecursive(src, path.join(assetsDir, dirName));
  }
}

// 4. Generate _routes.json
const routesConfig = {
  version: 1,
  include: ['/*'],
  exclude: [
    '/_next/static/*',
    '/.build/*',
    '/server-functions/*',
    '/middleware/*',
    '/cloudflare/*',
    '/img/*',
    '/favicon.ico',
    '/robots.txt',
    '/site.webmanifest',
    '/*.png',
    '/*.jpg',
    '/*.svg',
    '/*.ico',
    '/*.webp',
    '/*.txt',
  ],
};
fs.writeFileSync(
  path.join(assetsDir, '_routes.json'),
  JSON.stringify(routesConfig, null, 2),
);
console.log('  Written: .open-next/assets/_routes.json');

console.log('\nDeployment assets ready in .open-next/assets/');
