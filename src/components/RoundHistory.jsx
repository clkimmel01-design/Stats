import { useAuth } from '../context/AuthContext.jsx'
import { deleteRoundFS } from '../utils/firestoreRounds.js'
import { summarizeRoundSG } from '../utils/sgCalculator.js'

function fmt(val) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return (val >= 0 ? '+' : '') + val.toFixed(2)
}

export default function RoundHistory({ rounds, loading, onBack, onViewRound, onRoundsChange }) {
  const { user, logOut } = useAuth()

  async function handleDelete(id, e) {
    e.stopPropagation()
    if (!window.confirm('Delete this round?')) return
    await deleteRoundFS(id)
    onRoundsChange()
  }

  return (
    <div className="round-history">
      <div className="app-header">
        <button type="button" className="btn-text" onClick={onBack}>← Back</button>
        <h1>History</h1>
        <button type="button" className="btn-text" onClick={logOut}>Sign out</button>
      </div>

      {user && (
        <div className="user-bar">
          <img src={user.photoURL} alt="" className="user-avatar" />
          <span className="user-name">{user.displayName}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-screen"><div className="loading-spinner" /></div>
      ) : rounds.length === 0 ? (
        <div className="empty-state">No rounds yet. Start a new round to begin tracking.</div>
      ) : (
        rounds.map(round => {
          const sg         = summarizeRoundSG(round.holes)
          const totalScore = round.holes.reduce((s, h) => s + (h.score || 0), 0)
          const totalPar   = round.holes.reduce((s, h) => s + (h.par   || 0), 0)
          const diff       = totalScore - totalPar
          return (
            <div
              key={round.id}
              className="history-card card"
              onClick={() => onViewRound(round)}
            >
              <div className="history-row">
                <div>
                  <div className="history-course">{round.courseName}</div>
                  <div className="history-date">{round.date}{round.tees ? ` · ${round.tees}` : ''}</div>
                </div>
                <div className="history-score">
                  {totalScore} <span className="to-par">{diff >= 0 ? '+' : ''}{diff}</span>
                </div>
              </div>
              <div className="history-sg">
                <span>OTT {fmt(sg.offTheTee)}</span>
                <span>APP {fmt(sg.approach)}</span>
                <span>ATG {fmt(sg.aroundTheGreen)}</span>
                <span>PUT {fmt(sg.putting)}</span>
              </div>
              <button
                type="button"
                className="btn-delete"
                onClick={e => handleDelete(round.id, e)}
              >Delete</button>
            </div>
          )
        })
      )}
    </div>
  )
}
