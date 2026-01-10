const fs = require('fs');
const path = require('path');

// Define source and destination directories
const sourceDir = path.join(__dirname, '.open-next');
const destDir = path.join(__dirname, '.open-next/assets');

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

// Helper function to recursively copy a directory
function copyDirectory(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`Source directory ${src} does not exist. Skipping.`);
    return;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy the main worker file
copyFile(path.join(sourceDir, 'worker.js'), path.join(destDir, '_worker.js'));

// 2. Copy the 'cloudflare' directory (contains images.js, init.js, skew-protection.js, etc.)
copyDirectory(path.join(sourceDir, 'cloudflare'), path.join(destDir, 'cloudflare'));

// 3. Copy the 'middleware' directory (contains handler.mjs)
copyDirectory(path.join(sourceDir, 'middleware'), path.join(destDir, 'middleware'));

// 4. Copy the '.build' directory (contains durable objects)
copyDirectory(path.join(sourceDir, '.build'), path.join(destDir, '.build'));

// 5. Copy the 'server-functions' directory (contains default/handler.mjs)
copyDirectory(path.join(sourceDir, 'server-functions'), path.join(destDir, 'server-functions'));

console.log('Successfully prepared assets for Cloudflare Pages deployment.');
