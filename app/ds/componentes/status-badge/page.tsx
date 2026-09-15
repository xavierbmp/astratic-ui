import Link from "next/link"
import { TagIcon } from "lucide-react"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { StatusBadge } from "@/components/app/status-badge"
import { statusMeaning, type StatusTone } from "@/lib/status"
import { recordStatus } from "@/lib/demo-data"

export const metadata = { title: "Badges de estado" }

const tones: StatusTone[] = ["success", "info", "warning", "danger", "neutral"]
const toneLabel: Record<StatusTone, string> = {
  success: "Activo",
  info: "En curso",
  warning: "Pendiente",
  danger: "Vencido",
  neutral: "Borrador",
}
const toneExamples: Record<StatusTone, string> = {
  success: "Activo · Cobrado · Hecho · Firmado",
  info: "En curso · Enviado · Cerrado · Negociando",
  warning: "Pendiente · En pausa · Propuesta enviada",
  danger: "Vencido · Error · Atrasado · Descartado",
  neutral: "Borrador · Nuevo · Sin asignar · Etiquetas",
}

const example = `<StatusBadge tone="success">Activo</StatusBadge>
<StatusBadge tone="warning" dot>Pendiente</StatusBadge>
<StatusBadge tone="neutral"><TagIcon /> Etiqueta 1</StatusBadge>`

const mapping = `import type { StatusTone } from "@/lib/status"

export type RecordStatus = "activo" | "pendiente" | "vencido" | "borrador" | "cerrado"

export const recordStatus: Record<RecordStatus, { label: string; tone: StatusTone }> = {
  activo: { label: "Activo", tone: "success" },
  pendiente: { label: "Pendiente", tone: "warning" },
  vencido: { label: "Vencido", tone: "danger" },
  borrador: { label: "Borrador", tone: "neutral" },
  cerrado: { label: "Cerrado", tone: "info" },
}`

const usage = `{
  id: "status",
  header: "Estado",
  cell: (r) => <StatusBadge tone={recordStatus[r.status].tone} dot>{recordStatus[r.status].label}</StatusBadge>,
}

<FilterMenu
  label="Estado"
  options={Object.entries(recordStatus).map(([value, s]) => ({ value, label: s.label }))}
  value={statusFilter}
  onChange={setStatusFilter}
/>`

function PropsTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-mono text-[13px] font-semibold">{children}</h3>
}

export default function StatusBadgePage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Badges de estado"
      lead="Cinco tonos con significado fijo. Un badge dice en qué estado está algo; el color lo elige el sistema, no la pantalla."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Para el estado de un registro (activo, pendiente, vencido), para la fase dentro de un flujo (nuevo, en
            contacto, ganado) y para etiquetas cortas. En una tabla ocupa su propia columna «Estado»; en una tarjeta va
            arriba a la derecha; en el sheet, junto al título. El tono sale de un mapa del dominio a{" "}
            <code>StatusTone</code>, nunca de una decisión puntual en el JSX.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              Los cinco tonos y su significado están en <code>lib/status.ts</code> y en{" "}
              <Link href="/ds/fundamentos/color#estado" className="text-brand underline-offset-2 hover:underline">
                Color
              </Link>
              . Si un estado no encaja en ninguno, es <code>neutral</code>.
            </>,
            <>
              <code>StatusBadge</code> es <code>Badge</code> de shadcn con <code>variant=&quot;secondary&quot;</code> y
              las clases del tono. Para estados no se usa <code>Badge</code> directamente.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example title="Los cinco tonos" description="Sin punto, con punto y con icono. El punto refuerza el estado cuando hay otros badges en la misma fila." code={example}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <StatusBadge key={t} tone={t}>
                  {toneLabel[t]}
                </StatusBadge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {tones.map((t) => (
                <StatusBadge key={t} tone={t} dot>
                  {toneLabel[t]}
                </StatusBadge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {tones.map((t, i) => (
                <StatusBadge key={t} tone={t}>
                  <TagIcon /> Etiqueta {i + 1}
                </StatusBadge>
              ))}
            </div>
          </div>
        </Example>
        <SpecTable
          columns={["Tono", "Significa", "Ejemplos"]}
          rows={tones.map((t) => [
            <StatusBadge key={t} tone={t} dot>
              {t}
            </StatusBadge>,
            statusMeaning[t],
            toneExamples[t],
          ])}
        />
        <Example
          title="Del estado del dominio al tono"
          description="Un mapa en lib/ del portal con label y tone. Tabla, kanban, sheet y filtros leen del mismo objeto."
          code={mapping}
          lang="ts"
        >
          <div className="flex flex-wrap gap-2">
            {Object.entries(recordStatus).map(([key, s]) => (
              <StatusBadge key={key} tone={s.tone} dot>
                {s.label}
              </StatusBadge>
            ))}
          </div>
        </Example>
        <CodeBlock code={usage} title="Uso en la columna de la tabla y en el filtro" />
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              Nunca badges con colores propios: ni <code>className=&quot;bg-green-100&quot;</code> ni{" "}
              <code>Badge variant=&quot;destructive&quot;</code> para un estado. Solo <code>tone</code>.
            </>,
            <>
              Un badge es un estado o una etiqueta corta: dos palabras como máximo («Propuesta enviada»). Lo que
              necesita una frase es texto de apoyo, no badge.
            </>,
            <>
              En tablas, una columna «Estado» con el badge. Nunca texto coloreado suelto ni la fila entera teñida.
            </>,
            <>
              <code>dot</code> para el estado propiamente dicho cuando en la misma fila hay otros badges (fase,
              etiquetas): así se distingue de un vistazo. Las etiquetas van en <code>neutral</code>, sin punto y con
              icono opcional.
            </>,
            <>
              El mapa de estados vive en <code>lib/</code> del portal (<code>recordStatus</code>,{" "}
              <code>taskStatus</code>) con <code>label</code> y <code>tone</code>. Tabla, kanban, sheet y filtros leen
              del mismo mapa; ninguno redefine el color.
            </>,
            <>
              El mismo tono significa lo mismo en todo el portal: <code>danger</code> es vencido o error, no
              «importante». Un tono por estado, sin excepciones por pantalla.
            </>,
            <>
              Un badge no se pulsa. Para cambiar el estado se usa el <code>Select</code> pequeño del sheet o el
              arrastre en el kanban.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "tone={recordStatus[r.status].tone}",
            "Columna «Estado» con badge en la tabla",
            "neutral para lo que no encaja en los otros cuatro",
            "Etiquetas en neutral con icono",
          ]}
          donts={[
            "bg-emerald-100 text-emerald-700",
            "Badge de tres o cuatro palabras",
            "Fila entera en rojo para lo vencido",
            "danger para «importante» o «urgente» sin que haya error ni retraso",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <div className="flex flex-col gap-2">
          <PropsTitle>StatusBadge</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["tone", <code key="t">StatusTone · &quot;neutral&quot;</code>, "success · info · warning · danger · neutral."],
              ["dot", <code key="t">boolean · false</code>, "Punto del tono delante del texto."],
              ["children", <code key="t">ReactNode</code>, "Texto corto, con un icono lucide delante si hace falta."],
              ["className", <code key="t">string</code>, "Clases extra (flex-none, w-16 justify-center). Acepta también las props de Badge."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>lib/status.ts</PropsTitle>
          <SpecTable
            columns={["Export", "Tipo", "Uso"]}
            rows={[
              ["StatusTone", <code key="t">&quot;success&quot; | &quot;info&quot; | &quot;warning&quot; | &quot;danger&quot; | &quot;neutral&quot;</code>, "El tipo de los cinco tonos. Es lo que tipan los mapas de estado del dominio."],
              ["statusToneClass", <code key="t">Record&lt;StatusTone, string&gt;</code>, "Fondo suave y texto del tono. Para pills propias fuera del badge."],
              ["statusDotClass", <code key="t">Record&lt;StatusTone, string&gt;</code>, "Solo el fondo del tono: puntos, barras de progreso, cabeceras de columna del kanban."],
              ["statusMeaning", <code key="t">Record&lt;StatusTone, string&gt;</code>, "Texto con el significado de cada tono, para documentación y leyendas."],
            ]}
          />
        </div>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/status-badge.json" />
        <Prose>
          <p>
            Incluye <code>lib/status.ts</code> y añade <code>badge</code> de shadcn. Los tokens de color de estado
            vienen con el tema (<code>theme.json</code>), que se instala antes.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/fundamentos/color", label: "Color", text: "Los cinco colores de estado y sus tokens." },
            { href: "/ds/componentes/data-table", label: "Tabla de datos", text: "La columna «Estado»." },
            { href: "/ds/componentes/kanban", label: "Kanban", text: "Columnas por fase con el tono en la cabecera." },
            { href: "/ds/patrones/copy", label: "Copy y formato", text: "Cómo se nombran los estados." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
