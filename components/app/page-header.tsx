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
  /** Cifras clave discretas a la derecha del título (las del workspace de influencers, `CifrasCabecera`). */
  stats?: React.ReactNode
  /** Los botones de la página: con pestañas o cifras, a la derecha de la fila de las pestañas; si no, junto al título. */
  actions?: React.ReactNode
}) {
  // Con pestañas o cifras, los botones bajan a la fila de las pestañas, a la derecha, y las cifras se quedan
  // arriba (Xavier, 2026-10-21, reporte cmvfjekm). Sin ninguna de las dos, siguen junto al título.
  const abajo = Boolean(actions && (tabs || stats))
  const botones = actions && <div className="flex flex-none flex-wrap items-center gap-2.5 whitespace-nowrap">{actions}</div>
  return (
    // En pantalla completa todo sube a una fila: las pestañas (y sus botones) a la izquierda y las cifras a la derecha,
    // sin el título ni la descripción, que ya dicen las migas (reporte cmvlfay0).
    <div data-slot="page-header" className={cn("flex flex-col gap-2 completa:flex-row completa:items-end completa:gap-6", className)} {...props}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 completa:ml-auto">
        {/* Cede el ancho a las cifras y los botones (la descripción se corta) para que no salten de línea y empujen las pestañas. */}
        <div className="min-w-48 flex-1 basis-0 completa:hidden">
          <h1 className="text-[27px] leading-tight font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-1 truncate text-sm text-muted-foreground">{description}</p>}
        </div>
        {/* En el móvil, a todo el ancho: si no, las cifras empujaban la página de lado. */}
        {stats && <div className="flex min-w-0 flex-none items-end max-sm:w-full">{stats}</div>}
        {!abajo && botones}
      </div>
      {abajo ? (
        <div data-slot="page-header-tabs" className={cn("flex min-h-11 flex-wrap items-center justify-end gap-x-4 gap-y-2 completa:order-first completa:min-w-0 completa:flex-1", tabs && "shadow-[inset_0_-1px_0_var(--border)]")}>
          {tabs && <div className="min-w-0 flex-1">{tabs}</div>}
          {botones}
        </div>
      ) : (
        tabs && <div className="completa:order-first completa:min-w-0 completa:flex-1">{tabs}</div>
      )}
    </div>
  )
}

export function PageBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-body"
      className={cn("flex min-h-0 flex-1 flex-col gap-4 px-[34px] pt-[26px] pb-10 completa:gap-3 completa:pt-3", className)}
      {...props}
    />
  )
}
