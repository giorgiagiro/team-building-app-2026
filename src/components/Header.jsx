import { useApp, ENABLE_MANAGER_VIEW } from '../context/AppContext'

export default function Header() {
  const {
    viewMode, setViewMode,
    isLocked,
    editMode, setEditMode,
    selectedWinnerIndex, setSelectedWinnerIndex,
    options,
    openLockModal, openUnlockModal,
    saveOptions,
    isCloudEnabled,
    exportToExcel,
  } = useApp()

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">TB</div>
          <div>
            <p className="text-white font-extrabold text-sm leading-none">Team Building 2026</p>
            <p className="text-slate-500 text-xs">BBM · Autunno</p>
          </div>
        </div>

        {/* Nav centrale */}
        <nav className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {[
            ...(ENABLE_MANAGER_VIEW ? [{ id: 'manager', icon: '⚙️', label: 'Manager', locked: isLocked }] : []),
            { id: 'team', icon: '👥', label: 'Attività', locked: false },
            { id: 'carpooling', icon: '🚗', label: 'Carpooling', locked: false },
          ].map(({ id, icon, label, locked }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1
                ${viewMode === id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
            >
              {locked && <span className="text-amber-400">🔒</span>}
              <span className="text-sm">{icon}</span>
              <span className="hidden sm:inline"> {label}</span>
            </button>
          ))}
        </nav>

        {/* Azioni destra */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Selettore opzione vincitrice — solo in manager mode */}
          {ENABLE_MANAGER_VIEW && viewMode === 'manager' && !isLocked && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400 font-semibold whitespace-nowrap">🏆 Vincitrice:</label>
              <select
                value={selectedWinnerIndex}
                onChange={e => setSelectedWinnerIndex(parseInt(e.target.value))}
                className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                {options.map((opt, i) => (
                  <option key={i} value={i}>{opt.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Edit mode toggle — solo manager sbloccato */}
          {ENABLE_MANAGER_VIEW && viewMode === 'manager' && !isLocked && (
            <button
              onClick={() => {
                if (editMode) saveOptions()
                setEditMode(!editMode)
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                ${editMode
                  ? 'bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
            >
              {editMode ? '💾 Salva' : '✏️ Modifica'}
            </button>
          )}

          {/* Export Excel */}
          {ENABLE_MANAGER_VIEW && viewMode === 'manager' && !isLocked && (
            <button
              onClick={exportToExcel}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-500 transition-all"
            >
              📊 Excel
            </button>
          )}

          {/* Lock / Unlock */}
          {ENABLE_MANAGER_VIEW && !isLocked ? (
            <button
              onClick={openLockModal}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all"
            >
              🔒 Blocca
            </button>
          ) : ENABLE_MANAGER_VIEW ? (
            <button
              onClick={openUnlockModal}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
            >
              🔓 Sblocca
            </button>
          ) : null}

          {/* Indicatore cloud */}
          <div className={`w-2 h-2 rounded-full ${isCloudEnabled ? 'bg-emerald-500' : 'bg-rose-500'}`} title={isCloudEnabled ? 'Cloud connesso' : 'Offline'} />
        </div>

      </div>
    </header>
  )
}
