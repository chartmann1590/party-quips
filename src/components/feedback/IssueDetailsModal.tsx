import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BugReport, GithubComment } from '../../types/feedback'
import { getIssue, getComments, postComment, uploadScreenshot } from '../../services/github'
import { saveReport } from '../../services/bugReportStore'

interface Props {
  report: BugReport
  onClose: () => void
  onUpdated: (updated: BugReport) => void
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}

export default function IssueDetailsModal({ report, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [current, setCurrent] = useState<BugReport>(report)
  const [comments, setComments] = useState<GithubComment[]>([])
  const [reply, setReply] = useState('')
  const [replyFile, setReplyFile] = useState<File | null>(null)
  const [replyPreview, setReplyPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setFetchError(null)
      try {
        const [issue, fetchedComments] = await Promise.all([
          getIssue(report.number),
          getComments(report.number),
        ])
        const updated: BugReport = {
          ...current,
          status: issue.state,
          title: issue.title,
          htmlUrl: issue.html_url,
        }
        setCurrent(updated)
        saveReport(updated)
        onUpdated(updated)
        setComments(fetchedComments)
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : 'Failed to load issue')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report.number])

  function handleReplyFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setReplyFile(file)
    setReplyPreview(URL.createObjectURL(file))
  }

  function clearReplyFile() {
    setReplyFile(null)
    if (replyPreview) URL.revokeObjectURL(replyPreview)
    setReplyPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handlePostReply() {
    if (!reply.trim() && !replyFile) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      let screenshotUrl: string | null = null
      if (replyFile) {
        const b64 = await fileToBase64(replyFile)
        screenshotUrl = await uploadScreenshot(b64)
      }

      const bodyParts = ['## Reply', '', reply.trim() || '*(no text)*']
      if (screenshotUrl) {
        bodyParts.push('', '## Attachment', '', `![Screenshot](${screenshotUrl})`)
      }

      await postComment(current.number, bodyParts.join('\n'))
      setReply('')
      clearReplyFile()

      const refreshed = await getComments(current.number)
      setComments(refreshed)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  const isOpen = current.status === 'open'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 20 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl"
        style={{ background: '#1e1b4b', border: '2px solid rgba(255,255,255,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 gap-3">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: isOpen ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
                  color: isOpen ? '#4ade80' : '#f87171',
                  border: `1px solid ${isOpen ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.4)'}`,
                }}
              >
                {isOpen ? '● OPEN' : '● CLOSED'}
              </span>
              <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                #{current.number}
              </span>
            </div>
            <h2 className="font-display font-black text-lg leading-tight" style={{ color: '#fde047' }}>
              {current.title}
            </h2>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Submitted {formatDate(current.createdAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-none text-xl leading-none transition-opacity hover:opacity-60 mt-1"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            ✕
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-4">
          {loading && (
            <div className="text-center py-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
              ⏳ Loading issue details…
            </div>
          )}

          {fetchError && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}
            >
              ⚠️ {fetchError} — showing locally cached data.
            </div>
          )}

          {/* Comments */}
          {!loading && (
            <>
              {comments.length === 0 ? (
                <p className="text-sm text-center py-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  No comments yet.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {comments.map(c => (
                    <div
                      key={c.id}
                      className="rounded-2xl px-4 py-3"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-sm" style={{ color: '#a78bfa' }}>@{c.user.login}</span>
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                          {formatDate(c.created_at)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        {c.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply form */}
              <div
                className="rounded-2xl p-4 flex flex-col gap-3 mt-2"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <p className="font-label text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  Post a reply
                </p>
                <textarea
                  className="input-field text-sm py-3 resize-none"
                  placeholder="Write a reply…"
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  rows={3}
                  disabled={submitting}
                />

                {replyPreview?.startsWith('blob:') ? (
                  <div className="relative rounded-xl overflow-hidden" style={{ maxHeight: 120 }}>
                    <img src={replyPreview} alt="Attachment preview" className="w-full object-cover" style={{ maxHeight: 120 }} />
                    <button
                      onClick={clearReplyFile}
                      className="absolute top-1.5 right-1.5 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold"
                      style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={submitting}
                    className="text-sm font-label font-semibold py-2 rounded-xl transition-colors"
                    style={{
                      border: '2px dashed rgba(255,255,255,0.2)',
                      color: 'rgba(255,255,255,0.4)',
                      background: 'transparent',
                    }}
                  >
                    📎 Attach image (optional)
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleReplyFile} />

                <AnimatePresence>
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl px-3 py-2 text-xs"
                      style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}
                    >
                      ❌ {submitError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handlePostReply}
                  disabled={submitting || (!reply.trim() && !replyFile)}
                  className="btn-primary text-sm py-3 w-full"
                >
                  {submitting ? '⏳ Posting…' : '💬 Post Reply'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
