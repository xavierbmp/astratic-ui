"use client"

import * as React from "react"
import { toast } from "sonner"
import { GlobeIcon, MessageSquareTextIcon, PhoneIcon, SendIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/app/status-badge"
import { InlineField } from "@/components/app/inline-field"
import { SocialIcon } from "@/components/app/social-icons"
import { DetailField, DetailFields, DetailLinks, DetailSummary } from "@/components/app/detail-sheet"
import { InteractionLog, type LogEntry } from "@/components/app/interaction-log"

type Entrada = { id: string; tipo: "followup" | "status"; nota: string | null; fecha: string }

const espera = () => new Promise((r) => setTimeout(r, 400))
const Linkedin = (p: { className?: string }) => <SocialIcon network="linkedin" {...p} />
const Instagram = (p: { className?: string }) => <SocialIcon network="instagram" {...p} />

export function FichaCompactaDemo() {
  const [web, setWeb] = React.useState<string | null>("empresa1.com")
  const [instagram, setInstagram] = React.useState<string | null>(null)
  const [valor, setValor] = React.useState(4500)
  const [entradas, setEntradas] = React.useState<Entrada[]>([
    { id: "e2", tipo: "status", nota: "Lo mira con su socio y escribe la semana que viene.", fecha: "2026-09-28" },
    { id: "e1", tipo: "followup", nota: null, fecha: "2026-09-24" },
  ])
  const [recien, setRecien] = React.useState<string | null>(null)

  const apuntar = (tipo: Entrada["tipo"]) => {
    const id = `e${Date.now()}`
    setEntradas((xs) => [{ id, tipo, nota: null, fecha: new Date().toISOString() }, ...xs])
    setRecien(tipo === "status" ? id : null)
    toast.success(tipo === "followup" ? "Follow-up apuntado" : "Status apuntado")
  }

  // Los follow-ups se numeran al pintar, del más antiguo al más nuevo.
  const numero = new Map([...entradas].reverse().filter((e) => e.tipo === "followup").map((e, i) => [e.id, i + 1]))
  const log: LogEntry[] = entradas.map((e) => ({
    id: e.id,
    title: e.tipo === "followup" ? `Follow-up ${numero.get(e.id)}` : "Status",
    date: e.fecha,
    note: e.nota,
    author: "Ana Martín",
    icon: e.tipo === "followup" ? SendIcon : MessageSquareTextIcon,
    tone: e.tipo === "followup" ? "info" : "neutral",
  }))

  return (
    <div className="mx-auto w-full max-w-[480px] overflow-hidden rounded-xl border bg-card">
      <DetailSummary>
        <DetailLinks
          links={[
            { key: "web", label: "Web", icon: GlobeIcon, href: web ? `https://${web}` : null, title: web ?? undefined },
            { key: "linkedin", label: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com", title: "Página de LinkedIn" },
            { key: "instagram", label: "Instagram", icon: Instagram, href: instagram ? `https://instagram.com/${instagram}` : null },
            { key: "telefono", label: "Teléfono", icon: PhoneIcon, href: null },
          ]}
          editor={
            <DetailFields>
              <DetailField label="Web"><InlineField value={web} tipo="url" placeholder="Añadir web" onSave={async (v) => { await espera(); setWeb(v ? String(v) : null) }} /></DetailField>
              <DetailField label="Instagram"><InlineField value={instagram} placeholder="Añadir usuario" onSave={async (v) => { await espera(); setInstagram(v ? String(v) : null) }} /></DetailField>
            </DetailFields>
          }
        >
          <span className="tabular-nums">2.642 seguidores</span>
        </DetailLinks>
        <DetailFields columns={2}>
          <DetailField label="Fase"><span className="flex min-h-7 items-center"><StatusBadge tone="info">En contacto</StatusBadge></span></DetailField>
          <DetailField label="Valor">
            <InlineField value={valor} tipo="numero" onSave={async (v) => { await espera(); setValor(Number(v) || 0) }} render={(v) => <span className="font-semibold tabular-nums">{Number(v).toLocaleString("es-ES")} €</span>} />
          </DetailField>
          <DetailField label="Contacto"><span className="flex min-h-7 items-center">Ana Martín</span></DetailField>
          <DetailField label="Cierre" empty><InlineField value={null} tipo="fecha" placeholder="Añadir fecha" onSave={async () => { await espera() }} /></DetailField>
        </DetailFields>
      </DetailSummary>
      <div className="px-4 py-3">
        <InteractionLog
          entries={log}
          autoEditId={recien}
          actions={
            <>
              <Button variant="outline" size="sm" onClick={() => apuntar("followup")}><SendIcon /> Follow-up</Button>
              <Button variant="outline" size="sm" onClick={() => apuntar("status")}><MessageSquareTextIcon /> Status</Button>
            </>
          }
          onSaveNote={async (e, nota) => {
            await espera()
            setRecien(null)
            setEntradas((xs) => xs.map((x) => (x.id === e.id ? { ...x, nota } : x)))
          }}
          onDelete={(e) => setEntradas((xs) => xs.filter((x) => x.id !== e.id))}
        />
      </div>
    </div>
  )
}
