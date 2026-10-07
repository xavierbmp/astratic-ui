"use client"

import * as React from "react"
import Link from "next/link"
import { CopyIcon, EllipsisIcon, ExternalLinkIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { ESTADOS_TAREA, FRECUENCIAS_TAREA, ORIGENES_TAREA, PRIORIDADES_TAREA, type CampoTarea, type EstadoTarea, type EtiquetaTarea, type FrecuenciaTarea, type PrioridadTarea, type Tarea } from "@/lib/influencer/modelo"
import { conEstado, describirRepeticion, estaCerrada, migasDonde, type ContextoTareas } from "@/lib/influencer/tareas"
import { soloFecha } from "@/lib/influencer/fechas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { DetailBody, DetailField, DetailFields, DetailFooter, DetailHeader, DetailMeta, DetailSection, DetailSheet, RecordPager } from "@/components/app/detail-sheet"
import type { PanelFicha } from "@/components/app/detail-panel"
import { InlineField } from "@/components/app/inline-field"
import { EditorTexto } from "@/components/influencer/editor-texto"
import { CasillaTarea, EstadoTareaBadge, EtiquetasTarea, FechaTarea, PrioridadBandera } from "@/components/influencer/task-cells"
import { TareaContexto, tieneContexto } from "@/components/influencer/task-contexto"
import { SelectorDeQue, SelectorTipo, etiquetaDeQue } from "@/components/influencer/task-tipo"
import { CampoPropioInline } from "@/components/influencer/task-campos-propios"
import { CampoTareaDialog } from "@/components/influencer/task-campo-dialog"

const NO_REPITE = "no"
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/
const fechaHora = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })

export type AccionesFicha = {
  onGuardar: (t: Tarea) => void
  onToggle: (t: Tarea) => void
  onBorrar: (t: Tarea) => void
  onDuplicar: (t: Tarea) => void
  onComentar: (id: string, texto: string) => void
  onCrearSubtarea: (madre: Tarea, titulo: string) => void
  onCrearEtiqueta?: (nombre: string) => EtiquetaTarea
  /** Abrir otra tarea en la misma ficha (una subtarea, la madre, la anterior o la siguiente). */
  onAbrirId: (id: string) => void
  /** Los campos que crea ella: sin estas acciones, la ficha los enseña pero no deja crearlos. */
  onCrearCampo?: (campo: CampoTarea) => void
  onEditarCampo?: (campo: CampoTarea) => void
  onBorrarCampo?: (id: string) => void
}

/** La descripción se guarda al dejar de escribir, no con cada tecla. */
function Descripcion({ tarea, onGuardar }: { tarea: Tarea; onGuardar: (notas: string | undefined) => void }) {
  const temporizador = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  React.useEffect(() => () => {
    if (temporizador.current) clearTimeout(temporizador.current)
  }, [])
  return (
    <EditorTexto
      key={tarea.id}
      value={tarea.notas ?? ""}
      placeholder="Añade una descripción, enlaces o una lista de cosas que comprobar…"
      contenidoClassName="min-h-24"
      onChange={(html) => {
        if (temporizador.current) clearTimeout(temporizador.current)
        temporizador.current = setTimeout(() => onGuardar(html === "<p></p>" ? undefined : html), 600)
      }}
    />
  )
}

/** Los campos de arriba, con el mismo margen que los bloques de debajo. */
function Campos({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-2 border-b px-4 py-3">{children}</div>
}

/**
 * Todo lo de una tarea, de lo que más se mira a lo que menos: una sola lista de campos editables en
 * el sitio (su tipo y de qué campaña o ficha es, estado, prioridad, fechas, etiquetas y los campos
 * que ha creado ella, con «+ Nuevo campo» al pie); lo que hace falta para hacerla (contexto); sus
 * subtareas, su descripción y su actividad. Es el cuerpo de la ficha lateral y de la página completa.
 */
export function TareaDetalle({
  tarea,
  todas,
  hoy,
  ctx,
  etiquetas,
  campos = [],
  acciones,
  conContexto = true,
}: {
  tarea: Tarea
  todas: Tarea[]
  hoy: string
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  /** Los campos que ha creado ella. */
  campos?: CampoTarea[]
  acciones: AccionesFicha
  /** En la página completa el contexto va en su columna, no aquí. */
  conContexto?: boolean
}) {
  const [comentario, setComentario] = React.useState("")
  const [subtarea, setSubtarea] = React.useState("")
  const [campoAbierto, setCampoAbierto] = React.useState<CampoTarea | "nuevo" | null>(null)
  const hijas = todas.filter((t) => t.padreId === tarea.id).sort((a, b) => a.orden - b.orden)
  const madre = tarea.padreId ? todas.find((t) => t.id === tarea.padreId) : undefined
  const guardar = (cambio: Partial<Tarea>) => acciones.onGuardar({ ...tarea, ...cambio })
  const hora = tarea.fecha && tarea.fecha.length > 10 ? tarea.fecha.slice(11, 16) : null
  const deQue = etiquetaDeQue(tarea.donde.tipo)
  const puedeCrearCampos = !!acciones.onCrearCampo

  return (
    <>
      <Campos>
        <DetailFields>
          <DetailField label="Tipo">
            <SelectorTipo variant="inline" value={tarea.donde} onChange={(donde) => guardar({ donde })} />
          </DetailField>
          {deQue && (
            <DetailField label={deQue}>
              <SelectorDeQue variant="inline" value={tarea.donde} ctx={ctx} onChange={(donde) => guardar({ donde })} />
            </DetailField>
          )}
          {madre && (
            <DetailField label="Subtarea de">
              <button type="button" onClick={() => acciones.onAbrirId(madre.id)} className="max-w-full truncate text-left text-sm text-brand hover:underline">
                {madre.titulo}
              </button>
            </DetailField>
          )}
          <DetailField label="Estado">
            <InlineField
              value={tarea.estado}
              tipo="select"
              required
              opciones={ESTADOS_TAREA.map((e) => ({ value: e.id, label: e.label, tone: e.tone }))}
              onSave={async (v) => acciones.onGuardar(conEstado(tarea, String(v) as EstadoTarea, `${hoy.slice(0, 10)}T${new Date().toTimeString().slice(0, 8)}`))}
              render={() => <EstadoTareaBadge tarea={tarea} hoy={hoy} />}
            />
          </DetailField>
          <DetailField label="Prioridad">
            <InlineField
              value={tarea.prioridad}
              tipo="select"
              required
              opciones={PRIORIDADES_TAREA.map((p) => ({ value: p.id, label: p.label }))}
              onSave={async (v) => guardar({ prioridad: String(v) as PrioridadTarea })}
              render={() => <PrioridadBandera prioridad={tarea.prioridad} conTexto />}
            />
          </DetailField>
          <DetailField key="fecha" label="Fecha" empty={!tarea.fecha}>
            <InlineField
              value={tarea.fecha ? soloFecha(tarea.fecha) : null}
              tipo="fecha"
              onSave={async (v) => guardar({ fecha: v ? `${String(v)}${hora ? `T${hora}` : ""}` : undefined, fechaFin: v ? tarea.fechaFin : undefined })}
              render={() => <FechaTarea tarea={{ ...tarea, fechaLimite: undefined }} hoy={hoy} campo="fecha" />}
            />
          </DetailField>
          <DetailField key="limite" label="Fecha límite" empty={!tarea.fechaLimite}>
            <InlineField
              value={tarea.fechaLimite ?? null}
              tipo="fecha"
              onSave={async (v) => guardar({ fechaLimite: v ? String(v) : undefined })}
              render={() => <FechaTarea tarea={tarea} hoy={hoy} campo="fechaLimite" />}
            />
          </DetailField>
          {tarea.fecha && (
            <DetailField key="hora" label="Hora" empty={!hora}>
              <InlineField
                value={hora}
                tipo="texto"
                placeholder="10:00"
                onSave={async (v) => {
                  const texto = String(v ?? "").trim()
                  if (texto && !HORA.test(texto)) return "Escribe la hora como 10:00"
                  guardar({ fecha: `${soloFecha(tarea.fecha ?? hoy)}${texto ? `T${texto}` : ""}` })
                }}
              />
            </DetailField>
          )}
          {tarea.fecha && (
            <DetailField key="hasta" label="Hasta" empty={!tarea.fechaFin}>
              <InlineField
                value={tarea.fechaFin ?? null}
                tipo="fecha"
                onSave={async (v) => {
                  if (v && String(v) < soloFecha(tarea.fecha ?? "")) return "Tiene que ser después de la fecha"
                  guardar({ fechaFin: v ? String(v) : undefined })
                }}
              />
            </DetailField>
          )}
          <DetailField key="repetir" label="Repetir" empty={!tarea.repetir}>
            <InlineField
              value={tarea.repetir?.frecuencia ?? NO_REPITE}
              tipo="select"
              required
              opciones={[{ value: NO_REPITE, label: "No se repite" }, ...(Object.keys(FRECUENCIAS_TAREA) as FrecuenciaTarea[]).map((f) => ({ value: f, label: FRECUENCIAS_TAREA[f] }))]}
              onSave={async (v) => guardar({ repetir: v === NO_REPITE || !v ? undefined : { frecuencia: String(v) as FrecuenciaTarea } })}
              render={() => <span className="text-sm">{tarea.repetir ? describirRepeticion(tarea.repetir) : "No se repite"}</span>}
            />
          </DetailField>
          <DetailField key="etiquetas" label="Etiquetas" empty={tarea.etiquetas.length === 0}>
            <InlineField
              value={tarea.etiquetas}
              tipo="multiselect"
              opciones={etiquetas.map((e) => ({ value: e.id, label: e.nombre }))}
              onCreate={
                acciones.onCrearEtiqueta
                  ? async (texto) => {
                      const e = acciones.onCrearEtiqueta?.(texto)
                      return e ? { value: e.id, label: e.nombre } : null
                    }
                  : undefined
              }
              onSave={async (v) => guardar({ etiquetas: Array.isArray(v) ? v : [] })}
              render={() => <EtiquetasTarea ids={tarea.etiquetas} etiquetas={etiquetas} />}
            />
          </DetailField>
          {campos.map((c) => (
            <DetailField
              key={`propio-${c.id}`}
              label={c.nombre}
              empty={tarea.valores?.[c.id] === undefined}
              onConfig={puedeCrearCampos ? () => setCampoAbierto(c) : undefined}
              configLabel={`Editar el campo «${c.nombre}»`}
            >
              <CampoPropioInline campo={c} tarea={tarea} onGuardar={acciones.onGuardar} />
            </DetailField>
          ))}
        </DetailFields>
        {puedeCrearCampos && (
          <Button variant="ghost" size="sm" className="-ml-2 h-7 justify-self-start text-xs text-muted-foreground" onClick={() => setCampoAbierto("nuevo")}>
            <PlusIcon /> Nuevo campo
          </Button>
        )}
      </Campos>

      {conContexto && tieneContexto(tarea) && (
        <DetailSection title="Para hacerla" collapsible storageKey="tarea.contexto">
          <TareaContexto tarea={tarea} ctx={ctx} />
        </DetailSection>
      )}

      <DetailSection title="Subtareas" count={hijas.length || undefined}>
        <ul className="grid gap-0.5">
          {hijas.map((h) => (
            <li key={h.id} className="group/sub flex items-center gap-2 rounded-md px-1 py-1 hover:bg-muted/60">
              <CasillaTarea tarea={h} onToggle={() => acciones.onToggle(h)} size="sm" />
              <button type="button" onClick={() => acciones.onAbrirId(h.id)} className={cn("min-w-0 flex-1 truncate text-left text-sm", estaCerrada(h) && "text-muted-foreground line-through")}>
                {h.titulo}
              </button>
              {h.fecha && <FechaTarea tarea={h} hoy={hoy} />}
            </li>
          ))}
        </ul>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!subtarea.trim()) return
            acciones.onCrearSubtarea(tarea, subtarea.trim())
            setSubtarea("")
          }}
          className="mt-1 flex items-center gap-2 px-1"
        >
          <PlusIcon className="size-4 flex-none text-muted-foreground" />
          <Input value={subtarea} onChange={(e) => setSubtarea(e.target.value)} placeholder="Añadir subtarea… (Enter)" className="h-8 border-transparent bg-transparent shadow-none focus-visible:border-input" />
        </form>
      </DetailSection>

      <DetailSection title="Descripción">
        <Descripcion tarea={tarea} onGuardar={(notas) => guardar({ notas })} />
      </DetailSection>

      <DetailSection title="Comentarios y actividad">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!comentario.trim()) return
            acciones.onComentar(tarea.id, comentario)
            setComentario("")
          }}
          className="grid gap-2"
        >
          <Textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows={2} placeholder="Escribe un comentario…" />
          <Button type="submit" size="sm" variant="outline" className="justify-self-end" disabled={!comentario.trim()}>
            Comentar
          </Button>
        </form>
        <ol className="mt-3 grid gap-2">
          {[...tarea.actividad].reverse().map((a) =>
            a.tipo === "comentario" ? (
              <li key={a.id} className="rounded-lg bg-muted/50 px-3 py-2">
                <p className="text-sm whitespace-pre-wrap">{a.texto}</p>
                <span className="text-xs text-muted-foreground">{fechaHora.format(new Date(a.el))}</span>
              </li>
            ) : (
              <li key={a.id} className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
                <span>{a.texto}</span>
                <span className="flex-none">{fechaHora.format(new Date(a.el))}</span>
              </li>
            ),
          )}
          <li className="text-xs text-muted-foreground">Creada el {fmt.date(tarea.creadaEl)}</li>
        </ol>
      </DetailSection>

      <CampoTareaDialog
        open={campoAbierto !== null}
        onOpenChange={(o) => !o && setCampoAbierto(null)}
        campo={campoAbierto === "nuevo" ? null : campoAbierto}
        nombresUsados={campos.filter((c) => campoAbierto === "nuevo" || c.id !== campoAbierto?.id).map((c) => c.nombre)}
        onGuardar={(c) => (campoAbierto === "nuevo" ? acciones.onCrearCampo?.(c) : acciones.onEditarCampo?.(c))}
        onBorrar={acciones.onBorrarCampo}
      />
    </>
  )
}

/**
 * La ficha de una tarea, por la derecha y sin tapar la lista, como las de Notion: casilla y título
 * editable, migas de dónde vive con su enlace, flechas para recorrer la lista y, debajo, todo lo
 * de la tarea. Desde «Abrir a página completa» se trabaja con el contexto al lado.
 */
export function TaskSheet({
  tarea,
  todas,
  lista,
  hoy,
  ctx,
  etiquetas,
  campos,
  acciones,
  hrefPagina,
  ficha,
  onClose,
}: {
  tarea: Tarea | null
  todas: Tarea[]
  /** La lista de detrás, en su orden: para las flechas de anterior y siguiente. */
  lista: Tarea[]
  hoy: string
  ctx: ContextoTareas
  etiquetas: EtiquetaTarea[]
  campos?: CampoTarea[]
  acciones: AccionesFicha
  /** La página completa de la tarea. */
  hrefPagina?: (id: string) => string
  ficha?: PanelFicha
  onClose: () => void
}) {
  const indice = tarea ? lista.findIndex((t) => t.id === tarea.id) : -1
  return (
    <DetailSheet open={!!tarea} onOpenChange={(o) => !o && onClose()} width={560} ficha={ficha}>
      {tarea && (
        <>
          <DetailHeader
            leading={<span className="pt-0.5"><CasillaTarea tarea={tarea} onToggle={() => acciones.onToggle(tarea)} /></span>}
            title={
              <InlineField
                value={tarea.titulo}
                tipo="texto"
                required
                onSave={async (v) => acciones.onGuardar({ ...tarea, titulo: String(v ?? tarea.titulo).trim() || tarea.titulo })}
                render={(v) => <span className={cn("text-[15px] font-semibold", estaCerrada(tarea) && "text-muted-foreground line-through")}>{String(v)}</span>}
              />
            }
            subtitle={migasDonde(tarea.donde, ctx).map((m) => m.label).join(" › ")}
            status={<EstadoTareaBadge tarea={tarea} hoy={hoy} />}
            nav={<RecordPager index={indice} total={lista.length} label="tarea" onPrev={() => indice > 0 && acciones.onAbrirId(lista[indice - 1].id)} onNext={() => indice < lista.length - 1 && acciones.onAbrirId(lista[indice + 1].id)} />}
            actions={
              <>
                {hrefPagina && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={hrefPagina(tarea.id)}>
                      <ExternalLinkIcon /> Abrir a página completa
                    </Link>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // La página de Tareas abre la ficha con ?tarea=id, venga de donde venga el enlace.
                    const url = new URL(`/workspace/tareas?tarea=${tarea.id}`, window.location.origin)
                    void navigator.clipboard.writeText(url.toString()).then(() => toast.success("Enlace copiado"))
                  }}
                >
                  <CopyIcon /> Copiar enlace
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon-sm" aria-label="Más acciones">
                      <EllipsisIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => acciones.onDuplicar(tarea)}>
                      <CopyIcon /> Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => acciones.onBorrar(tarea)}>
                      <Trash2Icon /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            }
          />
          <DetailBody>
            <TareaDetalle tarea={tarea} todas={todas} hoy={hoy} ctx={ctx} etiquetas={etiquetas} campos={campos} acciones={acciones} />
            <DetailMeta>
              {ORIGENES_TAREA[tarea.origen]} · Creada el {fmt.date(tarea.creadaEl)}
              {tarea.editadaEl ? ` · Editada el ${fmt.date(tarea.editadaEl)}` : ""}
              {tarea.hechaEl ? ` · Hecha el ${fmt.date(tarea.hechaEl)}` : ""}
            </DetailMeta>
          </DetailBody>
          <DetailFooter>
            <Button variant="ghost" onClick={onClose}>
              Cerrar
            </Button>
            <Button onClick={() => acciones.onToggle(tarea)}>{tarea.estado === "hecha" ? "Reabrir" : "Marcar como hecha"}</Button>
          </DetailFooter>
        </>
      )}
    </DetailSheet>
  )
}
