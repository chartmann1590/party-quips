import type { ContentPack } from '../../types/addOns'

interface PackCardProps {
  pack: ContentPack
  owned: boolean
  onBuy: () => void
  buyLoading?: boolean
}

export default function PackCard({ pack, owned, onBuy, buyLoading }: PackCardProps) {
  return (
    <div
      className="rounded-3xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: `2px solid ${owned ? pack.accentColor + '80' : 'rgba(255,255,255,0.12)'}`,
        boxShadow: owned ? `0 0 24px ${pack.accentColor}30` : 'none',
        transition: 'box-shadow 0.3s',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-5 flex items-center gap-4"
        style={{ background: owned ? `${pack.accentColor}20` : 'rgba(255,255,255,0.04)' }}
      >
        <span style={{ fontSize: '2.5rem' }}>{pack.emoji}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-black text-xl text-white leading-tight">
            {pack.name}
          </h3>
          <p className="font-label text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {pack.tagline}
          </p>
        </div>
        {owned && (
          <span
            className="font-label text-xs font-bold px-3 py-1.5 rounded-full flex-none"
            style={{ background: pack.accentColor, color: '#fff' }}
          >
            ✓ Owned
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-6 py-4 flex flex-col gap-4 flex-1">
        <p className="font-label text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {pack.description}
        </p>

        {/* Content preview */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Quiplash Prompts', count: pack.quiplashPrompts.length + pack.quiplashFinalLash.length },
            { label: 'Fibbage Facts', count: pack.fibbagePrompts.length },
            { label: 'Trivia Qs', count: pack.triviaQuestions.length },
          ].map(item => (
            <div
              key={item.label}
              className="rounded-xl py-2 px-1"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <p className="font-display font-black text-xl" style={{ color: pack.accentColor }}>
                +{item.count}
              </p>
              <p className="font-label text-xs leading-tight" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* Sample prompts */}
        <div className="flex flex-col gap-1.5">
          {pack.quiplashPrompts.slice(0, 3).map(p => (
            <div
              key={p.id}
              className="font-label text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}
            >
              "{p.text}"
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Buy */}
      <div className="px-6 pb-5">
        {owned ? (
          <div
            className="w-full py-3 rounded-xl text-center font-label text-sm font-bold"
            style={{ background: `${pack.accentColor}20`, color: pack.accentColor, border: `1px solid ${pack.accentColor}40` }}
          >
            ✓ Added to your account
          </div>
        ) : (
          <button
            onClick={onBuy}
            disabled={buyLoading}
            className="w-full py-3 rounded-xl font-display font-black text-lg transition-all hover:opacity-90 active:scale-95"
            style={{
              background: pack.accentColor,
              color: '#fff',
              boxShadow: `0 4px 0 ${pack.accentColor}80`,
              opacity: buyLoading ? 0.7 : 1,
            }}
          >
            {buyLoading ? '⏳ Processing...' : `Buy for $9.99`}
          </button>
        )}
      </div>
    </div>
  )
}
