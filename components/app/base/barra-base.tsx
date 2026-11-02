"use client"

import * as React from "react"
import { ArrowUpDownIcon, CalendarDaysIcon, Columns3Icon, EyeOffIcon, PaletteIcon, Rows3Icon, ListFilterIcon, type LucideIcon } from "lucide-react"
import { IconoPlegarLateral, type LadoLateral } from "@/components/app/controles-lateral"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { contarCondiciones } from "@/lib/filtros/core"
import type { DefCampo } from "@/lib/base/campos"
import { camposApilables, camposDeFecha, camposOcultos, textoCampos, textoFiltro, type TipoVista, type VistaBase } from "@/lib/base/vistas"
import type { CampoMenu } from "@/components/app/base/selector-campo"
import { BotonBarra } from "@/components/app/base/boton-barra"
import { AjustesBase, Buscador, MenuAltura, NombreVista, SelectorCampoVista, type AccionesVista, type AjusteDeBase, type FijasDeBase } from "@/components/app/base/controles-barra"
import { PanelFiltro } from "@/components/app/base/panel-filtro"
import { MenuCampos } from "@/components/app/base/menu-campos"
import { MenuOrden } from "@/components/app/base/menu-orden"
import { MenuGrupos } from "@/components/app/base/menu-grupos"
import { MenuColor } from "@/components/app/base/menu-color"

export type { AccionesVista, AjusteDeBase, FijasDeBase }

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
function MenuBarra({ icono, texto, activo, children, align = "center", abierto, onAbierto }: { icono: LucideIcon; texto: string; activo?: boolean; children: React.ReactNode; align?: "start" | "center" | "end"; abierto: boolean; onAbierto: (a: boolean) => void }) {
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
 * La cabecera de una base, igual en todas. A la izquierda, el icono y el nombre de la vista, que se escribe ahí mismo. En el
 * centro, todo lo que cambia lo que se ve: campos, filtro, agrupar, ordenar, color, altura y buscar. A la derecha, los
 * botones principales de la base y, al final del todo, sus ajustes (automatizaciones, valores de serie…).
 */
export function BarraBase<T>({
  vista,
  campos,
  camposMenu,
  objeto,
  otrasVistas,
  lateral,
  onCambiar,
  acciones,
  onContraer,
  onExpandir,
  busqueda,
  onBuscar,
  accion,
  ajustes,
  panelFicha,
  menu,
  onMenu,
  fijas,
  enfocarNombre,
  onNombreEnfocado,
}: {
  vista: VistaBase
  campos: DefCampo<T>[]
  camposMenu: CampoMenu[]
  /** «contactos»: para los textos. */
  objeto: string
  otrasVistas: VistaBase[]
  /** Un lateral propio de la página (carpetas): el botón que lo abre y lo cierra. */
  lateral?: { nombre: string; abierto: boolean; lado: LadoLateral; onAlternar: () => void }
  onCambiar: (parcial: Partial<VistaBase>) => void
  acciones: AccionesVista
  onContraer: () => void
  onExpandir: () => void
  busqueda: string
  onBuscar: (q: string) => void
  /** Los botones principales: importar y crear. */
  accion?: React.ReactNode
  /** Lo que la página añade a los ajustes de la base. */
  ajustes?: AjusteDeBase[]
  /** La ficha del registro abierto, al lado de la base en vez de encima (solo en pantallas anchas). */
  panelFicha?: { activo: boolean; onAlternar: () => void }
  menu: MenuDeBarra | null
  onMenu: (m: MenuDeBarra | null) => void
  /** Las vistas fijas de la página. Con una abierta, la barra solo deja buscar: la vista no se configura. */
  fijas?: FijasDeBase
  /** Una vista recién creada: su nombre queda seleccionado para escribirlo. */
  enfocarNombre?: boolean
  onNombreEnfocado?: () => void
}) {
  const tipo = vista.tipo ?? "cuadricula"
  const fija = !!fijas?.activa
  const tiene = (m: MenuDeBarra) => !fija && MENUS[tipo].includes(m)
  const de = (m: MenuDeBarra) => ({ abierto: menu === m, onAbierto: (a: boolean) => onMenu(a ? m : null) })
  const ocultos = camposOcultos(vista)
  const filtrado = textoFiltro(vista.filtro, campos)
  const nombreDe = (id: string | undefined) => campos.find((c) => c.id === id)?.nombre
  const reglasColor = vista.color?.reglas?.length ?? 0
  const coloreado = !vista.color ? null : reglasColor ? `Coloreado por ${reglasColor} ${reglasColor === 1 ? "regla" : "reglas"}` : `Coloreado por ${nombreDe(vista.color.campo) ?? "un campo"}`

  return (
    <div data-slot="barra-base" className="@container/barra flex-none border-b">
      <div className="flex h-12 items-center gap-2 px-3 @3xl/barra:grid @3xl/barra:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <div className="flex max-w-[45%] min-w-0 flex-none items-center gap-1 @3xl/barra:max-w-none">
        {lateral && (
          <button type="button" aria-label={lateral.abierto ? `Ocultar ${lateral.nombre}` : `Ver ${lateral.nombre}`} title={lateral.abierto ? `Ocultar ${lateral.nombre}` : `Ver ${lateral.nombre}`} aria-pressed={lateral.abierto} onClick={lateral.onAlternar} className="hidden size-8 flex-none items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex">
            <IconoPlegarLateral lado={lateral.lado} abierto={lateral.abierto} className="size-4" />
          </button>
        )}
        <NombreVista vista={vista} acciones={acciones} fijas={fijas} enfocar={enfocarNombre} onEnfocado={onNombreEnfocado} />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] @3xl/barra:justify-center">
        {!fija && tipo === "kanban" && (
          <SelectorCampoVista icono={Columns3Icon} texto={`Apilado por ${nombreDe(vista.apilar) ?? "…"}`} titulo="Las columnas salen de" campos={camposApilables(campos)} valor={vista.apilar} vacio="Crea un campo de selección única para repartir las tarjetas." onCambiar={(apilar) => onCambiar({ apilar })} />
        )}
        {!fija && tipo === "calendario" && (
          <SelectorCampoVista icono={CalendarDaysIcon} texto={`Fecha: ${nombreDe(vista.fecha) ?? "…"}`} titulo="Cada registro va en el día de" campos={camposDeFecha(campos)} valor={vista.fecha} vacio="Crea un campo de fecha para ver los registros en el calendario." onCambiar={(fecha) => onCambiar({ fecha })} />
        )}
        {tiene("campos") && (
          <MenuBarra icono={EyeOffIcon} texto={ocultos ? `${ocultos} ${ocultos === 1 ? "campo oculto" : "campos ocultos"}` : "Ocultar campos"} {...de("campos")}>
            <MenuCampos vista={vista} campos={campos} onCambiar={(lista) => onCambiar({ campos: lista })} />
          </MenuBarra>
        )}
        {!fija && (
          <MenuBarra icono={ListFilterIcon} texto={filtrado ?? "Filtro"} activo={contarCondiciones(vista.filtro) > 0} {...de("filtro")}>
            <PanelFiltro campos={camposMenu} value={vista.filtro} onChange={(filtro) => onCambiar({ filtro })} objeto={objeto} otrasVistas={otrasVistas} />
          </MenuBarra>
        )}
        {tiene("grupos") && (
          <MenuBarra icono={Rows3Icon} texto={vista.grupos.length ? textoCampos(vista.grupos.length, "Agrupados") : "Agrupar"} activo={vista.grupos.length > 0} {...de("grupos")}>
            <MenuGrupos campos={camposMenu} grupos={vista.grupos} otrasVistas={otrasVistas} onCambiar={(grupos) => onCambiar({ grupos, plegados: [] })} onContraer={onContraer} onExpandir={onExpandir} />
          </MenuBarra>
        )}
        {tiene("orden") && (
          <MenuBarra icono={ArrowUpDownIcon} texto={vista.orden.length ? textoCampos(vista.orden.length, "Ordenado") : "Ordenar"} activo={vista.orden.length > 0} {...de("orden")}>
            <MenuOrden campos={camposMenu} orden={vista.orden} otrasVistas={otrasVistas} onCambiar={(orden) => onCambiar({ orden })} />
          </MenuBarra>
        )}
        {!fija && (
          <MenuBarra icono={PaletteIcon} texto={coloreado ?? "Color"} activo={!!coloreado} {...de("color")}>
            <MenuColor campos={camposMenu} color={vista.color} onCambiar={(color) => onCambiar({ color })} />
          </MenuBarra>
        )}
        {!fija && tipo === "cuadricula" && <MenuAltura altura={vista.altura} onCambiar={onCambiar} />}
        <Buscador valor={busqueda} onCambiar={onBuscar} />
      </div>

      <div className="flex min-w-0 flex-none items-center justify-end gap-1.5">
        {accion}
        <AjustesBase vista={vista} onCambiar={onCambiar} ajustes={ajustes} panelFicha={panelFicha} fija={fija} />
      </div>
      </div>
    </div>
  )
}
