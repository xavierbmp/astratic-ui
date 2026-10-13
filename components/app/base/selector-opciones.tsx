"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, PlusIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ColorOpcion } from "@/lib/base/campos"
import { FichaOpcion } from "@/components/app/base/apariencia"

export type OpcionElegible = { value: string; label: string; color?: ColorOpcion }

// Los desplegables son modales: dentro de un diálogo (el formulario de alta), el diálogo no les quita el foco.

function Lista({ opciones, marcadas, onElegir }: { opciones: OpcionElegible[]; marcadas: string[]; onElegir: (id: string) => void }) {
  return (
    <Command>
      <CommandInput placeholder="Encuentra una opción" autoFocus />
      <CommandList className="max-h-64">
        <CommandEmpty>Ninguna opción se llama así</CommandEmpty>
        <CommandGroup>
          {opciones.map((o) => (
            <CommandItem key={o.value} value={`${o.label} ${o.value}`} onSelect={() => onElegir(o.value)}>
              <FichaOpcion label={o.label} color={o.color} />
              {marcadas.includes(o.value) && <CheckIcon className="ml-auto size-3.5" />}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

/** Elegir una opción de una lista con buscador, con su ficha de color (filtros y formularios de la base). */
export function ElegirOpcion({ opciones, valor, onChange, placeholder = "Selecciona una opción", className }: { opciones: OpcionElegible[]; valor: string | undefined; onChange: (v: string | undefined) => void; placeholder?: string; className?: string }) {
  const [abierto, setAbierto] = React.useState(false)
  const opcion = opciones.find((o) => o.value === valor)
  return (
    <Popover open={abierto} onOpenChange={setAbierto} modal>
      <PopoverTrigger asChild>
        <button type="button" className={cn("flex h-8 min-w-0 items-center justify-between gap-1 px-2 text-left text-[13px] hover:bg-muted/60", className)}>
          {opcion ? <FichaOpcion label={opcion.label} color={opcion.color} /> : <span className="truncate text-muted-foreground">{placeholder}</span>}
          <ChevronDownIcon className="size-3.5 flex-none text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Lista
          opciones={opciones}
          marcadas={valor ? [valor] : []}
          onElegir={(id) => {
            onChange(id === valor ? undefined : id)
            setAbierto(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

/** Elegir varias: las fichas elegidas (con su ✕) y un «+» que abre la lista. */
export function ElegirOpciones({ opciones, valores, onChange, placeholder = "Selecciona opciones", className }: { opciones: OpcionElegible[]; valores: string[]; onChange: (v: string[]) => void; placeholder?: string; className?: string }) {
  const [abierto, setAbierto] = React.useState(false)
  const alternar = (id: string) => onChange(valores.includes(id) ? valores.filter((v) => v !== id) : [...valores, id])
  return (
    <div className={cn("flex min-h-8 min-w-0 flex-wrap items-center gap-1 px-1.5 py-1", className)}>
      {valores.map((id) => {
        const o = opciones.find((x) => x.value === id)
        return (
          <FichaOpcion key={id} label={o?.label ?? id} color={o?.color}>
            <button type="button" aria-label={`Quitar ${o?.label ?? id}`} className="-mr-1 rounded-full opacity-60 hover:opacity-100" onClick={() => alternar(id)}>
              <XIcon className="size-3" />
            </button>
          </FichaOpcion>
        )
      })}
      <Popover open={abierto} onOpenChange={setAbierto} modal>
        <PopoverTrigger asChild>
          <button type="button" aria-label="Añadir una opción" className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
            <PlusIcon className="size-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-0">
          <Lista opciones={opciones} marcadas={valores} onElegir={alternar} />
        </PopoverContent>
      </Popover>
      {valores.length === 0 && <span className="text-[13px] text-muted-foreground">{placeholder}</span>}
    </div>
  )
}
