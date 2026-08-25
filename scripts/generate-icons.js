import fs from 'fs';
import zlib from 'zlib';

function createPng(width, height) {
  // Simple uncompressed/deflated raw RGBA PNG generator
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Generate image data
  // Dark navy background (#0f172a / #090d16), indigo/emerald medical cross and capsule
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.42;

  for (let y = 0; y < height; y++) {
    rawData.writeUInt8(0, offset++); // filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background rounded container (#0f172a)
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Medical cross geometry
      const armWidth = width * 0.16;
      const armLength = width * 0.32;
      const inCross = (Math.abs(dx) <= armWidth && Math.abs(dy) <= armLength) ||
                      (Math.abs(dy) <= armWidth && Math.abs(dx) <= armLength);

      // Pill accent circle in center
      const inCenterCircle = dist <= (armWidth * 0.95);

      if (inCross) {
        // Indigo to Emerald gradient (#4f46e5 -> #10b981)
        const t = (x + y) / (width * 2);
        r = Math.round(79 * (1 - t) + 16 * t);
        g = Math.round(70 * (1 - t) + 185 * t);
        b = Math.round(229 * (1 - t) + 129 * t);
      } else if (dist < radius) {
        // Outer glowing ring
        if (dist > radius - width * 0.04) {
          r = 99;
          g = 102;
          b = 241;
          a = 200;
        } else {
          // Subtle radial dark gradient
          const factor = 1 - (dist / radius) * 0.4;
          r = Math.round(15 * factor + 20 * (1 - factor));
          g = Math.round(23 * factor + 30 * (1 - factor));
          b = Math.round(42 * factor + 60 * (1 - factor));
        }
      }

      rawData.writeUInt8(r, offset++);
      rawData.writeUInt8(g, offset++);
      rawData.writeUInt8(b, offset++);
      rawData.writeUInt8(a, offset++);
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([len, body, crcBuf]);
}

// CRC32 table & calculation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Create files
if (!fs.existsSync('./public')) {
  fs.mkdirSync('./public', { recursive: true });
}

fs.writeFileSync('./public/icon-192x192.png', createPng(192, 192));
fs.writeFileSync('./public/icon-512x512.png', createPng(512, 512));
fs.writeFileSync('./public/icon-192.png', createPng(192, 192));
fs.writeFileSync('./public/icon-512.png', createPng(512, 512));

console.log('Successfully generated PWA and Android PNG icons in /public!');
