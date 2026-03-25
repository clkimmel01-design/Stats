// Strokes Gained calculator
// Formula: SG = Expected strokes (before shot) - Expected strokes (after shot) - 1
// A positive SG means the shot gained strokes vs. the baseline; negative = lost strokes.

import { getExpectedStrokes, getPuttingExpectedStrokes, DISTANCE_BIN_MIDPOINTS } from '../data/sgBaseline.js'

// Determine the SG category for a shot
// par: hole par (3, 4, or 5)
// shotNumber: 1-indexed shot number on the hole
// startLie: where the ball started ('tee', 'fairway', 'rough', 'bunker', etc.)
// startDistanceBin: distance bin label from DISTANCE_BIN_MIDPOINTS
export function getSGCategory(par, shotNumber, startLie, startDistanceBin) {
  const lieLC = startLie?.toLowerCase() || ''

  if (lieLC === 'green') return 'putting'

  // Off the tee = shot 1 on par 4 or par 5
  if (shotNumber === 1 && (par === 4 || par === 5)) return 'offTheTee'

  // Around the green = under 50 yards (not on green)
  const dist = DISTANCE_BIN_MIDPOINTS[startDistanceBin]
  if (dist !== undefined && dist < 50) return 'aroundTheGreen'

  // Everything else = approach
  return 'approach'
}

// Calculate SG for a single shot
// Returns a number (SG value) or null if data is missing
export function calculateShotSG({ startLie, startDistanceBin, endLie, endDistanceBin, isHoled }) {
  const lieLC = startLie?.toLowerCase() || ''

  // Strokes expected before the shot
  let expectedBefore
  if (lieLC === 'green') {
    expectedBefore = getPuttingExpectedStrokes(startDistanceBin)
  } else {
    expectedBefore = getExpectedStrokes(startLie, startDistanceBin)
  }
  if (expectedBefore === null) return null

  // Strokes expected after the shot
  let expectedAfter
  if (isHoled) {
    expectedAfter = 0
  } else if (endLie?.toLowerCase() === 'green') {
    expectedAfter = getPuttingExpectedStrokes(endDistanceBin)
  } else {
    expectedAfter = getExpectedStrokes(endLie, endDistanceBin)
  }
  if (expectedAfter === null) return null

  return parseFloat((expectedBefore - expectedAfter - 1).toFixed(3))
}

// Summarize SG for all shots in a round
// shots: array of shot objects from all holes
export function summarizeRoundSG(holes) {
  const summary = {
    offTheTee: 0,
    approach: 0,
    aroundTheGreen: 0,
    putting: 0,
    total: 0,
  }

  for (const hole of holes) {
    for (const shot of hole.shots || []) {
      const sg = shot.sgCalculated
      if (sg === null || sg === undefined || isNaN(sg)) continue
      const cat = shot.category
      if (summary[cat] !== undefined) {
        summary[cat] = parseFloat((summary[cat] + sg).toFixed(3))
      }
      summary.total = parseFloat((summary.total + sg).toFixed(3))
    }
  }

  return summary
}
