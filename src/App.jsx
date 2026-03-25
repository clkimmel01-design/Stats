import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext.jsx'
import Login from './components/Login.jsx'
import RoundSetup from './components/RoundSetup.jsx'
import HoleEntry from './components/HoleEntry.jsx'
import RoundSummary from './components/RoundSummary.jsx'
import RoundHistory from './components/RoundHistory.jsx'
import Dashboard from './components/Dashboard.jsx'
import { saveRoundFS, getRoundsFS, migrateLocalRounds } from './utils/firestoreRounds.js'
import { getRounds as getLocalRounds } from './utils/storage.js'

// Top-level view states
// 'setup'     → new round setup screen
// 'holes'     → hole-by-hole entry
// 'summary'   → post-round summary
// 'history'   → past rounds list
// 'view'      → view a past round's summary
// 'dashboard' → stats dashboard

export default function App() {
  const { user, loading } = useAuth()
  const [view, setView]                   = useState('setup')
  const [activeRound, setActiveRound]     = useState(null)
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0)
  const [viewingRound, setViewingRound]   = useState(null)
  const [rounds, setRounds]               = useState([])
  const [roundsLoading, setRoundsLoading] = useState(false)
  const [migrated, setMigrated]           = useState(false)

  // Load rounds from Firestore whenever the user changes
  useEffect(() => {
    if (!user) {
      setRounds([])
      return
    }
    loadRounds()
  }, [user])

  // On first login, migrate any localStorage rounds to Firestore (once per session)
  useEffect(() => {
    if (!user || migrated) return
    const localRounds = getLocalRounds()
    if (localRounds.length === 0) {
      setMigrated(true)
      return
    }
    migrateLocalRounds(localRounds, user.uid)
      .then(() => {
        setMigrated(true)
        // Clear localStorage after migration
        localStorage.removeItem('stats_rounds')
        loadRounds()
      })
      .catch(() => setMigrated(true)) // silently skip on error
  }, [user])

  async function loadRounds() {
    setRoundsLoading(true)
    try {
      const fetched = await getRoundsFS(user.uid)
      setRounds(fetched)
    } finally {
      setRoundsLoading(false)
    }
  }

  // Called by RoundSetup when user taps Start Round
  function handleStart(round) {
    setActiveRound(round)
    setCurrentHoleIndex(0)
    setView('holes')
  }

  // Called by HoleEntry on every field change — auto-saves to Firestore
  async function handleHoleChange(updatedHole) {
    const holes = [...activeRound.holes]
    holes[currentHoleIndex] = updatedHole
    const updatedRound = { ...activeRound, holes }
    setActiveRound(updatedRound)
    if (user) {
      await saveRoundFS(updatedRound, user.uid)
    }
  }

  function handleNextHole() {
    if (currentHoleIndex < activeRound.holes.length - 1) {
      setCurrentHoleIndex(currentHoleIndex + 1)
    }
  }

  function handlePrevHole() {
    if (currentHoleIndex > 0) {
      setCurrentHoleIndex(currentHoleIndex - 1)
    }
  }

  async function handleFinish() {
    if (user) await saveRoundFS(activeRound, user.uid)
    await loadRounds()
    setView('summary')
  }

  function handleNewRound() {
    setActiveRound(null)
    setCurrentHoleIndex(0)
    setView('setup')
  }

  // Show loading spinner while Firebase auth initializes
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    )
  }

  // Not signed in — show login
  if (!user) {
    return <Login />
  }

  if (view === 'setup') {
    return (
      <RoundSetup
        onStart={handleStart}
        onViewHistory={() => setView('history')}
        onViewDashboard={() => setView('dashboard')}
      />
    )
  }

  if (view === 'holes' && activeRound) {
    const hole    = activeRound.holes[currentHoleIndex]
    const isFirst = currentHoleIndex === 0
    const isLast  = currentHoleIndex === activeRound.holes.length - 1
    return (
      <HoleEntry
        hole={hole}
        onChange={handleHoleChange}
        onNext={handleNextHole}
        onPrev={handlePrevHole}
        isFirst={isFirst}
        isLast={isLast}
        onFinish={handleFinish}
      />
    )
  }

  if (view === 'summary' && activeRound) {
    return (
      <RoundSummary
        round={activeRound}
        onNewRound={handleNewRound}
        onViewHistory={() => setView('history')}
      />
    )
  }

  if (view === 'history') {
    return (
      <RoundHistory
        rounds={rounds}
        loading={roundsLoading}
        onBack={() => setView('setup')}
        onViewRound={round => { setViewingRound(round); setView('view') }}
        onRoundsChange={loadRounds}
      />
    )
  }

  if (view === 'view' && viewingRound) {
    return (
      <RoundSummary
        round={viewingRound}
        onNewRound={handleNewRound}
        onViewHistory={() => setView('history')}
      />
    )
  }

  if (view === 'dashboard') {
    return (
      <Dashboard
        rounds={rounds}
        loading={roundsLoading}
        onBack={() => setView('setup')}
      />
    )
  }

  return null
}
