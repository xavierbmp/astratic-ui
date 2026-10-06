import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { cn } from "cn"

/** Bloque del workspace: superficie blanca, esquinas redondas y sombra suave en vez de borde. */
export function Block({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="ws-block"
      className={cn("flex min-w-0 flex-col rounded-2xl bg-card p-5 shadow-card", className)}
      {...props}
    />
  )
}

/** Cabecera de bloque: título en negrita, contador y, a la derecha, «Ver todo» o una acción. */
export function BlockHeader({
  title,
  count,
  href,
  hrefLabel = "Ver todo",
  action,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"header">, "title"> & {
  title: React.ReactNode
  count?: number
  href?: string
  hrefLabel?: string
  action?: React.ReactNode
}) {
  return (
    <header
      data-slot="ws-block-header"
      className={cn("mb-4 flex min-h-8 flex-wrap items-center gap-x-2 gap-y-2", className)}
      {...props}
    >
      <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      {count !== undefined && <span className="text-sm text-muted-foreground tabular-nums">{count}</span>}
      {/* Lo que va dentro (pestañas, filtros) sigue al título; en móvil baja a una línea propia bajo la cabecera. */}
      {children && <div className="order-last flex basis-full items-center sm:order-none sm:basis-auto">{children}</div>}
      <div className="ml-auto flex items-center gap-1.5">
        {action}
        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-1 text-sm font-medium text-brand hover:underline"
          >
            {hrefLabel}
            <ArrowRightIcon className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </header>
  )
}
