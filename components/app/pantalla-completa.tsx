"use client"

import * as React from "react"
import { Maximize2Icon, Minimize2Icon } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/hooks/use-local-storage"

/**
 * Pantalla completa de las páginas de operar (Xavier, 2026-10-23, reportes cmvlfay0 y cmvlkbo0): pliega la sidebar,
 * quita la cabecera de la página (título, descripción y cifras, también las de `WorkGrid`), lleva sus pestañas y sus
 * botones a la barra del shell, junto a las migas, y estrecha los laterales (el panel de información, las vistas de la
 * base), para que el bloque de trabajo (la base de datos) se lleve casi toda la pantalla. Solo existe donde hay un `WorkGrid`: el botón
 * sale en la cabecera del shell al montarse uno, y en las demás páginas todo se ve como siempre. Se recuerda en el
 * navegador; al salir, la sidebar vuelve como estaba.
 *
 * Las piezas lo leen con `usePantallaCompleta` (`WorkGrid`, `LateralVistas`, `PageHeader`, que se pinta en la
 * `RanuraPantallaCompleta` del shell) o con la variante `completa:` de `globals.css` (`PageBody`), que mira el
 * `data-pantalla-completa` que pone este proveedor alrededor de la sidebar y la página.
 */
type Estado = { activa: boolean; hayBloque: boolean; alternar: () => void; registrar: () => () => void; ranura: HTMLElement | null; setRanura: (el: HTMLElement | null) => void }

const Contexto = React.createContext<Estado | null>(null)

export function PantallaCompletaProvider({ children }: { children: React.ReactNode }) {
  const [guardada, setGuardada] = useLocalStorage("pantalla-completa", false)
  const [bloques, setBloques] = React.useState(0)
  const [ranura, setRanura] = React.useState<HTMLElement | null>(null)
  const { open, setOpen, isMobile } = useSidebar()
  const hayBloque = bloques > 0
  // En el móvil no hay sidebar fija ni sitio que ganar: allí no se activa.
  const activa = guardada && hayBloque && !isMobile

  // Al entrar se pliega la sidebar y se apunta cómo estaba, para devolverla así al salir.
  const antes = React.useRef<boolean | null>(null)
  React.useEffect(() => {
    if (activa && antes.current === null) {
      antes.current = open
      setOpen(false)
    } else if (!activa && antes.current !== null) {
      if (antes.current) setOpen(true)
      antes.current = null
    }
  }, [activa, open, setOpen])

  const registrar = React.useCallback(() => {
    setBloques((n) => n + 1)
    return () => setBloques((n) => n - 1)
  }, [])

  const valor = React.useMemo<Estado>(() => ({ activa, hayBloque, alternar: () => setGuardada(!activa), registrar, ranura, setRanura }), [activa, hayBloque, setGuardada, registrar, ranura])
  // La marca que leen las piezas con `completa:`; `contents` para no tocar la maqueta de la sidebar.
  return (
    <Contexto.Provider value={valor}>
      <div data-pantalla-completa={activa || undefined} className="contents">
        {children}
      </div>
    </Contexto.Provider>
  )
}

/** Si la página está en pantalla completa (fuera del shell, nunca). */
export function usePantallaCompleta() {
  return React.useContext(Contexto)?.activa ?? false
}

/** Lo llama `WorkGrid`: mientras esté montado, la página puede ponerse en pantalla completa. */
export function useBloqueDeTrabajo() {
  const registrar = React.useContext(Contexto)?.registrar
  React.useEffect(() => registrar?.(), [registrar])
}

/** El botón de la cabecera del shell, solo en las páginas con bloque de trabajo y desde el escritorio. */
export function BotonPantallaCompleta() {
  const estado = React.useContext(Contexto)
  if (!estado?.hayBloque) return null
  const { activa, alternar } = estado
  const texto = activa ? "Salir de pantalla completa" : "Pantalla completa"
  return (
    <Button variant="ghost" size="icon" aria-label={texto} title={texto} aria-pressed={activa} onClick={alternar} className="hidden md:inline-flex">
      {activa ? <Minimize2Icon /> : <Maximize2Icon />}
    </Button>
  )
}

/** El hueco de la barra del shell donde `PageHeader` pone sus pestañas y botones en pantalla completa. */
export function RanuraPantallaCompleta() {
  const { activa = false, setRanura } = React.useContext(Contexto) ?? {}
  if (!activa) return null
  // Las pestañas pisan el borde de la barra: sin su propia raya gris debajo.
  return <div ref={setRanura} className="flex min-w-0 flex-1 items-end self-stretch pl-2 [&_[data-slot=page-tabs]]:h-12 [&_[data-slot=page-tabs]]:shadow-none" />
}

/** Dónde pintar la cabecera de la página en pantalla completa (fuera de ella, nada). */
export function useRanuraPantallaCompleta() {
  const estado = React.useContext(Contexto)
  return estado?.activa ? estado.ranura : null
}
