import { useState } from 'react'
import ShotEntry from './ShotEntry.jsx'
import PuttEntry from './PuttEntry.jsx'
import { TEE_SHOT_CLUBS, TEE_SHOT_END_LIES } from '../data/constants.js'
import { createShot } from '../utils/storage.js'
import { calculateShotSG, getSGCategory } from '../utils/sgCalculator.js'
import { LIE_TO_KEY } from '../data/constants.js'

// HoleEntry is the main screen for entering all shots on one hole.
// Props:
//   hole: hole object
//   onChange(updatedHole): called whenever hole data changes
//   onNext(): move to next hole
//   onPrev(): move to previous hole
//   isFirst: bool
//   isLast: bool
//   onFinish(): called when user taps Finish Round on last hole
export default function HoleEntry({ hole, onChange, onNext, onPrev, isFirst, isLast, onFinish }) {
  function updateHole(field, value) {
    onChange({ ...hole, [field]: value })
  }

  // Update tee shot fields
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

  // Non-putting, non-tee shots (shots 2+, approach/ATG)
  const approachShots = hole.shots.filter(s => s.category !== 'putting' && s.shotNumber > 1)
  const putts = hole.shots.filter(s => s.category === 'putting')

  function addApproachShot() {
    const shotNumber = hole.shots.filter(s => s.category !== 'putting').length + 1
    const newShot = createShot({ shotNumber })
    const newShots = [...hole.shots, newShot]
    onChange({ ...hole, shots: newShots })
  }

  function updateApproachShot(index, updatedShot) {
    // Recalculate SG
    const lieKey = LIE_TO_KEY[updatedShot.startLie] || updatedShot.startLie?.toLowerCase()
    const endLieKey = LIE_TO_KEY[updatedShot.endLie] || updatedShot.endLie?.toLowerCase()
    const isHoled = updatedShot.endLie === 'Holed'
    const sg = calculateShotSG({
      startLie: lieKey,
      startDistanceBin: updatedShot.startDistanceBin,
      endLie: isHoled ? 'holed' : endLieKey,
      endDistanceBin: updatedShot.endDistanceBin,
      isHoled,
    })
    updatedShot.sgCalculated = sg
    updatedShot.category = getSGCategory(hole.par, updatedShot.shotNumber, updatedShot.startLie, updatedShot.startDistanceBin)

    const allNonPutts = hole.shots.filter(s => s.category !== 'putting')
    allNonPutts[index] = updatedShot
    const shots = [...allNonPutts, ...putts]
    onChange({ ...hole, shots })
  }

  function removeApproachShot(index) {
    const allNonPutts = hole.shots.filter(s => s.category !== 'putting')
    allNonPutts.splice(index, 1)
    // Renumber
    allNonPutts.forEach((s, i) => { s.shotNumber = i + 1 })
    const shots = [...allNonPutts, ...putts]
    onChange({ ...hole, shots })
  }

  function addPutt() {
    const puttNumber = putts.length + 1
    const newPutt = createShot({ shotNumber: puttNumber })
    newPutt.category = 'putting'
    newPutt.startLie = 'Green'
    const shots = [...hole.shots.filter(s => s.category !== 'putting'), newPutt]
    onChange({ ...hole, shots })
  }

  function updatePutt(index, updatedPutt) {
    const isHoled = updatedPutt.puttResult === 'made'
    const sg = calculateShotSG({
      startLie: 'green',
      startDistanceBin: updatedPutt.startDistanceBin,
      endLie: isHoled ? 'holed' : 'green',
      endDistanceBin: isHoled ? null : '<4ft',
      isHoled,
    })
    updatedPutt.sgCalculated = sg
    updatedPutt.category = 'putting'

    const newPutts = [...putts]
    newPutts[index] = updatedPutt
    // Renumber putts
    newPutts.forEach((p, i) => { p.shotNumber = i + 1 })
    const shots = [...hole.shots.filter(s => s.category !== 'putting'), ...newPutts]
    onChange({ ...hole, shots })
  }

  function removePutt(index) {
    const newPutts = [...putts]
    newPutts.splice(index, 1)
    newPutts.forEach((p, i) => { p.shotNumber = i + 1 })
    const shots = [...hole.shots.filter(s => s.category !== 'putting'), ...newPutts]
    onChange({ ...hole, shots })
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
            <div className="card" key={shot.shotNumber}>
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
            <div className="card" key={`putt-${i}`}>
              <PuttEntry
                putt={putt}
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
