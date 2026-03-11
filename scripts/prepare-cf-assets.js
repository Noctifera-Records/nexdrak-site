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
  console.error('CRITICAL: .open-next/worker.js not found! Run npm run build:cf first.');
  process.exit(1);
}

// 2.5 Copy .build directory (Contains Durable Objects and other essential logic)
const buildSrc = path.join(sourceDir, '.build');
if (fs.existsSync(buildSrc)) {
  console.log('  Copying .build directory...');
  copyDirRecursive(buildSrc, path.join(assetsDir, '.build'));
}

// 3. Copy server-functions directory (ESSENTIAL for splitting)
// These contain chunks that _worker.js imports dynamically.
const functionsSrc = path.join(sourceDir, 'server-functions');
if (fs.existsSync(functionsSrc)) {
  console.log('  Copying server-functions directory for dynamic chunks...');
  copyDirRecursive(functionsSrc, path.join(assetsDir, 'server-functions'));
}

// 4. Copy middleware directory if present
const middlewareSrc = path.join(sourceDir, 'middleware');
if (fs.existsSync(middlewareSrc)) {
  console.log('  Copying middleware directory...');
  copyDirRecursive(middlewareSrc, path.join(assetsDir, 'middleware'));
}

// 5. Copy cloudflare directory (contains images.js, next-env.mjs, etc.)
const cloudflareSrc = path.join(sourceDir, 'cloudflare');
if (fs.existsSync(cloudflareSrc)) {
  console.log('  Copying cloudflare helpers directory...');
  copyDirRecursive(cloudflareSrc, path.join(assetsDir, 'cloudflare'));
}

// 6. Generate _routes.json (Optimized to exclude chunks from static routing)
const routesConfig = {
  version: 1,
  include: ['/*'],
  exclude: [
    '/_next/static/*',
    '/server-functions/*', // Chunks are not assets
    '/middleware/*',       // Middleware is not an asset
    '/cloudflare/*',       // Helper scripts are not assets
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
