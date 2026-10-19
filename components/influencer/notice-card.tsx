import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { DocLogo } from "@/components/document/sheet"

/** El producto de la campaña, en la tarjeta que flota a la derecha del aviso destacado. */
export type ProductoAviso = {
  titulo: string
  /** Debajo del título: la marca y algo más («Nuura · Instagram»). */
  detalle?: string
  /** La foto o el render del producto; sin ella, el hueco va con su fondo. */
  imagenUrl?: string
  /** La pastilla oscura de la derecha («Nuevo»). */
  etiqueta?: string
}

/** El mosaico de productos del fondo: decorativo, el mismo para todas las campañas. */
const FONDO_OPORTUNIDAD = "/influencer/oportunidad-productos.webp"
const MASCARA_FONDO = "linear-gradient(90deg, transparent 0%, #000 38%)"

/**
 * El aviso que más importa, arriba del Inicio (Xavier, 2026-10-19, diseño «Tarjeta campaña Nuura»): a la izquierda el
 * logotipo, el antetítulo con su punto verde, el título, lo que se pide en pastillas y la acción; a la derecha un
 * mosaico de productos que se funde con el blanco, la tarjeta del producto y la pastilla de cristal con la cifra. Se
 * adapta a su ancho, no al de la pantalla: por debajo de 1100 px la cifra pasa a las pastillas y por debajo de 760 px
 * se queda solo el texto.
 */
export function NoticeHighlight({
  eyebrow,
  title,
  description,
  chips = [],
  accion,
  producto,
  cifra,
  fondoUrl = FONDO_OPORTUNIDAD,
  className,
}: {
  eyebrow?: string
  title: string
  /** Para un aviso sin pastillas. */
  description?: React.ReactNode
  chips?: string[]
  /** Con `href` va a otra página; con `onClick`, hace lo suyo (marcarlo leído) y navega. */
  accion?: AccionAviso
  producto?: ProductoAviso
  /** La pastilla de cristal: «Fee» y lo que le llega a ella. */
  cifra?: { etiqueta: string; valor: string }
  fondoUrl?: string
  className?: string
}) {
  return (
    <div
      data-slot="ws-notice-highlight"
      className={cn("@container relative overflow-hidden rounded-[28px] bg-card shadow-[0_1px_2px_rgba(20,24,40,.06),0_12px_40px_-12px_rgba(20,24,40,.14)]", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-15 -right-30 hidden h-105 w-220 bg-cover bg-center opacity-95 @min-[760px]:block"
        style={{ backgroundImage: `url(${fondoUrl})`, maskImage: MASCARA_FONDO, WebkitMaskImage: MASCARA_FONDO }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,var(--card)_34%,color-mix(in_oklab,var(--card)_85%,transparent)_48%,transparent_66%)] @min-[760px]:block"
      />
      {producto && <TarjetaProducto producto={producto} />}
      {cifra && (
        <div data-slot="ws-notice-flotante" className="absolute top-[150px] left-[calc(100%-210px)] hidden @min-[1100px]:block">
          <div className="flex rotate-4 flex-col gap-0.5 rounded-[18px] border border-white/90 bg-card/82 px-4 py-3 shadow-[0_18px_40px_-14px_rgba(30,30,60,.3)] backdrop-blur-[14px] dark:border-white/10">
            <span className="text-[11px] leading-[1.2] font-medium text-muted-foreground">{cifra.etiqueta}</span>
            <span className="text-[26px] leading-none font-bold tracking-[-0.03em]">{cifra.valor}</span>
          </div>
        </div>
      )}

      <div className="relative flex flex-col justify-between gap-4 p-6 @min-[760px]:min-h-[252px] @min-[760px]:w-[640px] @min-[760px]:max-w-[calc(100%-290px)] @min-[760px]:px-10 @min-[760px]:py-[30px] @min-[1100px]:max-w-none">
        <DocLogo devs={false} className="text-base" />
        <div className="flex flex-col gap-2.5">
          {eyebrow && (
            <p className="flex items-center gap-2 text-[13px] leading-none font-medium text-muted-foreground">
              <span data-slot="ws-notice-pulso" aria-hidden className="size-[7px] flex-none rounded-full bg-success" />
              {eyebrow}
            </p>
          )}
          <h2 className="m-0 text-[26px] leading-[1.05] font-semibold tracking-[-0.035em] text-balance @min-[760px]:text-[34px]">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {(chips.length > 0 || cifra) && (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c) => (
                <Pastilla key={c}>{c}</Pastilla>
              ))}
              {cifra && <Pastilla className="@min-[1100px]:hidden">{`${cifra.etiqueta} ${cifra.valor}`}</Pastilla>}
            </div>
          )}
        </div>
        {accion && <BotonAccion accion={accion} />}
      </div>
    </div>
  )
}

type AccionAviso = { etiqueta: string; href?: string; onClick?: () => void }

/** El botón negro con la flecha en su círculo blanco. */
function BotonAccion({ accion }: { accion: AccionAviso }) {
  const clase =
    "flex w-fit items-center gap-2.5 rounded-full bg-foreground py-[7px] pr-[7px] pl-[18px] text-sm leading-none font-medium text-background shadow-[0_6px_16px_-6px_rgba(20,22,27,.5)] transition-colors duration-200 hover:bg-foreground/88 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
  const contenido = (
    <>
      {accion.etiqueta}
      <span className="grid size-7 place-items-center rounded-full bg-background text-foreground">
        <ArrowRightIcon className="size-3.5" aria-hidden />
      </span>
    </>
  )
  return accion.href ? (
    <Link href={accion.href} onClick={accion.onClick} className={clase}>
      {contenido}
    </Link>
  ) : (
    <button type="button" onClick={accion.onClick} className={clase}>
      {contenido}
    </button>
  )
}

function Pastilla({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("rounded-full bg-muted px-[11px] py-[7px] text-[13px] leading-none font-medium text-foreground/85", className)}>{children}</span>
}

/**
 * La tarjeta blanca del producto, girada, que flota sobre el mosaico. Se sitúa desde el borde derecho: a 470 px con el
 * ancho entero y pegada a la derecha cuando la cifra ya no cabe.
 */
function TarjetaProducto({ producto }: { producto: ProductoAviso }) {
  return (
    <div data-slot="ws-notice-flotante" className="absolute top-[42px] right-10 hidden w-[230px] @min-[760px]:block @min-[1100px]:right-auto @min-[1100px]:left-[calc(100%-470px)]">
      <div className="flex -rotate-6 flex-col gap-2.5 rounded-[22px] bg-card p-2.5 shadow-[0_30px_60px_-18px_rgba(30,30,60,.35),0_4px_10px_rgba(30,30,60,.08)]">
        <div className="relative h-[118px] overflow-hidden rounded-[14px] bg-muted">
          {producto.imagenUrl && <Image src={producto.imagenUrl} alt={producto.titulo} fill sizes="210px" unoptimized className="object-cover" />}
        </div>
        <div className="flex items-center justify-between gap-2 px-1 pb-1">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="line-clamp-2 text-sm leading-[1.2] font-semibold">{producto.titulo}</span>
            {producto.detalle && <span className="truncate text-xs leading-[1.2] text-muted-foreground">{producto.detalle}</span>}
          </div>
          {producto.etiqueta && <span className="flex-none rounded-full bg-foreground px-[9px] py-1.5 text-[11px] leading-none font-semibold text-background">{producto.etiqueta}</span>}
        </div>
      </div>
    </div>
  )
}

/** Un aviso de la lista: icono, título, hace cuánto (`meta`, ya formateado) y, si no está leído, el punto y la negrita. */
export function NoticeItem({
  icon: Icon,
  title,
  description,
  meta,
  unread,
  href,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  meta: string
  unread?: boolean
  href: string
  className?: string
}) {
  return (
    <Link
      data-slot="ws-notice-item"
      href={href}
      className={cn("group flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted", className)}
    >
      <span className="relative grid size-8 flex-none place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-4" aria-hidden />
        {unread && <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-brand ring-2 ring-card" aria-hidden />}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm", unread ? "font-semibold" : "font-medium")}>{title}</span>
        {description && <span className="block truncate text-xs text-muted-foreground">{description}</span>}
      </span>
      <span className="flex-none pt-0.5 text-xs text-muted-foreground">{meta}</span>
    </Link>
  )
}
