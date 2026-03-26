export const CLUBS = ['Driver', '3W', '5W', 'Hybrid', '3i', '4i', '5i', '6i', '7i', '8i', '9i', 'PW', 'GW', 'SW', 'LW', 'Putter']

export const TEE_SHOT_CLUBS = ['Driver', '3W', '5W', 'Hybrid', '3i', '4i', '5i', '6i', '7i', '8i', '9i', 'PW']

export const TEE_SHOT_END_LIES = ['Fairway', 'Left Rough', 'Right Rough', 'Bunker', 'Green', 'Penalty']

export const SHOT_END_LIES = ['Fairway', 'Left Rough', 'Right Rough', 'Bunker', 'Fringe', 'Green', 'Holed']

export const PUTTING_END_RESULTS = ['Made', 'Missed']

export const MISS_DIRECTIONS = ['Long', 'Short', 'Left', 'Right']

export const APPROACH_DISTANCE_BINS = ['50-100', '100-150', '150-200', '200+']

export const ATG_DISTANCE_BINS = ['0-10', '10-20', '20-30', '30-40', '40-50']

export const PUTT_MAKE_BINS = ['<4ft', '4-8ft', '8-10ft', '10-15ft', '15-20ft', '20-25ft', '25ft+']

export const PUTT_3PUTT_BINS = ['5-10ft', '10-20ft', '20-30ft', '30ft+']

// All putt bins combined for the distance dropdown
export const ALL_PUTT_BINS = ['<4ft', '4-8ft', '8-10ft', '10-15ft', '15-20ft', '20-25ft', '25ft+']

export const PARS = [3, 4, 5]

// Convert raw yards to a distance bin for SG lookup
export function yardsToDistanceBin(yards) {
  const y = Number(yards)
  if (!y || y <= 0) return ''
  if (y <= 10)  return '0-10'
  if (y <= 20)  return '10-20'
  if (y <= 30)  return '20-30'
  if (y <= 40)  return '30-40'
  if (y <= 50)  return '40-50'
  if (y <= 100) return '50-100'
  if (y <= 150) return '100-150'
  if (y <= 200) return '150-200'
  return '200+'
}

// Convert raw feet to a putt distance bin for SG lookup
export function feetToPuttBin(feet) {
  const f = Number(feet)
  if (!f || f <= 0) return ''
  if (f < 4)  return '<4ft'
  if (f <= 8)  return '4-8ft'
  if (f <= 10) return '8-10ft'
  if (f <= 15) return '10-15ft'
  if (f <= 20) return '15-20ft'
  if (f <= 25) return '20-25ft'
  return '25ft+'
}

// Lie key used for SG lookup (maps display label -> storage key)
export const LIE_TO_KEY = {
  'Fairway': 'fairway',
  'Left Rough': 'rough',
  'Right Rough': 'rough',
  'Bunker': 'bunker',
  'Fringe': 'fringe',
  'Green': 'green',
  'Penalty': 'penalty',
  'Tee': 'fairway',   // tee shots treated as fairway lie for baseline
  'Holed': 'holed',
}
