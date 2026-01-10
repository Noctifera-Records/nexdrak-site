const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

async function optimizeImages() {
  const files = fs.readdirSync(publicDir);
  
  for (const file of files) {
    const filePath = path.join(publicDir, file);
    const ext = path.extname(file).toLowerCase();
    
    if (imageExtensions.includes(ext)) {
      console.log(`Optimizing ${file}...`);
      
      try {
        const image = sharp(filePath);
        const metadata = await image.metadata();
        
        // Create WebP version
        await image
          .webp({ quality: 85, effort: 6 })
          .toFile(filePath.replace(ext, '.webp'));
        
        // Create AVIF version
        await image
          .avif({ quality: 80, effort: 6 })
          .toFile(filePath.replace(ext, '.avif'));
        
        // Optimize original
        if (ext === '.jpg' || ext === '.jpeg') {
          await image
            .jpeg({ quality: 85, progressive: true, mozjpeg: true })
            .toFile(filePath.replace(ext, '_optimized' + ext));
        } else if (ext === '.png') {
          await image
            .png({ quality: 85, compressionLevel: 9, progressive: true })
            .toFile(filePath.replace(ext, '_optimized' + ext));
        }
        
        console.log(`✓ Optimized ${file}`);
      } catch (error) {
        console.error(`✗ Error optimizing ${file}:`, error.message);
      }
    }
  }
}

optimizeImages().then(() => {
  console.log('Image optimization complete!');
}).catch(console.error);