"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { BellIcon, BuildingIcon, PaletteIcon, SaveIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet, FieldLegend } from "@/components/ui/field"
import { PageBody, PageHeader } from "@/components/app/page-header"
import { Section, SectionBody, SectionFooter, SectionHeader } from "@/components/app/section"

const schema = z.object({
  name: z.string().min(2, "Escribe el nombre de la organización"),
  email: z.email("Escribe un email válido"),
  description: z.string().max(240, "Máximo 240 caracteres").optional(),
  language: z.enum(["es", "en"]),
  density: z.enum(["comoda", "compacta"]),
  notifyEmail: z.boolean(),
  notifyDigest: z.boolean(),
})
export type SettingsValues = z.infer<typeof schema>

const sections = [
  { id: "general", label: "General", icon: BuildingIcon },
  { id: "apariencia", label: "Apariencia", icon: PaletteIcon },
  { id: "notificaciones", label: "Notificaciones", icon: BellIcon },
]

export function AjustesView({ initialValues }: { initialValues: SettingsValues }) {
  const [active, setActive] = React.useState("general")
  const form = useForm<SettingsValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  })
  const { register, handleSubmit, formState, control } = form

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((r) => setTimeout(r, 600))
    toast.success("Ajustes guardados")
    form.reset(values)
  })

  return (
    <PageBody>
      <PageHeader title="Ajustes" description="Configuración general del portal, apariencia y avisos." />
      <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Secciones de ajustes" className="flex flex-col gap-0.5">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id)}
              aria-current={active === s.id ? "page" : undefined}
              className={cn(
                "flex h-8 items-center gap-2 rounded-md px-2.5 text-left text-sm transition-colors hover:bg-muted",
                active === s.id ? "bg-muted font-medium" : "text-muted-foreground"
              )}
            >
              <s.icon className="size-4" /> {s.label}
            </button>
          ))}
        </nav>

        <form onSubmit={onSubmit} noValidate>
          <Section>
            <SectionHeader icon={sections.find((s) => s.id === active)!.icon} title={sections.find((s) => s.id === active)!.label} />
            <SectionBody className="p-5">
              {active === "general" && (
                <FieldGroup className="max-w-xl">
                  <Field data-invalid={!!formState.errors.name || undefined}>
                    <FieldLabel htmlFor="name">Nombre de la organización</FieldLabel>
                    <Input id="name" aria-invalid={!!formState.errors.name} {...register("name")} />
                    <FieldError errors={[formState.errors.name]} />
                  </Field>
                  <Field data-invalid={!!formState.errors.email || undefined}>
                    <FieldLabel htmlFor="email">Email de contacto</FieldLabel>
                    <Input id="email" type="email" aria-invalid={!!formState.errors.email} {...register("email")} />
                    <FieldDescription>Se usa como remitente de los avisos del portal.</FieldDescription>
                    <FieldError errors={[formState.errors.email]} />
                  </Field>
                  <Field data-invalid={!!formState.errors.description || undefined}>
                    <FieldLabel htmlFor="description">Descripción</FieldLabel>
                    <Textarea id="description" rows={3} placeholder="Una línea sobre la organización" {...register("description")} />
                    <FieldError errors={[formState.errors.description]} />
                  </Field>
                </FieldGroup>
              )}
              {active === "apariencia" && (
                <FieldGroup className="max-w-xl">
                  <Field>
                    <FieldLabel htmlFor="language">Idioma</FieldLabel>
                    <Controller
                      control={control}
                      name="language"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger id="language" className="w-56" onBlur={field.onBlur}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="en">English</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </Field>
                  <FieldSet>
                    <FieldLegend variant="label">Densidad</FieldLegend>
                    <FieldDescription>Cómo de compactas se muestran las tablas y listas.</FieldDescription>
                    <Controller
                      control={control}
                      name="density"
                      render={({ field }) => (
                        <RadioGroup value={field.value} onValueChange={field.onChange} className="mt-2">
                          <Field orientation="horizontal">
                            <RadioGroupItem value="comoda" id="d-comoda" />
                            <FieldLabel htmlFor="d-comoda" className="font-normal">Cómoda</FieldLabel>
                          </Field>
                          <Field orientation="horizontal">
                            <RadioGroupItem value="compacta" id="d-compacta" />
                            <FieldLabel htmlFor="d-compacta" className="font-normal">Compacta</FieldLabel>
                          </Field>
                        </RadioGroup>
                      )}
                    />
                  </FieldSet>
                </FieldGroup>
              )}
              {active === "notificaciones" && (
                <FieldGroup className="max-w-xl">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor="notifyEmail">Avisos por email</FieldLabel>
                      <FieldDescription>Un email por cada cambio relevante en tus registros.</FieldDescription>
                    </FieldContent>
                    <Controller
                      control={control}
                      name="notifyEmail"
                      render={({ field }) => <Switch id="notifyEmail" checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} />}
                    />
                  </Field>
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor="notifyDigest">Resumen diario</FieldLabel>
                      <FieldDescription>Un solo email a las 8:00 con todo lo pendiente.</FieldDescription>
                    </FieldContent>
                    <Controller
                      control={control}
                      name="notifyDigest"
                      render={({ field }) => <Switch id="notifyDigest" checked={field.value} onCheckedChange={field.onChange} onBlur={field.onBlur} />}
                    />
                  </Field>
                </FieldGroup>
              )}
            </SectionBody>
            <SectionFooter className="justify-end gap-2 py-3">
              <Button type="button" variant="ghost" disabled={!formState.isDirty || formState.isSubmitting} onClick={() => form.reset()}>
                Descartar
              </Button>
              <Button type="submit" disabled={!formState.isDirty || formState.isSubmitting}>
                <SaveIcon /> {formState.isSubmitting ? "Guardando…" : "Guardar cambios"}
              </Button>
            </SectionFooter>
          </Section>
        </form>
      </div>
    </PageBody>
  )
}
