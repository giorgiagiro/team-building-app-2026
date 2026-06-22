import { useApp } from '../../context/AppContext'
import SlideNav from '../shared/SlideNav'
import RegistrationForm from './RegistrationForm'
import CarpoolingStep from './CarpoolingStep'
import SuccessStep from './SuccessStep'
import WinnerReveal from './WinnerReveal'

export default function TeamView() {
  const { currentSlide, options } = useApp()

  // Slide 0 = form registrazione
  // Slide 1..N = slide opzioni (read-only)
  // Slide N+1 = carpooling self-service
  // Slide N+2 = success

  const renderSlide = () => {
    if (currentSlide === 0) return <RegistrationForm />
    if (currentSlide <= options.length) return <WinnerReveal />
    if (currentSlide === options.length + 1) return <CarpoolingStep />
    return <SuccessStep />
  }

  return (
    <div className="max-w-5xl w-full">
      <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 md:p-12 shadow-2xl min-h-[550px] flex flex-col justify-between slide-enter">
        {renderSlide()}
        <SlideNav />
      </div>
    </div>
  )
}