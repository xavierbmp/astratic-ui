"use client"

import * as React from "react"
import { ArrowUpDownIcon, CalendarDaysIcon, Columns3Icon, EyeOffIcon, PaletteIcon, PanelLeftIcon, PanelRightIcon, Rows3Icon, ListFilterIcon, type LucideIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { contarCondiciones } from "@/lib/filtros/core"
import type { DefCampo } from "@/lib/base/campos"
import { camposApilables, camposDeFecha, camposOcultos, textoCampos, textoFiltro, type TipoVista, type VistaBase } from "@/lib/base/vistas"
import type { CampoMenu } from "@/components/app/base/selector-campo"
import { BotonBarra } from "@/components/app/base/boton-barra"
import { Buscador, MenuAltura, MenuNombreVista, SelectorCampoVista, type AccionesVista } from "@/components/app/base/controles-barra"
import { PanelFiltro } from "@/components/app/base/panel-filtro"
import { MenuCampos } from "@/components/app/base/menu-campos"
import { MenuOrden } from "@/components/app/base/menu-orden"
import { MenuGrupos } from "@/components/app/base/menu-grupos"
import { MenuColor } from "@/components/app/base/menu-color"

export type { AccionesVista }

/** Los menús de la barra, para abrirlos desde fuera («Filtrar por este campo» abre el de filtro). */
export type MenuDeBarra = "campos" | "filtro" | "grupos" | "orden" | "color"

/** Qué menús tiene cada tipo de vista: el calendario no oculta campos ni ordena; solo la cuadrícula agrupa. */
const MENUS: Record<TipoVista, MenuDeBarra[]> = {
  cuadricula: ["campos", "filtro", "grupos", "orden", "color"],
  kanban: ["campos", "filtro", "orden", "color"],
  galeria: ["campos", "filtro", "orden", "color"],
  calendario: ["filtro", "color"],
}

/** Un botón de la barra que abre su menú. */
function MenuBarra({ icono, texto, activo, children, align = "start", abierto, onAbierto }: { icono: LucideIcon; texto: string; activo?: boolean; children: React.ReactNode; align?: "start" | "end"; abierto: boolean; onAbierto: (a: boolean) => void }) {
  return (
    <Popover open={abierto} onOpenChange={onAbierto}>
      <PopoverTrigger asChild>
        <BotonBarra icono={icono} texto={texto} activo={activo} />
      </PopoverTrigger>
      {/* Se abre también desde el menú de una cabecera («Filtrar por este campo»), que al cerrarse devuelve el foco: eso no lo cierra. */}
      <PopoverContent align={align} className="w-auto p-0" onFocusOutside={(e) => e.preventDefault()}>
        {children}
      </PopoverContent>
    </Popover>
  )
}

/**
 * La barra de una vista de la base, con la colocación de Airtable: a la izquierda el lateral de
 * vistas y el nombre de la vista (con su menú); a la derecha lo que tenga su tipo (ocultar campos,
 * filtro, agrupar, ordenar, color, altura de fila, el campo del kanban o del calendario) y buscar;
 * al final la acción principal de la página y el botón que pone la ficha en el panel de la derecha.
 */
export function BarraBase<T>({
  vista,
  vistas,
  campos,
  camposMenu,
  objeto,
  lateralAbierto,
  onLateral,
  nombreLateral = "las vistas",
  onCambiar,
  acciones,
  onContraer,
  onExpandir,
  busqueda,
  onBuscar,
  accion,
  panelFicha,
  menu,
  onMenu,
}: {
  vista: VistaBase
  vistas: VistaBase[]
  campos: DefCampo<T>[]
  camposMenu: CampoMenu[]
  /** «contactos»: para los textos. */
  objeto: string
  lateralAbierto: boolean
  onLateral: () => void
  /** El texto del botón del lateral («las vistas», «las carpetas»). */
  nombreLateral?: string
  onCambiar: (parcial: Partial<VistaBase>) => void
  acciones: AccionesVista
  onContraer: () => void
  onExpandir: () => void
  busqueda: string
  onBuscar: (q: string) => void
  accion?: React.ReactNode
  /** La ficha del registro abierto, integrada a la derecha en vez de encima (solo en pantallas anchas). */
  panelFicha?: { activo: boolean; onAlternar: () => void }
  menu: MenuDeBarra | null
  onMenu: (m: MenuDeBarra | null) => void
}) {
  const tipo = vista.tipo ?? "cuadricula"
  const tiene = (m: MenuDeBarra) => MENUS[tipo].includes(m)
  const de = (m: MenuDeBarra) => ({ abierto: menu === m, onAbierto: (a: boolean) => onMenu(a ? m : null) })
  const otras = vistas.filter((v) => v.id !== vista.id)
  const ocultos = camposOcultos(vista)
  const filtrado = textoFiltro(vista.filtro, campos)
  const nombreDe = (id: string | undefined) => campos.find((c) => c.id === id)?.nombre
  const reglasColor = vista.color?.reglas?.length ?? 0
  const coloreado = !vista.color ? null : reglasColor ? `Coloreado por ${reglasColor} ${reglasColor === 1 ? "regla" : "reglas"}` : `Coloreado por ${nombreDe(vista.color.campo) ?? "un campo"}`

  return (
    <div className="@container/barra flex h-11 flex-none items-center gap-1 border-b px-2">
      <button type="button" aria-label={lateralAbierto ? `Ocultar ${nombreLateral}` : `Ver ${nombreLateral}`} title={lateralAbierto ? `Ocultar ${nombreLateral}` : `Ver ${nombreLateral}`} aria-pressed={lateralAbierto} onClick={onLateral} className="hidden size-7 flex-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex">
        <PanelLeftIcon className="size-4" />
      </button>
      <MenuNombreVista vista={vista} vistas={vistas} acciones={acciones} />

      <div className="ml-auto flex min-w-0 items-center gap-0.5 overflow-x-auto">
        {tipo === "kanban" && (
          <SelectorCampoVista icono={Columns3Icon} texto={`Apilado por ${nombreDe(vista.apilar) ?? "…"}`} titulo="Las columnas salen de" campos={camposApilables(campos)} valor={vista.apilar} vacio="Crea un campo de selección única para repartir las tarjetas." onCambiar={(apilar) => onCambiar({ apilar })} />
        )}
        {tipo === "calendario" && (
          <SelectorCampoVista icono={CalendarDaysIcon} texto={`Fecha: ${nombreDe(vista.fecha) ?? "…"}`} titulo="Cada registro va en el día de" campos={camposDeFecha(campos)} valor={vista.fecha} vacio="Crea un campo de fecha para ver los registros en el calendario." onCambiar={(fecha) => onCambiar({ fecha })} />
        )}
        {tiene("campos") && (
          <MenuBarra icono={EyeOffIcon} texto={ocultos ? `${ocultos} ${ocultos === 1 ? "campo oculto" : "campos ocultos"}` : "Ocultar campos"} activo={ocultos > 0} {...de("campos")}>
            <MenuCampos vista={vista} campos={campos} onCambiar={(lista) => onCambiar({ campos: lista })} />
          </MenuBarra>
        )}
        <MenuBarra icono={ListFilterIcon} texto={filtrado ?? "Filtro"} activo={contarCondiciones(vista.filtro) > 0} {...de("filtro")}>
          <PanelFiltro campos={camposMenu} value={vista.filtro} onChange={(filtro) => onCambiar({ filtro })} objeto={objeto} otrasVistas={otras} />
        </MenuBarra>
        {tiene("grupos") && (
          <MenuBarra icono={Rows3Icon} texto={vista.grupos.length ? textoCampos(vista.grupos.length, "Agrupados") : "Agrupar"} activo={vista.grupos.length > 0} {...de("grupos")}>
            <MenuGrupos campos={camposMenu} grupos={vista.grupos} otrasVistas={otras} onCambiar={(grupos) => onCambiar({ grupos, plegados: [] })} onContraer={onContraer} onExpandir={onExpandir} />
          </MenuBarra>
        )}
        {tiene("orden") && (
          <MenuBarra icono={ArrowUpDownIcon} texto={vista.orden.length ? textoCampos(vista.orden.length, "Ordenado") : "Ordenar"} activo={vista.orden.length > 0} {...de("orden")}>
            <MenuOrden campos={camposMenu} orden={vista.orden} otrasVistas={otras} onCambiar={(orden) => onCambiar({ orden })} />
          </MenuBarra>
        )}
        <MenuBarra icono={PaletteIcon} texto={coloreado ?? "Color"} activo={!!coloreado} align="end" {...de("color")}>
          <MenuColor campos={camposMenu} color={vista.color} onCambiar={(color) => onCambiar({ color })} />
        </MenuBarra>
        {tipo === "cuadricula" && <MenuAltura altura={vista.altura} ajustarCabeceras={!!vista.ajustarCabeceras} onCambiar={onCambiar} />}
        <Buscador valor={busqueda} onCambiar={onBuscar} />
      </div>
      {accion && <div className="ml-1 flex-none">{accion}</div>}
      {panelFicha && (
        <button
          type="button"
          aria-pressed={panelFicha.activo}
          aria-label={panelFicha.activo ? "Plegar el panel" : "Desplegar el panel"}
          title={panelFicha.activo ? "Plegar el panel (la ficha se abre encima)" : "Desplegar el panel (la ficha se ve en él)"}
          onClick={panelFicha.onAlternar}
          className="ml-0.5 hidden size-7 flex-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground aria-pressed:bg-brand-soft aria-pressed:text-brand xl:inline-flex"
        >
          <PanelRightIcon className="size-4" />
        </button>
      )}
    </div>
  )
}
