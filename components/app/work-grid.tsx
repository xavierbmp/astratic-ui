import { cn } from "cn"

/**
 * Rejilla de la página de operación: a la izquierda las cifras, la toolbar y el bloque; a la
 * derecha, el panel de información.
 *
 * Con `stats`, las cifras entran en la columna izquierda y el panel arranca a su misma altura y
 * baja hasta el pie del bloque: el panel habla de toda la página, igual que las cifras, así que
 * empiezan juntos. Sin `stats`, la fila de cifras va arriba a ancho completo y el panel empieza a
 * la altura del bloque. En las dos, por debajo de 1280 px todo se apila y el panel va el último.
 */
export function WorkGrid({
  stats,
  toolbar,
  aside,
  asideWidth = 320,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  /** Fila de cifras (`KpiRow`). Si se pasa, comparte columna con el bloque. */
  stats?: React.ReactNode
  /** Toolbar del bloque de operación y, debajo, los chips de filtros activos. */
  toolbar?: React.ReactNode
  aside?: React.ReactNode
  asideWidth?: number
}) {
  const filas = [stats && "auto", toolbar && "auto", "minmax(0,1fr)"].filter(Boolean)
  const filaBloque = filas.length
  const rowStart = ["", "xl:row-start-1", "xl:row-start-2", "xl:row-start-3"]
  const rowSpan = ["", "xl:row-span-1", "xl:row-span-2", "xl:row-span-3"]
  return (
    <div
      data-slot="work-grid"
      style={{ "--aside-w": `${asideWidth}px`, "--work-rows": filas.join(" ") } as React.CSSProperties}
      className={cn(
        "grid min-h-0 flex-1 grid-cols-1 gap-4",
        aside && "xl:grid-cols-[minmax(0,1fr)_var(--aside-w)]",
        "xl:grid-rows-(--work-rows)",
        className
      )}
      {...props}
    >
      {stats && (
        <div data-slot="work-grid-stats" className="min-w-0 xl:col-start-1 xl:row-start-1">
          {stats}
        </div>
      )}
      {toolbar && (
        <div
          data-slot="work-grid-toolbar"
          className={cn("flex min-w-0 flex-col gap-2 xl:col-start-1", stats ? "xl:row-start-2" : "xl:row-start-1")}
        >
          {toolbar}
        </div>
      )}
      <div className={cn("flex min-h-0 min-w-0 flex-col xl:col-start-1", rowStart[filaBloque])}>{children}</div>
      {aside && (
        // Con cifras dentro, el panel las acompaña desde arriba; sin ellas, sigue empezando a la
        // altura del bloque, que es como se comportan las páginas que no pasan `stats`.
        <div
          className={cn(
            "relative min-h-80 min-w-0 xl:col-start-2 xl:min-h-0",
            stats ? cn("xl:row-start-1", rowSpan[filaBloque]) : rowStart[filaBloque],
          )}
        >
          <div className="flex min-h-0 flex-col xl:absolute xl:inset-0">{aside}</div>
        </div>
      )}
    </div>
  )
}
