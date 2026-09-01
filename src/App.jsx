import { useApp, ENABLE_MANAGER_VIEW } from './context/AppContext'
import Header from './components/Header'
import ManagerView from './components/ManagerView'
import TeamView from './components/TeamView'
import CarpoolingView from './components/CarpoolingView'
import ToastContainer from './components/shared/ToastContainer'
import ConfirmModal from './components/Modals/ConfirmModal'
import LockModal from './components/Modals/LockModal'
import UnlockModal from './components/Modals/UnlockModal'

export default function App() {
  const { viewMode, loading } = useApp()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0b0f19' }}>
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Connessione al database in corso...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="text-slate-100 min-h-screen flex flex-col overflow-x-hidden" style={{ backgroundColor: '#0b0f19' }}>
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        {viewMode === 'manager' && ENABLE_MANAGER_VIEW && <ManagerView />}
        {viewMode === 'team' && <TeamView />}
        {viewMode === 'carpooling' && <CarpoolingView />}
      </main>
      <ToastContainer />
      <ConfirmModal />
      <LockModal />
      <UnlockModal />
    </div>
  )
}