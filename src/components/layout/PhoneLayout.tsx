import { type ReactNode } from 'react'

interface PhoneLayoutProps {
  children: ReactNode
  className?: string
  centered?: boolean
}

export default function PhoneLayout({ children, className = '', centered = false }: PhoneLayoutProps) {
  return (
    <div
      className={`min-h-screen w-full flex flex-col ${centered ? 'items-center justify-center' : ''} ${className}`}
      style={{ background: 'linear-gradient(160deg, #2d0a4e 0%, #1c1014 45%, #6b0f3a 100%)' }}
    >
      <div className="w-full max-w-sm mx-auto flex flex-col flex-1 px-4 py-6">
        {children}
      </div>
    </div>
  )
}
