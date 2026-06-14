import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getAuth } from 'firebase/auth'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getPerformance } from 'firebase/performance'

const rawMeasurementId = import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
const measurementId =
  rawMeasurementId && rawMeasurementId !== 'G-XXXXXXXXXX' && rawMeasurementId !== 'undefined'
    ? rawMeasurementId
    : undefined

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  ...(measurementId ? { measurementId } : {}),
}

export const app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
export const auth = getAuth(app)

// Analytics and Performance are optional (not available in all environments)
export const analyticsPromise = measurementId
  ? isSupported().then(yes => yes ? getAnalytics(app) : null)
  : Promise.resolve(null)

if (typeof window !== 'undefined' && import.meta.env.PROD) {
  getPerformance(app)
}
