"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { ArrowDownIcon, ArrowRightIcon, ArrowUpIcon, FolderPlusIcon, PlusIcon, TagIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Textarea } from "@/components/ui/textarea"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { AvisoObligatorios, CampoFormulario, Formulario, FormularioCabecera, FormularioCuerpo, FormularioDialog, FormularioPie } from "@/components/app/formulario/formulario-dialog"
import { SelectorBuscable } from "@/components/app/formulario/selector-buscable"
import { CampoFecha } from "@/components/app/formulario/campo-fecha"
import { TarjetasOpcion } from "@/components/app/formulario/opciones-visuales"

const HOY = "2026-10-14"

const responsables = [
  { value: "u-1", label: "Usuario 1", detalle: "usuario1@empresa.com" },
  { value: "u-2", label: "Usuario 2", detalle: "usuario2@empresa.com" },
  { value: "u-3", label: "Usuario 3", detalle: "usuario3@empresa.com" },
]

const PRIORIDADES = [
  { value: "baja" as const, label: "Baja", descripcion: "Cuando haya hueco", icono: ArrowDownIcon },
  { value: "media" as const, label: "Media", descripcion: "Esta semana", icono: ArrowRightIcon },
  { value: "alta" as const, label: "Alta", descripcion: "Antes que lo demás", icono: ArrowUpIcon },
]

const schema = z.object({
  name: z.string().trim().min(2, "Escribe el nombre del registro"),
  category: z.string().min(1, "Elige una categoría"),
  owner: z.string().min(1, "Elige un responsable"),
  due: z.string().min(1, "Elige el día"),
  value: z.number({ error: "Escribe un importe" }).positive("El importe debe ser mayor que 0"),
  priority: z.enum(["baja", "media", "alta"]),
  notes: z.string().max(240, "Máximo 240 caracteres"),
})
type Values = z.infer<typeof schema>

const vacio: Values = { name: "", category: "", owner: "", due: "", value: Number.NaN, priority: "media", notes: "" }

/** «Nuevo registro» con el kit de formularios: una categoría que no existe se crea encima y vuelve elegida. */
export function FormDemo() {
  const [open, setOpen] = React.useState(false)
  const [categorias, setCategorias] = React.useState([
    { value: "cat-a", label: "Categoría A" },
    { value: "cat-b", label: "Categoría B" },
  ])
  const [nueva, setNueva] = React.useState<string | null>(null)
  const { register, handleSubmit, control, reset, setValue, formState } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: vacio })
  const { errors, isSubmitting } = formState
  const category = useWatch({ control, name: "category" })

  const cerrar = (o: boolean) => {
    setOpen(o)
    if (!o) {
      reset(vacio)
      setNueva(null)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((r) => setTimeout(r, 500))
    toast.success(`Registro «${values.name}» creado`)
    cerrar(false)
  })

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <PlusIcon /> Nuevo registro
      </Button>

      <FormularioDialog
        open={open}
        onOpenChange={cerrar}
        onVolver={() => setNueva(null)}
        sub={
          nueva !== null && (
            <NuevaCategoria
              nombre={nueva}
              onVolver={() => setNueva(null)}
              onCrear={(label) => {
                const value = `cat-${categorias.length + 1}`
                setCategorias((cs) => [...cs, { value, label }])
                setValue("category", value, { shouldValidate: true })
                setNueva(null)
              }}
            />
          )
        }
      >
        <FormularioCabecera icono={FolderPlusIcon} titulo="Nuevo registro" descripcion="Aparece en el listado en cuanto lo crees." />
        <Formulario onSubmit={onSubmit}>
          <FormularioCuerpo>
            <CampoFormulario etiqueta="Nombre" htmlFor="nr-name" obligatorio ancho="mitad" error={errors.name?.message}>
              <Input id="nr-name" placeholder="Registro 25" aria-invalid={!!errors.name} {...register("name")} />
            </CampoFormulario>
            <CampoFormulario etiqueta="Categoría" htmlFor="nr-category" obligatorio ancho="mitad" error={errors.category?.message}>
              <SelectorBuscable
                id="nr-category"
                opciones={categorias.map((c) => ({ ...c, icono: <TagIcon className="size-4 text-muted-foreground" /> }))}
                valor={category || undefined}
                onChange={(v) => setValue("category", v, { shouldValidate: !!errors.category })}
                placeholder="Elige una categoría"
                buscar="Busca una categoría"
                crear={{ label: "Nueva categoría", onCrear: setNueva }}
                invalido={!!errors.category}
              />
            </CampoFormulario>
            <CampoFormulario etiqueta="Responsable" htmlFor="nr-owner" obligatorio ancho="tercio" error={errors.owner?.message}>
              <Controller
                control={control}
                name="owner"
                render={({ field }) => <SelectorBuscable id="nr-owner" opciones={responsables.map((r) => ({ ...r, icono: <AvatarInitials name={r.label} size="sm" /> }))} valor={field.value || undefined} onChange={field.onChange} placeholder="Elige a alguien" buscar="Busca a alguien" invalido={!!errors.owner} />}
              />
            </CampoFormulario>
            <CampoFormulario etiqueta="Fecha límite" htmlFor="nr-due" obligatorio ancho="tercio" error={errors.due?.message}>
              <Controller control={control} name="due" render={({ field }) => <CampoFecha id="nr-due" valor={field.value} onChange={field.onChange} hoy={HOY} min={HOY} invalido={!!errors.due} />} />
            </CampoFormulario>
            <CampoFormulario etiqueta="Valor" htmlFor="nr-value" obligatorio ancho="tercio" ayuda="Sin impuestos." error={errors.value?.message}>
              <InputGroup>
                <InputGroupInput id="nr-value" type="number" inputMode="decimal" min={0} step={100} placeholder="12000" aria-invalid={!!errors.value} {...register("value", { valueAsNumber: true })} />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>€</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </CampoFormulario>
            <CampoFormulario etiqueta="Prioridad">
              <Controller control={control} name="priority" render={({ field }) => <TarjetasOpcion aria-label="Prioridad" columnas={3} opciones={PRIORIDADES} valor={field.value} onChange={field.onChange} />} />
            </CampoFormulario>
            <CampoFormulario etiqueta="Notas" htmlFor="nr-notes" error={errors.notes?.message}>
              <Textarea id="nr-notes" rows={3} placeholder="Contexto útil para quien lo retome" {...register("notes")} />
            </CampoFormulario>
          </FormularioCuerpo>
          <FormularioPie izquierda={<AvisoObligatorios />}>
            <Button type="button" variant="outline" size="lg" disabled={isSubmitting} onClick={() => cerrar(false)}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Creando…" : "Crear registro"}
            </Button>
          </FormularioPie>
        </Formulario>
      </FormularioDialog>
    </>
  )
}

/** La pantalla que se abre encima: crear la opción que faltaba. */
function NuevaCategoria({ nombre, onVolver, onCrear }: { nombre: string; onVolver: () => void; onCrear: (label: string) => void }) {
  const [texto, setTexto] = React.useState(nombre)
  const [error, setError] = React.useState<string>()
  return (
    <>
      <FormularioCabecera icono={TagIcon} titulo="Nueva categoría" descripcion="Queda en la lista para los próximos registros." migas="Nuevo registro" onVolver={onVolver} />
      <Formulario
        onSubmit={(e) => {
          e.preventDefault()
          if (!texto.trim()) return setError("Escribe el nombre de la categoría")
          onCrear(texto.trim())
        }}
      >
        <FormularioCuerpo>
          <CampoFormulario etiqueta="Nombre" htmlFor="nc-cat" obligatorio error={error}>
            <Input id="nc-cat" autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Categoría C" aria-invalid={!!error} />
          </CampoFormulario>
        </FormularioCuerpo>
        <FormularioPie izquierda={<AvisoObligatorios />}>
          <Button type="button" variant="outline" size="lg" onClick={onVolver}>
            Volver
          </Button>
          <Button type="submit" size="lg">
            Crear categoría
          </Button>
        </FormularioPie>
      </Formulario>
    </>
  )
}
