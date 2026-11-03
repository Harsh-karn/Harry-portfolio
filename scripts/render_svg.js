import sharp from 'sharp';
import fs from 'fs';

const svgFile = process.argv[2];
const outFile = process.argv[3];

if (!svgFile || !outFile) {
  console.error("Usage: node scripts/render_svg.js <input.svg> <output.webp/png>");
  process.exit(1);
}

const svgBuffer = fs.readFileSync(svgFile);

if (outFile.endsWith('.webp')) {
  sharp(svgBuffer)
    .webp({ lossless: true, quality: 100 })
    .toFile(outFile)
    .then(info => console.log('Successfully written WebP:', info))
    .catch(err => {
      console.error('Sharp error:', err);
      process.exit(1);
    });
} else {
  sharp(svgBuffer)
    .png()
    .toFile(outFile)
    .then(info => console.log('Successfully written PNG:', info))
    .catch(err => {
      console.error('Sharp error:', err);
      process.exit(1);
    });
}
