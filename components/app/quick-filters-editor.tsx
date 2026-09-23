"use client"

import * as React from "react"
import { GripVerticalIcon, PencilIcon, PlusIcon, StarIcon, Trash2Icon } from "lucide-react"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import type { FiltroRapido, QuickFiltersApi } from "@/components/app/quick-filters"
import { FilaCondicion, condicionNueva } from "@/components/app/filter-builder"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { describirCondicion, type CampoFiltrable, type Condicion, type GrupoCondiciones } from "@/lib/filtros/core"

// La configuración de los filtros rápidos: elegir cuáles se ven, ordenarlos, cambiarlos, borrar los
// guardados y guardar el filtro actual como uno nuevo. La fila de botones vive en `quick-filters.tsx`.

/**
 * Diálogo para elegir qué rápidos se ven, ordenarlos, cambiarlos y borrar los guardados. Cambiar uno
 * se hace en el mismo diálogo: la lista deja sitio a su nombre y, si es guardado, sus condiciones.
 */
export function EditorRapidos<T>({
  open,
  onOpenChange,
  api,
  campos,
  value,
  onChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  api: QuickFiltersApi
  campos: CampoFiltrable<T>[]
  /** Filtro aplicado ahora: si el rápido que se cambia está puesto, se aplica ya con lo nuevo. */
  value?: GrupoCondiciones
  onChange?: (next: GrupoCondiciones) => void
}) {
  const [editando, setEditando] = React.useState<FiltroRapido | null>(null)
  // Un guardado borrado no se recupera (vive en este navegador): se confirma. No hay aviso con
  // «Deshacer» porque, con el diálogo abierto, el aviso no se puede pulsar.
  const [borrando, setBorrando] = React.useState<FiltroRapido | null>(null)
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

  const nombreDe = (r: FiltroRapido) => (r.clase === "campo" ? (r.label ?? campos.find((c) => c.id === r.campo)?.label ?? r.campo) : r.label)
  const guardarEdicion = (r: FiltroRapido) => {
    api.editar(r)
    if (r.clase === "guardado" && value && onChange && value.condiciones.some((c) => c.de === r.id)) {
      onChange({ ...value, condiciones: [...value.condiciones.filter((c) => c.de !== r.id), ...r.condiciones.map((c) => ({ ...c, de: r.id }))] })
    }
    setEditando(null)
  }

  // Campos de lista que todavía no tienen un rápido: los que se pueden añadir de un clic.
  const yaUsados = new Set(api.todos.filter((r) => r.clase === "campo").map((r) => (r as { campo: string }).campo))
  const disponibles = campos.filter((c) => (c.tipo === "select" || c.tipo === "multiselect") && (c.opciones?.length ?? 0) > 0 && !yaUsados.has(c.id))

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setEditando(null)
        onOpenChange(o)
      }}
    >
      {/* Las condiciones de un guardado piden el mismo ancho que el panel de «Filtros». */}
      <DialogContent className={cn("sm:max-w-[480px]", editando?.clase === "guardado" && "sm:max-w-[44rem]")}>
        {editando ? (
          <EditarRapido key={editando.id} rapido={editando} nombreCampo={nombreDe(editando)} campos={campos} onCancel={() => setEditando(null)} onGuardar={guardarEdicion} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Filtros rápidos</DialogTitle>
              <DialogDescription>
                Los atajos que aparecen junto al buscador. Arrastra para ordenarlos, apaga los que no uses y pulsa el lápiz para
                cambiarlos. Para crear uno nuevo, monta el filtro en «Filtros» y guárdalo con nombre.
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
                      label={nombreDe(r)}
                      detalle={r.clase === "campo" ? "Opciones del campo" : r.condiciones.map((c) => describirCondicion(c, campos)).join(r.union === "o" ? " o " : " · ")}
                      visible={!api.ocultos.has(r.id)}
                      onToggle={(v) => api.alternar(r.id, v)}
                      onEdit={() => setEditando(r)}
                      onDelete={api.esPropio(r.id) ? () => setBorrando(r) : undefined}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            {disponibles.length > 0 && (
              <AnadirRapidoCampo campos={disponibles} onAdd={(campo) => api.anadir({ id: `campo:${campo}`, clase: "campo", campo })} />
            )}
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Listo</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
      <ConfirmDialog
        open={borrando !== null}
        onOpenChange={(o) => !o && setBorrando(null)}
        title={`¿Borrar el filtro rápido «${borrando ? nombreDe(borrando) : ""}»?`}
        description="Desaparece de la fila de filtros rápidos de esta página. Los registros no cambian."
        confirmLabel="Borrar filtro"
        destructive
        onConfirm={() => {
          if (borrando) api.borrar(borrando.id)
          setBorrando(null)
        }}
      />
    </Dialog>
  )
}

/** Cambiar un rápido: el nombre del botón y, si es un filtro guardado, sus condiciones. */
function EditarRapido<T>({
  rapido,
  nombreCampo,
  campos,
  onCancel,
  onGuardar,
}: {
  rapido: FiltroRapido
  /** Cómo se llama ahora en la fila (el nombre del campo, si un desplegable no tiene uno propio). */
  nombreCampo: string
  campos: CampoFiltrable<T>[]
  onCancel: () => void
  onGuardar: (r: FiltroRapido) => void
}) {
  const [nombre, setNombre] = React.useState(nombreCampo)
  const [grupo, setGrupo] = React.useState<GrupoCondiciones>(rapido.clase === "guardado" ? { union: rapido.union, condiciones: rapido.condiciones } : { union: "y", condiciones: [] })
  const campoOriginal = rapido.clase === "campo" ? (campos.find((c) => c.id === rapido.campo)?.label ?? rapido.campo) : ""
  const valido = rapido.clase === "campo" || (nombre.trim() !== "" && grupo.condiciones.length > 0)

  const setCondiciones = (cambiar: (cs: Condicion[]) => Condicion[]) => setGrupo((g) => ({ ...g, condiciones: cambiar(g.condiciones) }))
  const guardar = () => {
    if (!valido) return
    if (rapido.clase === "campo") {
      // Vacío o igual que el campo: vuelve a llamarse como el campo.
      const label = nombre.trim()
      onGuardar({ ...rapido, label: label && label !== campoOriginal ? label : undefined })
    } else {
      onGuardar({ ...rapido, label: nombre.trim(), union: grupo.union, condiciones: grupo.condiciones.map(({ campo, op, valor }) => ({ campo, op, valor })) })
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar filtro rápido</DialogTitle>
        <DialogDescription>
          {rapido.clase === "campo" ? `Desplegable con las opciones de «${campoOriginal}». Puedes cambiar el nombre de su botón.` : "Cambia su nombre o las condiciones que aplica."}
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="rapido-editar-nombre">Nombre</Label>
        <Input id="rapido-editar-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={campoOriginal || "Clientes sin responsable"} onKeyDown={(e) => e.key === "Enter" && guardar()} autoFocus />
      </div>
      {rapido.clase === "guardado" && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <Label>Condiciones</Label>
            <Select value={grupo.union} onValueChange={(u) => setGrupo((g) => ({ ...g, union: u as "y" | "o" }))}>
              <SelectTrigger size="sm" className="h-6 w-auto gap-1 px-1.5 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="y">se cumplen todas</SelectItem>
                <SelectItem value="o">se cumple alguna</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex max-h-[45vh] flex-col gap-1.5 overflow-y-auto rounded-md border p-2">
            {grupo.condiciones.length === 0 && <p className="py-3 text-center text-xs text-muted-foreground">Añade al menos una condición.</p>}
            {grupo.condiciones.map((c, i) => (
              <FilaCondicion
                key={`${i}-${c.campo}-${c.op}`}
                union={grupo.union}
                indice={i}
                condicion={c}
                campos={campos}
                onChange={(cambio) => setCondiciones((cs) => cs.map((x, j) => (j === i ? { ...x, ...cambio } : x)))}
                onRemove={() => setCondiciones((cs) => cs.filter((_, j) => j !== i))}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => {
              const nueva = condicionNueva(campos)
              if (nueva) setCondiciones((cs) => [...cs, nueva])
            }}
          >
            <PlusIcon /> Añadir condición
          </Button>
        </div>
      )}
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={guardar} disabled={!valido}>Guardar cambios</Button>
      </DialogFooter>
    </>
  )
}

function FilaRapido({
  id,
  label,
  detalle,
  visible,
  onToggle,
  onEdit,
  onDelete,
}: {
  id: string
  label: string
  detalle: string
  visible: boolean
  onToggle: (v: boolean) => void
  onEdit: () => void
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
      <Button variant="ghost" size="icon-sm" aria-label={`Editar ${label}`} className="text-muted-foreground" onClick={onEdit}>
        <PencilIcon />
      </Button>
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
