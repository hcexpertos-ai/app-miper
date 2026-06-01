'use client'

// ─── Tooltip ─────────────────────────────────────────────────────────────────
// Muestra un globo de ayuda al pasar el mouse sobre el ícono ⓘ.
// Uso:  <label className="label">Campo * <Tooltip text="Descripción…" /></label>

interface TooltipProps {
  text: string
}

export default function Tooltip({ text }: TooltipProps) {
  return (
    <span className="group relative inline-flex items-center ml-1.5 align-middle">
      {/* Ícono ⓘ */}
      <span
        aria-label={text}
        title={text}
        className="
          inline-flex items-center justify-center
          w-3.5 h-3.5 rounded-full
          bg-slate-300 hover:bg-[#1e3a5f]
          text-white text-[9px] font-bold
          cursor-help select-none leading-none
          transition-colors duration-150
        "
      >
        i
      </span>

      {/* Burbuja */}
      <span
        role="tooltip"
        className="
          pointer-events-none
          absolute left-5 top-1/2 -translate-y-1/2
          z-[200]
          hidden group-hover:block
          w-60 max-w-xs
          bg-slate-800 text-white
          text-[11px] leading-relaxed font-normal normal-case tracking-normal
          rounded-xl px-3 py-2.5 shadow-2xl
          whitespace-normal
        "
      >
        {/* Flecha izquierda */}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-800" />
        {text}
      </span>
    </span>
  )
}
