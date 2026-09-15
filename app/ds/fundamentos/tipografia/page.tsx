import { BanknoteIcon } from "lucide-react"
import { cn } from "cn"
import { DocPage, DocSection, DoDont, Example, NextLinks, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { KpiCard } from "@/components/app/kpi"
import { fmt } from "@/lib/format"

const scale = [
  {
    level: "Título de página",
    sample: "Registros",
    className: "text-[27px] leading-tight font-semibold tracking-tight",
    spec: "27 px · 600 · -0.025em",
    where: "PageHeader y DocPage. Uno por página, sin icono.",
  },
  {
    level: "Título de ficha",
    sample: "Acme Studio",
    className: "text-[15px] leading-tight font-semibold",
    spec: "15 px · 600",
    where: "Nombre del registro en la cabecera del sheet de detalle.",
  },
  {
    level: "Título de sección",
    sample: "Pipeline por fase",
    className: "text-sm font-semibold",
    spec: "14 px · 600",
    where: "Cabecera de Section, columnas del kanban, título de una tarjeta.",
  },
  {
    level: "Título de bloque",
    sample: "Datos de contacto",
    className: "text-[13px] font-semibold",
    spec: "13 px · 600",
    where: "Bloques del panel de información y secciones dentro del sheet.",
  },
  {
    level: "Celda principal",
    sample: "Acme Studio",
    className: "text-[13.5px] font-semibold",
    spec: "13,5 px · 600",
    where: "Primera columna de DataTable (CellPrimary). El resto de celdas van a 13,5 px en normal.",
  },
  {
    level: "Párrafo",
    sample: "Todas las oportunidades abiertas del equipo, ordenadas por fase.",
    className: "text-sm",
    spec: "14 px · 400",
    where: "Descripción de página, botones, menús, campos de formulario, texto del sheet.",
  },
  {
    level: "Secundario",
    sample: "REG-0042 · Cliente · actualizado hace 3 min",
    className: "text-xs text-muted-foreground",
    spec: "12 px · 400 · muted",
    where: "Subtítulo de celda, meta de cabecera, pie de tabla, ayuda bajo un campo. La etiqueta de la cifra usa 12,5 px.",
  },
  {
    level: "Cifra",
    sample: fmt.eur(799342),
    className: "text-2xl font-semibold tracking-tight tabular-nums",
    spec: "24 px · 600 · -0.025em · tabular",
    where: "Valor de KpiCard. En ningún otro sitio.",
  },
  {
    level: "Etiqueta",
    sample: "Fase",
    className: "text-xs font-medium text-muted-foreground",
    spec: "12 px · 500",
    where: "Cabeceras de columna, grupos de la sidebar, eyebrow, badges y contadores. Entre 11 y 12 px.",
  },
  {
    level: "Código",
    sample: "REG-0042",
    className: "font-mono text-[12px]",
    spec: "12 px · mono",
    where: "Código inline (12), bloques de código (12,5), tokens (11). Códigos de registro cuando se alinean en columna.",
  },
]

const rows = [
  { name: "Acme Studio", code: "REG-0042", amount: 1111111, delta: 8.4 },
  { name: "Norte Films", code: "REG-0031", amount: 799342, delta: -2.1 },
  { name: "Baobab Agency", code: "REG-0118", amount: 48000, delta: 12.6 },
  { name: "Lumen Retail", code: "REG-0007", amount: 1250, delta: 0 },
]

export const metadata = { title: "Tipografía" }

export default function TipografiaPage() {
  return (
    <DocPage
      eyebrow="Fundamentos"
      title="Tipografía"
      lead="Una sola familia, Geist, y una escala corta con usos fijos: cada tamaño tiene un sitio y cada sitio tiene un tamaño. Es lo que hace que una tabla de facturas y un kanban de campañas parezcan del mismo portal."
    >
      <DocSection id="familia" title="Una familia: Geist" lead="Geist para todo el texto y Geist Mono para lo que es código. No hay tercera fuente, ni para títulos ni para cifras.">
        <Example>
          <div className="flex flex-col gap-5">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Geist · font-sans</p>
              <p className="text-[27px] leading-tight font-semibold tracking-tight">Facturación del trimestre</p>
              <p className="mt-1 text-sm text-muted-foreground">Emitidas, cobradas y vencidas por cliente. Aa Bb Cc 0123456789 € %</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Geist Mono · font-mono</p>
              <p className="font-mono text-[12.5px]">FAC-2026-0187 · components/app/kpi.tsx · 0123456789</p>
            </div>
          </div>
        </Example>
        <Rules
          items={[
            <>Las dos se cargan con <code>next/font</code> en <code>app/layout.tsx</code> y exponen <code>--font-sans</code> y <code>--font-mono</code>. <code>globals.css</code> las mapea a <code>font-sans</code> y <code>font-mono</code>; <code>--font-heading</code> apunta a la misma sans, así que no hay fuente de títulos.</>,
            <>Geist Mono se usa para código, tokens y rutas. También vale para códigos de registro (<code>REG-0042</code>, <code>FAC-2026-0187</code>) cuando hay muchos en columna y conviene que alineen; en una ficha suelta van en Geist normal.</>,
            <><code>antialiased</code>, <code>optimizeLegibility</code> y <code>text-wrap: balance</code> en h1 a h3 ya están aplicados desde <code>globals.css</code>. No se repiten en los componentes.</>,
          ]}
        />
      </DocSection>

      <DocSection id="escala" title="La escala" lead="Diez niveles y ninguno más. Si un texto no encaja en uno de ellos, es que sobra o es otro nivel.">
        <Example>
          <div className="divide-y">
            {scale.map((s) => (
              <div key={s.level} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3 first:pt-0 last:pb-0">
                <span className={s.className}>{s.sample}</span>
                <span className="font-mono text-[11px] whitespace-nowrap text-muted-foreground">{s.spec}</span>
              </div>
            ))}
          </div>
        </Example>
        <SpecTable
          columns={["Nivel", "Clase", "Dónde"]}
          rows={scale.map((s) => [s.level, <code key={s.level}>{s.className}</code>, s.where])}
        />
        <Rules
          items={[
            <>Los tamaños intermedios (13,5, 13 y 12,5 px) existen porque a 14 px una tabla densa se hace grande y a 12 px se hace ilegible. No se inventan otros: <code>text-[15.5px]</code> no es un nivel.</>,
            <>Los componentes del kit ya llevan su nivel. Un portal solo escribe clases de tipografía en texto propio (una ficha, un bloque del panel) y las elige de esta tabla.</>,
            <>Las cabeceras de columna van en 12 px medium y gris (<code>text-xs font-medium text-muted-foreground</code>): son etiquetas, no títulos.</>,
          ]}
        />
      </DocSection>

      <DocSection id="pesos" title="Pesos, tracking y altura de línea" lead="Tres pesos. El 700 no existe en el sistema: Geist a 600 ya pesa lo suficiente.">
        <Example>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm">Normal 400</p>
              <p className="mt-1 text-xs text-muted-foreground">Texto de trabajo, párrafos, celdas, descripciones, ayuda.</p>
            </div>
            <div>
              <p className="text-sm font-medium">Medium 500</p>
              <p className="mt-1 text-xs text-muted-foreground">Botones, ítems de menú, etiquetas de campo, cabeceras de columna, badges.</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Semibold 600</p>
              <p className="mt-1 text-xs text-muted-foreground">Títulos, celda principal, cifras, contador de la barra de selección.</p>
            </div>
          </div>
        </Example>
        <Rules
          items={[
            <><strong>Tracking:</strong> <code>tracking-tight</code> solo en el título de página y en la cifra de KPI. Es el único ajuste permitido y equivale a -0.025em. Nunca <code>tracking-tighter</code> ni valores arbitrarios más apretados; en cuerpo, tracking normal.</>,
            <><strong>Altura de línea:</strong> <code>leading-tight</code> en títulos y en la celda principal (título y subtítulo apilados). Los párrafos usan la altura por defecto de Tailwind; <code>leading-relaxed</code> queda para texto largo de documentación.</>,
            <><strong>Mayúsculas:</strong> títulos y botones en frase normal («Nuevo registro», no «Nuevo Registro» ni «NUEVO REGISTRO»). <code>uppercase</code> solo en etiquetas de cuatro palabras o menos y con <code>tracking-wide</code>; hoy el kit no lo usa en ningún sitio.</>,
            <><code>tracking-wide</code> tiene una única excepción: los monogramas de <code>AvatarInitials</code>.</>,
          ]}
        />
      </DocSection>

      <DocSection id="cifras" title="Cifras" lead="Toda cifra que se alinea con otra lleva tabular-nums: columnas numéricas, KPIs, contadores, deltas, paginación. Sin excepciones.">
        <Example>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
            <table className="w-full text-[13.5px]">
              <thead className="text-left text-xs font-medium text-muted-foreground">
                <tr>
                  <th className="pb-2">Registro</th>
                  <th className="pb-2 text-right">Importe</th>
                  <th className="pb-2 text-right">Variación</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr key={r.code}>
                    <td className="py-2">
                      <div className="grid leading-tight">
                        <span className="font-semibold">{r.name}</span>
                        <span className="text-xs text-muted-foreground">{r.code}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right tabular-nums">{fmt.eur(r.amount)}</td>
                    <td
                      className={cn(
                        "py-2 text-right tabular-nums",
                        r.delta > 0 ? "text-success" : r.delta < 0 ? "text-danger" : "text-muted-foreground"
                      )}
                    >
                      {fmt.delta(r.delta)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <KpiCard icon={BanknoteIcon} label="Pipeline" value={fmt.eur(799342)} delta={{ value: 8.4, label: "vs mes anterior" }} />
          </div>
        </Example>
        <CodeBlock
          code={`// Cifra: KpiCard ya lleva text-2xl font-semibold tracking-tight tabular-nums
<KpiCard icon={BanknoteIcon} label="Pipeline" value={fmt.eur(799342)} delta={{ value: 8.4, label: "vs mes anterior" }} />

// Columna numérica: align="right" añade text-right tabular-nums a la celda
const columns: Column<Registro>[] = [
  { id: "name", header: "Registro", cell: (r) => <CellPrimary title={r.name} subtitle={r.code} /> },
  { id: "amount", header: "Importe", align: "right", cell: (r) => fmt.eur(r.amount), sortValue: (r) => r.amount },
]

// Texto propio: siempre con el formateador y tabular-nums
<span className="text-xs tabular-nums text-muted-foreground">{fmt.pct(32)} · {fmt.date(fecha)}</span>`}
        />
        <Rules
          items={[
            <><code>tabular-nums</code> se pone en el elemento que contiene la cifra. <code>DataTable</code> lo añade solo en columnas con <code>align="right"</code>; una cifra dentro de una columna alineada a la izquierda lo necesita a mano.</>,
            <>Formato con <code>lib/format.ts</code>: <code>fmt.eur</code> (1.234 €), <code>fmt.pct</code> (32 %), <code>fmt.date</code> (24 sep), <code>fmt.compact</code> (1,2 M). Nunca <code>toFixed</code> ni concatenar el símbolo a mano.</>,
            <>Los deltas llevan signo, <code>text-success</code> o <code>text-danger</code> y su icono de 12 px. Las cifras no se animan ni ruedan: cambian de golpe.</>,
          ]}
        />
      </DocSection>

      <DocSection id="si-no" title="Sí y no">
        <DoDont
          dos={[
            "Geist en todo; Geist Mono solo para código, tokens y códigos en columna.",
            "tabular-nums en toda cifra que se alinee con otra.",
            "Títulos y botones en frase normal: «Nuevo registro», «Pipeline por fase».",
            "tracking-tight únicamente en el título de página y en la cifra de KPI.",
            "Semibold como peso máximo, también en cifras y títulos.",
          ]}
          donts={[
            "Texto en mayúsculas en cuerpo, botones o títulos. uppercase solo en etiquetas de cuatro palabras o menos.",
            "letter-spacing más apretado que -0.025em: nada de tracking-tighter ni tracking-[-0.04em].",
            "Serif, display o cualquier segunda familia para títulos o cifras.",
            "font-bold: el 700 no forma parte del sistema.",
            "Tamaños fuera de la escala, como text-[15.5px] o text-lg en un título de bloque.",
          ]}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/fundamentos/color", label: "Color", text: "Texto principal, secundario y los cinco tonos de estado." },
            { href: "/ds/fundamentos/espaciado", label: "Espaciado y forma", text: "Ritmo de 4 px, radios y sombras." },
            { href: "/ds/componentes/kpi", label: "Cifras (KPI)", text: "La tarjeta que lleva la cifra de 24 px." },
            { href: "/ds/patrones/copy", label: "Copy y formato", text: "Euros, porcentajes y fechas con lib/format." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
