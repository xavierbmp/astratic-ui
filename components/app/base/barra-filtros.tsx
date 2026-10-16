"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, ListFilterIcon, type LucideIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { contarCondiciones, type GrupoCondiciones } from "@/lib/filtros/core"
import type { CampoMenu } from "@/components/app/base/selector-campo"
import { BotonBarra } from "@/components/app/base/boton-barra"
import { Buscador } from "@/components/app/base/controles-barra"
import { PanelFiltro } from "@/components/app/base/panel-filtro"

export type OpcionVistaPropia = { id: string; label: string; icono: LucideIcon }

/**
 * La barra de la base para las páginas que tienen su propia vista y no una base entera (un
 * calendario hecho a medida): la misma colocación y los mismos filtros que `BarraBase` (vista a la
 * izquierda; filtro y buscar a la derecha; la acción principal al final), sin campos, grupos ni orden.
 */
export function BarraFiltros({
  campos,
  filtro,
  onFiltro,
  busqueda,
  onBuscar,
  objeto,
  vistas,
  accion,
}: {
  campos: CampoMenu[]
  filtro: GrupoCondiciones
  onFiltro: (filtro: GrupoCondiciones) => void
  busqueda: string
  onBuscar: (q: string) => void
  /** «el calendario»: para los textos del filtro. */
  objeto: string
  /** Las formas de ver de la página (calendario, lista, tablero), si tiene varias. */
  vistas?: { opciones: OpcionVistaPropia[]; valor: string; onCambiar: (id: string) => void }
  accion?: React.ReactNode
}) {
  const [abierto, setAbierto] = React.useState(false)
  const n = contarCondiciones(filtro)
  const actual = vistas?.opciones.find((o) => o.id === vistas.valor) ?? vistas?.opciones[0]
  return (
    <div className="@container/barra flex h-11 flex-none items-center gap-1 rounded-xl border bg-card px-2">
      {vistas && actual && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="inline-flex h-7 min-w-0 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium hover:bg-muted">
              <actual.icono className="size-4 flex-none text-brand" />
              <span className="truncate">{actual.label}</span>
              <ChevronDownIcon className="size-3.5 flex-none text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            {vistas.opciones.map((o) => (
              <DropdownMenuItem key={o.id} onSelect={() => vistas.onCambiar(o.id)}>
                <o.icono className="text-brand" />
                <span className="flex-1">{o.label}</span>
                {o.id === actual.id && <CheckIcon />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <div className="ml-auto flex min-w-0 items-center gap-0.5">
        <Popover open={abierto} onOpenChange={setAbierto}>
          <PopoverTrigger asChild>
            <BotonBarra icono={ListFilterIcon} texto={n ? `Filtrado por ${n} ${n === 1 ? "condición" : "condiciones"}` : "Filtro"} activo={n > 0} />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <PanelFiltro campos={campos} value={filtro} onChange={onFiltro} objeto={objeto} />
          </PopoverContent>
        </Popover>
        <Buscador valor={busqueda} onCambiar={onBuscar} />
      </div>
      {accion && <div className="ml-1 flex-none">{accion}</div>}
    </div>
  )
}
