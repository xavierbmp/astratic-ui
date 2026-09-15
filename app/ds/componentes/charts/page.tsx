import { BanknoteIcon, ChartPieIcon, KanbanSquareIcon, TrendingUpIcon } from "lucide-react"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { DonutChart, KpiSparkline, PhaseBarChart, TrendAreaChart } from "@/components/docs/examples/charts-demo"
import { Section, SectionBody, SectionHeader } from "@/components/app/section"
import { KpiCard, KpiRow } from "@/components/app/kpi"
import { fmt } from "@/lib/format"

export const metadata = { title: "Gráficos" }

const areaCode = `const chartConfig = {
  valor: { label: "Valor", color: "var(--chart-1)" },
  objetivo: { label: "Objetivo", color: "var(--chart-2)" },
} satisfies ChartConfig

<Section>
  <SectionHeader icon={TrendingUpIcon} title="Evolución" meta="12 meses" />
  <SectionBody className="p-4">
    <ChartContainer config={chartConfig} className="h-56 w-full">
      <AreaChart data={series} margin={{ left: 0, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(v) => fmt.compact(Number(v))} />
        <ChartTooltip content={<ChartTooltipContent formatter={eurRow(chartConfig)} />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area type="monotone" dataKey="objetivo" stroke="var(--color-objetivo)" fill="transparent" strokeDasharray="4 4" strokeWidth={1.5} />
        <Area type="monotone" dataKey="valor" stroke="var(--color-valor)" fill="var(--color-valor)" fillOpacity={0.12} strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  </SectionBody>
</Section>`

const formatterCode = `function eurRow(config: ChartConfig) {
  return (value: unknown, name: unknown, item: { color?: string }) => (
    <>
      <span className="size-2.5 shrink-0 rounded-[2px]" style={{ background: item.color }} />
      <div className="flex flex-1 items-center justify-between gap-4 leading-none">
        <span className="text-muted-foreground">{config[String(name)]?.label ?? String(name)}</span>
        <span className="font-mono font-medium tabular-nums text-foreground">{fmt.eur(Number(value))}</span>
      </div>
    </>
  )
}`

const barCode = `<ChartContainer config={{ total: { label: "Registros", color: "var(--chart-1)" } }} className="h-56 w-full">
  <BarChart data={byPhase} layout="vertical" margin={{ left: 0, right: 8 }}>
    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
    <XAxis type="number" hide />
    <YAxis type="category" dataKey="fase" tickLine={false} axisLine={false} width={120} tick={{ fontSize: 12 }} />
    <ChartTooltip content={<ChartTooltipContent />} />
    <Bar dataKey="total" fill="var(--color-total)" radius={4} barSize={14} />
  </BarChart>
</ChartContainer>`

const donutCode = `const donutConfig = {
  hecho: { label: "Hecho", color: "var(--chart-1)" },
  pendiente: { label: "Pendiente", color: "var(--chart-2)" },
} satisfies ChartConfig

const data = [
  { key: "hecho", value: 64, fill: "var(--color-hecho)" },
  { key: "pendiente", value: 36, fill: "var(--color-pendiente)" },
]

<ChartContainer config={donutConfig} className="mx-auto aspect-square h-48">
  <PieChart>
    <ChartTooltip content={<ChartTooltipContent nameKey="key" hideLabel />} />
    <Pie data={data} dataKey="value" nameKey="key" innerRadius={48} outerRadius={66} strokeWidth={2} paddingAngle={2}>
      <Label content={({ viewBox }) => viewBox && "cx" in viewBox && "cy" in viewBox ? (
        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
          <tspan className="fill-foreground text-xl font-semibold tabular-nums">64 %</tspan>
        </text>
      ) : null} />
    </Pie>
    <ChartLegend content={<ChartLegendContent nameKey="key" />} />
  </PieChart>
</ChartContainer>`

const sparkCode = `<KpiCard icon={BanknoteIcon} label="Valor total" value={fmt.eur(total)} hint={<KpiSparkline data={last12} />} delta={{ value: 6.8, label: "vs mes anterior" }} />

function KpiSparkline({ data }: { data: { i: number; v: number }[] }) {
  return (
    <ChartContainer config={{ v: { label: "Valor", color: "var(--chart-1)" } }} className="aspect-auto h-8 w-24">
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <Area type="monotone" dataKey="v" stroke="var(--color-v)" fill="var(--color-v)" fillOpacity={0.12} strokeWidth={1.5} isAnimationActive={false} />
      </AreaChart>
    </ChartContainer>
  )
}`

export default function ChartsPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Gráficos"
      lead="Recharts envuelto por ChartContainer de shadcn con la paleta del sistema: la serie principal en el acento y el resto en grises. Un gráfico responde a una pregunta; si no hay pregunta, es una tabla."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Los gráficos viven en dashboards y en bloques de resumen, siempre dentro de un <code>Section</code> con
            cabecera que dice qué se mide y en qué periodo. En las páginas de operación no hay gráficos: los datos se
            trabajan en la tabla o el kanban y las cifras van en la fila de KPIs. Antes de dibujar, la pregunta:
          </p>
        </Prose>
        <SpecTable
          columns={["Pregunta", "Tipo de gráfico", "Componentes"]}
          rows={[
            ["¿Cómo evoluciona X en el tiempo?", "Área con la serie principal", <code key="c">AreaChart + Area</code>],
            ["¿Vamos según lo previsto?", "Área más una línea discontinua gris con el objetivo", <code key="c">AreaChart con dos Area, la segunda fill=&quot;transparent&quot; y strokeDasharray</code>],
            ["¿Cómo se comparan dos o tres series?", "Líneas, tres como máximo", <code key="c">LineChart + Line</code>],
            ["¿Cómo se reparte X entre categorías?", "Barras horizontales, categorías ordenadas por el flujo o por valor", <code key="c">BarChart layout=&quot;vertical&quot; + Bar</code>],
            ["¿Qué parte del total es X?", "Donut pequeño con dos o tres partes y la cifra en el centro", <code key="c">PieChart + Pie con innerRadius + Label</code>],
            ["¿Hay tendencia dentro de una cifra?", "Sparkline sin ejes en la tarjeta", <code key="c">AreaChart en h-8 como hint de KpiCard</code>],
            ["¿Muchas categorías, valores exactos, comparar filas?", "Tabla, no gráfico", <code key="c">DataTable</code>],
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo" lead="Datos genéricos. Cada gráfico dentro de un Section con cabecera, altura fija h-56 y formato de cifras con lib/format.ts.">
        <Example title="Evolución frente a objetivo" description="Serie principal en --chart-1 con relleno al 12 %; objetivo en --chart-2 discontinuo y sin relleno. Leyenda porque hay dos series." code={areaCode}>
          <Section>
            <SectionHeader icon={TrendingUpIcon} title="Evolución" meta="12 meses" />
            <SectionBody className="p-4">
              <TrendAreaChart />
            </SectionBody>
          </Section>
        </Example>
        <CodeBlock code={formatterCode} title="El formatter del tooltip sustituye la fila entera: devuelve indicador, etiqueta y valor con fmt" />

        <Example title="Reparto por fase" description="Barras horizontales con las categorías en el eje Y y la rejilla solo en el eje de valores." code={barCode}>
          <Section>
            <SectionHeader icon={KanbanSquareIcon} title="Registros por fase" count={48} />
            <SectionBody className="p-4">
              <PhaseBarChart />
            </SectionBody>
          </Section>
        </Example>

        <Example title="Parte del total" description="Donut de dos partes con la cifra en el centro. Con más de tres partes la pregunta se responde mejor con barras." code={donutCode}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Section>
              <SectionHeader icon={ChartPieIcon} title="Tareas completadas" meta="esta semana" />
              <SectionBody className="p-4">
                <DonutChart />
              </SectionBody>
            </Section>
          </div>
        </Example>

        <Example title="Sparkline en una cifra" description="Solo si la cifra tiene historia y la tendencia importa. Sin ejes, sin tooltip, sin animación." code={sparkCode}>
          <KpiRow>
            <KpiCard icon={BanknoteIcon} label="Valor total" value={fmt.eur(2050000)} hint={<KpiSparkline />} delta={{ value: 6.8, label: "vs mes anterior" }} />
            <KpiCard icon={TrendingUpIcon} label="Tasa de éxito" value="32 %" hint="15 ganados" delta={{ value: 1.6, label: "vs agosto" }} />
          </KpiRow>
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              Paleta: <code>var(--chart-1)</code> (brand) para la serie principal y <code>--chart-2</code> a{" "}
              <code>--chart-5</code> (grises) para el resto. Nunca colores de Tailwind ni hex en{" "}
              <code>ChartConfig</code>.
            </>,
            <>Nunca más de tres series en un gráfico. Si hacen falta más, son varios gráficos o una tabla.</>,
            <>
              Rejilla solo en el eje de valores y discontinua:{" "}
              <code>&lt;CartesianGrid vertical={"{false}"} strokeDasharray=&quot;3 3&quot; /&gt;</code> (
              <code>horizontal={"{false}"}</code> en barras horizontales). Sin líneas de eje ni marcas:{" "}
              <code>axisLine={"{false}"} tickLine={"{false}"}</code>.
            </>,
            <>
              Etiquetas de eje de 11 a 12 px en <code>text-muted-foreground</code>; lo pone <code>ChartContainer</code>.
              Eje Y con <code>tickFormatter</code> y <code>fmt.compact</code>; eje X con etiquetas cortas («ene»,
              «feb»).
            </>,
            <>
              Tooltip de shadcn: <code>ChartTooltip</code> con <code>ChartTooltipContent</code>. Las cifras se
              formatean con <code>lib/format.ts</code> en <code>formatter</code>, que sustituye la fila completa: hay
              que devolver indicador, etiqueta y valor.
            </>,
            <>
              Altura fija <code>h-56</code> y <code>w-full</code> dentro de un <code>SectionBody</code> con{" "}
              <code>p-4</code>. La cabecera del <code>Section</code> dice qué se mide y el periodo («Evolución · 12
              meses»).
            </>,
            <>
              Las claves de <code>ChartConfig</code> coinciden con los <code>dataKey</code> y el color se lee con{" "}
              <code>var(--color-&lt;clave&gt;)</code>. Leyenda (<code>ChartLegend</code> +{" "}
              <code>ChartLegendContent</code>) solo si hay más de una serie.
            </>,
            <>
              Sparklines dentro de <code>KpiCard</code> como <code>hint</code> visual solo si aportan tendencia: área
              sin ejes ni tooltip, <code>h-8</code>, <code>isAnimationActive={"{false}"}</code>. Si la cifra no tiene
              historia, no hay sparkline.
            </>,
            <>
              Sin etiquetas sobre cada punto, sin 3D, sin degradados ni sombras. En dashboards que se refrescan solos,
              sin animación de entrada.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "Una serie en brand y el objetivo en gris discontinuo.",
            "Rejilla 3 3 en el eje de valores, sin líneas de eje.",
            "fmt.eur en el tooltip, fmt.compact en el eje.",
            "h-56 dentro de una Section con título y periodo.",
          ]}
          donts={[
            "Cinco series de colores distintos.",
            "Tarta con ocho porciones y etiquetas.",
            "Colores de Tailwind o hex en la config.",
            "Gráfico sin cabecera que diga qué mide.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <Prose>
          <p>
            <code>ChartContainer</code>, <code>ChartTooltip</code>, <code>ChartTooltipContent</code>,{" "}
            <code>ChartLegend</code> y <code>ChartLegendContent</code> son los de shadcn:{" "}
            <a href="https://ui.shadcn.com/docs/components/chart" target="_blank" rel="noreferrer">
              ui.shadcn.com/docs/components/chart
            </a>
            . Los gráficos y sus props son de{" "}
            <a href="https://recharts.org/en-US/api" target="_blank" rel="noreferrer">
              Recharts
            </a>
            . Lo que más se toca:
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            ["ChartContainer · config", <code key="t">ChartConfig</code>, "Por cada dataKey: { label, color } (o theme: { light, dark }). Genera las variables --color-<clave>."],
            ["ChartContainer · className", <code key="t">string</code>, "Altura y anchura: h-56 w-full. aspect-auto h-8 w-24 para sparklines."],
            ["ChartTooltipContent · indicator", <code key="t">&quot;dot&quot; | &quot;line&quot; | &quot;dashed&quot;</code>, "Forma del indicador de color de cada serie."],
            ["ChartTooltipContent · formatter", <code key="t">(value, name, item) =&gt; ReactNode</code>, "Sustituye la fila completa. Úsalo para fmt.eur, fmt.pct."],
            ["ChartTooltipContent · hideLabel", <code key="t">boolean</code>, "Quita la cabecera del tooltip (la categoría del eje X)."],
            ["ChartTooltipContent · nameKey", <code key="t">string</code>, "Qué campo del dato identifica la serie en la config. Necesario en Pie."],
            ["ChartLegendContent · nameKey", <code key="t">string</code>, "Igual que en el tooltip, para la leyenda del donut."],
          ]}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add chart" />
        <Prose>
          <p>
            Instala <code>recharts</code> y crea <code>components/ui/chart.tsx</code>. Las variables{" "}
            <code>--chart-1</code> a <code>--chart-5</code> vienen con el tema del registry.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/kpi", label: "Cifras (KPI)", text: "La tarjeta que puede llevar una sparkline." },
            { href: "/ds/componentes/section", label: "Sección", text: "El contenedor con cabecera y periodo." },
            { href: "/ds/fundamentos/color", label: "Color", text: "El acento y los grises de --chart-1 a --chart-5." },
            { href: "/ds/componentes/insights-panel", label: "Panel de información", text: "Bloques de resumen a la derecha." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
