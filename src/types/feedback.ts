export interface BugReport {
  number: number
  title: string
  status: string
  createdAt: string
  htmlUrl: string
}

export interface GithubIssue {
  number: number
  title: string
  state: string
  html_url: string
  created_at: string
  body?: string
}

export interface GithubComment {
  id: number
  body: string
  created_at: string
  user: { login: string }
}
