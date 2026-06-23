// Vista dedicata carpooling (accessibile a tutti, anche con isLocked)

import { useApp } from '../../context/AppContext'

export default function CarpoolingView() {
  const {
    rsvps,
    isLocked,
    getDrivers,
    getAssignedToDriver,
    getUnassignedPassengers,
    assignPassenger,
    unassignPassenger,
    totalCarSeatsOffered,
    registeredRsvpId,
    getCurrentUserRsvp,
    registeredName,
    exportToExcel,
  } = useApp()

  const drivers    = getDrivers()
  const unassigned = getUnassignedPassengers()
  const autonomous = rsvps.filter(r => r.attending === 'si' && r.carOption === 'autonomous')
  const total      = totalCarSeatsOffered()
  const assigned   = rsvps.filter(r => r.attending === 'si' && r.carOption === 'passenger' && r.assignedDriver).length
  const pct        = total > 0 ? Math.min(100, Math.round(assigned / total * 100)) : 0

  const currentUser = getCurrentUserRsvp()

  const handleAssign = (driverId, driverName) => {
    const sel = document.getElementById(`sel-${driverId}`)
    if (sel && sel.value) {
      assignPassenger(sel.value, driverName)
      sel.value = ''
    }
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 md:p-12 shadow-2xl slide-enter">
        <div className="space-y-6">

          {/* ── Header ─────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 mb-1">
                <span className="h-1 w-8 bg-emerald-500 rounded-full" />
                <span className="text-xs uppercase font-extrabold tracking-widest">Logistica Carpooling</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">
                Gestione{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Posti Auto
                </span>
              </h2>
            </div>

            {/* Badge KPI */}
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              {[
                { icon: '🚗', label: 'Auto',        val: drivers.length,  cls: 'text-white'       },
                { icon: '💺', label: 'Posti totali', val: total,           cls: 'text-white'       },
                { icon: '✅', label: 'Assegnati',    val: assigned,        cls: 'text-emerald-400' },
                { icon: '⏳', label: 'In attesa',    val: unassigned.length, cls: 'text-amber-400' },
              ].map(({ icon, label, val, cls }) => (
                <div key={label} className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl flex items-center gap-2">
                  <span>{icon}</span>
                  <span className="text-slate-400">{label}:</span>
                  <span className={`font-bold ${cls}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Stato utente corrente (solo se loggato come passeggero) */}
          {registeredRsvpId && currentUser && currentUser.carOption === 'passenger' && (
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 text-xs">
              {!currentUser.assignedDriver
                ? <p className="text-amber-400 font-bold">🙋 Ciao {registeredName}! Cerca un'auto con posti liberi e clicca su "Sali a bordo".</p>
                : (
                  <div className="flex justify-between items-center">
                    <p className="text-emerald-400 font-bold">🎉 Sei prenotato a bordo dell'auto di <strong>{currentUser.assignedDriver}</strong>!</p>
                    <button
                      onClick={() => unassignPassenger(registeredRsvpId)}
                      className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-lg text-[10px] font-bold transition-all"
                    >
                      Scendi dall'auto
                    </button>
                  </div>
                )
              }
            </div>
          )}

          {/* ── Progress bar occupazione ────────────────────────── */}
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

          {/* ── Auto disponibili ────────────────────────────────── */}
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
                const isMyDriver       = currentUser?.assignedDriver === driver.name
                const canBoard         = currentUser?.carOption === 'passenger' && !currentUser?.assignedDriver && !isFull
                const alreadyElsewhere = currentUser?.carOption === 'passenger' && currentUser?.assignedDriver && !isMyDriver

                return (
                  <div key={driver.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">

                    {/* Header card */}
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

                    {/* Lista passeggeri + posti liberi dashed */}
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
                          {/* Bottone rimuovi: manager vede sempre, passeggero solo il suo posto */}
                          {(!isLocked || p.id === registeredRsvpId) && (
                            <button
                              onClick={() => unassignPassenger(p.id)}
                              className="text-rose-500 hover:text-rose-400 text-xs transition-colors"
                              title="Rimuovi assegnazione"
                            >✕</button>
                          )}
                        </div>
                      ))}

                      {Array.from({ length: freeSeats }).map((_, i) => (
                        <div key={`slot-${driver.id}-${i}`} className="flex items-center gap-2 bg-slate-950/30 border border-dashed border-slate-800 rounded-lg px-2.5 py-1.5">
                          <span className="text-slate-700 text-xs">···</span>
                          <span className="text-xs text-slate-600 italic">Posto libero</span>
                        </div>
                      ))}
                    </div>

                    {/* Assegna passeggero (solo manager non bloccato) */}
                    {/*!isLocked && !isFull && unassigned.length > 0 && (*/}
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
                          >+</button>
                        </div>
                      </div>
                    )}

                    {/* Bottone self-service passeggero (vista team bloccata) */}
                    {isLocked && registeredRsvpId && currentUser?.carOption === 'passenger' && (
                      <div className="pt-1">
                        {canBoard && (
                          <button
                            onClick={() => assignPassenger(registeredRsvpId, driver.name)}
                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all"
                          >＋ Sali a bordo</button>
                        )}
                        {isMyDriver && (
                          <button
                            onClick={() => unassignPassenger(registeredRsvpId)}
                            className="w-full py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-all"
                          >✕ Scendi</button>
                        )}
                        {isFull && !isMyDriver && (
                          <button disabled className="w-full py-1.5 bg-slate-800 text-slate-600 font-bold text-xs rounded-lg cursor-not-allowed">
                            Auto al completo
                          </button>
                        )}
                        {alreadyElsewhere && !isFull && (
                          <button disabled className="w-full py-1.5 bg-slate-800 text-slate-600 font-bold text-xs rounded-lg cursor-not-allowed">
                            Già prenotato altrove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── In attesa + Autonomi ────────────────────────────── */}
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

          {/* ── Tabella riepilogo completo ──────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                📋 Riepilogo completo
              </h3>
              {!isLocked && (
                <button
                  onClick={exportToExcel}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-bold transition-all"
                >
                  📊 Esporta Excel
                </button>
              )}
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-72 overflow-y-auto">
              <table className="w-full text-left text-xs text-slate-300">
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
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-600">Nessuna adesione ancora.</td>
                    </tr>
                  )}
                  {rsvps.filter(r => r.attending === 'si').map(r => (
                    <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3 font-semibold text-white">{r.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          r.carOption === 'driver'    ? 'bg-emerald-500/20 text-emerald-400' :
                          r.carOption === 'passenger' ? 'bg-indigo-500/20 text-indigo-400'   :
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
      </div>
    </div>
  )
}