import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MobileHomePage from './pages/MobileHomePage'
import HostLobbyPage from './pages/HostLobbyPage'
import HostGamePage from './pages/HostGamePage'
import JoinPage from './pages/JoinPage'
import PlayerLobbyPage from './pages/PlayerLobbyPage'
import PlayerGamePage from './pages/PlayerGamePage'
import NotFoundPage from './pages/NotFoundPage'
import FeedbackPage from './pages/FeedbackPage'
import PWAInstallBanner from './components/shared/PWAInstallBanner'
import AndroidAppBanner from './components/shared/AndroidAppBanner'

const isCapacitor = !!(window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
const isMobileViewport = window.innerWidth < 768

function HomeRoute() {
  return isCapacitor || isMobileViewport ? <MobileHomePage /> : <HomePage />
}

export default function App() {
  return (
    <HashRouter>
      <PWAInstallBanner />
      <AndroidAppBanner />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/host" element={<HostLobbyPage />} />
        <Route path="/host/game" element={<HostGamePage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/play" element={<PlayerLobbyPage />} />
        <Route path="/play/game" element={<PlayerGamePage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  )
}
