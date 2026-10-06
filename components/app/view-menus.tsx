"use client"

import * as React from "react"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowUpDownIcon, EllipsisIcon, EyeIcon, EyeOffIcon, GripVerticalIcon, Rows3Icon, PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { agruparCampos } from "@/components/app/filter-builder"
import type { CampoFiltrable } from "@/lib/filtros/core"
import { DISENOS_VISTA, MODOS_FECHA, type Agrupacion, type AjustesVista, type DisenoVista, type ModoFecha, type ModoSubtareas, type Orden, type OrdenGrupos, type Vista } from "@/lib/vistas/core"

const SIN_AGRUPAR = "__ninguno"

/** El número en gris de un botón con algo puesto: «Ordenar 2». */
function Cuenta({ n }: { n: number }) {
  if (n === 0) return null
  return <span className="rounded-sm bg-foreground px-1.5 text-xs font-medium text-background tabular-nums">{n}</span>
}

function SelectorCampo<T>({ campos, value, onChange, className, sinValor }: { campos: CampoFiltrable<T>[]; value: string; onChange: (id: string) => void; className?: string; sinValor?: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger size="sm" className={cn("h-8 text-xs", className)}>
        <SelectValue placeholder="Elegir campo" />
      </SelectTrigger>
      <SelectContent>
        {sinValor && <SelectItem value={SIN_AGRUPAR}>{sinValor}</SelectItem>}
        {agruparCampos(campos).map(([grupo, items]) => (
          <SelectGroup key={grupo}>
            <SelectLabel>{grupo}</SelectLabel>
            {items.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

// ---------- Ordenar ----------

/**
 * Ordenar por varios criterios, como en Notion: manda el primero, los demás desempatan y se
 * arrastran para cambiar cuál manda. Sin criterios, las filas van en el orden en que se colocan.
 */
export function OrdenMenu<T>({ orden, campos, onChange }: { orden: Orden[]; campos: CampoFiltrable<T>[]; onChange: (o: Orden[]) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const dndId = React.useId()
  const libre = campos.find((c) => !orden.some((o) => o.campo === c.id))
  const alSoltar = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return
    const ids = orden.map((o) => o.campo)
    onChange(arrayMove(orden, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id))))
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("h-8 gap-1.5", orden.length > 0 && "text-foreground")}>
          <ArrowUpDownIcon /> Ordenar <Cuenta n={orden.length} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,26rem)] p-0">
        <div className="border-b px-3 py-2 text-xs text-muted-foreground">
          {orden.length === 0 ? "Sin orden: van en el orden en que las colocas." : "Manda el primero; los demás desempatan. Arrástralos para cambiarlo."}
        </div>
        {orden.length > 0 && (
          <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={alSoltar}>
            <SortableContext items={orden.map((o) => o.campo)} strategy={verticalListSortingStrategy}>
              <ul className="flex flex-col gap-1.5 p-3">
                {orden.map((o, i) => (
                  <FilaOrden
                    key={o.campo}
                    orden={o}
                    campos={campos.filter((c) => c.id === o.campo || !orden.some((x) => x.campo === c.id))}
                    onChange={(cambio) => onChange(orden.map((x, j) => (j === i ? { ...x, ...cambio } : x)))}
                    onQuitar={() => onChange(orden.filter((_, j) => j !== i))}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        )}
        <div className="flex items-center gap-1 border-t px-2 py-2">
          <Button variant="ghost" size="sm" disabled={!libre} onClick={() => libre && onChange([...orden, { campo: libre.id, dir: "asc" }])}>
            <PlusIcon /> Añadir orden
          </Button>
          {orden.length > 0 && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onChange([])}>
              <Trash2Icon /> Quitar orden
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function FilaOrden<T>({ orden, campos, onChange, onQuitar }: { orden: Orden; campos: CampoFiltrable<T>[]; onChange: (c: Partial<Orden>) => void; onQuitar: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: orden.campo })
  const tipo = campos.find((c) => c.id === orden.campo)?.tipo
  // Las listas se ordenan por sus opciones: «de la primera a la última» dice más que «ascendente».
  const etiquetas = tipo === "fecha" ? ["Más antigua primero", "Más reciente primero"] : tipo === "select" || tipo === "multiselect" ? ["De la primera a la última", "De la última a la primera"] : tipo === "numero" ? ["De menor a mayor", "De mayor a menor"] : ["Ascendente", "Descendente"]
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className="flex items-center gap-1.5">
      <button type="button" aria-label="Arrastrar para cambiar el orden" className="cursor-grab text-muted-foreground" {...attributes} {...listeners}>
        <GripVerticalIcon className="size-4" />
      </button>
      <SelectorCampo campos={campos} value={orden.campo} onChange={(campo) => onChange({ campo })} className="w-40" />
      <Select value={orden.dir} onValueChange={(dir) => onChange({ dir: dir === "desc" ? "desc" : "asc" })}>
        <SelectTrigger size="sm" className="h-8 flex-1 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">{etiquetas[0]}</SelectItem>
          <SelectItem value="desc">{etiquetas[1]}</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon-sm" aria-label="Quitar este orden" className="text-muted-foreground" onClick={onQuitar}>
        <XIcon />
      </Button>
    </li>
  )
}

// ---------- Agrupar ----------

/**
 * Agrupar por un campo, como en Notion: las fechas, en tramos desde hoy o por día, semana o mes;
 * los grupos, en el orden de sus opciones o alfabético; los vacíos se pueden esconder y cada
 * grupo se enseña u oculta con su ojo.
 */
export function AgruparMenu<T>({
  etiqueta = "Agrupar",
  agrupar,
  campos,
  grupos,
  onChange,
}: {
  etiqueta?: string
  agrupar?: Agrupacion
  campos: CampoFiltrable<T>[]
  /** Todos los grupos de la agrupación actual, también los ocultos, con su número de filas. */
  grupos: { id: string; label: string; n: number }[]
  onChange: (a: Agrupacion | undefined) => void
}) {
  const agrupables = campos.filter((c) => c.tipo !== "texto")
  const campo = agrupar ? campos.find((c) => c.id === agrupar.campo) : undefined
  const ocultos = new Set(agrupar?.ocultos ?? [])
  const cambiar = (cambio: Partial<Agrupacion>) => agrupar && onChange({ ...agrupar, ...cambio })
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("h-8 gap-1.5", agrupar && "text-foreground")}>
          <Rows3Icon /> {etiqueta}
          {campo && <span className="max-w-24 truncate text-xs text-muted-foreground">{campo.label}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,22rem)] p-0">
        <div className="grid gap-3 p-3">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">Agrupar por</Label>
            <SelectorCampo
              campos={agrupables}
              value={agrupar?.campo ?? SIN_AGRUPAR}
              sinValor="Sin agrupar"
              onChange={(id) => onChange(id === SIN_AGRUPAR ? undefined : { campo: id })}
              className="w-full"
            />
          </div>
          {agrupar && campo?.tipo === "fecha" && (
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Fechas</Label>
              <Select value={agrupar.modoFecha ?? "relativo"} onValueChange={(v) => cambiar({ modoFecha: v as ModoFecha, ocultos: [] })}>
                <SelectTrigger size="sm" className="h-8 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MODOS_FECHA) as ModoFecha[]).map((m) => (
                    <SelectItem key={m} value={m}>
                      {MODOS_FECHA[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {agrupar && (
            <div className="grid gap-1.5">
              <Label className="text-xs text-muted-foreground">Orden de los grupos</Label>
              <Select value={agrupar.ordenGrupos ?? "opciones"} onValueChange={(v) => cambiar({ ordenGrupos: v as OrdenGrupos })}>
                <SelectTrigger size="sm" className="h-8 w-full text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="opciones">{campo?.tipo === "fecha" ? "Por fecha" : "El de sus opciones"}</SelectItem>
                  <SelectItem value="asc">Alfabético, de la A a la Z</SelectItem>
                  <SelectItem value="desc">Alfabético, de la Z a la A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {agrupar && (
            <label className="flex items-center justify-between gap-2 text-sm">
              Ocultar los grupos vacíos
              <Switch checked={!!agrupar.ocultarVacios} onCheckedChange={(v) => cambiar({ ocultarVacios: v })} />
            </label>
          )}
        </div>
        {agrupar && grupos.length > 0 && (
          <div className="border-t">
            <div className="flex items-center justify-between px-3 pt-2 text-xs text-muted-foreground">
              Grupos
              {ocultos.size > 0 && (
                <button type="button" className="hover:text-foreground hover:underline" onClick={() => cambiar({ ocultos: [] })}>
                  Mostrar todos
                </button>
              )}
            </div>
            <ul className="max-h-60 overflow-y-auto p-1.5">
              {grupos.map((g) => {
                const oculto = ocultos.has(g.id)
                return (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => cambiar({ ocultos: oculto ? [...ocultos].filter((x) => x !== g.id) : [...ocultos, g.id] })}
                      className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted", oculto && "text-muted-foreground")}
                    >
                      {oculto ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                      <span className="flex-1 truncate">{g.label}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">{g.n}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

// ---------- Cambios sin guardar ----------

/** Aviso de que el filtro o el orden de la vista se han cambiado sin guardar, con sus dos salidas. */
export function CambiosVista({ visible, onGuardar, onRestablecer }: { visible: boolean; onGuardar: () => void; onRestablecer: () => void }) {
  if (!visible) return null
  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-4 py-1.5 text-xs text-muted-foreground">
      Has cambiado el filtro o el orden de esta vista.
      <span className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onRestablecer}>
          Restablecer
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onGuardar}>
          Guardar en la vista
        </Button>
      </span>
    </div>
  )
}

// ---------- Ajustes de la vista ----------

const MODOS_SUBTAREAS: Record<ModoSubtareas, string> = { anidadas: "Debajo de su tarea", planas: "Todas sueltas", principales: "Solo las principales" }

/**
 * El «…» de una vista: su diseño, cómo se enseñan las subtareas y a cuáles se aplica el filtro, y
 * lo propio de cada diseño (ajustar texto y congelar la primera columna en la tabla; qué fecha
 * manda, mes o semana y fines de semana en el calendario).
 */
export function AjustesVistaMenu({
  vista,
  disenos,
  camposFecha,
  conSubtareas = true,
  onCambiar,
}: {
  vista: Vista
  disenos: DisenoVista[]
  /** Los campos de fecha que pueden mandar en el calendario. */
  camposFecha?: { id: string; label: string }[]
  conSubtareas?: boolean
  onCambiar: (cambio: Partial<Vista>) => void
}) {
  const ajustes = vista.ajustes
  const ajustar = (cambio: Partial<AjustesVista>) => onCambiar({ ajustes: { ...ajustes, ...cambio } })
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Ajustes de la vista">
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>Vista «{vista.nombre}»</DropdownMenuLabel>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Diseño: {DISENOS_VISTA[vista.diseno]}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={vista.diseno} onValueChange={(d) => onCambiar({ diseno: d as DisenoVista })}>
              {disenos.map((d) => (
                <DropdownMenuRadioItem key={d} value={d}>
                  {DISENOS_VISTA[d]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        {conSubtareas && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Subtareas: {MODOS_SUBTAREAS[ajustes.subtareas ?? "anidadas"].toLowerCase()}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={ajustes.subtareas ?? "anidadas"} onValueChange={(m) => ajustar({ subtareas: m as ModoSubtareas })}>
                {(Object.keys(MODOS_SUBTAREAS) as ModoSubtareas[]).map((m) => (
                  <DropdownMenuRadioItem key={m} value={m}>
                    {MODOS_SUBTAREAS[m]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">El filtro se aplica a</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={ajustes.filtroSubtareas ?? "principales"} onValueChange={(f) => ajustar({ filtroSubtareas: f === "todas" ? "todas" : "principales" })}>
                <DropdownMenuRadioItem value="principales">Solo las principales</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="todas">Todas, también las subtareas</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        {vista.diseno === "tabla" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={!!ajustes.ajustarTexto} onCheckedChange={(v) => ajustar({ ajustarTexto: v === true })}>
              Ajustar el texto de las celdas
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={ajustes.congelar !== 0} onCheckedChange={(v) => ajustar({ congelar: v === true ? 1 : 0 })}>
              Primera columna fija
            </DropdownMenuCheckboxItem>
          </>
        )}
        {vista.diseno === "calendario" && (
          <>
            <DropdownMenuSeparator />
            {camposFecha && camposFecha.length > 1 && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Por: {camposFecha.find((c) => c.id === (ajustes.calendarioPor ?? camposFecha[0].id))?.label}</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={ajustes.calendarioPor ?? camposFecha[0].id} onValueChange={(c) => ajustar({ calendarioPor: c })}>
                    {camposFecha.map((c) => (
                      <DropdownMenuRadioItem key={c.id} value={c.id}>
                        {c.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            <DropdownMenuRadioGroup value={ajustes.calendarioModo ?? "mes"} onValueChange={(m) => ajustar({ calendarioModo: m === "semana" ? "semana" : "mes" })}>
              <DropdownMenuRadioItem value="mes">Mes</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="semana">Semana</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
            <DropdownMenuCheckboxItem checked={ajustes.finesDeSemana !== false} onCheckedChange={(v) => ajustar({ finesDeSemana: v === true })}>
              Fines de semana
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
