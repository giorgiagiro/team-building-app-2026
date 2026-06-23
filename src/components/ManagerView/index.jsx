import { useApp } from '../../context/AppContext'
import SlideNav from '../shared/SlideNav'

export default function ManagerView() {
  const {
    currentSlide,
    options,
    selectedWinnerIndex,
    editMode, setEditMode,
    updateOption,
    addNewOption,
    askDeleteOption,
    saveOptions,
    rsvps,
    askDeleteRsvp,
    getDrivers,
    getAssignedToDriver,
    getUnassignedPassengers,
    totalCarSeatsOffered,
    exportToExcel,
    reportTab, setReportTab,
    assignPassenger, unassignPassenger, setCurrentSlide, isCloudEnabled
  } = useApp()

  // Struttura slide:
  // 0          = intro/benvenuto
  // 1..N       = una slide per opzione
  // N+1        = confronto comparativo
  // N+2        = report adesioni

  const introSlide   = 0
  const compareSlide = options.length + 1
  const reportSlide  = options.length + 2
  const lastOptionSlide = options.length


   // ── Slide 0: Benvenuto Manager ────────────────────────────────
  const IntroSlide = () => (
    <div className="space-y-6 slide-enter">
      <div className="flex items-center space-x-2 text-indigo-400">
        <span className="h-1 w-8 bg-indigo-500 rounded-full" />
        <span className="text-xs uppercase font-extrabold tracking-widest">Presentazione Decisionale</span>
      </div>

      <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
        Team Building{' '}
        <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
          Autunno 2026
        </span>
      </h2>

      <p className="text-lg text-slate-300 leading-relaxed max-w-3xl">
        Benvenuto nel pannello decisionale. Qui puoi valutare le opzioni di team building pensate
        per il nostro team di circa 30 persone, complete di costi stimati e dettagli operativi.
        Una volta concordata l'opzione con il tuo manager, potrai fare clic su{' '}
        <strong className="text-amber-400">"Proteggi &amp; Condividi"</strong> in alto: la
        presentazione si bloccherà nella sola{' '}
        <strong className="text-rose-400">"Vista Team"</strong> nascondendo tutti i budget
        aziendali e attivando il form di carpooling.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-slate-900">
        <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/50">
          <span className="text-slate-500 text-xs block uppercase font-bold">Target Team</span>
          <span className="text-white font-extrabold text-lg">~30 Persone</span>
        </div>
        <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/50">
          <span className="text-slate-500 text-xs block uppercase font-bold">Timing Ottimale</span>
          <span className="text-white font-extrabold text-lg">09:00 – 17:00</span>
        </div>
        <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/50">
          <span className="text-slate-500 text-xs block uppercase font-bold">Stato Database</span>
          <span className={`font-extrabold text-sm flex items-center gap-1.5 mt-1 ${isCloudEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${isCloudEnabled ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isCloudEnabled ? 'Cloud Sincronizzato' : 'Offline / In memoria'}
          </span>
        </div>
        <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/50">
          <span className="text-slate-500 text-xs block uppercase font-bold">Logistica Base</span>
          <span className="text-white font-extrabold text-lg">Auto / Bus</span>
        </div>
      </div>
    </div>
  )

  // ── Slide Opzione ──────────────────────────────────────────────
  const OptionSlide = ({ opt, index }) => {
    const isWinner = index === parseInt(selectedWinnerIndex)
    return (
      <div className="space-y-6 slide-enter">
        {/* Badge + titolo */}
        <div>
          <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
            <span className={`text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${opt.badgeColor}`}>
              Opzione {String.fromCharCode(65 + index)}{isWinner ? ' 🏆 Vincitrice' : ''}
            </span>
            {options.length > 1 && (
              <button
                onClick={() => askDeleteOption(index)}
                className="text-xs bg-rose-900/40 border border-rose-700/50 text-rose-400 px-3 py-1 rounded-lg hover:bg-rose-900/60 transition-all"
              >
                🗑 Rimuovi opzione
              </button>
            )}
          </div>

          {editMode ? (
            <>
              <input
                className="block text-3xl font-extrabold bg-transparent border-b border-indigo-500 text-white focus:outline-none w-full mb-1"
                value={opt.title}
                onChange={e => updateOption(index, 'title', e.target.value)}
              />
              <input
                className="block text-slate-400 text-sm bg-transparent border-b border-slate-700 focus:outline-none w-full"
                value={opt.tagline}
                onChange={e => updateOption(index, 'tagline', e.target.value)}
              />
            </>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold text-white">{opt.title}</h2>
              <p className="text-slate-400 mt-1">{opt.tagline}</p>
            </>
          )}
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
            <span>📍</span>
            {editMode ? (
              <input
                className="bg-transparent border-b border-slate-700 text-slate-400 text-sm focus:outline-none flex-1"
                value={opt.location}
                onChange={e => updateOption(index, 'location', e.target.value)}
              />
            ) : opt.location}
          </p>
        </div>

        {/* Griglia dettagli */}
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { label: '🌄 Attività Mattutina', field: 'morningActivity', rows: 3 },
            { label: '🍽️ Pranzo / Pomeriggio', field: 'lunch', rows: 3 },
          ].map(({ label, field, rows }) => (
            <div key={field} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
              {editMode ? (
                <textarea
                  className="w-full bg-transparent text-slate-300 text-sm focus:outline-none resize-none border-b border-slate-700"
                  rows={rows}
                  value={opt[field]}
                  onChange={e => updateOption(index, field, e.target.value)}
                />
              ) : (
                <p className="text-slate-300 text-sm leading-relaxed">{opt[field]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Badge metriche */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: '💪 Intensità fisica', field: 'physicalLevel' },
            { label: '🍻 Vibe alcolico',    field: 'alcoholVibe' },
            { label: '🚗 Logistica',        field: 'logistics' },
          ].map(({ label, field }) => (
            <div key={field} className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">{label}:</span>
              {editMode ? (
                <input
                  className="bg-transparent text-white text-xs font-bold focus:outline-none border-b border-slate-700 w-28"
                  value={opt[field]}
                  onChange={e => updateOption(index, field, e.target.value)}
                />
              ) : (
                <span className="text-white text-xs font-bold">{opt[field]}</span>
              )}
            </div>
          ))}

          {/* Budget */}
          <div className="bg-indigo-950/50 border border-indigo-800/50 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-xs text-indigo-400 font-semibold">💶 Budget:</span>
            {editMode ? (
              <input
                type="number"
                className="bg-transparent text-indigo-300 text-sm font-extrabold focus:outline-none border-b border-indigo-500 w-20"
                value={opt.budget}
                onChange={e => updateOption(index, 'budget', parseInt(e.target.value) || 0)}
              />
            ) : (
              <span className="text-indigo-300 font-extrabold">~€{opt.budget}/persona</span>
            )}
          </div>
        </div>

        {/* Bottone salva (solo in editMode) */}
        {editMode && (
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => { saveOptions(); setEditMode(false) }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            >
              💾 Salva tutte le modifiche
            </button>
            {currentSlide === lastOptionSlide && (
              <button
                onClick={addNewOption}
                className="border border-dashed border-slate-700 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              >
                + Aggiungi opzione
              </button>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Slide Confronto ────────────────────────────────────────────
  const CompareSlide = () => (
    <div className="space-y-5 slide-enter">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">📊 Confronto</span>
        <h2 className="text-2xl font-extrabold text-white mt-1">Riepilogo Comparativo</h2>
        <p className="text-slate-400 text-sm mt-1">Panoramica side-by-side di tutte le opzioni.</p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/60">
              <th className="text-left py-3 px-4 text-slate-400 font-semibold">Criterio</th>
              {options.map((opt, i) => (
                <th key={i} className={`text-center py-3 px-4 font-bold ${i === parseInt(selectedWinnerIndex) ? 'text-amber-400' : 'text-white'}`}>
                  {i === parseInt(selectedWinnerIndex) ? '🏆 ' : ''}
                  {String.fromCharCode(65 + i)} — {opt.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['📍 Location',     'location'],
              ['💪 Intensità',    'physicalLevel'],
              ['🍻 Vibe alcol',   'alcoholVibe'],
              ['🚗 Logistica',    'logistics'],
              ['💶 Budget',       'budget'],
            ].map(([label, field]) => (
              <tr key={field} className="border-b border-slate-900 hover:bg-slate-900/40 transition-colors">
                <td className="py-3 px-4 text-slate-400 font-semibold">{label}</td>
                {options.map((opt, i) => (
                  <td key={i} className={`py-3 px-4 text-center ${i === parseInt(selectedWinnerIndex) ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                    {field === 'budget' ? `€${opt[field]}/pp` : opt[field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── Slide Report / Adesioni ────────────────────────────────────
  const ReportSlide = () => {
    const attending    = rsvps.filter(r => r.attending === 'si')
    const notAttending = rsvps.filter(r => r.attending === 'no')
    const drivers      = rsvps.filter(r => r.attending === 'si' && r.carOption === 'driver')
    const passengers   = rsvps.filter(r => r.attending === 'si' && r.carOption === 'passenger')
    const autonomous   = rsvps.filter(r => r.attending === 'si' && r.carOption === 'autonomous')
    const dietCounts   = attending.reduce((acc, r) => {
      const d = r.diet || 'Nessuna'
      acc[d] = (acc[d] || 0) + 1
      return acc
    }, {})

    const transportLabel = (r) => {
      if (r.carOption === 'driver')    return `🚗 Guida (${r.carSeats} posti)`
      if (r.carOption === 'passenger') return r.assignedDriver ? `🙋 con ${r.assignedDriver}` : '🙋 Cerca passaggio'
      return '🚶 Autonomo'
    }

    return (
      <div className="space-y-5 slide-enter">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">📋 Dashboard</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">Adesioni & Report</h2>
          </div>
          <div className="flex gap-2 flex-wrap">
<span className="bg-emerald-900/40 border border-emerald-800 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl">✅ {attending.length} presenti</span>
            <span className="bg-rose-900/40 border border-rose-800 text-rose-400 text-xs font-bold px-3 py-1.5 rounded-xl">❌ {notAttending.length} assenti</span>
            <button onClick={exportToExcel} className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all">📊 Excel</button>
          </div>
        </div>

        {/* Tab */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
          {[
            { id: 'booking', label: '📋 Prenotazioni' },
            { id: 'stats',   label: '📈 Statistiche' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setReportTab(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${reportTab === id ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab: tabella adesioni */}
        {reportTab === 'booking' && (
          <div className="overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="sticky top-0 bg-slate-950">
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="text-left py-2 px-3">Nome</th>
                  <th className="text-left py-2 px-3">Presenza</th>
                  <th className="text-left py-2 px-3">Dieta</th>
                  <th className="text-left py-2 px-3">Trasporto</th>
                  <th className="text-left py-2 px-3">Note</th>
                  <th className="py-2 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {rsvps.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-500">Nessuna adesione ancora ricevuta.</td></tr>
                )}
                {rsvps.map(r => (
                  <tr key={r.id} className="border-b border-slate-900 hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white">{r.name}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.attending === 'si' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-rose-900/50 text-rose-400'}`}>
                        {r.attending === 'si' ? '✅ Sì' : '❌ No'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">{r.diet || '—'}</td>
                    <td className="py-2.5 px-3 text-slate-300 text-xs">{transportLabel(r)}</td>
                    <td className="py-2.5 px-3 text-slate-400 text-xs max-w-[140px] truncate">{r.notes || '—'}</td>
                    <td className="py-2.5 px-3">
                      <button onClick={() => askDeleteRsvp(r)} className="text-rose-500 hover:text-rose-400 text-xs font-bold transition-colors">Rimuovi</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: statistiche */}
        {reportTab === 'stats' && (
          <div className="grid md:grid-cols-3 gap-4">
            {/* KPI */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">📊 KPI</p>
              {[
                ['Totale risposte', rsvps.length,       'text-white'],
                ['Presenti',        attending.length,    'text-emerald-400'],
                ['Assenti',         notAttending.length, 'text-rose-400'],
              ].map(([label, val, cls]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span className={`font-extrabold text-lg ${cls}`}>{val}</span>
                </div>
              ))}
            </div>

            {/* Trasporti */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">🚗 Trasporti</p>
              {[
                ['Guidatori',         drivers.length,   'text-emerald-400'],
                ['Cercano passaggio', passengers.length,'text-amber-400'],
                ['Autonomi',          autonomous.length, 'text-slate-400'],
              ].map(([label, val, cls]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">{label}</span>
                  <span className={`font-extrabold text-lg ${cls}`}>{val}</span>
                </div>
              ))}
            </div>

            {/* Diete */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">🥗 Diete</p>
              {Object.entries(dietCounts).length === 0
                ? <p className="text-slate-500 text-xs">Nessun dato</p>
                : Object.entries(dietCounts).map(([diet, count]) => (
                    <div key={diet} className="flex justify-between items-center">
                      <span className="text-slate-400 text-sm">{diet}</span>
                      <span className="font-extrabold text-indigo-400">{count}</span>
                    </div>
                  ))
              }
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Slide Carpooling (vista manager) ───────────────────────────
  const CarpoolingSlide = () => {
  const drivers    = getDrivers()
  const unassigned = getUnassignedPassengers()
  const autonomous = rsvps.filter(r => r.attending === 'si' && r.carOption === 'autonomous')
  const total      = totalCarSeatsOffered()
  const assigned   = rsvps.filter(r => r.attending === 'si' && r.carOption === 'passenger' && r.assignedDriver).length
  const pct        = total > 0 ? Math.min(100, Math.round(assigned / total * 100)) : 0

  const handleAssign = (driverId, driverName) => {
    const sel = document.getElementById(`sel-${driverId}`)
    if (sel && sel.value) {
      assignPassenger(sel.value, driverName)
      sel.value = ''
    }
  }

  return (
    <div className="space-y-6 slide-enter">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 mb-1">
            <span className="h-1 w-8 bg-emerald-500 rounded-full" />
            <span className="text-xs uppercase font-extrabold tracking-widest">Logistica Carpooling</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Gestione <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Posti Auto</span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-bold">
          {[
            { icon: '🚗', label: 'Auto',       val: drivers.length,  cls: 'text-white' },
            { icon: '💺', label: 'Posti totali', val: total,          cls: 'text-white' },
            { icon: '✅', label: 'Assegnati',   val: assigned,        cls: 'text-emerald-400' },
            { icon: '⏳', label: 'In attesa',   val: unassigned.length, cls: 'text-amber-400' },
          ].map(({ icon, label, val, cls }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2">
              <span>{icon}</span>
              <span className="text-slate-400">{label}:</span>
              <span className={`font-bold ${cls}`}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupazione posti</span>
          <span className="text-xs font-bold text-white">{assigned} / {total} posti</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Auto disponibili */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
          🚗 Auto disponibili
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.length === 0 && (
            <div className="col-span-full text-center py-12 text-slate-500">
              <div className="text-4xl mb-3">🚗</div>
              <p className="text-sm font-semibold">Nessun conducente registrato</p>
              <p className="text-xs mt-1">Quando qualcuno si registra come autista appare qui.</p>
            </div>
          )}
          {drivers.map(driver => {
            const driverPassengers = getAssignedToDriver(driver.name)
            const freeSeats        = driver.carSeats - driverPassengers.length
            const isFull           = freeSeats <= 0

            return (
              <div key={driver.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">

                {/* Driver header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <span className="text-emerald-400 text-xs">🚗</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{driver.name}</p>
                      <p className="text-xs text-slate-500 italic">{driver.notes || 'Nessuna nota'}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${isFull ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {freeSeats}/{driver.carSeats} liberi
                  </span>
                </div>

                {/* Mini progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: driver.carSeats > 0 ? `${Math.round(driverPassengers.length / driver.carSeats * 100)}%` : '0%' }}
                  />
                </div>

                {/* Passeggeri assegnati + posti liberi */}
                <div className="space-y-1.5">
                  {driverPassengers.map(p => (
                    <div key={p.id} className="flex items-center justify-between bg-slate-950/60 rounded-lg px-2.5 py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-400 text-xs">👤</span>
                        <span className="text-xs font-semibold text-slate-200">{p.name}</span>
                        {p.diet && p.diet !== 'Nessuna' && (
                          <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">{p.diet}</span>
                        )}
                      </div>
                      <button
                        onClick={() => unassignPassenger(p.id)}
                        className="text-rose-500 hover:text-rose-400 text-xs transition-colors"
                        title="Rimuovi assegnazione"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  {/* Posti liberi dashed */}
                  {Array.from({ length: freeSeats }).map((_, i) => (
                    <div key={`slot-${driver.id}-${i}`} className="flex items-center gap-2 bg-slate-950/30 border border-dashed border-slate-800 rounded-lg px-2.5 py-1.5">
                      <span className="text-slate-700 text-xs">···</span>
                      <span className="text-xs text-slate-600 italic">Posto libero</span>
                    </div>
                  ))}
                </div>

                {/* Select assegna passeggero */}
                {!isFull && unassigned.length > 0 && (
                  <div className="border-t border-slate-800 pt-3">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-1.5">Assegna passeggero</p>
                    <div className="flex gap-2">
                      <select
                        id={`sel-${driver.id}`}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="">Seleziona...</option>
                        {unassigned.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssign(driver.id, driver.name)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* In attesa + Autonomi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* In attesa di passaggio */}
        <div className="bg-slate-900 border border-amber-500/20 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            ⏳ In attesa di passaggio
            <span className="ml-auto bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">{unassigned.length}</span>
          </p>
          <div className="space-y-2">
            {unassigned.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-4 italic">Tutti assegnati ✅</p>
            )}
            {unassigned.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-slate-950/50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-white">{p.name}</p>
                  <p className="text-xs text-slate-500 italic">{p.notes || 'Nessuna nota'}</p>
                </div>
                {p.diet && p.diet !== 'Nessuna' && (
                  <span className="text-xs bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full">{p.diet}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Spostamento autonomo */}
        <div className="bg-slate-900 border border-slate-700/40 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            🚶 Spostamento autonomo
            <span className="ml-auto bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded-full">{autonomous.length}</span>
          </p>
          <div className="space-y-2">
            {autonomous.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-4 italic">Nessuno.</p>
            )}
            {autonomous.map(p => (
              <div key={p.id} className="flex items-center bg-slate-950/50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-white">{p.name}</p>
                  <p className="text-xs text-slate-500 italic">{p.notes || 'Nessuna nota'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabella riepilogo completo */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
          📋 Riepilogo completo
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300 min-w-[640px]">
            <thead className="bg-slate-900 text-slate-400 uppercase tracking-wider sticky top-0">
              <tr>
                <th className="p-3 font-bold">Nome</th>
                <th className="p-3 font-bold">Ruolo</th>
                <th className="p-3 font-bold">Auto / Passaggio</th>
                <th className="p-3 font-bold">Dieta</th>
                <th className="p-3 font-bold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/20">
              {rsvps.filter(r => r.attending === 'si').length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-slate-600">Nessuna adesione ancora.</td></tr>
              )}
              {rsvps.filter(r => r.attending === 'si').map(r => (
                <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3 font-semibold text-white">{r.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      r.carOption === 'driver'    ? 'bg-emerald-500/20 text-emerald-400' :
                      r.carOption === 'passenger' ? 'bg-indigo-500/20 text-indigo-400'  :
                                                    'bg-slate-700/50 text-slate-400'
                    }`}>
                      {r.carOption === 'driver' ? 'Conducente' : r.carOption === 'passenger' ? 'Passeggero' : 'Autonomo'}
                    </span>
                  </td>
                  <td className="p-3">
                    {r.carOption === 'driver'    && <span className="text-emerald-400 font-semibold">{r.carSeats} posti offerti</span>}
                    {r.carOption === 'passenger' && r.assignedDriver  && <span className="text-indigo-400">Con {r.assignedDriver}</span>}
                    {r.carOption === 'passenger' && !r.assignedDriver && <span className="text-amber-400 italic">Non assegnato</span>}
                    {r.carOption === 'autonomous' && <span className="text-slate-500 italic">—</span>}
                  </td>
                  <td className="p-3 text-slate-400">{r.diet || 'Nessuna'}</td>
                  <td className="p-3 text-slate-500 italic">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

// ── Render ────────────────────────────────────────────────────
  const renderSlide = () => {
    if (currentSlide === introSlide)   return <IntroSlide />
    if (currentSlide === compareSlide) return <CompareSlide />
    if (currentSlide === reportSlide)  return <ReportSlide />
    const optIndex = currentSlide - 1  // slide 1 = option[0], slide 2 = option[1]...
    if (options[optIndex])             return <OptionSlide opt={options[optIndex]} index={optIndex} />
    return <IntroSlide />
  }

  const totalSlides = options.length + 3  // intro + opzioni + confronto + report

  return (
    <div className="max-w-5xl w-full">
      {/* Side panel edit */}
      {editMode && (
        <div className="fixed right-0 top-[73px] bottom-0 w-full md:w-96 bg-slate-900 border-l border-slate-800 z-50 overflow-y-auto p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">⚙️ Modifica opzioni</h3>
            <button onClick={() => setEditMode(false)} className="text-slate-400 hover:text-white text-xl">×</button>
          </div>
          <p className="text-xs text-slate-400 mb-4">Modifica direttamente i campi nelle slide oppure aggiungi nuove opzioni.</p>
          <button
            onClick={addNewOption}
            className="w-full py-3 border border-dashed border-slate-700 hover:border-indigo-500 rounded-xl text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-all flex justify-center items-center gap-2"
          >
            + Aggiungi Nuova Opzione
          </button>
          <button
            onClick={() => { saveOptions(); setEditMode(false) }}
            className="w-full mt-3 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all"
          >
            💾 Salva tutte le modifiche
          </button>
        </div>
      )}

     <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-4 md:p-12 shadow-2xl md:min-h-[550px] flex flex-col justify-between slide-enter">
        <div className="flex-grow">
          {renderSlide()}
        </div>
        <SlideNav totalSlides={totalSlides} />
      </div>
    </div>
    
  )
}