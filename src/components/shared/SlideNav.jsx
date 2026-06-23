// src/components/shared/SlideNav.jsx
import { useApp } from '../../context/AppContext'

export default function SlideNav() {
  const { currentSlide, setCurrentSlide, totalSlides } = useApp()
  return (
    <div className="flex flex-col sm:flex-row items-center sm:justify-between pt-6 border-t border-slate-900 mt-8 gap-3">
      <div className="flex justify-center sm:justify-start space-x-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`h-2 rounded-full transition-all ${
              currentSlide === i ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-800 hover:bg-slate-700'
            }`}
          />
        ))}
      </div>
      <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button
          onClick={() => setCurrentSlide(s => Math.max(0, s - 1))}
          disabled={currentSlide === 0}
          className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 text-slate-300 font-bold rounded-lg text-sm transition-all"
        >
          ← Indietro
        </button>
        <button
          onClick={() => setCurrentSlide(s => Math.min(totalSlides - 1, s + 1))}
          disabled={currentSlide === totalSlides - 1}
          className="w-full sm:w-auto px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-bold rounded-lg text-sm transition-all"
        >
          Avanti →
        </button>
      </div>
    </div>
  )
}