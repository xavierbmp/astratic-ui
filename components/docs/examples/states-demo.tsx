"use client"

import * as React from "react"
import { RefreshCwIcon, Table2Icon, TriangleAlertIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Section, SectionBody, SectionHeader } from "@/components/app/section"
import { ErrorState, TableSkeleton } from "@/components/app/states"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials } from "@/components/app/avatar-initials"

const rows = Array.from({ length: 4 }, (_, i) => ({
  id: i + 1,
  name: `Registro ${i + 1}`,
  owner: `Usuario ${(i % 3) + 1}`,
  active: i % 2 === 0,
}))

function Rows({ busy = false }: { busy?: boolean }) {
  return (
    <ul aria-busy={busy || undefined} className={cn("divide-y transition-opacity", busy && "pointer-events-none opacity-60")}>
      {rows.map((r) => (
        <li key={r.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
          <AvatarInitials name={r.name} size="sm" variant="entity" />
          <span className="flex-1 font-medium">{r.name}</span>
          <span className="text-muted-foreground">{r.owner}</span>
          <StatusBadge tone={r.active ? "success" : "warning"} dot>
            {r.active ? "Activo" : "Pendiente"}
          </StatusBadge>
        </li>
      ))}
    </ul>
  )
}

export function LoadingDemo() {
  const [phase, setPhase] = React.useState<"loading" | "ready" | "refetch">("loading")

  React.useEffect(() => {
    if (phase === "ready") return
    const t = setTimeout(() => setPhase("ready"), 1200)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <Section>
      <SectionHeader
        icon={Table2Icon}
        title="Registros"
        count={phase === "loading" ? undefined : rows.length}
        action={
          <Button variant="ghost" size="sm" disabled={phase !== "ready"} onClick={() => setPhase("refetch")}>
            <RefreshCwIcon /> Recargar
          </Button>
        }
      />
      <SectionBody>{phase === "loading" ? <TableSkeleton rows={4} cols={4} /> : <Rows busy={phase === "refetch"} />}</SectionBody>
    </Section>
  )
}

export function ErrorStateDemo() {
  const [phase, setPhase] = React.useState<"error" | "loading" | "ready">("error")

  React.useEffect(() => {
    if (phase !== "loading") return
    const t = setTimeout(() => setPhase("ready"), 900)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <Section>
      <SectionHeader
        icon={Table2Icon}
        title="Registros"
        count={phase === "ready" ? rows.length : undefined}
        action={
          phase === "ready" && (
            <Button variant="ghost" size="sm" onClick={() => setPhase("error")}>
              <TriangleAlertIcon /> Simular error
            </Button>
          )
        }
      />
      <SectionBody>
        {phase === "error" && (
          <ErrorState
            description="El servidor no ha respondido. Comprueba la conexión y vuelve a intentarlo."
            onRetry={() => setPhase("loading")}
          />
        )}
        {phase === "loading" && <TableSkeleton rows={4} cols={4} />}
        {phase === "ready" && <Rows />}
      </SectionBody>
    </Section>
  )
}
