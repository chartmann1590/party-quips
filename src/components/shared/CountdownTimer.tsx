import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  totalSeconds: number
  startedAt: number
  size?: number
  onExpire?: () => void
  className?: string
}

export default function CountdownTimer({ totalSeconds, startedAt, size = 80, onExpire, className = '' }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    const update = () => {
      const elapsed = (Date.now() - startedAt) / 1000
      const rem = Math.max(0, totalSeconds - elapsed)
      setRemaining(rem)
      if (rem <= 0) onExpire?.()
    }
    update()
    const id = setInterval(update, 200)
    return () => clearInterval(id)
  }, [startedAt, totalSeconds, onExpire])

  const pct = remaining / totalSeconds
  const radius = size / 2 - 6
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - pct)

  const color = pct > 0.5 ? '#b537f2' : pct > 0.25 ? '#ffeb00' : '#ff2d78'
  const displaySeconds = Math.ceil(remaining)

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={6}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.2s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <span
        className="absolute font-display text-center"
        style={{ color, fontSize: size * 0.32, textShadow: `0 0 10px ${color}` }}
      >
        {displaySeconds}
      </span>
    </div>
  )
}
