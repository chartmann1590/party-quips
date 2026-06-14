import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore'
import { firestoreDb } from './firestoreConfig'
import type { PackId, PurchaseRecord } from '../types/addOns'

function purchasesRef(uid: string) {
  return collection(firestoreDb, 'users', uid, 'purchases')
}

export async function getOwnedPackIds(uid: string): Promise<PackId[]> {
  try {
    const snap = await getDocs(purchasesRef(uid))
    return snap.docs.map(d => d.id as PackId)
  } catch {
    return []
  }
}

export async function hasPack(uid: string, packId: PackId): Promise<boolean> {
  try {
    const snap = await getDoc(doc(firestoreDb, 'users', uid, 'purchases', packId))
    return snap.exists()
  } catch {
    return false
  }
}

export async function recordPurchase(uid: string, record: PurchaseRecord): Promise<void> {
  await setDoc(doc(firestoreDb, 'users', uid, 'purchases', record.packId), record)
}
