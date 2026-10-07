import Link from "next/link"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { LayoutDashboardIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Shell de aplicación" }

function demoSource(file: string) {
  return readFile(path.join(process.cwd(), "app", "demo", file), "utf8")
}

export default async function ShellPage() {
  const [navSource, shellSource, layoutSource] = await Promise.all([
    demoSource("nav.ts"),
    demoSource("shell.tsx"),
    demoSource("layout.tsx"),
  ])

  return (
    <DocPage
      eyebrow="Componentes"
      title="Shell de aplicación"
      lead="El marco de todo el portal: sidebar con la navegación, cabecera con migas y buscador, y el hueco donde se pintan las páginas. Se monta una vez en el layout raíz y no se toca más."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Siempre y solo una vez: <code>AppShell</code> envuelve todas las páginas del portal desde el layout del grupo
            de rutas autenticado. Recibe la marca, el usuario y la navegación en grupos, y se encarga del resto: ítem
            activo, migas, contadores, buscador ⌘K, reportar un problema, campana y tema.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Sidebar de 256 px</strong> que colapsa a iconos (48 px) con el botón de la cabecera. Los grupos
              llevan etiqueta opcional; el primer grupo suele ir sin ella para las páginas de entrada.
            </>,
            <>
              <strong>Ítem activo por ruta más larga.</strong> Se marca el ítem cuyo <code>href</code> coincide con la
              ruta actual o es prefijo de ella; si varios coinciden, gana el más largo. Así <code>/demo/registros/12</code>{" "}
              activa «Registros» y no «Dashboard».
            </>,
            <>
              <strong>Contador ámbar</strong> (<code>badge</code>) junto al ítem para lo que está pendiente de esa página:
              tareas de hoy, registros sin asignar. Se pinta solo cuando es mayor que cero.
            </>,
            <>
              <strong>Cabecera de 48 px</strong> con <code>SidebarTrigger</code>, migas automáticas «Grupo › Página», y a la
              derecha el buscador, el bicho de reportar un problema (prop <code>report</code>), la campana, el{" "}
              <code>ThemeToggle</code> y lo que pases en <code>headerEnd</code>.
            </>,
            <>
              <strong>Migas extra</strong> desde cualquier página con <code>useBreadcrumb([{"{ label, href }"}])</code>: el
              shell las añade detrás de la página y las quita al desmontar.
            </>,
            <>
              <strong>Reportar un problema</strong>: <code>ReportButton</code> en la prop <code>report</code>, entre el
              buscador y la campana. Se abre también con ⇧⌘X, con una ficha abierta. Ver{" "}
              <Link href="/ds/componentes/report-button" className="underline underline-offset-4">
                Reportar un problema
              </Link>
              .
            </>,
            <>
              <strong>Buscador ⌘K</strong>: un <code>CommandDialog</code> con las páginas de la navegación agrupadas. Las
              páginas que indexen registros añaden sus propios grupos en el proyecto.
            </>,
          ]}
        />
      </DocSection>

      <DocSection
        id="ejemplo"
        title="Ejemplo"
        lead="El shell ocupa toda la pantalla, así que no se monta dentro de esta página. La demo lo usa con la navegación de abajo."
      >
        <Example title="La demo, con el shell completo" description="Sidebar con dos grupos y contadores, migas, buscador ⌘K y tema. Colapsa la sidebar con el botón de la cabecera o navega a un registro para ver las migas extra.">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Portal Demo · 5 páginas en 2 grupos · 2 contadores</p>
            <Button asChild>
              <Link href="/demo">
                <LayoutDashboardIcon /> Ver en la demo
              </Link>
            </Button>
          </div>
        </Example>
        <CodeBlock title="app/demo/nav.ts" code={navSource} lang="ts" />
        <CodeBlock title="app/demo/shell.tsx" code={shellSource} />
        <CodeBlock title="app/demo/layout.tsx" code={layoutSource} />
        <CodeBlock
          title="Migas extra desde una página de registro"
          code={`"use client"

import { useBreadcrumb } from "@/components/app/app-shell"

export function RegistroPage({ record }: { record: { id: string; name: string } }) {
  useBreadcrumb([{ label: record.name }])
  return <PageBody>…</PageBody>
}`}
        />
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Prose>
          <p>
            <strong>La navegación se define en un archivo <code>nav.ts</code></strong> con la marca, el usuario y los
            grupos. Cada ítem lleva su icono de lucide y, si aplica, un contador. Ese archivo es la única fuente de la
            sidebar, las migas y el buscador: no hay que repetir nombres de páginas en ningún otro sitio.
          </p>
          <p>
            <strong>El shell se monta desde un componente cliente</strong> (<code>shell.tsx</code>), no desde el layout.
            El layout es un componente servidor y no puede pasar componentes de icono como props a un componente
            cliente: solo viajan datos serializables. Por eso <code>shell.tsx</code> lleva <code>"use client"</code>,
            importa <code>nav.ts</code> y monta <code>AppShell</code>; el layout solo renderiza{" "}
            <code>{"<DemoShell>{children}</DemoShell>"}</code>.
          </p>
        </Prose>
        <SpecTable
          columns={["Zona", "Medidas", "Qué contiene"]}
          rows={[
            ["Sidebar", "256 px, colapsa a 48 px. Fondo sidebar, borde derecho.", "Marca con monograma, grupos con etiqueta, ítems con icono, contador ámbar y usuario abajo."],
            ["Cabecera", "48 px, borde inferior, padding horizontal 16 px.", "Botón de colapso, separador, migas; a la derecha buscador ⌘K (256 px), reportar un problema, campana, tema y headerEnd."],
            ["Contenido", "El resto. Columna flex con min-h-0.", "Las páginas, que empiezan por PageBody."],
            ["Buscador", "CommandDialog centrado.", "Un grupo por grupo de navegación; al elegir, navega con router.push."],
          ]}
        />
        <DoDont
          dos={[
            "Un nav.ts por portal con grupos por área: Operación, Administración.",
            "Contadores solo para lo pendiente y solo si la cifra cambia con el trabajo.",
            "Migas extra con useBreadcrumb en páginas de registro.",
            "headerEnd para un enlace o un botón outline pequeño; nada más.",
          ]}
          donts={[
            "Definir la nav en el layout servidor y pasarla al shell.",
            "Más de dos niveles de navegación: la sidebar no anida.",
            "Poner la acción principal de una página en la cabecera del shell.",
            "Cambiar los 256 / 48 px por portal: la medida es del sistema.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="brand">brand</code>, <code key="brand-t">Brand</code>, "Nombre, tagline opcional y monograma (una o dos letras) que se pinta en el cuadrado negro de la sidebar. Obligatoria."],
            [<code key="user">user</code>, <code key="user-t">CurrentUser</code>, "Nombre y rol del usuario conectado. Se muestra abajo con AvatarInitials. Obligatoria."],
            [<code key="nav">nav</code>, <code key="nav-t">NavGroup[]</code>, "Grupos de navegación. El primer ítem del primer grupo es el destino del logotipo. Obligatoria."],
            [<code key="children">children</code>, <code key="children-t">ReactNode</code>, "Las páginas. Se renderizan en una columna flex con min-h-0 para que PageBody y WorkGrid puedan ocupar la altura."],
            [<code key="report">report</code>, <code key="report-t">ReactNode</code>, "El ReportButton ya montado con sus acciones. Va entre el buscador y la campana. Opcional, pero todo portal lo lleva."],
            [<code key="headerEnd">headerEnd</code>, <code key="headerEnd-t">ReactNode</code>, "Contenido extra al final de la cabecera, después del tema. Opcional."],
          ]}
        />
        <Prose>
          <p>
            <code>NavGroup</code>, <code>NavItem</code>, <code>Brand</code> y <code>CurrentUser</code> están en{" "}
            <code>lib/nav.ts</code>.
          </p>
        </Prose>
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="g-label">NavGroup.label</code>, <code key="g-label-t">string</code>, "Etiqueta del grupo en la sidebar y primera miga. Opcional: sin ella el grupo no lleva cabecera ni aparece en las migas."],
            [<code key="g-items">NavGroup.items</code>, <code key="g-items-t">NavItem[]</code>, "Páginas del grupo."],
            [<code key="g-bottom">NavGroup.bottom</code>, <code key="g-bottom-t">boolean</code>, "El grupo va pegado al pie de la sidebar, separado del resto (Ajustes, por ejemplo). Opcional."],
            [<code key="id">NavItem.id</code>, <code key="id-t">string</code>, "Identificador único. Se usa para marcar el ítem activo."],
            [<code key="label">NavItem.label</code>, <code key="label-t">string</code>, "Texto del ítem, del tooltip cuando la sidebar está colapsada y de la miga."],
            [<code key="href">NavItem.href</code>, <code key="href-t">string</code>, "Ruta. El ítem se activa por coincidencia exacta o como prefijo seguido de «/»."],
            [<code key="icon">NavItem.icon</code>, <code key="icon-t">LucideIcon</code>, "Icono de lucide-react. Por esto la nav se importa en un componente cliente."],
            [<code key="badge">NavItem.badge</code>, <code key="badge-t">number</code>, "Contador de pendientes en ámbar. Opcional; oculto si es 0."],
          ]}
        />
        <SpecTable
          columns={["Hook", "Firma", "Descripción"]}
          rows={[
            [<code key="ub">useBreadcrumb</code>, <code key="ub-t">{"(extra: { label: string; href?: string }[]) => void"}</code>, "Añade migas detrás de «Grupo › Página» mientras el componente esté montado. Con href la miga es un enlace; la última siempre se pinta como página actual."],
          ]}
        />
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/app-shell.json" />
        <Prose>
          <p>
            Instala <code>app-shell.tsx</code>, <code>theme-toggle.tsx</code>, <code>avatar-initials.tsx</code>,{" "}
            <code>lib/nav.ts</code> y <code>lib/format.ts</code>, más los componentes base que usa (sidebar, breadcrumb,
            command, kbd, dropdown-menu, tooltip). Necesita <code>next-themes</code> con <code>ThemeProvider</code> en el
            layout raíz.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/anatomia", label: "Anatomía de página", text: "Las siete zonas y sus medidas." },
            { href: "/ds/componentes/page-header", label: "Cabecera de página", text: "Lo primero que va dentro del shell." },
            { href: "/ds/nuevo-proyecto", label: "Nuevo proyecto", text: "Cómo sustituir la demo por los módulos del cliente." },
            { href: "/demo", label: "Ver en la demo", text: "El shell con navegación real." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
