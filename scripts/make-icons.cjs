const fs = require('fs')
const zlib = require('zlib')
const path = require('path')

// CRC32 implementation
const crcTable = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  crcTable[i] = c
}
function crc32(buf) {
  let crc = 0xffffffff
  for (const b of buf) crc = crcTable[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const typeB = Buffer.from(type)
  const crcData = Buffer.concat([typeB, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcData))
  return Buffer.concat([len, typeB, data, crc])
}

function createPNG(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  // IHDR
  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(size, 0)
  ihdrData.writeUInt32BE(size, 4)
  ihdrData[8] = 8   // bit depth
  ihdrData[9] = 2   // RGB
  const ihdr = chunk('IHDR', ihdrData)

  // Draw icon: dark green background + white circle + white flag
  const bg = { r: 22, g: 101, b: 52 }    // #166534 dark green
  const fg = { r: 255, g: 255, b: 255 }  // white
  const accent = { r: 74, g: 222, b: 128 } // #4ade80 light green

  const cx = size / 2
  const cy = size / 2
  const ballR = size * 0.18   // white circle (ball)
  const flagX = cx + size * 0.05
  const poleTop = cy - size * 0.3
  const poleBot = cy + size * 0.3
  const poleW = size * 0.025

  const rowSize = 1 + size * 3
  const raw = Buffer.alloc(size * rowSize)

  for (let y = 0; y < size; y++) {
    const base = y * rowSize
    raw[base] = 0 // filter none
    for (let x = 0; x < size; x++) {
      let r = bg.r, g = bg.g, b = bg.b

      // White circle (golf ball)
      const dx = x - cx, dy = y - cy
      if (dx * dx + dy * dy <= ballR * ballR) {
        r = fg.r; g = fg.g; b = fg.b
      }

      // Flag pole (vertical line)
      if (x >= flagX - poleW && x <= flagX + poleW && y >= poleTop && y <= poleBot) {
        r = fg.r; g = fg.g; b = fg.b
      }

      // Flag triangle (top right of pole)
      const flagH = size * 0.14
      const flagW = size * 0.14
      if (y >= poleTop && y <= poleTop + flagH) {
        const t = (y - poleTop) / flagH
        if (x >= flagX + poleW && x <= flagX + poleW + flagW * (1 - t)) {
          r = accent.r; g = accent.g; b = accent.b
        }
      }

      raw[base + 1 + x * 3] = r
      raw[base + 1 + x * 3 + 1] = g
      raw[base + 1 + x * 3 + 2] = b
    }
  }

  const compressed = zlib.deflateSync(raw)
  const idat = chunk('IDAT', compressed)
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([sig, ihdr, idat, iend])
}

const publicDir = path.join(__dirname, '..', 'public')
fs.mkdirSync(publicDir, { recursive: true })

for (const size of [192, 512]) {
  const out = path.join(publicDir, `pwa-${size}x${size}.png`)
  fs.writeFileSync(out, createPNG(size))
  console.log(`Created ${out}`)
}

// Also create apple-touch-icon (180x180)
const appleOut = path.join(publicDir, 'apple-touch-icon.png')
fs.writeFileSync(appleOut, createPNG(180))
console.log(`Created ${appleOut}`)
