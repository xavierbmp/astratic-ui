"use client"

import * as React from "react"
import { useUrlFilters } from "@/hooks/use-url-filters"
import { useQuickFilters, type FiltroRapido } from "@/components/app/quick-filters"
import { chipsDeGrupo } from "@/components/app/filter-builder"
import { parseGrupo, serializarGrupo, type CampoFiltrable, type GrupoCondiciones } from "@/lib/filtros/core"

/**
 * Todo el estado de filtrado de una lista: búsqueda, condiciones y filtros rápidos.
 *
 * Las condiciones viven en la URL (`?f=`), así que un filtro se puede compartir por enlace y el
 * servidor las aplica antes de mandar las filas. Los rápidos son preferencia de cada uno y se
 * quedan en el navegador.
 */
export function useFiltrosAvanzados<T>(
  pageKey: string,
  campos: CampoFiltrable<T>[],
  rapidosPorDefecto: FiltroRapido[],
) {
  const filtros = useUrlFilters()
  const texto = filtros.getText("f")
  const grupo = React.useMemo(() => parseGrupo(texto), [texto])
  const setGrupo = React.useCallback(
    (g: GrupoCondiciones) => filtros.setText("f", serializarGrupo(g)),
    [filtros],
  )
  const rapidos = useQuickFilters(pageKey, rapidosPorDefecto)
  const chips = React.useMemo(() => chipsDeGrupo(grupo, campos, setGrupo), [grupo, campos, setGrupo])
  const limpiar = React.useCallback(() => filtros.clear(["q", "f"]), [filtros])

  return { filtros, grupo, setGrupo, rapidos, chips, limpiar, hayCondiciones: grupo.condiciones.length > 0 }
}

export type FiltrosAvanzados<T> = ReturnType<typeof useFiltrosAvanzados<T>>
