import { ALL_PUTT_BINS, MISS_DIRECTIONS } from '../data/constants.js'

// PuttEntry handles a single putt within the putting section.
// Props:
//   putt: shot object (category='putting')
//   onChange(updatedPutt)
//   onRemove()
export default function PuttEntry({ putt, onChange, onRemove }) {
  function update(field, value) {
    onChange({ ...putt, [field]: value })
  }

  return (
    <div className="shot-entry putt-entry">
      <div className="shot-header">
        <span className="shot-label">Putt {putt.shotNumber}</span>
        <button className="btn-remove" onClick={onRemove} type="button">Remove</button>
      </div>

      <div className="field-row">
        <label>Distance</label>
        <select value={putt.startDistanceBin} onChange={e => update('startDistanceBin', e.target.value)}>
          <option value="">Select distance</option>
          {ALL_PUTT_BINS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div className="field-row">
        <label>Result</label>
        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-btn ${putt.puttResult === 'made' ? 'active' : ''}`}
            onClick={() => update('puttResult', 'made')}
          >Made</button>
          <button
            type="button"
            className={`toggle-btn ${putt.puttResult === 'missed' ? 'active' : ''}`}
            onClick={() => update('puttResult', 'missed')}
          >Missed</button>
        </div>
      </div>

      {putt.puttResult === 'missed' && (
        <div className="field-row">
          <label>Miss direction</label>
          <div className="toggle-row wrap">
            {MISS_DIRECTIONS.map(d => (
              <button
                key={d}
                type="button"
                className={`toggle-btn ${putt.missDirection === d.toLowerCase() ? 'active' : ''}`}
                onClick={() => update('missDirection', d.toLowerCase())}
              >{d}</button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
