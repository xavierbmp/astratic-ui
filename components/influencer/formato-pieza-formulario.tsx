"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ShapesIcon, Trash2Icon } from "lucide-react"
import { LISTA_TIPOS_PIEZA, TIPOS_PIEZA, type FormatoPieza, type TipoPieza } from "@/lib/influencer/modelo"
import { nombreRepetido } from "@/lib/influencer/ajustes-collabs"
import { idNuevo } from "@/lib/influencer/tareas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { CampoFormulario, Formulario, FormularioCabecera, FormularioCuerpo, FormularioPie } from "@/components/app/formulario/formulario-dialog"
import { TarjetasOpcion } from "@/components/app/formulario/opciones-visuales"
import { SelectorPlataforma } from "@/components/influencer/plataformas"
import { ICONOS_PIEZA } from "@/components/influencer/piezas-editor"

const esquema = z.object({
  nombre: z.string().trim().max(40, "Máximo 40 caracteres"),
  tipo: z.enum(LISTA_TIPOS_PIEZA),
  plataforma: z.string().optional(),
  conGuion: z.boolean(),
})

type Valores = z.infer<typeof esquema>

const QUE_SE_REVISA: Record<TipoPieza, string> = {
  video: "La marca revisa el guion y el vídeo",
  foto: "El guion o el texto y la foto",
  carrusel: "El texto y las fotos del carrusel",
  texto: "Solo el texto: una mención, una newsletter",
}

const OPCIONES_TIPO = LISTA_TIPOS_PIEZA.map((t) => ({ value: t, label: TIPOS_PIEZA[t].label, descripcion: QUE_SE_REVISA[t], icono: ICONOS_PIEZA[t] }))

/**
 * Crear o cambiar un formato de pieza, como pantalla de un formulario (`FormularioDialog sub`): su
 * nombre, qué se entrega (decide qué revisa la marca) y dónde se publica. Al cambiar uno se puede
 * quitar; las piezas que ya se hicieron con él no cambian.
 */
export function FormatoPiezaFormulario({ formato, nombreInicial = "", formatos, migas, onGuardar, onEliminar, onVolver }: { formato?: FormatoPieza; nombreInicial?: string; formatos: FormatoPieza[]; migas?: string; onGuardar: (formato: FormatoPieza) => void; onEliminar?: (id: string) => void; onVolver: () => void }) {
  const { register, handleSubmit, control, setError, formState } = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: { nombre: formato?.nombre ?? nombreInicial, tipo: formato?.tipo ?? "video", plataforma: formato ? formato.plataforma : "instagram", conGuion: formato?.conGuion ?? true },
  })
  const { errors } = formState
  const tipo = useWatch({ control, name: "tipo" })

  const guardar = (v: Valores) => {
    // Sin nombre, el de su tipo: ningún campo es obligatorio.
    const nombre = v.nombre.trim() || TIPOS_PIEZA[v.tipo].label
    const repetido = nombreRepetido(formatos, nombre, formato?.id)
    if (repetido) return setError("nombre", { message: repetido })
    onGuardar({ id: formato?.id ?? idNuevo("fp"), nombre, tipo: v.tipo, plataforma: v.plataforma?.trim() || undefined, conGuion: v.tipo !== "texto" && v.conGuion })
  }

  return (
    <>
      <FormularioCabecera icono={ShapesIcon} titulo={formato ? `Cambiar «${formato.nombre}»` : "Nuevo formato de pieza"} descripcion="Para todo lo que no es un reel ni una story: una mención en la bio, un podcast, una newsletter. Queda en tu lista para la próxima vez." migas={migas} onVolver={onVolver} />
      <Formulario onSubmit={handleSubmit(guardar)}>
        <FormularioCuerpo>
          <CampoFormulario etiqueta="Nombre" htmlFor="fp-nombre" error={errors.nombre?.message}>
            <Input id="fp-nombre" autoFocus placeholder="Mención en la bio" aria-invalid={!!errors.nombre} {...register("nombre")} />
          </CampoFormulario>
          <CampoFormulario etiqueta="Qué entregas" ayuda="Decide qué te revisa la marca antes de publicar.">
            <Controller control={control} name="tipo" render={({ field }) => <TarjetasOpcion aria-label="Qué entregas" opciones={OPCIONES_TIPO} valor={field.value} onChange={field.onChange} />} />
          </CampoFormulario>
          <CampoFormulario etiqueta="Dónde se publica" ayuda="Sale como atajo cuando la collab es de esa plataforma.">
            <Controller control={control} name="plataforma" render={({ field }) => <SelectorPlataforma aria-label="Dónde se publica" value={field.value} onChange={field.onChange} />} />
          </CampoFormulario>
          {tipo !== "texto" && (
            <CampoFormulario etiqueta="Guion" ayuda="Si se manda el guion a la marca antes de grabar. Se cambia en cada pieza.">
              <Controller
                control={control}
                name="conGuion"
                render={({ field }) => (
                  <label className="flex items-center gap-2.5 text-sm">
                    <Switch checked={field.value} onCheckedChange={field.onChange} /> Pide guion de serie
                  </label>
                )}
              />
            </CampoFormulario>
          )}
        </FormularioCuerpo>
        <FormularioPie
          izquierda={
            formato && onEliminar ? (
              <Button type="button" variant="ghost" size="sm" className="-ml-2 text-danger hover:text-danger" onClick={() => onEliminar(formato.id)}>
                <Trash2Icon /> Quitar de la lista
              </Button>
            ) : undefined
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
