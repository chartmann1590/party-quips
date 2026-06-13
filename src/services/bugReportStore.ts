import type { BugReport } from '../types/feedback'

const KEY = 'feedback_bug_reports'

export function loadReports(): BugReport[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as BugReport[]) : []
  } catch {
    return []
  }
}

export function saveReport(report: BugReport): void {
  const reports = loadReports()
  const idx = reports.findIndex(r => r.number === report.number)
  if (idx >= 0) reports[idx] = report
  else reports.unshift(report)
  try {
    localStorage.setItem(KEY, JSON.stringify(reports))
  } catch {
    // storage full — silently skip
  }
}
