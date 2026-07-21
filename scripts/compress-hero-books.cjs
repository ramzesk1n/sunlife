// One-off: responsive hero images + recompress fotokniga/slider (buffer-safe pipeline)
const sharp = require('sharp');
const fs = require('fs');

const run = async () => {
  // Hero: 700w + 1400w variants
  const hero = fs.readFileSync('public/images/hero-image-main.webp');
  await sharp(hero).resize(700).webp({ quality: 78 }).toBuffer()
    .then((b) => fs.writeFileSync('public/images/hero-image-main-700.webp', b));
  await sharp(hero).resize(1400).webp({ quality: 78 }).toBuffer()
    .then((b) => fs.writeFileSync('public/images/hero-image-main-1400.webp', b));

  // Fotokniga 1-5: recompress q70 in place (via buffer to avoid Windows file locks)
  for (let i = 1; i <= 5; i++) {
    const p = `public/images/fotokniga_${i}.webp`;
    const buf = fs.readFileSync(p);
    const out = await sharp(buf).webp({ quality: 70 }).toBuffer();
    fs.writeFileSync(p, out);
  }

  // Slider first image (LCP candidate on gallery): q70
  const sp = 'public/images/slider/fotos-emotsii-vypiska-iz-roddoma-01.webp';
  const sbuf = fs.readFileSync(sp);
  const sout = await sharp(sbuf).webp({ quality: 70 }).toBuffer();
  fs.writeFileSync(sp, sout);

  console.log('done');
  for (const f of ['public/images/hero-image-main-700.webp', 'public/images/hero-image-main-1400.webp',
    'public/images/fotokniga_1.webp', 'public/images/fotokniga_3.webp', sp]) {
    console.log(f, Math.round(fs.statSync(f).size / 1024) + 'KB');
  }
};
run().catch((e) => { console.error(e); process.exit(1); });
