"use client"

import * as React from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Column } from "@/components/app/data-table"
import type { TablaConfigurada } from "@/hooks/use-table-config"
import { CONFIG_VISTAS_VACIA, mezclarVistas, type ConfigVistas, type Vista } from "@/lib/vistas/core"

type CambioSinGuardar = Partial<Pick<Vista, "orden" | "filtro">>

let contador = 0
const idVista = () => `v-${Date.now().toString(36)}-${(contador += 1)}`

/**
 * Las vistas guardadas de una página, al estilo de Notion: pestañas que se crean, renombran,
 * duplican, ordenan y borran, recordadas por página en el navegador.
 *
 * El diseño, la agrupación, las propiedades y los ajustes se guardan al momento. El filtro y el
 * orden no: quedan como cambio sin guardar («Guardar en la vista» o «Restablecer»), para no
 * estropear una vista sin querer al mirar algo un momento.
 *
 * `deSerie` tiene que ser estable (constante o `useMemo`).
 */
export function useVistas(clave: string, deSerie: Vista[]) {
  const [config, setConfig] = useLocalStorage<ConfigVistas>(`vistas:${clave}`, CONFIG_VISTAS_VACIA)
  const [sinGuardar, setSinGuardar] = React.useState<Record<string, CambioSinGuardar>>({})

  const vistas = React.useMemo(() => mezclarVistas(deSerie, config), [deSerie, config])
  const idsDeSerie = React.useMemo(() => new Set(deSerie.map((v) => v.id)), [deSerie])
  const activaId = vistas.find((v) => v.id === config.activa)?.id ?? vistas[0]?.id
  const guardada = vistas.find((v) => v.id === activaId)
  const cambio = activaId ? sinGuardar[activaId] : undefined
  const vista = guardada && cambio ? { ...guardada, ...cambio } : guardada
  const hayCambios = !!guardada && !!cambio && Object.entries(cambio).some(([k, v]) => JSON.stringify(v) !== JSON.stringify(guardada[k as keyof CambioSinGuardar]))

  const actualizar = React.useCallback(
    (parcial: Partial<Vista>, id?: string) => {
      setConfig((c) => {
        const objetivo = id ?? (mezclarVistas(deSerie, c).find((v) => v.id === c.activa) ?? mezclarVistas(deSerie, c)[0])?.id
        if (!objetivo) return c
        if (idsDeSerie.has(objetivo)) return { ...c, editadas: { ...c.editadas, [objetivo]: { ...c.editadas?.[objetivo], ...parcial } } }
        return { ...c, propias: (c.propias ?? []).map((v) => (v.id === objetivo ? { ...v, ...parcial, id: objetivo } : v)) }
      })
    },
    [setConfig, deSerie, idsDeSerie],
  )

  const activar = React.useCallback((id: string) => setConfig((c) => ({ ...c, activa: id })), [setConfig])

  const crear = React.useCallback(
    (base: Omit<Vista, "id">) => {
      const id = idVista()
      setConfig((c) => ({ ...c, propias: [...(c.propias ?? []), { ...base, id }], activa: id }))
      return id
    },
    [setConfig],
  )

  const duplicar = React.useCallback(
    (id: string) => {
      const v = vistas.find((x) => x.id === id)
      if (!v) return undefined
      // `crear` le pone un id nuevo: el de la original no pasa a la copia.
      return crear({ ...v, ...sinGuardar[id], nombre: `${v.nombre} (copia)` })
    },
    [vistas, sinGuardar, crear],
  )

  const borrar = React.useCallback(
    (id: string) => {
      setConfig((c) => {
        const activa = c.activa === id ? undefined : c.activa
        if (idsDeSerie.has(id)) return { ...c, borradas: [...new Set([...(c.borradas ?? []), id])], activa }
        return { ...c, propias: (c.propias ?? []).filter((v) => v.id !== id), activa }
      })
    },
    [setConfig, idsDeSerie],
  )

  /** Deshace un borrado: vuelve a poner la vista donde estaba. */
  const restaurar = React.useCallback(
    (v: Vista) => {
      setConfig((c) => {
        if (idsDeSerie.has(v.id)) return { ...c, borradas: (c.borradas ?? []).filter((x) => x !== v.id), activa: v.id }
        return { ...c, propias: [...(c.propias ?? []).filter((x) => x.id !== v.id), v], activa: v.id }
      })
    },
    [setConfig, idsDeSerie],
  )

  const reordenar = React.useCallback((ids: string[]) => setConfig((c) => ({ ...c, orden: ids })), [setConfig])

  /** Vuelve una vista de serie a como viene en el código. */
  const restablecer = React.useCallback(
    (id: string) => {
      setConfig((c) => {
        const editadas = { ...c.editadas }
        delete editadas[id]
        return { ...c, editadas }
      })
      setSinGuardar((s) => {
        const n = { ...s }
        delete n[id]
        return n
      })
    },
    [setConfig],
  )

  const cambiarSinGuardar = React.useCallback(
    (parcial: CambioSinGuardar) => {
      if (!activaId) return
      setSinGuardar((s) => ({ ...s, [activaId]: { ...s[activaId], ...parcial } }))
    },
    [activaId],
  )

  const descartarCambios = React.useCallback(() => {
    if (!activaId) return
    setSinGuardar((s) => {
      const n = { ...s }
      delete n[activaId]
      return n
    })
  }, [activaId])

  const guardarCambios = React.useCallback(() => {
    if (!activaId || !cambio) return
    actualizar(cambio, activaId)
    descartarCambios()
  }, [activaId, cambio, actualizar, descartarCambios])

  return {
    vistas,
    vista,
    activaId,
    activar,
    actualizar,
    crear,
    duplicar,
    borrar,
    restaurar,
    reordenar,
    restablecer,
    esDeSerie: (id: string) => idsDeSerie.has(id),
    estaEditada: (id: string) => idsDeSerie.has(id) && !!config.editadas?.[id],
    hayCambios,
    cambiarSinGuardar,
    guardarCambios,
    descartarCambios,
  }
}

export type VistasApi = ReturnType<typeof useVistas>

/**
 * Las propiedades visibles de una vista con la forma de `useTableConfig`, para usar el mismo panel
 * de campos (`ColumnSettings`): interruptor por propiedad y arrastrar para ordenar. La primera
 * columna (el título) no se oculta.
 */
export function usePropiedadesDeVista<T>(columnas: Column<T>[], visibles: string[], onChange: (ids: string[]) => void): TablaConfigurada<T> {
  return React.useMemo(() => {
    const principal = columnas[0]?.id
    const porId = new Map(columnas.map((c) => [c.id, c]))
    const vistas = visibles.filter((id) => porId.has(id) && id !== principal)
    const ocultas = new Set(columnas.filter((c) => c.id !== principal && !vistas.includes(c.id)).map((c) => c.id))
    const todas = [principal, ...vistas, ...columnas.map((c) => c.id).filter((id) => id !== principal && !vistas.includes(id))]
      .map((id) => (id ? porId.get(id) : undefined))
      .filter((c): c is Column<T> => c !== undefined)
    const enOrden = (ids: Iterable<string>) => {
      const set = new Set(ids)
      return todas.map((c) => c.id).filter((id) => set.has(id) && id !== principal)
    }
    return {
      columnas: todas.filter((c) => c.id === principal || vistas.includes(c.id)),
      todas,
      ocultas,
      bloqueadas: new Set(principal ? [principal] : []),
      alternar: (id: string, mostrar: boolean) => onChange(mostrar ? enOrden([...vistas, id]) : vistas.filter((x) => x !== id)),
      reordenar: (ids: string[]) => onChange(ids.filter((id) => id !== principal && vistas.includes(id))),
      mostrarTodas: () => onChange(todas.map((c) => c.id).filter((id) => id !== principal)),
      ocultarTodas: () => onChange([]),
      restablecer: () => onChange(vistas),
    }
  }, [columnas, visibles, onChange])
}
