"use client"

import * as React from "react"
import { ActiveFilters, Toolbar, ToolbarActions, ToolbarSearch, ViewSwitcher, type ViewKind } from "@/components/app/toolbar"
import { FilterBuilder } from "@/components/app/filter-builder"
import { EditorRapidos, GuardarRapidoDialog, QuickFilters } from "@/components/app/quick-filters"
import type { FiltrosAvanzados } from "@/hooks/use-filtros-avanzados"
import type { CampoFiltrable, GrupoCondiciones } from "@/lib/filtros/core"

/**
 * La toolbar completa de una página de operación: buscador, filtros rápidos, constructor de
 * filtros, conmutador de vistas y la acción principal. Va en la prop `toolbar` de `WorkGrid` y es
 * la misma en todas las listas, para que filtrar se haga igual en todas.
 *
 * Todo cabe en una línea: los rápidos son la parte elástica y, si no caben, se desplazan en
 * horizontal; «Filtros» y las acciones se quedan siempre a la vista. Los campos visibles no están
 * aquí, sino al final de la cabecera de la tabla, que es donde se buscan.
 */
export function FilterBar<T, V extends ViewKind = ViewKind>({
  filtros,
  campos,
  filas,
  objeto,
  buscador,
  vistas,
  onCrearCampo,
  chipsExtra,
  onLimpiar,
  actions,
}: {
  filtros: FiltrosAvanzados<T>
  campos: CampoFiltrable<T>[]
  /** Filas mostradas: alimentan los contadores de los desplegables rápidos. */
  filas: T[]
  /** Plural del objeto, para el texto del constructor: «Mostrar las empresas que cumplen…». */
  objeto: string
  buscador: { value: string; onChange: (v: string) => void; placeholder?: string }
  vistas?: { views: V[]; value: V; onChange: (v: V) => void }
  /** Si se pasa, se puede crear un campo propio desde el selector de campo del constructor. */
  onCrearCampo?: () => void
  /** Chips de filtros propios de la página que no pasan por el constructor (un enlace entrante). */
  chipsExtra?: { label: string; onRemove: () => void }[]
  /** Se ejecuta al pulsar «Limpiar», además de quitar búsqueda y condiciones. */
  onLimpiar?: () => void
  actions?: React.ReactNode
}) {
  const [guardando, setGuardando] = React.useState<GrupoCondiciones | null>(null)
  const [editor, setEditor] = React.useState(false)

  return (
    <>
      <Toolbar className="flex-nowrap">
        <ToolbarSearch
          placeholder={buscador.placeholder ?? "Buscar…"}
          value={buscador.value}
          onChange={(e) => buscador.onChange(e.target.value)}
          className="w-40 flex-none sm:w-56"
        />
        {/*
          «Filtros» va pegado al último rápido, no anclado a la derecha: se mueve según cuántos
          rápidos haya, porque es uno más de la fila. El grupo es lo que cede sitio y se desplaza
          en horizontal en vez de saltar de línea.
        */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <QuickFilters api={filtros.rapidos} campos={campos} filas={filas} value={filtros.grupo} onChange={filtros.setGrupo} />
          <FilterBuilder
            campos={campos}
            value={filtros.grupo}
            onChange={filtros.setGrupo}
            objeto={objeto}
            onCrearCampo={onCrearCampo}
            onGuardarRapido={setGuardando}
            onEditarRapidos={() => setEditor(true)}
          />
        </div>
        <ToolbarActions className="flex-none">
          {vistas && <ViewSwitcher views={vistas.views} value={vistas.value} onChange={vistas.onChange} />}
          {actions}
        </ToolbarActions>
      </Toolbar>
      <ActiveFilters
        chips={chipsExtra ? [...filtros.chips, ...chipsExtra] : filtros.chips}
        onClear={() => {
          filtros.limpiar()
          onLimpiar?.()
        }}
      />
      <GuardarRapidoDialog
        grupo={guardando}
        onOpenChange={(o) => !o && setGuardando(null)}
        onGuardar={(r) => filtros.rapidos.anadir(r)}
      />
      <EditorRapidos open={editor} onOpenChange={setEditor} api={filtros.rapidos} campos={campos} />
    </>
  )
}
