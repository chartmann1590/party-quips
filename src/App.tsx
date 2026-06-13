import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import HostLobbyPage from './pages/HostLobbyPage'
import HostGamePage from './pages/HostGamePage'
import JoinPage from './pages/JoinPage'
import PlayerLobbyPage from './pages/PlayerLobbyPage'
import PlayerGamePage from './pages/PlayerGamePage'
import NotFoundPage from './pages/NotFoundPage'
import PWAInstallBanner from './components/shared/PWAInstallBanner'
import AndroidAppBanner from './components/shared/AndroidAppBanner'

export default function App() {
  return (
    <HashRouter>
      <PWAInstallBanner />
      <AndroidAppBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/host" element={<HostLobbyPage />} />
        <Route path="/host/game" element={<HostGamePage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/play" element={<PlayerLobbyPage />} />
        <Route path="/play/game" element={<PlayerGamePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  )
}
