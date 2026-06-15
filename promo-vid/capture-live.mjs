import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = resolve(here, 'live-captures')
mkdirSync(outDir, { recursive: true })

const base = 'http://127.0.0.1:5173/party-quips/'

async function shot(page, name) {
  await page.screenshot({ path: resolve(outDir, name), fullPage: false })
  console.log(`captured ${name}`)
}

async function wait(ms) {
  await new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const browser = await chromium.launch({ headless: true })

  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    recordVideo: { dir: resolve(outDir, 'raw-video'), size: { width: 1280, height: 720 } },
  })
  const host = await desktop.newPage()
  await host.goto(base, { waitUntil: 'networkidle' })
  await wait(1200)
  await shot(host, 'live-01-home.png')

  const joinPreview = await desktop.newPage()
  await joinPreview.goto(`${base}#/join`, { waitUntil: 'networkidle' })
  await wait(900)
  await shot(joinPreview, 'live-02-join.png')

  await host.goto(`${base}#/host?game=quiplash`, { waitUntil: 'networkidle' })
  await host.getByText('Room Code', { exact: true }).waitFor({ state: 'visible', timeout: 30000 })
  await wait(1500)
  await shot(host, 'live-03-host-lobby-empty.png')

  const chars = await host.locator('.room-code-box').allTextContents()
  const code = chars.join('').replace(/[^A-Z]/g, '').slice(0, 4)
  if (code.length !== 4) throw new Error(`Could not read room code from host page: ${chars.join('|')}`)
  console.log(`room code ${code}`)

  const phoneContexts = []
  const players = [
    ['Tester', 'live-04-player-lobby-one.png'],
    ['Taylor', 'live-05-player-lobby-two.png'],
  ]

  for (const [name, file] of players) {
    const phone = await browser.newContext({
      viewport: { width: 412, height: 915 },
      isMobile: true,
      deviceScaleFactor: 2,
      recordVideo: { dir: resolve(outDir, 'raw-video'), size: { width: 412, height: 915 } },
    })
    phoneContexts.push(phone)
    const page = await phone.newPage()
    await page.goto(`${base}#/join?room=${code}`, { waitUntil: 'networkidle' })
    await page.getByPlaceholder('Player Name').fill(name)
    await page.getByRole('button', { name: /JOIN GAME/i }).click()
    await page.waitForURL('**/#/play', { timeout: 30000 })
    await wait(1200)
    await shot(page, file)
  }

  await wait(2000)
  await shot(host, 'live-06-host-lobby-players.png')

  const startButton = host.getByRole('button', { name: /START GAME/i })
  await startButton.waitFor({ state: 'visible', timeout: 30000 })
  await startButton.click()
  await host.waitForURL('**/#/host/game', { timeout: 30000 })
  await host.getByText('Round 1', { exact: false }).waitFor({ state: 'visible', timeout: 30000 })
  await wait(1800)
  await shot(host, 'live-07-host-answering.png')

  for (const context of phoneContexts) {
    for (const page of context.pages()) {
      if (!page.url().includes('#/play/game')) {
        await page.goto(`${base}#/play/game`, { waitUntil: 'networkidle' })
      }
      await wait(1200)
    }
  }

  const firstPhone = phoneContexts[0].pages()[0]
  await shot(firstPhone, 'live-08-player-answering.png')
  const answerBox = firstPhone.locator('textarea').first()
  if (await answerBox.count()) {
    await answerBox.fill('A haunted spreadsheet with benefits')
    await wait(400)
    await shot(firstPhone, 'live-09-player-typed-answer.png')
  }

  for (const context of phoneContexts) await context.close()
  await desktop.close()
  await browser.close()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
