import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { CONTENT_PACKS, PACK_ORDER } from '../../lib/contentPacks'
import type { PackId } from '../../types/addOns'

interface AddOnSelectorProps {
  activeAddOns: string[]
  onChange: (newActive: string[]) => void
}

export default function AddOnSelector({ activeAddOns, onChange }: AddOnSelectorProps) {
  const navigate = useNavigate()
  const { isSignedIn, ownedPackIds } = useAuthStore()

  function toggle(packId: PackId) {
    if (activeAddOns.includes(packId)) {
      onChange(activeAddOns.filter(id => id !== packId))
    } else {
      onChange([...activeAddOns, packId])
    }
  }

  if (!isSignedIn) {
    return (
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(253,224,71,0.08)', border: '1px solid rgba(253,224,71,0.2)' }}
      >
        <span style={{ fontSize: '1.2rem' }}>✨</span>
        <p className="font-label text-sm flex-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Sign in to unlock add-on content packs
        </p>
        <button
          onClick={() => navigate('/account')}
          className="flex-none px-3 py-1.5 rounded-lg font-label text-xs font-bold transition-opacity hover:opacity-80"
          style={{ background: '#fde047', color: '#1e1b4b' }}
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/store')}
          className="flex-none px-3 py-1.5 rounded-lg font-label text-xs font-bold transition-opacity hover:opacity-80"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
        >
          Store
        </button>
      </div>
    )
  }

  if (ownedPackIds.length === 0) {
    return (
      <div
        className="rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <span style={{ fontSize: '1.2rem' }}>🛍️</span>
        <p className="font-label text-sm flex-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
          No packs yet — get more content for $9.99 each
        </p>
        <button
          onClick={() => navigate('/store')}
          className="flex-none px-3 py-1.5 rounded-lg font-label text-xs font-bold transition-opacity hover:opacity-80"
          style={{ background: '#fde047', color: '#1e1b4b' }}
        >
          Visit Store →
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="font-label text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
        ✨ Add-On Packs
      </p>
      {PACK_ORDER.filter(id => ownedPackIds.includes(id)).map(packId => {
        const pack = CONTENT_PACKS[packId]
        const active = activeAddOns.includes(packId)
        return (
          <motion.button
            key={packId}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggle(packId)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all"
            style={{
              background: active ? `${pack.accentColor}20` : 'rgba(255,255,255,0.05)',
              border: `2px solid ${active ? pack.accentColor + '80' : 'rgba(255,255,255,0.1)'}`,
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>{pack.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                {pack.name}
              </p>
              <p className="font-label text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                +{pack.quiplashPrompts.length + pack.quiplashFinalLash.length} quips • +{pack.fibbagePrompts.length} fibbage • +{pack.triviaQuestions.length} trivia
              </p>
            </div>
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-none"
              style={{
                background: active ? pack.accentColor : 'transparent',
                borderColor: active ? pack.accentColor : 'rgba(255,255,255,0.3)',
              }}
            >
              <AnimatePresence>
                {active && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="text-white font-bold"
                    style={{ fontSize: '0.6rem' }}
                  >
                    ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.button>
        )
      })}
      {ownedPackIds.length < 3 && (
        <button
          onClick={() => navigate('/store')}
          className="font-label text-xs text-center transition-opacity hover:opacity-70 pt-1"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          + Get more packs →
        </button>
      )}
    </div>
  )
}
