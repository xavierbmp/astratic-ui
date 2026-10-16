"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowDownRightIcon, ArrowUpRightIcon, MapPinIcon } from "lucide-react"
import { Slot } from "radix-ui"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { SocialIcon, socialLabel, type SocialNetwork } from "@/components/app/social-icons"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { tintSoftClass, tintTextClass, type Tint } from "@/lib/influencer/tints"

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

/** El leve color de cada red en su ficha (Xavier, 2026-10-16): Instagram morado, YouTube rojo suave, TikTok y LinkedIn azul. */
const TINTE_RED: Record<SocialNetwork, Tint> = { instagram: "lavender", youtube: "rose", tiktok: "sky", linkedin: "sky" }

/** La red con más seguidores: la que se enseña al abrir. */
function principal(accounts: ProfileAccount[]) {
  return [...accounts].sort((a, b) => b.followers - a.followers)[0]?.network
}

/**
 * Tarjeta del perfil: foto (sus iniciales si aún no tiene), nombre, @, nicho y tramo; arriba a la derecha sus enlaces
 * (`links`, una `LinkRow`) y, debajo, las views medias y la interacción de la red elegida. Al pie, una ficha por red con sus
 * seguidores (con su tendencia si la red la da; al pulsarla, las cifras de arriba pasan a ser las suyas) y las acciones
 * (`actions`, el media kit como `ProfileTile`), que crecen hasta llenar la tarjeta. Sin ninguna red, `empty` ocupa su sitio
 * (lo que hay que hacer para empezar: conectar sus cuentas).
 * Con `href`, la foto y el nombre llevan al perfil completo. Por debajo de 448 px de tarjeta, los enlaces bajan bajo el nombre.
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
  className?: string
}) {
  const [red, setRed] = React.useState(() => principal(accounts))
  const elegida = accounts.find((a) => a.network === red) ?? accounts[0]

  const foto = photoUrl ? (
    <span className="relative block size-20 flex-none overflow-hidden rounded-2xl bg-muted">
      <Image src={photoUrl} alt={name} fill sizes="80px" className="object-cover" />
    </span>
  ) : (
    <AvatarInitials name={name} size="xl" className="grid size-20 flex-none text-2xl" />
  )

  return (
    <section data-slot="ws-profile" className={cn("@container flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-card", className)}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-3 @md:grid-cols-[auto_minmax(0,1fr)_auto]">
        {href ? (
          <Link href={href} aria-label={`Ver el perfil de ${name}`} className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
            {foto}
          </Link>
        ) : (
          foto
        )}
        <div className="min-w-0 self-center">
          {href ? (
            <Link href={href} className="block truncate text-lg leading-tight font-semibold tracking-tight hover:underline">
              {name}
            </Link>
          ) : (
            <p className="truncate text-lg leading-tight font-semibold tracking-tight">{name}</p>
          )}
          <p className="truncate text-sm text-muted-foreground">{handle}</p>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">{niche}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground">{tier}</span>
            {city && (
              <span className="inline-flex items-center gap-1">
                <MapPinIcon className="size-3" aria-hidden />
                {city}
              </span>
            )}
          </p>
        </div>

        <div className="col-span-2 flex flex-col items-start gap-2.5 @md:col-span-1 @md:items-end">
          {links}
          {elegida && (
            <dl className="flex gap-2" aria-label={`Cifras de ${socialLabel[elegida.network]}`}>
              <Cifra label="Views medias" value={fmt.compact(elegida.avgViews)} network={elegida.network} />
              {elegida.engagement !== undefined && elegida.engagement > 0 && <Cifra label="Interacción" value={fmt.pct(elegida.engagement)} network={elegida.network} />}
            </dl>
          )}
        </div>
      </div>

      {/* Las fichas crecen hasta el pie: la tarjeta queda llena aunque la fila sea más alta que su contenido. */}
      <div className="flex min-h-0 flex-1 flex-wrap items-stretch gap-2">
        {accounts.length === 0 && empty && <div className="grid min-w-0 flex-[999_1_20rem] grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-2">{empty}</div>}
        {accounts.length > 0 && (
          <div role="group" aria-label="Redes" className="grid min-w-0 flex-[999_1_20rem] grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-2">
            {accounts.map((a) => (
              <ProfileTile
                key={a.network}
                icon={<SocialIcon network={a.network} className="size-4" />}
                label={socialLabel[a.network]}
                value={fmt.compact(a.followers)}
                detail={a.network === "youtube" ? "suscriptores" : "seguidores"}
                trend={a.trend}
                engagement={a.network === "youtube" ? undefined : a.engagement}
                tint={TINTE_RED[a.network]}
                aria-pressed={a.network === elegida?.network}
                onClick={() => setRed(a.network)}
                className={cn(a.network === elegida?.network && "ring-2 ring-current/25")}
              />
            ))}
          </div>
        )}
        {actions && <div className="flex flex-auto items-stretch gap-2 [&>*]:flex-1">{actions}</div>}
      </div>
    </section>
  )
}

function Cifra({ label, value, network }: { label: string; value: string; network: SocialNetwork }) {
  return (
    <div className="rounded-xl bg-background/70 px-3 py-1.5">
      <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <SocialIcon network={network} className="size-3" />
        {label}
      </dt>
      <dd className="text-sm font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

/**
 * Una ficha del pie de la tarjeta del perfil: arriba su icono y su nombre, abajo la cifra (o lo que hace).
 * Las redes son fichas; una acción como el media kit, también, con `asChild` sobre su enlace.
 * Con `tint` (las redes, Xavier 2026-10-16, a partir de una referencia): un leve color de la red, la cifra grande con su
 * gráfico al lado (la evolución de sus seguidores, solo donde la red la da) y, abajo y en pequeño, el cambio en % o, sin él, la
 * interacción (Xavier, 2026-10-16: nada de anillos que no dicen nada; un gráfico solo cuando tiene sentido).
 */
export function ProfileTile({
  icon,
  label,
  value,
  detail,
  trend,
  engagement,
  tint,
  asChild = false,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  icon: React.ReactNode
  label: string
  value?: string
  detail?: string
  trend?: Tendencia
  /** Interacción en %: con `tint` y sin cambio de seguidores, va al pie. */
  engagement?: number
  tint?: Tint
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "button"
  const grafico =
    trend && trend.serie.length > 1 ? (
      <MiniTendencia serie={trend.serie} className={tint ? tintTextClass[tint] : (trend.cambio ?? 0) >= 0 ? "text-success" : "text-danger"} grande={!!tint} />
    ) : null
  return (
    <Comp
      data-slot="ws-profile-tile"
      {...(asChild ? {} : { type: "button" as const })}
      className={cn(
        "flex min-h-24 min-w-0 flex-col justify-between gap-3 rounded-xl p-3 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
        tint ? cn(tintSoftClass[tint], tintTextClass[tint]) : "bg-background/70 hover:bg-muted",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className={cn("grid flex-none place-items-center [&_svg]:size-4", tint ? "size-5" : "size-8 rounded-lg bg-card shadow-xs")}>{icon}</span>
        <span className={cn("truncate font-medium", tint ? "text-sm text-foreground" : "text-xs text-muted-foreground")}>{label}</span>
        {!tint && trend?.cambio !== undefined && <Cambio valor={trend.cambio} />}
      </span>
      <span className="flex min-w-0 items-end justify-between gap-2">
        <span className="min-w-0 text-foreground">
          {value && <span className={cn("block leading-tight font-semibold tracking-tight tabular-nums", tint ? "text-2xl" : "text-xl")}>{value}</span>}
          {detail && <span className={cn("block truncate", value ? "text-[11px] text-muted-foreground" : "text-sm font-medium")}>{detail}</span>}
        </span>
        {grafico}
      </span>
      {tint && trend?.cambio !== undefined ? (
        <CambioPie valor={trend.cambio} />
      ) : (
        tint &&
        engagement !== undefined &&
        engagement > 0 && <span className="-mt-1.5 text-[11px] text-muted-foreground">{pct(engagement)} de interacción</span>
      )}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  )
}

const pct = (valor: number) => `${Math.abs(valor).toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`

/** «+3,2 %» en verde o «−1,1 %» en rojo, junto al nombre de la red. */
function Cambio({ valor }: { valor: number }) {
  const sube = valor >= 0
  return (
    <span
      title="Cambio de seguidores en el periodo de la gráfica"
      className={cn("ml-auto flex-none rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums", sube ? "bg-success-soft text-success" : "bg-danger-soft text-danger")}
    >
      {sube ? "+" : "−"}
      {pct(valor)}
    </span>
  )
}

/** El cambio de seguidores al pie de la ficha de una red, pequeño: la flecha y el % en verde o rojo. */
function CambioPie({ valor }: { valor: number }) {
  const sube = valor >= 0
  const Flecha = sube ? ArrowUpRightIcon : ArrowDownRightIcon
  return (
    <span title="Cambio de seguidores en el periodo de la gráfica" className="-mt-1.5 flex items-center gap-1 text-[11px] text-muted-foreground">
      <span className={cn("inline-flex items-center font-semibold tabular-nums", sube ? "text-success" : "text-danger")}>
        <Flecha className="size-3" aria-hidden />
        {sube ? "+" : "−"}
        {pct(valor)}
      </span>
      en seguidores
    </span>
  )
}

/** La serie en una línea pequeña con su área, sin ejes: solo la forma de cómo va. Con `grande`, la de la ficha de una red. */
function MiniTendencia({ serie, className, grande = false }: { serie: number[]; className?: string; grande?: boolean }) {
  const ancho = grande ? 96 : 64
  const alto = grande ? 40 : 26
  const min = Math.min(...serie)
  const rango = Math.max(...serie) - min || 1
  const puntos = serie.map((v, i) => [(i / (serie.length - 1)) * ancho, alto - 2 - ((v - min) / rango) * (alto - 4)] as const)
  const linea = puntos.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")
  return (
    <svg viewBox={`0 0 ${ancho} ${alto}`} className={cn("w-16 flex-none overflow-visible", grande ? "h-10 w-24" : "h-[26px]", className)} aria-hidden>
      <path d={`${linea} L${ancho} ${alto} L0 ${alto} Z`} className="fill-current opacity-10" />
      <path d={linea} className="fill-none stroke-current" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
