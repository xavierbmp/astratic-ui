"use client"

import * as React from "react"
import {
  ArrowUpDownIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  EyeOffIcon,
  LayoutListIcon,
  ListFilterIcon,
  PaintBucketIcon,
  PanelLeftIcon,
  PencilIcon,
  Rows3Icon,
  SearchIcon,
  Table2Icon,
  Trash2Icon,
  WrapTextIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { contarCondiciones } from "@/lib/filtros/core"
import type { DefCampo } from "@/lib/base/campos"
import { ALTURAS_FILA, camposOcultos, textoCampos, textoFiltro, type AlturaFila, type VistaBase } from "@/lib/base/vistas"
import type { CampoMenu } from "@/components/app/base/selector-campo"
import { PanelFiltro } from "@/components/app/base/panel-filtro"
import { MenuCampos } from "@/components/app/base/menu-campos"
import { MenuOrden } from "@/components/app/base/menu-orden"
import { MenuGrupos } from "@/components/app/base/menu-grupos"
import { MenuColor } from "@/components/app/base/menu-color"

/** Cada botón activo se tiñe de su color, como en Airtable: campos ocultos, filtro, grupos, orden y color. */
const TINTE = {
  campos: "bg-opcion-azul text-opcion-azul-foreground hover:bg-opcion-azul",
  filtro: "bg-opcion-verde text-opcion-verde-foreground hover:bg-opcion-verde",
  grupos: "bg-opcion-morado text-opcion-morado-foreground hover:bg-opcion-morado",
  orden: "bg-opcion-naranja text-opcion-naranja-foreground hover:bg-opcion-naranja",
  color: "bg-opcion-rosa text-opcion-rosa-foreground hover:bg-opcion-rosa",
} as const

const BotonBarra = React.forwardRef<HTMLButtonElement, React.ComponentProps<"button"> & { icono: LucideIcon; texto: string; tinte?: string }>(function BotonBarra({ icono: Icono, texto, tinte, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn("inline-flex h-7 flex-none items-center gap-1.5 rounded-md px-2 text-[13px] whitespace-nowrap text-foreground/80 hover:bg-muted aria-expanded:bg-muted", tinte, className)}
      title={texto}
      {...props}
    >
      <Icono className="size-4 flex-none" />
      {/* Si no cabe todo, los botones apagados se quedan en icono; los activos siguen diciendo qué hacen. */}
      <span className={tinte ? "hidden max-w-44 truncate @3xl/barra:inline" : "hidden @6xl/barra:inline"}>{texto}</span>
    </button>
  )
})

/** Los menús de la barra, para abrirlos desde fuera («Filtrar por este campo» abre el de filtro). */
export type MenuDeBarra = "campos" | "filtro" | "grupos" | "orden" | "color"

/** Un botón de la barra que abre su menú, como los de Airtable. */
function MenuBarra({ icono, texto, tinte, children, align = "start", abierto, onAbierto }: { icono: LucideIcon; texto: string; tinte?: string; children: React.ReactNode; align?: "start" | "end"; abierto: boolean; onAbierto: (a: boolean) => void }) {
  return (
    <Popover open={abierto} onOpenChange={onAbierto}>
      <PopoverTrigger asChild>
        <BotonBarra icono={icono} texto={texto} tinte={tinte} />
      </PopoverTrigger>
      {/* Se abre también desde el menú de una cabecera («Filtrar por este campo»), que al cerrarse devuelve el foco: eso no lo cierra. */}
      <PopoverContent align={align} className="w-auto p-0" onFocusOutside={(e) => e.preventDefault()}>
        {children}
      </PopoverContent>
    </Popover>
  )
}

export type AccionesVista = {
  renombrar: (nombre: string) => void
  duplicar: () => void
  borrar?: () => void
}

/**
 * La barra de una vista de la base, como la de Airtable: a la izquierda el lateral de vistas y el
 * nombre de la vista (con su menú); a la derecha ocultar campos, filtro, agrupar, ordenar, color,
 * altura de fila y buscar, y al final la acción principal de la página.
 */
export function BarraBase<T>({
  vista,
  vistas,
  campos,
  camposMenu,
  objeto,
  lateralAbierto,
  onLateral,
  onCambiar,
  acciones,
  onContraer,
  onExpandir,
  busqueda,
  onBuscar,
  accion,
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
  onCambiar: (parcial: Partial<VistaBase>) => void
  acciones: AccionesVista
  onContraer: () => void
  onExpandir: () => void
  busqueda: string
  onBuscar: (q: string) => void
  accion?: React.ReactNode
  menu: MenuDeBarra | null
  onMenu: (m: MenuDeBarra | null) => void
}) {
  const de = (m: MenuDeBarra) => ({ abierto: menu === m, onAbierto: (a: boolean) => onMenu(a ? m : null) })
  const otras = vistas.filter((v) => v.id !== vista.id)
  const ocultos = camposOcultos(vista)
  const filtrado = textoFiltro(vista.filtro, campos)
  const coloreado = vista.color?.modo === "campo" ? `Coloreado por ${campos.find((c) => c.id === (vista.color?.modo === "campo" ? vista.color.campo : ""))?.nombre ?? "un campo"}` : vista.color ? "Coloreado por condiciones" : null

  return (
    <div className="@container/barra flex h-11 flex-none items-center gap-1 border-b px-2">
      <button type="button" aria-label={lateralAbierto ? "Ocultar las vistas" : "Ver las vistas"} aria-pressed={lateralAbierto} onClick={onLateral} className="hidden size-7 flex-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex">
        <PanelLeftIcon className="size-4" />
      </button>
      <MenuNombreVista vista={vista} acciones={acciones} />

      <div className="ml-auto flex min-w-0 items-center gap-0.5 overflow-x-auto">
        <MenuBarra icono={EyeOffIcon} texto={ocultos ? `${ocultos} ${ocultos === 1 ? "campo oculto" : "campos ocultos"}` : "Ocultar campos"} tinte={ocultos ? TINTE.campos : undefined} {...de("campos")}>
          <MenuCampos vista={vista} campos={campos} onCambiar={(lista) => onCambiar({ campos: lista })} />
        </MenuBarra>
        <MenuBarra icono={ListFilterIcon} texto={filtrado ?? "Filtro"} tinte={contarCondiciones(vista.filtro) ? TINTE.filtro : undefined} {...de("filtro")}>
          <PanelFiltro campos={camposMenu} value={vista.filtro} onChange={(filtro) => onCambiar({ filtro })} objeto={objeto} otrasVistas={otras} />
        </MenuBarra>
        <MenuBarra icono={LayoutListIcon} texto={vista.grupos.length ? textoCampos(vista.grupos.length, "Agrupados") : "Agrupar"} tinte={vista.grupos.length ? TINTE.grupos : undefined} {...de("grupos")}>
          <MenuGrupos campos={camposMenu} grupos={vista.grupos} otrasVistas={otras} onCambiar={(grupos) => onCambiar({ grupos, plegados: [] })} onContraer={onContraer} onExpandir={onExpandir} />
        </MenuBarra>
        <MenuBarra icono={ArrowUpDownIcon} texto={vista.orden.length ? textoCampos(vista.orden.length, "Ordenado") : "Ordenar"} tinte={vista.orden.length ? TINTE.orden : undefined} {...de("orden")}>
          <MenuOrden campos={camposMenu} orden={vista.orden} otrasVistas={otras} onCambiar={(orden) => onCambiar({ orden })} />
        </MenuBarra>
        <MenuBarra icono={PaintBucketIcon} texto={coloreado ?? "Configurar color"} tinte={coloreado ? TINTE.color : undefined} align="end" {...de("color")}>
          <MenuColor campos={camposMenu} color={vista.color} onCambiar={(color) => onCambiar({ color })} />
        </MenuBarra>
        <MenuAltura altura={vista.altura} ajustarCabeceras={!!vista.ajustarCabeceras} onCambiar={onCambiar} />
        <Buscador valor={busqueda} onCambiar={onBuscar} />
      </div>
      {accion && <div className="ml-1 flex-none">{accion}</div>}
    </div>
  )
}

function MenuNombreVista({ vista, acciones }: { vista: VistaBase; acciones: AccionesVista }) {
  const [renombrando, setRenombrando] = React.useState(false)
  const [nombre, setNombre] = React.useState(vista.nombre)
  return (
    <Popover open={renombrando} onOpenChange={setRenombrando}>
      <DropdownMenu>
        <PopoverAnchor asChild>
          <DropdownMenuTrigger asChild>
            <button type="button" className="inline-flex h-7 min-w-0 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium hover:bg-muted">
              <Table2Icon className="size-4 flex-none text-brand" />
              <span className="max-w-56 truncate">{vista.nombre}</span>
              <ChevronDownIcon className="size-3.5 flex-none text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
        </PopoverAnchor>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuItem
            onSelect={() => {
              setNombre(vista.nombre)
              // El menú se cierra antes de abrir el campo del nombre.
              setTimeout(() => setRenombrando(true), 0)
            }}
          >
            <PencilIcon /> Cambiar el nombre
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={acciones.duplicar}>
            <CopyIcon /> Duplicar la vista
          </DropdownMenuItem>
          {acciones.borrar && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={acciones.borrar}>
                <Trash2Icon /> Eliminar la vista
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <PopoverContent align="start" className="w-64 p-2">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            acciones.renombrar(nombre)
            setRenombrando(false)
          }}
        >
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} autoFocus aria-label="Nombre de la vista" className="h-8 text-[13px]" />
        </form>
      </PopoverContent>
    </Popover>
  )
}

function MenuAltura({ altura, ajustarCabeceras, onCambiar }: { altura: AlturaFila; ajustarCabeceras: boolean; onCambiar: (parcial: Partial<VistaBase>) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BotonBarra icono={Rows3Icon} texto="Altura de la fila" className="[&>span]:hidden" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {(Object.keys(ALTURAS_FILA) as AlturaFila[]).map((a) => (
          <DropdownMenuItem key={a} onSelect={() => onCambiar({ altura: a })}>
            <span className="flex-1">{ALTURAS_FILA[a].label}</span>
            {a === altura && <CheckIcon />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            onCambiar({ ajustarCabeceras: !ajustarCabeceras })
          }}
        >
          <WrapTextIcon />
          <span className="flex-1">Encabezados con ajuste de texto</span>
          <Switch size="sm" checked={ajustarCabeceras} tabIndex={-1} aria-hidden />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** La lupa de Airtable: al pulsarla se abre el buscador; Escape lo cierra y lo vacía. */
function Buscador({ valor, onCambiar }: { valor: string; onCambiar: (q: string) => void }) {
  const [abierto, setAbierto] = React.useState(valor !== "")
  if (!abierto)
    return (
      <button type="button" aria-label="Buscar" className="inline-flex size-7 flex-none items-center justify-center rounded-md text-foreground/80 hover:bg-muted" onClick={() => setAbierto(true)}>
        <SearchIcon className="size-4" />
      </button>
    )
  return (
    <label className="flex h-7 w-52 flex-none items-center gap-1.5 rounded-md border bg-background px-2">
      <SearchIcon className="size-3.5 flex-none text-muted-foreground" />
      <input
        autoFocus
        className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        placeholder="Buscar en todos los campos"
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Escape") return
          onCambiar("")
          setAbierto(false)
        }}
      />
      <button
        type="button"
        aria-label="Cerrar el buscador"
        className="text-muted-foreground hover:text-foreground"
        onClick={() => {
          onCambiar("")
          setAbierto(false)
        }}
      >
        <XIcon className="size-3.5" />
      </button>
    </label>
  )
}
