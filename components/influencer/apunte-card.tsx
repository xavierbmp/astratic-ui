"use client"

import Image from "next/image"
import { FileTextIcon, FlagIcon, HourglassIcon, LightbulbIcon, LinkIcon, StarIcon } from "lucide-react"
import { cn } from "cn"
import { ESTADOS_IDEA, FORMATOS, estadoDe, type Apunte, type Carpeta, type EstadoIdea, type FechaClave, type Marca, type Pilar } from "@/lib/influencer/modelo"
import { caducaPronto, portadaDeApunte, resumenDeApunte, textoCaducidad } from "@/lib/influencer/apuntes"
import { tintClass } from "@/lib/influencer/tints"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusBadge } from "@/components/app/status-badge"
import { SocialIcon } from "@/components/app/social-icons"
import { BrandMark } from "@/components/influencer/brand-mark"

/** Cuánto ocupa cada tarjeta de la galería: la vista lo elige en sus ajustes. En el móvil, dos por fila (una si son grandes). */
export const COLUMNAS_GALERIA = {
  pequena: "grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]",
  mediana: "grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]",
  grande: "grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]",
} as const

/** La portada: la captura si hay; si no, el principio del documento o el tinte de su pilar con el icono de su red. */
function Portada({ apunte, pilar }: { apunte: Apunte; pilar?: Pilar }) {
  const imagen = portadaDeApunte(apunte)
  const resumen = resumenDeApunte(apunte, 220)
  // Una captura recién subida es un enlace local del navegador: se pinta tal cual, sin optimizar.
  if (imagen) return <Image src={imagen} alt="" fill sizes="(max-width: 768px) 50vw, 300px" unoptimized={!imagen.startsWith("https://")} className="object-cover" />
  if (apunte.tipo === "documento")
    return (
      <span className="absolute inset-0 grid content-start gap-2 bg-muted/60 p-3">
        <FileTextIcon className="size-4 text-muted-foreground" aria-hidden />
        <span className="line-clamp-5 text-[11px] leading-snug text-muted-foreground">{resumen}</span>
      </span>
    )
  const red = apunte.referencias.some((r) => r.tipo === "enlace") ? apunte.redes[0] : undefined
  return (
    <span className={cn("absolute inset-0 grid place-items-center", pilar ? tintClass[pilar.tint] : "bg-muted text-muted-foreground")}>
      {red ? <SocialIcon network={red} className="size-7 opacity-80" /> : <LightbulbIcon className="size-7 opacity-70" aria-hidden />}
      {resumen && <span className="absolute inset-x-3 bottom-2 line-clamp-2 text-[11px] leading-snug opacity-80">{resumen}</span>}
    </span>
  )
}

/**
 * Una idea o un documento en la galería del directorio de Contenidos: su portada (la captura, el
 * texto o el tinte de su pilar), el título y las propiedades que pide la vista. La caducidad sale
 * siempre, que es lo que no puede pasarse. La tarjeta entera abre su ficha; la estrella, la casilla
 * y la acción («Planificar») hacen lo suyo sin abrirla.
 */
export function ApunteCard({
  apunte,
  estado,
  pilar,
  carpeta,
  marca,
  fechaClave,
  hoy,
  propiedades,
  activa,
  seleccionada,
  onAbrir,
  onSeleccionar,
  onFavorito,
  accion,
  className,
}: {
  apunte: Apunte
  estado: EstadoIdea | null
  pilar?: Pilar
  carpeta?: Carpeta
  marca?: Pick<Marca, "nombre" | "tint">
  fechaClave?: FechaClave
  hoy: string
  /** Las propiedades que enseña, las de la vista: pilar, formato, estado, redes, carpeta, marca, fechaClave… */
  propiedades: string[]
  activa?: boolean
  seleccionada?: boolean
  onAbrir: () => void
  onSeleccionar?: (seleccionada: boolean) => void
  onFavorito?: () => void
  /** El botón de la tarjeta («Planificar», «Proponer»). */
  accion?: React.ReactNode
  className?: string
}) {
  const ver = (p: string) => propiedades.includes(p)
  const caducidad = textoCaducidad(apunte, hoy)
  const urgente = caducaPronto(apunte, hoy) || caducidad === "Caducó"
  const enlaces = apunte.referencias.filter((r) => r.tipo === "enlace").length
  return (
    <article
      data-slot="ws-apunte-card"
      className={cn(
        "group/apunte relative flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:border-input",
        (activa || seleccionada) && "border-brand bg-brand-soft/40 ring-1 ring-brand",
        className,
      )}
    >
      <button type="button" onClick={onAbrir} aria-label={`Abrir «${apunte.titulo}»`} className="absolute inset-0 z-0 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
      <div className="pointer-events-none relative aspect-[4/3] overflow-hidden border-b">
        <Portada apunte={apunte} pilar={pilar} />
        {onSeleccionar && (
          <span className={cn("pointer-events-auto absolute top-2 left-2 z-10 rounded-md bg-card/90 p-1 shadow-xs transition-opacity", seleccionada ? "opacity-100" : "opacity-0 group-hover/apunte:opacity-100 focus-within:opacity-100")}>
            <Checkbox checked={!!seleccionada} onCheckedChange={(v) => onSeleccionar(v === true)} aria-label={`Seleccionar «${apunte.titulo}»`} />
          </span>
        )}
        {onFavorito && (
          <button
            type="button"
            onClick={onFavorito}
            aria-label={apunte.favorito ? "Quitar de favoritas" : "Marcar como favorita"}
            aria-pressed={apunte.favorito}
            className={cn(
              "pointer-events-auto absolute top-2 right-2 z-10 grid size-7 place-items-center rounded-full bg-card/90 shadow-xs transition-opacity",
              apunte.favorito ? "text-warning opacity-100" : "text-muted-foreground opacity-0 group-hover/apunte:opacity-100 focus-visible:opacity-100",
            )}
          >
            <StarIcon className={cn("size-3.5", apunte.favorito && "fill-current")} />
          </button>
        )}
      </div>
      <div className="pointer-events-none relative grid flex-1 content-start gap-2 p-3">
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold">{apunte.titulo}</h3>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          {ver("estado") && estado && (
            <StatusBadge tone={estadoDe(ESTADOS_IDEA, estado).tone} className="h-5 text-[11px]">
              {estadoDe(ESTADOS_IDEA, estado).label}
            </StatusBadge>
          )}
          {ver("pilar") && pilar && <span className={cn("rounded-full px-2 py-px font-medium", tintClass[pilar.tint])}>{pilar.nombre}</span>}
          {ver("formato") && apunte.formato && (
            <span className="inline-flex items-center gap-1">
              {FORMATOS[apunte.formato].red && <SocialIcon network={FORMATOS[apunte.formato].red ?? "instagram"} className="size-3" />}
              {FORMATOS[apunte.formato].label}
            </span>
          )}
          {ver("redes") && apunte.redes.length > 0 && (
            <span className="inline-flex items-center gap-1">
              {apunte.redes.map((r) => (
                <SocialIcon key={r} network={r} className="size-3" />
              ))}
            </span>
          )}
          {ver("carpeta") && carpeta && (
            <span className="inline-flex items-center gap-1">
              <span className={cn("size-2 rounded-full", tintClass[carpeta.tint])} aria-hidden />
              {carpeta.nombre}
            </span>
          )}
          {ver("marca") && marca && (
            <span className="inline-flex items-center gap-1">
              <BrandMark name={marca.nombre} tint={marca.tint} size="xs" className="size-4 rounded text-[8px]" />
              {marca.nombre}
            </span>
          )}
          {ver("fechaClave") && fechaClave && (
            <span className="inline-flex items-center gap-1 text-info">
              <FlagIcon className="size-3" /> {fechaClave.nombre}
            </span>
          )}
          {ver("referencias") && enlaces > 0 && (
            <span className="inline-flex items-center gap-1">
              <LinkIcon className="size-3" /> {enlaces}
            </span>
          )}
          {caducidad && (
            <span className={cn("inline-flex items-center gap-1 font-medium", urgente ? "text-warning" : "text-muted-foreground")}>
              <HourglassIcon className="size-3" /> {caducidad}
            </span>
          )}
        </div>
        {accion && <div className="pointer-events-auto relative z-10 mt-auto flex justify-end opacity-100 transition-opacity md:opacity-0 md:group-hover/apunte:opacity-100 md:focus-within:opacity-100">{accion}</div>}
      </div>
    </article>
  )
}
