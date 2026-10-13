"use client"

// Los controles de la barra de la base que no son menús de la vista: el nombre de la vista con su
// menú, el campo que manda en el kanban o el calendario, la altura de las filas y el buscador.

import * as React from "react"
import { CheckIcon, ChevronDownIcon, CopyIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon, UnfoldVerticalIcon, WrapTextIcon, XIcon, type LucideIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import type { DefCampo } from "@/lib/base/campos"
import { ALTURAS_FILA, LISTA_TIPOS_VISTA, TIPOS_VISTA, type AlturaFila, type TipoVista, type VistaBase } from "@/lib/base/vistas"
import { ICONO_TIPO, ICONO_VISTA, IconoCampo } from "@/components/app/base/apariencia"
import { BotonBarra } from "@/components/app/base/boton-barra"

export type AccionesVista = {
  renombrar: (nombre: string) => void
  duplicar: () => void
  borrar?: () => void
  /** Pasar a otra vista y crear una: el menú las ofrece también (con el lateral cerrado o sustituido). */
  activar: (id: string) => void
  crear: (tipo: TipoVista) => void
}

/**
 * El nombre de la vista abierta con el icono de su tipo. Su menú lleva las demás vistas (para pasar
 * a otra sin abrir el lateral), «Crear vista» y lo de esta: renombrarla, duplicarla o borrarla.
 */
export function MenuNombreVista({ vista, vistas, acciones }: { vista: VistaBase; vistas: VistaBase[]; acciones: AccionesVista }) {
  const [renombrando, setRenombrando] = React.useState(false)
  const [nombre, setNombre] = React.useState(vista.nombre)
  const Icono = ICONO_VISTA[vista.tipo ?? "cuadricula"]
  return (
    <Popover open={renombrando} onOpenChange={setRenombrando}>
      <DropdownMenu>
        <PopoverAnchor asChild>
          <DropdownMenuTrigger asChild>
            <button type="button" className="inline-flex h-7 min-w-0 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium hover:bg-muted">
              <Icono className="size-4 flex-none text-brand" />
              <span className="max-w-56 truncate">{vista.nombre}</span>
              <ChevronDownIcon className="size-3.5 flex-none text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
        </PopoverAnchor>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Vistas</DropdownMenuLabel>
          <div className="max-h-64 overflow-y-auto">
            {vistas.map((v) => {
              const IconoVista = ICONO_VISTA[v.tipo ?? "cuadricula"]
              return (
                <DropdownMenuItem key={v.id} onSelect={() => acciones.activar(v.id)}>
                  <IconoVista className="text-brand" />
                  <span className="flex-1 truncate">{v.nombre}</span>
                  {v.id === vista.id && <CheckIcon />}
                </DropdownMenuItem>
              )
            })}
          </div>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <PlusIcon /> Crear vista
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {LISTA_TIPOS_VISTA.map((tipo) => {
                const IconoTipo = ICONO_VISTA[tipo]
                return (
                  <DropdownMenuItem key={tipo} onSelect={() => acciones.crear(tipo)}>
                    <IconoTipo className="text-brand" /> {TIPOS_VISTA[tipo].label}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
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

/**
 * El campo que manda en la vista: el que reparte las columnas del kanban («Apilado por Marca») o el
 * que pone cada registro en su día del calendario («Fecha: Último contacto»).
 */
export function SelectorCampoVista<T>({ icono, texto, titulo, campos, valor, vacio, onCambiar }: { icono: LucideIcon; texto: string; titulo: string; campos: DefCampo<T>[]; valor: string | undefined; vacio: string; onCambiar: (id: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BotonBarra icono={icono} texto={texto} activo />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">{titulo}</DropdownMenuLabel>
        {campos.length === 0 && <p className="px-2 py-1.5 text-[13px] text-muted-foreground">{vacio}</p>}
        {campos.map((c) => (
          <DropdownMenuItem key={c.id} onSelect={() => onCambiar(c.id)}>
            <IconoCampo icono={ICONO_TIPO[c.tipo]} />
            <span className="flex-1 truncate">{c.nombre}</span>
            {c.id === valor && <CheckIcon />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MenuAltura({ altura, ajustarCabeceras, onCambiar }: { altura: AlturaFila; ajustarCabeceras: boolean; onCambiar: (parcial: Partial<VistaBase>) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BotonBarra icono={UnfoldVerticalIcon} texto="Altura de la fila" soloIcono />
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

/** La lupa: al pulsarla se abre el buscador; Escape lo cierra y lo vacía. */
export function Buscador({ valor, onCambiar }: { valor: string; onCambiar: (q: string) => void }) {
  const [abierto, setAbierto] = React.useState(valor !== "")
  if (!abierto) return <BotonBarra icono={SearchIcon} texto="Buscar" soloIcono onClick={() => setAbierto(true)} />
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
