import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { summarizeRoundSG } from '../utils/sgCalculator.js'

// Build per-round data sorted oldest → newest, capped at last 20 rounds
function buildChartData(rounds) {
  const sorted = [...rounds].sort((a, b) => new Date(a.date) - new Date(b.date))
  const last20 = sorted.slice(-20)

  return last20.map((r, i) => {
    const holes  = r.holes || []
    const scale  = holes.length <= 9 ? 2 : 1
    const score  = holes.reduce((s, h) => s + (h.score || 0), 0) * scale
    const sg     = summarizeRoundSG(holes)
    const d      = new Date(r.date)
    const label  = `${d.getMonth() + 1}/${d.getDate()}`

    return {
      label,
      round: i + 1,
      score: score || null,
      offTheTee:      parseFloat(sg.offTheTee.toFixed(2)),
      approach:       parseFloat(sg.approach.toFixed(2)),
      aroundTheGreen: parseFloat(sg.aroundTheGreen.toFixed(2)),
      putting:        parseFloat(sg.putting.toFixed(2)),
    }
  })
}

const SG_LINES = [
  { key: 'offTheTee',      label: 'Off the Tee',       color: '#3b82f6' },
  { key: 'approach',       label: 'Approach',          color: '#f59e0b' },
  { key: 'aroundTheGreen', label: 'Around the Green',  color: '#8b5cf6' },
  { key: 'putting',        label: 'Putting',           color: '#ec4899' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="chart-tooltip-row" style={{ color: p.color }}>
          <span>{p.name}</span>
          <span>{p.value > 0 ? '+' : ''}{p.value}</span>
        </div>
      ))}
    </div>
  )
}

function ScoreTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="chart-tooltip-row" style={{ color: p.color }}>
          <span>Score</span>
          <span>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Trends({ rounds = [], loading = false, onBack }) {
  if (loading) {
    return (
      <div className="dashboard">
        <div className="app-header">
          <button type="button" className="btn-text" onClick={onBack}>← Back</button>
          <h1>Trends</h1>
          <span />
        </div>
        <div className="loading-screen"><div className="loading-spinner" /></div>
      </div>
    )
  }

  const data = buildChartData(rounds)

  return (
    <div className="dashboard">
      <div className="app-header">
        <button type="button" className="btn-text" onClick={onBack}>← Back</button>
        <h1>Trends</h1>
        <span />
      </div>

      {data.length < 2 ? (
        <div className="empty-state">
          Complete at least 2 rounds to see trend charts.
        </div>
      ) : (
        <>
          {/* Scoring trend */}
          <div className="card trends-card">
            <div className="trends-title">Scoring Trend</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  domain={['auto', 'auto']}
                  tickCount={5}
                />
                <Tooltip content={<ScoreTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Score"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#22c55e' }}
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* SG by category */}
          <div className="card trends-card">
            <div className="trends-title">Strokes Gained by Category</div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  domain={['auto', 'auto']}
                  tickCount={5}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(value) => <span style={{ color: '#d1d5db' }}>{value}</span>}
                />
                {SG_LINES.map(({ key, label, color }) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={label}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: color }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="trends-note">
            Showing last {data.length} round{data.length !== 1 ? 's' : ''}.
            Scores scaled to 18-hole equivalents.
          </div>
        </>
      )}
    </div>
  )
}
