import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import TVLayout from '../components/layout/TVLayout'
import BugReportModal from '../components/feedback/BugReportModal'
import IssueDetailsModal from '../components/feedback/IssueDetailsModal'
import { loadReports, saveReport } from '../services/bugReportStore'
import type { BugReport } from '../types/feedback'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

export default function FeedbackPage() {
  const navigate = useNavigate()
  const [reports, setReports] = useState<BugReport[]>(() => loadReports())
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  function handleSubmitted() {
    const fresh = loadReports()
    setReports(fresh)
    setShowReportModal(false)
    setSuccessMsg('Report submitted! You can track it below.')
    setTimeout(() => setSuccessMsg(null), 5000)
  }

  function handleUpdated(updated: BugReport) {
    saveReport(updated)
    setReports(loadReports())
    if (selectedReport?.number === updated.number) {
      setSelectedReport(updated)
    }
  }

  return (
    <TVLayout>
      <div className="flex flex-col min-h-screen px-6 py-8 max-w-2xl mx-auto w-full gap-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <button
            onClick={() => navigate('/')}
            className="font-label text-sm mb-4 transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            ← Back to Home
          </button>
          <h1
            className="font-display font-black"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#fde047', textShadow: '3px 3px 0 #92400e' }}
          >
            🐛 Support &amp; Feedback
          </h1>
          <p className="font-label mt-2" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
            Found a bug? Have a suggestion? Let us know — reports go straight to GitHub Issues.
          </p>
        </motion.div>

        {/* Success message */}
        <AnimatePresence>
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl px-5 py-4 font-label text-sm"
              style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.4)', color: '#4ade80' }}
            >
              ✅ {successMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 22 }}
        >
          <button
            onClick={() => setShowReportModal(true)}
            className="btn-primary w-full text-xl py-5"
          >
            🚨 Report a Problem
          </button>
        </motion.div>

        {/* Submitted reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 22 }}
          className="flex flex-col gap-3"
        >
          <h2 className="font-display font-black text-lg" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Submitted Reports
          </h2>

          {reports.length === 0 ? (
            <div
              className="rounded-2xl px-5 py-8 text-center"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p className="font-label text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                No reports yet. Submit your first report above.
              </p>
            </div>
          ) : (
            reports.map((r, i) => {
              const isOpen = r.status === 'open'
              return (
                <motion.button
                  key={r.number}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, type: 'spring', stiffness: 260, damping: 24 }}
                  onClick={() => setSelectedReport(r)}
                  className="w-full text-left rounded-2xl px-5 py-4 flex flex-col gap-2 transition-all duration-150 hover:scale-[1.01]"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full flex-none"
                      style={{
                        background: isOpen ? 'rgba(74,222,128,0.15)' : 'rgba(239,68,68,0.15)',
                        color: isOpen ? '#4ade80' : '#f87171',
                        border: `1px solid ${isOpen ? 'rgba(74,222,128,0.4)' : 'rgba(239,68,68,0.4)'}`,
                      }}
                    >
                      {isOpen ? '● OPEN' : '● CLOSED'}
                    </span>
                    <span className="text-xs font-mono ml-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      #{r.number}
                    </span>
                  </div>
                  <p className="font-display font-bold text-sm leading-tight" style={{ color: '#e9d5ff' }}>
                    {r.title}
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    Submitted {formatDate(r.createdAt)} — tap to view &amp; reply
                  </p>
                </motion.button>
              )
            })
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showReportModal && (
          <BugReportModal
            onClose={() => setShowReportModal(false)}
            onSubmitted={handleSubmitted}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedReport && (
          <IssueDetailsModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onUpdated={handleUpdated}
          />
        )}
      </AnimatePresence>
    </TVLayout>
  )
}
