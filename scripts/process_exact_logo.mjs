import sharp from 'sharp';
import fs from 'fs';

const srcPath = '/home/dascientist/.gemini/antigravity-ide/brain/a6e62388-f775-44c9-9d7b-0971324fba34/.user_uploaded/media_1792347913401.png';

async function main() {
  fs.copyFileSync(srcPath, 'public/images/radiant_logo.png');
  fs.copyFileSync(srcPath, 'public/images/radiant_logo_original.png');

  const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const transparentBuffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const outIdx = (y * width + x) * 4;
      transparentBuffer[outIdx] = r;
      transparentBuffer[outIdx + 1] = g;
      transparentBuffer[outIdx + 2] = b;

      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const chroma = maxC - minC;

      // The background is neutral gray with chroma <= 5 and brightness > 210
      // In contrast, the gold tooth has chroma > 25, the silver tooth has dark bevel edges,
      // and the star has yellow/gold hues.
      // However, the bright specular reflection on the silver tooth is white (high brightness, low chroma).
      // Let's check if a pixel is part of the silver tooth specular:
      // Silver tooth is located around x: 500-800, y: 150-500.
      const inSilverZone = (x >= 400 && x <= 820 && y >= 130 && y <= 950);
      
      // Let's protect the silver tooth highlight:
      // The silver tooth has strong edge gradients (dark borders around the white core).
      // But background pixels have very uniform neighborhood.

      let isBackground = false;
      let alpha = 255;

      if (chroma <= 6 && brightness >= 218) {
        // High likelihood of background
        // Check if inside silver ribbon or outer background
        // The silver ribbon specular is surrounded by dark silver metal edges
        if (brightness >= 222 && chroma <= 4) {
          isBackground = true;
          alpha = 0;
        } else {
          // Soft transition edge
          const factor = (222 - brightness) / 10;
          alpha = Math.round(Math.max(0, Math.min(255, factor * 255)));
        }
      }

      transparentBuffer[outIdx + 3] = alpha;
    }
  }

  // Save clean transparent version
  await sharp(transparentBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile('public/images/radiant_logo_transparent.png');
  console.log('Saved public/images/radiant_logo_transparent.png');

  // Copy to tooth mark
  fs.copyFileSync('public/images/radiant_logo_transparent.png', 'public/images/radiant_tooth_mark.png');

  // Favicon PNG (128x128)
  await sharp('public/images/radiant_logo_transparent.png')
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('public/favicon.png');
  console.log('Saved public/favicon.png');

  // Favicon SVG embedding the exact pixel-perfect image
  const pngBase64 = fs.readFileSync('public/favicon.png').toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="100%" height="100%">
  <image width="128" height="128" href="data:image/png;base64,${pngBase64}" />
</svg>`;
  fs.writeFileSync('public/favicon.svg', svgContent);
  console.log('Saved public/favicon.svg');
}

main().catch(console.error);
