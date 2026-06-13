import { useNavigate } from 'react-router-dom'
import PhoneLayout from '../components/layout/PhoneLayout'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <PhoneLayout centered>
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="text-8xl">🕹️</div>
        <h1 className="font-display text-neon-purple text-4xl">Lost?</h1>
        <p className="text-text-muted font-body text-lg">This page doesn't exist.</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Go Home
        </button>
      </div>
    </PhoneLayout>
  )
}
