import { type ReactNode } from 'react'

interface TVLayoutProps {
  children: ReactNode
  className?: string
}

export default function TVLayout({ children, className = '' }: TVLayoutProps) {
  return (
    <div
      className={`min-h-screen w-full flex flex-col overflow-hidden ${className}`}
      style={{ background: 'linear-gradient(135deg, #1c1014 0%, #3d0066 55%, #880e4f 100%)' }}
    >
      <div className="relative z-10 flex flex-col flex-1">
        {children}
      </div>
    </div>
  )
}
