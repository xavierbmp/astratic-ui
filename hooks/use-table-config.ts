"use client"

import * as React from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Column } from "@/components/app/data-table"

export type ConfigTabla = {
  /** Ids en el orden elegido. Los que no estén aquí van detrás, en el orden del código. */
  orden: string[]
  /** Ids que el usuario ha ocultado a mano. */
  ocultas: string[]
  /** Ids que el usuario ha mostrado a mano, aunque vinieran ocultos de serie. */
  vistas: string[]
}

const VACIA: ConfigTabla = { orden: [], ocultas: [], vistas: [] }

/**
 * Qué columnas se ven y en qué orden, recordado por página (como la vista y el panel lateral).
 *
 * Solo se guardan las decisiones del usuario, nunca la lista entera: así una columna nueva
 * —por ejemplo un campo propio recién creado— aparece sin que nadie tenga que tocar nada.
 * `ocultasPorDefecto` sirve para los campos propios que no están marcados «mostrar en tabla»:
 * existen en el panel de campos, pero empiezan apagados.
 */
export function useTableConfig<T>(
  pageKey: string,
  columnas: Column<T>[],
  opciones?: {
    /** Columnas que no se pueden ocultar (por defecto, la primera: identifica la fila). */
    fijas?: string[]
    /** Columnas que empiezan ocultas mientras el usuario no diga lo contrario. */
    ocultasPorDefecto?: string[]
  },
) {
  const [config, setConfig] = useLocalStorage<ConfigTabla>(`cols:${pageKey}`, VACIA)
  const fijas = opciones?.fijas
  const porDefecto = opciones?.ocultasPorDefecto
  const bloqueadas = React.useMemo(
    () => new Set(fijas ?? (columnas[0] ? [columnas[0].id] : [])),
    [fijas, columnas],
  )

  const ordenadas = React.useMemo(() => {
    const porId = new Map(columnas.map((c) => [c.id, c]))
    const vistos = new Set<string>()
    const out: Column<T>[] = []
    for (const id of config.orden ?? []) {
      const c = porId.get(id)
      if (c && !vistos.has(id)) {
        out.push(c)
        vistos.add(id)
      }
    }
    for (const c of columnas) if (!vistos.has(c.id)) out.push(c)
    return out
  }, [columnas, config.orden])

  const ocultas = React.useMemo(() => {
    const aMano = new Set(config.ocultas ?? [])
    const mostradas = new Set(config.vistas ?? [])
    const apagadas = new Set<string>()
    for (const c of ordenadas) {
      if (bloqueadas.has(c.id)) continue
      if (aMano.has(c.id)) apagadas.add(c.id)
      else if (porDefecto?.includes(c.id) && !mostradas.has(c.id)) apagadas.add(c.id)
    }
    return apagadas
  }, [config.ocultas, config.vistas, ordenadas, bloqueadas, porDefecto])

  const visibles = React.useMemo(() => ordenadas.filter((c) => !ocultas.has(c.id)), [ordenadas, ocultas])

  const alternar = React.useCallback(
    (id: string, mostrar: boolean) =>
      setConfig((p) => ({
        orden: p.orden ?? [],
        ocultas: mostrar ? (p.ocultas ?? []).filter((x) => x !== id) : [...new Set([...(p.ocultas ?? []), id])],
        vistas: mostrar ? [...new Set([...(p.vistas ?? []), id])] : (p.vistas ?? []).filter((x) => x !== id),
      })),
    [setConfig],
  )
  const reordenar = React.useCallback((ids: string[]) => setConfig((p) => ({ ...VACIA, ...p, orden: ids })), [setConfig])
  const mostrarTodas = React.useCallback(
    () => setConfig((p) => ({ ...VACIA, ...p, ocultas: [], vistas: ordenadas.map((c) => c.id) })),
    [setConfig, ordenadas],
  )
  const ocultarTodas = React.useCallback(
    () => setConfig((p) => ({ ...VACIA, ...p, ocultas: ordenadas.filter((c) => !bloqueadas.has(c.id)).map((c) => c.id), vistas: [] })),
    [setConfig, ordenadas, bloqueadas],
  )
  const restablecer = React.useCallback(() => setConfig(VACIA), [setConfig])

  return { columnas: visibles, todas: ordenadas, ocultas, bloqueadas, alternar, reordenar, mostrarTodas, ocultarTodas, restablecer }
}

export type TablaConfigurada<T> = ReturnType<typeof useTableConfig<T>>
