"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const categories = [
  { id: "cat-a", label: "Categoría A" },
  { id: "cat-b", label: "Categoría B" },
  { id: "cat-c", label: "Categoría C" },
] as const

const owners = [
  { id: "u-1", label: "Usuario 1" },
  { id: "u-2", label: "Usuario 2" },
  { id: "u-3", label: "Usuario 3" },
] as const

const schema = z.object({
  name: z.string().min(2, "Escribe el nombre del registro"),
  category: z.enum(["cat-a", "cat-b", "cat-c"], { error: "Elige una categoría" }),
  value: z.number({ error: "Escribe un importe" }).positive("El importe debe ser mayor que 0"),
  owner: z.enum(["u-1", "u-2", "u-3"], { error: "Elige un responsable" }),
  notes: z.string().max(240, "Máximo 240 caracteres").optional(),
  active: z.boolean(),
})
type Values = z.infer<typeof schema>

export function FormDemo() {
  const [open, setOpen] = React.useState(false)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", notes: "", active: true },
  })
  const { register, handleSubmit, formState, control, reset } = form
  const { errors, isDirty, isSubmitting } = formState

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((r) => setTimeout(r, 700))
    toast.success(`Registro «${values.name}» creado`)
    setOpen(false)
    reset()
  })

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon /> Nuevo registro
      </Button>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) reset()
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Nuevo registro</DialogTitle>
            <DialogDescription>Aparece en el listado en cuanto lo crees.</DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} noValidate className="grid gap-4">
            <FieldGroup>
              <Field data-invalid={!!errors.name || undefined}>
                <FieldLabel htmlFor="nr-name">Nombre</FieldLabel>
                <Input id="nr-name" placeholder="Registro 25" aria-invalid={!!errors.name} {...register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={!!errors.category || undefined}>
                <FieldLabel htmlFor="nr-category">Categoría</FieldLabel>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="nr-category" className="w-full" aria-invalid={!!errors.category} onBlur={field.onBlur}>
                        <SelectValue placeholder="Elige una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.category]} />
              </Field>

              <Field data-invalid={!!errors.value || undefined}>
                <FieldLabel htmlFor="nr-value">Valor</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="nr-value"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={100}
                    placeholder="12000"
                    aria-invalid={!!errors.value}
                    {...register("value", { valueAsNumber: true })}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>€</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <FieldDescription>Importe sin impuestos.</FieldDescription>
                <FieldError errors={[errors.value]} />
              </Field>

              <Field data-invalid={!!errors.owner || undefined}>
                <FieldLabel htmlFor="nr-owner">Responsable</FieldLabel>
                <Controller
                  control={control}
                  name="owner"
                  render={({ field }) => (
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger id="nr-owner" className="w-full" aria-invalid={!!errors.owner} onBlur={field.onBlur}>
                        <SelectValue placeholder="Elige un responsable" />
                      </SelectTrigger>
                      <SelectContent>
                        {owners.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                <FieldError errors={[errors.owner]} />
              </Field>

              <Field data-invalid={!!errors.notes || undefined}>
                <FieldLabel htmlFor="nr-notes">Notas</FieldLabel>
                <Textarea id="nr-notes" rows={3} placeholder="Contexto útil para quien lo retome" {...register("notes")} />
                <FieldError errors={[errors.notes]} />
              </Field>

              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="nr-active">Activo</FieldLabel>
                  <FieldDescription>Visible en el listado y en las cifras desde el primer momento.</FieldDescription>
                </FieldContent>
                <Controller
                  control={control}
                  name="active"
                  render={({ field }) => (
                    <Switch id="nr-active" checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} />
                  )}
                />
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button type="button" variant="ghost" disabled={isSubmitting} onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!isDirty || isSubmitting}>
                <PlusIcon /> {isSubmitting ? "Creando…" : "Crear registro"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
