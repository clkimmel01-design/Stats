import { CLUBS, APPROACH_DISTANCE_BINS, ATG_DISTANCE_BINS, SHOT_END_LIES } from '../data/constants.js'

// ShotEntry handles shots 2+ (approach and around the green shots, not putting).
// Props:
//   shot: shot object
//   onChange(updatedShot): callback
//   onRemove(): callback
export default function ShotEntry({ shot, onChange, onRemove }) {
  function update(field, value) {
    onChange({ ...shot, [field]: value })
  }

  const allDistanceBins = [...ATG_DISTANCE_BINS, ...APPROACH_DISTANCE_BINS]

  return (
    <div className="shot-entry">
      <div className="shot-header">
        <span className="shot-label">Shot {shot.shotNumber}</span>
        <button className="btn-remove" onClick={onRemove} type="button">Remove</button>
      </div>

      <div className="field-row">
        <label>Club</label>
        <select value={shot.club} onChange={e => update('club', e.target.value)}>
          <option value="">Select club</option>
          {CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="field-row">
        <label>Distance</label>
        <select value={shot.startDistanceBin} onChange={e => update('startDistanceBin', e.target.value)}>
          <option value="">Select distance</option>
          <optgroup label="Around the Green (under 50 yds)">
            {ATG_DISTANCE_BINS.map(b => <option key={b} value={b}>{b} yds</option>)}
          </optgroup>
          <optgroup label="Approach (50+ yds)">
            {APPROACH_DISTANCE_BINS.map(b => <option key={b} value={b}>{b} yds</option>)}
          </optgroup>
        </select>
      </div>

      <div className="field-row">
        <label>Started from</label>
        <select value={shot.startLie} onChange={e => update('startLie', e.target.value)}>
          <option value="">Select lie</option>
          {SHOT_END_LIES.filter(l => l !== 'Holed').map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="field-row">
        <label>It finished</label>
        <select value={shot.endLie} onChange={e => update('endLie', e.target.value)}>
          <option value="">Select result</option>
          {SHOT_END_LIES.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      {shot.endLie === 'Green' && (
        <div className="field-row">
          <label>Distance to pin</label>
          <select value={shot.endDistanceBin} onChange={e => update('endDistanceBin', e.target.value)}>
            <option value="">Select distance</option>
            {['<4ft', '4-8ft', '8-10ft', '10-15ft', '15-20ft', '20-25ft', '25ft+'].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
      )}

      <div className="field-row">
        <label>Intended target</label>
        <select value={shot.intendedTargetBin} onChange={e => update('intendedTargetBin', e.target.value)}>
          <option value="">Select target</option>
          {SHOT_END_LIES.filter(l => l !== 'Holed').map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="field-row">
        <label>Committed</label>
        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-btn ${shot.committed ? 'active' : ''}`}
            onClick={() => update('committed', true)}
          >Yes</button>
          <button
            type="button"
            className={`toggle-btn ${!shot.committed ? 'active' : ''}`}
            onClick={() => update('committed', false)}
          >No</button>
        </div>
      </div>
    </div>
  )
}
