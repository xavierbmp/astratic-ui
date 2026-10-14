"use client"

import * as React from "react"
import Image from "next/image"
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
import { CampoFormulario, Formulario, FormularioCabecera, FormularioCuerpo, FormularioDialog, FormularioPie } from "@/components/app/formulario/formulario-dialog"
import { PortadaFormulario } from "@/components/app/formulario/portada-formulario"
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

// Nada es obligatorio: solo se avisa de lo que no vale.
const schema = z.object({
  name: z.string().trim().max(80, "Máximo 80 caracteres"),
  category: z.string(),
  owner: z.string(),
  due: z.string(),
  value: z.number().min(0, "No puede ser negativo").or(z.nan()),
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
  const [portada, setPortada] = React.useState<string>()
  const [logo, setLogo] = React.useState<string>()
  const { register, handleSubmit, control, reset, setValue, formState } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: vacio })
  const { errors, isSubmitting } = formState
  const category = useWatch({ control, name: "category" })

  const cerrar = (o: boolean) => {
    setOpen(o)
    if (!o) {
      reset(vacio)
      setNueva(null)
      setPortada(undefined)
      setLogo(undefined)
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    await new Promise((r) => setTimeout(r, 500))
    toast.success(`Registro «${values.name || "Sin nombre"}» creado`)
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
            <PortadaFormulario
              portada={portada}
              onPortada={(f) => setPortada(URL.createObjectURL(f))}
              onQuitarPortada={() => setPortada(undefined)}
              logo={logo ? <Image src={logo} alt="" width={64} height={64} unoptimized className="size-16 rounded-xl object-cover" /> : undefined}
              onLogo={(f) => setLogo(URL.createObjectURL(f))}
            >
              <CampoFormulario etiqueta="Nombre" htmlFor="nr-name" ancho="mitad" error={errors.name?.message}>
                <Input id="nr-name" placeholder="Registro 25" aria-invalid={!!errors.name} {...register("name")} />
              </CampoFormulario>
              <CampoFormulario etiqueta="Categoría" htmlFor="nr-category" ancho="mitad">
                <SelectorBuscable
                  id="nr-category"
                  opciones={categorias.map((c) => ({ ...c, icono: <TagIcon className="size-4 text-muted-foreground" /> }))}
                  valor={category || undefined}
                  onChange={(v) => setValue("category", v)}
                  placeholder="Escribe o elige una categoría"
                  onCrear={setNueva}
                  vaciable
                />
              </CampoFormulario>
            </PortadaFormulario>
            <CampoFormulario etiqueta="Responsable" htmlFor="nr-owner" ancho="tercio">
              <Controller
                control={control}
                name="owner"
                render={({ field }) => <SelectorBuscable id="nr-owner" opciones={responsables.map((r) => ({ ...r, icono: <AvatarInitials name={r.label} size="sm" /> }))} valor={field.value || undefined} onChange={field.onChange} placeholder="Escribe o elige" vaciable />}
              />
            </CampoFormulario>
            <CampoFormulario etiqueta="Fecha límite" htmlFor="nr-due" ancho="tercio">
              <Controller control={control} name="due" render={({ field }) => <CampoFecha id="nr-due" valor={field.value} onChange={field.onChange} hoy={HOY} min={HOY} />} />
            </CampoFormulario>
            <CampoFormulario etiqueta="Valor" htmlFor="nr-value" ancho="tercio" ayuda="Sin impuestos." error={errors.value?.message}>
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
          <FormularioPie>
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
  return (
    <>
      <FormularioCabecera icono={TagIcon} titulo="Nueva categoría" descripcion="Queda en la lista para los próximos registros." migas="Nuevo registro" onVolver={onVolver} />
      <Formulario
        onSubmit={(e) => {
          e.preventDefault()
          onCrear(texto.trim() || "Sin nombre")
        }}
      >
        <FormularioCuerpo>
          <CampoFormulario etiqueta="Nombre" htmlFor="nc-cat">
            <Input id="nc-cat" autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Categoría C" />
          </CampoFormulario>
        </FormularioCuerpo>
        <FormularioPie>
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
