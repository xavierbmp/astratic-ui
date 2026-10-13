"use client"

import * as React from "react"
import { toast } from "sonner"
import { BriefcaseIcon, MailIcon, PhoneIcon, PlaneIcon, UsersIcon } from "lucide-react"
import { fmt } from "@/lib/format"
import { useBaseLocal, useEnNavegador } from "@/hooks/use-base-local"
import { opcionesDeEstados, type DefCampo } from "@/lib/base/campos"
import { vistaNueva, type VistaBase } from "@/lib/base/vistas"
import { Button } from "@/components/ui/button"
import { PageBody, PageHeader } from "@/components/app/page-header"
import { KpiCard, KpiRow } from "@/components/app/kpi"
import { BaseDatos } from "@/components/app/base/base-datos"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { EmptyState } from "@/components/app/states"
import { DetailBody, DetailField, DetailFields, DetailFooter, DetailHeader, DetailSection, DetailSheet } from "@/components/app/detail-sheet"

export type Person = { id: string; name: string; role: string; area: string; email: string; status: "activo" | "ausente" | "onboarding"; since: string }

const statusMeta = {
  activo: { label: "Activo", tone: "success" as const },
  ausente: { label: "Ausente", tone: "warning" as const },
  onboarding: { label: "Onboarding", tone: "info" as const },
}

/** Los campos del directorio del equipo: todo se ve; cambiar algo es cosa de la ficha. */
function camposEquipo(people: Person[]): DefCampo<Person>[] {
  return [
    { id: "name", nombre: "Persona", tipo: "texto", principal: true, soloLectura: true, valor: (p) => p.name },
    { id: "role", nombre: "Rol", tipo: "texto", soloLectura: true, valor: (p) => p.role },
    { id: "area", nombre: "Área", tipo: "select", soloLectura: true, opciones: [...new Set(people.map((p) => p.area))].map((a) => ({ id: a, label: a })), valor: (p) => p.area },
    { id: "email", nombre: "Email", tipo: "email", soloLectura: true, valor: (p) => p.email },
    { id: "status", nombre: "Estado", tipo: "select", soloLectura: true, obligatorio: true, opciones: opcionesDeEstados(Object.entries(statusMeta).map(([id, m]) => ({ id, label: m.label, tone: m.tone }))), valor: (p) => p.status },
    { id: "since", nombre: "Alta", tipo: "fecha", soloLectura: true, valor: (p) => p.since.slice(0, 10) },
  ]
}

const vistasEquipo = (campos: DefCampo<Person>[]): VistaBase[] => [
  vistaNueva("Directorio", campos, { id: "equipo-directorio" }),
  vistaNueva("Tarjetas", campos, { id: "equipo-tarjetas", tipo: "galeria" }),
  { ...vistaNueva("Por área", campos, { id: "equipo-area" }), grupos: [{ campo: "area", ordenGrupos: "asc" }] },
]

export function EquipoView({ people }: { people: Person[] }) {
  const areas = React.useMemo(() => Array.from(new Set(people.map((p) => p.area))), [people])
  const enNavegador = useEnNavegador()
  const camposBase = React.useMemo(() => camposEquipo(people), [people])
  const base = useBaseLocal("demo-equipo", camposBase, vistasEquipo)
  const [openId, setOpenId] = React.useState<string | null>(null)

  const open = people.find((p) => p.id === openId) ?? null

  return (
    <PageBody>
      <PageHeader title="Equipo" description="Directorio del equipo con su área, rol y estado." />
      <KpiRow>
        <KpiCard icon={UsersIcon} label="Personas" value={people.length} hint={`${areas.length} áreas`} />
        <KpiCard icon={PlaneIcon} label="Ausentes hoy" value={people.filter((p) => p.status === "ausente").length} />
        <KpiCard icon={BriefcaseIcon} label="En onboarding" value={people.filter((p) => p.status === "onboarding").length} />
      </KpiRow>
      <div className="h-[560px]">
        {enNavegador && (
          <BaseDatos
            clave="demo-equipo"
            base={base}
            campos={camposBase}
            filas={people}
            getId={(p) => p.id}
            hoy="2026-10-06"
            objeto={{ singular: "persona", plural: "personas", nuevo: "Nueva persona" }}
            abiertoId={openId}
            onAbrir={setOpenId}
            onNuevo={() => toast("Aquí se daría de alta a una persona")}
            vacio={(hayFiltro, limpiar) => <EmptyState title="Nadie coincide" description="Prueba con otro nombre o quita algún filtro." action={hayFiltro ? <Button variant="outline" size="sm" onClick={limpiar}>Quitar filtros</Button> : undefined} />}
          />
        )}
      </div>

      <DetailSheet open={open !== null} onOpenChange={(o) => !o && setOpenId(null)} width={400}>
        {open && (
          <>
            <DetailHeader leading={<AvatarInitials name={open.name} size="lg" />} title={open.name} subtitle={`${open.role} · ${open.area}`} status={<StatusBadge tone={statusMeta[open.status].tone}>{statusMeta[open.status].label}</StatusBadge>} />
            <DetailBody>
              <DetailSection title="Contacto">
                <DetailFields>
                  <DetailField label="Email"><a href={`mailto:${open.email}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><MailIcon className="size-3.5" /> {open.email}</a></DetailField>
                  <DetailField label="Teléfono"><span className="inline-flex items-center gap-1.5"><PhoneIcon className="size-3.5 text-muted-foreground" /> 600 000 000</span></DetailField>
                </DetailFields>
              </DetailSection>
              <DetailSection title="Puesto">
                <DetailFields>
                  <DetailField label="Área">{open.area}</DetailField>
                  <DetailField label="Rol">{open.role}</DetailField>
                  <DetailField label="Alta">{fmt.dateLong(open.since)}</DetailField>
                </DetailFields>
              </DetailSection>
            </DetailBody>
            <DetailFooter>
              <Button variant="ghost" onClick={() => setOpenId(null)}>Cerrar</Button>
              <Button variant="outline" onClick={() => toast("Aquí se editaría la ficha")}>Editar ficha</Button>
            </DetailFooter>
          </>
        )}
      </DetailSheet>
    </PageBody>
  )
}
