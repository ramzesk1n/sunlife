const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '../public/images');
const files = fs.readdirSync(imagesDir);

const imageFiles = files.filter(f => 
  /\.(jpg|jpeg|png)$/i.test(f) && !f.endsWith('.webp')
);

async function convert() {
  for (const file of imageFiles) {
    const inputPath = path.join(imagesDir, file);
    const outputPath = path.join(imagesDir, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
    
    // Skip if webp already exists and is newer
    if (fs.existsSync(outputPath)) {
      const inputStat = fs.statSync(inputPath);
      const outputStat = fs.statSync(outputPath);
      if (outputStat.mtime > inputStat.mtime) {
        console.log(`Skipping ${file} (up-to-date)`);
        continue;
      }
    }
    
    try {
      await sharp(inputPath)
        .webp({ quality: 85, effort: 4 })
        .toFile(outputPath);
      console.log(`Converted: ${file} → ${path.basename(outputPath)}`);
    } catch (err) {
      console.error(`Failed to convert ${file}:`, err.message);
    }
  }
}

convert().catch(console.error);
