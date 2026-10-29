"use client"

import * as React from "react"
import { GRUPO_VACIO, type GrupoCondiciones } from "@/lib/filtros/core"
import type { Orden } from "@/lib/vistas/core"
import { idBase } from "@/lib/base/vistas"
import { useLocalStorage } from "@/hooks/use-local-storage"

/**
 * Una vista de una página que no es una base entera (una lista con `BarraFiltros`): su nombre, su icono, su filtro y su
 * orden. Se ven como pestañas laterales (`PestanasVistas`), igual que las de una base (reporte cmvtrp16).
 */
export type VistaLigera = { id: string; nombre: string; icono?: string; filtro: GrupoCondiciones; orden: Orden[] }

type Guardado = { vistas: VistaLigera[]; activa?: string }

/**
 * Las vistas ligeras de una página, de cada persona y guardadas en su navegador: se crean, se renombran, se les cambia
 * el icono, se duplican, se ordenan y se borran, y el filtro y el orden de la abierta se guardan al momento. Sin
 * ninguna guardada, las de serie (como mínimo, una con todo).
 */
export function useVistasLigeras(clave: string, deSerie: VistaLigera[] = []) {
  const inicial = React.useMemo<Guardado>(() => ({ vistas: deSerie.length ? deSerie : [{ id: "todo", nombre: "Todo", icono: "capas", filtro: GRUPO_VACIO, orden: [] }] }), [deSerie])
  const [guardado, setGuardado] = useLocalStorage<Guardado>(`vistas-ligeras:${clave}`, inicial)
  const vistas = guardado.vistas?.length ? guardado.vistas : inicial.vistas
  const vista = vistas.find((v) => v.id === guardado.activa) ?? vistas[0]
  const poner = (cambio: (g: Guardado) => Guardado) => setGuardado(cambio({ vistas, activa: vista.id }))

  return {
    vistas,
    vista,
    activar: (id: string) => poner((g) => ({ ...g, activa: id })),
    /** Cambia la vista abierta (su filtro o su orden). */
    cambiar: (parcial: Partial<VistaLigera>) => poner((g) => ({ ...g, vistas: g.vistas.map((v) => (v.id === vista.id ? { ...v, ...parcial } : v)) })),
    /** Una vista nueva con todo, abierta. Devuelve su id. */
    crear: () => {
      const id = idBase("vl")
      const usados = new Set(vistas.map((v) => v.nombre))
      let n = vistas.length + 1
      while (usados.has(`Vista ${n}`)) n += 1
      poner((g) => ({ vistas: [...g.vistas, { id, nombre: `Vista ${n}`, filtro: GRUPO_VACIO, orden: [] }], activa: id }))
      return id
    },
    editar: (id: string, cambio: { nombre?: string; icono?: string }) => {
      const nombre = cambio.nombre?.trim()
      if (cambio.nombre !== undefined && !nombre) return
      poner((g) => ({ ...g, vistas: g.vistas.map((v) => (v.id === id ? { ...v, ...(nombre ? { nombre } : {}), ...(cambio.icono ? { icono: cambio.icono } : {}) } : v)) }))
    },
    duplicar: (id: string) =>
      poner((g) => {
        const original = g.vistas.find((v) => v.id === id)
        if (!original) return g
        const copia = { ...original, id: idBase("vl"), nombre: `${original.nombre} (copia)` }
        const i = g.vistas.indexOf(original)
        return { vistas: [...g.vistas.slice(0, i + 1), copia, ...g.vistas.slice(i + 1)], activa: copia.id }
      }),
    borrar: (id: string) =>
      poner((g) => {
        if (g.vistas.length <= 1) return g
        const resto = g.vistas.filter((v) => v.id !== id)
        return { vistas: resto, activa: g.activa === id ? resto[0]?.id : g.activa }
      }),
    reordenar: (ids: string[]) => poner((g) => ({ ...g, vistas: ids.map((id) => g.vistas.find((v) => v.id === id)).filter((v): v is VistaLigera => !!v) })),
  }
}
