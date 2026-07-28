/**
 * Generate a square 1024x1024 app icon from an image source.
 *
 * Usage: node scripts/generate-icon.js <input> <output.png>
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const input = process.argv[2];
const output = process.argv[3];
const size = 1024;

if (!input || !output) {
  console.error('Usage: node scripts/generate-icon.js <input> <output.png>');
  process.exit(1);
}

async function main() {
  const inputBuffer = fs.readFileSync(input);
  const metadata = await sharp(inputBuffer).metadata();

  const width = metadata.width;
  const height = metadata.height;
  const cropSize = Math.min(width, height);
  const left = Math.round((width - cropSize) / 2);
  const top = Math.round((height - cropSize) / 2);

  fs.mkdirSync(path.dirname(output), { recursive: true });

  await sharp(inputBuffer)
    .extract({ left, top, width: cropSize, height: cropSize })
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(output);

  console.log(`Generated ${output} (${size}x${size})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
