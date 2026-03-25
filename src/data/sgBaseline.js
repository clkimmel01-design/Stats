// Strokes Gained baseline table derived from Mark Broadie's research (Every Shot Counts).
// Values represent the expected number of strokes to hole out from a given distance/lie
// for a scratch golfer (0 handicap baseline).
//
// Keys: distance in yards (number), lie category (string)
// Usage: sgBaseline[distanceYards][lie] = expected strokes remaining

export const SG_BASELINE = {
  // --- PUTTING (on green) ---
  // Source: Broadie PGA Tour averages, adjusted for amateur use
  putting: {
    2:   1.01,
    6:   1.50,   // midpoint of 4-8 ft bin
    9:   1.83,   // midpoint of 8-10 ft bin
    12:  1.93,   // midpoint of 10-15 ft bin
    17:  2.00,   // midpoint of 15-20 ft bin
    22:  2.10,   // midpoint of 20-25 ft bin
    30:  2.20,   // midpoint of 25+ ft bin (30 used as representative)
    // 3-putt avoidance bins
    7:   1.80,   // midpoint 5-10 ft
    15:  1.95,   // midpoint 10-20 ft
    25:  2.05,   // midpoint 20-30 ft
    35:  2.18,   // midpoint 30+ ft (35 used)
  },

  // --- APPROACH / AROUND THE GREEN (off green) ---
  // Expected strokes from various distances by lie
  // These cover: fairway, rough, bunker, fringe
  fairway: {
    5:   2.40,   // 0-10 yds (around green)
    15:  2.60,   // 10-20 yds
    25:  2.72,   // 20-30 yds
    35:  2.80,   // 30-40 yds
    45:  2.88,   // 40-50 yds
    75:  2.90,   // 50-100 yds (midpoint 75)
    125: 3.05,   // 100-150 yds (midpoint 125)
    175: 3.25,   // 150-200 yds (midpoint 175)
    225: 3.50,   // 200+ yds (midpoint 225)
  },
  rough: {
    5:   2.60,
    15:  2.78,
    25:  2.88,
    35:  2.96,
    45:  3.02,
    75:  3.10,
    125: 3.28,
    175: 3.50,
    225: 3.72,
  },
  bunker: {
    5:   2.75,
    15:  2.92,
    25:  3.00,
    35:  3.08,
    45:  3.15,
    75:  3.20,
    125: 3.40,
    175: 3.60,
    225: 3.80,
  },
  fringe: {
    5:   2.45,
    15:  2.62,
    25:  2.74,
    35:  2.82,
    45:  2.90,
    75:  2.95,
    125: 3.10,
    175: 3.30,
    225: 3.55,
  },
  green: {
    // On the green — same as putting table (accessed via putting key above)
    // Included here for completeness when end lie = green
    5:   1.20,
    10:  1.50,
    15:  1.75,
    20:  1.95,
    30:  2.10,
  },
  penalty: {
    // After penalty drop — add stroke + approximate next shot
    75:  3.90,
    125: 4.10,
    175: 4.30,
    225: 4.50,
  },
  tee: {
    // Off the tee — par 4/5 starting position (full drive situation)
    // Used as "before" baseline for OTT shots
    400: 4.00,  // par 4 average
    500: 5.00,  // par 5 average
    350: 3.90,
    450: 4.95,
  },
}

// Distance bin midpoints used for SG lookups
export const DISTANCE_BIN_MIDPOINTS = {
  // Approach bins
  '50-100':  75,
  '100-150': 125,
  '150-200': 175,
  '200+':    225,
  // Around the green
  '0-10':    5,
  '10-20':   15,
  '20-30':   25,
  '30-40':   35,
  '40-50':   45,
  // Putting — make % bins
  '<4ft':    2,
  '4-8ft':   6,
  '8-10ft':  9,
  '10-15ft': 12,
  '15-20ft': 17,
  '20-25ft': 22,
  '25ft+':   30,
  // Putting — 3-putt avoidance
  '5-10ft':  7,
  '10-20ft': 15,
  '20-30ft': 25,
  '30ft+':   35,
}

// Helper: get expected strokes remaining given a lie and distance bin label
export function getExpectedStrokes(lie, distanceBin) {
  const dist = DISTANCE_BIN_MIDPOINTS[distanceBin]
  if (dist === undefined) return null

  const lieKey = lie?.toLowerCase() || 'fairway'
  const lieTable = SG_BASELINE[lieKey] || SG_BASELINE.fairway

  // Find closest distance key in the table
  const keys = Object.keys(lieTable).map(Number).sort((a, b) => a - b)
  let closest = keys[0]
  for (const k of keys) {
    if (Math.abs(k - dist) < Math.abs(closest - dist)) closest = k
  }
  return lieTable[closest]
}

export function getPuttingExpectedStrokes(distanceBin) {
  const dist = DISTANCE_BIN_MIDPOINTS[distanceBin]
  if (dist === undefined) return null
  const keys = Object.keys(SG_BASELINE.putting).map(Number).sort((a, b) => a - b)
  let closest = keys[0]
  for (const k of keys) {
    if (Math.abs(k - dist) < Math.abs(closest - dist)) closest = k
  }
  return SG_BASELINE.putting[closest]
}
