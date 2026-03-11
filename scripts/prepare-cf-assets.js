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
}

console.log('--- Preparing Cloudflare Pages Assets ---');

// 1. Copy _headers
const headersPath = path.join(projectRoot, '_headers');
if (fs.existsSync(headersPath)) copyFile(headersPath, path.join(assetsDir, '_headers'));

// 2. Identify and copy the main worker
// Some OpenNext versions put it in root, others in cloudflare/
let workerSrc = path.join(sourceDir, 'worker.js');
if (!fs.existsSync(workerSrc)) workerSrc = path.join(sourceDir, 'cloudflare', '_worker.js');

if (fs.existsSync(workerSrc)) {
  let content = fs.readFileSync(workerSrc, 'utf8');
  
  // CRITICAL FIX: Add node: prefix to builtin modules in the final bundle
  // This satisfies Wrangler's resolver without needing complex bundling.
  const builtins = ['fs', 'path', 'crypto', 'stream', 'buffer', 'util', 'http', 'https', 'os', 'url', 'vm', 'async_hooks', 'zlib'];
  for (const mod of builtins) {
    const regex = new RegExp(`require\\(["']${mod}["']\\)`, 'g');
    content = content.replace(regex, `require("node:${mod}")`);
  }
  
  fs.writeFileSync(path.join(assetsDir, '_worker.js'), content);
  console.log('  Fixed and copied: _worker.js');
} else {
  console.error('CRITICAL: Worker source not found!');
  process.exit(1);
}

// 3. Generate _routes.json
const routesConfig = {
  version: 1,
  include: ['/*'],
  exclude: ['/_next/static/*', '/img/*', '/favicon.ico', '/robots.txt', '/site.webmanifest', '/*.png', '/*.jpg', '/*.svg', '/*.ico', '/*.webp', '/*.txt'],
};
fs.writeFileSync(path.join(assetsDir, '_routes.json'), JSON.stringify(routesConfig, null, 2));
console.log('  Written: .open-next/assets/_routes.json');

console.log('\nDeployment assets ready in .open-next/assets/');
