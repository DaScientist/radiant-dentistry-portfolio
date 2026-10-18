import sharp from 'sharp';
import fs from 'fs';

const srcPath = 'public/images/radiant_logo_original.png';

async function floodFillMask() {
  const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const isBg = new Uint8Array(width * height);

  function isCandidateBg(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return false;
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);

    // Protect the silver ribbon arch at the top
    // The silver curve starts from x: 380, y: 250 and swoops up to x: 650, y: 135 then down to x: 780, y: 350
    // If inside the silver ribbon path, do not mark as background:
    // Notice the silver ribbon has a distinct shape. Distance from the curve:
    if (x >= 400 && x <= 770 && y >= 130 && y <= 220) {
      // The curve apex is around y: 135 to 200
      // Check if it's within the band of the ribbon (width ~50px)
      // The ribbon has dark borders underneath and to the side
      // The upper border is around y: 135 at x: 640
      // If y is between 130 and 190 and x is between 580 and 720, it's the silver cusp!
      if (x >= 540 && x <= 740 && y >= 130 && y <= 210) {
        return false;
      }
      // Inner swoop towards the left cusp (x: 400 to 550, y: 170 to 260)
      if (x >= 390 && x <= 560 && y >= 165 && y <= 265) {
        return false;
      }
    }

    // Protect the Star and its rays
    if (x >= 700 && x <= 890 && y >= 40 && y <= 250) {
      // Any ray or star flare
      if (chroma > 8 || brightness < 210) return false;
    }

    // Gold ribbon (chroma > 14) -> FOREGROUND
    if (chroma > 14) return false;

    // Dark metallic shadows / bevels -> FOREGROUND
    if (brightness < 165) return false;

    // Everything else is background
    return true;
  }

  const queue = new Int32Array(width * height * 2);
  let head = 0;
  let tail = 0;

  function push(x, y) {
    const p = y * width + x;
    if (isBg[p] === 0 && isCandidateBg(x, y)) {
      isBg[p] = 1;
      queue[tail++] = x;
      queue[tail++] = y;
    }
  }

  // Seed from outer borders
  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  // Seed from inner tooth cavity
  push(512, 350);
  push(512, 310);
  push(500, 400);

  // Seed from bottom arch between roots
  push(512, 750);
  push(512, 650);

  // Run BFS
  while (head < tail) {
    const cx = queue[head++];
    const cy = queue[head++];

    push(cx + 1, cy);
    push(cx - 1, cy);
    push(cx, cy + 1);
    push(cx, cy - 1);
  }

  const outBuffer = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const outIdx = (y * width + x) * 4;
      const p = y * width + x;

      outBuffer[outIdx] = data[idx];
      outBuffer[outIdx + 1] = data[idx + 1];
      outBuffer[outIdx + 2] = data[idx + 2];

      if (isBg[p] === 1) {
        outBuffer[outIdx + 3] = 0;
      } else {
        outBuffer[outIdx + 3] = 255;
      }
    }
  }

  await sharp(outBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile('public/images/radiant_logo_transparent.png');

  fs.copyFileSync('public/images/radiant_logo_transparent.png', 'public/images/radiant_tooth_mark.png');

  // Favicon PNG (128x128)
  await sharp('public/images/radiant_logo_transparent.png')
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('public/favicon.png');

  const pngBase64 = fs.readFileSync('public/favicon.png').toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <image width="128" height="128" href="data:image/png;base64,${pngBase64}" />
</svg>`;
  fs.writeFileSync('public/favicon.svg', svgContent);
  console.log('Successfully generated complete logo with full silver cusp and golden star!');
}

floodFillMask().catch(console.error);
