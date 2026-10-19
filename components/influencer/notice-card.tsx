import Image from "next/image"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"
import { tintClass, type Tint } from "@/lib/influencer/tints"
import { DocLogo } from "@/components/document/sheet"

/** Una de las tarjetas del abanico del aviso destacado: con imagen (la portada de la campaña) o de color, con su icono. */
export type TarjetaAbanico = {
  id: string
  titulo: string
  detalle?: string
  imagenUrl?: string
  icono?: LucideIcon
  /** El color de la tarjeta: un tinte, la marca de la casa o la oscura. Las de imagen no lo usan. */
  color?: Tint | "brand" | "oscura"
}

const COLOR_TARJETA: Record<NonNullable<TarjetaAbanico["color"]>, string> = { ...tintClass, brand: "bg-brand text-brand-foreground", oscura: "bg-foreground text-background" }

/**
 * El aviso que más importa, arriba del Inicio (Xavier, 2026-10-19, reporte cmvcm6ez, a partir de una referencia): una
 * tarjeta blanca con el logotipo de Astratic arriba a la izquierda, lo que es escrito limpio y su acción, y a la
 * derecha unas tarjetas que se pisan en abanico (`tarjetas`: la campaña con su imagen, la marca, lo que se pide).
 */
export function NoticeHighlight({
  eyebrow,
  title,
  description,
  action,
  tarjetas,
  className,
}: {
  eyebrow?: string
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  /** De dos a cuatro; sin ninguna, la tarjeta va sola. En el móvil no salen. */
  tarjetas?: TarjetaAbanico[]
  className?: string
}) {
  return (
    <div data-slot="ws-notice-highlight" className={cn("relative flex flex-col gap-4 overflow-hidden rounded-2xl bg-card p-5 shadow-card md:flex-row md:items-center md:p-6", className)}>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
        <DocLogo devs={false} className="text-[15px]" />
        <div className="min-w-0">
          {eyebrow && <p className="text-xs font-medium text-muted-foreground">{eyebrow}</p>}
          <p className="mt-1 text-xl leading-tight font-semibold tracking-tight text-balance md:text-2xl">{title}</p>
          {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {tarjetas && tarjetas.length > 0 && <Abanico tarjetas={tarjetas.slice(0, 4)} />}
    </div>
  )
}

/**
 * Las tarjetas que se pisan, giradas como un abanico, como en la referencia: cada una tapa la parte derecha de la
 * anterior y deja a la vista su texto, que va a la izquierda.
 */
function Abanico({ tarjetas }: { tarjetas: TarjetaAbanico[] }) {
  const n = tarjetas.length
  const paso = 108
  return (
    <div aria-hidden className="relative -my-3 hidden h-48 flex-none md:block" style={{ width: `${176 + (n - 1) * paso}px` }}>
      {tarjetas.map((t, i) => {
        const Icono = t.icono
        const giro = -9 + (n === 1 ? 9 : (18 / (n - 1)) * i)
        return (
          <div
            key={t.id}
            className={cn("absolute top-3 flex h-42 w-44 flex-col justify-between overflow-hidden rounded-2xl p-3.5 shadow-pop", t.imagenUrl ? "bg-muted text-white" : COLOR_TARJETA[t.color ?? "oscura"])}
            style={{ left: `${i * paso}px`, transform: `rotate(${giro}deg) translateY(${Math.abs(giro) * 0.5}px)`, zIndex: i + 1 }}
          >
            {t.imagenUrl && (
              <>
                <Image src={t.imagenUrl} alt="" fill sizes="176px" unoptimized className="object-cover" />
                <span className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
              </>
            )}
            {Icono ? <Icono className="relative size-6 opacity-90" /> : <span />}
            <span className="relative min-w-0" style={{ maxWidth: i < n - 1 ? `${paso - 20}px` : undefined }}>
              <span className="block text-[15px] leading-tight font-semibold">{t.titulo}</span>
              {t.detalle && <span className="mt-0.5 block truncate text-xs opacity-75">{t.detalle}</span>}
            </span>
          </div>
        )
      })}
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
