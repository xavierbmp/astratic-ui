"use client"

import * as React from "react"
import { ArrowUpDownIcon, CheckIcon, ChevronDownIcon, ListFilterIcon, Rows3Icon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { contarCondiciones, type GrupoCondiciones } from "@/lib/filtros/core"
import type { CampoMenu } from "@/components/app/base/selector-campo"
import { BotonBarra } from "@/components/app/base/boton-barra"
import { Buscador } from "@/components/app/base/controles-barra"
import { PanelFiltro } from "@/components/app/base/panel-filtro"
import { MenuOrden } from "@/components/app/base/menu-orden"
import type { Orden } from "@/lib/vistas/core"

export type OpcionVistaPropia = { id: string; label: string; icono: LucideIcon }

/**
 * Agrupar u ordenar una vista propia por una de unas pocas formas fijas («Por momento del trato», «Más usadas»). La primera
 * opción es la de serie: con ella el botón se ve apagado («Agrupar», «Ordenar»); con otra, dice cuál está puesta.
 */
export type MenuVistaPropia = { opciones: { id: string; label: string }[]; valor: string; onCambiar: (id: string) => void }

/**
 * La barra de la base para las páginas que tienen su propia vista y no una base entera (un
 * calendario hecho a medida): la misma colocación y los mismos filtros que `BarraBase` (vista a la
 * izquierda; filtro, agrupar, ordenar y buscar a la derecha; la acción principal al final), sin campos. Agrupar y ordenar,
 * si la página los ofrece, son una lista corta de formas fijas (`MenuVistaPropia`), no por cualquier campo.
 * Si su vista es un bloque, la barra va pegada encima, como la de una base (`pegada`: el bloque pone el borde).
 */
export function BarraFiltros({
  campos,
  filtro,
  onFiltro,
  busqueda,
  onBuscar,
  objeto,
  vistas,
  grupos,
  orden,
  ordenCampos,
  accion,
  pegada,
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
  /** Cómo se agrupa lo que se ve; la primera opción es «sin agrupar». */
  grupos?: MenuVistaPropia
  /** Cómo se ordena; la primera opción es la de serie. */
  orden?: MenuVistaPropia
  /** Ordenar por cualquiera de sus campos, como en una base (reporte cmvtfjmw); en lugar de `orden`. */
  ordenCampos?: { orden: Orden[]; onCambiar: (orden: Orden[]) => void }
  accion?: React.ReactNode
  /** Dentro del mismo bloque que su vista, como la barra de una base: sin borde propio, con una raya debajo. */
  pegada?: boolean
}) {
  const [abierto, setAbierto] = React.useState(false)
  const n = contarCondiciones(filtro)
  const actual = vistas?.opciones.find((o) => o.id === vistas.valor) ?? vistas?.opciones[0]
  return (
    <div className={cn("@container/barra flex h-11 flex-none items-center gap-1 bg-card px-2", pegada ? "border-b" : "rounded-xl border")}>
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
        {grupos && <MenuOpciones icono={Rows3Icon} apagado="Agrupar" prefijo="Agrupado" menu={grupos} />}
        {orden && <MenuOpciones icono={ArrowUpDownIcon} apagado="Ordenar" prefijo="Ordenado" menu={orden} />}
        {ordenCampos && (
          <Popover>
            <PopoverTrigger asChild>
              <BotonBarra icono={ArrowUpDownIcon} texto={ordenCampos.orden.length ? `Ordenado por ${ordenCampos.orden.length} ${ordenCampos.orden.length === 1 ? "campo" : "campos"}` : "Ordenar"} activo={ordenCampos.orden.length > 0} />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-auto p-0">
              <MenuOrden campos={campos} orden={ordenCampos.orden} otrasVistas={[]} onCambiar={ordenCampos.onCambiar} />
            </PopoverContent>
          </Popover>
        )}
        <Buscador valor={busqueda} onCambiar={onBuscar} />
      </div>
      {accion && <div className="ml-1 flex-none">{accion}</div>}
    </div>
  )
}

function MenuOpciones({ icono, apagado, prefijo, menu }: { icono: LucideIcon; apagado: string; prefijo: string; menu: MenuVistaPropia }) {
  const actual = menu.opciones.find((o) => o.id === menu.valor) ?? menu.opciones[0]
  const activo = !!actual && actual.id !== menu.opciones[0]?.id
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BotonBarra icono={icono} texto={activo ? `${prefijo}: ${actual.label.toLowerCase()}` : apagado} activo={activo} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {menu.opciones.map((o) => (
          <DropdownMenuItem key={o.id} onSelect={() => menu.onCambiar(o.id)}>
            <span className="flex-1">{o.label}</span>
            {o.id === actual?.id && <CheckIcon />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
