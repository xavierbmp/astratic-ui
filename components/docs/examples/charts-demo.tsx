"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis } from "recharts"
import { fmt } from "@/lib/format"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
const values = [124, 131, 118, 142, 155, 149, 163, 171, 168, 184, 192, 205]

const trend = months.map((month, i) => ({
  month,
  valor: values[i] * 1000,
  objetivo: (150 + i * 4) * 1000,
}))

const trendConfig = {
  valor: { label: "Valor", color: "var(--chart-1)" },
  objetivo: { label: "Objetivo", color: "var(--chart-2)" },
} satisfies ChartConfig

function eurRow(config: ChartConfig) {
  return function EurTooltipRow(value: unknown, name: unknown, item: { color?: string }) {
    return (
      <>
        <span className="size-2.5 shrink-0 rounded-[2px]" style={{ background: item.color }} />
        <div className="flex flex-1 items-center justify-between gap-4 leading-none">
          <span className="text-muted-foreground">{config[String(name)]?.label ?? String(name)}</span>
          <span className="font-mono font-medium tabular-nums text-foreground">{fmt.eur(Number(value))}</span>
        </div>
      </>
    )
  }
}

export function TrendAreaChart() {
  return (
    <ChartContainer config={trendConfig} className="h-56 w-full">
      <AreaChart data={trend} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v) => fmt.compact(Number(v))} />
        <ChartTooltip content={<ChartTooltipContent formatter={eurRow(trendConfig)} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          type="monotone"
          dataKey="objetivo"
          stroke="var(--color-objetivo)"
          fill="transparent"
          strokeDasharray="4 4"
          strokeWidth={1.5}
        />
        <Area
          type="monotone"
          dataKey="valor"
          stroke="var(--color-valor)"
          fill="var(--color-valor)"
          fillOpacity={0.12}
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}

const byPhase = [
  { fase: "Nuevo", total: 8 },
  { fase: "En contacto", total: 14 },
  { fase: "Propuesta enviada", total: 11 },
  { fase: "Negociando", total: 6 },
  { fase: "Ganado", total: 9 },
]

const phaseConfig = {
  total: { label: "Registros", color: "var(--chart-1)" },
} satisfies ChartConfig

export function PhaseBarChart() {
  return (
    <ChartContainer config={phaseConfig} className="h-56 w-full">
      <BarChart data={byPhase} layout="vertical" margin={{ left: 0, right: 8 }}>
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="fase" tickLine={false} axisLine={false} width={120} tick={{ fontSize: 12 }} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={4} barSize={14} />
      </BarChart>
    </ChartContainer>
  )
}

const donutConfig = {
  hecho: { label: "Hecho", color: "var(--chart-1)" },
  pendiente: { label: "Pendiente", color: "var(--chart-2)" },
} satisfies ChartConfig

const donut = [
  { key: "hecho", value: 64, fill: "var(--color-hecho)" },
  { key: "pendiente", value: 36, fill: "var(--color-pendiente)" },
]

export function DonutChart() {
  return (
    <ChartContainer config={donutConfig} className="mx-auto aspect-square h-48">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
        <Pie data={donut} dataKey="value" nameKey="key" innerRadius={48} outerRadius={66} strokeWidth={2} paddingAngle={2}>
          <Label
            content={({ viewBox }) =>
              viewBox && "cx" in viewBox && "cy" in viewBox ? (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan className="fill-foreground text-xl font-semibold tabular-nums">64 %</tspan>
                </text>
              ) : null
            }
          />
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="key" />} />
      </PieChart>
    </ChartContainer>
  )
}

const spark = [12, 14, 13, 17, 16, 19, 21, 20, 24, 23, 27, 30].map((v, i) => ({ i, v }))

export function KpiSparkline() {
  return (
    <ChartContainer config={{ v: { label: "Valor", color: "var(--chart-1)" } }} className="aspect-auto h-8 w-24">
      <AreaChart data={spark} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <Area
          type="monotone"
          dataKey="v"
          stroke="var(--color-v)"
          fill="var(--color-v)"
          fillOpacity={0.12}
          strokeWidth={1.5}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}
