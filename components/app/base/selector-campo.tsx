"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { CampoFiltrable, TipoFiltro } from "@/lib/filtros/core"
import { TIPOS_CAMPO, type ColorOpcion, type DefCampo } from "@/lib/base/campos"
import type { StatusTone } from "@/lib/status"
import { ICONO_FILTRO, ICONO_TIPO, IconoCampo } from "@/components/app/base/apariencia"

/** Un campo tal como lo enseñan los menús de la base: su nombre, su icono y, en las listas, sus opciones con color. */
export type CampoMenu = {
  id: string
  label: string
  tipo: TipoFiltro
  icono: LucideIcon
  grupo?: string
  opciones?: { value: string; label: string; color?: ColorOpcion; tono?: StatusTone }[]
}

/** Los campos de una base para sus menús. */
export function camposMenuDeBase<T>(campos: DefCampo<T>[]): CampoMenu[] {
  return campos.map((c) => ({
    id: c.id,
    label: c.nombre,
    tipo: TIPOS_CAMPO[c.tipo].filtro,
    icono: ICONO_TIPO[c.tipo],
    grupo: c.grupo,
    opciones: c.opciones?.map((o) => ({ value: o.id, label: o.label, color: o.color, tono: o.tono })),
  }))
}

/** Los campos de un filtro de fuera de una base (solo se sabe su tipo de filtro). */
export function camposMenuDeFiltrables<T>(campos: CampoFiltrable<T>[]): CampoMenu[] {
  return campos.map((c) => ({ id: c.id, label: c.label, tipo: c.tipo, icono: ICONO_FILTRO[c.tipo], grupo: c.grupo, opciones: c.opciones }))
}


function agrupados(campos: CampoMenu[]): [string, CampoMenu[]][] {
  const mapa = new Map<string, CampoMenu[]>()
  for (const c of campos) {
    const g = c.grupo ?? ""
    mapa.set(g, [...(mapa.get(g) ?? []), c])
  }
  return [...mapa.entries()]
}

/** La lista de campos con buscador («Encuentra un campo»), como en los menús de Airtable. */
export function ListaCampos({
  campos,
  value,
  onElegir,
  autoFocus = true,
  className,
}: {
  campos: CampoMenu[]
  value?: string
  onElegir: (id: string) => void
  autoFocus?: boolean
  className?: string
}) {
  const grupos = agrupados(campos)
  return (
    <Command className={cn("bg-transparent", className)}>
      <CommandInput placeholder="Encuentra un campo" autoFocus={autoFocus} />
      <CommandList className="max-h-72">
        <CommandEmpty>Ningún campo se llama así</CommandEmpty>
        {grupos.map(([grupo, items]) => (
          <CommandGroup key={grupo || "campos"} heading={grupos.length > 1 && grupo ? grupo : undefined}>
            {items.map((c) => (
              <CommandItem key={c.id} value={`${c.label} ${c.id}`} onSelect={() => onElegir(c.id)}>
                <IconoCampo icono={c.icono} />
                <span className="flex-1 truncate">{c.label}</span>
                {c.id === value && <CheckIcon className="size-3.5" />}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  )
}

/** El botón de un campo dentro de una fila de un menú (filtro, orden, grupo): abre la lista con buscador. */
export function SelectorCampo({ campos, value, onChange, className }: { campos: CampoMenu[]; value: string; onChange: (id: string) => void; className?: string }) {
  const [abierto, setAbierto] = React.useState(false)
  const actual = campos.find((c) => c.id === value)
  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" role="combobox" aria-expanded={abierto} className={cn("h-8 w-40 flex-none justify-between gap-1.5 rounded-md px-2 text-[13px] font-normal", className)}>
          <span className="flex min-w-0 items-center gap-1.5">
            {actual && <IconoCampo icono={actual.icono} />}
            <span className="truncate">{actual?.label ?? "Elige un campo"}</span>
          </span>
          <ChevronDownIcon className="size-3.5 flex-none text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <ListaCampos
          campos={campos}
          value={value}
          onElegir={(id) => {
            onChange(id)
            setAbierto(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
