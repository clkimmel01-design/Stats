import { computeStats } from '../utils/statsEngine.js'
import { BENCHMARKS, DASHBOARD_SECTIONS, SCORING_RANGES } from '../data/benchmarks.js'

// ── formatters ────────────────────────────────────────────────────────────

function formatValue(value, fmt) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  switch (fmt) {
    case 'pct':   return value.toFixed(0) + '%'
    case 'dec1':  return value.toFixed(1)
    case 'dec2':  return value.toFixed(2)
    case 'sg':    return (value >= 0 ? '+' : '') + value.toFixed(2)
    default:      return value.toFixed(1)
  }
}

// Is a higher value better for this stat?
function higherIsBetter(key) {
  const lowerBetter = ['scoringAvg', 'par3Avg', 'par4Avg', 'par5Avg', 'bogeys', 'doublesPlus',
    'puttsPerRound', 'threePuttPct510', 'threePuttPct1020', 'threePuttPct2030', 'threePuttPct30plus',
    'scoringFromFairway', 'scoringFromRough']
  return !lowerBetter.includes(key)
}

// Compare player value to benchmark — returns 'good', 'bad', or 'neutral'
function compareToRange(playerVal, benchVal, key) {
  if (playerVal === null || playerVal === undefined || isNaN(playerVal)) return 'neutral'
  if (benchVal === null || benchVal === undefined) return 'neutral'
  const diff = playerVal - benchVal
  const threshold = 0.5  // tiny buffer so equal-ish values show neutral
  if (higherIsBetter(key)) {
    if (diff > threshold) return 'good'
    if (diff < -threshold) return 'bad'
  } else {
    if (diff < -threshold) return 'good'
    if (diff > threshold) return 'bad'
  }
  return 'neutral'
}

// ── component ─────────────────────────────────────────────────────────────

export default function Dashboard({ rounds = [], loading = false, onBack }) {
  const stats = computeStats(rounds)

  const playerRange = stats?.playerRange || null

  return (
    <div className="dashboard">
      <div className="app-header">
        <button type="button" className="btn-text" onClick={onBack}>← Back</button>
        <h1>Dashboard</h1>
        <span />
      </div>

      {loading ? (
        <div className="loading-screen"><div className="loading-spinner" /></div>
      ) : !stats ? (
        <div className="empty-state">
          No rounds yet. Complete at least one round to see your stats.
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="card db-summary">
            <div className="db-summary-item">
              <span className="db-summary-label">Rounds</span>
              <span className="db-summary-value">{stats.totalRounds}</span>
            </div>
            <div className="db-summary-item">
              <span className="db-summary-label">Avg Score</span>
              <span className="db-summary-value">
                {stats.scoringAvg ? stats.scoringAvg.toFixed(1) : '—'}
              </span>
            </div>
            <div className="db-summary-item">
              <span className="db-summary-label">Scoring Range</span>
              <span className="db-summary-value range-chip">{playerRange || '—'}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="db-legend">
            <span className="legend-you">YOU</span> = your stats vs benchmarks&nbsp;
            <span className="legend-good">green</span> = above benchmark&nbsp;
            <span className="legend-bad">red</span> = below
          </div>

          {/* Sections */}
          {DASHBOARD_SECTIONS.map(section => (
            <div key={section.title} className="db-section">
              <div className="section-label">{section.title}</div>
              <div className="db-table-wrap">
                <table className="db-table">
                  <thead>
                    <tr>
                      <th className="db-col-stat">Stat</th>
                      <th className="db-col-you">YOU</th>
                      {SCORING_RANGES.map(r => (
                        <th
                          key={r}
                          className={`db-col-range ${r === playerRange ? 'your-range' : ''}`}
                        >{r}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.keys.map(key => {
                      const bench = BENCHMARKS[key]
                      if (!bench) return null
                      const playerVal = stats[key]
                      const fmt = bench.fmt

                      return (
                        <tr key={key}>
                          <td className="db-col-stat">{bench.label}</td>
                          <td className={`db-col-you ${
                            playerRange
                              ? compareToRange(playerVal, bench[playerRange], key)
                              : ''
                          }`}>
                            {formatValue(playerVal, fmt)}
                          </td>
                          {SCORING_RANGES.map(r => (
                            <td
                              key={r}
                              className={`db-col-range ${r === playerRange ? 'your-range' : ''}`}
                            >
                              {formatValue(bench[r], fmt)}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
