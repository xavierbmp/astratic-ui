"use client"

import { ArrowLeftRightIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type LadoLateral = "izquierda" | "derecha"

/** Lo que un lateral necesita para pasarse al otro lado o plegarse; la página o la base lo recuerdan. */
export type ControlLateral = { lado: LadoLateral; onCambiarLado: () => void; onPlegar?: () => void }

/** A qué lado va un lateral, recordado en este navegador por bloque. */
export function useLadoLateral(clave: string, inicial: LadoLateral = "izquierda") {
  const [lado, setLado] = useLocalStorage<LadoLateral>(`lado-lateral:${clave}`, inicial)
  return { lado, cambiarLado: () => setLado(lado === "izquierda" ? "derecha" : "izquierda") }
}

/**
 * Los dos botones de todo bloque lateral (Xavier, 2026-10-16, reportes cmvb7vp4 y cmvb7wqg): pasarlo
 * al otro lado y plegarlo, con el panel y su flechita hacia el borde donde se esconde. Van a la derecha
 * de su cabecera. El botón que lo vuelve a sacar lleva `IconoPlegarLateral` con `abierto={false}`.
 */
export function ControlesLateral({ lado, onCambiarLado, onPlegar, nombre = "este bloque" }: ControlLateral & { nombre?: string }) {
  return (
    <span className="ml-auto flex flex-none items-center gap-0.5">
      <Button variant="ghost" size="icon-sm" aria-label={`Pasar ${nombre} a la ${lado === "izquierda" ? "derecha" : "izquierda"}`} title={`Pasar a la ${lado === "izquierda" ? "derecha" : "izquierda"}`} onClick={onCambiarLado}>
        <ArrowLeftRightIcon />
      </Button>
      {onPlegar && (
        <Button variant="ghost" size="icon-sm" aria-label={`Plegar ${nombre}`} title={`Plegar ${nombre}`} onClick={onPlegar}>
          <IconoPlegarLateral lado={lado} abierto />
        </Button>
      )}
    </span>
  )
}

/** El icono de plegar o desplegar un lateral: el panel del lado donde está, con la flecha hacia donde va. */
export function IconoPlegarLateral({ lado, abierto, className }: { lado: LadoLateral; abierto: boolean; className?: string }) {
  const Icono = lado === "izquierda" ? (abierto ? PanelLeftCloseIcon : PanelLeftOpenIcon) : abierto ? PanelRightCloseIcon : PanelRightOpenIcon
  return <Icono className={className} />
}
