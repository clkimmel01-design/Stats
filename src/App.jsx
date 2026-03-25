import { useState } from 'react'
import RoundSetup from './components/RoundSetup.jsx'
import HoleEntry from './components/HoleEntry.jsx'
import RoundSummary from './components/RoundSummary.jsx'
import RoundHistory from './components/RoundHistory.jsx'
import Dashboard from './components/Dashboard.jsx'
import { saveRound } from './utils/storage.js'

// Top-level view states
// 'setup'     → new round setup screen
// 'holes'     → hole-by-hole entry
// 'summary'   → post-round summary
// 'history'   → past rounds list
// 'view'      → view a past round's summary
// 'dashboard' → stats dashboard

export default function App() {
  const [view, setView] = useState('setup')
  const [activeRound, setActiveRound] = useState(null)
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0)
  const [viewingRound, setViewingRound] = useState(null)

  // Called by RoundSetup when user taps Start Round
  function handleStart(round) {
    setActiveRound(round)
    setCurrentHoleIndex(0)
    setView('holes')
  }

  // Called by HoleEntry when any field on the current hole changes
  function handleHoleChange(updatedHole) {
    const holes = [...activeRound.holes]
    holes[currentHoleIndex] = updatedHole
    const updatedRound = { ...activeRound, holes }
    setActiveRound(updatedRound)
    saveRound(updatedRound)  // auto-save on every change
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

  function handleFinish() {
    saveRound(activeRound)
    setView('summary')
  }

  function handleNewRound() {
    setActiveRound(null)
    setCurrentHoleIndex(0)
    setView('setup')
  }

  function handleViewHistory() {
    setView('history')
  }

  function handleViewDashboard() {
    setView('dashboard')
  }

  function handleViewRound(round) {
    setViewingRound(round)
    setView('view')
  }

  if (view === 'setup') {
    return <RoundSetup onStart={handleStart} onViewHistory={handleViewHistory} onViewDashboard={handleViewDashboard} />
  }

  if (view === 'holes' && activeRound) {
    const hole = activeRound.holes[currentHoleIndex]
    const isFirst = currentHoleIndex === 0
    const isLast = currentHoleIndex === activeRound.holes.length - 1
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
        onViewHistory={handleViewHistory}
      />
    )
  }

  if (view === 'history') {
    return (
      <RoundHistory
        onBack={() => setView('setup')}
        onViewRound={handleViewRound}
      />
    )
  }

  if (view === 'view' && viewingRound) {
    return (
      <RoundSummary
        round={viewingRound}
        onNewRound={handleNewRound}
        onViewHistory={handleViewHistory}
      />
    )
  }

  if (view === 'dashboard') {
    return <Dashboard onBack={() => setView('setup')} />
  }

  return null
}
