import { useApp } from '../../context/AppContext'

export default function LockModal() {
  const {
    showLockModal, setShowLockModal,
    passwordInput, setPasswordInput,
    confirmAndLock,
  } = useApp()

  if (!showLockModal) return null

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') confirmAndLock()
    if (e.key === 'Escape') setShowLockModal(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-xl font-extrabold text-white">Blocca Presentazione</h2>
          <p className="text-slate-400 text-sm mt-1">
            Imposta una password per proteggere il pannello Manager. Il team vedrà solo la vista di registrazione.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Password Manager</label>
            <input
              type="text"
              autoFocus
              placeholder="Es. teamBBM2026"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <button
            onClick={confirmAndLock}
            disabled={!passwordInput.trim()}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-sm transition-all"
          >
            🔒 Blocca e passa al Team
          </button>

          <button
            onClick={() => setShowLockModal(false)}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 py-2.5 rounded-xl font-semibold text-sm transition-all"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  )
}
