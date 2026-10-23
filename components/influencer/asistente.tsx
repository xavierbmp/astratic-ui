import Link from "next/link"
import { cn } from "cn"

/** Cómo va cada paso: hecho, dejado para más tarde, el de ahora o por hacer. */
export type EstadoPasoAsistente = "hecho" | "saltado" | "actual" | "pendiente"
export type PasoAsistente = { id: string; titulo: string; estado: EstadoPasoAsistente; href: string }

const TONO_TRAMO: Record<EstadoPasoAsistente, string> = {
  hecho: "bg-foreground",
  actual: "bg-brand",
  saltado: "bg-foreground/25",
  pendiente: "bg-border",
}

/** El progreso arriba de la tarjeta: en qué paso está y un tramo por paso, que lleva a ese paso al pulsarlo. */
function Progreso({ pasos }: { pasos: PasoAsistente[] }) {
  const i = Math.max(0, pasos.findIndex((p) => p.estado === "actual"))
  return (
    <div className="flex flex-col gap-2.5">
      <p className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="truncate font-medium text-foreground">{pasos[i]?.titulo}</span>
        <span className="flex-none tabular-nums">
          Paso {i + 1} de {pasos.length}
        </span>
      </p>
      <ol aria-label="Pasos" className="flex gap-1">
        {pasos.map((p, n) => (
          <li key={p.id} className="flex-1">
            <Link
              href={p.href}
              aria-current={p.estado === "actual" ? "step" : undefined}
              aria-label={`${n + 1}. ${p.titulo}${p.estado === "hecho" ? " (hecho)" : p.estado === "saltado" ? " (para más tarde)" : ""}`}
              title={p.titulo}
              className="group/tramo -my-2 block py-2 outline-none"
            >
              <span className={cn("block h-1.5 rounded-full transition-colors group-hover/tramo:opacity-70 group-focus-visible/tramo:ring-3 group-focus-visible/tramo:ring-ring/50", TONO_TRAMO[p.estado])} />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  )
}

/**
 * El marco de un asistente por pasos que ocupa la pantalla (la bienvenida y las altas del workspace): arriba el
 * logotipo y la salida; en el centro, sobre el gris con una trama de puntos muy suave, una tarjeta blanca con el
 * progreso arriba (un tramo por paso) y el paso de ahora (`AsistentePaso`). Sin lista de pasos al lado: se ve una
 * pregunta cada vez (Xavier, 2026-10-23, reporte cmvkwvdt del workspace). `ancho` para los pasos con tablas.
 */
export function AsistenteMarco({ logo, pasos, salida, ancho = "normal", children }: { logo: React.ReactNode; pasos: PasoAsistente[]; salida?: React.ReactNode; ancho?: "normal" | "ancho"; children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />
      <header className="relative flex items-center justify-between gap-4 px-4 py-4 md:px-8">
        {logo}
        {salida}
      </header>
      <main className="relative flex flex-1 justify-center px-3 pt-2 pb-12 sm:px-4 sm:pt-6">
        <div className={cn("ws-aparecer flex h-fit w-full flex-col rounded-[28px] bg-card shadow-pop", ancho === "ancho" ? "max-w-[880px]" : "max-w-[640px]")}>
          <div className="px-5 pt-5 sm:px-10 sm:pt-8">
            <Progreso pasos={pasos} />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}

/**
 * Un paso del asistente, dentro de la tarjeta (su nombre ya va en el progreso): el título grande y una frase de por
 * qué; el contenido; y, separada por una raya, la fila de botones (atrás a la izquierda; «Lo haré más tarde» y continuar a
 * la derecha).
 */
export function AsistentePaso({ titulo, descripcion, pie, className, children }: { titulo: string; descripcion?: React.ReactNode; pie?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("flex flex-col gap-7 px-5 pt-7 pb-5 sm:px-10 sm:pt-9 sm:pb-8", className)}>
      <div>
        <h1 className="text-[26px] leading-tight font-semibold tracking-tight text-balance">{titulo}</h1>
        {descripcion && <p className="mt-2 max-w-xl text-sm text-pretty text-muted-foreground">{descripcion}</p>}
      </div>
      <div className="flex flex-col gap-7">{children}</div>
      {pie && <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">{pie}</div>}
    </section>
  )
}
