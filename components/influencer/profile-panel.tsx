"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"
import { Slot } from "radix-ui"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { SocialIcon, socialLabel, type SocialNetwork } from "@/components/app/social-icons"
import { AvatarInitials } from "@/components/app/avatar-initials"

export type ProfileAccount = {
  network: SocialNetwork
  handle: string
  url: string
  followers: number
  avgViews: number
  /** Interacción en %, si la hay. */
  engagement?: number
  /** Cómo van sus seguidores, si la red lo da: la serie (de la más antigua a la última) y el cambio en %. */
  trend?: Tendencia
}

export type Tendencia = { serie: number[]; cambio?: number }

/** Los colores de cada red (tokens `net-*` del tema): fondo suave de su ficha, tinta de la línea y la barra, y su logo. */
const ESTILO_RED: Record<SocialNetwork, { fondo: string; tinta: string; barra: string; logo: string }> = {
  instagram: { fondo: "bg-net-instagram-soft", tinta: "text-net-instagram", barra: "bg-net-instagram", logo: "bg-(image:--net-instagram-logo) shadow-[0_4px_10px_-4px_var(--net-instagram)]" },
  tiktok: { fondo: "bg-net-tiktok-soft", tinta: "text-net-tiktok", barra: "bg-net-tiktok", logo: "bg-(image:--net-tiktok-logo) shadow-[0_4px_10px_-4px_var(--net-tiktok)]" },
  youtube: { fondo: "bg-net-youtube-soft", tinta: "text-net-youtube", barra: "bg-net-youtube", logo: "bg-(image:--net-youtube-logo) shadow-[0_4px_10px_-4px_var(--net-youtube)]" },
  linkedin: { fondo: "bg-net-linkedin-soft", tinta: "text-net-linkedin", barra: "bg-net-linkedin", logo: "bg-(image:--net-linkedin-logo) shadow-[0_4px_10px_-4px_var(--net-linkedin)]" },
}

const CODIGO_RED: Record<SocialNetwork, string> = { instagram: "IG", tiktok: "TT", youtube: "YT", linkedin: "IN" }

/**
 * Lo que suma la fila de abajo. YouTube no entra en las sumas ni en las medias: sus normas solo dejan enseñar sus cifras
 * tal cual. La audiencia es la suma de seguidores y su cambio solo sale si lo da cada red sumada; las views, las de la red
 * con más seguidores; la interacción, sobre todos los seguidores (interacciones totales entre seguidores totales).
 */
function resumenDe(accounts: ProfileAccount[]) {
  const sumables = accounts.filter((a) => a.network !== "youtube" && a.followers > 0)
  const total = sumables.reduce((s, a) => s + a.followers, 0)
  if (!total) return null
  const conCambio = sumables.every((a) => a.trend?.cambio !== undefined)
  const antes = sumables.reduce((s, a) => s + a.followers / (1 + (a.trend?.cambio ?? 0) / 100), 0)
  const principal = [...sumables].sort((a, b) => b.followers - a.followers)[0]
  const conInteraccion = sumables.filter((a) => (a.engagement ?? 0) > 0)
  const seguidoresConInteraccion = conInteraccion.reduce((s, a) => s + a.followers, 0)
  return {
    total,
    cambio: conCambio && antes > 0 ? ((total - antes) / antes) * 100 : undefined,
    reparto: sumables.map((a) => ({ network: a.network, seguidores: a.followers, pct: Math.round((a.followers / total) * 100) })),
    vistas: principal.avgViews > 0 ? { valor: principal.avgViews, red: socialLabel[principal.network] } : null,
    interaccion: seguidoresConInteraccion
      ? {
          valor: conInteraccion.reduce((s, a) => s + (a.engagement ?? 0) * a.followers, 0) / seguidoresConInteraccion,
          redes: conInteraccion.map((a) => socialLabel[a.network]).join(" y "),
        }
      : null,
  }
}

/**
 * Tarjeta del perfil del Inicio (Xavier, 2026-10-21, diseño «Tarjeta Perfil»): arriba su foto con el punto verde, el
 * nombre con su @, nicho, tramo y ciudad, y a la derecha sus enlaces (`links`, una `LinkRow`) y las acciones (`actions`:
 * el media kit y editar). Debajo, una ficha por red en su color: logo, @, seguidores con su cambio, interacción y views
 * medias, y la línea de sus seguidores al pie, de borde a borde (solo donde la red la da). Abajo, la audiencia total con
 * su reparto por red, las views medias y la interacción media. Sin ninguna red, `empty` ocupa el sitio de las fichas.
 * Con `href`, la foto, el nombre, cada ficha (`href?red=`) y la fila de abajo llevan al perfil completo.
 */
export function ProfilePanel({
  name,
  handle,
  photoUrl,
  niche,
  tier,
  city,
  accounts,
  href,
  links,
  actions,
  empty,
  online = false,
  className,
}: {
  name: string
  handle: string
  photoUrl?: string | null
  niche: string
  tier: string
  city?: string
  accounts: ProfileAccount[]
  href?: string
  links?: React.ReactNode
  actions?: React.ReactNode
  /** Lo que se enseña en lugar de las redes cuando aún no tiene ninguna. */
  empty?: React.ReactNode
  /** El punto verde de la foto: su perfil está activo. */
  online?: boolean
  className?: string
}) {
  const resumen = resumenDe(accounts)

  const foto = (
    <span className="relative block flex-none">
      {photoUrl ? (
        <span className="relative block size-[68px] overflow-hidden rounded-[22px] bg-muted">
          <Image src={photoUrl} alt={name} fill sizes="68px" className="object-cover" />
        </span>
      ) : (
        <AvatarInitials name={name} size="xl" className="grid size-[68px] rounded-[22px] text-2xl" />
      )}
      {online && <span aria-hidden className="absolute -right-[3px] -bottom-[3px] size-[18px] rounded-full border-[3px] border-card bg-success" />}
    </span>
  )

  return (
    <section data-slot="ws-profile" className={cn("@container flex flex-col gap-[18px] rounded-[28px] bg-card p-[22px] shadow-card", className)}>
      <div className="flex flex-wrap items-center gap-4">
        {href ? (
          <Link href={href} aria-label={`Ver el perfil de ${name}`} className="rounded-[22px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
            {foto}
          </Link>
        ) : (
          foto
        )}
        <div className="flex min-w-48 flex-1 flex-col gap-[7px]">
          <p className="flex min-w-0 flex-wrap items-baseline gap-x-2">
            {href ? (
              <Link href={href} className="text-[21px] leading-tight font-semibold tracking-[-0.025em] hover:underline">
                {name}
              </Link>
            ) : (
              <span className="text-[21px] leading-tight font-semibold tracking-[-0.025em]">{name}</span>
            )}
            <span className="truncate text-[13px] text-muted-foreground">{handle}</span>
          </p>
          <p className="flex flex-wrap items-center gap-1.5 text-xs">
            {niche && <span className="rounded-full bg-muted px-2.5 py-1 font-medium">{niche}</span>}
            {tier && <span className="rounded-full bg-muted px-2.5 py-1 font-medium">{tier}</span>}
            {city && <span className="px-0.5 py-1 text-muted-foreground">{city}</span>}
          </p>
        </div>
        {(links || actions) && (
          <div className="flex flex-none flex-wrap items-center gap-1.5">
            {links}
            {actions}
          </div>
        )}
      </div>

      {accounts.length === 0 && empty && <div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2.5">{empty}</div>}

      {accounts.length > 0 && (
        <div role="list" aria-label="Redes" className="grid grid-cols-1 gap-2.5 @lg:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
          {accounts.map((a) => (
            <FichaRed key={a.network} account={a} href={href ? `${href}?red=${a.network}` : undefined} />
          ))}
        </div>
      )}

      {resumen && (
        <div className="grid grid-cols-1 gap-y-4 rounded-[20px] border py-4 @lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] @lg:pr-4">
          <div className="flex min-w-0 flex-col gap-2 px-[18px]">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-xs text-muted-foreground">Audiencia total</span>
              {resumen.cambio !== undefined && <Cambio valor={resumen.cambio} className="text-[11px]" />}
            </div>
            <span className="text-[26px] leading-none font-semibold tracking-[-0.03em] tabular-nums">{fmt.compact(resumen.total)}</span>
            <span className="flex h-1.5 gap-[3px]" aria-hidden>
              {resumen.reparto.map((r) => (
                <span key={r.network} className={cn("min-w-1 rounded-[3px]", ESTILO_RED[r.network].barra)} style={{ flex: r.seguidores }} />
              ))}
            </span>
            <span className="flex flex-wrap gap-2.5">
              {resumen.reparto.map((r) => (
                <span key={r.network} className="flex items-center gap-[5px] text-[11px] text-muted-foreground" title={socialLabel[r.network]}>
                  <span className={cn("size-1.5 rounded-[2px]", ESTILO_RED[r.network].barra)} />
                  {CODIGO_RED[r.network]} {r.pct} %
                </span>
              ))}
            </span>
          </div>
          {resumen.vistas && <CifraResumen label="Views medias" valor={fmt.compact(resumen.vistas.valor)} detalle={resumen.vistas.red} />}
          {resumen.interaccion && <CifraResumen label="Interacción media" valor={fmt.pct(resumen.interaccion.valor)} detalle={resumen.interaccion.redes} />}
          {href && (
            <Link
              href={href}
              title="Ver todas las estadísticas"
              aria-label="Ver todas las estadísticas"
              className="hidden self-start pl-1 text-muted-foreground transition-colors hover:text-foreground @lg:block"
            >
              <ArrowUpRightIcon className="size-4" />
            </Link>
          )}
        </div>
      )}
    </section>
  )
}

function CifraResumen({ label, valor, detalle }: { label: string; valor: string; detalle: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2 border-t px-[18px] pt-4 @lg:border-t-0 @lg:border-l @lg:pt-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-[26px] leading-none font-semibold tracking-[-0.03em] tabular-nums">{valor}</span>
      <span className="truncate text-[11px] text-muted-foreground">{detalle}</span>
    </div>
  )
}

/** La ficha de una red: su color, el logo en su cuadrado, sus cifras y, al pie, la línea de sus seguidores. */
function FichaRed({ account: a, href }: { account: ProfileAccount; href?: string }) {
  const estilo = ESTILO_RED[a.network]
  const linea = a.trend && a.trend.serie.length > 1 ? a.trend.serie : null
  const interaccion = a.network !== "youtube" && a.engagement !== undefined && a.engagement > 0 ? a.engagement : null
  const clases = cn(
    "relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-[20px] px-3.5 pt-3.5 outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
    estilo.fondo,
    href && "transition-[filter] hover:brightness-[0.985]",
    !linea && "pb-3.5",
  )
  const contenido = (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span className={cn("grid size-[30px] flex-none place-items-center rounded-[10px] text-net-logo-foreground", estilo.logo)}>
            <SocialIcon network={a.network} className="size-4" />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-[13px] font-semibold">{socialLabel[a.network]}</span>
            <span className="truncate text-[11px] text-muted-foreground">{a.handle}</span>
          </span>
        </span>
        {href && <ArrowUpRightIcon className="size-[13px] flex-none text-muted-foreground" aria-hidden />}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-[28px] leading-[1.05] font-semibold tracking-[-0.035em] tabular-nums">{fmt.compact(a.followers)}</span>
        <span className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground">{a.network === "youtube" ? "suscriptores" : "seguidores"}</span>
          {a.trend?.cambio !== undefined && <Cambio valor={a.trend.cambio} className="rounded-full bg-card px-1.5 py-0.5 text-[10px]" />}
        </span>
      </span>
      {(interaccion !== null || a.avgViews > 0) && (
        <span className="flex gap-3 text-[11px] text-muted-foreground">
          {interaccion !== null && (
            <span>
              <span className="font-semibold text-foreground">{fmt.pct(interaccion)}</span> interac.
            </span>
          )}
          {a.avgViews > 0 && (
            <span>
              <span className="font-semibold text-foreground">{fmt.compact(a.avgViews)}</span> views
            </span>
          )}
        </span>
      )}
      {linea && <LineaSeguidores serie={linea} className={estilo.tinta} />}
    </>
  )
  return href ? (
    <Link role="listitem" href={href} aria-label={`Estadísticas de ${socialLabel[a.network]}`} className={clases}>
      {contenido}
    </Link>
  ) : (
    <div role="listitem" className={clases}>
      {contenido}
    </div>
  )
}

/** «+1,8 %» en verde o «−0,4 %» en rojo, con letra monoespaciada. */
function Cambio({ valor, className }: { valor: number; className?: string }) {
  const sube = valor >= 0
  return (
    <span title="Cambio de seguidores en el periodo de la línea" className={cn("font-mono font-medium tabular-nums", sube ? "text-success" : "text-danger", className)}>
      {sube ? "+" : "−"}
      {Math.abs(valor).toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %
    </span>
  )
}

/** La serie de seguidores en una línea con su área degradada, sin ejes, de borde a borde de la ficha. */
function LineaSeguidores({ serie, className }: { serie: number[]; className?: string }) {
  const id = React.useId()
  const ancho = 120
  const alto = 40
  const min = Math.min(...serie)
  const rango = Math.max(...serie) - min || 1
  const linea = serie
    .map((v, i) => `${i ? "L" : "M"}${((i * ancho) / (serie.length - 1)).toFixed(1)} ${(alto - 4 - ((v - min) / rango) * (alto - 14)).toFixed(1)}`)
    .join(" ")
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} preserveAspectRatio="none" className={cn("-mx-3.5 block h-11 w-[calc(100%+1.75rem)] max-w-none", className)} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity={0.22} />
          <stop offset="1" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${linea} L${ancho} ${alto} L0 ${alto} Z`} fill={`url(#${id})`} />
      <path d={linea} fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/**
 * Una ficha pequeña para lo que va en el sitio de las redes cuando aún no tiene ninguna (conectar Instagram, poner sus
 * cifras): su icono y su nombre arriba y, abajo, la cifra o lo que hace. Con `asChild`, sobre su enlace.
 */
export function ProfileTile({
  icon,
  label,
  value,
  detail,
  asChild = false,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  icon: React.ReactNode
  label: string
  value?: string
  detail?: string
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="ws-profile-tile"
      {...(asChild ? {} : { type: "button" as const })}
      className={cn(
        "flex min-h-24 min-w-0 flex-col justify-between gap-3 rounded-[20px] bg-background/70 p-3.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="grid size-8 flex-none place-items-center rounded-lg bg-card shadow-xs [&_svg]:size-4">{icon}</span>
        <span className="truncate text-xs font-medium text-muted-foreground">{label}</span>
      </span>
      <span className="min-w-0 text-foreground">
        {value && <span className="block text-xl leading-tight font-semibold tracking-tight tabular-nums">{value}</span>}
        {detail && <span className={cn("block truncate", value ? "text-[11px] text-muted-foreground" : "text-sm font-medium")}>{detail}</span>}
      </span>
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  )
}
