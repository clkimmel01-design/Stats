// Benchmark reference values by scoring range.
// Based on published amateur golf research and Mark Broadie's strokes gained data.
// These are averages for golfers whose 18-hole scores fall in each range.
// Used as comparison columns on the dashboard.

export const SCORING_RANGES = ['≤72', '73-76', '77-80', '81-85', '86-90', '91+']

// Helper to find which scoring range a given average score falls in
export function getScoringRange(avgScore) {
  if (avgScore <= 72) return '≤72'
  if (avgScore <= 76) return '73-76'
  if (avgScore <= 80) return '77-80'
  if (avgScore <= 85) return '81-85'
  if (avgScore <= 90) return '86-90'
  return '91+'
}

// Each stat key maps to an object with a value per scoring range.
// null = not applicable / no data available for that range.
export const BENCHMARKS = {

  // ── SCORING ─────────────────────────────────────────────────────────────
  scoringAvg: {
    label: 'Scoring avg',
    fmt: 'dec1',
    '≤72': 71.0, '73-76': 74.5, '77-80': 78.5, '81-85': 83.0, '86-90': 88.0, '91+': 95.0,
  },
  sgTotal: {
    label: 'SG: Total',
    fmt: 'sg',
    '≤72': 2.0, '73-76': 0.0, '77-80': -2.0, '81-85': -4.5, '86-90': -7.0, '91+': -10.0,
  },
  par3Avg: {
    label: 'Par 3 avg',
    fmt: 'dec2',
    '≤72': 2.95, '73-76': 3.20, '77-80': 3.40, '81-85': 3.65, '86-90': 3.90, '91+': 4.20,
  },
  par4Avg: {
    label: 'Par 4 avg',
    fmt: 'dec2',
    '≤72': 3.90, '73-76': 4.15, '77-80': 4.35, '81-85': 4.60, '86-90': 4.88, '91+': 5.25,
  },
  par5Avg: {
    label: 'Par 5 avg',
    fmt: 'dec2',
    '≤72': 4.60, '73-76': 4.90, '77-80': 5.15, '81-85': 5.45, '86-90': 5.78, '91+': 6.15,
  },
  girPct: {
    label: 'GIR %',
    fmt: 'pct',
    '≤72': 72, '73-76': 56, '77-80': 44, '81-85': 33, '86-90': 23, '91+': 15,
  },
  eagles: {
    label: 'Eagles / round',
    fmt: 'dec2',
    '≤72': 0.05, '73-76': 0.02, '77-80': 0.01, '81-85': 0.005, '86-90': 0.002, '91+': 0.001,
  },
  birdies: {
    label: 'Birdies / round',
    fmt: 'dec1',
    '≤72': 3.5, '73-76': 2.3, '77-80': 1.3, '81-85': 0.7, '86-90': 0.3, '91+': 0.1,
  },
  bogeys: {
    label: 'Bogeys / round',
    fmt: 'dec1',
    '≤72': 3.2, '73-76': 4.3, '77-80': 5.4, '81-85': 6.6, '86-90': 7.8, '91+': 9.0,
  },
  doublesPlus: {
    label: 'Double+ / round',
    fmt: 'dec1',
    '≤72': 0.2, '73-76': 0.6, '77-80': 1.3, '81-85': 2.3, '86-90': 3.4, '91+': 5.0,
  },
  threePuttAvoidPct: {
    label: '3-putt avoid %',
    fmt: 'pct',
    '≤72': 97, '73-76': 94, '77-80': 90, '81-85': 85, '86-90': 79, '91+': 71,
  },

  // ── APPROACH ─────────────────────────────────────────────────────────────
  girTotal: {
    label: 'GIR % (total)',
    fmt: 'pct',
    '≤72': 72, '73-76': 56, '77-80': 44, '81-85': 33, '86-90': 23, '91+': 15,
  },
  gir50100: {
    label: 'GIR % 50-100y',
    fmt: 'pct',
    '≤72': 82, '73-76': 68, '77-80': 54, '81-85': 42, '86-90': 30, '91+': 20,
  },
  gir100150: {
    label: 'GIR % 100-150y',
    fmt: 'pct',
    '≤72': 74, '73-76': 57, '77-80': 44, '81-85': 32, '86-90': 22, '91+': 13,
  },
  gir150200: {
    label: 'GIR % 150-200y',
    fmt: 'pct',
    '≤72': 62, '73-76': 47, '77-80': 34, '81-85': 24, '86-90': 15, '91+': 8,
  },
  gir200plus: {
    label: 'GIR % 200+y',
    fmt: 'pct',
    '≤72': 46, '73-76': 32, '77-80': 22, '81-85': 13, '86-90': 8, '91+': 4,
  },
  girFairway: {
    label: 'GIR % (fairway)',
    fmt: 'pct',
    '≤72': 78, '73-76': 62, '77-80': 50, '81-85': 38, '86-90': 27, '91+': 17,
  },
  girRough: {
    label: 'GIR % (rough)',
    fmt: 'pct',
    '≤72': 52, '73-76': 40, '77-80': 30, '81-85': 22, '86-90': 14, '91+': 8,
  },
  girBunker: {
    label: 'GIR % (bunker)',
    fmt: 'pct',
    '≤72': 36, '73-76': 26, '77-80': 18, '81-85': 12, '86-90': 7, '91+': 4,
  },

  // ── PUTTING ──────────────────────────────────────────────────────────────
  puttsPerRound: {
    label: 'Putts / round',
    fmt: 'dec1',
    '≤72': 28.5, '73-76': 30.2, '77-80': 31.8, '81-85': 33.5, '86-90': 35.2, '91+': 37.0,
  },
  sgPutting: {
    label: 'SG: Putting',
    fmt: 'sg',
    '≤72': 0.6, '73-76': 0.0, '77-80': -0.5, '81-85': -1.1, '86-90': -1.8, '91+': -2.5,
  },
  makePctU4: {
    label: 'Make % <4ft',
    fmt: 'pct',
    '≤72': 97, '73-76': 94, '77-80': 90, '81-85': 85, '86-90': 79, '91+': 71,
  },
  makePct48: {
    label: 'Make % 4-8ft',
    fmt: 'pct',
    '≤72': 70, '73-76': 59, '77-80': 48, '81-85': 38, '86-90': 29, '91+': 20,
  },
  makePct810: {
    label: 'Make % 8-10ft',
    fmt: 'pct',
    '≤72': 44, '73-76': 35, '77-80': 27, '81-85': 20, '86-90': 14, '91+': 9,
  },
  makePct1015: {
    label: 'Make % 10-15ft',
    fmt: 'pct',
    '≤72': 29, '73-76': 22, '77-80': 17, '81-85': 12, '86-90': 8, '91+': 5,
  },
  makePct1520: {
    label: 'Make % 15-20ft',
    fmt: 'pct',
    '≤72': 18, '73-76': 14, '77-80': 10, '81-85': 7, '86-90': 5, '91+': 3,
  },
  makePct2025: {
    label: 'Make % 20-25ft',
    fmt: 'pct',
    '≤72': 13, '73-76': 9, '77-80': 7, '81-85': 5, '86-90': 3, '91+': 2,
  },
  makePct25plus: {
    label: 'Make % 25ft+',
    fmt: 'pct',
    '≤72': 7, '73-76': 5, '77-80': 3, '81-85': 2, '86-90': 1, '91+': 1,
  },
  threePuttPct510: {
    label: '3-putt % 5-10ft',
    fmt: 'pct',
    '≤72': 1, '73-76': 2, '77-80': 4, '81-85': 6, '86-90': 9, '91+': 13,
  },
  threePuttPct1020: {
    label: '3-putt % 10-20ft',
    fmt: 'pct',
    '≤72': 3, '73-76': 5, '77-80': 9, '81-85': 13, '86-90': 18, '91+': 24,
  },
  threePuttPct2030: {
    label: '3-putt % 20-30ft',
    fmt: 'pct',
    '≤72': 8, '73-76': 13, '77-80': 18, '81-85': 24, '86-90': 31, '91+': 39,
  },
  threePuttPct30plus: {
    label: '3-putt % 30ft+',
    fmt: 'pct',
    '≤72': 15, '73-76': 21, '77-80': 28, '81-85': 36, '86-90': 44, '91+': 53,
  },

  // ── AROUND THE GREEN ─────────────────────────────────────────────────────
  upAndDownPct: {
    label: 'Up & down %',
    fmt: 'pct',
    '≤72': 65, '73-76': 50, '77-80': 38, '81-85': 28, '86-90': 19, '91+': 12,
  },
  sandSavePct: {
    label: 'Sand save %',
    fmt: 'pct',
    '≤72': 52, '73-76': 39, '77-80': 29, '81-85': 20, '86-90': 13, '91+': 8,
  },
  scramblingPct: {
    label: 'Scrambling %',
    fmt: 'pct',
    '≤72': 72, '73-76': 56, '77-80': 43, '81-85': 32, '86-90': 22, '91+': 14,
  },
  sgAroundGreen: {
    label: 'SG: Around Green',
    fmt: 'sg',
    '≤72': 0.4, '73-76': 0.0, '77-80': -0.4, '81-85': -0.9, '86-90': -1.4, '91+': -2.0,
  },

  // ── OFF THE TEE ──────────────────────────────────────────────────────────
  fairwayPct: {
    label: 'Fairway %',
    fmt: 'pct',
    '≤72': 65, '73-76': 58, '77-80': 52, '81-85': 44, '86-90': 37, '91+': 29,
  },
  sgOffTee: {
    label: 'SG: Off the Tee',
    fmt: 'sg',
    '≤72': 0.6, '73-76': 0.0, '77-80': -0.5, '81-85': -1.0, '86-90': -1.6, '91+': -2.2,
  },
  scoringFromFairway: {
    label: 'Avg score (fairway)',
    fmt: 'dec2',
    '≤72': 4.05, '73-76': 4.28, '77-80': 4.50, '81-85': 4.75, '86-90': 5.02, '91+': 5.40,
  },
  scoringFromRough: {
    label: 'Avg score (rough)',
    fmt: 'dec2',
    '≤72': 4.35, '73-76': 4.62, '77-80': 4.88, '81-85': 5.18, '86-90': 5.52, '91+': 5.95,
  },
}

// Dashboard section definitions — controls display order and grouping
export const DASHBOARD_SECTIONS = [
  {
    title: 'Scoring',
    keys: ['scoringAvg', 'sgTotal', 'par3Avg', 'par4Avg', 'par5Avg', 'girPct', 'eagles', 'birdies', 'bogeys', 'doublesPlus', 'threePuttAvoidPct'],
  },
  {
    title: 'Approach',
    keys: ['girTotal', 'gir50100', 'gir100150', 'gir150200', 'gir200plus', 'girFairway', 'girRough', 'girBunker'],
  },
  {
    title: 'Putting',
    keys: ['puttsPerRound', 'sgPutting', 'makePctU4', 'makePct48', 'makePct810', 'makePct1015', 'makePct1520', 'makePct2025', 'makePct25plus', 'threePuttPct510', 'threePuttPct1020', 'threePuttPct2030', 'threePuttPct30plus'],
  },
  {
    title: 'Around the Green',
    keys: ['upAndDownPct', 'sandSavePct', 'scramblingPct', 'sgAroundGreen'],
  },
  {
    title: 'Off the Tee',
    keys: ['fairwayPct', 'sgOffTee', 'scoringFromFairway', 'scoringFromRough'],
  },
]
