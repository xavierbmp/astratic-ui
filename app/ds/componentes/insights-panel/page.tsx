import Link from "next/link"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { InsightsDemo } from "@/components/docs/examples/insights-demo"

export const metadata = { title: "Panel de información" }

export default function InsightsPanelPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Panel de información"
      lead="La columna derecha de 320 px, con la misma altura que el bloque de operación: bloques de apoyo apilados que el usuario puede ocultar y reordenar. Lo que elige se recuerda."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            En el <code>aside</code> de <code>WorkGrid</code>, en toda página de operación y en el dashboard (donde se
            titula «Hoy»). Sirve para leer, no para actuar: resumen en cifras, distribución por fase, próximos
            vencimientos, actividad reciente. Cada bloque es un <code>InsightBlock</code> con un título, un icono y una
            función que lo pinta.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Entre dos y cinco bloques.</strong> Los menos importantes se declaran con{" "}
              <code>defaultVisible: false</code> y el usuario los activa si le interesan.
            </>,
            <>
              <strong>El panel es un <code>Section</code></strong> con <code>h-full</code>: cabecera con el título y el
              botón de personalizar, cuerpo con scroll y un separador entre bloques. Hereda la altura del bloque de
              operación a través de <code>WorkGrid</code>.
            </>,
            <>
              <strong>Sin acciones sobre registros.</strong> Un bloque puede llevar un enlace «Ver todas» en{" "}
              <code>action</code>; nunca botones que cambien datos.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example
          title="Tres bloques en 320 × 440 px"
          description="Cifras con InsightStat, una lista con InsightList y barras por fase (oculto por defecto). Pulsa el ajuste de la cabecera para ocultar, mostrar o reordenar; recarga la página y verás que se conserva."
          code={`<InsightsPanel
  storageKey="registros"
  blocks={[
    {
      id: "resumen",
      title: "Resumen",
      icon: BanknoteIcon,
      render: () => (
        <div className="divide-y">
          <InsightStat label="Valor medio" value={fmt.eur(valorMedio)} />
          <InsightStat label="Ganados este mes" value={ganados.length} sub={fmt.eur(totalGanado)} />
        </div>
      ),
    },
    {
      id: "actividad",
      title: "Actividad",
      icon: ActivityIcon,
      render: () => (
        <InsightList
          items={actividad.map((a) => ({
            key: a.id,
            leading: <AvatarInitials name={a.who} size="sm" />,
            title: a.what,
            subtitle: a.target,
            trailing: <span className="text-muted-foreground">{a.when}</span>,
          }))}
        />
      ),
    },
    { id: "fases", title: "Por fase", icon: KanbanSquareIcon, defaultVisible: false, render: () => <BarrasPorFase /> },
  ]}
/>`}
        >
          <InsightsDemo />
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Prose>
          <p>
            Qué va en el panel y qué no (y cuándo un dato es un bloque del panel o una cifra de arriba) está en{" "}
            <Link href="/ds/patrones/paneles">Paneles personalizables</Link>. Aquí, cómo funciona el componente.
          </p>
          <p>
            <strong>Persistencia.</strong> Las preferencias se guardan en <code>localStorage</code> bajo la clave{" "}
            <code>insights:&lt;storageKey&gt;</code> como <code>{"{ order: string[]; hidden: string[] }"}</code>. Por eso{" "}
            <code>storageKey</code> tiene que ser único por página del portal («registros», «tareas», «dashboard»); dos
            páginas con la misma clave compartirían preferencias. Si añades un bloque nuevo, aparece al final del orden
            guardado; si quitas uno, su id se ignora. «Restablecer» vuelve al orden declarado y a los{" "}
            <code>defaultVisible</code>.
          </p>
          <p>
            <strong><code>useLocalStorage</code></strong> (<code>hooks/use-local-storage.ts</code>) es el hook que hay
            debajo, y sirve para cualquier preferencia de interfaz: la vista elegida en el <code>ViewSwitcher</code>, una
            sidebar secundaria plegada. Usa <code>useSyncExternalStore</code>: en el servidor devuelve el valor inicial,
            así que no hay desajuste de hidratación, y escucha el evento <code>storage</code> para que dos pestañas del
            mismo portal se mantengan sincronizadas.
          </p>
        </Prose>
        <CodeBlock
          title="useLocalStorage"
          code={`const [view, setView] = useLocalStorage<ViewKind>("view:registros", "table")

<ViewSwitcher views={["table", "list", "kanban"]} value={view} onChange={setView} />`}
        />
        <Rules
          items={[
            <>
              Guarda solo preferencias de interfaz, nunca datos del negocio ni nada que deba sobrevivir a un cambio de
              navegador. Lo que importa de verdad se guarda en el servidor.
            </>,
            <>
              Los valores se serializan con <code>JSON.stringify</code>: objetos y arrays sencillos. Ni fechas ni
              funciones.
            </>,
            <>
              Los bloques se pintan con <code>render()</code> en cada render del panel: si un bloque hace cálculos
              pesados, memoriza fuera y pásale el resultado.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "storageKey=\"registros\" en la página de registros y \"tareas\" en la de tareas.",
            "Bloques secundarios con defaultVisible: false.",
            "InsightStat para pares etiqueta · valor; InsightList para listas de 3 a 5 elementos.",
          ]}
          donts={[
            "El mismo storageKey en dos páginas.",
            "Un bloque con formularios o botones de acción.",
            "Más de cinco bloques o listas de más de cinco elementos.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <Prose>
          <p>
            <code>InsightsPanel</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="storageKey">storageKey</code>, <code key="storageKey-t">string</code>, "Sufijo de la clave insights:<storageKey> en localStorage. Único por página. Obligatoria."],
            [<code key="blocks">blocks</code>, <code key="blocks-t">InsightBlock[]</code>, "Los bloques, en el orden por defecto. Obligatoria."],
            [<code key="title">title</code>, <code key="title-t">string</code>, "Título de la cabecera. Por defecto «Información»."],
            [<code key="className">className</code>, <code key="className-t">string</code>, "Clases extra del Section. Ya lleva h-full."],
          ]}
        />
        <Prose>
          <p>
            <code>InsightBlock</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Campo", "Tipo", "Descripción"]}
          rows={[
            [<code key="b-id">id</code>, <code key="b-id-t">string</code>, "Identificador estable; es lo que se guarda en las preferencias. No lo renombres sin asumir que se pierde el orden guardado."],
            [<code key="b-title">title</code>, <code key="b-title-t">string</code>, "Título del bloque (13 px semibold) y etiqueta en el menú de personalizar."],
            [<code key="b-icon">icon</code>, <code key="b-icon-t">LucideIcon</code>, "Icono de 14 px delante del título. Opcional."],
            [<code key="b-defaultVisible">defaultVisible</code>, <code key="b-defaultVisible-t">boolean</code>, "Por defecto true. En false el bloque empieza oculto hasta que el usuario lo activa."],
            [<code key="b-action">action</code>, <code key="b-action-t">ReactNode</code>, "Enlace o texto a la derecha del título («Ver todas»). Opcional."],
            [<code key="b-render">render</code>, <code key="b-render-t">{"() => ReactNode"}</code>, "Contenido del bloque. Se llama en cada render del panel."],
          ]}
        />
        <Prose>
          <p>
            <code>InsightList</code> recibe <code>items</code>; cada elemento:
          </p>
        </Prose>
        <SpecTable
          columns={["Campo", "Tipo", "Descripción"]}
          rows={[
            [<code key="l-key">key</code>, <code key="l-key-t">string</code>, "Clave única de la fila."],
            [<code key="l-leading">leading</code>, <code key="l-leading-t">ReactNode</code>, "AvatarInitials o icono a la izquierda. Opcional."],
            [<code key="l-title">title</code>, <code key="l-title-t">ReactNode</code>, "Texto principal en 13 px medium, truncado."],
            [<code key="l-subtitle">subtitle</code>, <code key="l-subtitle-t">ReactNode</code>, "Segunda línea en text-xs gris. Opcional."],
            [<code key="l-trailing">trailing</code>, <code key="l-trailing-t">ReactNode</code>, "Fecha, cifra o badge a la derecha, en text-xs con tabular-nums. Opcional."],
          ]}
        />
        <Prose>
          <p>
            <code>InsightStat</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="s-label">label</code>, <code key="s-label-t">string</code>, "Etiqueta a la izquierda en text-xs gris."],
            [<code key="s-value">value</code>, <code key="s-value-t">ReactNode</code>, "Valor a la derecha en 14 px semibold con tabular-nums."],
            [<code key="s-sub">sub</code>, <code key="s-sub-t">ReactNode</code>, "Texto pequeño detrás del valor (un total, una unidad). Opcional."],
          ]}
        />
        <Prose>
          <p>
            <code>useLocalStorage</code>:
          </p>
        </Prose>
        <SpecTable
          columns={["Firma", "Devuelve", "Descripción"]}
          rows={[
            [<code key="h-sig">{"useLocalStorage<T>(key: string, initial: T)"}</code>, <code key="h-ret">{"readonly [T, (next: T | ((prev: T) => T)) => void]"}</code>, "Valor actual y setter, como useState. El setter admite función y notifica a todos los componentes que usan la misma clave."],
          ]}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/insights-panel.json" />
        <Prose>
          <p>
            Trae <code>insights-panel.tsx</code>, <code>section.tsx</code> y <code>hooks/use-local-storage.ts</code>, más{" "}
            <code>popover</code>, <code>checkbox</code> y <code>button</code>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/paneles", label: "Paneles personalizables", text: "Qué va en el panel y qué no." },
            { href: "/ds/componentes/section", label: "Sección", text: "WorkGrid y el aside de 320 px." },
            { href: "/ds/componentes/kpi", label: "Cifras (KPI)", text: "Cuando el dato merece ir arriba." },
            { href: "/ds/componentes/avatars", label: "Avatares", text: "El leading de las listas." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
