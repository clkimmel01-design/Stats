import { CLUBS, SHOT_END_LIES } from '../data/constants.js'

export default function ShotEntry({ shot, onChange, onRemove }) {
  function update(field, value) {
    onChange({ ...shot, [field]: value })
  }

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
        <label>Distance (yds)</label>
        <input
          type="number"
          inputMode="numeric"
          value={shot.startYards || ''}
          onChange={e => update('startYards', e.target.value)}
          placeholder="e.g. 150"
        />
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
          <label>Feet to pin</label>
          <input
            type="number"
            inputMode="numeric"
            value={shot.endFeet || ''}
            onChange={e => update('endFeet', e.target.value)}
            placeholder="e.g. 18"
          />
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
