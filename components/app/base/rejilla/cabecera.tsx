"use client"

import * as React from "react"
import { ChevronDownIcon, InfoIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"
import { Checkbox } from "@/components/ui/checkbox"
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ANCHO_MAXIMO, ANCHO_MINIMO } from "@/lib/base/vistas"
import { ICONO_TIPO, IconoCampo } from "@/components/app/base/apariencia"
import { ItemsCampo, type AccionesCampo } from "@/components/app/base/rejilla/menu-campo"
import { ANCHO_ANADIR, ANCHO_IZQUIERDA, type Columna } from "@/components/app/base/rejilla/medidas"

/** Lo que se arrastra en la cabecera: el borde de una columna o la columna entera. */
type Arrastre = { tipo: "ancho"; id: string; x0: number; ancho0: number } | { tipo: "mover"; id: string; x0: number; activo: boolean; destino: number }

/** Por debajo de esto, un arrastre es un clic. */
const UMBRAL = 5

/**
 * La fila de cabeceras, como en Airtable: la casilla de todas las filas, cada campo con su icono y
 * su flecha de menú (también con clic derecho), el borde que se arrastra para cambiar el ancho, la
 * columna entera que se arrastra para cambiarla de sitio, el doble clic que abre sus ajustes y el «+»
 * para crear un campo, que se queda a la vista aunque falten columnas por la derecha. La línea de
 * las columnas fijas se arrastra desde la rejilla (`AsaFijas`).
 */
export function Cabecera<T>({
  columnas,
  alto,
  ajustar,
  congelar,
  marcadas,
  onMarcarTodas,
  columnasElegidas,
  onElegirColumna,
  acciones,
  onAncho,
  onMover,
  onAnadirCampo,
  onEditarCampo,
  anadirFijo,
}: {
  columnas: Columna<T>[]
  alto: number
  ajustar: boolean
  congelar: number
  marcadas: boolean | "indeterminate"
  onMarcarTodas: (marcar: boolean) => void
  columnasElegidas: Set<number>
  onElegirColumna: (i: number, extender: boolean) => void
  acciones: (c: Columna<T>) => AccionesCampo
  onAncho: (id: string, ancho: number, final: boolean) => void
  onMover: (id: string, destino: number) => void
  onAnadirCampo?: (ancla: HTMLElement) => void
  onEditarCampo?: (id: string, ancla: HTMLElement) => void
  /** Quedan columnas fuera a la derecha: el «+» se pega al borde, con lo de debajo difuminado. */
  anadirFijo?: boolean
}) {
  const [arrastre, setArrastre] = React.useState<Arrastre | null>(null)
  /** El clic que llega al soltar un arrastre (ancho o mover) no elige la columna. */
  const ignorarClic = React.useRef(false)

  // El índice del hueco más cercano a una x de la rejilla (0 = antes de la primera columna).
  const huecoMasCercano = React.useCallback(
    (x: number, desde: number) => {
      let mejor = desde
      let distancia = Infinity
      for (let i = desde; i <= columnas.length; i += 1) {
        const borde = bordeDe(columnas, i)
        if (Math.abs(borde - x) < distancia) {
          distancia = Math.abs(borde - x)
          mejor = i
        }
      }
      return mejor
    },
    [columnas],
  )

  React.useEffect(() => {
    if (!arrastre) return
    const mover = (e: PointerEvent) => {
      const dx = e.clientX - arrastre.x0
      if (arrastre.tipo === "ancho") {
        onAncho(arrastre.id, Math.max(ANCHO_MINIMO, Math.min(ANCHO_MAXIMO, arrastre.ancho0 + dx)), false)
        return
      }
      const col = columnas.find((c) => c.campo.id === arrastre.id)
      // El centro de la columna manda: cae en el hueco más cercano, nunca antes de la principal.
      const destino = huecoMasCercano((col?.x ?? 0) + (col?.ancho ?? 0) / 2 + dx, 1)
      setArrastre({ ...arrastre, activo: arrastre.activo || Math.abs(dx) > UMBRAL, destino })
    }
    const soltar = (e: PointerEvent) => {
      ignorarClic.current = arrastre.tipo === "ancho" || arrastre.activo
      if (arrastre.tipo === "ancho") {
        onAncho(arrastre.id, Math.max(ANCHO_MINIMO, Math.min(ANCHO_MAXIMO, arrastre.ancho0 + e.clientX - arrastre.x0)), true)
      } else if (arrastre.activo) {
        onMover(arrastre.id, arrastre.destino)
      }
      setArrastre(null)
    }
    window.addEventListener("pointermove", mover)
    window.addEventListener("pointerup", soltar, { once: true })
    return () => {
      window.removeEventListener("pointermove", mover)
      window.removeEventListener("pointerup", soltar)
    }
  }, [arrastre, columnas, huecoMasCercano, onAncho, onMover])

  const marca = arrastre?.tipo === "mover" && arrastre.activo ? bordeDe(columnas, arrastre.destino) : null

  return (
    <div className="sticky top-0 z-20 flex border-b bg-card text-[13px]" style={{ height: alto }}>
      <div className="sticky left-0 z-10 flex flex-none items-center border-r bg-card pl-2" style={{ width: ANCHO_IZQUIERDA }}>
        <Checkbox checked={marcadas} onCheckedChange={(c) => onMarcarTodas(c === true)} aria-label="Marcar todas las filas" />
      </div>
      {columnas.map((c, i) => {
        const Icono = ICONO_TIPO[c.campo.tipo]
        const a = acciones(c)
        const elegida = columnasElegidas.has(i)
        const ultimaFija = c.fija && i === Math.min(congelar, columnas.length) - 1
        return (
          <ContextMenu key={c.campo.id}>
            <ContextMenuTrigger asChild>
              <div
                data-campo={c.campo.id}
                className={cn(
                  "group/cabecera relative flex flex-none cursor-default items-center gap-1.5 border-r bg-card px-2 select-none hover:bg-muted/60",
                  c.fija && "sticky z-10",
                  ultimaFija && "border-r-2 border-r-control",
                  elegida && "bg-brand-soft hover:bg-brand-soft",
                  arrastre?.tipo === "mover" && arrastre.activo && arrastre.id === c.campo.id && "opacity-40",
                )}
                style={{ width: c.ancho, left: c.fija ? c.x : undefined }}
                onPointerDown={(e) => {
                  if (e.button !== 0 || (e.target as HTMLElement).closest("[data-no-arrastre]")) return
                  if (c.campo.principal) return onElegirColumna(i, e.shiftKey)
                  setArrastre({ tipo: "mover", id: c.campo.id, x0: e.clientX, activo: false, destino: i })
                }}
                onClick={(e) => {
                  if (ignorarClic.current) {
                    ignorarClic.current = false
                    return
                  }
                  if ((e.target as HTMLElement).closest("[data-no-arrastre]")) return
                  if (!c.campo.principal) onElegirColumna(i, e.shiftKey)
                }}
                onDoubleClick={(e) => {
                  if (!(e.target as HTMLElement).closest("[data-no-arrastre]")) onEditarCampo?.(c.campo.id, e.currentTarget)
                }}
              >
                <IconoCampo icono={Icono} />
                <span className={cn("min-w-0 flex-1", ajustar ? "line-clamp-2 leading-tight break-words" : "truncate")}>{c.campo.nombre}</span>
                {c.campo.descripcion && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon data-no-arrastre className="size-3.5 flex-none text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-64">{c.campo.descripcion}</TooltipContent>
                  </Tooltip>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" data-no-arrastre aria-label={`Opciones de ${c.campo.nombre}`} className="flex size-5 flex-none items-center justify-center rounded-sm text-muted-foreground opacity-0 group-hover/cabecera:opacity-100 hover:bg-muted aria-expanded:opacity-100">
                      <ChevronDownIcon className="size-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <ItemsCampo acciones={a} />
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* El borde que se arrastra para cambiar el ancho; doble clic lo ajusta al de serie. */}
                <span
                  data-no-arrastre
                  role="separator"
                  aria-orientation="vertical"
                  aria-label={`Ancho de ${c.campo.nombre}`}
                  className="absolute top-0 -right-1 z-10 h-full w-2 cursor-col-resize after:absolute after:inset-y-1 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:rounded-full hover:after:bg-brand"
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    setArrastre({ tipo: "ancho", id: c.campo.id, x0: e.clientX, ancho0: c.ancho })
                  }}
                />
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-60">
              <ItemsCampo acciones={a} contexto />
            </ContextMenuContent>
          </ContextMenu>
        )
      })}
      <div
        className={cn(
          "flex flex-none items-center justify-center border-r bg-card",
          anadirFijo &&
            onAnadirCampo &&
            "sticky right-0 z-10 border-l before:pointer-events-none before:absolute before:inset-y-0 before:right-full before:w-12 before:bg-linear-to-l before:from-card before:to-transparent",
        )}
        style={{ width: ANCHO_ANADIR }}
      >
        {onAnadirCampo && (
          <button type="button" aria-label="Añadir un campo" title="Añadir un campo" className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" onClick={(e) => onAnadirCampo(e.currentTarget)}>
            <PlusIcon className="size-4" />
          </button>
        )}
      </div>
      {marca !== null && <span className="pointer-events-none absolute top-0 z-40 h-[100dvh] w-0.5 bg-brand" style={{ left: marca - 1 }} />}
    </div>
  )
}

/** La x del hueco `i` (0 = antes de la primera columna, `length` = después de la última). */
export function bordeDe<T>(columnas: Columna<T>[], i: number): number {
  if (i < columnas.length) return columnas[i].x
  const ultima = columnas[columnas.length - 1]
  return ultima ? ultima.x + ultima.ancho : ANCHO_IZQUIERDA
}
