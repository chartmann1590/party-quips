interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export default function LoadingSpinner({ size = 'md', label }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-6 h-6', md: 'w-12 h-12', lg: 'w-20 h-20' }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`${sizes[size]} rounded-full border-4 border-game-border border-t-neon-purple animate-spin`}
      />
      {label && <p className="text-text-muted font-body text-lg">{label}</p>}
    </div>
  )
}
