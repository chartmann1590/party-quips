/**
 * Generates PWA icons as PNG files using only Node.js built-ins.
 * Creates a colorful party-themed icon with neon purple gradient.
 */
import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync, existsSync } from 'fs'

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const tb = Buffer.from(type)
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const crcInput = Buffer.concat([tb, data])
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(crcInput))
  return Buffer.concat([len, tb, data, crcBuf])
}

function lerp(a, b, t) { return Math.round(a + (b - a) * t) }

function generateIcon(size, maskable = false) {
  const padding = maskable ? Math.floor(size * 0.1) : 0
  const rows = []

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 3)
    row[0] = 0

    for (let x = 0; x < size; x++) {
      const nx = (x - size / 2) / (size / 2)
      const ny = (y - size / 2) / (size / 2)
      const dist = Math.sqrt(nx * nx + ny * ny)

      // Background: dark navy
      let R = 0x0f, G = 0x0f, B = 0x1a

      const inCircle = dist < (maskable ? 1.0 : 0.9)

      if (inCircle) {
        // Purple-to-cyan gradient based on position
        const t = Math.max(0, Math.min(1, (nx + ny + 1.5) / 3))
        const gradient_t = dist < 0.6 ? dist / 0.6 : 1

        // Inner: bright purple, outer: cyan
        R = lerp(0xd0, 0x00, gradient_t * t + (1 - t) * gradient_t * 0.3)
        G = lerp(0x40, 0xf5, gradient_t)
        B = lerp(0xff, 0xff, 0.8)

        // Purple tones
        R = lerp(0xb5, 0x00, t * gradient_t)
        G = lerp(0x37, 0xf5, gradient_t)
        B = lerp(0xf2, 0xff, gradient_t * (1 - t * 0.5))

        // Add some brightness variation for depth
        const brightness = 0.8 + 0.2 * Math.cos(dist * Math.PI)
        R = Math.min(255, Math.round(R * brightness))
        G = Math.min(255, Math.round(G * brightness))
        B = Math.min(255, Math.round(B * brightness))
      }

      // Draw a simple star/sparkle shape
      const angle = Math.atan2(ny, nx)
      const starPoints = 5
      const outerR = 0.55
      const innerR = 0.25
      const starAngle = ((angle + Math.PI / 2) % (2 * Math.PI / starPoints) - Math.PI / starPoints) / (Math.PI / starPoints)
      const starRadius = innerR + (outerR - innerR) * Math.abs(Math.cos(starAngle * Math.PI / 2))

      if (dist < starRadius && dist > 0.08) {
        // Star fill: bright yellow-white glow
        const glow = 1 - dist / starRadius
        R = Math.min(255, R + Math.round(glow * 100))
        G = Math.min(255, G + Math.round(glow * 60))
        B = Math.min(255, B + Math.round(glow * 20))
      }

      // Center dot: white
      if (dist < 0.1) {
        R = 255; G = 240; B = 255
      }

      // Edge glow / border
      if (!maskable && dist > 0.85 && dist < 0.92) {
        const edgeT = (dist - 0.85) / 0.07
        R = lerp(R, 0xb5, edgeT)
        G = lerp(G, 0x37, edgeT)
        B = lerp(B, 0xf2, edgeT)
      }

      row[1 + x * 3] = R
      row[2 + x * 3] = G
      row[3 + x * 3] = B
    }
    rows.push(row)
  }

  const rawData = Buffer.concat(rows)
  const compressed = deflateSync(rawData)

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 2

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', Buffer.alloc(0))])
}

const outDir = 'public/icons'
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const sizes = [192, 512]
for (const size of sizes) {
  writeFileSync(`${outDir}/icon-${size}x${size}.png`, generateIcon(size, false))
  writeFileSync(`${outDir}/icon-maskable-${size}x${size}.png`, generateIcon(size, true))
  console.log(`Generated ${size}x${size} icon`)
}

// Also write a small favicon (32x32)
writeFileSync('public/favicon.png', generateIcon(32, false))
console.log('Generated favicon.png')
console.log('Icon generation complete!')
