import { chromium } from 'playwright'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, existsSync, copyFileSync, readFileSync } from 'node:fs'
import { resolve, dirname, basename } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const sceneDir = resolve(here, 'scenes')
const clipDir = resolve(here, 'clips')
mkdirSync(sceneDir, { recursive: true })
mkdirSync(clipDir, { recursive: true })

const W = 1920
const H = 1080
const fps = 30

const scenes = [
  {
    image: 'promo-vid/live-captures/live-01-home.png',
    duration: 8,
    kicker: 'Browser party game',
    title: 'Party Quips',
    body: 'Pick a mode on the TV. Friends join from their phones. The couch gets loud fast.',
    stat: '3 game modes',
    theme: '#facc15',
  },
  {
    image: 'promo-vid/live-captures/live-03-host-lobby-empty.png',
    duration: 9,
    kicker: 'Host lobby',
    title: 'Room code plus QR',
    body: 'The TV handles setup with a giant code, a QR scan, and a player list everyone can see.',
    stat: '2-8 players',
    theme: '#38bdf8',
  },
  {
    image: 'promo-vid/live-captures/live-02-join.png',
    duration: 8,
    kicker: 'Phone join',
    title: 'No download drama',
    body: 'Players punch in the room code, add a name, and get straight to the questionable choices.',
    stat: 'phone ready',
    theme: '#fb7185',
  },
  {
    image: 'promo-vid/live-captures/live-04-player-lobby-one.png',
    duration: 8,
    kicker: 'Player screen',
    title: 'Simple controls',
    body: 'The phone UI stays focused: wait, answer, vote, and try not to embarrass yourself.',
    stat: 'thumb friendly',
    theme: '#a78bfa',
  },
  {
    image: 'promo-vid/live-captures/live-06-host-lobby-players.png',
    duration: 8,
    kicker: 'Witty Quips',
    title: 'Players are in',
    body: 'The host screen shows who joined, when to start, and what the room should do next.',
    stat: '138 prompts',
    theme: '#22d3ee',
  },
  {
    image: 'promo-vid/live-captures/live-07-host-answering.png',
    duration: 8,
    kicker: 'Witty Quips',
    title: 'Ridiculous prompts',
    body: 'The TV sets the stage while players race to write the funniest possible answer.',
    stat: 'live timers',
    theme: '#c084fc',
  },
  {
    image: 'promo-vid/live-captures/live-09-player-typed-answer.png',
    duration: 8,
    kicker: 'On your phone',
    title: 'Answer under pressure',
    body: 'Short prompts, fast typing, and that special panic where your brain becomes mashed potatoes.',
    stat: 'live timers',
    theme: '#c084fc',
  },
  {
    image: 'promo-vid/live-captures/live-13-autoquip-before.png',
    duration: 8,
    kicker: 'Auto-Quip',
    title: 'Stuck players get backup',
    body: 'When somebody freezes, the app can generate a quip and keep the round moving.',
    stat: 'AI assist',
    theme: '#4ade80',
  },
  {
    image: 'promo-vid/live-captures/live-14-autoquip-submitted.png',
    duration: 8,
    kicker: 'Still funny',
    title: 'Less waiting, more voting',
    body: 'No thirty-second silence while one friend insists they are "almost done."',
    stat: 'faster rounds',
    theme: '#34d399',
  },
  {
    image: 'promo-vid/live-captures/live-10-fibbage-lobby.png',
    duration: 8,
    kicker: 'Fib Finder',
    title: 'Lie with confidence',
    body: 'Make up fake answers to weird facts and trick the room into choosing yours.',
    stat: '90 prompts',
    theme: '#fb923c',
  },
  {
    image: 'promo-vid/live-captures/live-11-trivia-lobby.png',
    duration: 8,
    kicker: 'Deadly Trivia',
    title: 'Answer or face consequences',
    body: 'Fast multiple-choice rounds keep everyone guessing, surviving, and yelling at the TV.',
    stat: '70 questions',
    theme: '#ef4444',
  },
  {
    image: 'promo-vid/live-captures/live-12-feedback.png',
    duration: 7,
    kicker: 'Built-in feedback',
    title: 'Report issues fast',
    body: 'If something goes sideways, players can send a report without derailing the party.',
    stat: 'debug friendly',
    theme: '#ec4899',
  },
  {
    image: 'promo-vid/live-captures/live-01-home.png',
    duration: 11,
    kicker: 'Ready for the couch',
    title: 'Put it on YouTube, then put it on the TV',
    body: 'Party Quips is free, browser-based, phone-powered, and built for game night chaos.',
    stat: 'party-quips',
    theme: '#facc15',
  },
]

function esc(s) {
  return String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function sceneHtml(scene) {
  const imgData = readFileSync(resolve(root, scene.image)).toString('base64')
  const img = `data:image/png;base64,${imgData}`
  const phone = scene.image.includes('feedback')
  const imgClass = phone ? 'screenshot phone' : 'screenshot'
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @font-face { font-family: ImpactLocal; src: local("Impact"); }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: ${W}px;
    height: ${H}px;
    overflow: hidden;
    font-family: Inter, Arial, sans-serif;
    color: white;
    background:
      radial-gradient(circle at 15% 20%, ${scene.theme}55, transparent 24%),
      radial-gradient(circle at 85% 80%, #7c3aed88, transparent 28%),
      linear-gradient(135deg, #16002d 0%, #2e1065 48%, #0f172a 100%);
  }
  .bg {
    position: absolute;
    inset: -40px;
    background-image: url("${img}");
    background-size: cover;
    background-position: center;
    filter: blur(28px) brightness(0.42) saturate(1.35);
    transform: scale(1.08);
    opacity: .72;
  }
  .dots {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(255,255,255,.13) 1.5px, transparent 1.5px);
    background-size: 34px 34px;
    opacity: .48;
  }
  .wrap {
    position: relative;
    height: 100%;
    padding: 74px 84px;
    display: grid;
    grid-template-columns: 1fr 1.08fr;
    gap: 58px;
    align-items: center;
  }
  .copy {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
    z-index: 2;
  }
  .brand {
    color: #facc15;
    font-family: ImpactLocal, Arial Black, sans-serif;
    letter-spacing: 1px;
    font-size: 42px;
    text-transform: uppercase;
    text-shadow: 4px 4px 0 #7c2d12, 0 0 36px #facc1577;
    margin-bottom: 42px;
  }
  .kicker {
    display: inline-block;
    width: fit-content;
    padding: 12px 18px;
    border: 2px solid rgba(255,255,255,.24);
    border-radius: 999px;
    background: rgba(0,0,0,.25);
    color: ${scene.theme};
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 4px;
    font-size: 22px;
  }
  h1 {
    margin: 28px 0 22px;
    font-family: ImpactLocal, Arial Black, sans-serif;
    font-size: 92px;
    line-height: .92;
    letter-spacing: .5px;
    text-transform: uppercase;
    text-shadow: 6px 7px 0 rgba(0,0,0,.32);
  }
  p {
    margin: 0;
    color: rgba(255,255,255,.88);
    font-size: 34px;
    line-height: 1.18;
    max-width: 720px;
    font-weight: 750;
  }
  .stat {
    margin-top: 48px;
    width: fit-content;
    color: #111827;
    background: ${scene.theme};
    padding: 18px 28px;
    border-radius: 20px;
    font-family: ImpactLocal, Arial Black, sans-serif;
    text-transform: uppercase;
    font-size: 34px;
    box-shadow: 0 8px 0 rgba(0,0,0,.28), 0 18px 40px rgba(0,0,0,.22);
  }
  .shotWrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 820px;
  }
  .glow {
    position: absolute;
    width: 82%;
    height: 82%;
    border-radius: 42px;
    background: ${scene.theme};
    filter: blur(54px);
    opacity: .26;
  }
  .screenshot {
    position: relative;
    max-width: 100%;
    max-height: 780px;
    border-radius: 28px;
    border: 5px solid rgba(255,255,255,.18);
    box-shadow: 0 26px 90px rgba(0,0,0,.58), 0 11px 0 rgba(0,0,0,.32);
    object-fit: contain;
  }
  .phone {
    max-width: 46%;
    max-height: 840px;
    border-radius: 46px;
    border-width: 7px;
  }
  .spark {
    position: absolute;
    right: 34px;
    top: 24px;
    width: 120px;
    height: 120px;
    border-radius: 30px;
    background: ${scene.theme};
    color: #111827;
    display: grid;
    place-items: center;
    font-family: ImpactLocal, Arial Black, sans-serif;
    font-size: 54px;
    transform: rotate(8deg);
    box-shadow: 0 10px 0 rgba(0,0,0,.3);
  }
</style>
</head>
<body>
  <div class="bg"></div>
  <div class="dots"></div>
  <main class="wrap">
    <section class="copy">
      <div class="brand">Party Quips</div>
      <div class="kicker">${esc(scene.kicker)}</div>
      <h1>${esc(scene.title)}</h1>
      <p>${esc(scene.body)}</p>
      <div class="stat">${esc(scene.stat)}</div>
    </section>
    <section class="shotWrap">
      <div class="glow"></div>
      <img class="${imgClass}" src="${img}" />
      <div class="spark">!</div>
    </section>
  </main>
</body>
</html>`
}

async function renderScenes() {
  const browser = await chromium.launch({
    args: ['--disable-gpu', '--disable-dev-shm-usage'],
  })
  for (let i = 0; i < scenes.length; i++) {
    const scene = scenes[i]
    const out = resolve(sceneDir, `scene-${String(i + 1).padStart(2, '0')}.png`)
    if (existsSync(out)) continue
    const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
    await page.setContent(sceneHtml(scene), { waitUntil: 'load' })
    await page.waitForLoadState('networkidle')
    await page.evaluate(async () => {
      await Promise.all(Array.from(document.images).map(img => img.decode().catch(() => undefined)))
    })
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await page.screenshot({ path: out, fullPage: false })
        break
      } catch (err) {
        if (attempt === 3) throw err
        await page.waitForTimeout(500)
      }
    }
    await page.close()
  }
  await browser.close()
}

function renderClips() {
  const concatPath = resolve(here, 'concat.txt')
  const concatLines = []
  for (let i = 0; i < scenes.length; i++) {
    const n = String(i + 1).padStart(2, '0')
    const input = resolve(sceneDir, `scene-${n}.png`)
    const clip = resolve(clipDir, `clip-${n}.mp4`)
    const frames = Math.round(scenes[i].duration * fps)
    const zoom = i % 2 === 0 ? `1+0.030*on/${frames}` : `1.030-0.030*on/${frames}`
    execFileSync('ffmpeg', [
      '-y',
      '-loop', '1',
      '-i', input,
      '-frames:v', String(frames),
      '-vf', `zoompan=z='${zoom}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${W}x${H}:fps=${fps},format=yuv420p`,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '18',
      '-pix_fmt', 'yuv420p',
      clip,
    ], { stdio: 'inherit' })
    concatLines.push(`file '${clip.replaceAll('\\', '/')}'`)
  }
  writeFileSync(concatPath, concatLines.join('\n'))
  execFileSync('ffmpeg', [
    '-y',
    '-f', 'concat',
    '-safe', '0',
    '-i', concatPath,
    '-c', 'copy',
    resolve(here, 'visuals.mp4'),
  ], { stdio: 'inherit' })
}

await renderScenes()
renderClips()

if (!existsSync(resolve(here, 'source-screenshots'))) {
  mkdirSync(resolve(here, 'source-screenshots'), { recursive: true })
  for (const scene of scenes) {
    copyFileSync(resolve(root, scene.image), resolve(here, 'source-screenshots', basename(scene.image)))
  }
}

console.log(`Rendered ${scenes.length} scenes to ${resolve(here, 'visuals.mp4')}`)
