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

// Cada panel se mete `--corte` por debajo del anterior, que lo pisa con su borde en diagonal y su sombra: el de antes
// (lo más urgente) queda encima del de después. El último no tiene corte: no pisa a nadie.
const CORTE = "[clip-path:polygon(0_0,100%_0,calc(100%_-_var(--corte))_100%,0_100%)]"
const RECTO = "[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]"
/** Quien va antes, más arriba. Caben ocho; con más, el resto comparte el fondo. */
const CAPA = ["z-[8]", "z-[7]", "z-[6]", "z-[5]", "z-[4]", "z-[3]", "z-[2]", "z-[1]"]

/**
 * Las collabs en marcha como paneles que llenan todo su hueco y se pisan en diagonal, la más urgente encima: la imagen
 * de la campaña (o su tinte), lo que toca ahora y lo que viene después, las piezas hechas y sus tareas. La nueva va en
 * el acento y más ancha. Al pasar el ratón (o con el foco), el panel sube encima de todos, pierde el corte y se queda
 * casi todo el bloque; los demás se quedan en una tira de su imagen. En el móvil se deslizan.
 */
export function FranjaCollabs({ collabs, className }: { collabs: CollabEnFranja[]; className?: string }) {
  return (
    <div
      data-slot="ws-franja-collabs"
      className={cn(
        "group/franja flex min-h-72 snap-x overflow-x-auto rounded-xl [--corte:3rem] [scrollbar-width:none] sm:overflow-hidden [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {collabs.map((c, i) => (
        <PanelCollab key={c.id} collab={c} capa={CAPA[i] ?? "z-0"} primero={i === 0} ultimo={i === collabs.length - 1} />
      ))}
    </div>
  )
}

function PanelCollab({ collab: c, capa, primero, ultimo }: { collab: CollabEnFranja; capa: string; primero: boolean; ultimo: boolean }) {
  const conPortada = Boolean(c.portadaUrl)
  const claro = conPortada && !c.nueva
  const segmentos = Array.from({ length: c.totales }, (_, i) => i < c.hechas)
  return (
    // La sombra va en un envoltorio: con el recorte en el propio panel, se perdería.
    <div
      className={cn(
        "group/panel relative flex w-[80%] flex-none snap-start transition-[flex-grow] duration-500 ease-out [filter:drop-shadow(8px_0_12px_rgb(0_0_0/0.35))] sm:w-auto sm:min-w-16 sm:flex-1",
        capa,
        !primero && "-ml-[var(--corte)]",
        c.nueva && "sm:grow-[1.3]",
        "hover:z-[9] has-[:focus-visible]:z-[9] sm:hover:grow-[6] sm:has-[:focus-visible]:grow-[6]",
      )}
    >
      <Link
        href={c.href}
        className={cn(
          "@container relative isolate flex w-full flex-col justify-between gap-4 overflow-hidden p-4 outline-none transition-[clip-path] duration-500 ease-out group-hover/panel:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)] group-has-[:focus-visible]/panel:[clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]",
          ultimo ? RECTO : CORTE,
          conPortada ? (c.nueva ? "text-brand-foreground" : "text-white") : c.nueva ? "bg-brand text-brand-foreground" : tintClass[c.tint],
        )}
      >
        {c.portadaUrl && (
          <>
            <Image src={c.portadaUrl} alt="" fill sizes="(min-width: 1280px) 40vw, 80vw" className="-z-10 object-cover transition-transform duration-700 group-hover/panel:scale-105" />
            <span
              aria-hidden
              className={cn("absolute inset-0 -z-10 bg-gradient-to-t", c.nueva ? "from-brand via-brand/55 to-black/10" : "from-black/80 via-black/35 to-black/5")}
            />
          </>
        )}
        {/* Mientras se mira otro panel, este solo enseña su imagen. */}
        <div className="contents [&>*]:transition-opacity [&>*]:duration-300 sm:group-hover/franja:[&>*]:opacity-0 sm:group-hover/panel:[&>*]:opacity-100!">
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
        </div>
      </Link>
    </div>
  )
}
