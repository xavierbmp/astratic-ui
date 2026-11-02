"use client"

// Los controles de la barra de la base que no son menús de la vista: su nombre y su icono, el campo que manda en el
// kanban o el calendario, la altura de las filas, el buscador y los ajustes de la base.

import * as React from "react"
import { CheckIcon, CopyIcon, LockIcon, SearchIcon, SettingsIcon, SmilePlusIcon, Trash2Icon, UnfoldVerticalIcon, WrapTextIcon, PanelRightIcon, XIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
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
import { Switch } from "@/components/ui/switch"
import type { DefCampo } from "@/lib/base/campos"
import { ALTURAS_FILA, LISTA_TIPOS_VISTA, TIPOS_VISTA, type AlturaFila, type TipoVista, type VistaBase } from "@/lib/base/vistas"
import { ICONO_TIPO, ICONO_VISTA, IconoCampo } from "@/components/app/base/apariencia"
import { IconoVista, RejillaIconosVista } from "@/components/app/base/iconos-vista"
import { BotonBarra } from "@/components/app/base/boton-barra"

export type AccionesVista = {
  renombrar: (nombre: string) => void
  duplicar: () => void
  /** Sin él no se borra: la de base. */
  borrar?: () => void
  cambiarTipo: (tipo: TipoVista) => void
  cambiarIcono: (icono: string) => void
}

/**
 * Una vista fija de la base, como la ven las pestañas y la barra: la pone la página, va la primera con su candado y no
 * se borra, no cambia de nombre ni se configura (Xavier, 2026-10-19: «Propuestas de Astratic»).
 */
export type VistaFijaMenu = { id: string; nombre: string; icono?: LucideIcon }

/** Las vistas fijas, para las pestañas y la barra: cuál está abierta y cómo se abre una. */
export type FijasDeBase = { vistas: VistaFijaMenu[]; activa: string | null; onActivar: (id: string) => void }

/** Algo que la página añade a los ajustes de su base: las automatizaciones, los valores de serie de la tabla. */
export type AjusteDeBase = { id: string; label: string; icono: LucideIcon; descripcion?: string; onSelect: () => void }

/**
 * El icono y el nombre de la vista abierta, a la izquierda de la barra. El nombre se escribe ahí mismo; el icono abre el
 * menú de la vista: de qué tipo es, su icono, duplicarla y eliminarla.
 */
export function NombreVista({ vista, acciones, fijas, enfocar, onEnfocado }: { vista: VistaBase; acciones: AccionesVista; fijas?: FijasDeBase; enfocar?: boolean; onEnfocado?: () => void }) {
  const [escrito, setEscrito] = React.useState<string | null>(null)
  const campo = React.useRef<HTMLInputElement>(null)
  const fija = fijas?.vistas.find((f) => f.id === fijas.activa)
  const tipo = vista.tipo ?? "cuadricula"

  React.useEffect(() => {
    if (!enfocar) return
    campo.current?.focus()
    campo.current?.select()
    onEnfocado?.()
  }, [enfocar, onEnfocado])

  if (fija) {
    const IconoFija = fija.icono
    return (
      <span className="inline-flex h-8 min-w-0 items-center gap-2 px-1.5 text-[13px] font-medium">
        {IconoFija ? <IconoFija className="size-4 flex-none text-brand" /> : <LockIcon className="size-4 flex-none text-brand" />}
        <span className="truncate">{fija.nombre}</span>
        <LockIcon className="size-3 flex-none text-muted-foreground" aria-label="Vista fija" />
      </span>
    )
  }

  const guardar = () => {
    if (escrito !== null && escrito.trim() && escrito.trim() !== vista.nombre) acciones.renombrar(escrito)
    setEscrito(null)
  }

  return (
    <div className="flex min-w-0 items-center gap-0.5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label="Opciones de la vista" title="Tipo, icono y opciones de la vista" className="flex size-8 flex-none items-center justify-center rounded-lg hover:bg-muted aria-expanded:bg-muted">
            <IconoVista vista={vista} className="size-4 text-brand" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Ver como</DropdownMenuLabel>
          {LISTA_TIPOS_VISTA.map((t) => {
            const Icono = ICONO_VISTA[t]
            return (
              <DropdownMenuItem key={t} onSelect={() => acciones.cambiarTipo(t)}>
                <Icono className="text-brand" />
                <span className="flex-1">{TIPOS_VISTA[t].label}</span>
                {t === tipo && <CheckIcon />}
              </DropdownMenuItem>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <SmilePlusIcon /> Cambiar el icono
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-auto p-2">
              <RejillaIconosVista valor={vista.icono} onElegir={acciones.cambiarIcono} />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
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
      <input
        ref={campo}
        aria-label="Nombre de la vista"
        value={escrito ?? vista.nombre}
        onChange={(e) => setEscrito(e.target.value)}
        onBlur={guardar}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur()
          if (e.key === "Escape") {
            setEscrito(null)
            e.currentTarget.blur()
          }
        }}
        className="h-8 max-w-64 min-w-16 truncate rounded-lg bg-transparent px-1.5 text-[13px] font-medium outline-none [field-sizing:content] hover:bg-muted focus:bg-card focus:ring-2 focus:ring-ring/40"
      />
    </div>
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

export function MenuAltura({ altura, onCambiar }: { altura: AlturaFila; onCambiar: (parcial: Partial<VistaBase>) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BotonBarra icono={UnfoldVerticalIcon} texto="Altura de la fila" soloIcono />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {(Object.keys(ALTURAS_FILA) as AlturaFila[]).map((a) => (
          <DropdownMenuItem key={a} onSelect={() => onCambiar({ altura: a })}>
            <span className="flex-1">{ALTURAS_FILA[a].label}</span>
            {a === altura && <CheckIcon />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * Los ajustes de la base, siempre al final de su barra: lo que la página añade (automatizaciones, valores de serie de
 * la tabla) y lo de cómo se ve (encabezados en varias líneas, la ficha al lado de la tabla).
 */
export function AjustesBase({ vista, onCambiar, ajustes, panelFicha, fija }: { vista: VistaBase; onCambiar: (parcial: Partial<VistaBase>) => void; ajustes?: AjusteDeBase[]; panelFicha?: { activo: boolean; onAlternar: () => void }; fija?: boolean }) {
  const cuadricula = (vista.tipo ?? "cuadricula") === "cuadricula"
  const hayPropios = !!ajustes?.length
  const hayVista = !fija && cuadricula
  if (!hayPropios && !hayVista && !panelFicha) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BotonBarra icono={SettingsIcon} texto="Ajustes de la base" soloIcono className="ml-0.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Ajustes de la base</DropdownMenuLabel>
        {ajustes?.map(({ id, label, icono: Icono, descripcion, onSelect }) => (
          <DropdownMenuItem key={id} className="items-start" onSelect={onSelect}>
            <Icono className="mt-0.5" />
            <span className="grid gap-0.5">
              <span>{label}</span>
              {descripcion && <span className="text-xs text-muted-foreground">{descripcion}</span>}
            </span>
          </DropdownMenuItem>
        ))}
        {hayPropios && (hayVista || panelFicha) && <DropdownMenuSeparator />}
        {hayVista && (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              onCambiar({ ajustarCabeceras: !vista.ajustarCabeceras })
            }}
          >
            <WrapTextIcon />
            <span className="flex-1">Encabezados en varias líneas</span>
            <Switch size="sm" checked={!!vista.ajustarCabeceras} tabIndex={-1} aria-hidden />
          </DropdownMenuItem>
        )}
        {panelFicha && (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              panelFicha.onAlternar()
            }}
          >
            <PanelRightIcon />
            <span className="flex-1">Abrir la ficha al lado de la tabla</span>
            <Switch size="sm" checked={panelFicha.activo} tabIndex={-1} aria-hidden />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** La lupa: al pulsarla se abre el buscador; Escape lo cierra y lo vacía. */
export function Buscador({ valor, onCambiar }: { valor: string; onCambiar: (q: string) => void }) {
  const [abierto, setAbierto] = React.useState(valor !== "")
  if (!abierto) return <BotonBarra icono={SearchIcon} texto="Buscar" soloIcono onClick={() => setAbierto(true)} />
  return (
    <label className={cn("flex h-8 w-52 flex-none items-center gap-1.5 rounded-lg border bg-card px-2")}>
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
