// src/components/Modals/UnlockModal.jsx
import { useApp } from '../../context/AppContext'

export default function UnlockModal() {
  const {
    showUnlockModal,
    setShowUnlockModal,
    unlockPasswordInput,
    setUnlockPasswordInput,
    unlockError,
    unlockApp,
  } = useApp()

  if (!showUnlockModal) return null

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') unlockApp()
    if (e.key === 'Escape') setShowUnlockModal(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-fade-in">

        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔐</div>
          <h2 className="text-xl font-extrabold text-white">Accesso Manager</h2>
          <p className="text-slate-400 text-sm mt-1">Inserisci la password per sbloccare il pannello di gestione.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password</label>
            <input
              type="password"
              autoFocus
              placeholder="••••••••"
              value={unlockPasswordInput}
              onChange={e => setUnlockPasswordInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full bg-slate-800 border rounded-xl p-3 text-white text-sm focus:outline-none transition-colors
                ${unlockError
                  ? 'border-rose-500 focus:border-rose-400'
                  : 'border-slate-600 focus:border-indigo-500'
                }`}
            />
            {unlockError && (
              <p className="text-rose-400 text-xs mt-1.5 font-semibold">
                ❌ Password errata. Riprova.
              </p>
            )}
          </div>

          <button
            onClick={unlockApp}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold text-sm transition-all"
          >
            Sblocca Pannello Manager
          </button>

          <button
            onClick={() => setShowUnlockModal(false)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 py-2.5 rounded-xl font-semibold text-sm transition-all"
          >
            Annulla
          </button>
        </div>

      </div>
    </div>
  )
}