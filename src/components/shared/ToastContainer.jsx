// src/components/shared/ToastContainer.jsx
import { useApp } from '../../context/AppContext'

export default function ToastContainer() {
  const { toasts } = useApp()

  if (!toasts.length) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-xl text-sm font-semibold shadow-lg animate-fade-in flex items-center gap-2 max-w-xs
            ${toast.type === 'success' ? 'bg-emerald-600 text-white' : ''}
            ${toast.type === 'error'   ? 'bg-rose-600 text-white'    : ''}
            ${toast.type === 'info'    ? 'bg-indigo-600 text-white'  : ''}
          `}
        >
          {toast.type === 'success' && '✅'}
          {toast.type === 'error'   && '❌'}
          {toast.type === 'info'    && 'ℹ️'}
          {toast.message}
        </div>
      ))}
    </div>
  )
}