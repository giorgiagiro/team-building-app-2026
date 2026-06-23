import { useApp } from '../../context/AppContext'

export default function ConfirmModal() {
  const {
    showConfirmModal,
    confirmMessage,
    executeConfirmAction,
    cancelConfirmAction,
  } = useApp()

  if (!showConfirmModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl animate-fade-in">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-extrabold text-white">Conferma azione</h2>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">{confirmMessage}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={cancelConfirmAction}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold text-sm transition-all"
          >
            Annulla
          </button>
          <button
            onClick={executeConfirmAction}
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-3 rounded-xl font-bold text-sm transition-all"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  )
}
