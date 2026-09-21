"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, Loader2Icon, PlusIcon, Settings2Icon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { StatusBadge } from "@/components/app/status-badge"
import type { StatusTone } from "@/lib/status"

export type MultiOption = { value: string; label: string; tone?: StatusTone }

/**
 * Selección múltiple con buscador, para etiquetas y líneas en formularios.
 *
 * Las opciones se gestionan desde aquí mismo, como en Notion: con `onCreate`, escribir algo que no
 * existe ofrece crearlo; con `onManage`, el pie del desplegable abre su configuración (renombrar,
 * color, borrar).
 *
 * `variant="inline"` es la versión de las fichas: en reposo se leen las insignias, sin caja ni
 * flecha, y el desplegable se abre al pulsarlas (lo usa `InlineField`).
 */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar…",
  emptyText = "Sin opciones",
  className,
  disabled,
  onCreate,
  onManage,
  manageLabel = "Gestionar opciones",
  variant = "default",
  defaultOpen = false,
  renderValue,
}: {
  options: MultiOption[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  /** Crea una opción con el texto buscado. Devuelve la opción nueva, o nada si no se pudo. */
  onCreate?: (texto: string) => Promise<MultiOption | null>
  onManage?: () => void
  manageLabel?: string
  variant?: "default" | "inline"
  /** Arranca con el desplegable abierto (al añadir un campo vacío desde la ficha). */
  defaultOpen?: boolean
  /** `inline`: cómo se pintan en reposo los valores elegidos (insignias con su color). */
  renderValue?: (selected: MultiOption[]) => React.ReactNode
}) {
  const [open, setOpen] = React.useState(defaultOpen)
  const [busqueda, setBusqueda] = React.useState("")
  const [creando, setCreando] = React.useState(false)
  // Lo recién creado llega en `options` con el siguiente refresco: mientras, se pinta desde aquí.
  const [creadas, setCreadas] = React.useState<MultiOption[]>([])
  const todas = React.useMemo(() => [...options, ...creadas.filter((c) => !options.some((o) => o.value === c.value))], [options, creadas])
  const selected = todas.filter((o) => value.includes(o.value))
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  const texto = busqueda.trim()
  const ofrecerCrear = Boolean(onCreate && texto && !todas.some((o) => o.label.toLowerCase() === texto.toLowerCase()))

  const crear = async () => {
    if (!onCreate || !texto || creando) return
    setCreando(true)
    const nueva = await onCreate(texto)
    setCreando(false)
    if (!nueva) return
    setCreadas((c) => [...c, nueva])
    onChange([...value, nueva.value])
    setBusqueda("")
  }
  const gestionar = () => {
    setOpen(false)
    // Tras cerrar el desplegable, para que devolver el foco al botón no se lo quite al diálogo.
    setTimeout(() => onManage?.(), 0)
  }
  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setBusqueda("")
      }}
    >
      <PopoverTrigger asChild>
        {variant === "inline" ? (
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "-mx-1 flex min-h-7 w-[calc(100%+0.5rem)] min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60 aria-expanded:bg-muted",
              className,
            )}
          >
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <span className="flex min-w-0 flex-wrap gap-1">
                {renderValue ? renderValue(selected) : selected.map((o) => <StatusBadge key={o.value} tone={o.tone ?? "neutral"}>{o.label}</StatusBadge>)}
              </span>
            )}
          </button>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            role="combobox"
            aria-expanded={open}
            className={cn("h-auto min-h-9 w-full justify-start gap-1.5 px-2.5 py-1.5 font-normal", className)}
          >
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              <span className="flex flex-wrap gap-1">
                {selected.map((o) => (
                  <StatusBadge key={o.value} tone={o.tone ?? "neutral"} className="gap-1 pr-1">
                    {o.label}
                    <span
                      role="button"
                      tabIndex={-1}
                      aria-label={`Quitar ${o.label}`}
                      className="grid size-3.5 place-items-center rounded-sm hover:bg-foreground/10"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggle(o.value)
                      }}
                    >
                      <XIcon className="size-2.5" />
                    </span>
                  </StatusBadge>
                ))}
              </span>
            )}
            <ChevronDownIcon className="ml-auto size-4 flex-none text-muted-foreground" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder={onCreate ? "Buscar o crear…" : "Buscar…"} value={busqueda} onValueChange={setBusqueda} />
          <CommandList>
            {!ofrecerCrear && <CommandEmpty>{emptyText}</CommandEmpty>}
            <CommandGroup>
              {todas.map((o) => {
                const on = value.includes(o.value)
                return (
                  <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)}>
                    <span className={cn("grid size-4 place-items-center rounded-[4px] border border-control", on && "border-primary bg-primary text-primary-foreground")}>
                      {on && <CheckIcon className="size-3" />}
                    </span>
                    {o.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {ofrecerCrear && (
              <CommandGroup forceMount>
                <CommandItem forceMount value={`__crear__${texto}`} onSelect={() => void crear()} disabled={creando}>
                  {creando ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
                  <span className="truncate">Crear «{texto}»</span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        {onManage && (
          <div className="border-t p-1">
            <button
              type="button"
              onClick={gestionar}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground"
            >
              <Settings2Icon className="size-3.5" /> {manageLabel}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
