const fs = require('fs');
const path = require('path');

// Define source and destination directories
// We are in 'scripts', so we go up one level to root
const projectRoot = path.join(__dirname, '..');
const sourceDir = path.join(projectRoot, '.open-next');
const destDir = path.join(projectRoot, '.open-next/assets');

// Helper function to copy a file if it exists
function copyFile(src, dest) {
  try {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} to ${dest}`);
  } catch (err) {
    console.error(`Error copying ${src} to ${dest}:`, err);
  }
}

// Helper function to recursively copy a directory using fs.cpSync (Node.js 16.7+)
function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Source directory ${src} does not exist. Skipping.`);
    return;
  }
  
  try {
    // dereference: true ensures symlinks are followed and content is copied,
    // avoiding EISDIR errors with symlinked directories and ensuring self-contained build.
    fs.cpSync(src, dest, { 
      recursive: true, 
      dereference: true,
      // Filter out node_modules, .next directories, and any potential source maps
      filter: (source) => !source.includes('node_modules') && !source.includes('.next') && !source.endsWith('.map'),
    });
    console.log(`Copied directory ${src} to ${dest} (excluding node_modules, .next & maps)`);
  } catch (err) {
    console.error(`Error copying directory ${src} to ${dest}:`, err);
    // Don't crash immediately, allow other parts to attempt copy, but log error
  }
}

// 1. Copy the main worker file
const workerPath = path.join(sourceDir, 'worker.js');
if (fs.existsSync(workerPath)) {
  copyFile(workerPath, path.join(destDir, '_worker.js'));
} else {
  // Try alternative path for some OpenNext versions
  const altWorkerPath = path.join(sourceDir, 'cloudflare/index.mjs');
  if (fs.existsSync(altWorkerPath)) {
    copyFile(altWorkerPath, path.join(destDir, '_worker.js'));
  } else {
    console.error('CRITICAL: worker.js or cloudflare/index.mjs not found in .open-next');
  }
}

// 2. Copy the 'cloudflare' directory (contains images.js, init.js, skew-protection.js, etc.)
copyDirectory(path.join(sourceDir, 'cloudflare'), path.join(destDir, 'cloudflare'));

// 3. Copy the 'middleware' directory (contains handler.mjs)
copyDirectory(path.join(sourceDir, 'middleware'), path.join(destDir, 'middleware'));

// 4. Copy the '.build' directory (contains durable objects)
copyDirectory(path.join(sourceDir, '.build'), path.join(destDir, '.build'));

// 5. Copy the 'server-functions' directory (contains default/handler.mjs)
copyDirectory(path.join(sourceDir, 'server-functions'), path.join(destDir, 'server-functions'));

// 6. Copy assets from .open-next/assets to ensure everything is in the final destDir
// OpenNext usually puts static assets here
const assetsDir = path.join(sourceDir, 'assets');
if (fs.existsSync(assetsDir) && assetsDir !== destDir) {
  copyDirectory(assetsDir, destDir);
}

// 7. Create _routes.json
const routesConfig = {
  version: 1,
  include: ["/*"],
  exclude: [
    "/_next/static/*",
    "/img/*",
    "/favicon.ico",
    "/robots.txt",
    "/site.webmanifest",
    "/*.png",
    "/*.jpg",
    "/*.svg",
    "/*.css",
    "/*.js",
    "/*.txt",
    "/cloudflare/*",
    "/middleware/*",
    "/server-functions/*",
    "/_worker.js"
  ]
};
fs.writeFileSync(path.join(destDir, '_routes.json'), JSON.stringify(routesConfig, null, 2));

console.log('Successfully prepared assets for Cloudflare Pages deployment.');
