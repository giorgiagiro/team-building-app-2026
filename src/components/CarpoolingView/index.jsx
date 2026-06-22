// Vista dedicata carpooling (accessibile a tutti, anche con isLocked)
// Riusa lo stesso componente della TeamView
import CarpoolingStep from '../TeamView/CarpoolingStep'

export default function CarpoolingView() {
  return (
    <div className="max-w-5xl w-full">
      <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 md:p-12 shadow-2xl min-h-[550px]">
        <CarpoolingStep />
      </div>
    </div>
  )
}