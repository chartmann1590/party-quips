interface PlayerAvatarProps {
  name: string
  color: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showName?: boolean
  connected?: boolean
}

export default function PlayerAvatar({ name, color, size = 'md', showName = false, connected = true }: PlayerAvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-28 h-28 text-5xl',
  }

  const initial = name.charAt(0).toUpperCase()

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${sizes[size]} rounded-full flex items-center justify-center font-display font-black relative transition-all`}
        style={{
          backgroundColor: color,
          boxShadow: connected ? `0 0 20px ${color}70, 0 4px 15px ${color}50` : 'none',
          opacity: connected ? 1 : 0.4,
        }}
      >
        <span className="text-white drop-shadow-md">{initial}</span>
        {!connected && (
          <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-red-400 border-2 border-pq-bg" />
        )}
      </div>
      {showName && (
        <span className="text-pq-text font-label text-sm font-semibold truncate max-w-[80px] text-center">
          {name}
        </span>
      )}
    </div>
  )
}
