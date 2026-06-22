// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect } from 'react'
import { db, auth, APP_ID } from '../firebase/config'
import {
  signInAnonymously,
  collection, query, onSnapshot,
  doc, setDoc, addDoc, updateDoc, deleteDoc
} from 'firebase/firestore'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [viewMode, setViewMode] = useState('manager')
  const [rsvps, setRsvps] = useState([])
  const [isLocked, setIsLocked] = useState(false)
  const [options, setOptions] = useState([/* le 3 opzioni */])
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])


  useEffect(() => {
    initFirebase()
  }, [])

  async function initFirebase() {
    try {
      const { user } = await signInAnonymously(auth)
      if (!user) return

      const rsvpsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'rsvps')
      const unsubscribe = onSnapshot(query(rsvpsRef), (snap) => {
        setRsvps(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      })
      return () => unsubscribe()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppContext.Provider value={{ viewMode, setViewMode, rsvps, options, isLocked, loading, toasts }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)