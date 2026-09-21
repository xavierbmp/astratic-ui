"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CopyIcon,
  EllipsisIcon,
  GlobeIcon,
  ListChecksIcon,
  PanelRightOpenIcon,
  StickyNoteIcon,
  Trash2Icon,
  UserCogIcon,
} from "lucide-react"
import type { StatusTone } from "@/lib/status"
import { fmt } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { StatusBadge } from "@/components/app/status-badge"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { InsightList } from "@/components/app/insights-panel"
import { InlineField, InlineTitle, type ValorInline } from "@/components/app/inline-field"
import {
  DetailBody,
  DetailField,
  DetailFields,
  DetailFooter,
  DetailHeader,
  DetailMeta,
  DetailSection,
  DetailSectionAction,
  DetailSheet,
  RecordPager,
} from "@/components/app/detail-sheet"

type Fase = "nuevo" | "curso" | "hecho"
const fases: { id: Fase; label: string; tone: StatusTone }[] = [
  { id: "nuevo", label: "Nuevo", tone: "neutral" },
  { id: "curso", label: "En curso", tone: "info" },
  { id: "hecho", label: "Hecho", tone: "success" },
]

type Registro = {
  id: string
  nombre: string
  codigo: string
  categoria: string | null
  fase: Fase
  valor: number
  vence: string | null
  responsable: string | null
  web: string | null
  telefono: string | null
  etiquetas: string[]
  notas: string | null
}

const inicial: Registro[] = [
  { id: "r12", nombre: "Registro 12", codigo: "REG-0012", categoria: "Categoría B", fase: "curso", valor: 24500, vence: "2026-10-14", responsable: "Usuario 2", web: "ejemplo.com", telefono: null, etiquetas: ["Etiqueta 1"], notas: null },
  { id: "r13", nombre: "Registro 13", codigo: "REG-0013", categoria: null, fase: "nuevo", valor: 0, vence: null, responsable: null, web: null, telefono: null, etiquetas: [], notas: null },
  { id: "r14", nombre: "Registro 14", codigo: "REG-0014", categoria: "Categoría A", fase: "hecho", valor: 9800, vence: "2026-09-02", responsable: "Usuario 1", web: null, telefono: "+34 600 000 000", etiquetas: ["Etiqueta 2", "Etiqueta 3"], notas: "Cliente recurrente." },
]

const equipo = ["Usuario 1", "Usuario 2", "Usuario 3"]
const etiquetas = ["Etiqueta 1", "Etiqueta 2", "Etiqueta 3"]
const espera = () => new Promise((r) => setTimeout(r, 350))

export function DetailSheetDemo() {
  const [registros, setRegistros] = React.useState(inicial)
  const [abierto, setAbierto] = React.useState<string | null>(null)
  const [confirm, setConfirm] = React.useState(false)
  const i = registros.findIndex((r) => r.id === abierto)
  const r = i >= 0 ? registros[i] : null

  /** Guarda un campo: devuelve el error (el campo lo avisa y vuelve atrás) o nada. */
  const guardar = (campo: keyof Registro) => async (v: ValorInline) => {
    await espera()
    if (campo === "valor" && typeof v === "number" && v < 0) return "El valor no puede ser negativo."
    setRegistros((rs) => rs.map((x) => (x.id === abierto ? { ...x, [campo]: v ?? (campo === "etiquetas" ? [] : null) } : x)))
  }
  const fase = r ? fases.find((f) => f.id === r.fase)! : null

  return (
    <>
      <Button variant="outline" onClick={() => setAbierto(registros[0].id)}>
        <PanelRightOpenIcon /> Abrir ficha
      </Button>

      <DetailSheet open={r !== null} onOpenChange={(o) => !o && setAbierto(null)}>
        {r && fase && (
          <>
            <DetailHeader
              leading={<AvatarInitials name={r.nombre} size="lg" variant="entity" />}
              title={<InlineTitle parts={[{ key: "nombre", value: r.nombre, placeholder: "Nombre", required: true }]} onSave={async (v) => guardar("nombre")(v.nombre)} />}
              subtitle={[r.codigo, r.categoria].filter(Boolean).join(" · ")}
              status={<StatusBadge tone={fase.tone}>{fase.label}</StatusBadge>}
              nav={<RecordPager index={i} total={registros.length} label="registro" onPrev={() => setAbierto(registros[i - 1].id)} onNext={() => setAbierto(registros[i + 1].id)} />}
              actions={
                <>
                  <Button variant="outline" size="sm" onClick={() => toast.success("Enlace copiado")}>
                    <CopyIcon /> Copiar enlace
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" aria-label="Más acciones" className="ml-auto">
                        <EllipsisIcon />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.success("Registro duplicado")}>
                        <CopyIcon /> Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setConfirm(true)}>
                        <Trash2Icon /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              }
            />

            <Tabs key={r.id} defaultValue="resumen" className="flex min-h-0 flex-1 flex-col gap-0">
              <TabsList variant="line" className="w-full justify-start rounded-none border-b px-4">
                <TabsTrigger value="resumen" className="flex-none">Resumen</TabsTrigger>
                <TabsTrigger value="actividad" className="flex-none">Actividad</TabsTrigger>
              </TabsList>
              <DetailBody>
                <TabsContent value="resumen">
                  <DetailSection title="Gestión" icon={UserCogIcon} collapsible storageKey="demo.gestion" summary={[fase.label, r.responsable ?? "Sin responsable"].join(" · ")}>
                    <DetailFields>
                      <DetailField label="Fase">
                        <InlineField
                          value={r.fase}
                          tipo="select"
                          required
                          opciones={fases.map((f) => ({ value: f.id, label: f.label }))}
                          onSave={guardar("fase")}
                          render={() => <StatusBadge tone={fase.tone}>{fase.label}</StatusBadge>}
                        />
                      </DetailField>
                      <DetailField label="Responsable" empty={!r.responsable}>
                        <InlineField
                          value={r.responsable}
                          tipo="select"
                          opciones={equipo.map((u) => ({ value: u, label: u }))}
                          placeholder="Añadir responsable"
                          onSave={guardar("responsable")}
                          render={(v) => <span className="inline-flex items-center gap-2"><AvatarInitials name={String(v)} size="xs" /> {String(v)}</span>}
                        />
                      </DetailField>
                      <DetailField label="Etiquetas" empty={!r.etiquetas.length}>
                        <InlineField
                          value={r.etiquetas}
                          tipo="multiselect"
                          opciones={etiquetas.map((e) => ({ value: e, label: e }))}
                          placeholder="Añadir etiquetas"
                          onSave={guardar("etiquetas")}
                        />
                      </DetailField>
                    </DetailFields>
                  </DetailSection>
                  <DetailSection title="Negocio" icon={BriefcaseIcon} collapsible storageKey="demo.negocio" summary={fmt.eur(r.valor)}>
                    <DetailFields>
                      <DetailField label="Valor">
                        <InlineField value={r.valor} tipo="numero" onSave={guardar("valor")} render={(v) => <span className="font-semibold tabular-nums">{fmt.eur(Number(v))}</span>} />
                      </DetailField>
                      <DetailField label="Vencimiento" empty={!r.vence}>
                        <InlineField value={r.vence} tipo="fecha" placeholder="Añadir fecha" onSave={guardar("vence")} render={(v) => fmt.dateLong(String(v))} />
                      </DetailField>
                      <DetailField label="Categoría" empty={!r.categoria}>
                        <InlineField value={r.categoria} placeholder="Añadir categoría" onSave={guardar("categoria")} />
                      </DetailField>
                    </DetailFields>
                  </DetailSection>
                  <DetailSection title="Contacto" icon={GlobeIcon} collapsible storageKey="demo.contacto" summary={r.web ?? "Sin web"}>
                    <DetailFields>
                      <DetailField label="Web" empty={!r.web}>
                        <InlineField value={r.web} tipo="url" placeholder="Añadir web" onSave={guardar("web")} />
                      </DetailField>
                      <DetailField label="Teléfono" empty={!r.telefono}>
                        <InlineField value={r.telefono} tipo="telefono" placeholder="Añadir teléfono" onSave={guardar("telefono")} />
                      </DetailField>
                    </DetailFields>
                  </DetailSection>
                  <DetailSection
                    title="Tareas"
                    icon={ListChecksIcon}
                    count={2}
                    collapsible
                    storageKey="demo.tareas"
                    summary="2 pendientes"
                    action={<DetailSectionAction onClick={() => toast("Aquí se abriría el alta de tarea")}>Añadir</DetailSectionAction>}
                  >
                    <InsightList
                      items={[
                        { key: "t1", title: "Llamar para revisar la propuesta", subtitle: "Usuario 2 · vence 24 sep", trailing: <StatusBadge tone="warning">Pendiente</StatusBadge> },
                        { key: "t2", title: "Enviar el contrato", subtitle: "Usuario 1 · vence 30 sep", trailing: <StatusBadge tone="neutral">Pendiente</StatusBadge> },
                      ]}
                    />
                  </DetailSection>
                  <DetailSection title="Notas internas" icon={StickyNoteIcon} collapsible storageKey="demo.notas" summary={r.notas ?? "Sin notas"}>
                    <InlineField value={r.notas} tipo="textarea" placeholder="Añadir una nota interna" onSave={guardar("notas")} multiline={3} />
                  </DetailSection>
                  <DetailMeta>Creado el 2 de septiembre de 2026 · actualizado hace 2 horas</DetailMeta>
                </TabsContent>
                <TabsContent value="actividad">
                  <DetailSection title="Últimos cambios">
                    <ol className="relative flex flex-col gap-3 border-l pl-4 text-sm">
                      {[
                        { id: 1, who: "Usuario 2", what: "cambió la fase a En curso", when: "hace 2 h" },
                        { id: 2, who: "Usuario 1", what: "añadió una nota", when: "hace 5 h" },
                        { id: 3, who: "Usuario 3", what: "creó el registro", when: "hace 1 d" },
                      ].map((a) => (
                        <li key={a.id} className="relative">
                          <span className="absolute top-1.5 -left-[21px] size-2 rounded-full bg-border ring-2 ring-card" />
                          <p>
                            <span className="font-semibold">{a.who}</span> {a.what}
                          </p>
                          <p className="text-xs text-muted-foreground">{a.when}</p>
                        </li>
                      ))}
                    </ol>
                  </DetailSection>
                </TabsContent>
              </DetailBody>
            </Tabs>

            <DetailFooter>
              <Button variant="ghost" onClick={() => setAbierto(null)}>
                Cerrar
              </Button>
              <Button
                disabled={r.fase === "hecho"}
                onClick={() => {
                  const n = fases[Math.min(fases.findIndex((f) => f.id === r.fase) + 1, fases.length - 1)]
                  void guardar("fase")(n.id).then(() => toast.success(`Movido a ${n.label}`))
                }}
              >
                <ArrowRightIcon /> Avanzar fase
              </Button>
            </DetailFooter>
          </>
        )}
      </DetailSheet>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`¿Eliminar ${r?.nombre ?? "el registro"}?`}
        description="Se borrará de forma permanente junto con su actividad y sus archivos. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          setAbierto(null)
          toast.success("Registro eliminado")
        }}
      />
    </>
  )
}
