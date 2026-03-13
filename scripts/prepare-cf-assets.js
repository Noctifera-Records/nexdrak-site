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
  
  // Skip node_modules inside server-functions as they are huge and cause EPERM on Windows
  // OpenNext already bundles what's needed into the worker
  if (src.includes('node_modules') && src.includes('server-functions')) {
    // console.log(`  Skipping heavy node_modules: ${src}`);
    return;
  }

  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    try {
      if (entry.isDirectory()) {
        copyDirRecursive(srcPath, destPath);
      } else if (entry.isSymbolicLink()) {
        // Skip symlinks on Windows to avoid EPERM
        continue;
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    } catch (err) {
      // Log error but don't stop the build for non-critical files
      if (err.code === 'EPERM' || err.code === 'EBUSY') {
        console.warn(`  Warning: Could not copy ${entry.name} (locked or no permission). Skipping...`);
      } else {
        console.error(`  Error copying ${srcPath} to ${destPath}:`, err.message);
      }
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
// IMPORTANT: We only copy what's strictly necessary.
// Many of these are redundant because OpenNext bundles them into the worker.
['.build'].forEach(dir => {
  const src = path.join(sourceDir, dir);
  if (fs.existsSync(src)) {
    console.log(`  Copying ${dir}...`);
    copyDirRecursive(src, path.join(assetsDir, dir));
  }
});

// 2. AGGRESSIVE CLEANUP: Remove huge redundant directories from assets
// These are often duplicated in the bundle or not needed at the edge.
const redundantDirs = [
  path.join(assetsDir, 'server-functions'),
  path.join(assetsDir, 'middleware'),
  path.join(assetsDir, 'cloudflare'),
];

redundantDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`  DELETING REDUNDANT DIRECTORY: ${dir}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// 3. Remove huge Next.js font metrics files that bloat the bundle
const bloatFiles = [
  path.join(sourceDir, 'server-functions/default/node_modules/next/dist/server/capsize-font-metrics.json'),
  path.join(sourceDir, 'server-functions/default/node_modules/next/dist/server/dev/font-metrics.json')
];

bloatFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  DELETING BLOAT FILE to save space: ${file}`);
    fs.unlinkSync(file);
  }
});

// 3. Main worker with GLOBAL POLYFILL INJECTION
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
