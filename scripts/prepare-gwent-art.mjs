import sharp from 'sharp';
import { stat } from 'node:fs/promises';

// Format conversion only: retain original dimensions, artwork and alpha.
const names = ['acid', 'peroxide', 'limewater', 'carbonate', 'catalyst', 'splint', 'copper', 'iron', 'nitrogen', 'silica', 'mentor', 'witness', 'spy', 'card-frame', 'life-orb', 'table'];
let original = 0, delivered = 0;
for (const name of names) {
  const source = `public/gwent/${name}-v2.png`;
  const target = `public/gwent/${name}-v2.webp`;
  await sharp(source).webp({ quality: 92, alphaQuality: 100, effort: 6 }).toFile(target);
  const before = await sharp(source).metadata(), after = await sharp(target).metadata();
  if (before.width !== after.width || before.height !== after.height || before.hasAlpha !== after.hasAlpha) throw new Error(`Asset geometry/alpha changed: ${name}`);
  original += (await stat(source)).size;
  delivered += (await stat(target)).size;
}
console.log(`${names.length} assets: ${(original / 1048576).toFixed(2)} MiB PNG → ${(delivered / 1048576).toFixed(2)} MiB WebP; original PNGs preserved.`);
