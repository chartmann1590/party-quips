import QRCode from 'react-qr-code'

interface QRCodeDisplayProps {
  url: string
  size?: number
}

export default function QRCodeDisplay({ url, size = 140 }: QRCodeDisplayProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="rounded-2xl p-3 bg-white"
        style={{ boxShadow: '0 0 20px rgba(0,245,255,0.3)' }}
      >
        <QRCode value={url} size={size} />
      </div>
      <p className="text-text-muted font-body text-xs">Scan to join</p>
    </div>
  )
}
