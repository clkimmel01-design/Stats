import { summarizeRoundSG } from '../utils/sgCalculator.js'

function fmt(val) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return (val >= 0 ? '+' : '') + val.toFixed(2)
}

function fmtNum(val, decimals = 1) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return val.toFixed(decimals)
}

export default function RoundSummary({ round, onNewRound, onViewHistory }) {
  const sg = summarizeRoundSG(round.holes)

  const totalShots = round.holes.reduce((sum, h) => sum + (h.score || 0), 0)
  const totalHoles = round.holes.length
  const scoringAvg = totalHoles > 0 ? totalShots / totalHoles : null

  // GIR: hole where a shot finished on Green with shots remaining <= par - 2
  const girHoles = round.holes.filter(h => {
    const nonPutts = h.shots.filter(s => s.category !== 'putting')
    return nonPutts.some(s => s.endLie === 'Green')
  })
  const girPct = totalHoles > 0 ? (girHoles.length / totalHoles) * 100 : null

  // Fairways hit (par 4 + par 5 only)
  const fwHoles = round.holes.filter(h => h.par === 4 || h.par === 5)
  const fwHit = fwHoles.filter(h => {
    const tee = h.shots.find(s => s.shotNumber === 1)
    return tee?.endLie === 'Fairway'
  })
  const fwPct = fwHoles.length > 0 ? (fwHit.length / fwHoles.length) * 100 : null

  // Putts per round
  const totalPutts = round.holes.reduce((sum, h) => sum + h.shots.filter(s => s.category === 'putting').length, 0)

  // 3-putt count
  const threePutts = round.holes.filter(h => h.shots.filter(s => s.category === 'putting').length >= 3).length

  // Score relative to par
  const totalPar = round.holes.reduce((sum, h) => sum + (h.par || 0), 0)
  const scoreToPar = totalShots - totalPar

  return (
    <div className="round-summary">
      <div className="app-header">
        <h1>Round Summary</h1>
      </div>

      <div className="card summary-card">
        <div className="summary-course">{round.courseName}</div>
        <div className="summary-date">{round.date}</div>
        <div className="summary-score">
          {totalShots} <span className="to-par">{scoreToPar >= 0 ? '+' : ''}{scoreToPar}</span>
        </div>
      </div>

      {/* SG Summary */}
      <div className="card">
        <h3>Strokes Gained</h3>
        <div className="sg-row">
          <span>Off the Tee</span>
          <span className={sg.offTheTee >= 0 ? 'positive' : 'negative'}>{fmt(sg.offTheTee)}</span>
        </div>
        <div className="sg-row">
          <span>Approach</span>
          <span className={sg.approach >= 0 ? 'positive' : 'negative'}>{fmt(sg.approach)}</span>
        </div>
        <div className="sg-row">
          <span>Around the Green</span>
          <span className={sg.aroundTheGreen >= 0 ? 'positive' : 'negative'}>{fmt(sg.aroundTheGreen)}</span>
        </div>
        <div className="sg-row">
          <span>Putting</span>
          <span className={sg.putting >= 0 ? 'positive' : 'negative'}>{fmt(sg.putting)}</span>
        </div>
        <div className="sg-row sg-total">
          <span>Total SG</span>
          <span className={sg.total >= 0 ? 'positive' : 'negative'}>{fmt(sg.total)}</span>
        </div>
      </div>

      {/* Scoring stats */}
      <div className="card">
        <h3>Scoring</h3>
        <div className="stat-row">
          <span>Total score</span>
          <span>{totalShots}</span>
        </div>
        <div className="stat-row">
          <span>Scoring avg / hole</span>
          <span>{fmtNum(scoringAvg)}</span>
        </div>
        <div className="stat-row">
          <span>GIR %</span>
          <span>{girPct !== null ? fmtNum(girPct) + '%' : '—'}</span>
        </div>
        <div className="stat-row">
          <span>Fairways hit %</span>
          <span>{fwPct !== null ? fmtNum(fwPct) + '%' : '—'}</span>
        </div>
        <div className="stat-row">
          <span>Total putts</span>
          <span>{totalPutts}</span>
        </div>
        <div className="stat-row">
          <span>3-putt holes</span>
          <span>{threePutts}</span>
        </div>
      </div>

      {/* Hole-by-hole */}
      <div className="card">
        <h3>Hole by Hole</h3>
        <table className="hole-table">
          <thead>
            <tr>
              <th>Hole</th>
              <th>Par</th>
              <th>Score</th>
              <th>+/-</th>
              <th>Putts</th>
            </tr>
          </thead>
          <tbody>
            {round.holes.map(h => {
              const diff = (h.score || 0) - (h.par || 0)
              const hPutts = h.shots.filter(s => s.category === 'putting').length
              return (
                <tr key={h.holeNumber} className={diff < 0 ? 'birdie' : diff === 0 ? 'par' : diff === 1 ? 'bogey' : 'double'}>
                  <td>{h.holeNumber}</td>
                  <td>{h.par}</td>
                  <td>{h.score || '—'}</td>
                  <td>{diff > 0 ? '+' : ''}{diff}</td>
                  <td>{hPutts || '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="summary-actions">
        <button type="button" className="btn-primary" onClick={onNewRound}>New Round</button>
        <button type="button" className="btn-secondary" onClick={onViewHistory}>View History</button>
      </div>
    </div>
  )
}
