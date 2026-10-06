import Image from "next/image"
import Link from "next/link"
import { ClapperboardIcon, HourglassIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { ESTADOS_PIEZA, ESTADOS_VERSION, FORMATOS, estadoDe, type Pieza } from "@/lib/influencer/modelo"
import { diasEsperando, siguientePasoDePieza, ultimaVersion } from "@/lib/influencer/collabs"
import { tintClass, type Tint } from "@/lib/influencer/tints"
import { StatusBadge } from "@/components/app/status-badge"
import { SocialIcon } from "@/components/app/social-icons"

/** Una pieza en la biblioteca: miniatura, estado, qué toca ahora y en qué versión van el guion y el vídeo. */
export function PiezaCard({ pieza, tint, hoy, href, className }: { pieza: Pieza; tint: Tint; hoy: string; href: string; className?: string }) {
  const estado = estadoDe(ESTADOS_PIEZA, pieza.estado)
  const red = FORMATOS[pieza.formato].red
  const guion = ultimaVersion(pieza.guion)
  const video = ultimaVersion(pieza.video)
  const esperando = Math.max(guion ? diasEsperando(guion, hoy) : 0, video ? diasEsperando(video, hoy) : 0)

  const chip = (etiqueta: string, v: NonNullable<typeof guion> | null) =>
    v ? (
      <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-px text-[11px] font-medium">
        {etiqueta} v{v.numero}
        <span className={cn("size-1.5 rounded-full", v.estado === "aprobada" ? "bg-success" : v.estado === "cambios" ? "bg-warning" : v.estado === "en-revision" ? "bg-info" : "bg-muted-foreground/50")} aria-label={estadoDe(ESTADOS_VERSION, v.estado).label} />
      </span>
    ) : (
      <span className="inline-flex items-center rounded-md border border-dashed px-1.5 py-px text-[11px] text-muted-foreground">{etiqueta} —</span>
    )

  return (
    <Link href={href} className={cn("group flex gap-4 rounded-xl bg-background/70 p-3 transition-colors hover:bg-muted", className)}>
      <span className={cn("relative h-24 w-[72px] flex-none overflow-hidden rounded-lg", tintClass[tint])}>
        {pieza.portadaUrl ? <Image src={pieza.portadaUrl} alt="" fill sizes="72px" className="object-cover transition-transform group-hover:scale-105" /> : <ClapperboardIcon className="absolute inset-0 m-auto size-6" />}
      </span>
      <span className="grid min-w-0 flex-1 content-start gap-1.5">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-semibold">{pieza.titulo}</span>
          <StatusBadge tone={estado.tone}>{estado.label}</StatusBadge>
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {red && <SocialIcon network={red} className="size-3" />}
          {FORMATOS[pieza.formato].label}
          <span>·</span>
          {pieza.publicada ? `publicado el ${fmt.date(pieza.publicada.fecha)}` : `publicar el ${fmt.date(pieza.publicacion)}`}
        </span>
        <span className="truncate text-xs">{siguientePasoDePieza(pieza)}</span>
        <span className="flex flex-wrap items-center gap-1.5">
          {chip("Guion", guion)}
          {chip("Vídeo", video)}
          {esperando > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-info">
              <HourglassIcon className="size-3" /> {esperando} {esperando === 1 ? "día" : "días"} esperando
            </span>
          )}
        </span>
      </span>
    </Link>
  )
}
