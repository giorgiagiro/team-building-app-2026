// src/App.jsx
import { useApp } from './context/AppContext'
import ManagerView from './components/ManagerView'
import TeamView from './components/TeamView'
import CarpoolingView from './components/CarpoolingView'
import Header from './components/Header'

export default function App() {
  const { viewMode, loading } = useApp()

  if (loading) return <div className="...">Connessione al database...</div>

  return (
    <div className="text-slate-100 min-h-screen flex flex-col" style={{ backgroundColor: '#0b0f19' }}>
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        {viewMode === 'manager' && <ManagerView />}
        {viewMode === 'team'    && <TeamView />}
        {viewMode === 'carpooling' && <CarpoolingView />}
      </main>
    </div>
  )
}