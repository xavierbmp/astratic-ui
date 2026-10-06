import Image from "next/image"
import Link from "next/link"
import { CalendarIcon } from "lucide-react"
import { cn } from "cn"
import { fmt, initials } from "@/lib/format"
import { tintClass, type Tint } from "@/lib/influencer/tints"

/** Fila de tarjetas de collab que se desliza en horizontal; en pantallas anchas caben tres o cuatro. */
export function CollabCardRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="ws-collab-row"
      className={cn("-mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      {...props}
    />
  )
}

/**
 * Tarjeta grande de una collab: la imagen de la campaña (o un tinte si no la hay), el logo de la
 * marca, las piezas hechas de las totales y el siguiente hito con su fecha.
 */
export function CollabCard({
  brand,
  campaign,
  deliverables,
  done,
  total,
  nextLabel,
  nextDate,
  tint,
  coverUrl,
  logoUrl,
  href,
  className,
}: {
  brand: string
  campaign: string
  deliverables?: string
  done: number
  total: number
  nextLabel: string
  nextDate: string
  tint: Tint
  coverUrl?: string
  logoUrl?: string
  href: string
  className?: string
}) {
  const withCover = Boolean(coverUrl)
  const segments = Array.from({ length: total }, (_, i) => i < done)
  return (
    <Link
      data-slot="ws-collab-card"
      href={href}
      className={cn(
        "group relative flex h-52 w-72 flex-none snap-start flex-col justify-between overflow-hidden rounded-2xl p-4 outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ring/50",
        withCover ? "text-white" : tintClass[tint],
        className
      )}
    >
      {coverUrl && (
        <>
          <Image
            src={coverUrl}
            alt=""
            fill
            sizes="288px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" aria-hidden />
        </>
      )}
      <div className="relative flex items-start justify-between">
        <span
          className="grid size-10 place-items-center overflow-hidden rounded-xl bg-card text-xs font-semibold text-card-foreground shadow-xs"
          aria-label={brand}
        >
          {logoUrl ? <Image src={logoUrl} alt={brand} width={40} height={40} className="object-cover" /> : initials(brand)}
        </span>
        {deliverables && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              withCover ? "bg-white/20 backdrop-blur-sm" : "bg-card/70 text-card-foreground"
            )}
          >
            {deliverables}
          </span>
        )}
      </div>
      <div className="relative">
        <p className={cn("text-xs", withCover ? "text-white/75" : "opacity-75")}>{brand}</p>
        <p className="truncate text-base leading-tight font-semibold">{campaign}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex flex-1 gap-1" aria-label={`${done} de ${total} piezas hechas`}>
            {segments.map((filled, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  filled ? (withCover ? "bg-white" : "bg-current") : withCover ? "bg-white/30" : "bg-current/20"
                )}
              />
            ))}
          </span>
          <span className="text-xs font-medium tabular-nums">
            {done}/{total}
          </span>
        </div>
        <p className={cn("mt-2 flex items-center gap-1.5 text-xs", withCover ? "text-white/85" : "opacity-85")}>
          <CalendarIcon className="size-3.5" aria-hidden />
          <span className="truncate">{nextLabel}</span>
          <span className="ml-auto flex-none font-medium">{fmt.date(nextDate)}</span>
        </p>
      </div>
    </Link>
  )
}
