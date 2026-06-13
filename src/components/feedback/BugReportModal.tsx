import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createIssue, uploadScreenshot, hasGithubConfig, configError } from '../../services/github'
import { getDiagnostics } from '../../services/diagnostics'
import { saveReport } from '../../services/bugReportStore'

interface Props {
  onClose: () => void
  onSubmitted: () => void
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function BugReportModal({ onClose, onSubmitted }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const configErr = configError()
  const canSubmit = !loading && !configErr && title.trim() && description.trim()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setScreenshot(file)
    const url = URL.createObjectURL(file)
    setScreenshotPreview(url)
  }

  function clearScreenshot() {
    setScreenshot(null)
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview)
    setScreenshotPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setLoading(true)
    setError(null)
    try {
      let screenshotUrl: string | null = null
      if (screenshot) {
        const b64 = await fileToBase64(screenshot)
        screenshotUrl = await uploadScreenshot(b64)
      }

      const bodyParts = [
        '## Description',
        '',
        description.trim(),
        '',
        '## Contact Info',
        '',
        `- Name: ${name.trim() || 'Not provided'}`,
        `- Email: ${email.trim() || 'Not provided'}`,
      ]

      if (screenshotUrl) {
        bodyParts.push('', '## Attachment', '', `![Screenshot](${screenshotUrl})`)
      }

      if (includeDiagnostics) {
        bodyParts.push('', getDiagnostics())
      }

      const issue = await createIssue(title.trim(), bodyParts.join('\n'))

      saveReport({
        number: issue.number,
        title: issue.title,
        status: issue.state,
        createdAt: issue.created_at,
        htmlUrl: issue.html_url,
      })

      onSubmitted()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl flex flex-col"
        style={{ background: '#1e1b4b', border: '2px solid rgba(255,255,255,0.15)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="font-display font-black text-2xl" style={{ color: '#fde047' }}>
            🐛 Report a Problem
          </h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none transition-opacity hover:opacity-60"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6 flex flex-col gap-4">
          {/* Warning box */}
          <div
            className="rounded-xl px-4 py-3 text-sm leading-relaxed"
            style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)', color: '#fbbf24' }}
          >
            ⚠️ Your report will be submitted to this app's GitHub issue tracker. <strong>Do not include passwords, private keys, financial information, or anything you do not want visible to the repository maintainers.</strong> This repository is public — your report may be publicly visible.
          </div>

          {/* Config error */}
          {configErr && (
            <div
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}
            >
              ⚙️ Configuration error: {configErr}. Submission is disabled.
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1">
            <label className="font-label text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Title <span style={{ color: '#f87171' }}>*</span>
            </label>
            <input
              className="input-field text-base py-3"
              placeholder="Brief summary of the problem"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={120}
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1">
            <label className="font-label text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Description <span style={{ color: '#f87171' }}>*</span>
            </label>
            <textarea
              className="input-field text-base py-3 resize-none"
              placeholder="Describe what happened and how to reproduce it"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Name + Email */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-label text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Name <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>(optional)</span>
              </label>
              <input
                className="input-field text-base py-3"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label className="font-label text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Email <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>(optional)</span>
              </label>
              <input
                className="input-field text-base py-3"
                type="email"
                placeholder="contact@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Diagnostics toggle */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => !loading && setIncludeDiagnostics(v => !v)}
              className="w-11 h-6 rounded-full relative transition-colors duration-200 flex-none"
              style={{ background: includeDiagnostics ? '#6d28d9' : 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.2)' }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full transition-all duration-200"
                style={{ left: includeDiagnostics ? '1.375rem' : '0.125rem', background: '#fff' }}
              />
            </div>
            <span className="font-label text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Include app &amp; device diagnostics
            </span>
          </label>

          {/* Screenshot */}
          <div className="flex flex-col gap-2">
            <label className="font-label text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Screenshot <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>(optional — may contain private info)</span>
            </label>
            {screenshotPreview ? (
              <div className="relative rounded-2xl overflow-hidden" style={{ maxHeight: 180 }}>
                <img src={screenshotPreview} alt="Preview" className="w-full object-cover" style={{ maxHeight: 180 }} />
                <button
                  onClick={clearScreenshot}
                  className="absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm transition-opacity hover:opacity-80"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="rounded-2xl py-4 font-label text-sm font-semibold transition-colors"
                style={{
                  border: '2px dashed rgba(255,255,255,0.25)',
                  color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                📎 Attach screenshot or image
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl px-4 py-3 text-sm"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}
              >
                ❌ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 btn-secondary text-base py-3"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 btn-primary text-base py-3"
            >
              {loading ? '⏳ Submitting…' : '🚀 Submit Report'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
