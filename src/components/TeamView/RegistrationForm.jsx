import { useCallback, useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'

const getInitialForm = () => ({
  name: '',
  replyEmail: '',
  attending: 'si',
  diet: '',
  carOption: 'passenger',
  carSeats: 1,
  notes: '',
})

export default function RegistrationForm({ onSubmitted } = {}) {
  const {
    submitRsvp,
    registeredName,
    registeredRsvpId,
    clearLocalSession,
    getCurrentUserRsvp,
  } = useApp()

  const [formData, setFormData] = useState(getInitialForm())

  const handleField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  useEffect(() => {
    const current = getCurrentUserRsvp?.()
    if (current) {
      setFormData({
        name: current.name || '',
        replyEmail: current.replyEmail || '',
        attending: current.attending || 'si',
        diet: current.diet && current.diet !== 'Nessuna' ? current.diet : '',
        carOption: current.carOption || 'passenger',
        carSeats: (() => {
          const cs = parseInt(current.carSeats, 10)
          if (!Number.isNaN(cs) && cs > 0) return Math.max(1, Math.min(5, cs))
          return current.carOption === 'driver' ? 1 : 0
        })(),
        notes: current.notes || '',
      })
    } else {
      setFormData(getInitialForm())
    }
  }, [registeredRsvpId, getCurrentUserRsvp])

  useEffect(() => {
    if (formData.attending === 'no') {
      setFormData(prev => ({
        ...prev,
        diet: '',
        carOption: 'autonomous',
        carSeats: 0,
        notes: '',
      }))
    }
  }, [formData.attending])

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    await submitRsvp(formData)
    if (onSubmitted) onSubmitted()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-indigo-400">
        <span className="h-1 w-8 bg-indigo-500 rounded-full" />
        <span className="text-xs uppercase font-extrabold tracking-widest">
          Conferma la tua presenza
        </span>
      </div>

      <div className="flex justify-between items-center gap-3 flex-wrap">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white">
          Completa l'adesione
        </h2>

        {registeredName && (
          <button
            type="button"
            onClick={clearLocalSession}
            className="text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20"
          >
            ↩ Reset Sessione
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400">
        Aiutaci a organizzare al meglio il pranzo e la logistica dei passaggi in auto completando questo rapido form.
      </p>

      {registeredName && (
        <div className="p-3 bg-indigo-950/50 border border-indigo-500/20 text-indigo-300 text-xs rounded-xl flex items-center gap-2">
          <span>✅</span>
          <span>
            Sei già registrato come <strong>{registeredName}</strong>. Puoi aggiornare i tuoi dati qui sotto.
          </span>
        </div>
      )}
      

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4 max-w-2xl mx-auto"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Nome e Cognome *
            </label>
            <input
              type="text"
              required
              placeholder="Es. Mario Rossi"
              value={formData.name}
              onChange={e => handleField('name', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Parteciperai? *
            </label>
            <select
              value={formData.attending}
              onChange={e => handleField('attending', e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="si">Sì, ci sarò assolutamente! 🎉</option>
              <option value="no">No, purtroppo non riesco 😢</option>
            </select>
          </div>
        </div>

        {formData.attending === 'si' && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Email Reply
              </label>
              <input
                type="email"
                placeholder="es. mario@esempio.com"
                value={formData.replyEmail}
                onChange={e => handleField('replyEmail', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Intolleranze Alimentari / Preferenze
              </label>
              <input
                type="text"
                placeholder="Es. Celiaco, Vegetariano, Nessuna..."
                value={formData.diet}
                onChange={e => handleField('diet', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Logistica Auto & Passaggi
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  ['driver', '🚗 Offro Passaggi'],
                  ['passenger', '🙋 Cerco un Passaggio'],
                  ['autonomous', '🚶 Autonomo'],
                ].map(([val, label]) => (
                  <label
                    key={val}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.carOption === val
                        ? 'bg-indigo-900/40 border-indigo-500'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="carOption"
                      value={val}
                      checked={formData.carOption === val}
                      onChange={() => handleField('carOption', val)}
                      className="text-indigo-500 focus:ring-0"
                    />
                    <span className="text-xs text-white">{label}</span>
                  </label>
                ))}
              </div>

              {formData.carOption === 'driver' && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    Posti totali disponibili in auto:
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={formData.carSeats}
                    onChange={e => {
                      let v = parseInt(e.target.value, 10)
                      if (Number.isNaN(v)) v = 1
                      v = Math.max(1, Math.min(5, v))
                      handleField('carSeats', v)
                    }}
                    className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-center text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Note (Es. Zona di partenza, preferenze di orario)
              </label>
              <input
                type="text"
                placeholder="Es. Parto da Milano Lambrate alle 08:15"
                value={formData.notes}
                onChange={e => handleField('notes', e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={!formData.name.trim()}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-bold text-white shadow-lg shadow-indigo-500/10 transition-all flex items-center justify-center gap-2"
        >
          ✈️ {registeredRsvpId ? 'Aggiorna Adesione' : 'Invia Adesione'}
        </button>
      </form>
    </div>
  )
}