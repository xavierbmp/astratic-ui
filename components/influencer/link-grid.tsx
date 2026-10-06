"use client"

import * as React from "react"
import Image from "next/image"
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { GripVerticalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ConfirmDialog } from "@/components/app/confirm-dialog"

export type QuickLink = { id: string; label: string; url: string }

const schema = z.object({
  label: z.string().trim().min(1, "Ponle un nombre").max(40, "Máximo 40 caracteres"),
  url: z.string().trim().url("Pega la dirección completa, con https://"),
})
type Values = z.infer<typeof schema>

const FAVICON = "https://www.google.com/s2/favicons"

function faviconUrl(url: string) {
  try {
    return `${FAVICON}?domain=${new URL(url).hostname}&sz=64`
  } catch {
    return null
  }
}

/**
 * Directorio de enlaces de uso diario: mosaico con el icono de cada web. Se abren en otra pestaña;
 * en modo edición se ordenan arrastrando, se editan y se borran (con confirmación).
 */
export function LinkGrid({
  links,
  onChange,
  editing,
  className,
}: {
  links: QuickLink[]
  onChange: (links: QuickLink[]) => void
  editing: boolean
  className?: string
}) {
  const [editingLink, setEditingLink] = React.useState<QuickLink | "nuevo" | null>(null)
  const [deleting, setDeleting] = React.useState<QuickLink | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const ids = links.map((l) => l.id)
    onChange(arrayMove(links, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))))
  }

  const save = (values: Values) => {
    if (editingLink === "nuevo") {
      onChange([...links, { id: `l-${Date.now()}`, ...values }])
      toast.success(`Enlace «${values.label}» añadido`)
    } else if (editingLink) {
      onChange(links.map((l) => (l.id === editingLink.id ? { ...l, ...values } : l)))
      toast.success(`Enlace «${values.label}» guardado`)
    }
    setEditingLink(null)
  }

  const remove = () => {
    if (!deleting) return
    const removed = deleting
    onChange(links.filter((l) => l.id !== removed.id))
    setDeleting(null)
    toast(`Enlace «${removed.label}» eliminado`, {
      action: { label: "Deshacer", onClick: () => onChange([...links]) },
    })
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={links.map((l) => l.id)} strategy={rectSortingStrategy}>
          <ul data-slot="ws-link-grid" className={cn("grid grid-cols-4 gap-2", className)}>
            {links.map((link) => (
              <LinkTile
                key={link.id}
                link={link}
                editing={editing}
                onEdit={() => setEditingLink(link)}
                onDelete={() => setDeleting(link)}
              />
            ))}
            {editing && (
              <li>
                <button
                  type="button"
                  onClick={() => setEditingLink("nuevo")}
                  className="flex h-full min-h-20 w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-input text-xs text-muted-foreground transition-colors hover:border-brand hover:text-brand"
                >
                  <PlusIcon className="size-4" aria-hidden />
                  Añadir
                </button>
              </li>
            )}
          </ul>
        </SortableContext>
      </DndContext>

      <LinkDialog
        open={editingLink !== null}
        link={editingLink === "nuevo" ? null : editingLink}
        onClose={() => setEditingLink(null)}
        onSave={save}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`¿Eliminar «${deleting?.label ?? ""}»?`}
        description="Se quita de tus enlaces. Podrás deshacerlo justo después."
        confirmLabel="Eliminar enlace"
        destructive
        onConfirm={remove}
      />
    </>
  )
}

function LinkTile({
  link,
  editing,
  onEdit,
  onDelete,
}: {
  link: QuickLink
  editing: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id, disabled: !editing })
  const icon = faviconUrl(link.url)
  const inner = (
    <>
      <span className="grid size-9 place-items-center overflow-hidden rounded-lg bg-card shadow-xs">
        {icon ? (
          <Image src={icon} alt="" width={20} height={20} className="size-5" unoptimized />
        ) : (
          <span className="text-sm font-semibold">{link.label.slice(0, 1).toUpperCase()}</span>
        )}
      </span>
      <span className="w-full truncate text-center text-[11px] leading-tight font-medium">{link.label}</span>
    </>
  )
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group/link relative", isDragging && "z-10")}
    >
      {editing ? (
        <div
          className={cn(
            "flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl bg-background/70 px-1.5 py-2.5",
            isDragging && "bg-card shadow-pop"
          )}
        >
          {inner}
          <button
            type="button"
            aria-label={`Mover ${link.label}`}
            className="absolute top-1 left-1 cursor-grab rounded p-0.5 text-muted-foreground/60 hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVerticalIcon className="size-3.5" />
          </button>
          <span className="absolute top-1 right-1 flex gap-0.5">
            <button
              type="button"
              aria-label={`Editar ${link.label}`}
              onClick={onEdit}
              className="rounded p-0.5 text-muted-foreground/70 hover:bg-muted hover:text-foreground"
            >
              <PencilIcon className="size-3" />
            </button>
            <button
              type="button"
              aria-label={`Eliminar ${link.label}`}
              onClick={onDelete}
              className="rounded p-0.5 text-muted-foreground/70 hover:bg-danger-soft hover:text-danger"
            >
              <Trash2Icon className="size-3" />
            </button>
          </span>
        </div>
      ) : (
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl bg-background/70 px-1.5 py-2.5 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {inner}
        </a>
      )}
    </li>
  )
}

function LinkDialog({
  open,
  link,
  onClose,
  onSave,
}: {
  open: boolean
  link: QuickLink | null
  onClose: () => void
  onSave: (values: Values) => void
}) {
  const { register, handleSubmit, formState, reset } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { label: "", url: "" },
  })
  const { errors } = formState

  React.useEffect(() => {
    if (open) reset({ label: link?.label ?? "", url: link?.url ?? "" })
  }, [open, link, reset])

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{link ? "Editar enlace" : "Nuevo enlace"}</DialogTitle>
          <DialogDescription>Los enlaces se abren en otra pestaña y llevan el icono de su web.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSave)} noValidate className="grid gap-4">
          <Field data-invalid={!!errors.label || undefined}>
            <FieldLabel htmlFor="link-label">Nombre</FieldLabel>
            <Input id="link-label" placeholder="Drive · Collabs" aria-invalid={!!errors.label} {...register("label")} />
            <FieldError errors={[errors.label]} />
          </Field>
          <Field data-invalid={!!errors.url || undefined}>
            <FieldLabel htmlFor="link-url">Dirección</FieldLabel>
            <Input id="link-url" type="url" placeholder="https://" aria-invalid={!!errors.url} {...register("url")} />
            <FieldError errors={[errors.url]} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{link ? "Guardar enlace" : "Añadir enlace"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
