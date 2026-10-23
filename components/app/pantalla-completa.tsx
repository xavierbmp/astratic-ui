"use client"

import * as React from "react"
import { Maximize2Icon, Minimize2Icon } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/hooks/use-local-storage"

/**
 * Pantalla completa de las páginas de operar (Xavier, 2026-10-23, reporte cmvlfay0): pliega la sidebar y sube todo lo
 * de arriba a una sola fila (las pestañas, los botones y las cifras, sin el título ni su descripción), para que el
 * bloque de trabajo (la base de datos) se lleve casi toda la pantalla. Solo existe donde hay un `WorkGrid`: el botón
 * sale en la cabecera del shell al montarse uno, y en las demás páginas todo se ve como siempre. Se recuerda en el
 * navegador; al salir, la sidebar vuelve como estaba.
 *
 * El aspecto lo ponen las piezas con la variante `completa:` de `globals.css` (`PageHeader`, `PageBody`), que mira el
 * `data-pantalla-completa` que pone este proveedor alrededor de la sidebar y la página.
 */
type Estado = { activa: boolean; hayBloque: boolean; alternar: () => void; registrar: () => () => void }

const Contexto = React.createContext<Estado | null>(null)

export function PantallaCompletaProvider({ children }: { children: React.ReactNode }) {
  const [guardada, setGuardada] = useLocalStorage("pantalla-completa", false)
  const [bloques, setBloques] = React.useState(0)
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

  const valor = React.useMemo<Estado>(() => ({ activa, hayBloque, alternar: () => setGuardada(!activa), registrar }), [activa, hayBloque, setGuardada, registrar])
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
