import Image from "next/image"
import { ArrowUpRightIcon, MapPinIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { SocialIcon, socialLabel, type SocialNetwork } from "@/components/app/social-icons"

export type ProfileAccount = {
  network: SocialNetwork
  handle: string
  url: string
  followers: number
  avgViews: number
}

/**
 * Mini panel del perfil: foto grande, nombre, nicho y tramo, y una fila por red con sus seguidores,
 * sus visualizaciones medias y el enlace a su perfil. Las acciones (media kit, ver perfil) van en `actions`.
 */
export function ProfilePanel({
  name,
  handle,
  photoUrl,
  niche,
  tier,
  city,
  accounts,
  actions,
  className,
}: {
  name: string
  handle: string
  photoUrl: string
  niche: string
  tier: string
  city?: string
  accounts: ProfileAccount[]
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <section data-slot="ws-profile" className={cn("flex flex-col rounded-2xl bg-card p-5 shadow-card", className)}>
      <div className="flex items-center gap-4">
        <span className="relative size-20 flex-none overflow-hidden rounded-2xl bg-muted">
          <Image src={photoUrl} alt={name} fill sizes="80px" className="object-cover" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg leading-tight font-semibold tracking-tight">{name}</p>
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
      </div>

      <ul className="mt-4 flex flex-col gap-1.5">
        {accounts.map((a) => (
          <li key={a.network}>
            <a
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-3 rounded-xl bg-background/70 px-3 py-2.5 transition-colors hover:bg-muted"
            >
              <span className="grid size-8 flex-none place-items-center rounded-lg bg-card shadow-xs">
                <SocialIcon network={a.network} className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{socialLabel[a.network]}</span>
                <span className="block truncate text-xs text-muted-foreground">{a.handle}</span>
              </span>
              <span className="flex flex-none gap-4 text-right">
                <span>
                  <span className="block text-sm font-semibold tabular-nums">{fmt.compact(a.followers)}</span>
                  <span className="block text-[11px] text-muted-foreground">seguidores</span>
                </span>
                <span>
                  <span className="block text-sm font-semibold tabular-nums">{fmt.compact(a.avgViews)}</span>
                  <span className="block text-[11px] text-muted-foreground">views</span>
                </span>
              </span>
              <ArrowUpRightIcon
                className="size-4 flex-none text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </a>
          </li>
        ))}
      </ul>

      {actions && <div className="mt-4 flex gap-2 [&>*]:flex-1">{actions}</div>}
    </section>
  )
}
