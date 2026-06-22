import { useApp } from '../../context/AppContext'

export default function RegistrationForm() {
  const { newRsvp, setNewRsvp, submitRsvp, registeredName, clearLocalSession } = useApp()

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-rose-400">📋 Registrazione</span>
        <h2 className="text-3xl font-extrabold text-white mt-2">Conferma la tua Presenza</h2>
        {registeredName && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm text-emerald-400 font-semibold">✅ Registrato come: {registeredName}</span>
            <button onClick={clearLocalSession} className="text-xs text-slate-500 hover:text-slate-300 underline">
              (cambia)
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Il tuo nome e cognome *</label>
          <input
            type="text"
            placeholder="Es. Mario Rossi"
            value={newRsvp.name}
            onChange={e => setNewRsvp({ ...newRsvp, name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2">Parteciperai? *</label>
          <div className="flex gap-3">
            {[['si', '✅ Sì, ci sono!', 'emerald'], ['no', '❌ Non posso', 'rose']].map(([val, label, color]) => (
              <button
                key={val}
                onClick={() => setNewRsvp({ ...newRsvp, attending: val })}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${newRsvp.attending === val
                  ? `bg-${color}-900/50 border-${color}-700 text-${color}-300`
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {newRsvp.attending === 'si' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Preferenze alimentari</label>
              <select
                value={newRsvp.diet}
                onChange={e => setNewRsvp({ ...newRsvp, diet: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">Nessuna preferenza</option>
                <option value="Vegetariano">Vegetariano</option>
                <option value="Vegano">Vegano</option>
                <option value="No glutine">Senza glutine</option>
                <option value="No lattosio">Senza lattosio</option>
                <option value="Halal">Halal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Come ti sposti?</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  ['driver', '🚗 Guido io', 'indigo'],
                  ['passenger', '🙋 Cerco passaggio', 'purple'],
                  ['autonomous', '🚶 Mi arrangio', 'slate'],
                ].map(([val, label, color]) => (
                  <button
                    key={val}
                    onClick={() => setNewRsvp({ ...newRsvp, carOption: val })}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${newRsvp.carOption === val
                      ? `bg-${color}-900/50 border-${color}-600 text-${color}-300`
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {newRsvp.carOption === 'driver' && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Posti disponibili in auto (oltre a te)</label>
                <input
                  type="number"
                  min="1" max="8"
                  value={newRsvp.carSeats}
                  onChange={e => setNewRsvp({ ...newRsvp, carSeats: e.target.value })}
                  className="w-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Note / zona di partenza</label>
              <input
                type="text"
                placeholder="Es. Parto da Milano Centrale"
                value={newRsvp.notes}
                onChange={e => setNewRsvp({ ...newRsvp, notes: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </>
        )}

        <button
          onClick={submitRsvp}
          disabled={!newRsvp.name.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-all"
        >
          Conferma Registrazione →
        </button>
      </div>
    </div>
  )
}