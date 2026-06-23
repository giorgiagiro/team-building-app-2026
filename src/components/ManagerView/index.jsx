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
    isCloudEnabled,
  } = useApp()

  // Struttura slide identica all'HTML originale:
  // slide 0..N-1 = opzioni
  // slide N      = confronto
  // slide N+1    = report/adesioni
  // slide N+2    = carpooling manager
  const lastOptionSlide = options.length - 1
  const compareSlide    = options.length
  const reportSlide     = options.length + 1
  const carpoolSlide    = options.length + 2

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
        <table className="w-full text-sm">
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
            <table className="w-full text-sm">
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
    const total      = totalCarSeatsOffered()
    const assigned   = rsvps.filter(r => r.attending === 'si' && r.carOption === 'passenger' && r.assignedDriver).length
    const pct        = total > 0 ? Math.min(100, Math.round(assigned / total * 100)) : 0

    return (
      <div className="space-y-5 slide-enter">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">🚗 Carpooling</span>
            <h2 className="text-2xl font-extrabold text-white mt-1">Gestione Posti Auto</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-bold">
            <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">Auto: {drivers.length}</span>
            <span className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">Posti: {total}</span>
            <span className="bg-emerald-900/40 border border-emerald-800 px-3 py-1.5 rounded-xl text-emerald-400">Assegnati: {assigned}</span>
            {unassigned.length > 0 && <span className="bg-amber-900/40 border border-amber-800 px-3 py-1.5 rounded-xl text-amber-400">In attesa: {unassigned.length}</span>}
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Occupazione posti</span>
            <span className="text-xs font-bold text-white">{assigned}/{total} posti</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Lista auto */}
        <div className="grid md:grid-cols-2 gap-3 max-h-56 overflow-y-auto">
          {drivers.map(driver => {
            const driverPassengers = getAssignedToDriver(driver.name)
            const isFull = driverPassengers.length >= driver.carSeats
            return (
              <div key={driver.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-white">🚗 {driver.name}</span>
                  <span className={`text-xs font-bold ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {driverPassengers.length}/{driver.carSeats} posti
                  </span>
                </div>
                {driver.notes && <p className="text-slate-500 text-xs mb-2">{driver.notes}</p>}
                <div className="flex flex-wrap gap-1">
                  {driverPassengers.length === 0
                    ? <span className="text-slate-600 text-xs">Nessun passeggero ancora</span>
                    : driverPassengers.map(p => (
                        <span key={p.id} className="bg-indigo-900/40 text-indigo-300 text-xs px-2 py-0.5 rounded">{p.name}</span>
                      ))
                  }
                </div>
              </div>
            )
          })}
        </div>

        {/* Passeggeri in attesa */}
        {unassigned.length > 0 && (
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-4">
            <p className="text-xs font-bold text-amber-400 mb-2">⏳ Passeggeri senza auto ({unassigned.length})</p>
            <div className="flex flex-wrap gap-2">
              {unassigned.map(p => (
                <span key={p.id} className="bg-amber-900/30 text-amber-300 text-xs px-2 py-1 rounded-lg">{p.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Render slide corrente ──────────────────────────────────────
  const renderSlide = () => {
    if (currentSlide <= lastOptionSlide) return <OptionSlide opt={options[currentSlide]} index={currentSlide} />
    if (currentSlide === compareSlide)   return <CompareSlide />
    if (currentSlide === reportSlide)    return <ReportSlide />
    if (currentSlide === carpoolSlide)   return <CarpoolingSlide />
    return null
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 md:p-12 shadow-2xl min-h-[550px] flex flex-col justify-between slide-enter">
        <div className="flex-grow">{renderSlide()}</div>
        <SlideNav />
      </div>
    </div>
  )
}