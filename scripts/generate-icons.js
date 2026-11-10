import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Function to create a valid uncompressed / deflate PNG file buffer
function createPng(width, height, getPixel) {
  // Each scanline: 1 byte filter (0 = None) + width * 4 bytes (RGBA)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: width (4), height (4), bit depth (1 = 8), color type (1 = 6 RGBA), comp (0), filter (0), interlace (0)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  function makeChunk(type, data) {
    const len = data.length;
    const chunk = Buffer.alloc(8 + len + 4);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);

    // CRC
    const crc = crc32(Buffer.concat([Buffer.from(type, 'ascii'), data]));
    chunk.writeUInt32BE(crc, 8 + len);
    return chunk;
  }

  // Precomputed CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Brand icon generator: Emerald (#10b981) "BM" emblem on Dark Slate (#0f172a)
function getBrandedPixel(x, y, w, h, isMaskable = false) {
  // Normalize coords: -1 to 1
  const nx = (x / w) * 2 - 1;
  const ny = (y / h) * 2 - 1;
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background: dark slate #0f172a
  let r = 15, g = 23, b = 42, a = 255;

  // Inner card circle or rounded rect
  const scale = isMaskable ? 0.6 : 0.75;
  const innerX = nx / scale;
  const innerY = ny / scale;
  const innerDist = Math.sqrt(innerX * innerX + innerY * innerY);

  if (innerDist < 1.0) {
    // Gradient: Emerald #10b981 to #059669
    const grad = (innerY + 1) / 2;
    r = Math.round(16 * (1 - grad) + 5 * grad);
    g = Math.round(185 * (1 - grad) + 150 * grad);
    b = Math.round(129 * (1 - grad) + 105 * grad);

    // Business glyph inside: "B" letterform / bar chart stylized
    // Left vertical bar: x in [-0.4, -0.2], y in [-0.5, 0.5]
    if (innerX >= -0.45 && innerX <= -0.22 && innerY >= -0.5 && innerY <= 0.5) {
      r = 255; g = 255; b = 255; // White
    }
    // Top bar / loop
    const upperLoop = Math.sqrt((innerX + 0.1) * (innerX + 0.1) + (innerY + 0.25) * (innerY + 0.25));
    if (upperLoop < 0.28 && upperLoop > 0.14 && innerX >= -0.3) {
      r = 255; g = 255; b = 255;
    }
    // Lower bar / loop
    const lowerLoop = Math.sqrt((innerX + 0.05) * (innerX + 0.05) + (innerY - 0.22) * (innerY - 0.22));
    if (lowerLoop < 0.32 && lowerLoop > 0.15 && innerX >= -0.3) {
      r = 255; g = 255; b = 255;
    }
    // Graph upward accent dot / sparkle at top right
    const dotDist = Math.sqrt((innerX - 0.45) * (innerX - 0.45) + (innerY + 0.4) * (innerY + 0.4));
    if (dotDist < 0.12) {
      r = 251; g = 191; b = 36; // Amber accent
    }
  }

  return [r, g, b, a];
}

console.log('Generating PWA icons...');
const icon192 = createPng(192, 192, (x, y, w, h) => getBrandedPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

const icon512 = createPng(512, 512, (x, y, w, h) => getBrandedPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

const maskable512 = createPng(512, 512, (x, y, w, h) => getBrandedPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), maskable512);

const appleTouch = createPng(180, 180, (x, y, w, h) => getBrandedPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

const faviconPng = createPng(64, 64, (x, y, w, h) => getBrandedPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconPng);

// Also generate public/icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
  <circle cx="256" cy="256" r="185" fill="url(#emeraldGrad)"/>
  <!-- Business Mind Monogram & Financial Chart -->
  <path d="M 180 150 L 250 150 C 290 150 320 175 320 205 C 320 225 305 242 285 250 C 315 258 335 280 335 315 C 335 355 300 375 250 375 L 180 375 Z" fill="none" stroke="#ffffff" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" />
  <line x1="180" y1="255" x2="280" y2="255" stroke="#ffffff" stroke-width="26" stroke-linecap="round"/>
  <!-- Growth Sparkle -->
  <circle cx="360" cy="155" r="22" fill="#fbbf24"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('Successfully generated all PWA icons in /public:');
console.log(' - pwa-192x192.png');
console.log(' - pwa-512x512.png');
console.log(' - pwa-maskable-512x512.png');
console.log(' - apple-touch-icon.png');
console.log(' - favicon.ico');
console.log(' - icon.svg');
