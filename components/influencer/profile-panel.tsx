"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPinIcon } from "lucide-react"
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
}

/** La red con más seguidores: la que se enseña al abrir. */
function principal(accounts: ProfileAccount[]) {
  return [...accounts].sort((a, b) => b.followers - a.followers)[0]?.network
}

/**
 * Tarjeta del perfil: foto (sus iniciales si aún no tiene), nombre, @, nicho y tramo; arriba a la derecha sus enlaces
 * (`links`, una `LinkRow`) y, debajo, las views medias y la interacción de la red elegida. Al pie, una ficha por red con sus
 * seguidores (al pulsarla, las cifras de arriba pasan a ser las suyas) y las acciones (`actions`, el media kit).
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

      <div className="mt-auto flex flex-wrap items-stretch gap-2">
        {accounts.length > 0 && (
          <div role="group" aria-label="Redes" className="grid min-w-0 flex-[999_1_20rem] grid-cols-[repeat(auto-fit,minmax(7.5rem,1fr))] gap-2">
            {accounts.map((a) => {
              const activa = a.network === elegida?.network
              return (
                <button
                  key={a.network}
                  type="button"
                  aria-pressed={activa}
                  onClick={() => setRed(a.network)}
                  className={cn(
                    "flex min-w-0 items-center gap-2.5 rounded-xl bg-background/70 px-3 py-2.5 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
                    activa && "bg-brand-soft ring-1 ring-brand/40 hover:bg-brand-soft",
                  )}
                >
                  <span className="grid size-8 flex-none place-items-center rounded-lg bg-card shadow-xs">
                    <SocialIcon network={a.network} className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold tabular-nums">{fmt.compact(a.followers)}</span>
                    <span className="block truncate text-[11px] text-muted-foreground">{socialLabel[a.network]}</span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
        {actions && <div className="flex flex-auto items-stretch gap-2 [&>*]:h-auto [&>*]:flex-1">{actions}</div>}
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
