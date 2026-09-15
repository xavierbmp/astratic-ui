import { DocPage, DocSection, DoDont, Example, NextLinks, Rules, SpecTable, Swatch } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { StatusBadge } from "@/components/app/status-badge"
import { Button } from "@/components/ui/button"
import { statusMeaning, type StatusTone } from "@/lib/status"

const tones: StatusTone[] = ["success", "info", "warning", "danger", "neutral"]
const toneLabel: Record<StatusTone, string> = { success: "Cobrado", info: "En curso", warning: "Pendiente", danger: "Atrasado", neutral: "Borrador" }

export const metadata = { title: "Color" }

export default function ColorPage() {
  return (
    <DocPage
      eyebrow="Fundamentos"
      title="Color"
      lead="Una base neutra, un solo acento y cinco colores de estado que significan siempre lo mismo. Todo en OKLCH y definido dos veces: claro y oscuro."
    >
      <DocSection id="superficies" title="Superficies y texto" lead="Los tokens de shadcn/ui con la base neutral. El fondo de la app es blanco; las tarjetas también, separadas por borde y sombra mínima, no por color.">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Swatch name="Fondo" token="--background" note="Página y tarjetas" />
          <Swatch name="Texto" token="--foreground" note="Texto principal" />
          <Swatch name="Texto secundario" token="--muted-foreground" note="Etiquetas, ayudas, migas" />
          <Swatch name="Muted" token="--muted" note="Cabecera de tabla, hover, fondos suaves" />
          <Swatch name="Borde" token="--border" note="Tarjetas, tablas, separadores" />
          <Swatch name="Sidebar" token="--sidebar" note="Fondo de la navegación" />
          <Swatch name="Primario" token="--primary" note="Botón principal (negro)" />
          <Swatch name="Secundario" token="--secondary" note="Pills de contador, badge neutro" />
          <Swatch name="Anillo de foco" token="--ring" note="focus-visible" />
        </div>
      </DocSection>

      <DocSection id="acento" title="El acento" lead="Índigo. Un solo color de marca y se usa poco: es lo que hace que se note.">
        <div className="grid gap-2 sm:grid-cols-3">
          <Swatch name="Brand" token="--brand" note="Enlaces, ítem activo, foco, gráfico principal" />
          <Swatch name="Brand soft" token="--brand-soft" note="Fila seleccionada, selección de texto, columna kanban al soltar" />
          <Swatch name="Brand foreground" token="--brand-foreground" note="Texto sobre brand" />
        </div>
        <Rules
          items={[
            <>El acento <strong>no</strong> se usa en botones. El botón principal es negro (<code>primary</code>); el acento marca lo activo, lo enlazado y lo enfocado.</>,
            <>Para un cliente con color de marca propio se cambia <code>--brand</code> (y <code>--brand-soft</code>) en <code>globals.css</code>. Nada más. Si el color del cliente es muy claro o muy saturado, se ajusta la luminosidad hasta cumplir 4,5:1 sobre blanco.</>,
            <>Los gráficos usan <code>--chart-1</code> (brand) para la serie principal y grises para el resto.</>,
          ]}
        />
      </DocSection>

      <DocSection id="estado" title="Los cinco colores de estado" lead="Fondo suave y texto del mismo tono. El mismo color significa lo mismo en todo el portal: no se eligen por gusto, se eligen por significado.">
        <Example>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <StatusBadge key={t} tone={t} dot>{toneLabel[t]}</StatusBadge>
            ))}
          </div>
        </Example>
        <SpecTable
          columns={["Tono", "Significa", "Tokens"]}
          rows={tones.map((t) => [
            <StatusBadge key={t} tone={t}>{t}</StatusBadge>,
            statusMeaning[t],
            <code key={`${t}-c`}>--{t === "neutral" ? "secondary" : t} · --{t === "neutral" ? "secondary-foreground" : `${t}-soft`}</code>,
          ])}
        />
        <Rules
          items={[
            <>Un estado que no encaja en ninguno de los cinco es neutro. No se inventan colores nuevos por entidad.</>,
            <>Los colores de estado se usan en badges, puntos, texto de alerta en cifras y barras de progreso. Nunca como fondo de una fila o una tarjeta entera.</>,
            <>Los deltas de las cifras usan <code>success</code> para positivo y <code>danger</code> para negativo (invertible cuando bajar es bueno, como en gastos).</>,
          ]}
        />
      </DocSection>

      <DocSection id="oscuro" title="Modo oscuro" lead="Los dos temas están definidos al completo. Cambia el token, no la clase.">
        <Example>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-background p-4 text-foreground">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Claro</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Principal</Button>
                <Button size="sm" variant="outline">Outline</Button>
                <StatusBadge tone="success">Activo</StatusBadge>
                <StatusBadge tone="danger">Vencido</StatusBadge>
              </div>
            </div>
            <div className="dark rounded-lg border bg-background p-4 text-foreground">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Oscuro</p>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm">Principal</Button>
                <Button size="sm" variant="outline">Outline</Button>
                <StatusBadge tone="success">Activo</StatusBadge>
                <StatusBadge tone="danger">Vencido</StatusBadge>
              </div>
            </div>
          </div>
        </Example>
        <Rules
          items={[
            <>En oscuro los colores de estado suben de luminosidad (tono 400 de Tailwind) y el fondo suave es el mismo color al 14 % de opacidad.</>,
            <>El botón principal invierte: casi blanco sobre fondo oscuro. Sigue siendo el único botón sin color.</>,
            <>Las tarjetas son un paso más claras que el fondo (<code>--card</code>) para que el borde al 10 % no sea la única separación.</>,
            <>Escribe siempre <code>bg-card</code>, <code>text-muted-foreground</code>, <code>border</code>. Nunca <code>bg-white</code>, <code>text-gray-500</code>, <code>border-gray-200</code>: esos no cambian con el tema.</>,
          ]}
        />
      </DocSection>

      <DocSection id="uso" title="En código">
        <CodeBlock
          code={`// Superficies y texto: tokens semánticos de Tailwind
<div className="rounded-lg border bg-card p-4 text-card-foreground shadow-xs">
  <p className="text-sm text-muted-foreground">Etiqueta</p>
</div>

// Estado: siempre a través de StatusBadge o de lib/status
<StatusBadge tone="warning" dot>Pendiente</StatusBadge>
<span className={statusToneClass.success}>…</span>

// Acento: solo para lo activo y lo enlazado
<a className="text-brand hover:underline">Ver registros</a>
<tr data-state="selected" className="bg-brand-soft/60" />`}
        />
        <DoDont
          dos={["bg-card, text-foreground, border, bg-muted/40", "StatusBadge tone=\"danger\" para lo vencido", "text-brand en enlaces y el ítem activo de la sidebar"]}
          donts={["bg-white, text-black, border-gray-200", "Colores de Tailwind sueltos: bg-green-100, text-red-600", "Botones de color: bg-brand, bg-blue-600"]}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/status-badge", label: "Badges de estado", text: "El componente y sus props." },
            { href: "/ds/fundamentos/tipografia", label: "Tipografía", text: "Geist, escala y cifras tabulares." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
