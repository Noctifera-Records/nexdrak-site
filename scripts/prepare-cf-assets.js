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

function copyFile(src, dest) {
  const dir = path.dirname(dest);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(src, dest);
}

console.log('--- Final Cloudflare Pages Preparation ---');

// 1. Technical directories
['.build', 'server-functions', 'middleware', 'cloudflare'].forEach(dir => {
  const src = path.join(sourceDir, dir);
  if (fs.existsSync(src)) {
    console.log(`  Copying ${dir}...`);
    copyDirRecursive(src, path.join(assetsDir, dir));
  }
});

// 2. Main worker with GLOBAL POLYFILL INJECTION
let workerSrc = path.join(sourceDir, 'worker.js');
if (!fs.existsSync(workerSrc)) workerSrc = path.join(sourceDir, 'cloudflare', '_worker.js');

if (fs.existsSync(workerSrc)) {
  let content = fs.readFileSync(workerSrc, 'utf8');
  
  // POLYFILL: Define globals so legacy 'require' works without node: prefix
  const polyfill = `
globalThis.process = globalThis.process || { env: {} };
try {
  const nodeModules = ['fs', 'path', 'crypto', 'stream', 'buffer', 'util', 'http', 'https', 'os', 'url', 'vm', 'async_hooks', 'zlib', 'events'];
  for (const mod of nodeModules) {
    try {
      // @ts-ignore
      const m = require('node:' + mod);
      // @ts-ignore
      require.cache[mod] = { exports: m };
    } catch(e) {}
  }
} catch(e) {}
`;
  
  fs.writeFileSync(path.join(assetsDir, '_worker.js'), polyfill + content);
  console.log('  Injected Node.js polyfill into _worker.js');
} else {
  console.error('CRITICAL: Worker source not found!');
  process.exit(1);
}

// 3. Generate _routes.json
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

console.log('\nReady to deploy!');
