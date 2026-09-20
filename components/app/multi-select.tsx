"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { StatusBadge } from "@/components/app/status-badge"
import type { StatusTone } from "@/lib/status"

export type MultiOption = { value: string; label: string; tone?: StatusTone }

/** Selección múltiple con buscador, para etiquetas y líneas en formularios. */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar…",
  emptyText = "Sin opciones",
  className,
  disabled,
}: {
  options: MultiOption[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const selected = options.filter((o) => value.includes(o.value))
  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
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
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) min-w-56 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar…" />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => {
                const on = value.includes(o.value)
                return (
                  <CommandItem key={o.value} value={o.label} onSelect={() => toggle(o.value)}>
                    <span className={cn("grid size-4 place-items-center rounded-sm border", on && "border-foreground bg-foreground text-background")}>
                      {on && <CheckIcon className="size-3" />}
                    </span>
                    {o.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
