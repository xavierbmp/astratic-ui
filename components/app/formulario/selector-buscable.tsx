"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, PencilIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

/** Una opción con su cara: el logo o el avatar de un registro, el icono de un tipo. */
export type OpcionSelector = { value: string; label: string; detalle?: string; icono?: React.ReactNode; editable?: boolean }

const sinAcentos = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim()

/**
 * El desplegable de un formulario cuando las opciones tienen cara (marcas, personas, formatos):
 * enseña lo elegido con su icono, busca al escribir y, con `crear`, nunca deja a nadie sin salida:
 * si lo que busca no está, «Crear «…»» lo da de alta (y el pie, «+ Nueva marca», también). Con
 * `onEditar`, las opciones `editable` llevan un lápiz para cambiarlas.
 *
 * `tamano="sm"` es el de dentro de una fila (las piezas de una collab): más bajo y del ancho de lo
 * elegido.
 */
export function SelectorBuscable({
  id,
  opciones,
  valor,
  onChange,
  placeholder = "Elige una opción",
  buscar = "Busca…",
  vacio = "Nada se llama así",
  crear,
  onEditar,
  invalido,
  disabled,
  tamano = "md",
  className,
  "aria-label": ariaLabel,
}: {
  id?: string
  opciones: OpcionSelector[]
  valor: string | undefined
  onChange: (valor: string) => void
  placeholder?: string
  buscar?: string
  vacio?: string
  /** Dar de alta una opción nueva: `label` es el pie («Nueva marca»); recibe lo que se estaba buscando. */
  crear?: { label: string; onCrear: (texto: string) => void }
  onEditar?: (valor: string) => void
  invalido?: boolean
  disabled?: boolean
  tamano?: "md" | "sm"
  className?: string
  "aria-label"?: string
}) {
  const [abierto, setAbierto] = React.useState(false)
  const [busqueda, setBusqueda] = React.useState("")
  const elegida = opciones.find((o) => o.value === valor)
  const texto = busqueda.trim()
  const existe = opciones.some((o) => sinAcentos(o.label) === sinAcentos(texto))

  const abrir = (o: boolean) => {
    setAbierto(o)
    if (!o) setBusqueda("")
  }
  const darDeAlta = () => {
    abrir(false)
    crear?.onCrear(texto)
  }

  return (
    <Popover open={abierto} onOpenChange={abrir} modal>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          data-invalido={invalido || undefined}
          aria-label={ariaLabel}
          disabled={disabled}
          data-slot="selector-buscable"
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-lg border border-input bg-transparent text-left text-sm transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-invalido:border-destructive data-invalido:ring-3 data-invalido:ring-destructive/20 dark:bg-input/30",
            tamano === "md" ? "h-10 w-full px-3" : "h-8 max-w-full px-2 text-[13px]",
            className,
          )}
        >
          {elegida?.icono}
          <span className={cn("min-w-0 flex-1 truncate", !elegida && "text-muted-foreground")}>{elegida?.label ?? placeholder}</span>
          {elegida?.detalle && tamano === "md" && <span className="hidden max-w-[45%] truncate text-xs text-muted-foreground sm:inline">{elegida.detalle}</span>}
          <ChevronDownIcon className="size-4 flex-none text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-64 p-0">
        <Command>
          <CommandInput placeholder={buscar} value={busqueda} onValueChange={setBusqueda} />
          <CommandList className="max-h-72">
            <CommandEmpty>{crear && texto ? "No está todavía" : vacio}</CommandEmpty>
            <CommandGroup>
              {opciones.map((o) => (
                <CommandItem
                  key={o.value}
                  value={`${o.label} ${o.detalle ?? ""} ${o.value}`}
                  onSelect={() => {
                    onChange(o.value)
                    abrir(false)
                  }}
                  className="group/opcion gap-2.5 py-2"
                >
                  {o.icono}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{o.label}</span>
                    {o.detalle && <span className="block truncate text-xs text-muted-foreground">{o.detalle}</span>}
                  </span>
                  {o.editable && onEditar && (
                    <button
                      type="button"
                      aria-label={`Cambiar ${o.label}`}
                      className="grid size-6 place-items-center rounded-md text-muted-foreground opacity-0 group-hover/opcion:opacity-100 group-data-[selected=true]/opcion:opacity-100 hover:bg-background hover:text-foreground"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation()
                        abrir(false)
                        onEditar(o.value)
                      }}
                    >
                      <PencilIcon className="size-3.5" />
                    </button>
                  )}
                  {o.value === valor && <CheckIcon className="size-4 text-brand" />}
                </CommandItem>
              ))}
              {crear && texto && !existe && (
                <CommandItem value={`crear ${texto}`} onSelect={darDeAlta} className="gap-2.5 py-2">
                  <PlusIcon className="size-4 text-brand" /> Crear «{texto}»
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
          {/* Fuera de la lista: con muchas opciones, el alta sigue a la vista sin bajar. */}
          {crear && (
            <div className="border-t p-1">
              <button type="button" onClick={darDeAlta} className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-brand outline-none hover:bg-brand-soft focus-visible:bg-brand-soft">
                <PlusIcon className="size-4" /> {crear.label}
              </button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
