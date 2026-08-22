import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '../firebase/config'

function requireDb() {
  if (!db) throw new Error('Firebase is not configured. Add your project values to .env.')
  return db
}

export function createRecord(collectionName, data) {
  return addDoc(collection(requireDb(), collectionName), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
}

export function updateRecord(collectionName, id, data) {
  return updateDoc(doc(requireDb(), collectionName, id), { ...data, updatedAt: serverTimestamp() })
}

export function deleteRecord(collectionName, id) {
  return deleteDoc(doc(requireDb(), collectionName, id))
}

export async function createRecords(collectionName, records) {
  const database = requireDb()
  const batch = writeBatch(database)
  records.forEach((record) => {
    const reference = doc(collection(database, collectionName))
    batch.set(reference, { ...record, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
  })
  return batch.commit()
}
