import Link from "next/link"
import { DocPage, DocSection, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

function Zone({ n, label, className }: { n: number; label: string; className?: string }) {
  return (
    <div className={`relative flex items-start rounded-md border border-dashed border-foreground/30 bg-muted/40 p-2 text-[11px] text-muted-foreground ${className ?? ""}`}>
      <span className="mr-1.5 grid size-4 flex-none place-items-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground">{n}</span>
      <span className="leading-tight">{label}</span>
    </div>
  )
}

export const metadata = { title: "Anatomía de página" }

export default function AnatomiaPage() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Anatomía de página"
      lead="Todas las páginas de operación comparten el mismo esqueleto. Cambia el contenido, no la estructura."
    >
      <DocSection id="esquema" title="Las zonas">
        <Example padded={false}>
          <div className="flex h-[420px] bg-background text-xs">
            <Zone n={1} label="Sidebar 256 px · grupos y páginas con contadores" className="w-40 flex-none rounded-none border-y-0 border-l-0" />
            <div className="flex min-w-0 flex-1 flex-col">
              <Zone n={2} label="Cabecera 48 px · migas · buscador ⌘K · campana · tema" className="h-10 flex-none rounded-none border-x-0 border-t-0" />
              <div className="flex flex-1 flex-col gap-2 p-3">
                <Zone n={3} label="Título 27 px + descripción · a la derecha, cifras · debajo, pestañas de la subpágina" className="h-14" />
                <Zone n={4} label="Pestañas de vistas, como las de Chrome · a la derecha, botones generales de la página" className="h-8" />
                <div className="flex flex-1 flex-col gap-2">
                  <Zone n={5} label="Cabecera de la base · icono y nombre de la vista · filtro, agrupar, ordenar… · botones principales · ajustes" className="h-9" />
                  <Zone n={6} label="Tabla, kanban, galería o calendario · primera celda, la de inicio · totales" className="flex-1" />
                </div>
              </div>
            </div>
          </div>
        </Example>
        <SpecTable
          columns={["Zona", "Medidas", "Componente"]}
          rows={[
            ["1 · Sidebar", "256 px, colapsa a 48 px. Módulos desplegables con sus subpáginas.", <code key="a">AppShell · ModuloMenu</code>],
            ["2 · Cabecera", "48 px, borde inferior. Padding 16 px.", <code key="b">AppShell</code>],
            ["3 · Cabecera de página", "Padding 26 px arriba, 34 px a los lados. Título 27/32 semibold, tracking-tight (-0.025em). A la derecha, las acciones; debajo, las pestañas de subpágina (44 px, subrayado de 2 px en la activa).", <code key="c">PageHeader · PageTabs</code>],
            ["4 · Pestañas de vistas", "36 px, encima del bloque y unidas a él. Desde la izquierda; pasadas diez se difuminan. A la derecha, los botones generales de la página.", <code key="c">PestanasVistas</code>],
            ["5 · Cabecera de la base", "48 px, dentro del bloque. Izquierda: icono y nombre de la vista. Centro: lo que cambia lo que se ve. Derecha: botones principales y, al final, ajustes.", <code key="d">BarraBase</code>],
            ["6 · Vista", "Ocupa el alto restante (mín. 420 px) y hace su propio scroll. Sin borde, radio 16 px y sombra de superficie.", <code key="e">BaseDatos</code>],
          ]}
        />
      </DocSection>

      <DocSection id="arquetipos" title="Cuatro arquetipos" lead="Todas las páginas de un portal son uno de estos cuatro. Si una no encaja, es que son dos páginas.">
        <SpecTable
          columns={["Arquetipo", "Qué tiene", "Ejemplo en la demo"]}
          rows={[
            ["Dashboard", "Cifras del área y un grid de secciones de resumen (gráfico, ranking, lista de atención) + panel «Hoy». Es la única página con varios bloques.", "/demo"],
            ["Operación", "Una base de datos con sus vistas y, si hacen falta, cifras en la cabecera. La página tipo; el 80 % de un portal.", "/demo/registros, /demo/tareas, /demo/equipo"],
            ["Página de registro", "Para registros grandes (una campaña, un evento): cabecera con datos clave, pestañas y dentro de cada pestaña un bloque de operación. Sustituye al sheet cuando el registro tiene su propia operación.", "Pendiente en la demo"],
          ]}
        />
        <Prose>
          <p>
            Un módulo con <strong>subpáginas</strong> no es un quinto arquetipo: cada subpágina es una de estas páginas
            en la sidebar, y sus partes son las pestañas de la cabecera (zona 3). Ver{" "}
            <Link href="/ds/patrones/navegacion">Navegación y subpáginas</Link> y, en la demo,{" "}
            <Link href="/demo/facturacion">Facturación</Link>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="codigo" title="Esqueleto en código">
        <CodeBlock
          title="app/(portal)/registros/page.tsx"
          code={`<PageBody>
  <PageHeader title="Registros" description="…" actions={<Button variant="outline">Exportar</Button>} />

  <KpiRow>
    <KpiCard icon={BanknoteIcon} label="Pipeline" value="799.342 €" delta={{ value: 8.4, label: "vs mes anterior" }} />
    …
  </KpiRow>

  <WorkGrid>
    <BaseDatos clave="registros" base={base} campos={campos} filas={registros} … ficha={ficha} onNuevo={…}>
      {(visibles, ficha) => <RegistroSheet lista={visibles} ficha={ficha} />}
    </BaseDatos>
  </WorkGrid>

  <DetailSheet open={!!open} onOpenChange={…}>…</DetailSheet>
</PageBody>`}
        />
      </DocSection>

      <DocSection id="responsive" title="Comportamiento por ancho">
        <Rules
          items={[
            <><strong>≥ 1280 px (xl):</strong> la base a todo el ancho. La página mide lo que la ventana y la base hace su propio scroll; en su barra, los botones apagados se quedan en icono si no cabe todo.</>,
            <><strong>1024–1279 px:</strong> en la cabecera de la base, los botones se quedan en icono. La tabla se desplaza en horizontal con su celda de inicio fija.</>,
            <><strong>768–1023 px:</strong> la sidebar sigue visible y se pliega a iconos con el botón de la cabecera o con ⌘B.</>,
            <><strong>&lt; 768 px:</strong> sidebar en cajón, cifras en dos columnas, la base pasa a una lista de tarjetas con los mismos filtros, sheet a pantalla completa.</>,
          ]}
        />
        <Prose>
          <p>
            Los portales se usan sobre todo en escritorio; el móvil debe funcionar, no brillar. Prioriza que la tabla
            oculte columnas antes que hacer scroll horizontal.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "Qué va en cada zona y por qué." },
            { href: "/ds/patrones/navegacion", label: "Navegación y subpáginas", text: "Pestañas de subpágina en la cabecera." },
            { href: "/demo/registros", label: "Ver en la demo", text: "Una página de operación completa." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
