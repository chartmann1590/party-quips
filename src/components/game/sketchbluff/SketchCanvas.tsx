import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface SketchCanvasProps {
  promptText: string
  submitted: boolean
  onSubmit: (drawingUrl: string) => void
}

const COLORS = ['#111827', '#dc2626', '#2563eb', '#16a34a', '#facc15', '#f97316', '#9333ea', '#ec4899']
const SIZES = [4, 8, 14]

export default function SketchCanvas({ promptText, submitted, onSubmit }: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPoint = useRef<{ x: number; y: number } | null>(null)
  const [color, setColor] = useState(COLORS[0])
  const [size, setSize] = useState(SIZES[1])
  const [history, setHistory] = useState<ImageData[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.lineCap = 'round'
    context.lineJoin = 'round'
    setHistory([context.getImageData(0, 0, canvas.width, canvas.height)])
  }, [])

  function getPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  function saveHistory() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    setHistory(items => [...items.slice(-14), context.getImageData(0, 0, canvas.width, canvas.height)])
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (submitted) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drawing.current = true
    lastPoint.current = getPoint(event)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || submitted) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    const previous = lastPoint.current
    if (!canvas || !context || !previous) return

    const next = getPoint(event)
    context.strokeStyle = color
    context.lineWidth = size
    context.beginPath()
    context.moveTo(previous.x, previous.y)
    context.lineTo(next.x, next.y)
    context.stroke()
    lastPoint.current = next
  }

  function handlePointerUp() {
    if (!drawing.current) return
    drawing.current = false
    lastPoint.current = null
    saveHistory()
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || submitted) return
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    saveHistory()
  }

  function undo() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context || history.length <= 1 || submitted) return
    const nextHistory = history.slice(0, -1)
    const previous = nextHistory[nextHistory.length - 1]
    context.putImageData(previous, 0, 0)
    setHistory(nextHistory)
  }

  function submit() {
    const canvas = canvasRef.current
    if (!canvas || submitted) return
    onSubmit(canvas.toDataURL('image/jpeg', 0.72))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="game-card text-center" style={{ border: '2px solid rgba(56,189,248,0.45)' }}>
        <p className="text-text-muted font-body text-xs uppercase tracking-wider mb-1">Draw this prompt</p>
        <p className="font-body text-text-primary text-xl font-semibold leading-relaxed">{promptText}</p>
      </div>

      <div className="rounded-2xl bg-white p-2 shadow-xl">
        <canvas
          ref={canvasRef}
          width={640}
          height={420}
          className="w-full rounded-xl touch-none"
          style={{ aspectRatio: '64 / 42', cursor: submitted ? 'default' : 'crosshair' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {COLORS.map(value => (
              <button
                key={value}
                type="button"
                aria-label={`Color ${value}`}
                className="h-8 w-8 rounded-full border-2"
                style={{ background: value, borderColor: color === value ? '#ffffff' : 'rgba(255,255,255,0.25)' }}
                onClick={() => setColor(value)}
                disabled={submitted}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {SIZES.map(value => (
            <button
              key={value}
              type="button"
              className="flex-1 rounded-xl px-3 py-2 font-display"
              style={{
                background: size === value ? '#38bdf8' : 'rgba(255,255,255,0.1)',
                color: size === value ? '#0f172a' : '#f8fafc',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
              onClick={() => setSize(value)}
              disabled={submitted}
            >
              {value === 4 ? 'Thin' : value === 8 ? 'Med' : 'Thick'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            className="rounded-xl px-3 py-3 font-display"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)' }}
            type="button"
            onClick={undo}
            disabled={submitted}
          >
            Undo
          </button>
          <button
            className="rounded-xl px-3 py-3 font-display"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.2)' }}
            type="button"
            onClick={clearCanvas}
            disabled={submitted}
          >
            Clear
          </button>
          <motion.button
            whileTap={!submitted ? { scale: 0.96 } : {}}
            className="btn-primary"
            type="button"
            onClick={submit}
            disabled={submitted}
          >
            {submitted ? 'Sent' : 'Submit'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
