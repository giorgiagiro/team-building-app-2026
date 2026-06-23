import { useApp } from '../../context/AppContext'

export default function WinnerReveal() {
  const { options, selectedWinnerIndex } = useApp()
  const winner = options[selectedWinnerIndex]
  if (!winner) return null

  return (
    <div className="text-center space-y-6">
      {/* Winner image */}
      {winner.image && (
        <div className="w-full max-w-3xl mx-auto">
          <img src={winner.image} alt={winner.title} className="w-full h-56 md:h-96 object-cover rounded-2xl border border-slate-800" />
        </div>
      )}
      <div>
        <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">🏆 La Scelta del Team</span>
        <h2 className="text-4xl font-extrabold text-white mt-3">{winner.title}</h2>
        <p className="text-slate-400 mt-2 text-lg">{winner.tagline}</p>
        <p className="text-slate-500 mt-1"><i className="fa-solid fa-location-dot mr-1" />{winner.location}</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4 text-left">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🌄 Mattina</p>
          <p className="text-slate-300 text-sm leading-relaxed">{winner.morningActivity}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">🍽️ Pranzo</p>
          <p className="text-slate-300 text-sm leading-relaxed">{winner.lunch}</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 text-xs font-bold">
        <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300">💪 {winner.physicalLevel}</span>
        <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300">🍻 {winner.alcoholVibe}</span>
        <span className="bg-indigo-900/50 border border-indigo-800 px-4 py-2 rounded-xl text-indigo-300">💶 ~€{winner.budget}/persona</span>
      </div>
    </div>
  )
}