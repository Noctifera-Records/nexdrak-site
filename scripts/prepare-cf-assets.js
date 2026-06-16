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
  if (src.includes('node_modules') && src.includes('server-functions')) return;

  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else if (!entry.isSymbolicLink()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
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

// 2. CRITICAL OPTIMIZATION: Remove unnecessarily huge Next.js JSON files and other bloat
const findAndRemoveBloat = (dir) => {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // If we accidentally copied node_modules, kill them
      if (entry.name === 'node_modules') {
        console.log(`  DELETING ENTIRE DIRECTORY: ${fullPath}`);
        fs.rmSync(fullPath, { recursive: true, force: true });
        continue;
      }
      findAndRemoveBloat(fullPath);
    } else {
      const name = entry.name.toLowerCase();
      const isBloat = 
        name.endsWith('font-metrics.json') || 
        name.endsWith('.js.map') || 
        name.endsWith('.mjs.map') ||
        name.endsWith('.d.ts') ||
        name === 'readme.md' ||
        name === 'license';
        
      if (isBloat) {
        console.log(`  DELETING BLOAT FILE: ${fullPath}`);
        fs.unlinkSync(fullPath);
      }
      
      // Also delete any file > 1MB that isn't a known required file
      else if (fs.statSync(fullPath).size > 1024 * 1024 && !name.includes('handler') && !name.includes('_worker')) {
        console.log(`  DELETING LARGE UNKNOWN FILE (${Math.round(fs.statSync(fullPath).size / 1024 / 1024)}MB): ${fullPath}`);
        fs.unlinkSync(fullPath);
      }
    }
  }
};

findAndRemoveBloat(assetsDir);

// 3. CRITICAL FIX: Neuter node:sqlite and node:worker_threads which don't exist in CF
// This prevents Wrangler's esbuild from failing during resolution
const neuterUnsupportedNodeModules = (dir) => {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      neuterUnsupportedNodeModules(fullPath);
    } else if (entry.name.endsWith('.js') || entry.name.endsWith('.mjs')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('node:sqlite') || content.includes('node:worker_threads')) {
        console.log(`  NEUTERING UNSUPPORTED MODULES IN: ${fullPath}`);
        // Replace require calls with empty objects
        content = content.replace(/require\(['"]node:sqlite['"]\)/g, '{}');
        content = content.replace(/require\(['"]node:worker_threads['"]\)/g, '{}');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
};

console.log('  Patching generated files for Cloudflare compatibility...');
neuterUnsupportedNodeModules(path.join(assetsDir, 'server-functions'));
neuterUnsupportedNodeModules(path.join(assetsDir, 'middleware'));

// 4. Main worker - Solo copiar
let workerSrc = path.join(sourceDir, 'worker.js');
if (!fs.existsSync(workerSrc)) workerSrc = path.join(sourceDir, 'cloudflare', '_worker.js');

if (fs.existsSync(workerSrc)) {
  fs.copyFileSync(workerSrc, path.join(assetsDir, '_worker.js'));
  console.log('  Copied _worker.js');
}

// 5. Generate _routes.json
const routesConfig = {
  version: 1,
  include: ['/*'],
  exclude: [
    '/_next/static/*', '/img/*', '/favicon.ico', '/robots.txt', '/site.webmanifest', '/*.png', '/*.jpg', '/*.svg', '/*.ico', '/*.webp', '/*.txt'
  ],
};
fs.writeFileSync(path.join(assetsDir, '_routes.json'), JSON.stringify(routesConfig, null, 2));

console.log('\nReady to deploy!');
