import { cn } from "cn"

export function PageHeader({
  title,
  description,
  tabs,
  stats,
  actions,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  /**
   * Pestañas de subpágina (`PageTabs`) o de las partes de un registro (`TabsList variant="line"`). Van debajo del
   * título, a todo el ancho; la descripción ocupa siempre una línea para que caigan en el mismo sitio en cada subpágina.
   */
  tabs?: React.ReactNode
  /** Cifras clave discretas a la derecha del título, antes de las acciones (las del workspace de influencers, `CifrasCabecera`). */
  stats?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div data-slot="page-header" className={cn("flex flex-col gap-2", className)} {...props}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        {/* Cede el ancho a las acciones (la descripción se corta) para que no salten de línea y empujen las pestañas. */}
        <div className="min-w-48 flex-1 basis-0">
          <h1 className="text-[27px] leading-tight font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 truncate text-sm text-muted-foreground">{description}</p>}
        </div>
        {stats && <div className="flex min-w-0 flex-none items-end">{stats}</div>}
        {actions && <div className="flex flex-none flex-wrap items-center gap-2.5 whitespace-nowrap">{actions}</div>}
      </div>
      {tabs}
    </div>
  )
}

export function PageBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-body"
      className={cn("flex min-h-0 flex-1 flex-col gap-4 px-[34px] pt-[26px] pb-10", className)}
      {...props}
    />
  )
}
