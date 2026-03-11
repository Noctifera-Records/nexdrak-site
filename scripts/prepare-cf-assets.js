const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const sourceDir = path.join(projectRoot, '.open-next');
const assetsDir = path.join(sourceDir, 'assets');

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

// 2. Copy worker.js as _worker.js (Single entry point, no splitting)
// This file includes all server logic bundled but with Node.js built-ins externalized.
const workerSrc = path.join(sourceDir, 'worker.js');
if (fs.existsSync(workerSrc)) {
  copyFile(workerSrc, path.join(assetsDir, '_worker.js'));
} else {
  // If not in root, try inside cloudflare/ (depends on OpenNext version)
  const workerCfSrc = path.join(sourceDir, 'cloudflare', '_worker.js');
  if (fs.existsSync(workerCfSrc)) {
    copyFile(workerCfSrc, path.join(assetsDir, '_worker.js'));
  } else {
    console.error('CRITICAL: .open-next/worker.js not found! Run npm run build:cf first.');
    process.exit(1);
  }
}

// 3. Write _routes.json (Standard Next.js asset exclusion)
const routesConfig = {
  version: 1,
  include: ['/*'],
  exclude: [
    '/_next/static/*',
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
