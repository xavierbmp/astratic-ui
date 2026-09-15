"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ActivityIcon,
  AlarmClockIcon,
  ArrowUpRightIcon,
  BanknoteIcon,
  CalendarClockIcon,
  CalendarIcon,
  CircleCheckIcon,
  KanbanSquareIcon,
  ListTodoIcon,
  PercentIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { fmt } from "@/lib/format"
import { recordStatus, stages, type DemoActivity, type DemoPoint, type DemoRecord, type DemoTask } from "@/lib/demo-data"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { PageBody, PageHeader } from "@/components/app/page-header"
import { KpiCard, KpiRow } from "@/components/app/kpi"
import { Section, SectionBody, SectionHeader } from "@/components/app/section"
import { WorkGrid } from "@/components/app/work-grid"
import { InsightList, InsightsPanel } from "@/components/app/insights-panel"
import { StatusBadge } from "@/components/app/status-badge"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { CellPrimary, DataTable, type Column } from "@/components/app/data-table"
import { EmptyState } from "@/components/app/states"

const chartConfig = {
  valor: { label: "Valor", color: "var(--chart-1)" },
  objetivo: { label: "Objetivo", color: "var(--chart-2)" },
} satisfies ChartConfig

export function DashboardView({
  records,
  tasks,
  activity,
  series,
}: {
  records: DemoRecord[]
  tasks: DemoTask[]
  activity: DemoActivity[]
  series: DemoPoint[]
}) {
  const total = records.reduce((a, r) => a + r.value, 0)
  const won = records.filter((r) => r.stage === "ganado")
  const overdue = records.filter((r) => r.status === "vencido")
  const byStage = stages.map((s) => ({
    fase: s.label,
    total: records.filter((r) => r.stage === s.id).length,
    valor: records.filter((r) => r.stage === s.id).reduce((a, r) => a + r.value, 0),
  }))
  const router = useRouter()
  const attention = records
    .filter((r) => r.status === "vencido" || r.status === "pendiente")
    .sort((a, b) => (a.status === b.status ? a.dueAt.localeCompare(b.dueAt) : a.status === "vencido" ? -1 : 1))
  const upcoming = [...records].filter((r) => r.stage !== "ganado").sort((a, b) => a.dueAt.localeCompare(b.dueAt))

  const attentionColumns: Column<DemoRecord>[] = [
    {
      id: "name",
      header: "Registro",
      minWidth: 200,
      cell: (r) => <CellPrimary leading={<AvatarInitials name={r.name} variant="entity" />} title={r.name} subtitle={`${r.code} · ${r.category}`} />,
    },
    {
      id: "owner",
      header: "Responsable",
      hideBelow: "md",
      cell: (r) => (
        <span className="inline-flex items-center gap-2">
          <AvatarInitials name={r.owner} size="sm" /> {r.owner}
        </span>
      ),
    },
    { id: "status", header: "Estado", cell: (r) => <StatusBadge tone={recordStatus[r.status].tone} dot>{recordStatus[r.status].label}</StatusBadge> },
    { id: "value", header: "Valor", align: "right", cell: (r) => <span className="font-semibold">{fmt.eur(r.value)}</span> },
    { id: "due", header: "Vence", align: "right", hideBelow: "lg", cell: (r) => <span className="text-xs text-muted-foreground">{fmt.date(r.dueAt)}</span> },
  ]

  return (
    <PageBody>
      <PageHeader
        title="Buenos días, Usuario 1"
        description="Todo el portal en una pantalla, actualizado con cada cambio · hace 2 min"
        actions={
          <>
            <Tabs defaultValue="mes">
              <TabsList>
                <TabsTrigger value="mes">Mes</TabsTrigger>
                <TabsTrigger value="trimestre">Trimestre</TabsTrigger>
                <TabsTrigger value="ano">Año</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline">
              <CalendarIcon /> Septiembre 2026
            </Button>
          </>
        }
      />

      <KpiRow>
        <KpiCard icon={BanknoteIcon} label="Valor total" value={fmt.eur(total)} delta={{ value: 8.4, label: "vs mes anterior" }} />
        <KpiCard icon={PercentIcon} label="Tasa de éxito" value="32 %" hint={`${won.length} ganados`} delta={{ value: 1.6, label: "vs agosto" }} />
        <KpiCard icon={KanbanSquareIcon} label="Registros abiertos" value={records.length - won.length} hint="en 4 fases" />
        <KpiCard icon={ListTodoIcon} label="Tareas pendientes" value={tasks.length} alert="2 para hoy" />
        <KpiCard icon={AlarmClockIcon} label="Vencidos" value={overdue.length} alert={overdue.length > 0 ? `${fmt.eur(overdue.reduce((a, r) => a + r.value, 0))} en riesgo` : undefined} />
      </KpiRow>

      <WorkGrid
        aside={
          <InsightsPanel
            storageKey="demo-dashboard"
            title="Hoy"
            blocks={[
              {
                id: "tareas",
                title: "Tareas de hoy",
                icon: CircleCheckIcon,
                action: <Link href="/demo/tareas" className="hover:text-foreground">Ver todas</Link>,
                render: () => (
                  <InsightList
                    items={tasks.slice(0, 4).map((t) => ({
                      key: t.id,
                      leading: <AvatarInitials name={t.owner} size="sm" />,
                      title: t.title,
                      subtitle: t.record,
                      trailing: <StatusBadge tone={t.tone}>{t.due}</StatusBadge>,
                    }))}
                  />
                ),
              },
              {
                id: "actividad",
                title: "Actividad reciente",
                icon: ActivityIcon,
                render: () => (
                  <InsightList
                    items={activity.slice(0, 5).map((a) => ({
                      key: a.id,
                      leading: <AvatarInitials name={a.who} size="sm" />,
                      title: (
                        <>
                          <span className="font-semibold">{a.who}</span> {a.what}
                        </>
                      ),
                      subtitle: a.target,
                      trailing: <span className="text-muted-foreground">{a.when}</span>,
                    }))}
                  />
                ),
              },
              {
                id: "vencimientos",
                title: "Próximos vencimientos",
                icon: CalendarClockIcon,
                render: () => (
                  <InsightList
                    items={upcoming.slice(0, 4).map((r) => ({
                      key: r.id,
                      leading: <AvatarInitials name={r.name} size="sm" variant="entity" />,
                      title: r.name,
                      subtitle: r.owner,
                      trailing: <span className="text-muted-foreground">{fmt.date(r.dueAt)}</span>,
                    }))}
                  />
                ),
              },
            ]}
          />
        }
      >
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-5">
            <Section className="lg:col-span-3">
              <SectionHeader icon={TrendingUpIcon} title="Evolución" meta="12 meses" action={<span className="text-xs text-muted-foreground">Valor · Objetivo</span>} />
              <SectionBody className="p-4">
                <ChartContainer config={chartConfig} className="h-56 w-full">
                  <AreaChart data={series} margin={{ left: 0, right: 8, top: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={(v) => (v === 0 ? "0" : `${v}k`)} />
                    <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                    <Area type="monotone" dataKey="objetivo" stroke="var(--color-objetivo)" fill="transparent" strokeDasharray="4 4" strokeWidth={1.5} />
                    <Area type="monotone" dataKey="valor" stroke="var(--color-valor)" fill="var(--color-valor)" fillOpacity={0.12} strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </SectionBody>
            </Section>

            <Section className="lg:col-span-2">
              <SectionHeader
                icon={KanbanSquareIcon}
                title="Pipeline"
                count={records.length}
                action={
                  <Button variant="ghost" size="xs" asChild>
                    <Link href="/demo/registros">Ver registros <ArrowUpRightIcon /></Link>
                  </Button>
                }
              />
              <SectionBody className="p-4">
                <ChartContainer config={{ valor: { label: "Valor", color: "var(--chart-1)" } }} className="h-56 w-full">
                  <BarChart data={byStage} layout="vertical" margin={{ left: 0, right: 8 }}>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="fase" tickLine={false} axisLine={false} width={110} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent formatter={(v) => fmt.eur(Number(v))} />} />
                    <Bar dataKey="valor" fill="var(--color-valor)" radius={4} barSize={14} />
                  </BarChart>
                </ChartContainer>
              </SectionBody>
            </Section>
          </div>

          <Section className="min-h-72">
            <SectionHeader
              icon={TriangleAlertIcon}
              title="Necesitan atención"
              count={attention.length}
              meta="vencidos y pendientes"
              action={
                <Button variant="ghost" size="xs" asChild>
                  <Link href="/demo/registros">Ver todos <ArrowUpRightIcon /></Link>
                </Button>
              }
            />
            <SectionBody>
              <DataTable
                rows={attention}
                columns={attentionColumns}
                getRowId={(r) => r.id}
                onRowClick={(r) => router.push(`/demo/registros?registro=${r.id}`)}
                emptyState={<EmptyState icon={CircleCheckIcon} title="Nada pendiente" description="Ningún registro vencido ni pendiente de respuesta." />}
              />
            </SectionBody>
          </Section>
        </div>
      </WorkGrid>
    </PageBody>
  )
}
