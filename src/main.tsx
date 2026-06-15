import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import { ensureAuthenticated } from './firebase/auth'
import { handleGoogleRedirectResult } from './firebase/stripeAuth'

async function bootAuth() {
  await handleGoogleRedirectResult()
  await ensureAuthenticated()
}

bootAuth().catch(console.error)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
