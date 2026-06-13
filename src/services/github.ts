import type { GithubIssue, GithubComment } from '../types/feedback'

const BASE = 'https://api.github.com'
const TOKEN = import.meta.env.VITE_GITHUB_API_TOKEN as string | undefined
const OWNER = import.meta.env.VITE_GITHUB_REPO_OWNER as string | undefined
const REPO = import.meta.env.VITE_GITHUB_REPO_NAME as string | undefined
const ASSETS_DIR = 'feedback-assets'

export const hasGithubConfig = (): boolean => !!(TOKEN && OWNER && REPO)

export const configError = (): string | null => {
  if (!TOKEN) return 'VITE_GITHUB_API_TOKEN is not set'
  if (!OWNER) return 'VITE_GITHUB_REPO_OWNER is not set'
  if (!REPO) return 'VITE_GITHUB_REPO_NAME is not set'
  return null
}

function makeHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'PartyQuips-Web/1.0',
  }
  if (TOKEN) h['Authorization'] = `Bearer ${TOKEN}`
  return h
}

async function checkResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let msg = `GitHub API ${res.status}`
    try {
      const json = JSON.parse(text)
      if (json.message) msg = json.message
    } catch {
      if (text) msg += `: ${text.slice(0, 200)}`
    }
    throw new Error(msg)
  }
  return res.json() as Promise<T>
}

export async function createIssue(title: string, body: string): Promise<GithubIssue> {
  const res = await fetch(`${BASE}/repos/${OWNER}/${REPO}/issues`, {
    method: 'POST',
    headers: makeHeaders(),
    body: JSON.stringify({ title: `[Feedback] ${title}`, body }),
  })
  return checkResponse<GithubIssue>(res)
}

export async function getIssue(number: number): Promise<GithubIssue> {
  const res = await fetch(`${BASE}/repos/${OWNER}/${REPO}/issues/${number}`, {
    headers: makeHeaders(),
  })
  return checkResponse<GithubIssue>(res)
}

export async function getComments(number: number): Promise<GithubComment[]> {
  const res = await fetch(`${BASE}/repos/${OWNER}/${REPO}/issues/${number}/comments`, {
    headers: makeHeaders(),
  })
  return checkResponse<GithubComment[]>(res)
}

export async function postComment(number: number, body: string): Promise<{ id: number }> {
  const res = await fetch(`${BASE}/repos/${OWNER}/${REPO}/issues/${number}/comments`, {
    method: 'POST',
    headers: makeHeaders(),
    body: JSON.stringify({ body }),
  })
  return checkResponse<{ id: number }>(res)
}

export async function uploadScreenshot(base64Content: string): Promise<string> {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 15)
  const rand = Math.random().toString(36).slice(2, 7)
  const filename = `issue-${ts}-${rand}.png`

  const res = await fetch(`${BASE}/repos/${OWNER}/${REPO}/contents/${ASSETS_DIR}/${filename}`, {
    method: 'PUT',
    headers: makeHeaders(),
    body: JSON.stringify({
      message: `Add feedback attachment ${filename}`,
      content: base64Content,
    }),
  })
  const data = await checkResponse<{ content?: { download_url?: string } }>(res)
  const url = data.content?.download_url
  if (!url) throw new Error('Upload succeeded but no download URL was returned')
  return url
}
