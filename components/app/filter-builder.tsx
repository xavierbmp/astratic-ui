"use client"

import * as React from "react"
import { ChevronDownIcon, PlusIcon, SettingsIcon, SlidersHorizontalIcon, StarIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { contarCondiciones, describirCondicion, describirGrupo, grupoVacio, type CampoFiltrable, type GrupoCondiciones } from "@/lib/filtros/core"
import { PanelFiltro } from "@/components/app/base/panel-filtro"
import { camposMenuDeFiltrables } from "@/components/app/base/selector-campo"

/**
 * El botón «Filtros» de la toolbar: abre el editor de filtros de Airtable (`PanelFiltro`, el mismo
 * de las bases), con condiciones unidas con «y» u «o» y grupos dentro, hasta tres niveles.
 *
 * Es controlado: el grupo de condiciones vive donde lo use la página (normalmente en la URL) y
 * aquí solo se edita. Los filtros rápidos escriben en este mismo grupo, así que todo lo activo
 * se ve junto en los chips.
 */
export function FilterBuilder<T>({
  campos,
  value,
  onChange,
  objeto = "registros",
  onCrearCampo,
  onGuardarRapido,
  onEditarRapidos,
  etiqueta = "Filtros",
  variant = "outline",
}: {
  campos: CampoFiltrable<T>[]
  value: GrupoCondiciones
  onChange: (next: GrupoCondiciones) => void
  /** Para el texto de cabecera: «Mostrar las empresas que cumplen…». */
  objeto?: string
  /** Si se pasa, el selector de campo ofrece crear uno nuevo. */
  onCrearCampo?: () => void
  /** Si se pasa, se puede guardar el filtro actual como rápido. */
  onGuardarRapido?: (grupo: GrupoCondiciones) => void
  /** Si se pasa, desde aquí se eligen los filtros rápidos que se ven en la toolbar. */
  onEditarRapidos?: () => void
  /** El texto del botón: «Filtros» en la toolbar, «Filtro de la vista» en la cabecera de una vista. */
  etiqueta?: string
  /** `ghost` para ir junto a «Ordenar» y «Agrupar» en la cabecera de una vista. */
  variant?: "outline" | "ghost"
}) {
  const [open, setOpen] = React.useState(false)
  const n = contarCondiciones(value)
  const conGrupos = (value.grupos ?? []).length > 0

  const camposMenu = React.useMemo(() => camposMenuDeFiltrables(campos), [campos])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          data-active={n > 0 || undefined}
          className={cn("h-8 flex-none gap-1.5 text-sm", n > 0 && variant === "outline" && "border-foreground/30 bg-muted/60", n > 0 && "text-foreground")}
        >
          <SlidersHorizontalIcon />
          <span>{etiqueta}</span>
          {n > 0 && <span className="rounded-sm bg-foreground px-1.5 text-xs font-medium text-background tabular-nums">{n}</span>}
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <PanelFiltro
          campos={camposMenu}
          value={value}
          onChange={onChange}
          objeto={objeto}
          pie={
            <>
              {/* Un rápido guarda una lista plana de condiciones: con grupos dentro no se puede. */}
              {onGuardarRapido && n > 0 && !conGrupos && (
                <Button variant="ghost" size="sm" onClick={() => onGuardarRapido(value)}>
                  <StarIcon /> Guardar como rápido
                </Button>
              )}
              {onEditarRapidos && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => {
                    setOpen(false)
                    onEditarRapidos()
                  }}
                >
                  <SettingsIcon /> Filtros rápidos
                </Button>
              )}
            </>
          }
        />
        {onCrearCampo && (
          <div className="border-t px-4 py-2">
            <Button variant="ghost" size="sm" onClick={() => { setOpen(false); onCrearCampo() }}>
              <PlusIcon /> Crear campo nuevo
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function agruparCampos<T>(campos: CampoFiltrable<T>[]): Array<[string, CampoFiltrable<T>[]]> {
  const mapa = new Map<string, CampoFiltrable<T>[]>()
  for (const c of campos) {
    const g = c.grupo ?? "Campos"
    const lista = mapa.get(g)
    if (lista) lista.push(c)
    else mapa.set(g, [c])
  }
  return [...mapa.entries()]
}

/** Chips de las condiciones activas, para `ActiveFilters`. Cada grupo de dentro va en un chip entero. */
export function chipsDeGrupo<T>(
  grupo: GrupoCondiciones,
  campos: CampoFiltrable<T>[],
  onChange: (next: GrupoCondiciones) => void,
): { label: string; onRemove: () => void }[] {
  const grupos = grupo.grupos ?? []
  return [
    ...grupo.condiciones.map((c, i) => ({
      label: describirCondicion(c, campos),
      onRemove: () => onChange({ ...grupo, condiciones: grupo.condiciones.filter((_, j) => j !== i) }),
    })),
    ...grupos
      .map((g, i) => ({ g, i }))
      .filter(({ g }) => !grupoVacio(g))
      .map(({ g, i }) => ({
        label: describirGrupo(g, campos),
        onRemove: () => onChange({ ...grupo, grupos: grupos.filter((_, j) => j !== i) }),
      })),
  ]
}
