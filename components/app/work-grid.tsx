import { cn } from "cn"

/**
 * Rejilla de la página de operación. La toolbar va encima del bloque y con su mismo ancho; el panel de
 * información, a la derecha, empieza a la altura del bloque y mide lo mismo que él.
 */
export function WorkGrid({
  toolbar,
  aside,
  asideWidth = 320,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** Toolbar del bloque de operación y, debajo, los chips de filtros activos. */
  toolbar?: React.ReactNode
  aside?: React.ReactNode
  asideWidth?: number
}) {
  const row = toolbar ? "xl:row-start-2" : "xl:row-start-1"
  return (
    <div
      data-slot="work-grid"
      style={{ "--aside-w": `${asideWidth}px` } as React.CSSProperties}
      className={cn(
        "grid min-h-0 flex-1 grid-cols-1 gap-4",
        aside && "xl:grid-cols-[minmax(0,1fr)_var(--aside-w)]",
        toolbar ? "xl:grid-rows-[auto_minmax(0,1fr)]" : "xl:grid-rows-[minmax(0,1fr)]",
        className
      )}
      {...props}
    >
      {toolbar && (
        <div data-slot="work-grid-toolbar" className="flex min-w-0 flex-col gap-2 xl:col-start-1 xl:row-start-1">
          {toolbar}
        </div>
      )}
      <div className={cn("flex min-h-0 min-w-0 flex-col xl:col-start-1", row)}>{children}</div>
      {aside && (
        <div className={cn("relative min-h-80 min-w-0 xl:col-start-2 xl:min-h-0", row)}>
          <div className="flex min-h-0 flex-col xl:absolute xl:inset-0">{aside}</div>
        </div>
      )}
    </div>
  )
}
