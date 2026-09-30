import { AlarmClockIcon, BanknoteIcon, PercentIcon, ReceiptIcon } from "lucide-react"
import { fmt } from "@/lib/format"
import { KpiCard, KpiRow } from "@/components/app/kpi"
import { KpiSkeleton } from "@/components/app/states"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Cifras (KPI)" }

export default function KpiPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Cifras (KPI)"
      lead="La fila de tarjetas que va bajo el título: icono y etiqueta, la cifra grande y una sola línea de apoyo. Dicen de un vistazo cómo va lo que gestiona la página."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            En dashboards y páginas de operación, justo debajo de <code>PageHeader</code>. Cada tarjeta responde a una
            pregunta que el usuario se hace al entrar: cuánto hay abierto, cuánto se ha ganado, qué vence, quién está
            activo. No son gráficos ni tablas resumidas: son una cifra y, como mucho, una comparación.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>De 3 a 5 tarjetas por fila.</strong> <code>KpiRow</code> es un grid auto-fit con mínimo 180 px y gap
              12 px: con más de cinco las tarjetas se aprietan o saltan de línea, y ya no son un vistazo.
            </>,
            <>
              <strong>La cifra es el dato que más importa de la página</strong>, calculado sobre lo que el usuario está
              viendo. Si la página tiene filtros, las cifras reflejan lo filtrado.
            </>,
            <>
              <strong>Una sola línea de apoyo:</strong> o delta, o alerta. <code>hint</code> va junto a la cifra, en
              gris, para el contexto corto («24 registros», «en 4 fases»).
            </>,
            <>
              <strong>Formato con <code>lib/format.ts</code>:</strong> <code>fmt.eur</code> para euros sin decimales,{" "}
              <code>fmt.pct</code> para porcentajes con espacio, <code>fmt.num</code> para cantidades. Nunca cifras
              formateadas a mano.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example
          title="Cuatro tarjetas"
          description="Delta positivo, delta negativo con invert (bajar es bueno), hint junto a la cifra y alerta en rojo."
          code={`<KpiRow>
  <KpiCard icon={BanknoteIcon} label="Pipeline abierto" value={fmt.eur(799342)} delta={{ value: 8.4, label: "vs mes anterior" }} />
  <KpiCard icon={ReceiptIcon} label="Gasto del mes" value={fmt.eur(12480)} delta={{ value: -3.2, label: "vs mes anterior", invert: true }} />
  <KpiCard icon={PercentIcon} label="Tasa de éxito" value={fmt.pct(32)} hint="8 ganados" />
  <KpiCard icon={AlarmClockIcon} label="Vencidos" value={5} alert={\`\${fmt.eur(41200)} en riesgo\`} />
</KpiRow>`}
        >
          <KpiRow>
            <KpiCard icon={BanknoteIcon} label="Pipeline abierto" value={fmt.eur(799342)} delta={{ value: 8.4, label: "vs mes anterior" }} />
            <KpiCard icon={ReceiptIcon} label="Gasto del mes" value={fmt.eur(12480)} delta={{ value: -3.2, label: "vs mes anterior", invert: true }} />
            <KpiCard icon={PercentIcon} label="Tasa de éxito" value={fmt.pct(32)} hint="8 ganados" />
            <KpiCard icon={AlarmClockIcon} label="Vencidos" value={5} alert={`${fmt.eur(41200)} en riesgo`} />
          </KpiRow>
        </Example>
        <Example
          title="Cargando"
          description="KpiSkeleton, de components/app/states.tsx, mientras llegan los datos. Mismo grid y mismas medidas para que nada salte."
          code={`{loading ? <KpiSkeleton count={4} /> : <KpiRow>…</KpiRow>}`}
        >
          <KpiSkeleton count={4} />
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              <strong>El delta compara siempre con el periodo anterior</strong> y lo dice en <code>label</code>: «vs mes
              anterior», «vs agosto». Un delta sin etiqueta no se entiende.
            </>,
            <>
              Positivo en <code>success</code>, negativo en <code>danger</code>, cero en gris sin flecha. Con{" "}
              <code>invert: true</code> se da la vuelta al color cuando bajar es bueno: gastos, vencidos, tiempo de
              respuesta.
            </>,
            <>
              <code>alert</code> es texto corto en rojo para lo que necesita atención ya («3 vencidos», «2 para hoy»).
              Si hay alerta no hay delta.
            </>,
            <>
              La etiqueta es corta y en singular o plural según la cifra: «Ganados», «Tasa de éxito». Sin dos puntos, sin
              mayúsculas de título.
            </>,
            <>
              Las tarjetas no son clicables. Si una cifra tiene detrás una lista, el sitio para verla es el bloque de
              operación con un filtro aplicado.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "4 tarjetas: pipeline, ganados, vencen en 30 días, responsables.",
            "delta={{ value: 12, label: \"vs mes anterior\" }}",
            "value={fmt.eur(total)} y alert=\"3 vencidos\".",
          ]}
          donts={[
            "7 tarjetas o una fila por cada fase.",
            "Delta y alerta en la misma tarjeta.",
            "value=\"799.342€\" escrito a mano o con decimales.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <Prose>
          <p>
            <code>KpiRow</code> es un <code>div</code> con el grid; acepta cualquier prop de <code>div</code>.{" "}
            <code>KpiCard</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="icon">icon</code>, <code key="icon-t">LucideIcon</code>, "Icono de 14 px junto a la etiqueta. Opcional pero recomendado."],
            [<code key="label">label</code>, <code key="label-t">string</code>, "Etiqueta corta en 12,5 px gris. Obligatoria."],
            [<code key="value">value</code>, <code key="value-t">ReactNode</code>, "La cifra, en 24 px semibold con tabular-nums. Formateada con fmt. Obligatoria."],
            [<code key="hint">hint</code>, <code key="hint-t">ReactNode</code>, "Contexto corto a la derecha de la cifra, en text-xs gris. Opcional."],
            [<code key="delta">delta</code>, <code key="delta-t">Delta</code>, "Variación respecto al periodo anterior. Opcional; excluyente con alert."],
            [<code key="alert">alert</code>, <code key="alert-t">ReactNode</code>, "Texto de alerta en rojo semibold. Opcional; excluyente con delta."],
            [<code key="onClick">onClick</code>, <code key="onClick-t">{"() => void"}</code>, "Convierte la cifra en un atajo que filtra la lista de debajo (los tramos de un recorrido: «Sin normalizar», «Listas para campaña»). Se puede pulsar con ratón y con teclado. Opcional."],
            [<code key="active">active</code>, <code key="active-t">boolean</code>, "Con onClick: la cifra cuyo filtro está puesto, marcada en bg-brand-soft con borde brand. Pulsarla otra vez lo quita."],
            [<code key="className">className</code>, <code key="className-t">string</code>, "Clases extra. La tarjeta es rounded-xl border bg-card px-4 py-3 shadow-xs."],
          ]}
        />
        <Prose>
          <p>
            <code>Delta</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Campo", "Tipo", "Descripción"]}
          rows={[
            [<code key="d-value">value</code>, <code key="d-value-t">number</code>, "Puntos porcentuales con signo, la misma convención que fmt.pct y fmt.delta: 8.4 se pinta «+8,4 %», -3.2 se pinta «-3,2 %». Un decimal como máximo."],
            [<code key="d-label">label</code>, <code key="d-label-t">string</code>, "Con qué se compara: «vs mes anterior». Opcional en el tipo, obligatoria por convención."],
            [<code key="d-invert">invert</code>, <code key="d-invert-t">boolean</code>, "Por defecto false. En true, bajar es bueno: el negativo se pinta en verde y el positivo en rojo."],
          ]}
        />
        <Prose>
          <p>
            <code>KpiSkeleton</code>, en <code>components/app/states.tsx</code>: <code>count</code> (por defecto 4) tarjetas
            grises con el mismo grid.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/kpi.json" />
        <Prose>
          <p>
            Los skeletons vienen con <code>states</code>:{" "}
            <code>npx shadcn@latest add https://ui.astraticnetwork.com/r/states.json</code>. Y <code>fmt</code> con el
            tema: <code>theme.json</code>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/copy", label: "Copy y formato", text: "Euros, porcentajes y fechas." },
            { href: "/ds/fundamentos/color", label: "Color", text: "Por qué el delta es verde o rojo." },
            { href: "/ds/componentes/states", label: "Estados", text: "Skeletons y estados vacíos." },
            { href: "/ds/componentes/charts", label: "Gráficos", text: "Cuando una cifra no basta." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
