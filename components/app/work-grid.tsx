"use client"

import { usePathname } from "next/navigation"
import { cn } from "cn"
import { DetailPanelHost, type PanelFicha } from "@/components/app/detail-panel"
import { ResizeHandle, useAnchoGuardado } from "@/components/app/resize-handle"

// El bloque de trabajo nunca se queda más estrecho que esto al ensanchar el panel.
const ANCHO_MINIMO_BLOQUE = 520

/**
 * Rejilla de la página de operación: a la izquierda las cifras, la toolbar y el bloque; a la
 * derecha, el panel de información.
 *
 * Con `stats`, las cifras entran en la columna izquierda y el panel arranca a su misma altura y
 * baja hasta el pie del bloque: el panel habla de toda la página, igual que las cifras, así que
 * empiezan juntos. Sin `stats`, la fila de cifras va arriba a ancho completo y el panel empieza a
 * la altura del bloque. En las dos, por debajo de 1280 px todo se apila y el panel va el último.
 *
 * El panel se ensancha o estrecha arrastrando su borde izquierdo (de 280 a 560 px, doble clic vuelve
 * al de siempre) y cada persona lo encuentra como lo dejó en cada página.
 *
 * Con `ficha` activa (ver `usePanelFicha`), la columna derecha deja de ser el panel de información
 * y pasa a ser la ficha del registro abierto, con el ancho que haya elegido la persona.
 */
export function WorkGrid({
  stats,
  toolbar,
  aside,
  asideWidth = 320,
  ficha,
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
}) {
  const conFicha = ficha?.activa === true
  const limites = { min: 280, porDefecto: asideWidth, max: 560 }
  const panel = useAnchoGuardado(`panel:${usePathname()}`, limites)
  const lateral = conFicha ? <DetailPanelHost ficha={ficha} /> : aside
  const filas = [stats && "auto", toolbar && "auto", "minmax(0,1fr)"].filter(Boolean)
  const filaBloque = filas.length
  const rowStart = ["", "xl:row-start-1", "xl:row-start-2", "xl:row-start-3"]
  const rowSpan = ["", "xl:row-span-1", "xl:row-span-2", "xl:row-span-3"]
  return (
    <div
      data-slot="work-grid"
      style={{ "--aside-w": `${conFicha ? ficha.ancho : panel.ancho}px`, "--work-rows": filas.join(" ") } as React.CSSProperties}
      className={cn(
        "grid min-h-0 flex-1 grid-cols-1 gap-4",
        lateral && "xl:grid-cols-[minmax(0,1fr)_var(--aside-w)]",
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
      {lateral && (
        // Con cifras dentro, el panel las acompaña desde arriba; sin ellas, sigue empezando a la
        // altura del bloque, que es como se comportan las páginas que no pasan `stats`.
        <div
          className={cn(
            "relative min-h-80 min-w-0 xl:col-start-2 xl:min-h-0",
            stats ? cn("xl:row-start-1", rowSpan[filaBloque]) : rowStart[filaBloque],
          )}
        >
          <div className="flex min-h-0 flex-col xl:absolute xl:inset-0">{lateral}</div>
          {/* La ficha en el panel lleva su propio borde; el panel de información, este. */}
          {!conFicha && (
            <ResizeHandle
              ancho={panel.ancho}
              onAncho={panel.setAncho}
              limites={limites}
              maximo={(rejilla) => rejilla.clientWidth - ANCHO_MINIMO_BLOQUE}
              lado="izquierda"
              destino={(borde) => borde.closest<HTMLElement>("[data-slot=work-grid]")}
              variable="--aside-w"
              label="Ancho del panel"
              className="hidden xl:block"
            />
          )}
        </div>
      )}
    </div>
  )
}
