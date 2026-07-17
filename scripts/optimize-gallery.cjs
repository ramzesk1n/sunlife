const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const galleryDir = path.join(__dirname, '../public/images/gallery');

async function optimizeGallery() {
  const files = [];

  function collect(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        collect(fullPath);
      } else if (entry.isFile() && /\.webp$/i.test(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  collect(galleryDir);

  let totalBefore = 0;
  let totalAfter = 0;
  let skipped = 0;

  for (const file of files) {
    const stat = fs.statSync(file);
    totalBefore += stat.size;

    const inputBuffer = fs.readFileSync(file);
    const meta = await sharp(inputBuffer).metadata();
    const shouldResize = (meta.width && meta.width > 1600) || (meta.height && meta.height > 1600);

    let pipeline = sharp(inputBuffer);
    if (shouldResize) {
      pipeline = pipeline.resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true });
    }

    const outputBuffer = await pipeline.webp({ quality: 75, effort: 5 }).toBuffer();

    if (outputBuffer.length < stat.size) {
      fs.writeFileSync(file, outputBuffer);
      totalAfter += outputBuffer.length;
    } else {
      totalAfter += stat.size;
      skipped++;
    }

    console.log(`Optimized: ${path.relative(galleryDir, file)} (${(stat.size / 1024).toFixed(1)} KB → ${(Math.min(outputBuffer.length, stat.size) / 1024).toFixed(1)} KB)`);
  }

  console.log(`\nDone: ${files.length} files, ${skipped} not reduced`);
  console.log(`Total: ${(totalBefore / 1024 / 1024).toFixed(2)} MB → ${(totalAfter / 1024 / 1024).toFixed(2)} MB`);
}

optimizeGallery().catch((err) => {
  console.error(err);
  process.exit(1);
});
