import Link from "next/link"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"
import { Block } from "@/components/influencer/block"

/** Cómo va cada paso: hecho, dejado para más tarde, el de ahora o por hacer. */
export type EstadoPasoAsistente = "hecho" | "saltado" | "actual" | "pendiente"
export type PasoAsistente = { id: string; titulo: string; estado: EstadoPasoAsistente; href: string }

function Marca({ estado, numero }: { estado: EstadoPasoAsistente; numero: number }) {
  if (estado === "hecho")
    return (
      <span className="grid size-6 flex-none place-items-center rounded-full bg-foreground text-background">
        <CheckIcon className="size-3.5" strokeWidth={3} aria-label="Hecho" />
      </span>
    )
  return (
    <span
      className={cn(
        "grid size-6 flex-none place-items-center rounded-full text-[11px] font-semibold tabular-nums",
        estado === "actual" ? "bg-brand text-background ring-4 ring-brand-soft" : "border-2 border-control text-muted-foreground",
      )}
    >
      {numero}
    </span>
  )
}

/** Los pasos en vertical, con su línea: se puede ir a cualquiera, hecho o no. */
function RielPasos({ pasos }: { pasos: PasoAsistente[] }) {
  return (
    <ol aria-label="Pasos" className="flex flex-col">
      {pasos.map((p, i) => (
        <li key={p.id} className="relative">
          {i < pasos.length - 1 && <span aria-hidden className={cn("absolute top-8 bottom-0 left-[11px] w-0.5 rounded-full", p.estado === "hecho" ? "bg-foreground/80" : "bg-border")} />}
          <Link href={p.href} aria-current={p.estado === "actual" ? "step" : undefined} className="group/paso flex items-start gap-3 rounded-xl py-1.5 pb-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <Marca estado={p.estado} numero={i + 1} />
            <span className="min-w-0 pt-0.5 leading-tight">
              <span className={cn("block text-sm transition-colors", p.estado === "actual" ? "font-semibold" : "text-muted-foreground group-hover/paso:text-foreground")}>{p.titulo}</span>
              {p.estado === "saltado" && <span className="mt-0.5 block text-xs text-muted-foreground">Para más tarde</span>}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

/**
 * El marco de un asistente por pasos que ocupa la pantalla (la bienvenida del workspace): arriba el logotipo y la
 * salida; a la izquierda, desde `lg`, los pasos en vertical; en el móvil, una barra de progreso por tramos. El fondo
 * lleva una trama de puntos muy suave, y cada paso es un `AsistentePaso`.
 */
export function AsistenteMarco({ logo, pasos, salida, children }: { logo: React.ReactNode; pasos: PasoAsistente[]; salida?: React.ReactNode; children: React.ReactNode }) {
  const actual = Math.max(0, pasos.findIndex((p) => p.estado === "actual"))
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />
      <header className="relative flex items-center justify-between gap-4 px-4 py-4 md:px-8">
        {logo}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums lg:hidden">
            Paso {actual + 1} de {pasos.length}
          </span>
          {salida}
        </div>
      </header>
      <div className="relative px-4 lg:hidden">
        <div className="flex gap-1" aria-hidden>
          {pasos.map((p) => (
            <span key={p.id} className={cn("h-1 flex-1 rounded-full", p.estado === "hecho" || p.estado === "actual" ? "bg-foreground" : p.estado === "saltado" ? "bg-foreground/30" : "bg-border")} />
          ))}
        </div>
      </div>
      <div className="relative mx-auto grid w-full max-w-5xl flex-1 gap-10 px-4 pt-8 pb-16 md:px-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:pt-14">
        <aside className="hidden lg:block">
          <div className="sticky top-10">
            <RielPasos pasos={pasos} />
          </div>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}

/**
 * Un paso del asistente: arriba su número y su nombre en pequeño, el título y una frase de por qué; el contenido en un
 * bloque blanco y, debajo, la fila de botones (atrás a la izquierda; «Lo haré más tarde» y continuar a la derecha).
 */
export function AsistentePaso({ etiqueta, titulo, descripcion, pie, sinBloque, className, children }: { etiqueta?: string; titulo: string; descripcion?: React.ReactNode; pie?: React.ReactNode; sinBloque?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("mx-auto flex w-full max-w-2xl flex-col gap-6", className)}>
      <div>
        {etiqueta && <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{etiqueta}</p>}
        <h1 className="mt-1.5 text-[27px] leading-tight font-semibold tracking-tight text-balance">{titulo}</h1>
        {descripcion && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{descripcion}</p>}
      </div>
      {sinBloque ? children : <Block className="gap-5">{children}</Block>}
      {pie && <div className="flex flex-wrap items-center justify-between gap-3">{pie}</div>}
    </section>
  )
}
