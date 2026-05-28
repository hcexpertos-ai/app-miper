import type { ClasificacionRiesgo } from '@/src/types'
import { COLOR_RIESGO } from '@/src/types'

interface Props {
  clasificacion: ClasificacionRiesgo
  mr?: number
  size?: 'sm' | 'md'
}

const LABEL: Record<ClasificacionRiesgo, string> = {
  tolerable:   'TOLERABLE',
  moderado:    'MODERADO',
  importante:  'IMPORTANTE',
  intolerable: 'INTOLERABLE',
}

export default function RiesgoBadge({ clasificacion, mr, size = 'md' }: Props) {
  const base = size === 'sm'
    ? 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold'
    : 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold'

  return (
    <span className={`${base} ${COLOR_RIESGO[clasificacion]}`}>
      {mr !== undefined && <span className="opacity-70">MR {mr}</span>}
      {LABEL[clasificacion]}
    </span>
  )
}
