"use client"

import * as React from "react"
import { ArrowUpRightIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import type { StatusTone } from "@/lib/status"

/** El color del punto de un estado, por su tono. */
export const PUNTO_TONO: Record<StatusTone, string> = { success: "bg-ficha-ok", info: "bg-ficha-azul", warning: "bg-ficha-aviso", danger: "bg-ficha-mal", neutral: "bg-ficha-gris" }

const ANCHO_BARRA = 3
const HUECO_BARRA = 4

/**
 * El marcador de barras: enciende de `valor` sobre `maximo` y reparte el color de violeta a verde entre las encendidas.
 * Sin valor, todas apagadas.
 */
export function Marcador({ valor, maximo = 10, barras = 20, className, title }: { valor: number | null; maximo?: number; barras?: number; className?: string; title?: string }) {
  const encendidas = valor === null ? 0 : Math.round((Math.min(valor, maximo) / maximo) * barras)
  const ancho = encendidas * (ANCHO_BARRA + HUECO_BARRA) - HUECO_BARRA
  return (
    <div className={cn("flex items-center gap-1", className)} title={title} aria-hidden>
      {Array.from({ length: barras }, (_, i) => {
        const encendida = i < encendidas
        return (
          <span
            key={i}
            className={cn("h-[15px] w-[3px] flex-none rounded-[2px]", !encendida && "bg-ficha-vacio")}
            style={encendida ? { backgroundImage: "var(--ficha-marcador)", backgroundSize: `${Math.max(ancho, ANCHO_BARRA)}px 100%`, backgroundPosition: `-${i * (ANCHO_BARRA + HUECO_BARRA)}px 0` } : undefined}
          />
        )
      })}
    </div>
  )
}

/** La píldora gris de un dato con punto de color opcional: «Activa», «Por firmar». */
export function PastillaFicha({ punto, tamano = "md", className, children, ...props }: React.ComponentProps<"span"> & { punto?: string; tamano?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex flex-none items-center rounded-full bg-ficha-relleno whitespace-nowrap",
        tamano === "sm" ? "h-[22px] gap-1.5 px-[9px] text-xs" : tamano === "md" ? "h-6 gap-1.5 px-2.5 text-[12.5px]" : "h-7 gap-[7px] px-3 text-[13.5px]",
        punto && (tamano === "lg" ? "pl-2.5" : ""),
        className,
      )}
      {...props}
    >
      {punto && <span className={cn("size-[7px] flex-none rounded-full", punto)} aria-hidden />}
      {children}
    </span>
  )
}

/** Un estado: la píldora con el punto de su tono. Es lo que `StatusBadge` en el resto del kit. */
export function EstadoFicha({ tono, ...props }: Omit<React.ComponentProps<typeof PastillaFicha>, "punto"> & { tono: StatusTone }) {
  return <PastillaFicha punto={PUNTO_TONO[tono]} {...props} />
}

/** El enlace en píldora de la bio, con su flecha. */
export function PastillaEnlace({ className, children, ...props }: React.ComponentProps<"a">) {
  return (
    <a target="_blank" rel="noreferrer" className={cn("inline-flex h-7 max-w-full min-w-0 items-center gap-1.5 rounded-full bg-ficha-relleno pr-2.5 pl-[11px] text-[13px] text-ficha-tinta outline-none hover:bg-ficha-relleno-2 focus-visible:ring-2 focus-visible:ring-ring/50", className)} {...props}>
      <span className="min-w-0 truncate">{children}</span>
      <ArrowUpRightIcon className="size-3 flex-none" strokeWidth={1.8} aria-hidden />
    </a>
  )
}

/** Una keyword: solo el texto, en el color de su temática, con su aspa para quitarla. Sin revisar, con borde a trazos. */
export function KeywordFicha({ pendiente, onQuitar, etiquetaQuitar, className, children, ...props }: React.ComponentProps<"span"> & { pendiente?: boolean; onQuitar?: () => void; etiquetaQuitar?: string }) {
  return (
    <span className={cn("inline-flex h-6 items-center gap-0.5 text-[13.5px]", pendiente && "box-border rounded-full border border-dashed border-ficha-casilla pr-1 pl-[9px]", className)} {...props}>
      {children}
      {onQuitar && (
        <button type="button" onClick={onQuitar} aria-label={etiquetaQuitar ?? "Quitar"} className="inline-flex size-4 items-center justify-center rounded-full text-ficha-tinta-4 outline-none hover:text-ficha-tinta focus-visible:ring-2 focus-visible:ring-ring/50">
          <XIcon className="size-[11px]" strokeWidth={2} aria-hidden />
        </button>
      )}
    </span>
  )
}

/** El segmentado en píldora de la ficha («Real / Estimado»). */
export function SegmentadoFicha<T extends string>({ opciones, valor, onCambiar, label, className }: { opciones: { id: T; label: string; disabled?: boolean; title?: string }[]; valor: T; onCambiar: (v: T) => void; label: string; className?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex gap-1 rounded-full bg-ficha-relleno p-1 shadow-[inset_0_0_0_1px_rgb(0_0_0_/_0.04),inset_0_1px_2px_rgb(0_0_0_/_0.05)]", className)}>
      {opciones.map((o) => {
        const activa = o.id === valor
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={activa}
            disabled={o.disabled}
            title={o.title}
            onClick={() => !activa && onCambiar(o.id)}
            className={cn(
              "h-[30px] rounded-full border-0 px-4 text-[13.5px] whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              activa ? "cursor-default bg-ficha-superficie font-medium text-ficha-tinta shadow-ficha-segmento" : "cursor-pointer bg-transparent text-ficha-tinta-2 hover:text-ficha-tinta disabled:cursor-not-allowed disabled:text-ficha-tinta-4 disabled:hover:text-ficha-tinta-4",
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Una fila «nombre, barra y %»: países, edades. */
export function FilaBarra({ nombre, porcentaje, destacada, tenue, ancho = "pais" }: { nombre: React.ReactNode; porcentaje: number; /** La franja mayor, en sólido; las demás en gris (edades). */ destacada?: boolean; /** «Otros». */ tenue?: boolean; ancho?: "pais" | "edad" }) {
  const relleno = tenue ? "bg-ficha-solido-3" : destacada ? "bg-ficha-solido" : "bg-ficha-solido-2"
  return (
    <div className={cn("grid items-center gap-2.5", ancho === "pais" ? "grid-cols-[72px_minmax(0,1fr)_38px]" : "grid-cols-[44px_minmax(0,1fr)_34px]")}>
      <span className={cn("truncate", ancho === "pais" ? "text-[13px]" : "text-[12.5px] tabular-nums", tenue && "text-ficha-tinta-2")}>{nombre}</span>
      <span className="block h-[5px] rounded-[3px] bg-ficha-pista">
        <span className={cn("block h-full rounded-[3px]", relleno)} style={{ width: `${Math.max(0, Math.min(porcentaje, 100))}%` }} />
      </span>
      <span className={cn("text-right font-medium tabular-nums", ancho === "pais" ? "text-[13px]" : "text-[12.5px]")}>{Math.round(porcentaje)} %</span>
    </div>
  )
}

/** Las barras verticales de una serie, en sólido o rayadas si son estimadas. */
export function BarrasSerie({ valores, alto = 44, estimado, atenuados, titulos, anchas, className }: { valores: number[]; alto?: number; estimado?: boolean; /** Los que no cuentan (la media recortada). */ atenuados?: Set<number>; titulos?: string[]; /** Llenan el ancho en vez de ir finas. */ anchas?: boolean; className?: string }) {
  // Lo que no cuenta no marca la escala: un vídeo disparado no aplasta a los demás.
  const maximo = Math.max(...valores.filter((_, i) => !atenuados?.has(i)), 1)
  return (
    <div className={cn("flex items-end justify-between", anchas ? "gap-1" : "gap-0.5", className)} style={{ height: alto }}>
      {valores.map((v, i) => {
        const fuera = atenuados?.has(i)
        return (
          <span
            key={i}
            title={titulos?.[i]}
            className={cn(anchas ? "min-w-0 flex-1 rounded-[3px]" : "w-[3px] flex-none rounded-[2px]", fuera ? "bg-ficha-solido-4" : estimado ? "bg-(image:--ficha-rayado)" : "bg-ficha-solido")}
            style={{ height: Math.max(3, Math.min(alto, Math.round((v / maximo) * alto))) }}
          />
        )
      })}
    </div>
  )
}

/** Un reparto en una barra partida, con sus tramos. */
export function BarraReparto({ tramos, alto = 8, className }: { tramos: { id: string; peso: number; clase: string; title?: string }[]; alto?: number; className?: string }) {
  return (
    <div className={cn("flex gap-[3px]", className)} style={{ height: alto }}>
      {tramos.map((t) => (
        <span key={t.id} title={t.title} className={cn("min-w-1 rounded-[3px]", t.clase)} style={{ flex: t.peso }} />
      ))}
    </div>
  )
}

/** La etiqueta a trazos de lo estimado. */
export function MarcaEstimado({ children = "estimado", className }: { children?: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex h-5 flex-none items-center rounded-full border border-dashed border-ficha-solido-3 px-2 text-[11.5px] whitespace-nowrap text-ficha-tinta-2", className)}>{children}</span>
}

/** Una celda del panel de audiencia: su título a la izquierda, lo suyo a la derecha y el contenido. */
export function CeldaPanel({ titulo, extra, base = 220, className, children }: { titulo: React.ReactNode; extra?: React.ReactNode; base?: number; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("box-border flex min-w-0 flex-col border-t border-l border-ficha-raya px-5 py-3.5", className)} style={{ flex: `1 1 ${base}px` }}>
      <div className="flex min-h-[22px] items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[13px] text-ficha-tinta-2">{titulo}</span>
        {extra && <span className="flex-none text-xs text-ficha-tinta-3">{extra}</span>}
      </div>
      {children}
    </div>
  )
}

/** La cifra grande de una celda del panel, con su nota al lado. */
export function CifraPanel({ cifra, nota }: { cifra: React.ReactNode; nota?: React.ReactNode }) {
  return (
    <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="text-2xl leading-[1.2] font-medium tracking-[-0.02em] tabular-nums">{cifra}</span>
      {nota && <span className="text-[12.5px] text-ficha-tinta-2">{nota}</span>}
    </div>
  )
}

/** Los pasos de una secuencia: una barra por paso, hecha, a medias o por llegar, con su nombre y su fecha. */
export function PasosFicha({ pasos, className }: { pasos: { id: string; nombre: React.ReactNode; detalle?: React.ReactNode; estado: "hecho" | "ahora" | "luego" }[]; className?: string }) {
  return (
    <div className={cn("mt-4 grid gap-1.5", className)} style={{ gridTemplateColumns: `repeat(${Math.max(pasos.length, 1)},minmax(0,1fr))` }}>
      {pasos.map((p) => (
        <div key={p.id} className="min-w-0">
          <span className={cn("block h-1.5 overflow-hidden rounded-[3px]", p.estado === "hecho" ? "bg-ficha-solido" : "bg-ficha-vacio")}>{p.estado === "ahora" && <span className="block h-full w-1/2 bg-ficha-solido" />}</span>
          <div className="mt-2 truncate text-[13px] font-medium">{p.nombre}</div>
          {p.detalle && <div className="truncate text-[12.5px] text-ficha-tinta-2">{p.detalle}</div>}
        </div>
      ))}
    </div>
  )
}

/** La escala de una tarifa: el tramo de mercado en gris y sus marcas encima. */
export function EscalaTarifa({ desde, hasta, tramo, marcas, formato }: { desde: number; hasta: number; tramo?: { desde: number; hasta: number } | null; marcas: { id: string; valor: number; relleno?: boolean; title?: string }[]; formato: (n: number) => string }) {
  const pos = (n: number) => `${Math.max(0, Math.min(((n - desde) / Math.max(hasta - desde, 1)) * 100, 100))}%`
  return (
    <>
      <div className="relative mt-[22px] h-[18px]">
        <span className="absolute inset-x-0 top-1.5 h-1.5 rounded-[3px] bg-ficha-pista" />
        {tramo && <span className="absolute top-1.5 h-1.5 rounded-[3px] bg-ficha-solido-3" style={{ left: pos(tramo.desde), width: `calc(${pos(tramo.hasta)} - ${pos(tramo.desde)})` }} />}
        {marcas.map((m) => (
          <span
            key={m.id}
            title={m.title}
            className={cn("absolute top-0.5 -ml-[7px] box-border size-3.5 rounded-full", m.relleno ? "bg-ficha-solido shadow-[0_0_0_3px_var(--ficha-superficie)]" : "border-[2.5px] border-ficha-solido bg-ficha-superficie")}
            style={{ left: pos(m.valor) }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-ficha-tinta-3 tabular-nums">
        <span>{formato(desde)}</span>
        <span>{formato(hasta)}</span>
      </div>
    </>
  )
}

/** La leyenda de la escala: el tramo, una marca abierta o una marca llena. */
export function LeyendaTarifa({ forma, children }: { forma: "tramo" | "abierta" | "llena"; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-[7px]">
      <span className={cn(forma === "tramo" ? "h-1.5 w-4 rounded-[3px] bg-ficha-solido-3" : "box-border size-2.5 rounded-full", forma === "abierta" && "border-2 border-ficha-solido", forma === "llena" && "bg-ficha-solido")} aria-hidden />
      {children}
    </span>
  )
}

const CAMPO = "box-border w-full min-w-0 rounded-ficha-opcion border-0 bg-ficha-campo px-3.5 text-sm text-ficha-tinta outline-none placeholder:text-ficha-tinta-4 focus:shadow-[inset_0_0_0_1.5px_var(--ficha-tinta)] disabled:opacity-60"

/** Donde se escribe lo nuevo de un bloque: el nombre de un material, una pregunta. Lo que ya existe se edita con `InlineField`. Con `unidad`, «€» o «%» al final. */
export function EntradaFicha({ unidad, className, ...props }: React.ComponentProps<"input"> & { unidad?: string }) {
  if (!unidad) return <input className={cn(CAMPO, "h-10", className)} {...props} />
  return (
    <span className={cn("relative block min-w-0", className)}>
      <input className={cn(CAMPO, "h-10 pr-12")} {...props} />
      <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-[13px] text-ficha-tinta-3">{unidad}</span>
    </span>
  )
}

/** El texto largo de lo nuevo de un bloque: una respuesta. */
export function AreaFicha({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(CAMPO, "resize-y py-2.5 leading-normal", className)} {...props} />
}

/** Un mensaje suave para lo que aún no tiene datos: una línea, sin caja. */
export function VacioFicha({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("m-0 py-2 text-[13.5px] text-ficha-tinta-3", className)} {...props} />
}

/** Lo mismo cuando es todo lo que hay en un bloque, debajo de su título. */
export function VacioBloque({ className, ...props }: React.ComponentProps<"p">) {
  return <VacioFicha className={cn("border-t border-ficha-raya px-[22px] py-3", className)} {...props} />
}

/** La línea de una nota: inicial en un círculo, quién, cuándo y el texto. */
export function NotaFicha({ inicial, quien, cuando, children }: { inicial: string; quien: React.ReactNode; cuando?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 border-t border-ficha-raya-suave py-3">
      <span className="flex size-[30px] flex-none items-center justify-center rounded-full bg-ficha-pista text-[12.5px] font-medium">{inicial}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{quien}</span>
          {cuando && <span className="text-[12.5px] text-ficha-tinta-3">{cuando}</span>}
        </div>
        <div className="mt-0.5 text-[14.5px] leading-normal text-pretty">{children}</div>
      </div>
    </div>
  )
}
