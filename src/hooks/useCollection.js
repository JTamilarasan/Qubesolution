import { useEffect, useState } from 'react'
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from '../firebase/config'

export function useCollection(collectionName) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(Boolean(db))
  const [error, setError] = useState(db ? '' : 'Firebase is not configured. Add your project values to .env.')

  useEffect(() => {
    if (!db) return undefined
    return onSnapshot(query(collection(db, collectionName)), (snapshot) => {
      setData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      setLoading(false)
      setError('')
    }, () => {
      setError(`Unable to load ${collectionName}. Check your connection and Firestore permissions.`)
      setLoading(false)
    })
  }, [collectionName])

  return { data, loading, error }
}
