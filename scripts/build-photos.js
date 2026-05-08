// Scans /public/photos and writes manifest.json there.
// The webapp fetches this at runtime to render the gallery.
// Re-run any time you add/remove photos: `npm run photos`
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'public', 'photos');
const OUT = path.join(DIR, 'manifest.json');
const EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const SKIP = new Set(['logo.png', 'manifest.json']);

if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

function titleFromFilename(filename) {
  const base = path.parse(filename).name;
  const cleaned = base
    .replace(/^[0-9]+[-_ ]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  if (!cleaned) return base;
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

const files = fs
  .readdirSync(DIR)
  .filter((f) => !f.startsWith('.'))
  .filter((f) => !SKIP.has(f))
  .filter((f) => EXTS.has(path.extname(f).toLowerCase()))
  .sort();

function readJpegDim(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      i += 2;
      if (marker === 0xd8 || marker === 0xd9) continue;
      const segLen = buf.readUInt16BE(i);
      const isSOF =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc;
      if (isSOF) {
        const h = buf.readUInt16BE(i + 3);
        const w = buf.readUInt16BE(i + 5);
        return { w, h };
      }
      i += segLen;
    }
  } catch (e) {
    /* ignore */
  }
  return null;
}

const items = files.map((f) => {
  const dim = readJpegDim(path.join(DIR, f));
  return {
    src: `/photos/${f}`,
    name: titleFromFilename(f),
    w: dim?.w ?? null,
    h: dim?.h ?? null,
    ratio: dim ? +(dim.w / dim.h).toFixed(3) : null,
  };
});

// Hero preference: explicit hero.* file → widest landscape → middle file.
let heroFile = files.find((f) => /^hero\./i.test(f));
if (!heroFile) {
  const landscapes = items.filter((it) => it.ratio && it.ratio > 1.4);
  landscapes.sort((a, b) => b.ratio - a.ratio);
  if (landscapes.length) heroFile = path.basename(landscapes[0].src);
}
if (!heroFile) heroFile = files[Math.floor(files.length / 2)] || files[0];

const manifest = {
  generated: new Date().toISOString(),
  count: items.length,
  hero: heroFile ? `/photos/${heroFile}` : null,
  items,
};

fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2));
console.log(`✓ Wrote ${path.relative(process.cwd(), OUT)} — ${items.length} photos, hero=${manifest.hero}`);
