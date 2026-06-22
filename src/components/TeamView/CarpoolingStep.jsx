import { useApp } from '../../context/AppContext'

export default function CarpoolingStep() {
  const { getDrivers, getAssignedToDriver, getUnassignedPassengers, getCurrentUserRsvp, assignPassenger, unassignPassenger, totalCarSeatsOffered, rsvps } = useApp()
  const currentUser = getCurrentUserRsvp()
  const drivers = getDrivers()
  const unassigned = getUnassignedPassengers()
  const assigned = rsvps.filter(r => r.attending === 'si' && r.carOption === 'passenger' && r.assignedDriver).length
  const total = totalCarSeatsOffered()
  const pct = total > 0 ? Math.min(100, Math.round(assigned / total * 100)) : 0

  return (
    <div className="space-y-5">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">🚗 Carpooling</span>
        <h2 className="text-2xl font-extrabold text-white mt-1">Prenota il tuo posto</h2>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        <span className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-300">Auto: {drivers.length}</span>
        <span className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-slate-300">Posti totali: {total}</span>
        <span className="bg-emerald-900/50 border border-emerald-800 px-3 py-2 rounded-xl text-emerald-400">Assegnati: {assigned}</span>
        {unassigned.length > 0 && <span className="bg-amber-900/50 border border-amber-800 px-3 py-2 rounded-xl text-amber-400">In attesa: {unassigned.length}</span>}
      </div>

      {/* Progress */}
      <div className="w-full bg-slate-800 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${pct >= 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Il mio stato */}
      {currentUser && currentUser.carOption === 'passenger' && (
        <div className="bg-indigo-950/50 border border-indigo-800/50 rounded-xl p-4">
          <p className="text-xs font-bold text-indigo-400 mb-2">👤 La tua situazione</p>
          {currentUser.assignedDriver ? (
            <div className="flex items-center justify-between">
              <span className="text-white text-sm">✅ Assegnato a: <strong>{currentUser.assignedDriver}</strong></span>
              <button onClick={() => unassignPassenger(currentUser.id)} className="text-xs text-rose-400 hover:text-rose-300">Libera posto</button>
            </div>
          ) : (
            <p className="text-amber-400 text-sm">⏳ Non ancora assegnato. Prenota un posto qui sotto.</p>
          )}
        </div>
      )}

      {/* Lista auto */}
      <div className="space-y-3 overflow-y-auto max-h-64">
        {drivers.map(driver => {
          const driverPassengers = getAssignedToDriver(driver.name)
          const isFull = driverPassengers.length >= driver.carSeats
          const canBook = currentUser && currentUser.carOption === 'passenger' && !currentUser.assignedDriver && !isFull

          return (
            <div key={driver.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="font-bold text-white">🚗 {driver.name}</span>
                  {driver.notes && <span className="text-slate-500 text-xs ml-2">({driver.notes})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {driverPassengers.length}/{driver.carSeats} posti
                  </span>
                  {canBook && (
                    <button
                      onClick={() => assignPassenger(currentUser.id, driver.name)}
                      className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                    >
                      Prenota
                    </button>
                  )}
                </div>
              </div>
              {driverPassengers.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {driverPassengers.map(p => (
                    <span key={p.id} className="bg-indigo-900/40 text-indigo-300 text-xs px-2 py-0.5 rounded">{p.name}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}