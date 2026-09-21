"use client"

import * as React from "react"
import { toast } from "sonner"
import { ClipboardListIcon, InfoIcon, MailCheckIcon, MailIcon, PanelRightOpenIcon, PenLineIcon, RotateCcwIcon, RouteIcon, SaveIcon } from "lucide-react"
import type { StatusTone } from "@/lib/status"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { StatusBadge } from "@/components/app/status-badge"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { HtmlFrame } from "@/components/app/html-frame"
import { StepTimeline, type StepState } from "@/components/app/step-timeline"
import { DetailField, DetailFields, DetailFooter, DetailHeader, DetailSection, DetailSheet, DetailSplit, RecordPager } from "@/components/app/detail-sheet"

type Estado = "enviado" | "siguiente" | "pendiente"
type Paso = { id: string; titulo: string; dia: number; tipo: "mensaje" | "tarea"; estado: Estado; cuando: string; plantilla: string }

const estados: Record<Estado, { label: string; tone: StatusTone; punto: StepState }> = {
  enviado: { label: "Enviado", tone: "success", punto: "done" },
  siguiente: { label: "Siguiente", tone: "info", punto: "current" },
  pendiente: { label: "Pendiente", tone: "neutral", punto: "upcoming" },
}

const personas = [
  { id: "a", nombre: "Ana Martín", empresa: "Empresa 1" },
  { id: "b", nombre: "Bruno Sanz", empresa: "Empresa 2" },
]

const pasos: Paso[] = [
  { id: "p1", titulo: "Mensaje 1", dia: 0, tipo: "mensaje", estado: "enviado", cuando: "Enviado el 20 sep · 10:30", plantilla: "Hola {nombre},\nTe escribo por {empresa}: tenemos una propuesta que encaja con lo que hacéis.\nUn saludo" },
  { id: "p2", titulo: "Mensaje 2", dia: 3, tipo: "mensaje", estado: "siguiente", cuando: "Sale el 24 sep · 10:15", plantilla: "{nombre}, ¿pudiste ver la propuesta?\nSi te viene mejor, lo hablamos por teléfono." },
  { id: "p3", titulo: "Tarea", dia: 5, tipo: "tarea", estado: "pendiente", cuando: "Hacia el 26 sep", plantilla: "Escribirle por LinkedIn" },
  { id: "p4", titulo: "Mensaje 3", dia: 9, tipo: "mensaje", estado: "pendiente", cuando: "Hacia el 2 oct", plantilla: "Último mensaje, {nombre}. Si ahora no es buen momento, lo dejamos aquí." },
]

const aHtml = (texto: string) => texto.split("\n").map((l) => `<p>${l.replace(/[<>&]/g, "")}</p>`).join("")

export function FichaRecorridoDemo() {
  const [abierta, setAbierta] = React.useState<string | null>(null)
  const [pasoId, setPasoId] = React.useState("p2")
  // Mensajes reescritos a mano: solo para esa persona y ese paso.
  const [editados, setEditados] = React.useState<Record<string, string>>({})
  const [edicion, setEdicion] = React.useState<string | null>(null)
  const [pendiente, setPendiente] = React.useState<(() => void) | null>(null)

  const i = personas.findIndex((p) => p.id === abierta)
  const persona = i >= 0 ? personas[i] : null
  const paso = pasos.find((p) => p.id === pasoId)!
  const clave = `${abierta}:${pasoId}`
  const texto = editados[clave] ?? paso.plantilla.replaceAll("{nombre}", persona?.nombre.split(" ")[0] ?? "").replaceAll("{empresa}", persona?.empresa ?? "")
  const editable = paso.tipo === "mensaje" && paso.estado !== "enviado"
  const dirty = edicion !== null && edicion !== texto
  const intentar = (hacer: () => void) => (dirty ? setPendiente(() => hacer) : (setEdicion(null), hacer()))

  const guardar = () => {
    if (edicion === null || !persona) return
    setEditados((e) => ({ ...e, [clave]: edicion }))
    setEdicion(null)
    toast.success(`Guardado: a ${persona.nombre} le llegará este mensaje`)
  }
  const restaurar = () => {
    const anterior = editados[clave]
    setEditados((e) => {
      const resto = { ...e }
      delete resto[clave]
      return resto
    })
    toast.success("Vuelve a salir con la plantilla", { action: { label: "Deshacer", onClick: () => setEditados((e) => ({ ...e, [clave]: anterior })) } })
  }

  return (
    <>
      <Button variant="outline" onClick={() => setAbierta(personas[0].id)}>
        <PanelRightOpenIcon /> Abrir ficha de dos columnas
      </Button>

      <DetailSheet open={persona !== null} onOpenChange={(o) => !o && intentar(() => setAbierta(null))} width={960}>
        {persona && (
          <>
            <DetailHeader
              leading={<AvatarInitials name={persona.nombre} size="lg" />}
              title={persona.nombre}
              subtitle={`${persona.empresa} · en la secuencia «Bienvenida»`}
              status={<StatusBadge tone="info">En curso</StatusBadge>}
              nav={<RecordPager index={i} total={personas.length} label="contacto" onPrev={() => intentar(() => setAbierta(personas[i - 1].id))} onNext={() => intentar(() => setAbierta(personas[i + 1].id))} />}
            />
            <DetailSplit
              asideWidth={300}
              aside={
                <>
                  <DetailSection title="Recorrido" icon={RouteIcon}>
                    <StepTimeline
                      className="-mx-2"
                      value={pasoId}
                      onSelect={(id) => id !== pasoId && intentar(() => setPasoId(id))}
                      items={pasos.map((p) => ({
                        id: p.id,
                        icon: p.tipo === "tarea" ? ClipboardListIcon : p.estado === "enviado" ? MailCheckIcon : MailIcon,
                        state: estados[p.estado].punto,
                        title: p.titulo,
                        status: (
                          <>
                            <StatusBadge tone={estados[p.estado].tone}>{estados[p.estado].label}</StatusBadge>
                            {editados[`${persona.id}:${p.id}`] !== undefined && (
                              <StatusBadge tone="info" title="Editado a mano">
                                <PenLineIcon />
                              </StatusBadge>
                            )}
                          </>
                        ),
                        meta: `Día ${p.dia} · ${p.cuando}`,
                      }))}
                    />
                  </DetailSection>
                  <DetailSection title="En la secuencia" icon={InfoIcon}>
                    <DetailFields>
                      <DetailField label="Inscrito"><span className="text-sm">20 sep</span></DetailField>
                      <DetailField label="Último envío"><span className="text-sm">20 sep · 10:30</span></DetailField>
                    </DetailFields>
                  </DetailSection>
                </>
              }
            >
              <div className="flex flex-col gap-3 p-4 md:p-6">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="text-base font-semibold">{paso.titulo}</h3>
                  <span className="text-sm text-muted-foreground">Día {paso.dia}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <StatusBadge tone={estados[paso.estado].tone}>{estados[paso.estado].label}</StatusBadge>
                  <span className="text-muted-foreground">{paso.cuando}</span>
                  {editados[clave] !== undefined && (
                    <span className="ml-auto flex items-center gap-1.5">
                      <StatusBadge tone="info"><PenLineIcon /> Editado a mano</StatusBadge>
                      {!edicion && <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={restaurar}><RotateCcwIcon /> Volver a la plantilla</Button>}
                    </span>
                  )}
                </div>
                {paso.tipo === "tarea" ? (
                  <div className="rounded-lg border bg-background p-4 text-sm font-semibold">{paso.plantilla}</div>
                ) : edicion !== null ? (
                  <>
                    <Textarea autoFocus rows={6} value={edicion} onChange={(e) => setEdicion(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); guardar() } }} className="text-sm ring-2 ring-brand/30" />
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="mr-auto text-xs text-muted-foreground">Solo cambia para {persona.nombre}. ⌘+Enter guarda.</p>
                      <Button variant="ghost" size="sm" onClick={() => setEdicion(null)}>Descartar</Button>
                      <Button size="sm" onClick={guardar} disabled={!dirty}><SaveIcon /> Guardar para {persona.nombre.split(" ")[0]}</Button>
                    </div>
                  </>
                ) : (
                  <div className={cn("group/msg relative rounded-lg border bg-background", editable && "cursor-text hover:ring-2 hover:ring-brand/25")}>
                    <HtmlFrame html={aHtml(texto)} title="Mensaje" interceptarEnlaces={editable} onClick={() => editable && setEdicion(texto)} />
                    {editable && (
                      <span className="pointer-events-none absolute top-2 right-2 inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 text-[11px] text-muted-foreground opacity-0 shadow-xs transition-opacity group-hover/msg:opacity-100">
                        <PenLineIcon className="size-3" /> Pulsa para editar
                      </span>
                    )}
                  </div>
                )}
                {paso.estado === "enviado" && <p className="text-xs text-muted-foreground">Ya se envió: se ve tal cual lo recibió y no se puede cambiar.</p>}
              </div>
            </DetailSplit>
            <DetailFooter>
              <Button variant="ghost" onClick={() => intentar(() => setAbierta(null))}>Cerrar</Button>
            </DetailFooter>
          </>
        )}
      </DetailSheet>

      <ConfirmDialog
        open={pendiente !== null}
        onOpenChange={(o) => !o && setPendiente(null)}
        title="¿Descartar los cambios?"
        description="Has editado el mensaje y no lo has guardado. Si sigues, se pierden los cambios."
        confirmLabel="Descartar cambios"
        cancelLabel="Seguir editando"
        destructive
        onConfirm={() => {
          const hacer = pendiente
          setPendiente(null)
          setEdicion(null)
          hacer?.()
        }}
      />
    </>
  )
}
