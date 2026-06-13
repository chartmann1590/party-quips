import { type ReactNode } from 'react'
import TvNarrationControls from '../shared/TvNarrationControls'

interface TVLayoutProps {
  children: ReactNode
  className?: string
}

export default function TVLayout({ children, className = '' }: TVLayoutProps) {
  return (
    <div
      className={`min-h-screen w-full flex flex-col overflow-hidden relative ${className}`}
      style={{ background: 'linear-gradient(135deg, #3730a3 0%, #2e1065 60%, #1e1b4b 100%)' }}
    >
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.09) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="relative z-10 flex flex-col flex-1">
        {children}
      </div>
      <TvNarrationControls />
    </div>
  )
}
