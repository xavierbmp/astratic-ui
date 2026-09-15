"use client"

import * as React from "react"
import { toast } from "sonner"
import {
  ArchiveIcon,
  ArrowRightIcon,
  CopyIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  PanelRightOpenIcon,
  PenLineIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react"
import type { StatusTone } from "@/lib/status"
import { fmt } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import {
  DetailBody,
  DetailField,
  DetailFields,
  DetailFooter,
  DetailHeader,
  DetailSection,
  DetailSheet,
} from "@/components/app/detail-sheet"

type Phase = "nuevo" | "curso" | "hecho"

const phases: { id: Phase; label: string; tone: StatusTone }[] = [
  { id: "nuevo", label: "Nuevo", tone: "neutral" },
  { id: "curso", label: "En curso", tone: "info" },
  { id: "hecho", label: "Hecho", tone: "success" },
]

const activity = [
  { id: 1, who: "Usuario 2", what: "cambió la fase a En curso", when: "hace 2 h" },
  { id: 2, who: "Usuario 1", what: "añadió una nota", when: "hace 5 h" },
  { id: 3, who: "Usuario 3", what: "creó el registro", when: "hace 1 d" },
]

export function DetailSheetDemo() {
  const [open, setOpen] = React.useState(false)
  const [phase, setPhase] = React.useState<Phase>("curso")
  const [confirm, setConfirm] = React.useState(false)
  const current = phases.find((p) => p.id === phase)!

  const advance = () => {
    const i = phases.findIndex((p) => p.id === phase)
    setPhase(phases[Math.min(i + 1, phases.length - 1)].id)
    toast.success("Registro avanzado de fase")
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <PanelRightOpenIcon /> Abrir detalle
      </Button>

      <DetailSheet open={open} onOpenChange={setOpen}>
        <DetailHeader
          leading={<AvatarInitials name="Registro 12" size="lg" variant="entity" />}
          title="Registro 12"
          subtitle="REG-0012 · Categoría B"
          status={<StatusBadge tone={current.tone}>{current.label}</StatusBadge>}
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => toast("Aquí se abriría el formulario de edición")}>
                <PenLineIcon /> Editar
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast("Aquí se navegaría a la página del registro")}>
                <ExternalLinkIcon /> Abrir página
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
                  <DropdownMenuItem
                    onClick={() => {
                      setOpen(false)
                      toast.success("Registro archivado", {
                        action: { label: "Deshacer", onClick: () => toast("Registro restaurado") },
                      })
                    }}
                  >
                    <ArchiveIcon /> Archivar
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

        <Tabs defaultValue="resumen" className="flex min-h-0 flex-1 flex-col gap-0">
          <TabsList variant="line" className="w-full justify-start rounded-none border-b px-4">
            <TabsTrigger value="resumen" className="flex-none">Resumen</TabsTrigger>
            <TabsTrigger value="actividad" className="flex-none">Actividad</TabsTrigger>
          </TabsList>
          <DetailBody>
            <TabsContent value="resumen">
              <DetailSection title="Datos">
                <DetailFields>
                  <DetailField label="Responsable">
                    <span className="inline-flex items-center gap-2">
                      <AvatarInitials name="Usuario 2" size="xs" /> Usuario 2
                    </span>
                  </DetailField>
                  <DetailField label="Fase">
                    <Select value={phase} onValueChange={(v) => setPhase(v as Phase)}>
                      <SelectTrigger size="sm" className="h-7 w-44">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {phases.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </DetailField>
                  <DetailField label="Valor">
                    <span className="font-semibold tabular-nums">{fmt.eur(24500)}</span>
                  </DetailField>
                  <DetailField label="Vencimiento">{fmt.dateLong("2026-10-14")}</DetailField>
                  <DetailField label="Etiquetas">
                    <span className="flex flex-wrap gap-1">
                      <StatusBadge tone="neutral">
                        <TagIcon /> Etiqueta 1
                      </StatusBadge>
                      <StatusBadge tone="neutral">
                        <TagIcon /> Etiqueta 2
                      </StatusBadge>
                    </span>
                  </DetailField>
                </DetailFields>
              </DetailSection>
            </TabsContent>
            <TabsContent value="actividad">
              <DetailSection title="Últimos cambios">
                <ol className="relative flex flex-col gap-3 border-l pl-4 text-sm">
                  {activity.map((a) => (
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
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
          <Button onClick={advance} disabled={phase === "hecho"}>
            <ArrowRightIcon /> Avanzar fase
          </Button>
        </DetailFooter>
      </DetailSheet>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="¿Eliminar Registro 12?"
        description="Se borrará de forma permanente junto con su actividad y sus archivos. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={() => {
          setOpen(false)
          toast.success("Registro 12 eliminado")
        }}
      />
    </>
  )
}
