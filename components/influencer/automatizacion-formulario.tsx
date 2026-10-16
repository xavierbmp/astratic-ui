"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { FilePlus2Icon, ListTodoIcon, Trash2Icon, ZapIcon } from "lucide-react"
import { LISTA_TIPOS_TAREA, PRIORIDADES_TAREA, TIPOS_TAREA, type PrioridadTarea, type TipoTarea } from "@/lib/influencer/modelo"
import {
  EVENTOS,
  FECHAS_BASE,
  REGISTROS_AUTOMATICOS,
  eventosDelBloque,
  fechasDe,
  registrosDe,
  variablesDe,
  type Automatizacion,
  type BloqueAutomatizable,
  type EventoAutomatizacion,
  type FechaBase,
  type RegistroAutomatico,
} from "@/lib/influencer/automatizaciones"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { CampoFormulario, Formulario, FormularioCabecera, FormularioCuerpo, FormularioPie } from "@/components/app/formulario/formulario-dialog"
import { SelectorBuscable } from "@/components/app/formulario/selector-buscable"
import { TarjetasOpcion } from "@/components/app/formulario/opciones-visuales"
import { PrioridadIcono } from "@/components/influencer/task-cells"
import { EditorSubtareas } from "@/components/influencer/task-subtareas"

const esquema = z.object({
  evento: z.string(),
  tipo: z.enum(["tarea", "registro"]),
  registro: z.enum(["collab", "contrato"]),
  titulo: z.string().trim().max(160, "Máximo 160 caracteres"),
  dias: z.number({ error: "Escribe un número de días" }).int("Días enteros").min(0, "Pon 0 o más días").max(365, "Como mucho, un año"),
  sentido: z.enum(["despues", "antes"]),
  desde: z.enum(["hoy", "inicio", "fin", "ultima-publicacion", "publicacion", "guion"]),
  prioridad: z.enum(["urgente", "alta", "normal", "baja"]),
  pagina: z.enum(LISTA_TIPOS_TAREA),
  porCadaPieza: z.boolean(),
  agruparPorVersion: z.boolean(),
  subtareas: z.array(z.string()),
})

type Valores = z.infer<typeof esquema>

/** La página en la que sale una tarea si no se dice otra: la de lo que pasa. */
const paginaDe = (evento: EventoAutomatizacion): TipoTarea => (EVENTOS[evento].objeto === "propuesta" ? "crm" : "collabs")
const esEvento = (v: string) => (Object.keys(EVENTOS) as EventoAutomatizacion[]).find((e) => e === v)
const esFecha = (v: string) => (Object.keys(FECHAS_BASE) as FechaBase[]).find((f) => f === v)
const esRegistro = (v: string) => (Object.keys(REGISTROS_AUTOMATICOS) as RegistroAutomatico[]).find((r) => r === v)
const esTipo = (v: string) => LISTA_TIPOS_TAREA.find((t) => t === v)
const esPrioridad = (v: string) => PRIORIDADES_TAREA.find((p) => p.id === v)?.id

function valoresDe(r: Automatizacion): Valores {
  const a = r.accion
  const base = { evento: r.evento, registro: registrosDe(r.evento)[0] ?? "collab", titulo: "", dias: 0, sentido: "despues", desde: "hoy", prioridad: "normal", pagina: paginaDe(r.evento), porCadaPieza: false, agruparPorVersion: false, subtareas: [] } satisfies Omit<Valores, "tipo">
  if (a.tipo === "registro") return { ...base, tipo: "registro", registro: a.registro }
  return {
    ...base,
    tipo: "tarea",
    titulo: a.titulo,
    dias: Math.abs(a.cuando.dias),
    sentido: a.cuando.dias < 0 ? "antes" : "despues",
    desde: a.cuando.desde,
    prioridad: a.prioridad,
    pagina: a.pagina ?? paginaDe(r.evento),
    porCadaPieza: !!a.porCadaPieza,
    agruparPorVersion: !!a.agruparPorVersion,
    subtareas: a.subtareas,
  }
}

function aRegla(v: Valores, r: Automatizacion): Automatizacion {
  const evento = esEvento(v.evento) ?? r.evento
  if (v.tipo === "registro") return { ...r, evento, accion: { tipo: "registro", registro: v.registro } }
  const objeto = EVENTOS[evento].objeto
  const porCadaPieza = objeto === "collab" && v.porCadaPieza
  const desde = fechasDe(evento, porCadaPieza).includes(v.desde) ? v.desde : "hoy"
  return {
    ...r,
    evento,
    accion: {
      tipo: "tarea",
      titulo: v.titulo || "Tarea automática",
      cuando: { dias: desde === "hoy" || v.sentido === "despues" ? v.dias : -v.dias, desde },
      prioridad: v.prioridad as PrioridadTarea,
      subtareas: v.subtareas.map((s) => s.trim()).filter(Boolean),
      ...(porCadaPieza ? { porCadaPieza: true } : {}),
      ...(objeto === "version" && v.agruparPorVersion ? { agruparPorVersion: true } : {}),
      ...(v.pagina !== paginaDe(evento) ? { pagina: v.pagina } : {}),
    },
  }
}

const OPCIONES_PRIORIDAD = PRIORIDADES_TAREA.map((p) => ({ value: p.id, label: p.label, icono: <PrioridadIcono prioridad={p.id} /> }))
const OPCIONES_PAGINA = LISTA_TIPOS_TAREA.map((t) => ({ value: t, label: t === "sin-tipo" ? "Solo en Tareas" : TIPOS_TAREA[t] }))
const OPCIONES_SENTIDO = [
  { value: "despues", label: "después de" },
  { value: "antes", label: "antes de" },
]

/**
 * Una automatización de un bloque, para crearla o cambiarla: cuándo (lo que pasa en ese bloque) y qué
 * hace (una tarea, con su título con variables, su día, su prioridad, la página en la que sale y sus
 * subtareas; o un registro, la collab o el contrato). En una pantalla de `FormularioDialog`.
 */
export function AutomatizacionFormulario({ regla, bloque, nueva, onGuardar, onCancelar, onEliminar }: { regla: Automatizacion; bloque: BloqueAutomatizable; nueva: boolean; onGuardar: (r: Automatizacion) => void; onCancelar: () => void; onEliminar?: () => void }) {
  const { register, handleSubmit, control, setValue, getValues, formState } = useForm<Valores>({ resolver: zodResolver(esquema), defaultValues: valoresDe(regla) })
  const { errors } = formState
  const [evento, tipo, desde, porCadaPieza] = useWatch({ control, name: ["evento", "tipo", "desde", "porCadaPieza"] })
  const elEvento = esEvento(evento) ?? regla.evento
  const objeto = EVENTOS[elEvento].objeto
  const registros = registrosDe(elEvento)
  const fechas = fechasDe(elEvento, porCadaPieza)
  const titulo = React.useRef<HTMLInputElement | null>(null)
  const { ref: refTitulo, ...campoTitulo } = register("titulo")

  const cambiarEvento = (id: string) => {
    const e = esEvento(id)
    if (!e) return
    setValue("evento", e)
    // Lo que ya no vale con el evento nuevo vuelve a lo de serie.
    if (!registrosDe(e).length) setValue("tipo", "tarea")
    else setValue("registro", registrosDe(e)[0])
    if (!fechasDe(e, getValues("porCadaPieza")).includes(getValues("desde"))) setValue("desde", "hoy")
    if (getValues("pagina") === paginaDe(elEvento)) setValue("pagina", paginaDe(e))
  }
  const insertarVariable = (clave: string) => {
    const actual = getValues("titulo")
    const el = titulo.current
    const en = el?.selectionStart ?? actual.length
    setValue("titulo", `${actual.slice(0, en)}${clave}${actual.slice(el?.selectionEnd ?? en)}`, { shouldDirty: true })
    el?.focus()
  }

  return (
    <>
      <FormularioCabecera icono={ZapIcon} titulo={nueva ? "Nueva automatización" : "Automatización"} descripcion="Cuando pasa algo en este bloque, se crea sola una tarea o un registro." />
      <Formulario onSubmit={handleSubmit((v) => onGuardar(aRegla(v, regla)))}>
        <FormularioCuerpo>
          <CampoFormulario etiqueta="Cuando" htmlFor="auto-evento">
            <SelectorBuscable id="auto-evento" opciones={eventosDelBloque(bloque).map((e) => ({ value: e, label: EVENTOS[e].label }))} valor={elEvento} onChange={cambiarEvento} vacio="Nada se llama así" />
          </CampoFormulario>

          {registros.length > 0 && (
            <CampoFormulario etiqueta="Qué hace">
              <Controller
                control={control}
                name="tipo"
                render={({ field }) => (
                  <TarjetasOpcion
                    aria-label="Qué hace"
                    valor={field.value}
                    onChange={field.onChange}
                    opciones={[
                      { value: "tarea", label: "Crea una tarea", descripcion: "Con su día, su prioridad y sus subtareas.", icono: ListTodoIcon },
                      { value: "registro", label: "Crea un registro", descripcion: registros.map((r) => REGISTROS_AUTOMATICOS[r].label).join(" o "), icono: FilePlus2Icon },
                    ]}
                  />
                )}
              />
            </CampoFormulario>
          )}

          {tipo === "registro" ? (
            <CampoFormulario etiqueta="Registro" htmlFor="auto-registro" ayuda={REGISTROS_AUTOMATICOS[getValues("registro")].descripcion}>
              <Controller
                control={control}
                name="registro"
                render={({ field }) => <SelectorBuscable id="auto-registro" opciones={registros.map((r) => ({ value: r, label: REGISTROS_AUTOMATICOS[r].label }))} valor={field.value} onChange={(v) => esRegistro(v) && field.onChange(esRegistro(v))} />}
              />
            </CampoFormulario>
          ) : (
            <>
              <CampoFormulario
                etiqueta="Qué hay que hacer"
                htmlFor="auto-titulo"
                error={errors.titulo?.message}
                ayuda={
                  <span className="-ml-1 flex flex-wrap items-center gap-0.5">
                    <span className="ml-1">Se rellena sola con:</span>
                    {variablesDe(elEvento, porCadaPieza).map((v) => (
                      <button key={v.clave} type="button" onClick={() => insertarVariable(v.clave)} className="rounded px-1 font-medium text-foreground hover:bg-muted">
                        {v.label}
                      </button>
                    ))}
                  </span>
                }
              >
                <Input
                  id="auto-titulo"
                  placeholder="Mandar la factura a {marca}"
                  aria-invalid={!!errors.titulo}
                  {...campoTitulo}
                  ref={(el) => {
                    refTitulo(el)
                    titulo.current = el
                  }}
                />
              </CampoFormulario>

              {objeto === "collab" && (
                <Controller
                  control={control}
                  name="porCadaPieza"
                  render={({ field }) => (
                    <label className="col-span-6 flex cursor-pointer items-start gap-2.5 text-sm">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(v) => {
                          field.onChange(v === true)
                          setValue("desde", v === true ? "publicacion" : "hoy")
                        }}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="block font-medium">Una por cada contenido</span>
                        <span className="block text-xs text-muted-foreground">En la fecha de cada entregable: «Publicar {"{pieza}"}» el día que se publica.</span>
                      </span>
                    </label>
                  )}
                />
              )}
              {objeto === "version" && (
                <Controller
                  control={control}
                  name="agruparPorVersion"
                  render={({ field }) => (
                    <label className="col-span-6 flex cursor-pointer items-start gap-2.5 text-sm">
                      <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} className="mt-0.5" />
                      <span>
                        <span className="block font-medium">Una tarea por versión, con cada comentario como subtarea</span>
                        <span className="block text-xs text-muted-foreground">Si la marca sigue comentando, se añaden a la misma tarea; desde la v2, una tarea nueva.</span>
                      </span>
                    </label>
                  )}
                />
              )}

              <CampoFormulario etiqueta="Días" htmlFor="auto-dias" ancho="tercio" error={errors.dias?.message}>
                <Input id="auto-dias" type="number" min={0} max={365} inputMode="numeric" aria-invalid={!!errors.dias} {...register("dias", { valueAsNumber: true })} />
              </CampoFormulario>
              <CampoFormulario etiqueta="Antes o después" htmlFor="auto-sentido" ancho="tercio">
                <Controller control={control} name="sentido" render={({ field }) => <SelectorBuscable id="auto-sentido" opciones={desde === "hoy" ? OPCIONES_SENTIDO.slice(0, 1) : OPCIONES_SENTIDO} valor={desde === "hoy" ? "despues" : field.value} onChange={(v) => field.onChange(v === "antes" ? "antes" : "despues")} />} />
              </CampoFormulario>
              <CampoFormulario etiqueta="De" htmlFor="auto-desde" ancho="tercio">
                <Controller control={control} name="desde" render={({ field }) => <SelectorBuscable id="auto-desde" opciones={fechas.map((f) => ({ value: f, label: FECHAS_BASE[f] }))} valor={fechas.includes(field.value) ? field.value : "hoy"} onChange={(v) => esFecha(v) && field.onChange(esFecha(v))} />} />
              </CampoFormulario>

              <CampoFormulario etiqueta="Prioridad" htmlFor="auto-prioridad" ancho="mitad">
                <Controller control={control} name="prioridad" render={({ field }) => <SelectorBuscable id="auto-prioridad" opciones={OPCIONES_PRIORIDAD} valor={field.value} onChange={(v) => esPrioridad(v) && field.onChange(esPrioridad(v))} />} />
              </CampoFormulario>
              <CampoFormulario etiqueta="Sale en" htmlFor="auto-pagina" ancho="mitad" ayuda="Además de en Tareas.">
                <Controller control={control} name="pagina" render={({ field }) => <SelectorBuscable id="auto-pagina" opciones={OPCIONES_PAGINA} valor={field.value} onChange={(v) => esTipo(v) && field.onChange(esTipo(v))} />} />
              </CampoFormulario>

              <CampoFormulario etiqueta="Subtareas" htmlFor="auto-subtareas">
                <Controller control={control} name="subtareas" render={({ field }) => <EditorSubtareas id="auto-subtareas" value={field.value} onChange={field.onChange} />} />
              </CampoFormulario>
            </>
          )}
        </FormularioCuerpo>
        <FormularioPie
          izquierda={
            onEliminar ? (
              <Button type="button" variant="ghost" size="lg" className="text-destructive hover:text-destructive" onClick={onEliminar}>
                <Trash2Icon /> Eliminar
              </Button>
            ) : undefined
          }
        >
          <Button type="button" variant="outline" size="lg" onClick={onCancelar}>
            Cancelar
          </Button>
          <Button type="submit" size="lg">
            {nueva ? "Crear automatización" : "Guardar"}
          </Button>
        </FormularioPie>
      </Formulario>
    </>
  )
}
