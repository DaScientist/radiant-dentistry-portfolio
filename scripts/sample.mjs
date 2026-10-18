import sharp from 'sharp';

const { data, info } = await sharp('public/images/radiant_logo_original.png').raw().toBuffer({ resolveWithObject: true });
const { width, channels } = info;
function get(x, y) {
  const idx = (y * width + x) * channels;
  return [data[idx], data[idx+1], data[idx+2]];
}
console.log('Center hollow (512, 350):', get(512, 350));
console.log('Center upper hollow (512, 220):', get(512, 220));
console.log('Top left outside (50, 50):', get(50, 50));
console.log('Top right outside (950, 50):', get(950, 50));
console.log('Bottom left outside (50, 950):', get(50, 950));
console.log('Gold ribbon sample (200, 350):', get(200, 350));
console.log('Silver ribbon sample (700, 350):', get(700, 350));
console.log('Star center sample (796, 140):', get(796, 140));
