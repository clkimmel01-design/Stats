import { MISS_DIRECTIONS } from '../data/constants.js'

export default function PuttEntry({ putt, onChange, onRemove, displayNumber }) {
  function update(field, value) {
    onChange({ ...putt, [field]: value })
  }

  return (
    <div className="shot-entry putt-entry">
      <div className="shot-header">
        <span className="shot-label">Shot {displayNumber}</span>
        <button className="btn-remove" onClick={onRemove} type="button">Remove</button>
      </div>

      <div className="field-row">
        <label>Distance (ft)</label>
        <input
          type="number"
          inputMode="numeric"
          value={putt.startFeet || ''}
          onChange={e => update('startFeet', e.target.value)}
          placeholder="e.g. 12"
        />
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
