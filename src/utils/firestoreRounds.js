// Firestore CRUD for rounds.
// All rounds live at: /rounds/{roundId}
// Each round document includes a `userId` field so we can query per user.

import {
  collection, doc, setDoc, getDoc, getDocs,
  deleteDoc, query, where, orderBy,
} from 'firebase/firestore'
import { db } from '../firebase.js'

const ROUNDS_COL = 'rounds'

// Save (create or update) a round
export async function saveRoundFS(round, userId) {
  const ref = doc(db, ROUNDS_COL, round.id)
  await setDoc(ref, { ...round, userId, updatedAt: new Date().toISOString() })
}

// Get all rounds for a user, sorted newest first
export async function getRoundsFS(userId) {
  const q = query(
    collection(db, ROUNDS_COL),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

// Get a single round by ID
export async function getRoundByIdFS(roundId) {
  const ref  = doc(db, ROUNDS_COL, roundId)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

// Delete a round
export async function deleteRoundFS(roundId) {
  await deleteDoc(doc(db, ROUNDS_COL, roundId))
}

// Migrate an array of localStorage rounds into Firestore (used once on first login)
export async function migrateLocalRounds(localRounds, userId) {
  const promises = localRounds.map(round => saveRoundFS(round, userId))
  await Promise.all(promises)
}
