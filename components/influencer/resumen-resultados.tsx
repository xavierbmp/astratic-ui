import Image from "next/image"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { LISTA_METRICAS, METRICAS, type Collab, type Resultado } from "@/lib/influencer/modelo"
import { indicadores } from "@/lib/influencer/informe"

/**
 * Las cifras de una collab de un vistazo: alcance, visualizaciones e interacciones sumadas, y lo que
 * valen para la marca (CPM, tasa de interacción, clics). Lo mismo en el workspace y en el informe.
 */
export function ResumenResultados({ collab, resultados, className }: { collab: Collab; resultados: Resultado[]; className?: string }) {
  const r = indicadores(collab, resultados)
  const datos = [
    { label: "Visualizaciones", valor: r.metricas.visualizaciones !== undefined ? fmt.num(r.metricas.visualizaciones) : "—" },
    { label: "Alcance", valor: r.metricas.alcance !== undefined ? fmt.num(r.metricas.alcance) : "—" },
    { label: "Interacciones", valor: r.interacciones ? fmt.num(r.interacciones) : "—", sub: r.tasaInteraccion !== null ? `${fmt.pct(r.tasaInteraccion)} de interacción` : undefined },
    { label: "CPM", valor: r.cpm !== null ? fmt.eurDecimals(r.cpm) : "—", sub: "Coste por mil visualizaciones" },
    { label: "Clics en el enlace", valor: r.metricas.clics !== undefined ? fmt.num(r.metricas.clics) : "—", sub: r.ctr !== null ? `${fmt.pct(r.ctr)} de las visualizaciones` : undefined },
    { label: "Usos del código", valor: r.metricas.ventas !== undefined ? fmt.num(r.metricas.ventas) : "—" },
  ]
  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 xl:grid-cols-6", className)}>
      {datos.map((d) => (
        <div key={d.label} className="min-w-0">
          <dt className="text-xs text-muted-foreground">{d.label}</dt>
          <dd className="mt-0.5 text-xl font-semibold tracking-tight tabular-nums">{d.valor}</dd>
          {d.sub && <dd className="text-[11px] text-muted-foreground">{d.sub}</dd>}
        </div>
      ))}
    </dl>
  )
}

/** Las cifras de una pieza en una fila compacta, solo las que se apuntaron. */
export function CifrasPieza({ resultado }: { resultado: Resultado }) {
  const con = LISTA_METRICAS.filter((m) => resultado.metricas[m] !== undefined)
  return (
    <dl className="flex flex-wrap gap-x-5 gap-y-2">
      {con.map((m) => (
        <div key={m}>
          <dt className="text-[11px] text-muted-foreground">{METRICAS[m]}</dt>
          <dd className="text-sm font-semibold tabular-nums">{fmt.num(resultado.metricas[m] ?? 0)}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Las capturas de las estadísticas, en miniatura; cada una se abre entera. */
export function Capturas({ capturas }: { capturas: Resultado["capturas"] }) {
  if (capturas.length === 0) return null
  return (
    <ul className="flex flex-wrap gap-2">
      {capturas.map((c) => (
        <li key={c.id}>
          <a href={c.url} target="_blank" rel="noreferrer" className="relative block h-28 w-16 overflow-hidden rounded-lg border bg-muted transition-transform hover:-translate-y-0.5" title={c.nombre}>
            <Image src={c.url} alt={c.nombre} fill sizes="64px" className="object-cover" unoptimized />
          </a>
        </li>
      ))}
    </ul>
  )
}
