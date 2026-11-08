// Firebase web config, read from Vite env variables (see .env.example).
// These values are public identifiers, not secrets, but keeping them in env
// lets each environment point at its own Firebase project.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const missing = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

if (missing.length) {
  console.error(`Firebase config is missing: ${missing.join(', ')}. Set the VITE_FIREBASE_* variables in your .env file.`)
}
