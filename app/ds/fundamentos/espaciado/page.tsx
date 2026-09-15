import { cn } from "cn"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

const steps = [
  { px: 4, cls: "gap-1", use: "Base. Icono y texto en botones sm y en chips." },
  { px: 6, cls: "gap-1.5", use: "Icono y texto en botones default, etiqueta de KPI, acciones de una cabecera." },
  { px: 8, cls: "gap-2", use: "Controles de la toolbar, tarjetas dentro de una columna de kanban." },
  { px: 12, cls: "gap-3", use: "Entre cifras (KpiRow). Padding vertical de KpiCard y de la tarjeta de kanban." },
  { px: 16, cls: "gap-4 · px-4", use: "Entre bloques de página y entre bloque y panel. Padding lateral de tarjeta, sección y sheet." },
  { px: 26, cls: "pt-[26px]", use: "Padding superior de página, bajo la cabecera de 48 px." },
  { px: 34, cls: "px-[34px]", use: "Padding lateral de página." },
]

const radii = [
  { cls: "rounded-md", px: "8 px", use: "Ítems de menú, tooltip, avatares pequeños, skeleton" },
  { cls: "rounded-lg", px: "10 px", use: "Secciones, tarjetas, tablas, botones, inputs, menús" },
  { cls: "rounded-xl", px: "14 px", use: "KpiCard y columnas del kanban" },
  { cls: "rounded-full", px: "pill", use: "Badges, contadores, chips, BulkBar, puntos" },
]

export const metadata = { title: "Espaciado y forma" }

export default function EspaciadoPage() {
  return (
    <DocPage
      eyebrow="Fundamentos"
      title="Espaciado y forma"
      lead="Base de 4 px, un radio de 10 px del que sale todo lo demás y una sombra que casi no se ve. Las medidas están fijadas por componente: no se eligen al maquetar."
    >
      <DocSection id="espaciado" title="Espaciado" lead="La escala de 4 px de Tailwind, con dos medidas propias para el marco de la página. Todo lo demás son múltiplos de 4.">
        <Example>
          <div className="flex flex-col gap-3">
            {steps.map((s) => (
              <div key={s.px} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="h-4 flex-none rounded-sm bg-brand/70" style={{ width: s.px }} aria-hidden />
                <span className="w-12 flex-none font-medium tabular-nums">{s.px} px</span>
                <span className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">{s.cls}</span>
                <span className="text-muted-foreground">{s.use}</span>
              </div>
            ))}
          </div>
        </Example>
        <SpecTable
          columns={["Medida", "Valor", "Clase", "Dónde"]}
          rows={[
            ["Padding de página", "26 px arriba · 34 px a los lados", <code key="a">pt-[26px] px-[34px]</code>, "PageBody y DocPage. Compensa la cabecera de 48 px y la sidebar."],
            ["Gap entre bloques", "16 px", <code key="b">gap-4</code>, "PageBody (título, cifras, WorkGrid) y WorkGrid (toolbar, bloque y panel)."],
            ["Gap entre cifras", "12 px", <code key="c">gap-3</code>, "KpiRow."],
            ["Gap de la toolbar", "8 px", <code key="d">gap-2</code>, "Entre buscador, filtros, conmutador de vistas y acción principal."],
            ["Padding de tarjeta y sección", "16 px lateral", <code key="e">px-4</code>, "KpiCard (py-3), cabecera y pie de Section (py-2), cabecera del sheet (p-4)."],
            ["Fila de tabla", "40 px", <code key="f">py-2.5</code>, "DataTable con texto de 13,5 px. Cabecera de 36 px (h-9)."],
            ["Fila de tabla densa", "32 px", <code key="g">py-1.5</code>, "DataTable con dense. Para listados largos de consulta."],
            ["Toolbar y controles", "32 px", <code key="h">h-8</code>, "ToolbarSearch, FilterMenu, ViewSwitcher, Button default, Input. Button sm mide 28 px (h-7)."],
            ["Cabecera de la app", "48 px", <code key="i">h-12</code>, "AppShell: migas a la izquierda, buscador y acciones a la derecha."],
            ["Sidebar", "256 px", <code key="j">--sidebar-width</code>, "AppShell. Colapsa a 48 px."],
            ["Sheet de detalle", "440 px", <code key="k">width</code>, "DetailSheet. 400 px para fichas simples."],
            ["Panel de información", "320 px", <code key="l">WorkGrid aside</code>, "Empieza a la altura del bloque de operación y mide lo mismo."],
          ]}
        />
        <Rules
          items={[
            <>Los componentes del kit ya llevan sus medidas. En una página solo se escriben <code>gap-4</code> entre bloques, <code>gap-3</code> entre cifras y <code>gap-2</code> entre controles; el resto viene dado.</>,
            <>Dentro de un contenedor el padding baja un paso respecto al de fuera: página 34, sección 16, ítem de lista 8. Nunca al revés.</>,
            <>No hay márgenes sueltos entre hermanos: se usa <code>gap</code> en el padre. Los <code>mt-*</code> quedan para separar un texto de otro dentro del mismo bloque (título y descripción, cifra y delta).</>,
          ]}
        />
      </DocSection>

      <DocSection id="radios" title="Radios" lead="Todo sale de --radius: 0.625rem, es decir 10 px. Tailwind deriva el resto: sm 6, md 8, lg 10, xl 14. Cambiar ese token reescala el portal entero.">
        <Example>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {radii.map((r) => (
              <div key={r.cls} className="flex flex-col gap-2">
                <div className={cn("h-16 border bg-card shadow-xs", r.cls)} />
                <div className="grid leading-tight">
                  <span className="font-mono text-[12px]">{r.cls}</span>
                  <span className="text-xs text-muted-foreground">{r.px} · {r.use}</span>
                </div>
              </div>
            ))}
          </div>
        </Example>
        <SpecTable
          columns={["Radio", "Valor", "Clase", "Dónde"]}
          rows={[
            ["lg", "10 px", <code key="a">rounded-lg</code>, "Section, tarjetas de kanban, contenedor de menús y popovers, tabs, botones default, inputs, bloques de código. El radio por defecto de cualquier contenedor."],
            ["xl", "14 px", <code key="b">rounded-xl</code>, "KpiCard y columnas del kanban. Nada más: el resto de contenedores, por grandes que sean, siguen en lg."],
            ["md", "8 px", <code key="c">rounded-md</code>, "Elementos internos: ítems de menú y de la sidebar, tooltip, avatares xs y sm, skeleton. Los botones sm y xs también bajan a md."],
            ["sm", "6 px", <code key="d">rounded-sm</code>, "Piezas muy pequeñas dentro de otro control, como el resumen del filtro activo dentro de su botón."],
            ["full", "pill", <code key="e">rounded-full</code>, "BulkBar, contadores (SectionCount), chips de filtros activos, puntos de estado, contador de la barra, avatares circulares. Badge usa rounded-4xl, que a 20 px de alto es la misma pill."],
          ]}
        />
        <Rules
          items={[
            <>Un contenedor dentro de otro baja un paso: sección <code>lg</code>, ítem <code>md</code>. Por eso los ítems de menú son md dentro de un menú lg, y el avatar de una fila es md o lg según su tamaño.</>,
            <>No se escriben radios en píxeles ni se usan <code>rounded-2xl</code> o superiores en el kit; <code>AvatarInitials</code> es la excepción por proporción (lg 14 px, xl 18 px).</>,
            <>Las esquinas se recortan con <code>overflow-hidden</code> en Section para que la cabecera de tabla y los fondos internos respeten el radio.</>,
          ]}
        />
      </DocSection>

      <DocSection id="sombras" title="Sombras y bordes" lead="Dos sombras propias y un borde de 1 px. La sombra separa muy poco; el borde es lo que dibuja la forma, también en oscuro.">
        <Example>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <div className="rounded-lg border bg-card p-4 shadow-xs">
                <p className="text-sm font-semibold">Tarjeta</p>
                <p className="text-xs text-muted-foreground">border + shadow-xs</p>
              </div>
              <span className="text-xs text-muted-foreground">Section, KpiCard, tarjetas de kanban.</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex h-[70px] items-center">
                <div className="inline-flex items-center gap-1.5 rounded-full border bg-background/95 py-1.5 pr-3 pl-3 shadow-pop">
                  <span className="inline-grid size-6 place-items-center rounded-full bg-foreground text-xs font-semibold tabular-nums text-background">3</span>
                  <span className="text-sm">seleccionados</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Flotante: BulkBar, tarjeta arrastrada en el kanban.</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm font-semibold">Solo borde</p>
                <p className="text-xs text-muted-foreground">border</p>
              </div>
              <span className="text-xs text-muted-foreground">Inputs, filas, chips, ítems de lista.</span>
            </div>
          </div>
        </Example>
        <SpecTable
          columns={["Sombra", "Token", "Dónde"]}
          rows={[
            ["xs", <code key="a">shadow-xs · 0 1px 2px 0 / 4 %</code>, "Section, KpiCard y tarjetas de kanban. Siempre con border. Es la única sombra de un elemento que no se mueve."],
            ["pop", <code key="b">shadow-pop · 0 10px 30px / 12 % + 0 2px 6px / 6 %</code>, "Lo que flota por encima de la página y es del kit: BulkBar y DragOverlay del kanban."],
            ["shadcn", <code key="c">shadow-md · shadow-lg</code>, "Menús, popovers y select (md), sheet (lg). Vienen de serie en los componentes de shadcn y no se cambian."],
            ["ninguna", <code key="d">sin clase</code>, "Filas, celdas, chips, badges, inputs, ítems de lista y cualquier cosa dentro de una tarjeta. El borde separa; la sombra sobra."],
          ]}
        />
        <Rules
          items={[
            <>Nunca sombras grandes en tarjetas estáticas. Si algo lleva <code>shadow-pop</code> es porque flota; una tarjeta de kanban sube a <code>shadow-sm</code> al pasar el ratón y vuelve, y ahí se acaba.</>,
            <>El borde siempre acompaña a la sombra. En oscuro la sombra desaparece contra el fondo y el borde al 10 % de blanco es la única separación.</>,
            <>Bordes de 1 px con el token <code>border</code> (<code>--border</code>). Nunca 2 px, nunca <code>border-gray-200</code>, nunca bordes de color para indicar estado: para eso está el badge.</>,
            <>Separadores internos con <code>divide-y</code>, <code>border-t</code> o <code>border-b</code>, del mismo token. Nada de líneas con <code>bg-muted</code> de 1 px de alto.</>,
          ]}
        />
      </DocSection>

      <DocSection id="codigo" title="En código">
        <CodeBlock
          code={`// Contenedor estándar: radio lg, borde y sombra mínima
<section className="rounded-lg border bg-card shadow-xs">…</section>

// Solo KpiCard y las columnas del kanban suben a xl
<div className="rounded-xl border bg-card px-4 py-3 shadow-xs">…</div>

// Lo que flota lleva shadow-pop y sigue llevando borde
<div className="rounded-full border bg-background/95 shadow-pop backdrop-blur-sm">…</div>

// Ritmo de página: PageBody ya trae px-[34px] pt-[26px] gap-4
<PageBody>
  <PageHeader title="Registros" description="…" />
  <KpiRow>…</KpiRow>
  <WorkGrid toolbar={<Toolbar>…</Toolbar>} aside={<InsightsPanel storageKey="registros" blocks={…} />}>
    <Section>…</Section>
  </WorkGrid>
</PageBody>`}
        />
        <Prose>
          <p>
            <code>KpiRow</code> trae <code>gap-3</code>, <code>Toolbar</code> trae <code>gap-2</code> y controles de 32 px, y <code>WorkGrid</code>{" "}
            separa toolbar, bloque y panel con <code>gap-4</code>. Si al maquetar hace falta escribir un valor que no está en esta página, es
            que falta un componente, no una clase.
          </p>
        </Prose>
        <DoDont
          dos={[
            "rounded-lg border bg-card shadow-xs para cualquier contenedor nuevo.",
            "rounded-xl solo en KpiCard y columnas del kanban.",
            "gap-4 entre bloques, gap-3 entre cifras, gap-2 entre controles.",
            "shadow-pop solo en lo que flota: BulkBar y la tarjeta arrastrada.",
          ]}
          donts={[
            "rounded-2xl, rounded-3xl o radios en píxeles sueltos.",
            "shadow-lg o shadow-xl en una tarjeta que no se mueve.",
            "Sombra sin borde, o borde de 2 px para dar peso.",
            "Paddings a ojo: p-5, p-7, py-[13px].",
          ]}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/anatomia", label: "Anatomía de página", text: "Las siete zonas y sus medidas." },
            { href: "/ds/fundamentos/tipografia", label: "Tipografía", text: "La escala que cabe en estas medidas." },
            { href: "/ds/componentes/section", label: "Sección", text: "El contenedor lg con cabecera, cuerpo y pie." },
            { href: "/ds/componentes/kpi", label: "Cifras (KPI)", text: "La única tarjeta con radio xl." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
