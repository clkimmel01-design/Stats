import ShotEntry from './ShotEntry.jsx'
import PuttEntry from './PuttEntry.jsx'
import { TEE_SHOT_CLUBS, TEE_SHOT_END_LIES, yardsToDistanceBin, feetToPuttBin } from '../data/constants.js'
import { createShot } from '../utils/storage.js'
import { calculateShotSG, getSGCategory } from '../utils/sgCalculator.js'
import { LIE_TO_KEY } from '../data/constants.js'

export default function HoleEntry({ hole, onChange, onNext, onPrev, isFirst, isLast, onFinish }) {
  function updateHole(field, value) {
    onChange({ ...hole, [field]: value })
  }

  // ── Tee shot ────────────────────────────────────────────────────────────
  function updateTeeShot(field, value) {
    const teeShot = { ...(hole.shots[0] || createShot({ shotNumber: 1 })), [field]: value }
    teeShot.startLie = 'Tee'
    teeShot.category = 'offTheTee'
    const shots = [teeShot, ...hole.shots.slice(1)]
    onChange({ ...hole, shots })
  }

  function getTeeShot() {
    return hole.shots[0] || { club: '', endLie: '' }
  }

  // ── Approach / ATG shots (shot 2+, non-putting) ─────────────────────────
  const approachShots = hole.shots.filter(s => s.category !== 'putting' && s.shotNumber > 1)
  const putts         = hole.shots.filter(s => s.category === 'putting')

  function addApproachShot() {
    // Always shot 2+ — count existing approach shots and add 1
    const shotNumber = approachShots.length + 2

    // Auto-fill startLie from the last non-putt shot's endLie
    const lastNonPutt = [...hole.shots.filter(s => s.category !== 'putting')].pop()
    const newShot = createShot({ shotNumber })
    if (lastNonPutt?.endLie && lastNonPutt.endLie !== 'Holed') {
      newShot.startLie = lastNonPutt.endLie
    }

    onChange({ ...hole, shots: [...hole.shots, newShot] })
  }

  function updateApproachShot(index, updatedShot) {
    // Derive distance bin from raw yards input
    if (updatedShot.startYards) {
      updatedShot.startDistanceBin = yardsToDistanceBin(updatedShot.startYards)
    }
    // Derive end distance bin from raw feet when ending on green
    if (updatedShot.endFeet && updatedShot.endLie === 'Green') {
      updatedShot.endDistanceBin = feetToPuttBin(updatedShot.endFeet)
    }

    // Recalculate SG
    const lieKey    = LIE_TO_KEY[updatedShot.startLie] || updatedShot.startLie?.toLowerCase()
    const endLieKey = LIE_TO_KEY[updatedShot.endLie]   || updatedShot.endLie?.toLowerCase()
    const isHoled   = updatedShot.endLie === 'Holed'
    updatedShot.sgCalculated = calculateShotSG({
      startLie:        lieKey,
      startDistanceBin: updatedShot.startDistanceBin,
      endLie:          isHoled ? 'holed' : endLieKey,
      endDistanceBin:  updatedShot.endDistanceBin,
      isHoled,
    })
    updatedShot.category = getSGCategory(hole.par, updatedShot.shotNumber, updatedShot.startLie, updatedShot.startDistanceBin)

    // FIX: rebuild using approachShots array directly — do NOT use allNonPutts[index]
    // because index is relative to approachShots (shots 2+), not hole.shots
    const teeArr = hole.shots.filter(s => s.shotNumber === 1)
    const newApproach = [...approachShots]
    newApproach[index] = updatedShot
    onChange({ ...hole, shots: [...teeArr, ...newApproach, ...putts] })
  }

  function removeApproachShot(index) {
    // FIX: same as above — use approachShots directly so we never touch the tee shot
    const teeArr = hole.shots.filter(s => s.shotNumber === 1)
    const newApproach = [...approachShots]
    newApproach.splice(index, 1)
    newApproach.forEach((s, i) => { s.shotNumber = i + 2 })
    onChange({ ...hole, shots: [...teeArr, ...newApproach, ...putts] })
  }

  // ── Putts ────────────────────────────────────────────────────────────────
  // Non-putt count used to compute each putt's absolute shot number for display
  const nonPuttCount = Math.max(1, hole.shots.filter(s => s.category !== 'putting').length)

  function addPutt() {
    const newPutt = createShot({ shotNumber: nonPuttCount + putts.length + 1 })
    newPutt.category = 'putting'
    newPutt.startLie = 'Green'
    onChange({ ...hole, shots: [...hole.shots.filter(s => s.category !== 'putting'), newPutt] })
  }

  function updatePutt(index, updatedPutt) {
    // Derive bin from raw feet input
    if (updatedPutt.startFeet) {
      updatedPutt.startDistanceBin = feetToPuttBin(updatedPutt.startFeet)
    }
    const isHoled = updatedPutt.puttResult === 'made'
    updatedPutt.sgCalculated = calculateShotSG({
      startLie:         'green',
      startDistanceBin:  updatedPutt.startDistanceBin,
      endLie:           isHoled ? 'holed' : 'green',
      endDistanceBin:   isHoled ? null : '<4ft',
      isHoled,
    })
    updatedPutt.category = 'putting'

    const newPutts = [...putts]
    newPutts[index] = updatedPutt
    newPutts.forEach((p, i) => { p.shotNumber = nonPuttCount + i + 1 })
    onChange({ ...hole, shots: [...hole.shots.filter(s => s.category !== 'putting'), ...newPutts] })
  }

  function removePutt(index) {
    const newPutts = [...putts]
    newPutts.splice(index, 1)
    newPutts.forEach((p, i) => { p.shotNumber = nonPuttCount + i + 1 })
    onChange({ ...hole, shots: [...hole.shots.filter(s => s.category !== 'putting'), ...newPutts] })
  }

  const teeShot = getTeeShot()

  return (
    <div className="hole-entry">
      {/* Hole header */}
      <div className="hole-header">
        <div className="hole-nav">
          <button type="button" className="btn-nav" onClick={onPrev} disabled={isFirst}>&#8592;</button>
          <span className="hole-title">Hole {hole.holeNumber}</span>
          <button type="button" className="btn-nav" onClick={onNext} disabled={isLast && !isLast}>&#8594;</button>
        </div>
      </div>

      {/* Hole info */}
      <div className="card">
        <div className="field-row">
          <label>Par</label>
          <div className="toggle-row">
            {[3, 4, 5].map(p => (
              <button
                key={p}
                type="button"
                className={`toggle-btn ${hole.par === p ? 'active' : ''}`}
                onClick={() => updateHole('par', p)}
              >{p}</button>
            ))}
          </div>
        </div>

        <div className="field-row">
          <label>Yardage</label>
          <input
            type="number"
            inputMode="numeric"
            value={hole.yardage || ''}
            onChange={e => updateHole('yardage', parseInt(e.target.value) || 0)}
            placeholder="e.g. 385"
          />
        </div>

        <div className="field-row">
          <label>Score</label>
          <input
            type="number"
            inputMode="numeric"
            value={hole.score || ''}
            onChange={e => updateHole('score', parseInt(e.target.value) || 0)}
            placeholder={`e.g. ${hole.par}`}
          />
        </div>

        <div className="field-row">
          <label>Mental score</label>
          <div className="toggle-row">
            <button
              type="button"
              className={`toggle-btn ${hole.mentalScore === 1 ? 'active' : ''}`}
              onClick={() => updateHole('mentalScore', 1)}
            >Committed (1)</button>
            <button
              type="button"
              className={`toggle-btn ${hole.mentalScore === 0 ? 'active' : ''}`}
              onClick={() => updateHole('mentalScore', 0)}
            >Not committed (0)</button>
          </div>
        </div>
      </div>

      {/* Tee shot — always shot 1 */}
      <div className="section-label">Tee Shot</div>
      <div className="card">
        <div className="field-row">
          <label>Club</label>
          <select value={teeShot.club} onChange={e => updateTeeShot('club', e.target.value)}>
            <option value="">Select club</option>
            {TEE_SHOT_CLUBS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field-row">
          <label>It finished</label>
          <select value={teeShot.endLie} onChange={e => updateTeeShot('endLie', e.target.value)}>
            <option value="">Select result</option>
            {TEE_SHOT_END_LIES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Approach / Around the Green shots */}
      {approachShots.length > 0 && (
        <>
          <div className="section-label">Approach / Around the Green</div>
          {approachShots.map((shot, i) => (
            <div className="card" key={i}>
              <ShotEntry
                shot={shot}
                onChange={updated => updateApproachShot(i, updated)}
                onRemove={() => removeApproachShot(i)}
              />
            </div>
          ))}
        </>
      )}

      <button type="button" className="btn-add" onClick={addApproachShot}>
        + Add Approach / ATG Shot
      </button>

      {/* Putting section */}
      <div className="section-label">Putting</div>
      {putts.length > 0 && (
        <>
          {putts.map((putt, i) => (
            <div className="card" key={i}>
              <PuttEntry
                putt={putt}
                displayNumber={nonPuttCount + i + 1}
                onChange={updated => updatePutt(i, updated)}
                onRemove={() => removePutt(i)}
              />
            </div>
          ))}
        </>
      )}

      <button type="button" className="btn-add" onClick={addPutt}>
        + Add Putt
      </button>

      {/* Navigation */}
      <div className="hole-footer">
        {!isFirst && (
          <button type="button" className="btn-secondary" onClick={onPrev}>
            ← Prev Hole
          </button>
        )}
        {!isLast ? (
          <button type="button" className="btn-primary" onClick={onNext}>
            Next Hole →
          </button>
        ) : (
          <button type="button" className="btn-finish" onClick={onFinish}>
            Finish Round
          </button>
        )}
      </div>
    </div>
  )
}
