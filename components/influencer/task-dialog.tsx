"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FRECUENCIAS_TAREA, PRIORIDADES_TAREA, type DondeTarea, type EtiquetaTarea, type FrecuenciaTarea, type PlantillaTarea, type PrioridadTarea, type Tarea } from "@/lib/influencer/modelo"
import { SIN_TIPO, idNuevo, migasDonde, nuevaTarea, type ContextoTareas } from "@/lib/influencer/tareas"
import { lunesDe, sumarDias } from "@/lib/influencer/fechas"
import { tintFor } from "@/lib/influencer/tints"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/app/multi-select"
import { SelectorDeQue, SelectorTipo, etiquetaDeQue } from "@/components/influencer/task-tipo"
import { PrioridadBandera } from "@/components/influencer/task-cells"

const NO_REPITE = "no"

const esquema = z.object({
  titulo: z.string().trim().min(1, "Escribe qué hay que hacer").max(160, "Máximo 160 caracteres"),
  donde: z.custom<DondeTarea>((v) => !!v && typeof v === "object"),
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
 * Nueva tarea, el mismo diálogo en toda la app. Se dice qué hay que hacer y su tipo (la página en
 * la que sale: sin tipo, CRM, Collabs o Cobros) y, debajo, de qué campaña o de qué ficha del CRM
 * es, si es de alguna. Nace sin tipo salvo que se cree desde una página (`dondeInicial`) o desde
 * una ficha, que ya lo deja decidido (`dondeFijo`). Desde una plantilla, llega rellena y con sus
 * subtareas.
 */
export function TaskDialog({
  open,
  onOpenChange,
  hoy,
  ctx,
  etiquetas,
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
  /** Con lo que nace, que se puede cambiar: el tipo de la página en la que se crea. Sin él, sin tipo. */
  dondeInicial?: DondeTarea
  /** Ya está decidido (se crea desde una campaña o una ficha del CRM): se enseña, no se elige. */
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
  const donde = useWatch({ control, name: "donde" }) ?? SIN_TIPO

  React.useEffect(() => {
    if (!open) return
    // La plantilla trae su tipo; la campaña o la ficha se eligen debajo.
    const dondePlantilla: DondeTarea | undefined = plantilla ? { tipo: plantilla.tipo } : undefined
    const fechaInicial = inicial?.fecha ?? ""
    reset({
      titulo: inicial?.titulo ?? plantilla?.titulo ?? "",
      donde: dondeFijo ?? dondePlantilla ?? dondeInicial ?? SIN_TIPO,
      fecha: fechaInicial.slice(0, 10),
      hora: fechaInicial.length > 10 ? fechaInicial.slice(11, 16) : "",
      fechaLimite: inicial?.fechaLimite ?? "",
      prioridad: inicial?.prioridad ?? plantilla?.prioridad ?? "normal",
      etiquetas: inicial?.etiquetas ?? plantilla?.etiquetas ?? [],
      repetir: NO_REPITE,
      notas: notasATexto(plantilla?.notas),
      subtareas: plantilla?.subtareas ?? [],
    })
  }, [open, plantilla, dondeFijo, dondeInicial, inicial, reset])

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
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{plantilla ? `Nueva tarea: ${plantilla.nombre}` : "Nueva tarea"}</DialogTitle>
          <DialogDescription>
            {dondeFijo
              ? `Es de ${migasDonde(dondeFijo, ctx).map((m) => m.label).join(" › ")} y sale también en Tareas.`
              : "Con un tipo, sale en esa página además de en Tareas. Sin tipo, solo en Tareas."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(guardar)} noValidate className="grid gap-4">
          <Field data-invalid={!!errors.titulo || undefined}>
            <FieldLabel htmlFor="tarea-titulo">Qué hay que hacer</FieldLabel>
            <Input id="tarea-titulo" placeholder="Enviar la factura a Lumea" autoFocus aria-invalid={!!errors.titulo} {...register("titulo")} />
            <FieldError errors={[errors.titulo]} />
          </Field>
          {!dondeFijo && (
            <div className="grid gap-3">
              <Field>
                <FieldLabel htmlFor="tarea-tipo">Tipo</FieldLabel>
                <Controller control={control} name="donde" render={({ field }) => <SelectorTipo id="tarea-tipo" value={field.value ?? SIN_TIPO} onChange={field.onChange} />} />
              </Field>
              {etiquetaDeQue(donde.tipo) && (
                <Field>
                  <FieldLabel htmlFor="tarea-de-que">{etiquetaDeQue(donde.tipo)}</FieldLabel>
                  <Controller control={control} name="donde" render={({ field }) => <SelectorDeQue id="tarea-de-que" value={field.value ?? SIN_TIPO} onChange={field.onChange} ctx={ctx} />} />
                </Field>
              )}
            </div>
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
