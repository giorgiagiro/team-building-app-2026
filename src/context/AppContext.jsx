/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { db, auth, APP_ID } from '../firebase/config'
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { signInAnonymously } from 'firebase/auth'
import { storage } from '../firebase/config'

// ─────────────────────────────────────────────
// FEATURE FLAG: imposta a true per riattivare la vista Manager
// ─────────────────────────────────────────────
export const ENABLE_MANAGER_VIEW = false

// ─────────────────────────────────────────────
// DATI DI DEFAULT (usati se il Cloud non è disponibile)
// ─────────────────────────────────────────────
const DEFAULT_OPTIONS = [
  {
    id: 1,
    title: 'Wild Active Adventure',
    tagline: "Un'immersione ad alto impatto di energia e avventura di gruppo.",
    location: 'Lago di Como / Dervio / Prealpi',
    badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    morningActivity: "Canyoning leggero in torrente attrezzato o rafting guidato lungo l'Adda. Un'esperienza selvaggia che cementa l'affidamento reciproco tra colleghi.",
    lunch: 'Pranzo abbondante e rustico in un tipico Crotto valtellinese. Grigliata mista, birre locali e grappa finale.',
    physicalLevel: 'Alta',
    alcoholVibe: 'Molto Alto / Birre / Distillati',
    logistics: 'Complessa / Auto / Navetta',
    budget: 110,
  },
  {
    id: 2,
    title: 'Vintage Wine Country Chill',
    tagline: 'Atmosfera rilassata, stile retro e degustazione sensoriale chic.',
    location: "Colline dell'Oltrepò Pavese",
    badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    morningActivity: "Caccia al tesoro interattiva tra i filari delle vigne a bordo di Vespe d'epoca. Quiz storici e degustazione cieca di uve.",
    lunch: 'Pranzo-degustazione in una prestigiosa cantina vinicola storica. Prodotti biologici a km0 abbinati a Pinot Nero e spumanti.',
    physicalLevel: 'Bassa',
    alcoholVibe: 'Premium / Vino / Bollicine',
    logistics: 'Media / Auto / Autostrada',
    budget: 140,
  },
  {
    id: 3,
    title: 'Urban Survival Challenge',
    tagline: "Collaborazione strategica, creatività e design in una cornice d'acqua.",
    location: 'Idroscalo di Milano / Naviglio',
    badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    morningActivity: "Sessione di go-kart su circuito privato: gare a squadre con prove di qualificazione e finali, briefing sulla sicurezza e coaching. Format competitivo e divertente pensato per stimolare comunicazione, strategia e spirito di squadra; si conclude con premiazione e debrief rapido.",
    lunch: "Pranzo e pool party privato presso un Beach Club sull'Idroscalo. Open bar di cocktail e DJ set.",
    physicalLevel: 'Media',
    alcoholVibe: 'Alto / Open Bar / Cocktail',
    logistics: 'Semplice / Mezzi / Auto',
    budget: 95,
  },
]

const DEFAULT_RSVPS = [
  { id: '1', name: 'Alessandro Neri',  attending: 'si', carOption: 'driver',    carSeats: 3, notes: 'Partenza da Rho Fiera',                        assignedDriver: null },
  { id: '2', name: 'Giulia Bianchi',   attending: 'si', carOption: 'passenger', carSeats: 0, notes: 'Abito in zona Loreto',                         assignedDriver: 'Alessandro Neri' },
  { id: '3', name: 'Marco Viola',      attending: 'si', carOption: 'autonomous',carSeats: 0, notes: 'Abito vicino alla location',                   assignedDriver: null },
  { id: '4', name: 'Laura Verde',      attending: 'si', carOption: 'driver',    carSeats: 4, notes: 'Disponibile a raccogliere persone in Centrale',assignedDriver: null },
  { id: '5', name: 'Stefano Rossi',    attending: 'si', carOption: 'passenger', carSeats: 0, notes: 'Cerco passaggi da Milano',                     assignedDriver: null },
]

// ─────────────────────────────────────────────
// CONTEXT SETUP
// ─────────────────────────────────────────────
const AppContext = createContext(null)

export function AppProvider({ children }) {

  // ── UI state ──────────────────────────────
  const [viewMode,            setViewModeRaw]        = useState(ENABLE_MANAGER_VIEW ? 'manager' : 'team')
  const [currentSlide,        setCurrentSlide]       = useState(0)
  const [editMode,            setEditMode]           = useState(false)
  const [reportTab,           setReportTab]          = useState('booking')

  // ── Settings sincronizzate con Firestore ──
  const [selectedWinnerIndex, setSelectedWinnerIndex] = useState(1)
  const [isLocked,            setIsLocked]            = useState(false)
  const [savedPassword,       setSavedPassword]       = useState('')
  const [options,             setOptions]             = useState(DEFAULT_OPTIONS)

  // ── Modali ────────────────────────────────
  const [showLockModal,       setShowLockModal]       = useState(false)
  const [showUnlockModal,     setShowUnlockModal]     = useState(false)
  const [passwordInput,       setPasswordInput]       = useState('')
  const [unlockPasswordInput, setUnlockPasswordInput] = useState('')
  const [unlockError,         setUnlockError]         = useState(false)

  // ── Confirm modal ─────────────────────────
  const [showConfirmModal,    setShowConfirmModal]    = useState(false)
  const [confirmMessage,      setConfirmMessage]      = useState('')
  const [confirmAction,       setConfirmAction]       = useState(null)

  // ── Toasts ────────────────────────────────
  const [toasts,              setToasts]              = useState([])

  // ── Cloud / loading ───────────────────────
  const [loading,             setLoading]             = useState(true)
  const [isCloudEnabled,      setIsCloudEnabled]      = useState(false)

  // ── RSVP data ─────────────────────────────
  const [rsvps,               setRsvps]               = useState(DEFAULT_RSVPS)
  //const [newRsvp,             setNewRsvp]             = useState({
  //  name: '', attending: 'si', diet: '', carOption: 'passenger', carSeats: 4, notes: '',
  //})

  // ── Sessione locale (utente che si è registrato) ──
  const [registeredRsvpId,    setRegisteredRsvpId]    = useState(() => localStorage.getItem('tb_registered_rsvp_id') || '')
  const [registeredName,      setRegisteredName]      = useState(() => localStorage.getItem('tb_registered_name') || '')

  // Ref per evitare sync ciclici con l'onSnapshot dei settings
  const isSyncingFromCloud = useRef(false)

  // ─────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────
  const showNotification = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  // ─────────────────────────────────────────────
  // FIREBASE INIT
  // ─────────────────────────────────────────────
  useEffect(() => {
    let unsubRsvps    = null
    let unsubSettings = null

    async function init() {
      try {
        // Login anonimo
        const credential = await signInAnonymously(auth)
        if (!credential.user) {
          setLoading(false)
          return
        }

        setIsCloudEnabled(true)

        const rsvpsRef    = collection(db, 'artifacts', APP_ID, 'public', 'data', 'rsvps')
        const settingsRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'settings', 'global')

        // ── Listener RSVP ──────────────────────
        unsubRsvps = onSnapshot(
          query(rsvpsRef),
          (snap) => {
            const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
            setRsvps(list)
            // Se l'utente registrato è stato eliminato, pulisce la sessione locale
            const storedId = localStorage.getItem('tb_registered_rsvp_id')
            if (storedId && !list.find(r => r.id === storedId)) {
              clearLocalSession()
            }
          },
          (err) => {
            console.error('onSnapshot RSVP error', err)
            showNotification('Impossibile caricare iscritti dal Cloud.', 'error')
          }
        )

        // ── Listener Settings ──────────────────
        unsubSettings = onSnapshot(
          settingsRef,
          async (snap) => {
            if (snap.exists()) {
              const data = snap.data()
              // Imposta il flag prima di aggiornare lo stato
              // per evitare che il useEffect di sync ri-scriva subito su Firestore
              isSyncingFromCloud.current = true
              if (data.selectedWinnerIndex !== undefined) setSelectedWinnerIndex(parseInt(data.selectedWinnerIndex))
              if (data.isLocked !== undefined) {
                setIsLocked(data.isLocked)
                if (data.isLocked) setViewModeRaw('team')
              }
              if (data.savedPassword !== undefined) setSavedPassword(data.savedPassword)
              if (data.options !== undefined && Array.isArray(data.options)) setOptions(data.options)
              // Reset flag dopo il prossimo render
              setTimeout(() => { isSyncingFromCloud.current = false }, 100)
            } else {
              // Prima volta: inizializza il documento settings
              await setDoc(settingsRef, {
                selectedWinnerIndex: 1,
                isLocked: false,
                savedPassword: '',
                options: DEFAULT_OPTIONS,
              }).catch(err => console.error('Inizializzazione settings fallita', err))
            }
          },
          (err) => {
            console.error('onSnapshot settings error', err)
            showNotification('Errore caricamento impostazioni.', 'error')
          }
        )

        showNotification('Database di Team connesso!', 'success')
      } catch (err) {
        console.error('Errore init Firebase', err)
        setIsCloudEnabled(false)
        showNotification('Cloud non disponibile. Uso dati locali.', 'error')
      } finally {
        setLoading(false)
      }
    }

    init()

    // Cleanup listener al dismount
    return () => {
      unsubRsvps?.()
      unsubSettings?.()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────
  // SYNC SETTINGS → FIRESTORE
  // Unica funzione centralizzata per salvare settings.
  // Accetta overrides per forzare valori specifici prima
  // che lo stato React abbia completato l'aggiornamento.
  // ─────────────────────────────────────────────
  const syncSettings = useCallback(async (overrides = {}) => {
    if (!isCloudEnabled) return
    try {
      const settingsRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'settings', 'global')
      // Usa i valori correnti dello state + eventuali override
      await setDoc(
        settingsRef,
        {
          selectedWinnerIndex,
          isLocked,
          savedPassword,
          options: JSON.parse(JSON.stringify(options)),
          ...overrides,
        },
        { merge: true }
      )
    } catch (err) {
      console.error('Errore sync settings', err)
    }
  }, [isCloudEnabled, selectedWinnerIndex, isLocked, savedPassword, options])

  // ── Auto-sync selectedWinnerIndex quando cambia (es. dal <select> nell'header) ──
  useEffect(() => {
    if (!isCloudEnabled || isSyncingFromCloud.current) return
    syncSettings({ selectedWinnerIndex })
  }, [selectedWinnerIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─────────────────────────────────────────────
  // VIEW MODE
  // ─────────────────────────────────────────────
  const setViewMode = useCallback((mode) => {
    if (!ENABLE_MANAGER_VIEW && mode === 'manager') {
      setViewModeRaw('team')
      setCurrentSlide(0)
      setEditMode(false)
      return
    }

    // Se è bloccato e tenta di andare in Manager → apri modal unlock
    if (isLocked && mode === 'manager') {
      setUnlockPasswordInput('')
      setUnlockError(false)
      setShowUnlockModal(true)
      return
    }
    setViewModeRaw(mode)
    setCurrentSlide(0)
    setEditMode(false)
  }, [isLocked])

  // Numero totale di slide in base alla modalità corrente
  const totalSlides = (() => {
    if (viewMode === 'carpooling') return 1
    if (viewMode === 'manager' && !isLocked) return options.length + 3 // opzioni + confronto + report + voto
    return 4 // team: form + winner + carpooling + success
  })()

  const nextSlide = useCallback(() => setCurrentSlide(s => Math.min(s + 1, totalSlides - 1)), [totalSlides])
  const prevSlide = useCallback(() => setCurrentSlide(s => Math.max(s - 1, 0)), [])

  // ─────────────────────────────────────────────
  // LOCK / UNLOCK
  // ─────────────────────────────────────────────
  const openLockModal = () => {
    setPasswordInput(savedPassword)
    setShowLockModal(true)
  }

  const confirmAndLock = async () => {
    if (!passwordInput.trim()) {
      showNotification('Inserisci una password valida per proteggere la presentazione.', 'error')
      return
    }
    const newPwd = passwordInput.trim()
    setSavedPassword(newPwd)
    setIsLocked(true)
    setViewModeRaw('team')
    setCurrentSlide(0)
    setEditMode(false)
    setShowLockModal(false)
    await syncSettings({ isLocked: true, savedPassword: newPwd })
    showNotification('Presentazione bloccata! Pronta per il team.', 'success')
  }

  const openUnlockModal = () => {
    setUnlockPasswordInput('')
    setUnlockError(false)
    setShowUnlockModal(true)
  }

  const unlockApp = async () => {
    if (unlockPasswordInput === savedPassword) {
      setIsLocked(false)
      setViewModeRaw(ENABLE_MANAGER_VIEW ? 'manager' : 'team')
      setCurrentSlide(0)
      setShowUnlockModal(false)
      await syncSettings({ isLocked: false })
      showNotification(ENABLE_MANAGER_VIEW ? 'Pannello Manager sbloccato!' : 'Applicazione ripristinata alla vista Team.', 'success')
    } else {
      setUnlockError(true)
    }
  }

  // ─────────────────────────────────────────────
  // OPTIONS CRUD
  // ─────────────────────────────────────────────
  const updateOption = (index, field, value) => {
    setOptions(prev => prev.map((o, i) => i === index ? { ...o, [field]: value } : o))
  }

  const saveOptions = async (overrideOptions = options) => {
    const normalized = JSON.parse(JSON.stringify(overrideOptions))
    setOptions(normalized)
    await syncSettings({ options: normalized })
    showNotification('Modifiche salvate nel Cloud!', 'success')
  }

  // ─────────────────────────────────────────────
  // Storage: upload / delete immagini per le opzioni
  // ─────────────────────────────────────────────
  const uploadOptionImage = async (file, index, onProgress) => {
    if (!file) throw new Error('Nessun file fornito')
    if (!storage) throw new Error('Firebase Storage non configurato')
    try {
      const path = `artifacts/${APP_ID}/public/assets/options/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      const ref = storageRef(storage, path)
      const uploadTask = uploadBytesResumable(ref, file)
      return await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          if (onProgress) onProgress(pct)
        }, (err) => {
          console.error('Upload error', err)
          reject(err)
        }, async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            // aggiorna lo state e salva esplicitamente la versione aggiornata
            const updated = options.map((o, i) => i === index ? { ...o, image: url } : o)
            setOptions(updated)
            await syncSettings({ options: JSON.parse(JSON.stringify(updated)) })
            resolve(url)
          } catch (e) { reject(e) }
        })
      })
    } catch (err) {
      console.error('Errore upload immagine opzione', err)
      throw err
    }
  }

  const deleteOptionImage = async (url) => {
    if (!url) return
    try {
      // attempt to derive ref from URL (works for same bucket)
      const decode = decodeURIComponent(url)
      const parts = decode.split('/o/')
      if (parts.length < 2) return
      const fullPath = parts[1].split('?')[0]
      const ref = storageRef(storage, fullPath)
      await deleteObject(ref)
    } catch (err) {
      console.warn('Eliminazione immagine fallita o non disponibile:', err)
    }
  }

  const uploadOptionPdf = async (file, index, onProgress) => {
    if (!file) throw new Error('Nessun file fornito')
    if (!storage) throw new Error('Firebase Storage non configurato')
    try {
      const path = `artifacts/${APP_ID}/public/assets/options_pdfs/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      const ref = storageRef(storage, path)
      const uploadTask = uploadBytesResumable(ref, file)
      return await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          if (onProgress) onProgress(pct)
        }, (err) => {
          console.error('Upload error', err)
          reject(err)
        }, async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref)
            const updated = options.map((o, i) => i === index ? { ...o, pdf: url } : o)
            setOptions(updated)
            await syncSettings({ options: JSON.parse(JSON.stringify(updated)) })
            resolve(url)
          } catch (e) { reject(e) }
        })
      })
    } catch (err) {
      console.error('Errore upload PDF opzione', err)
      throw err
    }
  }

  const deleteOptionPdf = async (url) => {
    if (!url) return
    try {
      const decode = decodeURIComponent(url)
      const parts = decode.split('/o/')
      if (parts.length < 2) return
      const fullPath = parts[1].split('?')[0]
      const ref = storageRef(storage, fullPath)
      await deleteObject(ref)
    } catch (err) {
      console.warn('Eliminazione PDF fallita o non disponibile:', err)
    }
  }

  const addNewOption = async () => {
    const char = String.fromCharCode(65 + options.length)
    const newOpt = {
      id: options.length + 1,
      title: `Nuova Opzione ${char}`,
      tagline: 'Descrizione sintetica del concept di questa opzione.',
      location: 'Inserisci Location',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
      morningActivity: 'Attività di team building programmata per la mattina.',
      lunch: 'Dettagli sul pranzo pomeridiano.',
      physicalLevel: 'Media',
      alcoholVibe: 'Moderato',
      logistics: 'Semplice',
      budget: 100,
    }
    const updated = [...options, newOpt]
    setOptions(updated)
    await syncSettings({ options: updated })
    showNotification(`Aggiunta Opzione ${char}`, 'success')
  }

  const askDeleteOption = (index) => {
    const char = String.fromCharCode(65 + index)
    setConfirmMessage(`Sei sicuro di voler rimuovere definitivamente l'Opzione ${char}? Questa azione aggiornerà anche il database Cloud.`)
    setConfirmAction(() => async () => {
      const updated = options.filter((_, i) => i !== index)
      setOptions(updated)
      setCurrentSlide(0)
      await syncSettings({ options: updated })
      showNotification('Opzione rimossa.', 'success')
      setShowConfirmModal(false)
    })
    setShowConfirmModal(true)
  }

  // ─────────────────────────────────────────────
  // RSVP — HELPERS
  // ─────────────────────────────────────────────
  function clearLocalSession() {
    setRegisteredRsvpId('')
    setRegisteredName('')
    localStorage.removeItem('tb_registered_rsvp_id')
    localStorage.removeItem('tb_registered_name')
}

  const updateRsvpInCloud = async (rsvp) => {
    if (!isCloudEnabled || !rsvp.id) return
    try {
      const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'rsvps', rsvp.id)
      await updateDoc(docRef, { assignedDriver: rsvp.assignedDriver ?? null })
    } catch (err) {
      console.error('Errore salvataggio assegnazione auto', err)
    }
  }

  // ─────────────────────────────────────────────
  // RSVP — SUBMIT
  // ─────────────────────────────────────────────
  const submitRsvp = async (formData) => {
    if (!formData.name.trim()) {
      showNotification('Inserisci il tuo nome prima di confermare.', 'error')
      return
    }

    // Controllo duplicato: stesso nome già registrato da un altro utente
    const nameLower = formData.name.trim().toLowerCase()
    const existing  = rsvps.find(r => r.name.toLowerCase() === nameLower)

    if (existing && !registeredRsvpId) {
      setConfirmMessage(`Esiste già una registrazione per "${formData.name}". Vuoi sostituirla ed aggiornare i tuoi dati di trasporto?`)
      setConfirmAction(() => async () => {
        // Prende possesso del record esistente
        setRegisteredRsvpId(existing.id)
        setRegisteredName(existing.name)
        localStorage.setItem('tb_registered_rsvp_id', existing.id)
        localStorage.setItem('tb_registered_name', existing.name)
        await saveRsvpProcess(formData, existing.id)
        setShowConfirmModal(false)
      })
      setShowConfirmModal(true)
      return
    }

    await saveRsvpProcess(formData, registeredRsvpId || null)
  }

  const saveRsvpProcess = async (formData, targetId) => {
    const dataToSave = {
        name: formData.name.trim(),
      replyEmail: formData.replyEmail || '',
        attending: formData.attending,
        carOption: formData.attending === 'si' ? formData.carOption : 'autonomous',
        carSeats:
        formData.attending === 'si' && formData.carOption === 'driver'
          ? (Math.max(1, Math.min(5, parseInt(formData.carSeats, 10) || 1)))
          : 0,
        notes: formData.notes || '',
        createdAt: new Date().toISOString(),
    }

    // Mantieni l'assignedDriver se il record esiste già ed è passeggero
    if (targetId) {
      const prev = rsvps.find(r => r.id === targetId)
      dataToSave.assignedDriver = (prev && prev.assignedDriver && dataToSave.carOption === 'passenger')
        ? prev.assignedDriver
        : null
    } else {
      dataToSave.assignedDriver = null
    }

    if (isCloudEnabled) {
      try {
        if (targetId) {
          // Aggiorna record esistente
          const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'rsvps', targetId)
          await setDoc(docRef, dataToSave, { merge: true })
          showNotification('Registrazione aggiornata nel Cloud.', 'success')
        } else {
          // Crea nuovo record
          const rsvpsRef = collection(db, 'artifacts', APP_ID, 'public', 'data', 'rsvps')
          const newDoc   = await addDoc(rsvpsRef, dataToSave)
          setRegisteredRsvpId(newDoc.id)
          setRegisteredName(dataToSave.name)
          localStorage.setItem('tb_registered_rsvp_id', newDoc.id)
          localStorage.setItem('tb_registered_name', dataToSave.name)
          showNotification('Grazie! La tua risposta è stata registrata nel Cloud.', 'success')
        }
      } catch (err) {
        console.error('Errore invio RSVP', err)
        showNotification('Errore di connessione. Salvataggio Cloud fallito.', 'error')
        return
      }
    } else {
      // Modalità offline: gestione locale
      if (targetId) {
        setRsvps(prev => prev.map(r => r.id === targetId ? { ...r, ...dataToSave } : r))
        showNotification('Registrazione locale aggiornata.', 'success')
      } else {
        const localId     = Date.now().toString()
        dataToSave.id     = localId
        setRsvps(prev     => [dataToSave, ...prev])
        setRegisteredRsvpId(localId)
        setRegisteredName(dataToSave.name)
        localStorage.setItem('tb_registered_rsvp_id', localId)
        localStorage.setItem('tb_registered_name', dataToSave.name)
        showNotification('Risposta salvata in locale (Anteprima).', 'success')
      }
    }

    // Avanza alla slide successiva
    if (dataToSave.attending === 'no') {
      setCurrentSlide(3) // Slide finale "Grazie"
    } else {
      setCurrentSlide(2) // Slide carpooling
    }
  }

  // ─────────────────────────────────────────────
  // RSVP — DELETE
  // ─────────────────────────────────────────────
  const askDeleteRsvp = (rsvp) => {
    setConfirmMessage(`Vuoi rimuovere l'adesione di ${rsvp.name}?`)
    setConfirmAction(() => async () => {
      // Se era un driver, libera tutti i suoi passeggeri
      if (rsvp.carOption === 'driver') {
        for (const p of rsvps) {
          if (p.assignedDriver === rsvp.name) {
            const updated = { ...p, assignedDriver: null }
            setRsvps(prev => prev.map(r => r.id === p.id ? updated : r))
            await updateRsvpInCloud(updated)
          }
        }
      }

      if (isCloudEnabled && rsvp.id) {
        try {
          const docRef = doc(db, 'artifacts', APP_ID, 'public', 'data', 'rsvps', rsvp.id)
          await deleteDoc(docRef)
          showNotification('Adesione eliminata dal Cloud.', 'success')
        } catch (err) {
          console.error('Errore eliminazione RSVP', err)
          showNotification('Impossibile eliminare dal database.', 'error')
        }
      } else {
        setRsvps(prev => prev.filter(r => r.id !== rsvp.id))
        showNotification('Adesione eliminata.', 'success')
      }

      // Se ha eliminato se stesso, pulisce la sessione locale
      if (rsvp.id === registeredRsvpId) clearLocalSession()
      setShowConfirmModal(false)
    })
    setShowConfirmModal(true)
  }

  // ─────────────────────────────────────────────
  // CARPOOLING
  // ─────────────────────────────────────────────
  const getDrivers            = () => rsvps.filter(r => r.attending === 'si' && r.carOption === 'driver')
  const getUnassignedPassengers = () => rsvps.filter(r => r.attending === 'si' && r.carOption === 'passenger' && !r.assignedDriver)
  const getAssignedToDriver   = (driverName) => rsvps.filter(r => r.attending === 'si' && r.carOption === 'passenger' && r.assignedDriver === driverName)
  const getCurrentUserRsvp    = () => registeredRsvpId ? rsvps.find(r => r.id === registeredRsvpId) ?? null : null
  const totalCarSeatsOffered  = () => rsvps
    .filter(r => r.attending === 'si' && r.carOption === 'driver')
    .reduce((acc, r) => acc + (parseInt(r.carSeats) || 0), 0)

  const assignPassenger = async (passengerId, driverName) => {
    const passenger = rsvps.find(r => r.id === passengerId)
    const driver    = rsvps.find(r => r.name === driverName)
    if (!passenger || !driver) return
    if (getAssignedToDriver(driverName).length >= driver.carSeats) {
      showNotification(`L'auto di ${driverName} è al completo!`, 'error')
      return
    }
    const updated = { ...passenger, assignedDriver: driverName }
    setRsvps(prev => prev.map(r => r.id === passengerId ? updated : r))
    await updateRsvpInCloud(updated)
    showNotification(`${passenger.name} prenotato con successo sull'auto di ${driverName}!`, 'success')
  }

  const unassignPassenger = async (passengerId) => {
    const passenger = rsvps.find(r => r.id === passengerId)
    if (!passenger) return
    const updated = { ...passenger, assignedDriver: null }
    setRsvps(prev => prev.map(r => r.id === passengerId ? updated : r))
    await updateRsvpInCloud(updated)
    showNotification('Posto auto liberato.', 'info')
  }

  // ─────────────────────────────────────────────
  // EXPORT EXCEL (multi-foglio, formato .xls)
  // ─────────────────────────────────────────────
  const escapeXml = (unsafe) => {
    if (!unsafe) return ''
    return unsafe.toString().replace(/[<>&'"]/g, (c) => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
    }[c] || c))
  }

  const exportToExcel = () => {
    if (!rsvps.length) { showNotification('Nessun dato da esportare.', 'error'); return }

    let xml = `<?xml version="1.0" encoding="utf-8"?><?mso-application progid="Excel.Sheet"?>`
    xml += `<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">`
    xml += `<Styles>`
    xml += `<Style ss:ID="Header"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#4F46E5" ss:Pattern="Solid"/></Style>`
    xml += `<Style ss:ID="SubHeader"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#F43F5E" ss:Pattern="Solid"/></Style>`
    xml += `<Style ss:ID="Bold"><Font ss:Bold="1"/></Style>`
    xml += `<Style ss:ID="Title"><Font ss:Bold="1" ss:Size="14" ss:Color="#1E1B4B"/></Style>`
    xml += `</Styles>`

    // ── Foglio 1: Adesioni ──
    xml += `<Worksheet ss:Name="Generale Adesioni"><Table>`
    xml += `<Row ss:Height="25"><Cell ss:StyleID="Title" ss:MergeAcross="5"><Data ss:Type="String">REPORT GENERALI ADESIONI - TEAM BUILDING 2026</Data></Cell></Row>`
    xml += `<Row ss:Height="20">`
    xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">Nome Partecipante</Data></Cell>`
    xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">Email</Data></Cell>`
    xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">Presenza</Data></Cell>`
    xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">Scelta Trasporto</Data></Cell>`
    xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">Posti Offerti</Data></Cell>`
    xml += `<Cell ss:StyleID="Header"><Data ss:Type="String">Note Zona Partenza</Data></Cell>`
    xml += `</Row>`
    rsvps.forEach(r => {
      const transport = r.carOption === 'driver' ? 'Offre Passaggi' : r.carOption === 'passenger' ? 'Cerca Passaggio' : 'Spostamento Autonomo'
      xml += `<Row>`
      xml += `<Cell><Data ss:Type="String">${escapeXml(r.name)}</Data></Cell>`
      xml += `<Cell><Data ss:Type="String">${escapeXml(r.replyEmail || '')}</Data></Cell>`
      xml += `<Cell><Data ss:Type="String">${escapeXml(r.attending?.toUpperCase())}</Data></Cell>`
      xml += `<Cell><Data ss:Type="String">${transport}</Data></Cell>`
      xml += `<Cell><Data ss:Type="Number">${r.carOption === 'driver' ? (r.carSeats || 0) : 0}</Data></Cell>`
      xml += `<Cell><Data ss:Type="String">${escapeXml(r.notes)}</Data></Cell>`
      xml += `</Row>`
    })
    xml += `</Table></Worksheet>`

    // ── Foglio 2: Prenotazione Auto ──
    xml += `<Worksheet ss:Name="Prenotazione Auto"><Table>`
    xml += `<Row ss:Height="25"><Cell ss:StyleID="Title" ss:MergeAcross="3"><Data ss:Type="String">PIANIFICAZIONE PRENOTAZIONE POSTI AUTO</Data></Cell></Row>`
    xml += `<Row ss:Height="20">`
    xml += `<Cell ss:StyleID="SubHeader"><Data ss:Type="String">Conducente Auto</Data></Cell>`
    xml += `<Cell ss:StyleID="SubHeader"><Data ss:Type="String">Posti Totali</Data></Cell>`
    xml += `<Cell ss:StyleID="SubHeader"><Data ss:Type="String">Posti Occupati</Data></Cell>`
    xml += `<Cell ss:StyleID="SubHeader"><Data ss:Type="String">Passeggeri Prenotati</Data></Cell>`
    xml += `</Row>`
    getDrivers().forEach(driver => {
      const passengers     = getAssignedToDriver(driver.name)
      const passengerNames = passengers.length ? passengers.map(p => p.name).join(', ') : 'Nessuno ancora prenotato'
      xml += `<Row>`
      xml += `<Cell ss:StyleID="Bold"><Data ss:Type="String">${escapeXml(driver.name)}</Data></Cell>`
      xml += `<Cell><Data ss:Type="Number">${driver.carSeats}</Data></Cell>`
      xml += `<Cell><Data ss:Type="Number">${passengers.length}</Data></Cell>`
      xml += `<Cell><Data ss:Type="String">${escapeXml(passengerNames)}</Data></Cell>`
      xml += `</Row>`
    })
    const unassigned = getUnassignedPassengers()
    if (unassigned.length) {
      xml += `<Row><Cell><Data ss:Type="String"></Data></Cell></Row>`
      xml += `<Row ss:Height="20"><Cell ss:StyleID="Header" ss:MergeAcross="3"><Data ss:Type="String">PASSEGGERI IN ATTESA DI PRENOTAZIONE (NON ASSEGNATI)</Data></Cell></Row>`
      unassigned.forEach(p => {
        xml += `<Row>`
        xml += `<Cell><Data ss:Type="String">${escapeXml(p.name)}</Data></Cell>`
        xml += `<Cell ss:MergeAcross="2"><Data ss:Type="String">In cerca di passaggio - Note: ${escapeXml(p.notes) || '-'}</Data></Cell>`
        xml += `</Row>`
      })
    }
    xml += `</Table></Worksheet>`
    xml += `</Workbook>`

    const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href      = url
    link.download  = 'TeamBuildingAdesioni_MultiSheet.xls'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotification('Excel multi-foglio generato!', 'success')
  }

  // ─────────────────────────────────────────────
  // CONFIRM MODAL HELPERS
  // ─────────────────────────────────────────────
  const executeConfirmAction = () => { if (confirmAction) confirmAction() }
  const cancelConfirmAction  = () => { setShowConfirmModal(false); setConfirmAction(null) }

  // ─────────────────────────────────────────────
  // CONTEXT VALUE — tutto ciò che i componenti possono usare
  // ─────────────────────────────────────────────
  return (
    <AppContext.Provider value={{
      // UI
      viewMode, setViewMode,
      currentSlide, setCurrentSlide,
      totalSlides, nextSlide, prevSlide,
      editMode, setEditMode,
      reportTab, setReportTab,

      // Settings
      selectedWinnerIndex, setSelectedWinnerIndex,
      isLocked,
      savedPassword,
      options, setOptions, updateOption, saveOptions, addNewOption, askDeleteOption,
      syncSettings,

      // Lock/Unlock
      showLockModal,    setShowLockModal,
      showUnlockModal,  setShowUnlockModal,
      passwordInput,    setPasswordInput,
      unlockPasswordInput, setUnlockPasswordInput,
      unlockError,
      openLockModal, confirmAndLock,
      openUnlockModal, unlockApp,

      // Notifiche / Confirm modal
      toasts,
      showConfirmModal, setShowConfirmModal,
      confirmMessage,
      executeConfirmAction, cancelConfirmAction,

      // Cloud
      loading, isCloudEnabled,

      // RSVP
      rsvps,
      //newRsvp, setNewRsvp,
      submitRsvp, askDeleteRsvp, clearLocalSession,
      registeredRsvpId, registeredName,

      // Carpooling
      getDrivers, getUnassignedPassengers, getAssignedToDriver,
      getCurrentUserRsvp, totalCarSeatsOffered,
      assignPassenger, unassignPassenger,

      // Export
      exportToExcel,
      uploadOptionImage, deleteOptionImage, uploadOptionPdf, deleteOptionPdf,

      // Util
      showNotification,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)

        