import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"

/** El aviso que más importa, en una tarjeta de color del acento con su acción. */
export function NoticeHighlight({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      data-slot="ws-notice-highlight"
      className={cn("flex flex-col gap-3 rounded-2xl bg-brand p-4 text-brand-foreground", className)}
    >
      <div>
        {eyebrow && <p className="text-[11px] font-medium tracking-wide uppercase opacity-80">{eyebrow}</p>}
        <p className="mt-0.5 text-base leading-snug font-semibold">{title}</p>
        {description && <p className="mt-1 text-sm opacity-90">{description}</p>}
      </div>
      {action}
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
