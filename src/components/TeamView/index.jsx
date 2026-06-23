import { useApp } from '../../context/AppContext'
import SlideNav from '../shared/SlideNav'
import RegistrationForm from './RegistrationForm'
import SuccessStep from './SuccessStep'
import WinnerReveal from './WinnerReveal'
import CarpoolingView from '../CarpoolingView'

export default function TeamView() {
  const { currentSlide } = useApp()

  

  // ── Slide 0: Invito / Opzione Vincitrice (SENZA PREZZO) ───────
  

  // ── Slide 1: Form di registrazione ────────────────────────────
  

  // ── Slide 2: Carpooling self-service ──────────────────────────
  

  // ── Slide 3: Ringraziamento / Successo ────────────────────────
  

  // ── Render ────────────────────────────────────────────────────
  const slides = [<WinnerReveal />, <RegistrationForm />, <CarpoolingView />, <SuccessStep />]

  return (
    <div className="max-w-5xl w-full">
      <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 md:p-12 shadow-2xl min-h-[550px] flex flex-col justify-between slide-enter">
        <div className="flex-grow">
          {slides[currentSlide] || slides[0]}
        </div>
        <SlideNav />
      </div>
    </div>
  )
}