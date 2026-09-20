"use client"

import * as React from "react"
import { GripVerticalIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { FilterMenu } from "@/components/app/toolbar"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cumpleCondicion, describirCondicion, type CampoFiltrable, type Condicion, type GrupoCondiciones } from "@/lib/filtros/core"

/**
 * Filtros rápidos: los atajos de un clic que hay junto al buscador.
 *
 * Hay dos clases:
 *  - «campo»: un desplegable con las opciones de un campo de lista (Relación, Línea, Etiqueta…),
 *    como los de siempre.
 *  - «guardado»: una condición concreta que el usuario guarda con nombre («Sin contactos»,
 *    «Clientes sin responsable») y que se enciende y apaga con un botón.
 *
 * Los dos escriben en el mismo grupo de condiciones que el constructor de filtros, así que lo
 * activo siempre se ve junto en los chips y se puede afinar desde «Filtros».
 */
export type FiltroRapido =
  | { id: string; clase: "campo"; campo: string; label?: string }
  | { id: string; clase: "guardado"; label: string; union: "y" | "o"; condiciones: Condicion[] }

type ConfigRapidos = { orden: string[]; ocultos: string[]; propios: FiltroRapido[] }

const VACIA: ConfigRapidos = { orden: [], ocultos: [], propios: [] }

/** Lista de rápidos de la página: los que trae el código más los que ha creado el usuario. */
export function useQuickFilters(pageKey: string, porDefecto: FiltroRapido[]) {
  const [config, setConfig] = useLocalStorage<ConfigRapidos>(`rapidos:${pageKey}`, VACIA)

  const todos = React.useMemo(() => {
    const propios = config.propios ?? []
    const juntos = [...porDefecto, ...propios]
    const porId = new Map(juntos.map((r) => [r.id, r]))
    const vistos = new Set<string>()
    const out: FiltroRapido[] = []
    for (const id of config.orden ?? []) {
      const r = porId.get(id)
      if (r && !vistos.has(id)) {
        out.push(r)
        vistos.add(id)
      }
    }
    for (const r of juntos) if (!vistos.has(r.id)) out.push(r)
    return out
  }, [porDefecto, config.propios, config.orden])

  const ocultos = React.useMemo(() => new Set(config.ocultos ?? []), [config.ocultos])
  const visibles = React.useMemo(() => todos.filter((r) => !ocultos.has(r.id)), [todos, ocultos])

  const alternar = React.useCallback(
    (id: string, mostrar: boolean) =>
      setConfig((p) => ({ ...p, ocultos: mostrar ? (p.ocultos ?? []).filter((x) => x !== id) : [...new Set([...(p.ocultos ?? []), id])] })),
    [setConfig],
  )
  const reordenar = React.useCallback((ids: string[]) => setConfig((p) => ({ ...p, orden: ids })), [setConfig])
  const anadir = React.useCallback(
    (r: FiltroRapido) => setConfig((p) => ({ ...p, propios: [...(p.propios ?? []), r], ocultos: (p.ocultos ?? []).filter((x) => x !== r.id) })),
    [setConfig],
  )
  const borrar = React.useCallback(
    (id: string) => setConfig((p) => ({ ...p, propios: (p.propios ?? []).filter((r) => r.id !== id), orden: (p.orden ?? []).filter((x) => x !== id) })),
    [setConfig],
  )
  const esPropio = React.useCallback((id: string) => (config.propios ?? []).some((r) => r.id === id), [config.propios])
  const restablecer = React.useCallback(() => setConfig(VACIA), [setConfig])

  return { visibles, todos, ocultos, alternar, reordenar, anadir, borrar, esPropio, restablecer }
}

export type QuickFiltersApi = ReturnType<typeof useQuickFilters>

export function QuickFilters<T>({
  api,
  campos,
  filas,
  value,
  onChange,
}: {
  api: QuickFiltersApi
  campos: CampoFiltrable<T>[]
  /** Filas que se están mostrando: sirven para los contadores de cada opción. */
  filas: T[]
  value: GrupoCondiciones
  onChange: (next: GrupoCondiciones) => void
}) {
  return (
    <>
      {api.visibles.map((r) =>
        r.clase === "campo" ? (
          <RapidoCampo key={r.id} rapido={r} campos={campos} filas={filas} value={value} onChange={onChange} />
        ) : (
          <RapidoGuardado key={r.id} rapido={r} campos={campos} value={value} onChange={onChange} />
        ),
      )}
    </>
  )
}

/** Desplegable de opciones de un campo de lista. Escribe una condición «es alguno de». */
function RapidoCampo<T>({
  rapido,
  campos,
  filas,
  value,
  onChange,
}: {
  rapido: Extract<FiltroRapido, { clase: "campo" }>
  campos: CampoFiltrable<T>[]
  filas: T[]
  value: GrupoCondiciones
  onChange: (next: GrupoCondiciones) => void
}) {
  const campo = campos.find((f) => f.id === rapido.campo)
  const condiciones = value.condiciones
  const i = condiciones.findIndex((c) => c.de === rapido.id)
  const actual = i >= 0 ? condiciones[i] : undefined
  const seleccion = Array.isArray(actual?.valor) ? actual.valor : actual?.valor ? [actual.valor] : []

  const opciones = React.useMemo(() => {
    if (!campo) return []
    return (campo.opciones ?? []).map((o) => ({
      value: o.value,
      label: o.label,
      count: filas.filter((r) => cumpleCondicion(r, { campo: campo.id, op: "alguno", valor: [o.value] }, campos)).length,
    }))
  }, [campo, campos, filas])

  if (!campo) return null

  const set = (valores: string[]) => {
    const sin = condiciones.filter((c) => c.de !== rapido.id)
    onChange({
      ...value,
      condiciones: valores.length ? [...sin, { campo: campo.id, op: "alguno", valor: valores, de: rapido.id }] : sin,
    })
  }

  return <FilterMenu label={rapido.label ?? campo.label} options={opciones} value={seleccion} onChange={set} />
}

/** Botón que enciende o apaga una condición guardada. */
function RapidoGuardado<T>({
  rapido,
  campos,
  value,
  onChange,
}: {
  rapido: Extract<FiltroRapido, { clase: "guardado" }>
  campos: CampoFiltrable<T>[]
  value: GrupoCondiciones
  onChange: (next: GrupoCondiciones) => void
}) {
  const activo = value.condiciones.some((c) => c.de === rapido.id)
  const resumen = rapido.condiciones.map((c) => describirCondicion(c, campos)).join(rapido.union === "o" ? " o " : " y ")
  return (
    <Button
      variant="outline"
      size="sm"
      title={resumen}
      data-active={activo || undefined}
      className={cn("h-8 flex-none gap-1.5 text-sm", activo && "border-foreground/30 bg-muted/60")}
      onClick={() =>
        onChange(
          activo
            ? { ...value, condiciones: value.condiciones.filter((c) => c.de !== rapido.id) }
            : { ...value, condiciones: [...value.condiciones, ...rapido.condiciones.map((c) => ({ ...c, de: rapido.id }))] },
        )
      }
    >
      <StarIcon className={cn(activo && "fill-current")} />
      {rapido.label}
    </Button>
  )
}

/** Diálogo para elegir qué rápidos se ven, ordenarlos y borrar los guardados. */
export function EditorRapidos<T>({
  open,
  onOpenChange,
  api,
  campos,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  api: QuickFiltersApi
  campos: CampoFiltrable<T>[]
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const ids = api.todos.map((r) => r.id)
    api.reordenar(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }

  // Campos de lista que todavía no tienen un rápido: los que se pueden añadir de un clic.
  const yaUsados = new Set(api.todos.filter((r) => r.clase === "campo").map((r) => (r as { campo: string }).campo))
  const disponibles = campos.filter((c) => (c.tipo === "select" || c.tipo === "multiselect") && (c.opciones?.length ?? 0) > 0 && !yaUsados.has(c.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Filtros rápidos</DialogTitle>
          <DialogDescription>
            Los atajos que aparecen junto al buscador. Arrastra para ordenarlos y apaga los que no uses. Para crear uno nuevo,
            monta el filtro en «Filtros» y guárdalo con nombre.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-72 overflow-y-auto">
          {api.todos.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">Todavía no hay filtros rápidos.</p>}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={api.todos.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              {api.todos.map((r) => (
                <FilaRapido
                  key={r.id}
                  id={r.id}
                  label={r.clase === "campo" ? (r.label ?? campos.find((c) => c.id === r.campo)?.label ?? r.campo) : r.label}
                  detalle={r.clase === "campo" ? "Opciones del campo" : r.condiciones.map((c) => describirCondicion(c, campos)).join(" · ")}
                  visible={!api.ocultos.has(r.id)}
                  onToggle={(v) => api.alternar(r.id, v)}
                  onDelete={api.esPropio(r.id) ? () => api.borrar(r.id) : undefined}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        {disponibles.length > 0 && (
          <AnadirRapidoCampo campos={disponibles} onAdd={(campo) => api.anadir({ id: `campo:${campo}`, clase: "campo", campo })} />
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={api.restablecer}>Restablecer</Button>
          <Button onClick={() => onOpenChange(false)}>Listo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function FilaRapido({
  id,
  label,
  detalle,
  visible,
  onToggle,
  onDelete,
}: {
  id: string
  label: string
  detalle: string
  visible: boolean
  onToggle: (v: boolean) => void
  onDelete?: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted/60", isDragging && "z-10 bg-background shadow-sm")}
    >
      <button type="button" aria-label={`Mover ${label}`} className="cursor-grab text-muted-foreground/60 hover:text-foreground" {...attributes} {...listeners}>
        <GripVerticalIcon className="size-3.5" />
      </button>
      <span className="grid min-w-0 flex-1 leading-tight">
        <span className="truncate text-sm">{label}</span>
        {detalle && <span className="truncate text-xs text-muted-foreground">{detalle}</span>}
      </span>
      {onDelete && (
        <Button variant="ghost" size="icon-sm" aria-label={`Borrar ${label}`} className="text-muted-foreground hover:text-danger" onClick={onDelete}>
          <Trash2Icon />
        </Button>
      )}
      <Switch checked={visible} onCheckedChange={onToggle} aria-label={`Mostrar ${label}`} className="scale-90" />
    </div>
  )
}

function AnadirRapidoCampo<T>({ campos, onAdd }: { campos: CampoFiltrable<T>[]; onAdd: (campo: string) => void }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start">
          <PlusIcon /> Añadir el desplegable de un campo
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Buscar campo…" />
          <CommandList>
            <CommandEmpty>Ningún campo coincide</CommandEmpty>
            <CommandGroup>
              {campos.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.label}
                  onSelect={() => {
                    onAdd(c.id)
                    setOpen(false)
                  }}
                >
                  {c.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/** Diálogo de «Guardar como rápido»: pide el nombre del atajo. */
export function GuardarRapidoDialog({
  grupo,
  onOpenChange,
  onGuardar,
}: {
  /** Grupo a guardar, o null si está cerrado. */
  grupo: GrupoCondiciones | null
  onOpenChange: (o: boolean) => void
  onGuardar: (rapido: FiltroRapido) => void
}) {
  return (
    <Dialog open={grupo !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Guardar como filtro rápido</DialogTitle>
          <DialogDescription>
            Queda como un botón junto al buscador, para aplicar este filtro de un clic. Solo lo ves tú, en este navegador.
          </DialogDescription>
        </DialogHeader>
        {/* El formulario se monta con el diálogo: así el nombre arranca vacío sin resetearlo a mano. */}
        {grupo && <FormularioRapido grupo={grupo} onOpenChange={onOpenChange} onGuardar={onGuardar} />}
      </DialogContent>
    </Dialog>
  )
}

function FormularioRapido({
  grupo,
  onOpenChange,
  onGuardar,
}: {
  grupo: GrupoCondiciones
  onOpenChange: (o: boolean) => void
  onGuardar: (rapido: FiltroRapido) => void
}) {
  const [nombre, setNombre] = React.useState("")
  const guardar = () => {
    if (!nombre.trim()) return
    onGuardar({
      id: `guardado:${Date.now().toString(36)}`,
      clase: "guardado",
      label: nombre.trim(),
      union: grupo.union,
      // Las condiciones puestas por otro rápido se guardan como propias del nuevo.
      condiciones: grupo.condiciones.map((c) => ({ campo: c.campo, op: c.op, valor: c.valor })),
    })
    onOpenChange(false)
  }
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rapido-nombre">Nombre</Label>
        <Input
          id="rapido-nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Clientes sin responsable"
          onKeyDown={(e) => e.key === "Enter" && guardar()}
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          {grupo.condiciones.length} {grupo.condiciones.length === 1 ? "condición" : "condiciones"}, unidas con «{grupo.union === "o" ? "o" : "y"}».
        </p>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
        <Button onClick={guardar} disabled={!nombre.trim()}><StarIcon /> Guardar</Button>
      </DialogFooter>
    </>
  )
}
