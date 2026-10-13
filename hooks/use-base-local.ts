"use client"

import * as React from "react"
import type { DefCampo } from "@/lib/base/campos"
import type { ConfigBase, VistaBase } from "@/lib/base/vistas"
import { useBase } from "@/hooks/use-base"

const leer = (clave: string): ConfigBase | null => {
  try {
    const raw = window.localStorage.getItem(clave)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const sinSuscripcion = () => () => undefined

/** ¿Ya está en el navegador? Antes, en el servidor, la base no se pinta (sus vistas viven en el navegador). */
export const useEnNavegador = () => React.useSyncExternalStore(sinSuscripcion, () => true, () => false)

/**
 * Una base al estilo Airtable con sus vistas guardadas en este navegador: para la documentación,
 * la demo y los proyectos sin base de datos. En un portal, las vistas de cada persona se guardan en
 * su base de datos (`useBase` con `guardar`). La página pinta la base solo con `useEnNavegador()`.
 * `campos` tiene que ser estable (`useMemo`).
 */
export function useBaseLocal<T>(clave: string, campos: DefCampo<T>[], deSerie: (campos: DefCampo<T>[]) => VistaBase[]) {
  const llave = `base:${clave}`
  const [inicial] = React.useState(() => (typeof window === "undefined" ? null : leer(llave)))
  const [vistasDeSerie] = React.useState(() => deSerie(campos))
  const guardar = React.useCallback(
    (config: ConfigBase) => {
      try {
        window.localStorage.setItem(llave, JSON.stringify(config))
      } catch {}
    },
    [llave],
  )
  return useBase({ campos, deSerie: vistasDeSerie, inicial, guardar })
}
