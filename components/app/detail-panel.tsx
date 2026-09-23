"use client"

import * as React from "react"
import { PanelRightIcon, SlidersHorizontalIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLocalStorage } from "@/hooks/use-local-storage"

/**
 * Ficha en el panel: una página de operación puede enseñar el registro abierto en la columna de la
 * derecha, en lugar del panel de información. Al pulsar una fila, la ficha se pone ahí (sin
 * abrirse encima de la lista) y el panel se ensancha o estrecha arrastrando su borde; la lista se
 * ajusta sola. Es una preferencia de cada persona y de cada página, como el resto del panel.
 *
 * Solo con sitio para las dos columnas (1280 px o más): en pantallas estrechas el panel va debajo
 * del bloque, así que la ficha se abre encima, como siempre.
 */
export type PanelFicha = {
  /** Lo que ha elegido la persona para esta página. */
  preferida: boolean
  /** Se está usando ahora: preferida y con sitio para dos columnas. */
  activa: boolean
  alternar: (enPanel: boolean) => void
  ancho: number
  setAncho: (px: number) => void
  /** Dónde pinta `DetailSheet` la ficha cuando va en el panel. Lo pone `WorkGrid`. */
  nodo: HTMLElement | null
  setNodo: (el: HTMLElement | null) => void
}

export const ANCHO_FICHA = { min: 380, porDefecto: 480, max: 960 }
// La lista nunca se queda más estrecha que esto al ensanchar la ficha.
const ANCHO_MINIMO_LISTA = 520
const PASO_TECLADO = 24
const DOS_COLUMNAS = "(min-width: 1280px)"

type Prefs = { ficha: boolean; ancho: number }

function suscribirDosColumnas(cb: () => void) {
  const mql = window.matchMedia(DOS_COLUMNAS)
  mql.addEventListener("change", cb)
  return () => mql.removeEventListener("change", cb)
}

function useDosColumnas() {
  return React.useSyncExternalStore(suscribirDosColumnas, () => window.matchMedia(DOS_COLUMNAS).matches, () => false)
}

function acotar(px: number, max = ANCHO_FICHA.max) {
  return Math.round(Math.min(Math.max(px, ANCHO_FICHA.min), Math.max(ANCHO_FICHA.min, max)))
}

/** Estado del panel de ficha de una página. Se pasa a `WorkGrid`, `InsightsPanel` y `DetailSheet`. */
export function usePanelFicha(pageKey: string): PanelFicha {
  const [prefs, setPrefs] = useLocalStorage<Prefs>(`panel-ficha:${pageKey}`, { ficha: false, ancho: ANCHO_FICHA.porDefecto })
  const dosColumnas = useDosColumnas()
  const [nodo, setNodo] = React.useState<HTMLElement | null>(null)
  return {
    preferida: prefs.ficha,
    activa: prefs.ficha && dosColumnas,
    alternar: (ficha) => setPrefs((p) => ({ ...p, ficha })),
    ancho: acotar(prefs.ancho),
    setAncho: (px) => setPrefs((p) => ({ ...p, ancho: acotar(px) })),
    nodo,
    setNodo,
  }
}

/** El interruptor «Ficha en el panel», con lo que hace. Va en los ajustes del panel. */
export function PanelFichaSwitch({ ficha }: { ficha: PanelFicha }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 hover:bg-muted">
      <PanelRightIcon className="mt-0.5 size-4 flex-none text-muted-foreground" aria-hidden />
      <span className="grid flex-1 gap-0.5">
        <span className="text-sm">Ficha en el panel</span>
        <span className="text-xs text-muted-foreground">
          {ficha.preferida && !ficha.activa
            ? "En pantallas estrechas la ficha se abre encima de la lista."
            : "Al pulsar un registro, se ve aquí en vez de abrirse encima de la lista."}
        </span>
      </span>
      <Switch checked={ficha.preferida} onCheckedChange={ficha.alternar} aria-label="Ficha en el panel" className="mt-0.5" />
    </label>
  )
}

/**
 * La columna derecha cuando lleva la ficha: `DetailSheet` pinta aquí el registro abierto y, sin
 * ninguno, se explica cómo elegirlo. Arriba a la derecha, los ajustes del panel (para volver a
 * «Información»); el borde izquierdo se arrastra para cambiar el ancho.
 */
export function DetailPanelHost({ ficha, vacio = "Pulsa un registro de la lista para verlo aquí." }: { ficha: PanelFicha; vacio?: string }) {
  return (
    <section data-slot="detail-panel" className="group/panel relative flex h-full min-h-0 flex-col overflow-hidden rounded-lg border bg-card shadow-xs">
      <BordeRedimensionable ficha={ficha} />
      <DestinoFicha setNodo={ficha.setNodo} />
      <div className="flex flex-1 flex-col items-center gap-2 px-8 pt-24 text-center group-has-[[data-slot=detail-panel-content]]/panel:hidden">
        <PanelRightIcon className="size-5 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium">Ninguno abierto</p>
        <p className="text-xs text-muted-foreground">{vacio}</p>
      </div>
      {/* Con una ficha abierta, su «Cerrar» va en la esquina y los ajustes se apartan a su izquierda. */}
      <div className="absolute top-3 right-3 group-has-[[data-slot=detail-panel-content]]/panel:right-11">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Personalizar panel" title="Personalizar panel">
              <SlidersHorizontalIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-2">
            <PanelFichaSwitch ficha={ficha} />
          </PopoverContent>
        </Popover>
      </div>
    </section>
  )
}

/** Donde `DetailSheet` pinta la ficha abierta (con un portal); vacío, no ocupa sitio. */
function DestinoFicha({ setNodo }: { setNodo: (el: HTMLElement | null) => void }) {
  return <div ref={setNodo} className="flex min-h-0 flex-1 flex-col empty:hidden" />
}

/**
 * El borde izquierdo del panel: se arrastra (o se mueve con las flechas) para ensanchar la ficha y
 * doble clic la devuelve al ancho de siempre. Mientras se arrastra solo cambia la variable CSS de la
 * rejilla; el ancho se guarda al soltar, para no repintar la lista en cada píxel.
 */
function BordeRedimensionable({ ficha }: { ficha: PanelFicha }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const rejilla = () => ref.current?.closest<HTMLElement>("[data-slot=work-grid]") ?? null
  const maximo = () => {
    const r = rejilla()
    return r ? Math.min(ANCHO_FICHA.max, r.clientWidth - ANCHO_MINIMO_LISTA) : ANCHO_FICHA.max
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = rejilla()
    if (!r || e.button !== 0) return
    e.preventDefault()
    const x0 = e.clientX
    const ancho0 = ficha.ancho
    const max = maximo()
    let ancho = ancho0
    e.currentTarget.setPointerCapture(e.pointerId)
    document.body.style.cursor = "col-resize"
    const mover = (ev: PointerEvent) => {
      ancho = acotar(ancho0 + (x0 - ev.clientX), max)
      r.style.setProperty("--aside-w", `${ancho}px`)
    }
    const soltar = () => {
      document.body.style.cursor = ""
      window.removeEventListener("pointermove", mover)
      window.removeEventListener("pointerup", soltar)
      ficha.setAncho(ancho)
    }
    window.addEventListener("pointermove", mover)
    window.addEventListener("pointerup", soltar)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
    e.preventDefault()
    ficha.setAncho(acotar(ficha.ancho + (e.key === "ArrowLeft" ? PASO_TECLADO : -PASO_TECLADO), maximo()))
  }

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation="vertical"
      aria-label="Ancho de la ficha"
      aria-valuemin={ANCHO_FICHA.min}
      aria-valuemax={ANCHO_FICHA.max}
      aria-valuenow={ficha.ancho}
      tabIndex={0}
      title="Arrastra para cambiar el ancho · doble clic para volver al de siempre"
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      onDoubleClick={() => ficha.setAncho(ANCHO_FICHA.porDefecto)}
      className={cn(
        "absolute inset-y-0 left-0 z-10 w-2 cursor-col-resize outline-none",
        "after:absolute after:inset-y-0 after:left-0 after:w-0.5 after:bg-transparent after:transition-colors hover:after:bg-brand/60 focus-visible:after:bg-brand",
      )}
    />
  )
}
