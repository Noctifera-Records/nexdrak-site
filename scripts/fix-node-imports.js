const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', '.open-next', 'assets');

const nodeModules = [
  'async_hooks', 'buffer', 'crypto', 'events', 'fs', 'http', 'https', 
  'os', 'path', 'stream', 'util', 'vm', 'url', 'zlib', 'string_decoder', 
  'tls', 'net'
];

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let changed = false;

      // Replace require("fs") with require("node:fs")
      for (const mod of nodeModules) {
        const regex = new RegExp(`require\\(["']${mod}["']\\)`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `require("node:${mod}")`);
          changed = true;
        }
        // Also handle ESM imports just in case
        const importRegex = new RegExp(`from ["']${mod}["']`, 'g');
        if (importRegex.test(content)) {
          content = content.replace(importRegex, `from "node:${mod}"`);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(filePath, content);
        console.log(`  Fixed node imports in: ${path.relative(targetDir, filePath)}`);
      }
    }
  }
}

console.log('--- Fixing Node.js imports for Cloudflare Compatibility ---');
if (fs.existsSync(targetDir)) {
  walk(targetDir);
  console.log('Done.');
} else {
  console.error(`Error: Target directory ${targetDir} not found.`);
}
