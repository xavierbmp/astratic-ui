"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { RelacionTarea, Tarea } from "@/lib/influencer/modelo"
import { idNuevo } from "@/lib/influencer/tareas"
import { sumarDias } from "@/lib/influencer/fechas"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/** Una collab o propuesta a la que se puede atar la tarea. */
export type RelacionOpcion = RelacionTarea & { label: string }

const GENERAL = "general"

const esquema = z.object({
  titulo: z.string().trim().min(1, "Escribe qué hay que hacer").max(120, "Máximo 120 caracteres"),
  fechaLimite: z.string().optional(),
  relacion: z.string(),
  notas: z.string().trim().max(500, "Máximo 500 caracteres").optional(),
})

type Valores = z.infer<typeof esquema>

const claveRelacion = (r?: RelacionTarea) => (r ? `${r.tipo}:${r.id}` : GENERAL)

/**
 * Diálogo de tarea, el mismo en toda la app: desde el Inicio se elige a qué pertenece; desde una
 * collab o una propuesta llega ya atada a ella (`relacionFija`). Con `tarea`, edita en vez de crear.
 */
export function TaskDialog({
  open,
  onOpenChange,
  hoy,
  relaciones,
  relacionFija,
  tarea,
  onCreate,
  onUpdate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  hoy: string
  relaciones?: RelacionOpcion[]
  relacionFija?: RelacionOpcion
  tarea?: Tarea | null
  onCreate?: (tarea: Tarea) => void
  onUpdate?: (tarea: Tarea) => void
}) {
  const { register, handleSubmit, control, reset, setValue, formState } = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: { titulo: "", fechaLimite: "", relacion: claveRelacion(relacionFija), notas: "" },
  })
  const { errors } = formState
  const fecha = useWatch({ control, name: "fechaLimite" })

  React.useEffect(() => {
    if (!open) return
    reset({
      titulo: tarea?.titulo ?? "",
      fechaLimite: tarea?.fechaLimite ?? "",
      relacion: claveRelacion(tarea?.relacion ?? relacionFija),
      notas: tarea?.notas ?? "",
    })
  }, [open, tarea, relacionFija, reset])

  const guardar = (v: Valores) => {
    const [tipo, id] = v.relacion === GENERAL ? [] : v.relacion.split(":")
    const relacion: RelacionTarea | undefined = tipo === "collab" || tipo === "propuesta" ? { tipo, id: id ?? "" } : undefined
    const base = { titulo: v.titulo, fechaLimite: v.fechaLimite || undefined, relacion, notas: v.notas || undefined }
    if (tarea) onUpdate?.({ ...tarea, ...base })
    else onCreate?.({ id: idNuevo("t"), hecha: false, origen: "manual", ...base })
    onOpenChange(false)
  }

  const atajos: { label: string; fecha: string }[] = [
    { label: "Hoy", fecha: hoy },
    { label: "Mañana", fecha: sumarDias(hoy, 1) },
    { label: "En una semana", fecha: sumarDias(hoy, 7) },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{tarea ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
          <DialogDescription>
            {relacionFija ? `Queda atada a ${relacionFija.label} y aparece también en tu lista general.` : "Si la atas a una collab o propuesta, aparece también en su ficha."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(guardar)} noValidate className="grid gap-4">
          <Field data-invalid={!!errors.titulo || undefined}>
            <FieldLabel htmlFor="tarea-titulo">Qué hay que hacer</FieldLabel>
            <Input id="tarea-titulo" placeholder="Grabar el reel" autoFocus aria-invalid={!!errors.titulo} {...register("titulo")} />
            <FieldError errors={[errors.titulo]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="tarea-fecha">Fecha límite</FieldLabel>
            <div className="flex flex-wrap items-center gap-2">
              <Input id="tarea-fecha" type="date" className="w-auto" {...register("fechaLimite")} />
              {atajos.map((a) => (
                <Button key={a.label} type="button" size="sm" variant={fecha === a.fecha ? "secondary" : "ghost"} onClick={() => setValue("fechaLimite", a.fecha, { shouldDirty: true })}>
                  {a.label}
                </Button>
              ))}
            </div>
          </Field>
          {!relacionFija && (
            <Field>
              <FieldLabel htmlFor="tarea-relacion">Pertenece a</FieldLabel>
              <Controller
                control={control}
                name="relacion"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="tarea-relacion" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={GENERAL}>General (sin collab ni propuesta)</SelectItem>
                      {relaciones?.map((r) => (
                        <SelectItem key={claveRelacion(r)} value={claveRelacion(r)}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          )}
          <Field data-invalid={!!errors.notas || undefined}>
            <FieldLabel htmlFor="tarea-notas">Notas</FieldLabel>
            <Textarea id="tarea-notas" rows={2} placeholder="Opcional" {...register("notas")} />
            <FieldError errors={[errors.notas]} />
          </Field>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{tarea ? "Guardar tarea" : "Crear tarea"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
