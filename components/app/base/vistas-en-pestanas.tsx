"use client"

import * as React from "react"

const VistasEnPestanasContext = React.createContext(false)

/**
 * Enciende en las bases de dentro lo nuevo del 2026-10-29 (reportes cmvsixcu, cmvtrp16, cmvtgjtf y cmvtm2y5 del
 * workspace): las vistas como pestañas laterales de serie, la flechita para abrir la ficha y los campos plegados del
 * formulario de alta. Lo pone el shell de cada portal; sin él, las bases siguen como antes. Así lo nuevo llega a un
 * portal cuando se publica para el suyo (el workspace de las influencers, en su tanda) y no antes.
 */
export function VistasEnPestanas({ children, activo = true }: { children: React.ReactNode; activo?: boolean }) {
  return <VistasEnPestanasContext.Provider value={activo}>{children}</VistasEnPestanasContext.Provider>
}

export const useVistasEnPestanas = () => React.useContext(VistasEnPestanasContext)
