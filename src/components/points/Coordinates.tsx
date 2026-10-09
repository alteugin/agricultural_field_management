import { formatLatLng } from '../../lib/format'
import { toMGRS } from '../../lib/geo'

interface CoordinatesProps {
  lat: number
  lng: number
}

export function Coordinates({ lat, lng }: CoordinatesProps) {
  const mgrs = toMGRS({ lat, lng })

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
      <dt className="text-slate-500">WGS 84</dt>
      <dd className="font-mono text-slate-800 tabular-nums">{formatLatLng(lat, lng)}</dd>
      <dt className="text-slate-500">MGRS</dt>
      <dd className="font-mono text-slate-800">{mgrs ?? 'недоступно для цієї широти'}</dd>
    </dl>
  )
}
