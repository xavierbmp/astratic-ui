"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FRECUENCIAS_TAREA, PRIORIDADES_TAREA, type DondeTarea, type EtiquetaTarea, type FrecuenciaTarea, type PaginaTarea, type PlantillaTarea, type PrioridadTarea, type Tarea } from "@/lib/influencer/modelo"
import { idNuevo, migasDonde, nuevaTarea, type ContextoTareas } from "@/lib/influencer/tareas"
import { lunesDe, sumarDias } from "@/lib/influencer/fechas"
import { tintFor } from "@/lib/influencer/tints"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/app/multi-select"
import { DondeSelector } from "@/components/influencer/donde-selector"
import { PrioridadBandera } from "@/components/influencer/task-cells"

const NO_REPITE = "no"

const esquema = z.object({
  titulo: z.string().trim().min(1, "Escribe qué hay que hacer").max(160, "Máximo 160 caracteres"),
  donde: z.custom<DondeTarea>((v) => !!v && typeof v === "object", "Elige la página y el tipo"),
  fecha: z.string().optional(),
  hora: z.string().optional(),
  fechaLimite: z.string().optional(),
  prioridad: z.enum(["urgente", "alta", "normal", "baja"]),
  etiquetas: z.array(z.string()),
  repetir: z.string(),
  notas: z.string().trim().max(2000, "Máximo 2.000 caracteres").optional(),
  subtareas: z.array(z.string()),
})

type Valores = z.infer<typeof esquema>

const textoANotas = (texto?: string) =>
  texto
    ? texto
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`)
        .join("")
    : undefined
const notasATexto = (html?: string) =>
  html
    ? html
        .replace(/<br\s*\/?>/g, "\n")
        .replace(/<\/p>\s*<p>/g, "\n\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&amp;/g, "&")
    : ""

/**
 * Nueva tarea, el mismo diálogo en toda la app. Se dice qué hay que hacer y dónde vive (su página
 * y su tipo, y la campaña o el registro): desde la pestaña de una página, la página ya va puesta;
 * desde una ficha, todo (`dondeFijo`). Desde una plantilla, llega rellena y con sus subtareas.
 */
export function TaskDialog({
  open,
  onOpenChange,
  hoy,
  ctx,
  etiquetas,
  limitar,
  dondeInicial,
  dondeFijo,
  inicial,
  plantilla,
  onCrearEtiqueta,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hoy: string
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  /** Solo se ofrece lo de esta página o esta campaña (la pestaña o la ficha en la que se crea). */
  limitar?: { pagina?: PaginaTarea; collabId?: string }
  dondeInicial?: DondeTarea
  /** Dónde vive ya está decidido (se crea desde su sitio): se enseña, no se elige. */
  dondeFijo?: DondeTarea
  /** Lo que ya trae la tarea: lo que hereda de un grupo, del filtro de la vista o de un día del calendario. */
  inicial?: Partial<Pick<Tarea, "titulo" | "fecha" | "fechaLimite" | "prioridad" | "etiquetas" | "estado">>
  plantilla?: PlantillaTarea | null
  onCrearEtiqueta?: (nombre: string) => EtiquetaTarea
  /** La tarea y los títulos de sus subtareas (los de la plantilla). */
  onCreate: (tarea: Tarea, subtareas: string[]) => void
}) {
  const { register, handleSubmit, control, reset, setValue, formState } = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: { titulo: "", fecha: "", hora: "", fechaLimite: "", prioridad: "normal", etiquetas: [], repetir: NO_REPITE, notas: "", subtareas: [] },
  })
  const { errors } = formState
  const fecha = useWatch({ control, name: "fecha" })
  const subtareas = useWatch({ control, name: "subtareas" })

  React.useEffect(() => {
    if (!open) return
    // La plantilla trae su página y su tipo; en Campañas falta la campaña, que da la ficha o se elige.
    const dondePlantilla = !plantilla
      ? undefined
      : plantilla.pagina === "campanas"
        ? limitar?.collabId
          ? ({ pagina: "campanas", tipo: plantilla.tipo, collabId: limitar.collabId } as DondeTarea) // el tipo de una plantilla es de su página
          : undefined
        : ({ pagina: plantilla.pagina, tipo: plantilla.tipo } as DondeTarea)
    const fechaInicial = inicial?.fecha ?? ""
    reset({
      titulo: inicial?.titulo ?? plantilla?.titulo ?? "",
      donde: dondeFijo ?? dondeInicial ?? dondePlantilla,
      fecha: fechaInicial.slice(0, 10),
      hora: fechaInicial.length > 10 ? fechaInicial.slice(11, 16) : "",
      fechaLimite: inicial?.fechaLimite ?? "",
      prioridad: inicial?.prioridad ?? plantilla?.prioridad ?? "normal",
      etiquetas: inicial?.etiquetas ?? plantilla?.etiquetas ?? [],
      repetir: NO_REPITE,
      notas: notasATexto(plantilla?.notas),
      subtareas: plantilla?.subtareas ?? [],
    })
  }, [open, plantilla, dondeFijo, dondeInicial, inicial, limitar, reset])

  const guardar = (v: Valores) => {
    const ahora = `${hoy.slice(0, 10)}T${new Date().toTimeString().slice(0, 8)}`
    const frecuencia = v.repetir === NO_REPITE ? undefined : (v.repetir as FrecuenciaTarea) // valor de FRECUENCIAS_TAREA
    const tarea = nuevaTarea(
      {
        titulo: v.titulo,
        donde: v.donde,
        fecha: v.fecha ? (v.hora ? `${v.fecha}T${v.hora}` : v.fecha) : undefined,
        fechaLimite: v.fechaLimite || undefined,
        prioridad: v.prioridad as PrioridadTarea,
        etiquetas: v.etiquetas,
        repetir: frecuencia ? { frecuencia } : undefined,
        notas: textoANotas(v.notas),
        estado: inicial?.estado,
        origen: plantilla ? "plantilla" : "manual",
      },
      idNuevo("t"),
      ahora,
    )
    onCreate(tarea, v.subtareas.map((s) => s.trim()).filter(Boolean))
    onOpenChange(false)
  }

  const atajos: { label: string; fecha: string }[] = [
    { label: "Hoy", fecha: hoy.slice(0, 10) },
    { label: "Mañana", fecha: sumarDias(hoy, 1) },
    { label: "Lunes que viene", fecha: sumarDias(lunesDe(hoy), 7) },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{plantilla ? `Nueva tarea: ${plantilla.nombre}` : "Nueva tarea"}</DialogTitle>
          <DialogDescription>
            {dondeFijo ? `Vive en ${migasDonde(dondeFijo, ctx).map((m) => m.label).join(" › ")} y sale también en Tareas.` : "Elige dónde vive: sale en esa página y en Tareas."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(guardar)} noValidate className="grid gap-4">
          <Field data-invalid={!!errors.titulo || undefined}>
            <FieldLabel htmlFor="tarea-titulo">Qué hay que hacer</FieldLabel>
            <Input id="tarea-titulo" placeholder="Enviar la factura a Lumea" autoFocus aria-invalid={!!errors.titulo} {...register("titulo")} />
            <FieldError errors={[errors.titulo]} />
          </Field>
          {!dondeFijo && (
            <Field data-invalid={!!errors.donde || undefined}>
              <FieldLabel htmlFor="tarea-donde">Dónde vive</FieldLabel>
              <Controller
                control={control}
                name="donde"
                render={({ field }) => <DondeSelector id="tarea-donde" value={field.value} onChange={field.onChange} ctx={ctx} limitar={limitar ?? (plantilla ? { pagina: plantilla.pagina } : undefined)} invalido={!!errors.donde} />}
              />
              <FieldError errors={[errors.donde]} />
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="tarea-fecha">Fecha</FieldLabel>
              <div className="flex gap-2">
                <Input id="tarea-fecha" type="date" className="min-w-0 flex-1" {...register("fecha")} />
                <Input aria-label="Hora" type="time" className="w-28" disabled={!fecha} {...register("hora")} />
              </div>
              <div className="flex flex-wrap gap-1">
                {atajos.map((a) => (
                  <Button key={a.label} type="button" size="sm" variant={fecha === a.fecha ? "secondary" : "ghost"} className="h-7 px-2 text-xs" onClick={() => setValue("fecha", a.fecha, { shouldDirty: true })}>
                    {a.label}
                  </Button>
                ))}
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="tarea-limite">Fecha límite</FieldLabel>
              <Input id="tarea-limite" type="date" {...register("fechaLimite")} />
              <p className="text-xs text-muted-foreground">La entrega de la marca o tu propio plazo.</p>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="tarea-prioridad">Prioridad</FieldLabel>
              <Controller
                control={control}
                name="prioridad"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="tarea-prioridad" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORIDADES_TAREA.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          <PrioridadBandera prioridad={p.id} conTexto />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="tarea-repetir">Repetir</FieldLabel>
              <Controller
                control={control}
                name="repetir"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="tarea-repetir" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_REPITE}>No se repite</SelectItem>
                      {(Object.keys(FRECUENCIAS_TAREA) as FrecuenciaTarea[]).map((f) => (
                        <SelectItem key={f} value={f}>
                          {FRECUENCIAS_TAREA[f]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
          <Field>
            <FieldLabel>Etiquetas</FieldLabel>
            <Controller
              control={control}
              name="etiquetas"
              render={({ field }) => (
                <MultiSelect
                  options={etiquetas.map((e) => ({ value: e.id, label: e.nombre }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Grabar, editar, gestiones…"
                  onCreate={
                    onCrearEtiqueta
                      ? async (texto) => {
                          const e = onCrearEtiqueta(texto)
                          return { value: e.id, label: e.nombre }
                        }
                      : undefined
                  }
                />
              )}
            />
          </Field>
          <Field data-invalid={!!errors.notas || undefined}>
            <FieldLabel htmlFor="tarea-notas">Notas</FieldLabel>
            <Textarea id="tarea-notas" rows={2} placeholder="Opcional" {...register("notas")} />
            <FieldError errors={[errors.notas]} />
          </Field>
          {subtareas.length > 0 && (
            <div className="grid gap-1.5">
              <span className="text-sm font-medium">Subtareas</span>
              <ul className="grid gap-1">
                {subtareas.map((_, i) => (
                  <li key={i}>
                    <Input aria-label={`Subtarea ${i + 1}`} className="h-8 text-sm" {...register(`subtareas.${i}` as const)} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Crear tarea</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** Una etiqueta nueva con un tinte estable para su nombre. */
export function etiquetaNueva(nombre: string): EtiquetaTarea {
  return { id: idNuevo("e"), nombre: nombre.trim(), tint: tintFor(nombre.trim().toLowerCase()) }
}
