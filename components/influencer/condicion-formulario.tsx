"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FileSignatureIcon } from "lucide-react"
import type { TipoCondicion } from "@/lib/influencer/modelo"
import { iconoSugerido, nombreRepetido } from "@/lib/influencer/ajustes-collabs"
import { idNuevo } from "@/lib/influencer/tareas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { CampoFormulario, Formulario, FormularioCabecera, FormularioCuerpo, FormularioPie } from "@/components/app/formulario/formulario-dialog"
import { IconosOpcion } from "@/components/app/formulario/opciones-visuales"
import { OPCIONES_ICONO_CONDICION } from "@/components/influencer/condiciones-editor"

const esquema = z.object({
  nombre: z.string().trim().max(40, "Máximo 40 caracteres"),
  icono: z.string(),
  conDias: z.boolean(),
  dias: z.string().refine((v) => !v || (Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 3650), "Entre 1 y 3.650 días"),
})

type Valores = z.infer<typeof esquema>

/**
 * Crear una condición que no está en la lista, como pantalla de un formulario (`FormularioDialog
 * sub`): su nombre, su icono (el que se ve en los entregables; de entrada, el que le va por el
 * nombre) y si lleva días, con los que salen de serie. Queda en su lista para la próxima vez.
 */
export function CondicionFormulario({ nombreInicial = "", tipos, migas, onGuardar, onVolver }: { nombreInicial?: string; tipos: TipoCondicion[]; migas?: string; onGuardar: (tipo: TipoCondicion) => void; onVolver: () => void }) {
  const { register, handleSubmit, control, setValue, setError, formState } = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: { nombre: nombreInicial, icono: iconoSugerido(nombreInicial), conDias: true, dias: "" },
  })
  const { errors } = formState
  const conDias = useWatch({ control, name: "conDias" })
  // Mientras no elija uno, el icono sigue al nombre.
  const [iconoElegido, setIconoElegido] = React.useState(false)

  const guardar = (v: Valores) => {
    const nombre = v.nombre.trim() || "Condición"
    const repetido = nombreRepetido(tipos, nombre)
    if (repetido) return setError("nombre", { message: repetido })
    onGuardar({ id: idNuevo("cd"), nombre, icono: v.icono, conDias: v.conDias, dias: v.conDias && v.dias ? Number(v.dias) : undefined })
  }

  return (
    <>
      <FormularioCabecera icono={FileSignatureIcon} titulo="Nueva condición" descripcion="Se muestra en los entregables con su icono y su duración, y se guarda en tu lista." migas={migas} onVolver={onVolver} />
      <Formulario onSubmit={handleSubmit(guardar)}>
        <FormularioCuerpo>
          <CampoFormulario etiqueta="Nombre" htmlFor="cd-nombre" error={errors.nombre?.message}>
            <Input
              id="cd-nombre"
              autoFocus
              placeholder="Exclusividad en cosmética"
              aria-invalid={!!errors.nombre}
              {...register("nombre", { onChange: (e: React.ChangeEvent<HTMLInputElement>) => !iconoElegido && setValue("icono", iconoSugerido(e.target.value)) })}
            />
          </CampoFormulario>
          <CampoFormulario etiqueta="Icono">
            <Controller
              control={control}
              name="icono"
              render={({ field }) => (
                <IconosOpcion
                  tamano="sm"
                  aria-label="Icono"
                  opciones={OPCIONES_ICONO_CONDICION}
                  valor={field.value}
                  onChange={(v) => {
                    if (!v) return
                    setIconoElegido(true)
                    field.onChange(v)
                  }}
                />
              )}
            />
          </CampoFormulario>
          <CampoFormulario etiqueta="Días" htmlFor="cd-dias" ayuda="Duración predeterminada, por ejemplo 30 días de exclusividad. Se puede cambiar en cada entregable." error={errors.dias?.message}>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <Controller
                control={control}
                name="conDias"
                render={({ field }) => (
                  <label className="flex items-center gap-2.5">
                    <Switch checked={field.value} onCheckedChange={field.onChange} /> Lleva días
                  </label>
                )}
              />
              {conDias && (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Input id="cd-dias" type="number" min={1} inputMode="numeric" placeholder="30" aria-invalid={!!errors.dias} className="w-24" {...register("dias")} />
                  días de serie
                </span>
              )}
            </div>
          </CampoFormulario>
        </FormularioCuerpo>
        <FormularioPie>
          <Button type="button" variant="outline" size="lg" onClick={onVolver}>
            Volver
          </Button>
          <Button type="submit" size="lg">
            Crear condición
          </Button>
        </FormularioPie>
      </Formulario>
    </>
  )
}
