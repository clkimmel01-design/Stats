import { useState } from 'react'
import { createRound, createHole } from '../utils/storage.js'

// RoundSetup: screen shown before entering hole data.
// User picks course name, tees, number of holes, and par for each hole.
// Props:
//   onStart(round): called with a new round object ready for hole entry
//   onViewHistory(): navigate to round history list
export default function RoundSetup({ onStart, onViewHistory, onViewDashboard, onViewTrends }) {
  const [courseName, setCourseName] = useState('')
  const [tees, setTees] = useState('')
  const [numHoles, setNumHoles] = useState(18)
  const [notes, setNotes] = useState('')

  function handleStart() {
    const round = createRound({ courseName, tees, notes })
    // Pre-populate holes with default par 4
    round.holes = Array.from({ length: numHoles }, (_, i) =>
      createHole({ holeNumber: i + 1, par: 4, yardage: 0 })
    )
    onStart(round)
  }

  return (
    <div className="round-setup">
      <div className="app-header">
        <h1>Stats</h1>
        <div className="header-nav">
          <button type="button" className="btn-text" onClick={onViewDashboard}>Dashboard</button>
          <button type="button" className="btn-text" onClick={onViewTrends}>Trends</button>
          <button type="button" className="btn-text" onClick={onViewHistory}>History</button>
        </div>
      </div>

      <div className="card">
        <h2>New Round</h2>

        <div className="field-row">
          <label>Course name</label>
          <input
            type="text"
            value={courseName}
            onChange={e => setCourseName(e.target.value)}
            placeholder="e.g. Pebble Beach"
          />
        </div>

        <div className="field-row">
          <label>Tees</label>
          <input
            type="text"
            value={tees}
            onChange={e => setTees(e.target.value)}
            placeholder="e.g. Blue, White..."
          />
        </div>

        <div className="field-row">
          <label>Holes</label>
          <div className="toggle-row">
            {[9, 18].map(n => (
              <button
                key={n}
                type="button"
                className={`toggle-btn ${numHoles === n ? 'active' : ''}`}
                onClick={() => setNumHoles(n)}
              >{n}</button>
            ))}
          </div>
        </div>

        <div className="field-row">
          <label>Notes</label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <button
          type="button"
          className="btn-primary full-width"
          onClick={handleStart}
          disabled={!courseName.trim()}
        >
          Start Round
        </button>
      </div>
    </div>
  )
}
