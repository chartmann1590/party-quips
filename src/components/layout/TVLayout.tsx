import { type ReactNode } from 'react'

interface TVLayoutProps {
  children: ReactNode
  className?: string
}

export default function TVLayout({ children, className = '' }: TVLayoutProps) {
  return (
    <div
      className={`min-h-screen w-full flex flex-col bg-game-bg overflow-hidden ${className}`}
      style={{ backgroundImage: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0f0f1a 60%)' }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(181,55,242,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(181,55,242,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="relative z-10 flex flex-col flex-1">
        {children}
      </div>
    </div>
  )
}
