"use client"

import * as React from "react"
import { leerBorrador } from "@/lib/influencer/borradores"

const suscribir = (aviso: () => void) => {
  window.addEventListener("storage", aviso)
  return () => window.removeEventListener("storage", aviso)
}
const sinSuscripcion = () => () => {}

/**
 * El borrador guardado en el navegador (ver `lib/influencer/borradores.ts`) o, si no hay, `inicial`.
 * En el servidor y en el primer pintado vale `inicial`, así que no rompe la hidratación.
 */
export function useBorrador<T>(clave: string, inicial: T): T {
  const crudo = React.useSyncExternalStore(suscribir, () => leerBorrador(clave), () => null)
  // El borrador lo escribió esta misma app con `guardarBorrador`, con el mismo tipo.
  return React.useMemo(() => (crudo ? (JSON.parse(crudo) as T) : inicial), [crudo, inicial])
}

/** `https://…` de la página, para que los enlaces copiados salgan completos. Vacío en el servidor. */
export function useOrigen() {
  return React.useSyncExternalStore(sinSuscripcion, () => window.location.origin, () => "")
}
