"use client"

import * as React from "react"
import { toast } from "sonner"
import { AlarmClockIcon, ArchiveIcon, CheckIcon, CircleCheckIcon, ListTodoIcon, PlusIcon, UserIcon } from "lucide-react"
import { cn } from "cn"
import type { StatusTone } from "@/lib/status"
import { usePageView } from "@/hooks/use-page-view"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { PageBody, PageHeader } from "@/components/app/page-header"
import { KpiCard, KpiRow } from "@/components/app/kpi"
import { Section, SectionBody, SectionHeader } from "@/components/app/section"
import { WorkGrid } from "@/components/app/work-grid"
import { FilterMenu, Toolbar, ToolbarSearch, ToolbarSpacer, ViewSwitcher } from "@/components/app/toolbar"
import { Kanban } from "@/components/app/kanban"
import { BulkBar } from "@/components/app/bulk-bar"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { EmptyState } from "@/components/app/states"
import { InsightStat, InsightsPanel } from "@/components/app/insights-panel"

export type TaskState = "pendiente" | "en-curso" | "hecha"
export type Task = { id: string; columnId: TaskState; title: string; record: string; owner: string; due: string; dueTone: StatusTone }

const columns: { id: TaskState; title: string; tone: StatusTone }[] = [
  { id: "pendiente", title: "Pendiente", tone: "neutral" },
  { id: "en-curso", title: "En curso", tone: "info" },
  { id: "hecha", title: "Hecha", tone: "success" },
]

export function TareasView({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = React.useState<Task[]>(initialTasks)
  const owners = React.useMemo(() => Array.from(new Set(tasks.map((t) => t.owner))).sort(), [tasks])
  const { view, setView, views } = usePageView("demo-tareas", ["list", "kanban"])
  const [query, setQuery] = React.useState("")
  const [ownerFilter, setOwnerFilter] = React.useState<string[]>([])
  const [selected, setSelected] = React.useState<Set<string>>(new Set())

  const filtered = tasks.filter(
    (t) => (!query || t.title.toLowerCase().includes(query.toLowerCase()) || t.record.toLowerCase().includes(query.toLowerCase())) && (ownerFilter.length === 0 || ownerFilter.includes(t.owner))
  )
  const pending = filtered.filter((t) => t.columnId !== "hecha")
  const done = filtered.filter((t) => t.columnId === "hecha")

  const complete = (ids: string[]) => {
    setTasks((ts) => ts.map((t) => (ids.includes(t.id) ? { ...t, columnId: "hecha" } : t)))
    setSelected(new Set())
    toast.success(ids.length === 1 ? "Tarea completada" : `${ids.length} tareas completadas`)
  }
  const archive = (ids: string[]) => {
    const previous = tasks
    setTasks(previous.filter((t) => !ids.includes(t.id)))
    setSelected(new Set())
    toast.success(ids.length === 1 ? "Tarea archivada" : `${ids.length} tareas archivadas`, { action: { label: "Deshacer", onClick: () => setTasks(previous) } })
  }

  const groups: { label: string; items: Task[] }[] = [
    { label: "Hoy", items: pending.filter((t) => t.due === "Hoy") },
    { label: "Mañana", items: pending.filter((t) => t.due === "Mañana") },
    { label: "Próximas", items: pending.filter((t) => t.due !== "Hoy" && t.due !== "Mañana") },
    { label: "Hechas", items: done },
  ].filter((g) => g.items.length > 0)

  return (
    <PageBody>
      <PageHeader title="Tareas" description="Lo que hay que hacer, por fecha y por responsable." />

      <KpiRow>
        <KpiCard icon={ListTodoIcon} label="Pendientes" value={pending.length} hint={`${done.length} hechas`} />
        <KpiCard icon={AlarmClockIcon} label="Para hoy" value={pending.filter((t) => t.due === "Hoy").length} alert={pending.filter((t) => t.due === "Hoy").length > 0 ? "vencen hoy" : undefined} />
        <KpiCard icon={CircleCheckIcon} label="Completadas esta semana" value={done.length} delta={{ value: 25, label: "vs semana pasada" }} />
      </KpiRow>

      <Toolbar>
        <ToolbarSearch placeholder="Buscar tarea…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <FilterMenu label="Responsable" icon={UserIcon} options={owners.map((o) => ({ value: o, label: o, count: tasks.filter((t) => t.owner === o).length }))} value={ownerFilter} onChange={setOwnerFilter} />
        <ToolbarSpacer />
        <ViewSwitcher views={views} value={view} onChange={setView} />
        <Button onClick={() => toast("Aquí se crearía la tarea")}><PlusIcon /> Nueva tarea</Button>
      </Toolbar>

      <WorkGrid
        aside={
          <InsightsPanel
            storageKey="demo-tareas"
            title="Carga de trabajo"
            blocks={[
              {
                id: "por-persona",
                title: "Por responsable",
                icon: UserIcon,
                render: () => (
                  <div className="divide-y">
                    {owners.map((o) => (
                      <InsightStat key={o} label={o} value={tasks.filter((t) => t.owner === o && t.columnId !== "hecha").length} sub="pendientes" />
                    ))}
                  </div>
                ),
              },
              {
                id: "ritmo",
                title: "Ritmo",
                icon: CircleCheckIcon,
                render: () => (
                  <div className="divide-y">
                    <InsightStat label="Completadas hoy" value={2} />
                    <InsightStat label="Media diaria" value="3,4" />
                    <InsightStat label="Más antigua" value="6 días" />
                  </div>
                ),
              },
            ]}
          />
        }
      >
        <Section className="min-h-[480px]">
          <SectionHeader icon={ListTodoIcon} title="Tareas" count={filtered.length} />
          <SectionBody>
            {filtered.length === 0 ? (
              <EmptyState icon={CircleCheckIcon} title="Todo hecho" description="No hay tareas que coincidan. Crea una nueva o cambia el filtro." />
            ) : view === "list" ? (
              <div className="divide-y">
                {groups.map((g) => (
                  <div key={g.label}>
                    <div className="flex items-center gap-2 bg-muted/40 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                      {g.label} <span className="tabular-nums">{g.items.length}</span>
                    </div>
                    <ul className="divide-y">
                      {g.items.map((t) => {
                        const isDone = t.columnId === "hecha"
                        const isSel = selected.has(t.id)
                        return (
                          <li key={t.id} data-state={isSel ? "selected" : undefined} className={cn("group/task", isSel && "bg-brand-soft/60")}>
                            <div className="flex items-center gap-3 px-4 py-2.5">
                              <Checkbox
                                aria-label={`Seleccionar ${t.title}`}
                                checked={isSel}
                                onCheckedChange={() => setSelected((s) => { const n = new Set(s); if (n.has(t.id)) n.delete(t.id); else n.add(t.id); return n })}
                                className={cn(selected.size === 0 && "opacity-0 group-hover/task:opacity-100 focus-visible:opacity-100")}
                              />
                              <button
                                type="button"
                                aria-label={isDone ? `Reabrir ${t.title}` : `Completar ${t.title}`}
                                onClick={() => (isDone ? setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, columnId: "pendiente" } : x))) : complete([t.id]))}
                                className={cn(
                                  "grid size-4 place-items-center rounded-full border transition-colors",
                                  isDone ? "border-success bg-success text-background" : "hover:border-foreground"
                                )}
                              >
                                {isDone && <CheckIcon className="size-3" strokeWidth={3} />}
                              </button>
                              <span className="grid min-w-0 flex-1 leading-tight">
                                <span className={cn("truncate text-[13.5px] font-semibold", isDone && "text-muted-foreground line-through")}>{t.title}</span>
                                <span className="truncate text-xs text-muted-foreground">{t.record}</span>
                              </span>
                              <StatusBadge tone={columns.find((c) => c.id === t.columnId)!.tone}>{columns.find((c) => c.id === t.columnId)!.title}</StatusBadge>
                              <StatusBadge tone={isDone ? "neutral" : t.dueTone} className="w-16 justify-center">{t.due}</StatusBadge>
                              <AvatarInitials name={t.owner} size="sm" />
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <Kanban
                columns={columns}
                items={filtered}
                onChange={(next) => {
                  const map = new Map(next.map((n) => [n.id, n.columnId]))
                  setTasks((ts) => ts.map((t) => (map.has(t.id) ? { ...t, columnId: map.get(t.id)! } : t)))
                }}
                renderCard={(t) => (
                  <div className="flex flex-col gap-2">
                    <span className="grid leading-tight">
                      <span className="text-[13.5px] font-semibold">{t.title}</span>
                      <span className="text-xs text-muted-foreground">{t.record}</span>
                    </span>
                    <div className="flex items-center justify-between">
                      <StatusBadge tone={t.columnId === "hecha" ? "neutral" : t.dueTone}>{t.due}</StatusBadge>
                      <AvatarInitials name={t.owner} size="xs" />
                    </div>
                  </div>
                )}
              />
            )}
          </SectionBody>
          <BulkBar count={selected.size} onClear={() => setSelected(new Set())}>
            <Button variant="ghost" size="sm" onClick={() => complete([...selected])}><CircleCheckIcon /> Completar</Button>
            <Button variant="ghost" size="sm" onClick={() => toast.success(`${selected.size} reasignadas`)}><UserIcon /> Reasignar</Button>
            <Button variant="ghost" size="sm" onClick={() => archive([...selected])}><ArchiveIcon /> Archivar</Button>
          </BulkBar>
        </Section>
      </WorkGrid>
    </PageBody>
  )
}
