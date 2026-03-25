// statsEngine.js
// Aggregates all rounds into every stat shown on the dashboard.
// Returns a flat object keyed by the same stat keys used in benchmarks.js.
// Values are numbers (or null if there's not enough data).

import { summarizeRoundSG } from './sgCalculator.js'
import { getScoringRange } from '../data/benchmarks.js'

// ── helpers ────────────────────────────────────────────────────────────────

function pct(made, total) {
  if (!total) return null
  return (made / total) * 100
}

function avg(sum, count) {
  if (!count) return null
  return sum / count
}

// ── main export ────────────────────────────────────────────────────────────

export function computeStats(rounds) {
  if (!rounds || rounds.length === 0) return null

  // Flatten all holes across all rounds
  const allHoles = rounds.flatMap(r => r.holes)

  // Normalise to 18-hole equivalents: scale 9-hole rounds × 2
  // Used only for per-round averages
  const roundTotals = rounds.map(r => {
    const holes = r.holes
    const score = holes.reduce((s, h) => s + (h.score || 0), 0)
    const par   = holes.reduce((s, h) => s + (h.par   || 0), 0)
    const scale = holes.length <= 9 ? 2 : 1
    return { score: score * scale, par: par * scale, holes, scale, sg: summarizeRoundSG(holes) }
  })

  const totalRounds = roundTotals.length
  const totalHoles  = allHoles.length

  // All shots
  const allShots = allHoles.flatMap(h => h.shots || [])

  // ── Scoring ────────────────────────────────────────────────────────────

  const scoringAvg = avg(
    roundTotals.reduce((s, r) => s + r.score, 0),
    totalRounds
  )

  const sgByRound = roundTotals.map(r => r.sg)
  const sgTotal   = avg(sgByRound.reduce((s, r) => s + r.total, 0), totalRounds)
  const sgPutting = avg(sgByRound.reduce((s, r) => s + r.putting, 0), totalRounds)
  const sgOTT     = avg(sgByRound.reduce((s, r) => s + r.offTheTee, 0), totalRounds)
  const sgATG     = avg(sgByRound.reduce((s, r) => s + r.aroundTheGreen, 0), totalRounds)
  const sgApp     = avg(sgByRound.reduce((s, r) => s + r.approach, 0), totalRounds)

  // Par 3/4/5 scoring averages
  function parAvg(par) {
    const h = allHoles.filter(h => h.par === par)
    return avg(h.reduce((s, h) => s + (h.score || 0), 0), h.length)
  }
  const par3Avg = parAvg(3)
  const par4Avg = parAvg(4)
  const par5Avg = parAvg(5)

  // GIR: non-putt shots finished on green and score left room (par - 2 shots or fewer used)
  // Simpler proxy: any hole where at least one non-putt shot ended on Green
  const girHoles = allHoles.filter(h =>
    (h.shots || []).some(s => s.category !== 'putting' && s.endLie === 'Green')
  )
  const girPct = pct(girHoles.length, totalHoles)

  // Scoring by category relative to par
  let eagles = 0, birdies = 0, bogeys = 0, doublesPlus = 0
  for (const h of allHoles) {
    const diff = (h.score || 0) - (h.par || 0)
    if (diff <= -2) eagles++
    else if (diff === -1) birdies++
    else if (diff === 1) bogeys++
    else if (diff >= 2) doublesPlus++
  }

  // 3-putt avoidance: holes with < 3 putts (out of holes that had any putts)
  const holesWithPutts = allHoles.filter(h => (h.shots || []).some(s => s.category === 'putting'))
  const holesWithout3Putt = holesWithPutts.filter(h =>
    (h.shots || []).filter(s => s.category === 'putting').length < 3
  )
  const threePuttAvoidPct = pct(holesWithout3Putt.length, holesWithPutts.length)

  // ── Approach ───────────────────────────────────────────────────────────

  // Approach shots by distance bin
  function girByBin(bin) {
    const shots = allShots.filter(s => s.category === 'approach' && s.startDistanceBin === bin)
    const made  = shots.filter(s => s.endLie === 'Green')
    return pct(made.length, shots.length)
  }

  // GIR by start lie
  function girByLie(lieLabel) {
    const shots = allShots.filter(s =>
      s.category === 'approach' &&
      s.startLie?.toLowerCase().includes(lieLabel.toLowerCase())
    )
    const made = shots.filter(s => s.endLie === 'Green')
    return pct(made.length, shots.length)
  }

  const gir50100  = girByBin('50-100')
  const gir100150 = girByBin('100-150')
  const gir150200 = girByBin('150-200')
  const gir200plus = girByBin('200+')
  const girFairway = girByLie('fairway')
  const girRough   = (() => {
    const shots = allShots.filter(s =>
      s.category === 'approach' &&
      (s.startLie?.toLowerCase().includes('rough'))
    )
    return pct(shots.filter(s => s.endLie === 'Green').length, shots.length)
  })()
  const girBunker  = girByLie('bunker')

  // ── Putting ────────────────────────────────────────────────────────────

  const allPutts = allShots.filter(s => s.category === 'putting')

  const puttsPerRound = totalRounds > 0
    ? roundTotals.reduce((sum, r) => {
        const p = r.holes.flatMap(h => h.shots || []).filter(s => s.category === 'putting').length
        return sum + p * r.scale
      }, 0) / totalRounds
    : null

  // Make % by bin
  function makePctByBin(bin) {
    const p = allPutts.filter(s => s.startDistanceBin === bin)
    const made = p.filter(s => s.puttResult === 'made')
    return pct(made.length, p.length)
  }

  // 3-putt % by initial putt distance (first putt of sequence)
  // A 3-putt means the hole had 3+ putts; we credit the first putt's distance bin
  function threePuttPctByBin(bin) {
    let total = 0, threePutted = 0
    for (const h of allHoles) {
      const putts = (h.shots || []).filter(s => s.category === 'putting')
      if (!putts.length) continue
      const first = putts[0]
      if (!first || first.startDistanceBin !== bin) continue
      total++
      if (putts.length >= 3) threePutted++
    }
    return pct(threePutted, total)
  }

  // ── Around the Green ──────────────────────────────────────────────────

  // Up and down: ATG shot that was NOT on green, followed by holing in 1 putt
  // Proxy: hole where category=aroundTheGreen exists AND putts <= 1
  const atgHoles = allHoles.filter(h => (h.shots || []).some(s => s.category === 'aroundTheGreen'))
  const upAndDownHoles = atgHoles.filter(h => {
    const putts = (h.shots || []).filter(s => s.category === 'putting')
    return putts.length <= 1
  })
  const upAndDownPct = pct(upAndDownHoles.length, atgHoles.length)

  // Sand save: bunker shots around the green, up and down
  const sandHoles = allHoles.filter(h =>
    (h.shots || []).some(s =>
      s.category === 'aroundTheGreen' && s.startLie?.toLowerCase().includes('bunker')
    )
  )
  const sandSaveHoles = sandHoles.filter(h => {
    const putts = (h.shots || []).filter(s => s.category === 'putting')
    return putts.length <= 1
  })
  const sandSavePct = pct(sandSaveHoles.length, sandHoles.length)

  // Scrambling: missed GIR but still made par or better
  const missedGirHoles = allHoles.filter(h =>
    !(h.shots || []).some(s => s.category !== 'putting' && s.endLie === 'Green')
  )
  const scramblingHoles = missedGirHoles.filter(h => (h.score || 0) <= (h.par || 0))
  const scramblingPct = pct(scramblingHoles.length, missedGirHoles.length)

  // ── Off the Tee ───────────────────────────────────────────────────────

  const teeShots = allShots.filter(s => s.category === 'offTheTee')
  const fairwaysHit = teeShots.filter(s => s.endLie === 'Fairway')
  const fairwayPct  = pct(fairwaysHit.length, teeShots.length)

  // Scoring average from fairway vs rough on par 4/5
  function scoringFromLie(lieLabel) {
    const relevant = allHoles.filter(h => {
      if (h.par !== 4 && h.par !== 5) return false
      const tee = (h.shots || []).find(s => s.shotNumber === 1)
      return tee?.endLie === lieLabel
    })
    return avg(relevant.reduce((s, h) => s + (h.score || 0), 0), relevant.length)
  }
  const scoringFromFairway = scoringFromLie('Fairway')
  const scoringFromRough = (() => {
    const relevant = allHoles.filter(h => {
      if (h.par !== 4 && h.par !== 5) return false
      const tee = (h.shots || []).find(s => s.shotNumber === 1)
      return tee?.endLie?.toLowerCase().includes('rough')
    })
    return avg(relevant.reduce((s, h) => s + (h.score || 0), 0), relevant.length)
  })()

  // ── Player's scoring range ────────────────────────────────────────────
  const playerRange = scoringAvg ? getScoringRange(scoringAvg) : null

  return {
    // meta
    totalRounds,
    totalHoles,
    playerRange,
    scoringAvg,

    // scoring
    sgTotal,
    par3Avg,
    par4Avg,
    par5Avg,
    girPct,
    eagles:          totalHoles > 0 ? eagles / totalRounds : null,
    birdies:         totalHoles > 0 ? birdies / totalRounds : null,
    bogeys:          totalHoles > 0 ? bogeys / totalRounds : null,
    doublesPlus:     totalHoles > 0 ? doublesPlus / totalRounds : null,
    threePuttAvoidPct,

    // approach
    girTotal: girPct,
    gir50100,
    gir100150,
    gir150200,
    gir200plus,
    girFairway,
    girRough,
    girBunker,

    // putting
    puttsPerRound,
    sgPutting,
    makePctU4:       makePctByBin('<4ft'),
    makePct48:       makePctByBin('4-8ft'),
    makePct810:      makePctByBin('8-10ft'),
    makePct1015:     makePctByBin('10-15ft'),
    makePct1520:     makePctByBin('15-20ft'),
    makePct2025:     makePctByBin('20-25ft'),
    makePct25plus:   makePctByBin('25ft+'),
    threePuttPct510:   threePuttPctByBin('5-10ft'),
    threePuttPct1020:  threePuttPctByBin('10-20ft'),
    threePuttPct2030:  threePuttPctByBin('20-30ft'),
    threePuttPct30plus: threePuttPctByBin('30ft+'),

    // around the green
    upAndDownPct,
    sandSavePct,
    scramblingPct,
    sgAroundGreen: sgATG,

    // off the tee
    fairwayPct,
    sgOffTee: sgOTT,
    scoringFromFairway,
    scoringFromRough,
  }
}
