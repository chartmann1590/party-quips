import { type ReactNode } from 'react'

interface PhoneLayoutProps {
  children: ReactNode
  className?: string
  centered?: boolean
}

export default function PhoneLayout({ children, className = '', centered = false }: PhoneLayoutProps) {
  return (
    <div
      className={`min-h-screen w-full flex flex-col relative overflow-hidden ${centered ? 'items-center justify-center' : ''} ${className}`}
      style={{ background: 'linear-gradient(160deg, #4c1d95 0%, #2e1065 60%, #1e1b4b 100%)' }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col flex-1 px-4 py-6">
        {children}
      </div>
    </div>
  )
}
