"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, PlusIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ColorOpcion } from "@/lib/base/campos"
import type { StatusTone } from "@/lib/status"
import { FichaOpcion, FichaVinculo } from "@/components/app/base/apariencia"

export type OpcionElegible = { value: string; label: string; color?: ColorOpcion; tono?: StatusTone }

// Los desplegables son modales: dentro de un diálogo (el formulario de alta), el diálogo no les quita el foco.

const sinAcentos = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim()

/**
 * La lista con buscador. Con `onCrear`, escribir algo que no existe ofrece «Crear «…»» (una opción
 * nueva del campo, que se elige al momento); devuelve el id de la nueva o nada si no se pudo.
 */
function Lista({ opciones, marcadas, onElegir, vinculo, onCrear }: { opciones: OpcionElegible[]; marcadas: string[]; onElegir: (id: string) => void; vinculo?: string; onCrear?: (label: string) => string | null }) {
  const [busqueda, setBusqueda] = React.useState("")
  const texto = busqueda.trim()
  const existe = opciones.some((o) => sinAcentos(o.label) === sinAcentos(texto))
  const crear = () => {
    const id = onCrear?.(texto)
    if (!id) return
    setBusqueda("")
    onElegir(id)
  }
  return (
    <Command>
      <CommandInput placeholder={vinculo ? `Busca una ${vinculo}` : onCrear ? "Busca o crea una opción" : "Encuentra una opción"} autoFocus value={busqueda} onValueChange={setBusqueda} />
      <CommandList className="max-h-64">
        <CommandEmpty>{vinculo ? `Ninguna ${vinculo} se llama así` : onCrear ? "Escribe para crear una opción" : "Ninguna opción se llama así"}</CommandEmpty>
        <CommandGroup>
          {opciones.map((o) => (
            <CommandItem key={o.value} value={`${o.label} ${o.value}`} onSelect={() => onElegir(o.value)}>
              {vinculo ? <FichaVinculo label={o.label} /> : <FichaOpcion label={o.label} color={o.color} tono={o.tono} />}
              {marcadas.includes(o.value) && <CheckIcon className="ml-auto size-3.5" />}
            </CommandItem>
          ))}
          {onCrear && texto && !existe && (
            <CommandItem value={`crear ${texto}`} onSelect={crear}>
              <PlusIcon className="size-3.5" /> Crear «{texto}»
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

/**
 * Elegir una opción de una lista con buscador, con su ficha de color (filtros y formularios de la
 * base). Con `vinculo` («marca»), los registros de otra base, con su ficha de registro.
 */
export function ElegirOpcion({ opciones, valor, onChange, placeholder, vinculo, onCrear, className }: { opciones: OpcionElegible[]; valor: string | undefined; onChange: (v: string | undefined) => void; placeholder?: string; vinculo?: string; onCrear?: (label: string) => string | null; className?: string }) {
  const [abierto, setAbierto] = React.useState(false)
  const opcion = opciones.find((o) => o.value === valor)
  return (
    <Popover open={abierto} onOpenChange={setAbierto} modal>
      <PopoverTrigger asChild>
        <button type="button" className={cn("flex h-8 min-w-0 items-center justify-between gap-1 px-2 text-left text-[13px] hover:bg-muted/60", className)}>
          {opcion && vinculo ? <FichaVinculo label={opcion.label} /> : opcion ? <FichaOpcion label={opcion.label} color={opcion.color} tono={opcion.tono} /> : <span className="truncate text-muted-foreground">{placeholder ?? (vinculo ? `Elige una ${vinculo}` : "Selecciona una opción")}</span>}
          <ChevronDownIcon className="size-3.5 flex-none text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Lista
          opciones={opciones}
          marcadas={valor ? [valor] : []}
          vinculo={vinculo}
          onCrear={onCrear}
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
export function ElegirOpciones({ opciones, valores, onChange, placeholder = "Selecciona opciones", onCrear, className }: { opciones: OpcionElegible[]; valores: string[]; onChange: (v: string[]) => void; placeholder?: string; onCrear?: (label: string) => string | null; className?: string }) {
  const [abierto, setAbierto] = React.useState(false)
  const alternar = (id: string) => onChange(valores.includes(id) ? valores.filter((v) => v !== id) : [...valores, id])
  return (
    <div className={cn("flex min-h-8 min-w-0 flex-wrap items-center gap-1 px-1.5 py-1", className)}>
      {valores.map((id) => {
        const o = opciones.find((x) => x.value === id)
        return (
          <FichaOpcion key={id} label={o?.label ?? id} color={o?.color} tono={o?.tono}>
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
          <Lista opciones={opciones} marcadas={valores} onElegir={alternar} onCrear={onCrear} />
        </PopoverContent>
      </Popover>
      {valores.length === 0 && <span className="text-[13px] text-muted-foreground">{placeholder}</span>}
    </div>
  )
}
