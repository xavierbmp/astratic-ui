"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import {
  CalendarDaysIcon,
  CheckIcon,
  ChevronDownIcon,
  Columns3Icon,
  LayoutGridIcon,
  ListIcon,
  SearchIcon,
  Table2Icon,
  XIcon,
} from "lucide-react"
import { cn } from "cn"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export function Toolbar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar"
      className={cn("flex flex-wrap items-center gap-2", className)}
      {...props}
    />
  )
}

/**
 * Final de la toolbar: conmutador de vistas y acción principal, pegados al borde derecho del bloque.
 * Con `ml-auto` siguen a la derecha también cuando la toolbar no cabe y pasan a una segunda línea.
 */
export function ToolbarActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-actions"
      className={cn("ml-auto flex flex-none items-center gap-2", className)}
      {...props}
    />
  )
}

export function ToolbarSearch({
  className,
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  return (
    <InputGroup className={cn("h-8 w-full bg-background sm:w-auto sm:max-w-64 sm:min-w-40 sm:flex-1", className)}>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput type="search" className="text-ellipsis" {...props} />
    </InputGroup>
  )
}

export type FilterOption = { value: string; label: string; count?: number }

export function FilterMenu({
  label,
  icon: Icon,
  options,
  value,
  onChange,
  multiple = true,
}: {
  label: string
  icon?: LucideIcon
  options: FilterOption[]
  value: string[]
  onChange: (next: string[]) => void
  multiple?: boolean
}) {
  const active = value.length > 0
  const summary =
    value.length === 1
      ? options.find((o) => o.value === value[0])?.label
      : value.length > 1
        ? `${value.length}`
        : undefined
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-active={active || undefined}
          className={cn("h-8 gap-1.5 text-sm", active && "border-foreground/30 bg-muted/60")}
        >
          {Icon && <Icon />}
          <span>{label}</span>
          {summary && (
            <span className="max-w-32 truncate rounded-sm bg-foreground px-1.5 text-xs font-medium text-background">
              {summary}
            </span>
          )}
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {multiple ? (
          options.map((o) => (
            <DropdownMenuCheckboxItem
              key={o.value}
              checked={value.includes(o.value)}
              onCheckedChange={(c) =>
                onChange(c ? [...value, o.value] : value.filter((v) => v !== o.value))
              }
              onSelect={(e) => e.preventDefault()}
            >
              <span className="flex-1">{o.label}</span>
              {o.count !== undefined && (
                <span className="text-xs tabular-nums text-muted-foreground">{o.count}</span>
              )}
            </DropdownMenuCheckboxItem>
          ))
        ) : (
          <DropdownMenuRadioGroup value={value[0] ?? ""} onValueChange={(v) => onChange(v ? [v] : [])}>
            {options.map((o) => (
              <DropdownMenuRadioItem key={o.value} value={o.value}>
                <span className="flex-1">{o.label}</span>
                {o.count !== undefined && (
                  <span className="text-xs tabular-nums text-muted-foreground">{o.count}</span>
                )}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
        {active && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={false}
              onSelect={() => onChange([])}
              className="text-muted-foreground"
            >
              <XIcon className="size-3.5" /> Quitar filtro
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ActiveFilters({
  chips,
  onClear,
}: {
  chips: { label: string; onRemove: () => void }[]
  onClear: () => void
}) {
  if (chips.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.onRemove}
          className="inline-flex h-6 items-center gap-1 rounded-full border bg-background px-2 text-foreground/80 transition-colors hover:bg-muted"
        >
          <CheckIcon className="size-3 text-muted-foreground" />
          {c.label}
          <XIcon className="size-3 text-muted-foreground" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="h-6 px-1.5 text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
      >
        Limpiar
      </button>
    </div>
  )
}

export type ViewKind = "table" | "list" | "kanban" | "calendar" | "grid"

const viewMeta: Record<ViewKind, { icon: LucideIcon; label: string }> = {
  table: { icon: Table2Icon, label: "Tabla" },
  list: { icon: ListIcon, label: "Lista" },
  kanban: { icon: Columns3Icon, label: "Kanban" },
  calendar: { icon: CalendarDaysIcon, label: "Calendario" },
  grid: { icon: LayoutGridIcon, label: "Tarjetas" },
}

export function ViewSwitcher<V extends ViewKind>({
  views,
  value,
  defaultValue,
  onChange,
  className,
}: {
  views: V[]
  value?: V
  defaultValue?: V
  onChange?: (v: V) => void
  className?: string
}) {
  const [inner, setInner] = React.useState<V>(defaultValue ?? views[0])
  const current = value ?? inner
  // Con una sola vista (p. ej. en móvil, cuando usePageView quita la tabla) no hay nada que conmutar.
  if (views.length < 2) return null
  return (
    <ToggleGroupPrimitive.Root
      type="single"
      value={current}
      onValueChange={(v) => {
        if (!v) return
        setInner(v as V)
        onChange?.(v as V)
      }}
      aria-label="Vista"
      data-slot="view-switcher"
      className={cn("inline-flex h-8 items-center rounded-lg bg-muted p-[3px]", className)}
    >
      {views.map((v) => {
        const { icon: Icon, label } = viewMeta[v]
        return (
          <Tooltip key={v}>
            <TooltipTrigger asChild>
              <ToggleGroupPrimitive.Item
                value={v}
                aria-label={label}
                className={cn(
                  "grid h-full w-7 place-items-center rounded-md border border-transparent text-foreground/60 transition-colors outline-none hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:text-muted-foreground dark:hover:text-foreground",
                  "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm dark:data-[state=on]:border-input dark:data-[state=on]:bg-input/30 dark:data-[state=on]:text-foreground"
                )}
              >
                <Icon className="size-4" aria-hidden />
              </ToggleGroupPrimitive.Item>
            </TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        )
      })}
    </ToggleGroupPrimitive.Root>
  )
}
