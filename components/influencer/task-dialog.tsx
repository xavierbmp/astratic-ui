"use client"

import * as React from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CircleDashedIcon, ListTodoIcon } from "lucide-react"
import { cn } from "cn"
import { LISTA_TIPOS_TAREA, PRIORIDADES_TAREA, TIPOS_TAREA, type DondeTarea, type EtiquetaTarea, type PlantillaTarea, type PrioridadTarea, type Repeticion, type Tarea } from "@/lib/influencer/modelo"
import { SIN_TIPO, cambiarTipo, idNuevo, migasDonde, nuevaTarea, type ContextoTareas } from "@/lib/influencer/tareas"
import { lunesDe, sumarDias } from "@/lib/influencer/fechas"
import { tintFor } from "@/lib/influencer/tints"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelect } from "@/components/app/multi-select"
import { CampoFormulario, Formulario, FormularioCabecera, FormularioCuerpo, FormularioDialog, FormularioPie } from "@/components/app/formulario/formulario-dialog"
import { SelectorBuscable } from "@/components/app/formulario/selector-buscable"
import { CampoFecha } from "@/components/app/formulario/campo-fecha"
import { claveDe, etiquetaDeQue, opcionesDeQue } from "@/components/influencer/task-tipo"
import { ICONO_TIPO_TAREA, PrioridadBandera } from "@/components/influencer/task-cells"
import { SelectorRepeticion } from "@/components/influencer/task-repeticion"
import { EditorSubtareas } from "@/components/influencer/task-subtareas"

// Nada es obligatorio: sin título, «Tarea sin título».
const esquema = z
  .object({
    titulo: z.string().trim().max(160, "Máximo 160 caracteres"),
    donde: z.custom<DondeTarea>((v) => !!v && typeof v === "object"),
    fecha: z.string(),
    hora: z.string(),
    fechaLimite: z.string(),
    prioridad: z.enum(["urgente", "alta", "normal", "baja"]),
    etiquetas: z.array(z.string()),
    repetir: z.custom<Repeticion>().optional(),
    notas: z.string().trim().max(2000, "Máximo 2.000 caracteres"),
    subtareas: z.array(z.string()),
  })
  .refine((v) => !v.fechaLimite || !v.fecha || v.fechaLimite >= v.fecha, { message: "Es antes del día en que la haces", path: ["fechaLimite"] })

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

const OPCIONES_TIPO = LISTA_TIPOS_TAREA.map((t) => {
  const Icono = t === "sin-tipo" ? CircleDashedIcon : ICONO_TIPO_TAREA[t]
  return { value: t, label: TIPOS_TAREA[t], icono: <Icono className="size-4 text-muted-foreground" /> }
})
const OPCIONES_PRIORIDAD = PRIORIDADES_TAREA.map((p) => ({ value: p.id, label: p.label, icono: <PrioridadBandera prioridad={p.id} /> }))
/** Los selectores que son un botón, con la cara de los demás campos del formulario (40 px, sin relleno). */
const CONTROL_BOTON = "h-10 rounded-md bg-transparent font-normal hover:bg-muted/50 dark:bg-input/30"
const esTipo = (v: string) => LISTA_TIPOS_TAREA.find((t) => t === v)
const esPrioridad = (v: string) => PRIORIDADES_TAREA.find((p) => p.id === v)?.id

/**
 * Nueva tarea, el mismo formulario de alta en toda la app. Se dice qué hay que hacer y su tipo (la
 * página en la que sale: sin tipo, CRM, Collabs, Contenido o Cobros) y, al lado, de qué campaña o de
 * qué ficha del CRM es, si es de alguna. Nace sin tipo salvo que se cree desde una página
 * (`dondeInicial`) o desde una ficha, que ya lo deja decidido (`dondeFijo`). Desde una plantilla,
 * llega rellena y con sus subtareas; si no, se le añaden aquí. Nada es obligatorio.
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
  /** La tarea y los títulos de sus subtareas (las escritas en el alta o las de la plantilla). */
  onCreate: (tarea: Tarea, subtareas: string[]) => void
}) {
  const { register, handleSubmit, control, reset, setValue, formState } = useForm<Valores>({
    resolver: zodResolver(esquema),
    defaultValues: { titulo: "", fecha: "", hora: "", fechaLimite: "", prioridad: "normal", etiquetas: [], repetir: undefined, notas: "", subtareas: [] },
  })
  const { errors } = formState
  const [fecha, subtareas] = useWatch({ control, name: ["fecha", "subtareas"] })
  const donde = useWatch({ control, name: "donde" }) ?? SIN_TIPO
  const dia = hoy.slice(0, 10)

  React.useEffect(() => {
    if (!open) return
    // La plantilla trae su tipo; la campaña o la ficha se eligen al lado.
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
      repetir: undefined,
      notas: notasATexto(plantilla?.notas),
      subtareas: plantilla?.subtareas ?? [],
    })
  }, [open, plantilla, dondeFijo, dondeInicial, inicial, reset])

  const guardar = (v: Valores) => {
    const ahora = `${dia}T${new Date().toTimeString().slice(0, 8)}`
    const tarea = nuevaTarea(
      {
        titulo: v.titulo || "Tarea sin título",
        donde: v.donde,
        fecha: v.fecha ? (v.hora ? `${v.fecha}T${v.hora}` : v.fecha) : undefined,
        fechaLimite: v.fechaLimite || undefined,
        prioridad: v.prioridad as PrioridadTarea,
        etiquetas: v.etiquetas,
        repetir: v.repetir,
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
    { label: "Hoy", fecha: dia },
    { label: "Mañana", fecha: sumarDias(hoy, 1) },
    { label: "El lunes", fecha: sumarDias(lunesDe(hoy), 7) },
  ]
  const etiquetaQue = etiquetaDeQue(donde.tipo)
  const opcionesQue = etiquetaQue ? opcionesDeQue(donde.tipo, ctx) : []

  return (
    <FormularioDialog open={open} onOpenChange={onOpenChange}>
      <FormularioCabecera
        icono={ListTodoIcon}
        titulo={plantilla ? `Nueva tarea: ${plantilla.nombre}` : "Nueva tarea"}
        descripcion={
          dondeFijo
            ? `Es de ${migasDonde(dondeFijo, ctx)
                .map((m) => m.label)
                .join(" › ")} y sale también en Tareas.`
            : "Con un tipo, sale en esa página además de en Tareas. Sin tipo, solo en Tareas."
        }
      />
      <Formulario onSubmit={handleSubmit(guardar)}>
        <FormularioCuerpo>
          <CampoFormulario etiqueta="Qué hay que hacer" htmlFor="tarea-titulo" error={errors.titulo?.message}>
            <Input id="tarea-titulo" placeholder="Enviar la factura a Lumea" aria-invalid={!!errors.titulo} {...register("titulo")} />
          </CampoFormulario>

          {!dondeFijo && (
            <>
              <CampoFormulario etiqueta="Tipo" htmlFor="tarea-tipo" ancho={etiquetaQue ? "mitad" : "completo"}>
                <SelectorBuscable
                  id="tarea-tipo"
                  opciones={OPCIONES_TIPO}
                  valor={donde.tipo}
                  onChange={(v) => {
                    const tipo = esTipo(v)
                    if (tipo) setValue("donde", cambiarTipo(donde, tipo))
                  }}
                  placeholder="Escribe o elige el tipo"
                  vacio="Ningún tipo se llama así"
                />
              </CampoFormulario>
              {etiquetaQue && (
                <CampoFormulario etiqueta={etiquetaQue} htmlFor="tarea-de-que" ancho="mitad">
                  <SelectorBuscable
                    id="tarea-de-que"
                    opciones={opcionesQue.map((o) => ({ value: o.clave, label: o.label, detalle: o.grupo }))}
                    valor={claveDe(donde)}
                    onChange={(clave) => {
                      const elegida = opcionesQue.find((o) => o.clave === clave)
                      if (elegida) setValue("donde", elegida.donde)
                    }}
                    placeholder={donde.tipo === "crm" ? "Busca una propuesta, marca o contacto" : "Busca una campaña o una marca"}
                    vacio="Nada se llama así"
                  />
                </CampoFormulario>
              )}
            </>
          )}

          <CampoFormulario
            etiqueta="Día"
            htmlFor="tarea-fecha"
            ancho="tercio"
            ayuda={
              <span className="-ml-1 flex flex-wrap gap-0.5">
                {atajos.map((a) => (
                  <button key={a.label} type="button" onClick={() => setValue("fecha", a.fecha, { shouldDirty: true })} className={cn("rounded px-1 hover:bg-muted hover:text-foreground", fecha === a.fecha && "bg-brand-soft text-brand hover:bg-brand-soft hover:text-brand")}>
                    {a.label}
                  </button>
                ))}
              </span>
            }
          >
            <Controller control={control} name="fecha" render={({ field }) => <CampoFecha id="tarea-fecha" valor={field.value} onChange={field.onChange} hoy={dia} placeholder="Sin día" vaciar={{ texto: "Sin día", onVaciar: () => field.onChange("") }} />} />
          </CampoFormulario>
          <CampoFormulario etiqueta="Hora" htmlFor="tarea-hora" ancho="tercio">
            <Input id="tarea-hora" type="time" disabled={!fecha} {...register("hora")} />
          </CampoFormulario>
          <CampoFormulario etiqueta="Fecha límite" htmlFor="tarea-limite" ancho="tercio" error={errors.fechaLimite?.message} ayuda="La entrega de la marca o tu plazo.">
            <Controller control={control} name="fechaLimite" render={({ field }) => <CampoFecha id="tarea-limite" valor={field.value} onChange={field.onChange} hoy={dia} min={fecha || undefined} placeholder="Sin límite" invalido={!!errors.fechaLimite} vaciar={{ texto: "Sin límite", onVaciar: () => field.onChange("") }} />} />
          </CampoFormulario>

          <CampoFormulario etiqueta="Prioridad" htmlFor="tarea-prioridad" ancho="mitad">
            <Controller
              control={control}
              name="prioridad"
              render={({ field }) => (
                <SelectorBuscable
                  id="tarea-prioridad"
                  opciones={OPCIONES_PRIORIDAD}
                  valor={field.value}
                  onChange={(v) => {
                    const prioridad = esPrioridad(v)
                    if (prioridad) field.onChange(prioridad)
                  }}
                  vacio="Ninguna prioridad se llama así"
                />
              )}
            />
          </CampoFormulario>
          <CampoFormulario etiqueta="Repetir" htmlFor="tarea-repetir" ancho="mitad">
            <Controller control={control} name="repetir" render={({ field }) => <SelectorRepeticion id="tarea-repetir" value={field.value} onChange={field.onChange} fecha={fecha || dia} className={CONTROL_BOTON} />} />
          </CampoFormulario>

          <CampoFormulario etiqueta="Etiquetas">
            <Controller
              control={control}
              name="etiquetas"
              render={({ field }) => (
                <MultiSelect
                  options={etiquetas.map((e) => ({ value: e.id, label: e.nombre }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Grabar, editar, gestiones…"
                  className={cn(CONTROL_BOTON, "h-auto min-h-10")}
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
          </CampoFormulario>
          <CampoFormulario etiqueta="Notas" htmlFor="tarea-notas" error={errors.notas?.message}>
            <Textarea id="tarea-notas" rows={2} placeholder="Lo que necesitas para hacerla" aria-invalid={!!errors.notas} {...register("notas")} />
          </CampoFormulario>
          <CampoFormulario etiqueta="Subtareas" htmlFor="tarea-subtareas" ayuda={subtareas.length ? "Intro añade la siguiente." : undefined}>
            <Controller control={control} name="subtareas" render={({ field }) => <EditorSubtareas id="tarea-subtareas" value={field.value} onChange={field.onChange} />} />
          </CampoFormulario>
        </FormularioCuerpo>
        <FormularioPie>
          <Button type="button" variant="outline" size="lg" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="submit" size="lg">
            Crear tarea
          </Button>
        </FormularioPie>
      </Formulario>
    </FormularioDialog>
  )
}

/** Una etiqueta nueva con un tinte estable para su nombre. */
export function etiquetaNueva(nombre: string): EtiquetaTarea {
  return { id: idNuevo("e"), nombre: nombre.trim(), tint: tintFor(nombre.trim().toLowerCase()) }
}
