// localStorage helpers for the Stats app.
// All round data lives under the key "stats_rounds" as a JSON array.

const ROUNDS_KEY = 'stats_rounds'

export function getRounds() {
  try {
    const raw = localStorage.getItem(ROUNDS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveRound(round) {
  const rounds = getRounds()
  const existingIndex = rounds.findIndex(r => r.id === round.id)
  if (existingIndex >= 0) {
    rounds[existingIndex] = round
  } else {
    rounds.push(round)
  }
  localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds))
}

export function getRoundById(id) {
  return getRounds().find(r => r.id === id) || null
}

export function deleteRound(id) {
  const rounds = getRounds().filter(r => r.id !== id)
  localStorage.setItem(ROUNDS_KEY, JSON.stringify(rounds))
}

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// Create a fresh round object
export function createRound({ courseName = '', tees = '', notes = '' } = {}) {
  return {
    id: generateId(),
    date: new Date().toISOString().slice(0, 10),
    courseName,
    tees,
    notes,
    holes: [],
  }
}

// Create a fresh hole object
export function createHole({ holeNumber = 1, par = 4, yardage = 0 } = {}) {
  return {
    holeNumber,
    par,
    yardage,
    score: par,
    mentalScore: 1,
    shots: [],
  }
}

// Create a fresh shot object
export function createShot({ shotNumber = 1 } = {}) {
  return {
    shotNumber,
    category: null,        // assigned by SG calculator
    club: '',
    startLie: '',
    startYards: '',        // raw yards input (approach / ATG shots)
    startFeet: '',         // raw feet input (putts)
    startDistanceBin: '',  // auto-derived from startYards or startFeet
    endLie: '',
    endFeet: '',           // raw feet to pin when shot ends on Green
    endDistanceBin: '',    // auto-derived from endFeet
    intendedTargetBin: '',
    committed: true,
    puttResult: '',        // 'made' | 'missed'
    missDirection: '',     // 'long' | 'short' | 'left' | 'right'
    sgCalculated: null,
  }
}
