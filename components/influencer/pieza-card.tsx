import Image from "next/image"
import Link from "next/link"
import { HourglassIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { ESTADOS_PIEZA, ESTADOS_VERSION, estadoDe, type Pieza, type TipoVersion, type Version } from "@/lib/influencer/modelo"
import { diasEsperando, etiquetaDePieza, nombreDeParte, partesDePieza, redDePieza, siguientePasoDePieza, ultimaVersion } from "@/lib/influencer/collabs"
import { diasEntre } from "@/lib/influencer/fechas"
import { tintClass, type Tint } from "@/lib/influencer/tints"
import { StatusBadge } from "@/components/app/status-badge"
import { SocialIcon } from "@/components/app/social-icons"
import { ICONOS_PIEZA } from "@/components/influencer/piezas-editor"

const PUNTO: Record<Version["estado"], string> = { aprobada: "bg-success", cambios: "bg-warning", "en-revision": "bg-info", borrador: "bg-muted-foreground/50" }

const DIA = new Intl.DateTimeFormat("es-ES", { weekday: "short" })

function Miniatura({ pieza, tint, className }: { pieza: Pieza; tint: Tint; className: string }) {
  const Icono = ICONOS_PIEZA[pieza.tipo]
  return (
    <span className={cn("relative flex-none overflow-hidden rounded-lg", tintClass[tint], className)}>
      {pieza.portadaUrl ? <Image src={pieza.portadaUrl} alt="" fill sizes="72px" className="object-cover" /> : <Icono className="absolute inset-0 m-auto size-5" aria-hidden />}
    </span>
  )
}

/** «Guion v1 ·» con el punto del estado de su última versión, o «Guion —» si aún no hay. */
export function ParteChip({ pieza, parte }: { pieza: Pieza; parte: TipoVersion }) {
  const v = ultimaVersion(pieza[parte])
  const nombre = nombreDeParte(pieza, parte)
  return v ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-px text-[11px] font-medium">
      {nombre} v{v.numero}
      <span className={cn("size-1.5 rounded-full", PUNTO[v.estado])} aria-label={estadoDe(ESTADOS_VERSION, v.estado).label} />
    </span>
  ) : (
    <span className="inline-flex items-center rounded-md border border-dashed px-1.5 py-px text-[11px] text-muted-foreground">{nombre} —</span>
  )
}

/**
 * Una pieza en la lista de contenidos: la fecha de publicación delante, la miniatura, el estado, qué
 * toca ahora y en qué versión va cada parte. `compacta` es la misma pieza en la barra lateral, con
 * sus partes (guion y vídeo o fotos) como enlaces.
 */
export function PiezaCard({ pieza, tint, hoy, href, activa, parteActiva, compacta, className }: { pieza: Pieza; tint: Tint; hoy: string; href: string; activa?: boolean; parteActiva?: TipoVersion; compacta?: boolean; className?: string }) {
  const estado = estadoDe(ESTADOS_PIEZA, pieza.estado)
  const red = redDePieza(pieza)
  const partes = partesDePieza(pieza)
  const esperando = Math.max(...partes.map((p) => {
    const v = ultimaVersion(pieza[p])
    return v ? diasEsperando(v, hoy) : 0
  }))
  const fecha = pieza.publicada?.fecha ?? pieza.publicacion
  const tarde = !pieza.publicada && diasEntre(hoy, pieza.publicacion) < 0

  if (compacta) {
    return (
      <div className={cn("rounded-xl transition-colors", activa ? "bg-brand-soft" : "hover:bg-muted", className)}>
        <Link href={href} className="flex items-center gap-2.5 p-2" aria-current={activa ? "page" : undefined}>
          <Miniatura pieza={pieza} tint={tint} className="h-11 w-9" />
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span className="truncate text-[13px] font-semibold">{pieza.titulo}</span>
            <span className={cn("flex items-center gap-1.5 text-[11px]", tarde ? "text-danger" : "text-muted-foreground")}>
              {red && <SocialIcon network={red} className="size-3" />}
              {fmt.date(fecha)}
              <span className="text-muted-foreground">· {estado.label}</span>
            </span>
          </span>
        </Link>
        {activa && (
          <ul className="flex flex-col gap-0.5 px-2 pb-2">
            {partes.map((p) => {
              const v = ultimaVersion(pieza[p])
              return (
                <li key={p}>
                  <Link href={`${href}?parte=${p}`} aria-current={parteActiva === p ? "true" : undefined} className={cn("flex items-center gap-2 rounded-lg py-1.5 pr-2 pl-11 text-xs transition-colors", parteActiva === p ? "bg-card font-medium shadow-xs" : "text-muted-foreground hover:bg-card/60 hover:text-foreground")}>
                    <span className="flex-1">{nombreDeParte(pieza, p)}</span>
                    {v ? (
                      <span className="inline-flex items-center gap-1">
                        v{v.numero} <span className={cn("size-1.5 rounded-full", PUNTO[v.estado])} />
                      </span>
                    ) : (
                      <span>—</span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

  return (
    <Link href={href} className={cn("group flex items-center gap-4 rounded-xl border bg-card p-3 transition-colors hover:border-input hover:bg-muted/40", className)}>
      <span className={cn("grid w-12 flex-none justify-items-center rounded-lg py-1.5", tarde ? "bg-danger-soft text-danger" : "bg-muted")}>
        <span className="text-[10px] font-medium uppercase">{DIA.format(new Date(`${fecha}T12:00:00`)).replace(".", "")}</span>
        <span className="text-lg leading-tight font-semibold tabular-nums">{Number(fecha.slice(8))}</span>
        <span className="text-[10px] uppercase">{fmt.date(fecha).split(" ")[1]}</span>
      </span>
      <Miniatura pieza={pieza} tint={tint} className="h-[72px] w-14" />
      <span className="grid min-w-0 flex-1 content-start gap-1.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold">{pieza.titulo}</span>
          <StatusBadge tone={estado.tone}>{estado.label}</StatusBadge>
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {red && <SocialIcon network={red} className="size-3" />}
          {etiquetaDePieza(pieza)}
          {pieza.unidades > 1 && <span>· {pieza.unidades} unidades</span>}
          <span>·</span>
          {pieza.publicada ? `publicada el ${fmt.date(pieza.publicada.fecha)}` : `publicar el ${fmt.date(pieza.publicacion)}`}
        </span>
        <span className="truncate text-xs">{siguientePasoDePieza(pieza)}</span>
        <span className="flex flex-wrap items-center gap-1.5">
          {partes.map((p) => (
            <ParteChip key={p} pieza={pieza} parte={p} />
          ))}
          {esperando > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-info">
              <HourglassIcon className="size-3" /> {esperando} {esperando === 1 ? "día" : "días"} esperando a la marca
            </span>
          )}
        </span>
      </span>
    </Link>
  )
}
