"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { BanIcon, ShapesIcon, Trash2Icon } from "lucide-react"
import { LISTA_TIPOS_PIEZA, TIPOS_PIEZA, type FormatoPieza, type TipoPieza } from "@/lib/influencer/modelo"
import { REDES_PIEZA } from "@/lib/influencer/formularios"
import { nombreRepetido } from "@/lib/influencer/formatos-pieza"
import { idNuevo } from "@/lib/influencer/tareas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SocialIcon, socialLabel } from "@/components/app/social-icons"
import { AvisoObligatorios, CampoFormulario, Formulario, FormularioCabecera, FormularioCuerpo, FormularioPie } from "@/components/app/formulario/formulario-dialog"
import { IconosOpcion, TarjetasOpcion } from "@/components/app/formulario/opciones-visuales"
import { ICONOS_PIEZA } from "@/components/influencer/piezas-editor"

const SIN_RED = "ninguna"

const esquema = z.object({
  nombre: z.string().trim().min(1, "Ponle nombre: «Mención en la bio», «Newsletter»…").max(40, "Máximo 40 caracteres"),
  tipo: z.enum(LISTA_TIPOS_PIEZA),
  red: z.string(),
})

type Valores = z.infer<typeof esquema>

const QUE_SE_REVISA: Record<TipoPieza, string> = {
  video: "La marca revisa el guion y el vídeo",
  foto: "El guion o el texto y la foto",
  carrusel: "El texto y las fotos del carrusel",
  texto: "Solo el texto: una mención, una newsletter",
}

const OPCIONES_TIPO = LISTA_TIPOS_PIEZA.map((t) => ({ value: t, label: TIPOS_PIEZA[t].label, descripcion: QUE_SE_REVISA[t], icono: ICONOS_PIEZA[t] }))
const OPCIONES_RED = [...REDES_PIEZA.map((r) => ({ value: r, label: socialLabel[r], icono: <SocialIcon network={r} /> })), { value: SIN_RED, label: "En ningún sitio (solo se entrega)", icono: <BanIcon /> }]

/**
 * Crear o cambiar un formato de pieza, como pantalla de un formulario (`FormularioDialog sub`): su
 * nombre, qué se entrega (decide qué revisa la marca) y dónde se publica. Al cambiar uno se puede
 * quitar; las piezas que ya se hicieron con él no cambian.
 */
export function FormatoPiezaFormulario({ formato, nombreInicial = "", formatos, migas, onGuardar, onEliminar, onVolver }: { formato?: FormatoPieza; nombreInicial?: string; formatos: FormatoPieza[]; migas?: string; onGuardar: (formato: FormatoPieza) => void; onEliminar?: (id: string) => void; onVolver: () => void }) {
  const { register, handleSubmit, control, setError, formState } = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: { nombre: formato?.nombre ?? nombreInicial, tipo: formato?.tipo ?? "video", red: formato?.red ?? "instagram" },
  })
  const { errors } = formState
  const red = useWatch({ control, name: "red" })

  const guardar = (v: Valores) => {
    const repetido = nombreRepetido(formatos, v.nombre, formato?.id)
    if (repetido) return setError("nombre", { message: repetido })
    onGuardar({ id: formato?.id ?? idNuevo("fp"), nombre: v.nombre.trim(), tipo: v.tipo, red: REDES_PIEZA.find((r) => r === v.red) })
  }

  return (
    <>
      <FormularioCabecera icono={ShapesIcon} titulo={formato ? `Cambiar «${formato.nombre}»` : "Nuevo formato de pieza"} descripcion="Para todo lo que no es un reel ni una story: una mención en la bio, un podcast, una newsletter. Queda en tu lista para la próxima vez." migas={migas} onVolver={onVolver} />
      <Formulario onSubmit={handleSubmit(guardar)}>
        <FormularioCuerpo>
          <CampoFormulario etiqueta="Nombre" htmlFor="fp-nombre" obligatorio error={errors.nombre?.message}>
            <Input id="fp-nombre" autoFocus placeholder="Mención en la bio" aria-invalid={!!errors.nombre} {...register("nombre")} />
          </CampoFormulario>
          <CampoFormulario etiqueta="Qué entregas" obligatorio ayuda="Decide qué te revisa la marca antes de publicar.">
            <Controller control={control} name="tipo" render={({ field }) => <TarjetasOpcion aria-label="Qué entregas" opciones={OPCIONES_TIPO} valor={field.value} onChange={field.onChange} />} />
          </CampoFormulario>
          <CampoFormulario etiqueta="Dónde se publica" ayuda={OPCIONES_RED.find((o) => o.value === red)?.label}>
            <Controller control={control} name="red" render={({ field }) => <IconosOpcion aria-label="Dónde se publica" opciones={OPCIONES_RED} valor={field.value} onChange={(v) => field.onChange(v ?? SIN_RED)} />} />
          </CampoFormulario>
        </FormularioCuerpo>
        <FormularioPie
          izquierda={
            formato && onEliminar ? (
              <Button type="button" variant="ghost" size="sm" className="-ml-2 text-danger hover:text-danger" onClick={() => onEliminar(formato.id)}>
                <Trash2Icon /> Quitar de la lista
              </Button>
            ) : (
              <AvisoObligatorios />
            )
          }
        >
          <Button type="button" variant="outline" size="lg" onClick={onVolver}>
            Volver
          </Button>
          <Button type="submit" size="lg">
            {formato ? "Guardar formato" : "Crear formato"}
          </Button>
        </FormularioPie>
      </Formulario>
    </>
  )
}
