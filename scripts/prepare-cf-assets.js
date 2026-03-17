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
        continue;
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    } catch (err) {
      if (err.code === 'EPERM' || err.code === 'EBUSY') {
        console.warn(`  Warning: Could not copy ${entry.name} (locked). Skipping...`);
      } else {
        console.error(`  Error copying ${srcPath} to ${destPath}:`, err.message);
      }
    }
  }
}

console.log('--- Final Cloudflare Pages Preparation ---');

// 1. Technical directories - RESTORED for worker functionality
['.build', 'server-functions', 'middleware', 'cloudflare'].forEach(dir => {
  const src = path.join(sourceDir, dir);
  if (fs.existsSync(src)) {
    console.log(`  Copying ${dir}...`);
    copyDirRecursive(src, path.join(assetsDir, dir));
  }
});

// 2. CRITICAL OPTIMIZATION: Remove unnecessarily huge Next.js JSON files
// These font metrics files are ~4MB each and not needed at runtime
const findAndRemoveBloat = (dir) => {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findAndRemoveBloat(fullPath);
    } else if (entry.name.endsWith('font-metrics.json')) {
      console.log(`  DELETING BLOAT FILE: ${fullPath}`);
      fs.unlinkSync(fullPath);
    }
  }
};

findAndRemoveBloat(assetsDir);

// 3. Main worker with GLOBAL POLYFILL INJECTION
let workerSrc = path.join(sourceDir, 'worker.js');
if (!fs.existsSync(workerSrc)) workerSrc = path.join(sourceDir, 'cloudflare', '_worker.js');

if (fs.existsSync(workerSrc)) {
  let content = fs.readFileSync(workerSrc, 'utf8');
  
  // POLYFILL: Define globals so legacy 'require' works
  const polyfill = `
globalThis.process = globalThis.process || { env: {} };
try {
  const nodeModules = ['fs', 'path', 'crypto', 'stream', 'buffer', 'util', 'http', 'https', 'os', 'url', 'vm', 'async_hooks', 'zlib', 'events'];
  for (const mod of nodeModules) {
    try {
      const m = require('node:' + mod);
      require.cache[mod] = { exports: m };
    } catch(e) {}
  }
} catch(e) {}
`;
  
  fs.writeFileSync(path.join(assetsDir, '_worker.js'), polyfill + content);
  console.log('  Injected Node.js polyfill into _worker.js');
}

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

console.log('\nReady to deploy!');
