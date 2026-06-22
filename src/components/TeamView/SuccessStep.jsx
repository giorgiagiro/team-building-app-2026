export default function SuccessStep() {
  return (
    <div className="text-center space-y-6 py-8">
      <div className="text-6xl">🎉</div>
      <h2 className="text-3xl font-extrabold text-white">Registrazione completata!</h2>
      <p className="text-slate-400 max-w-md mx-auto">
        Grazie per aver confermato la tua presenza. Ci vediamo al team building!
        Tieni d'occhio le comunicazioni del manager per i dettagli definitivi.
      </p>
      <div className="bg-emerald-950/50 border border-emerald-800/50 rounded-2xl p-4 max-w-sm mx-auto">
        <p className="text-emerald-400 text-sm font-semibold">✅ I tuoi dati sono stati salvati correttamente.</p>
      </div>
    </div>
  )
}