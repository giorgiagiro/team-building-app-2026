import { useApp } from '../../context/AppContext'

export default function SlideNav() {
  const { currentSlide, totalSlides, nextSlide, prevSlide } = useApp()

  return (
    <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-800">
      <button
        onClick={prevSlide}
        disabled={currentSlide === 0}
        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold transition-all flex items-center gap-2"
      >
        <i className="fa-solid fa-arrow-left" /> Precedente
      </button>

      {/* Dots */}
      <div className="flex gap-2">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${i === currentSlide ? 'bg-indigo-500 w-4' : 'bg-slate-700'}`}
          />
        ))}
      </div>

      <button
        onClick={nextSlide}
        disabled={currentSlide === totalSlides - 1}
        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-semibold transition-all flex items-center gap-2"
      >
        Successivo <i className="fa-solid fa-arrow-right" />
      </button>
    </div>
  )
}