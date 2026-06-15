import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const clipDir = resolve(here, 'live-clips')
mkdirSync(clipDir, { recursive: true })

const fps = 30
const scenes = [
  ['live-captures/live-01-home.png', 8],
  ['live-captures/live-03-host-lobby-empty.png', 9],
  ['live-captures/live-02-join.png', 8],
  ['live-captures/live-04-player-lobby-one.png', 8],
  ['live-captures/live-06-host-lobby-players.png', 8],
  ['live-captures/live-07-host-answering.png', 8],
  ['live-captures/live-09-player-typed-answer.png', 8],
  ['live-captures/live-13-autoquip-before.png', 8],
  ['live-captures/live-14-autoquip-submitted.png', 8],
  ['live-captures/live-10-fibbage-lobby.png', 8],
  ['live-captures/live-11-trivia-lobby.png', 8],
  ['live-captures/live-12-feedback.png', 7],
  ['live-captures/live-01-home.png', 11],
]

const concatLines = []
for (let i = 0; i < scenes.length; i++) {
  const [image, duration] = scenes[i]
  const frames = duration * fps
  const input = resolve(here, image)
  const clip = resolve(clipDir, `clip-${String(i + 1).padStart(2, '0')}.mp4`)
  const zoom = i % 2 === 0 ? `1+0.018*on/${frames}` : `1.018-0.018*on/${frames}`
  const filter = [
    `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,gblur=sigma=28,eq=brightness=-0.35:saturation=1.25[bg]`,
    `[0:v]scale=1500:900:force_original_aspect_ratio=decrease,setsar=1[fg]`,
    `[bg][fg]overlay=(W-w)/2:(H-h)/2,zoompan=z='${zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1920x1080:fps=${fps},format=yuv420p`,
  ].join(';')

  execFileSync('ffmpeg', [
    '-y',
    '-loop', '1',
    '-i', input,
    '-frames:v', String(frames),
    '-filter_complex', filter,
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    clip,
  ], { stdio: 'inherit' })
  concatLines.push(`file '${clip.replaceAll('\\', '/')}'`)
}

const concatPath = resolve(here, 'live-concat.txt')
writeFileSync(concatPath, concatLines.join('\n'))
execFileSync('ffmpeg', [
  '-y',
  '-f', 'concat',
  '-safe', '0',
  '-i', concatPath,
  '-c', 'copy',
  resolve(here, 'visuals.mp4'),
], { stdio: 'inherit' })

console.log('Rendered live screenshot-only visuals.mp4')
