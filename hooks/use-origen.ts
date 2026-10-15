"use client"

import * as React from "react"

const sinSuscripcion = () => () => {}

/** `https://…` de la página, para que los enlaces copiados salgan completos. Vacío en el servidor y en el primer pintado. */
export function useOrigen() {
  return React.useSyncExternalStore(sinSuscripcion, () => window.location.origin, () => "")
}
