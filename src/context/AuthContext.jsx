import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged, signInWithPopup, signInWithRedirect,
  getRedirectResult, signOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase.js'
import { saveUserFS } from '../utils/firestoreRounds.js'

const AuthContext = createContext(null)

function isSafari() {
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome/.test(ua)
}

// Wraps the whole app. Any component can call useAuth() to get the current user.
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(undefined) // undefined = still loading
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    // Handle redirect result when returning from Google sign-in on Safari
    getRedirectResult(auth).catch(() => {})

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
      if (firebaseUser) {
        saveUserFS(firebaseUser).catch(() => {}) // best-effort — don't block auth
      }
    })
    return unsub
  }, [])

  async function signInWithGoogle() {
    setAuthError('')
    try {
      if (isSafari()) {
        await signInWithRedirect(auth, googleProvider)
      } else {
        await signInWithPopup(auth, googleProvider)
      }
    } catch (e) {
      setAuthError(e.code || e.message || 'Sign-in failed')
    }
  }

  async function logOut() {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logOut, authError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
