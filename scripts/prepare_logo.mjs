import sharp from 'sharp';
import fs from 'fs';

const srcPath = '/home/dascientist/.gemini/antigravity-ide/brain/a6e62388-f775-44c9-9d7b-0971324fba34/.user_uploaded/media_1792347110873.jpg';

async function process() {
  fs.copyFileSync(srcPath, 'public/images/radiant_logo_card.jpg');

  const { data, info } = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const rgbaBuffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const outIdx = (y * width + x) * 4;
      rgbaBuffer[outIdx] = r;
      rgbaBuffer[outIdx + 1] = g;
      rgbaBuffer[outIdx + 2] = b;

      // Inside logo bounding box
      const inLogoZone = (x >= 315 && x <= 710 && y >= 35 && y <= 555);
      
      if (!inLogoZone) {
        rgbaBuffer[outIdx + 3] = 0;
        continue;
      }

      const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const chroma = maxC - minC;

      // Seamless background removal
      if (brightness >= 244 && chroma < 14) {
        rgbaBuffer[outIdx + 3] = 0;
      } else if (brightness >= 232 && chroma < 14) {
        const alpha = Math.round(((244 - brightness) / 12) * 255);
        rgbaBuffer[outIdx + 3] = Math.max(0, Math.min(255, alpha));
      } else {
        rgbaBuffer[outIdx + 3] = 255;
      }
    }
  }

  // Save the full transparent logo
  await sharp(rgbaBuffer, { raw: { width, height, channels: 4 } })
    .png()
    .toFile('public/images/radiant_logo_transparent.png');

  // Crop 1: Tooth Mark with Star only (no text at all)
  const toothLeft = 320;
  const toothTop = 38;
  const toothWidth = 385;
  const toothHeight = 324; // Stops right above the letters "RADIANT"

  await sharp('public/images/radiant_logo_transparent.png')
    .extract({ left: toothLeft, top: toothTop, width: toothWidth, height: toothHeight })
    .png()
    .toFile('public/images/radiant_tooth_mark.png');
  console.log('Created clean public/images/radiant_tooth_mark.png');

  // Crop 2: Full Logo (Tooth + Star + RADIANT DENTISTRY)
  const fullLeft = 315;
  const fullTop = 38;
  const fullWidth = 395;
  const fullHeight = 495;

  await sharp('public/images/radiant_logo_transparent.png')
    .extract({ left: fullLeft, top: fullTop, width: fullWidth, height: fullHeight })
    .png()
    .toFile('public/images/radiant_full_logo.png');
  console.log('Created clean public/images/radiant_full_logo.png');

  // Favicon (crisp square 128x128 of the tooth mark)
  await sharp('public/images/radiant_tooth_mark.png')
    .resize(128, 128, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile('public/favicon.png');
  console.log('Created public/favicon.png');
}

process().catch(console.error);
