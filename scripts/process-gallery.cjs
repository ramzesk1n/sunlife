const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcDir = 'C:/Users/user/Downloads/gallery';
const outDir = 'public/images/gallery';
const categories = {
  'мамочки': 'mamochki',
  'папочки': 'papochki',
  'семейные фото': 'semeynye',
  'фото малышей': 'malyshi'
};

const altTemplates = {
  'мамочки': 'Фотосессия выписки из роддома в Уфе — мама с малышом, трогательные моменты',
  'папочки': 'Фотосессия выписки из роддома в Уфе — папа с новорождённым, счастливые моменты',
  'семейные фото': 'Семейная фотосессия в роддоме Уфа — выписка малыша, радость родных',
  'фото малышей': 'Фотосессия новорождённого малыша в Уфе — первые дни жизни, профессиональная съёмка'
};

async function processGallery() {
  let allImages = [];
  let catList = [];

  for (const [ruName, enName] of Object.entries(categories)) {
    const srcPath = path.join(srcDir, ruName);
    const outPath = path.join(outDir, enName);
    fs.mkdirSync(outPath, { recursive: true });

    const files = fs.readdirSync(srcPath).filter(f => f.toLowerCase().endsWith('.jpg'));
    catList.push({ id: enName, label: ruName, count: files.length });

    let n = 1;
    for (const file of files.sort()) {
      const input = path.join(srcPath, file);
      const baseName = enName + '-fotosessiya-sunlife-ufa-' + String(n).padStart(3, '0');

      const fullName = baseName + '.webp';
      const fullOut = path.join(outPath, fullName);
      const thumbName = 'thumb-' + baseName + '.webp';
      const thumbOut = path.join(outPath, thumbName);

      await sharp(input).webp({ quality: 80 }).toFile(fullOut);
      await sharp(input).resize(400, null, { withoutEnlargement: true }).webp({ quality: 75 }).toFile(thumbOut);

      const meta = await sharp(input).metadata();
      allImages.push({
        src: '/images/gallery/' + enName + '/' + fullName,
        thumb: '/images/gallery/' + enName + '/' + thumbName,
        alt: altTemplates[ruName] + ' #' + n,
        category: enName,
        width: meta.width || 1200,
        height: meta.height || 800
      });

      if (n % 10 === 0) console.log('  ' + ruName + ': ' + n + '/' + files.length);
      n++;
    }
    console.log('✓ ' + ruName + ': ' + files.length + ' фото');
  }

  const galleryJson = { categories: catList, images: allImages };
  fs.writeFileSync('src/content/gallery.json', JSON.stringify(galleryJson, null, 2));
  fs.writeFileSync('public/content/gallery.json', JSON.stringify(galleryJson, null, 2));
  console.log('\n✓ gallery.json: ' + allImages.length + ' фото');
  console.log('✓ Категории: ' + catList.map(c => c.label + '(' + c.count + ')').join(', '));
}

processGallery().catch(err => {
  console.error('✗ Ошибка:', err.message);
  process.exit(1);
});
