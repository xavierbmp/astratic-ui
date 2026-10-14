import Image from "next/image"
import Link from "next/link"
import { ListTodoIcon, SparklesIcon } from "lucide-react"
import { cn } from "cn"
import { fmt, initials } from "@/lib/format"
import { tintClass, type Tint } from "@/lib/influencer/tints"

export type HitoEnFranja = { label: string; fecha: string }

export type CollabEnFranja = {
  id: string
  marca: string
  campana: string
  portadaUrl?: string
  logoUrl?: string
  tint: Tint
  hechas: number
  totales: number
  /** Lo que toca ahora; sin nada, «Todo entregado». */
  ahora?: HitoEnFranja
  /** Lo que viene después. */
  despues?: HitoEnFranja
  /** Sus tareas sin hacer. */
  tareas: number
  /** Recién creada: va resaltada en el acento y un poco más ancha. */
  nueva: boolean
  href: string
}

// El corte en diagonal: cada panel se monta `--corte` sobre el anterior y deja `--hueco` libre entre los dos.
const FORMA_PRIMERO = "[clip-path:polygon(0_0,100%_0,calc(100%_-_var(--corte))_100%,0_100%)]"
const FORMA_MEDIO = "[clip-path:polygon(var(--corte)_0,100%_0,calc(100%_-_var(--corte))_100%,0_100%)] -ml-[calc(var(--corte)_-_var(--hueco))]"
const FORMA_ULTIMO = "[clip-path:polygon(var(--corte)_0,100%_0,100%_100%,0_100%)] -ml-[calc(var(--corte)_-_var(--hueco))]"

function formaDe(i: number, total: number) {
  if (total === 1) return ""
  if (i === 0) return FORMA_PRIMERO
  return i === total - 1 ? FORMA_ULTIMO : FORMA_MEDIO
}

/**
 * Las collabs en marcha como paneles que llenan todo su hueco, separados por un corte en diagonal: la imagen
 * de la campaña (o su tinte), lo que toca ahora y lo que viene después, las piezas hechas y sus tareas. La
 * nueva va en el acento y más ancha; al pasar el ratón, el panel se ensancha. En el móvil se desliza.
 */
export function FranjaCollabs({ collabs, className }: { collabs: CollabEnFranja[]; className?: string }) {
  return (
    <div
      data-slot="ws-franja-collabs"
      className={cn(
        "flex min-h-72 snap-x overflow-x-auto rounded-xl [--corte:2.75rem] [--hueco:0.375rem] [scrollbar-width:none] sm:overflow-hidden [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {collabs.map((c, i) => (
        <PanelCollab key={c.id} collab={c} forma={formaDe(i, collabs.length)} primero={i === 0} ultimo={i === collabs.length - 1} />
      ))}
    </div>
  )
}

function PanelCollab({ collab: c, forma, primero, ultimo }: { collab: CollabEnFranja; forma: string; primero: boolean; ultimo: boolean }) {
  const conPortada = Boolean(c.portadaUrl)
  const claro = conPortada && !c.nueva
  const segmentos = Array.from({ length: c.totales }, (_, i) => i < c.hechas)
  return (
    <Link
      href={c.href}
      className={cn(
        "group/panel @container relative isolate flex w-[80%] flex-none snap-start flex-col justify-between gap-4 overflow-hidden p-4 outline-none transition-[flex-grow] duration-300 ease-out sm:w-auto sm:min-w-36 sm:flex-1 sm:hover:grow-[1.6] sm:focus-visible:grow-[1.6]",
        c.nueva && "sm:grow-[1.3]",
        forma,
        conPortada ? (c.nueva ? "text-brand-foreground" : "text-white") : c.nueva ? "bg-brand text-brand-foreground" : tintClass[c.tint],
      )}
    >
      {c.portadaUrl && (
        <>
          <Image src={c.portadaUrl} alt="" fill sizes="(min-width: 1280px) 30vw, 80vw" className="-z-10 object-cover transition-transform duration-500 group-hover/panel:scale-105" />
          <span
            aria-hidden
            className={cn("absolute inset-0 -z-10 bg-gradient-to-t", c.nueva ? "from-brand via-brand/55 to-black/10" : "from-black/80 via-black/35 to-black/5")}
          />
        </>
      )}

      <div className={cn("flex items-start justify-between gap-2", !primero && "ml-[calc(var(--corte)_-_0.75rem)]")}>
        <span className="grid size-10 flex-none place-items-center overflow-hidden rounded-xl bg-card text-xs font-semibold text-card-foreground shadow-xs" aria-hidden>
          {c.logoUrl ? <Image src={c.logoUrl} alt="" width={40} height={40} className="object-cover" /> : initials(c.marca)}
        </span>
        <span className="flex min-w-0 flex-wrap justify-end gap-1.5">
          {c.nueva && (
            <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold", conPortada ? "bg-card text-brand" : "bg-brand-foreground text-brand")}>
              <SparklesIcon className="size-3" aria-hidden /> Nueva
            </span>
          )}
          {c.tareas > 0 && (
            <span
              title={`${c.tareas} ${c.tareas === 1 ? "tarea" : "tareas"} por hacer`}
              className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", claro ? "bg-white/20 backdrop-blur-sm" : "bg-card/70 text-card-foreground")}
            >
              <ListTodoIcon className="size-3" aria-hidden />
              {c.tareas}
              {/* La palabra solo si el panel tiene sitio; si no, se lee en el título. */}
              <span className="sr-only @min-[13rem]:not-sr-only">{c.tareas === 1 ? "tarea" : "tareas"}</span>
            </span>
          )}
        </span>
      </div>

      <div className={cn("min-w-0", !primero && "ml-[calc(var(--corte)_*_0.4)]", !ultimo && "mr-[calc(var(--corte)_-_1rem)]")}>
        <p className="truncate text-xs opacity-80">{c.marca}</p>
        <p className="line-clamp-2 text-lg leading-tight font-semibold tracking-tight group-focus-visible/panel:underline">{c.campana}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex flex-1 gap-1" aria-label={`${c.hechas} de ${c.totales} piezas hechas`}>
            {segmentos.map((hecha, i) => (
              <span key={i} className={cn("h-1.5 flex-1 rounded-full", hecha ? "bg-current" : "bg-current/25")} />
            ))}
          </span>
          <span className="text-xs font-medium tabular-nums">
            {c.hechas}/{c.totales}
          </span>
        </div>
        <dl className="mt-3 flex flex-col gap-2 text-xs">
          <div className="min-w-0">
            <dt className="flex justify-between gap-2 whitespace-nowrap opacity-75">
              Ahora
              {c.ahora && <span className="font-semibold tabular-nums">{fmt.date(c.ahora.fecha)}</span>}
            </dt>
            <dd className="truncate text-sm font-medium">{c.ahora?.label ?? "Todo entregado"}</dd>
          </div>
          {c.despues && (
            <div className="min-w-0 opacity-75">
              <dt className="flex justify-between gap-2 whitespace-nowrap">
                Después
                <span className="tabular-nums">{fmt.date(c.despues.fecha)}</span>
              </dt>
              <dd className="truncate">{c.despues.label}</dd>
            </div>
          )}
        </dl>
      </div>
    </Link>
  )
}
