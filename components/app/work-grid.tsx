"use client"

import { usePathname } from "next/navigation"
import { cn } from "cn"
import { DetailPanelHost, type PanelFicha } from "@/components/app/detail-panel"
import { ResizeHandle, useAnchoGuardado } from "@/components/app/resize-handle"
import { useBloqueDeTrabajo } from "@/components/app/pantalla-completa"

// El bloque de trabajo nunca se queda más estrecho que esto al ensanchar el panel.
const ANCHO_MINIMO_BLOQUE = 520

/**
 * Rejilla de la página de operación: a la izquierda las cifras, la toolbar y el bloque; a la
 * derecha, el panel de información.
 *
 * El panel ocupa la columna derecha entera: arranca a la altura de lo primero de la izquierda (las
 * cifras, la toolbar o el bloque) y baja hasta el pie del bloque, porque habla de toda la página
 * (con una toolbar suelta empezaba más abajo que en el resto de páginas: reporte cmvb1e5s). Por
 * debajo de 1280 px todo se apila y el panel va el último.
 *
 * El panel se ensancha o estrecha arrastrando su borde izquierdo (de 280 a 560 px, doble clic vuelve
 * al de siempre) y cada persona lo encuentra como lo dejó en cada página.
 *
 * Con `ficha` (ver `usePanelFicha`), el panel se pliega y se despliega: desplegado, la ficha del registro
 * abierto ocupa su sitio (con el ancho que haya elegido la persona) y al cerrarla vuelve la información;
 * plegado, la lista ocupa todo el ancho y la ficha se abre encima.
 *
 * Con `pestanas` (las `SubPaginas` del segundo nivel), van pegadas encima del bloque, a la derecha, como carpetas.
 *
 * Mientras está montado, la página tiene «Pantalla completa» en la cabecera del shell (`pantalla-completa.tsx`).
 */
export function WorkGrid({
  stats,
  toolbar,
  aside,
  asideWidth = 320,
  ficha,
  pestanas,
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
  /** Panel de ficha de la página: si está activo, ocupa la columna derecha en lugar de `aside`. */
  ficha?: PanelFicha
  /** Las pestañas del segundo nivel (`SubPaginas`), al principio del bloque y unidas a él. */
  pestanas?: React.ReactNode
}) {
  // Con un bloque de trabajo, la página puede ponerse en pantalla completa (el botón sale en la cabecera del shell).
  useBloqueDeTrabajo()
  const conFicha = ficha?.activa === true
  // Plegado: en dos columnas no hay panel; en una, sigue debajo del bloque (allí no hay botón para desplegarlo).
  const plegado = ficha !== undefined && !ficha.preferida
  const limites = { min: 280, porDefecto: asideWidth, max: 560 }
  const panel = useAnchoGuardado(`panel:${usePathname()}`, limites)
  const lateral = conFicha ? <DetailPanelHost ficha={ficha} aside={aside} /> : aside
  const filas = [stats && "auto", toolbar && "auto", "minmax(0,1fr)"].filter(Boolean)
  const filaBloque = filas.length
  const rowStart = ["", "xl:row-start-1", "xl:row-start-2", "xl:row-start-3"]
  const rowSpan = ["", "xl:row-span-1", "xl:row-span-2", "xl:row-span-3"]
  return (
    <div
      data-slot="work-grid"
      style={{ "--aside-w": `${panel.ancho}px`, "--ficha-w": `${ficha?.ancho ?? panel.ancho}px`, "--work-rows": filas.join(" ") } as React.CSSProperties}
      className={cn(
        "grid min-h-0 flex-1 grid-cols-1 gap-4",
        lateral && !plegado && "xl:grid-cols-[minmax(0,1fr)_var(--aside-w)]",
        // Con un registro abierto en el panel, la columna toma el ancho de la ficha; al cerrarlo, el de la información.
        conFicha && "xl:has-[[data-slot=detail-panel-content]]:grid-cols-[minmax(0,1fr)_var(--ficha-w)]",
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
      <div className={cn("flex min-h-0 min-w-0 flex-col xl:col-start-1", pestanas && "[&>[data-slot=sub-paginas]+*]:rounded-tr-none [&>[data-slot=sub-paginas]+*>*]:rounded-tr-none", rowStart[filaBloque])}>
        {pestanas}
        {children}
      </div>
      {lateral && (
        <div className={cn("group/lado relative min-h-80 min-w-0 xl:col-start-2 xl:row-start-1 xl:min-h-0", rowSpan[filaBloque], plegado && "xl:hidden")}>
          <div className="flex min-h-0 flex-col xl:absolute xl:inset-0">{lateral}</div>
          {/* El ancho del panel de información; con una ficha abierta se esconde, porque ella lleva el suyo (suele querer más). */}
          <ResizeHandle
              ancho={panel.ancho}
              onAncho={panel.setAncho}
              limites={limites}
              maximo={(rejilla) => rejilla.clientWidth - ANCHO_MINIMO_BLOQUE}
              lado="izquierda"
              destino={(borde) => borde.closest<HTMLElement>("[data-slot=work-grid]")}
              variable="--aside-w"
              label="Ancho del panel"
              className="hidden xl:block xl:group-has-[[data-slot=detail-panel-content]]/lado:hidden"
            />
        </div>
      )}
    </div>
  )
}
