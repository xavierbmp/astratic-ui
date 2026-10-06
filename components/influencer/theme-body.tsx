"use client"

import * as React from "react"

const CLASE = "theme-influencer"

/**
 * Pone la clase del tema hijo en `<body>` mientras la página está montada. Hace falta porque los
 * diálogos, fichas, menús y toasts se pintan en un portal fuera del subárbol del shell: sin esto
 * saldrían con los tokens del madre (y sin tintes). El `div.theme-influencer` del shell sigue
 * cubriendo el primer pintado en el servidor.
 */
export function ThemeBody() {
  React.useEffect(() => {
    document.body.classList.add(CLASE)
    return () => document.body.classList.remove(CLASE)
  }, [])
  return null
}
