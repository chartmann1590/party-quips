import { type ReactNode } from 'react'

interface PhoneLayoutProps {
  children: ReactNode
  className?: string
  centered?: boolean
}

export default function PhoneLayout({ children, className = '', centered = false }: PhoneLayoutProps) {
  return (
    <div
      className={`min-h-screen w-full flex flex-col bg-game-bg ${centered ? 'items-center justify-center' : ''} ${className}`}
      style={{ backgroundImage: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0f0f1a 70%)' }}
    >
      <div className="w-full max-w-sm mx-auto flex flex-col flex-1 px-4 py-6">
        {children}
      </div>
    </div>
  )
}
