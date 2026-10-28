import * as React from "react"
import { cn } from "cn"
import { PlusIcon, SparklesIcon } from "lucide-react"
import escenas from "./escenas.module.css"
import movimiento from "./movimiento.module.css"

// El kit de escenas: mockups conceptuales de una funcionalidad (feature showcase) para propuestas, presentaciones y
// landings. Se montan con piezas de la interfaz que flotan sobre un plano en perspectiva, a partir de cómo es de verdad
// el producto pero sin ser una captura. Dentro del escenario todo mide en `cqw` de su ancho, así la escena se ve igual a
// cualquier tamaño, también en el PDF (que la imprime quieta). Documentado en `/ds/documentos/escenas`.

/** Las animaciones de entrada y de fondo (`movimiento.module.css`), para la escena y para lo que la rodea. */
export const M = movimiento

/** Cuándo entra una pieza, en segundos desde que se monta. */
export function r(segundos: number, extra?: React.CSSProperties): React.CSSProperties {
  return { "--retraso": `${segundos.toFixed(2)}s`, ...extra } as React.CSSProperties
}

/** La fase de lo que se mueve sin parar, para que cada pieza vaya a su ritmo. */
export function fase(segundos: number): React.CSSProperties {
  return { "--fase": `${segundos.toFixed(2)}s` } as React.CSSProperties
}

/** La escala de textos de dentro de una escena. */
export const E = {
  micro: "text-[1.25cqw] leading-[1.3]",
  pequeno: "text-[1.5cqw] leading-[1.4]",
  texto: "text-[1.8cqw] leading-[1.35]",
  titulo: "text-[2.1cqw] leading-[1.2] font-semibold tracking-[-0.02em]",
  cifra: "text-[4.8cqw] leading-none font-semibold tracking-[-0.045em] tabular-nums",
  cifraMedia: "text-[3.2cqw] leading-none font-semibold tracking-[-0.035em] tabular-nums",
  etiqueta: "font-mono text-[1.15cqw] leading-none tracking-[0.08em] uppercase",
}

export const SOMBRA = escenas.sombra
export const SOMBRA_SUAVE = escenas.sombraSuave
export const LATE = escenas.late

/** El escenario 4:3 de una escena, entero en su columna, con su halo detrás. Se lee como una imagen con su descripción. */
export function Escenario({ etiqueta, className, children }: { etiqueta: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(escenas.columna, className)} role="img" aria-label={etiqueta}>
      <div className={escenas.escenario}>
        <div className={escenas.halo} aria-hidden />
        {children}
      </div>
    </div>
  )
}

/**
 * Un plano inclinado de fondo (la ventana, la lista o el calendario sobre el que flota lo demás), fundido por los
 * bordes. `giro` es la transformación 3D, por ejemplo `rotateX(40deg) rotateZ(-22deg)`.
 */
export function Plano({ giro, x, y, w, h, className, children }: { giro: string; x: number; y: number; w: number; h: number; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("absolute inset-0", escenas.fundido)} aria-hidden>
      <div className={cn(escenas.perspectiva, escenas.entra)}>
        <div className={cn(escenas.plano, className)} style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, "--giro": giro } as React.CSSProperties}>
          {children}
        </div>
      </div>
    </div>
  )
}

type PropsPieza = {
  /** Dónde va, en % del escenario. */
  x: number
  y: number
  w?: number
  /** Cuándo entra, en segundos. */
  retraso?: number
  /** Sin el vaivén (la pieza principal, que no flota). */
  quieta?: boolean
  z?: number
  className?: string
  children: React.ReactNode
}

/** Una pieza que entra al montarse la escena y después flota, cada una a su ritmo. */
export function Pieza({ x, y, w, retraso = 0, quieta, z, className, children }: PropsPieza) {
  return (
    <div
      className={cn("absolute", escenas.entra)}
      style={{ left: `${x}%`, top: `${y}%`, width: w ? `${w}%` : undefined, zIndex: z, "--retraso": `${retraso}s` } as React.CSSProperties}
    >
      <div className={cn(!quieta && escenas.flota, className)} style={{ "--fase": `${-(retraso * 2.7) % 7}s` } as React.CSSProperties}>
        {children}
      </div>
    </div>
  )
}

/** La tarjeta blanca de la interfaz, con su sombra en capas. */
export function Tarjeta({ suave, className, children }: { suave?: boolean; className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[1.8cqw] bg-card text-card-foreground", suave ? escenas.sombraSuave : escenas.sombra, className)}>{children}</div>
}

export type Tono = "brand" | "success" | "info" | "warning" | "danger" | "neutral"

export const TONOS: Record<Tono, string> = {
  brand: "bg-brand-soft text-brand",
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-muted text-muted-foreground",
}

/** El monograma de una marca o una persona inventada, en su tono. */
export function Monograma({ nombre, tono = "neutral", className }: { nombre: string; tono?: Tono; className?: string }) {
  const iniciales = nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
  return <span className={cn("grid size-[3.6cqw] flex-none place-items-center rounded-full text-[1.3cqw] font-semibold", TONOS[tono], className)}>{iniciales}</span>
}

/** Un sello con una letra, para la marca de quien habla (el equipo, el producto). */
export function Sello({ letra, className }: { letra: string; className?: string }) {
  return (
    <span className={cn("grid size-[3.6cqw] flex-none place-items-center rounded-[1cqw] bg-foreground text-[1.7cqw] font-extrabold tracking-[-0.04em] text-background", className)}>
      {letra}
    </span>
  )
}

/** La pastilla de lo que hace la IA. */
export function ConIA({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex w-fit items-center gap-[0.6cqw] rounded-full bg-brand-soft px-[1.1cqw] py-[0.5cqw] text-[1.3cqw] font-medium text-brand", className)}>
      <SparklesIcon className="size-[1.5cqw]" />
      {children}
    </span>
  )
}

/** El cursor, con el «+» verde de soltar si lleva algo. */
export function Cursor({ mas, className }: { mas?: boolean; className?: string }) {
  return (
    <span className={cn("relative block w-[3.6cqw]", className)} aria-hidden>
      <svg viewBox="0 0 24 24" className="w-full drop-shadow-[0_0.3cqw_0.5cqw_rgb(20_24_40/0.3)]">
        <path d="M5 2.5 20 11.2l-7 1.9-3.3 6.9z" className="fill-foreground stroke-background" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      {mas && (
        <span className="absolute top-[62%] left-[62%] grid size-[3.4cqw] place-items-center rounded-full bg-success text-background ring-[0.35cqw] ring-background">
          <PlusIcon className="size-[62%]" strokeWidth={3.2} />
        </span>
      )}
    </span>
  )
}

/** Una barra gris que hace de texto. */
export function Barra({ ancho, className }: { ancho: string; className?: string }) {
  return <span className={cn("block h-[0.9cqw] rounded-full bg-foreground/8", className)} style={{ width: ancho }} />
}

/** Las líneas que unen piezas, con un punto en cada extremo (de `curva`). Se dibujan al montarse la escena. */
export function Lineas({ trazos, retraso = 0.6 }: { trazos: { d: string; desde: [number, number]; hasta: [number, number] }[]; retraso?: number }) {
  return (
    <svg viewBox="0 0 100 75" className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden>
      {trazos.map((t, i) => (
        <g key={t.d} style={{ "--retraso": `${retraso + i * 0.12}s` } as React.CSSProperties}>
          <path d={t.d} pathLength={1} className={cn(escenas.traza, "fill-none stroke-foreground/30")} strokeWidth={0.16} strokeLinecap="round" />
          <circle cx={t.desde[0]} cy={t.desde[1]} r={0.45} className="fill-background stroke-foreground/40" strokeWidth={0.16} />
          <circle cx={t.hasta[0]} cy={t.hasta[1]} r={0.45} className="fill-foreground/60" />
        </g>
      ))}
    </svg>
  )
}

/** Una curva suave de un punto a otro para `Lineas`, con los puntos en % del escenario, como las piezas. */
export function curva([x1, a]: [number, number], [x2, b]: [number, number]) {
  const [y1, y2] = [a * 0.75, b * 0.75]
  const mx = (x1 + x2) / 2
  return { d: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}`, desde: [x1, y1] as [number, number], hasta: [x2, y2] as [number, number] }
}
