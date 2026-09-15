import Link from "next/link"
import { DocPage, DocSection, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export default function IntroPage() {
  return (
    <DocPage
      eyebrow="Astratic UI · v1"
      title="Introducción"
      lead="La base visual y de código de todos los portales que construye Astratic Network Devs. Un proyecto nuevo empieza clonando este repositorio; uno existente instala las piezas que necesite desde el registry."
    >
      <DocSection id="que-es" title="Qué es y qué no es">
        <Prose>
          <p>
            Astratic UI es un <strong>design system con código</strong>: tokens de color y tipografía, componentes de
            shadcn/ui configurados, un kit de componentes de aplicación (shell, tabla, kanban, panel de información,
            sheet de detalle…) y las <strong>convenciones fijas</strong> que dicen dónde va cada cosa. Está pensado para
            portales operativos: CRM, gestión de campañas, facturación, equipo, eventos. Lo que se ve en la propuesta a
            Twic es el punto de partida; aquí está generalizado para cualquier cliente.
          </p>
          <p>
            No es una librería de páginas. No decide qué módulos tiene un portal ni qué campos tiene un registro. Decide
            cómo se ven y cómo se comportan una vez existen, para que dos portales distintos, o dos páginas del mismo
            portal, se sientan iguales sin volver a pensar el diseño.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="principios" title="Principios">
        <Rules
          items={[
            <><strong>Una página, un bloque de operación.</strong> Cifras arriba, un único bloque central donde se trabaja (tabla, lista o kanban), y a la derecha un panel de información de la misma altura. Nada de bloques sueltos debajo.</>,
            <><strong>Denso con aire.</strong> Texto de trabajo a 13,5 px, filas de 40 px, tarjetas con borde y sombra mínima. Cabe mucho y se lee todo.</>,
            <><strong>Un solo acento.</strong> Índigo para lo activo y el foco; el botón principal es negro. Los colores de estado significan siempre lo mismo.</>,
            <><strong>Las convenciones no se negocian por página.</strong> El buscador va a la izquierda, la acción principal a la derecha, el detalle se abre en un panel lateral. Si hay una excepción, se documenta aquí, no se improvisa.</>,
            <><strong>Copiar, no reinventar.</strong> Todo componente vive en <code>components/app</code> y se instala por registry. Si algo no existe, se crea aquí primero.</>,
          ]}
        />
      </DocSection>

      <DocSection id="stack" title="Stack">
        <SpecTable
          columns={["Capa", "Elección", "Por qué"]}
          rows={[
            ["Framework", "Next.js 16, App Router, React 19", "Server Components por defecto, Vercel sin configuración."],
            ["Estilos", "Tailwind CSS v4", "Tokens como variables CSS en @theme; sin config JS."],
            ["Componentes base", "shadcn/ui (preset Nova sobre Radix)", "Código propio, accesible, sin dependencia de un vendor."],
            ["Iconos", "lucide-react", "Un solo set, trazo 2 px, tamaño 16 px en UI y 14 px en botones pequeños."],
            ["Tipografía", "Geist y Geist Mono", "Sans neutra con cifras tabulares; la misma en todo el portal."],
            ["Gráficos", "Recharts vía shadcn charts", "Paleta del sistema, tooltip y leyenda ya estilados."],
            ["Arrastrar", "dnd-kit", "Kanban y reordenaciones accesibles con teclado."],
            ["Formularios", "react-hook-form + zod", "Validación tipada compartida con el servidor."],
            ["Tema", "next-themes", "Claro, oscuro y sistema; ambos pulidos."],
            ["Feedback", "sonner", "Toasts abajo a la derecha; nunca avisos en la toolbar."],
          ]}
        />
      </DocSection>

      <DocSection id="como-se-usa" title="Cómo se usa">
        <Prose>
          <p>
            <strong>Proyecto nuevo:</strong> clona el repositorio, borra la carpeta <code>app/ds</code> y sustituye la demo por
            los módulos del cliente. La guía completa está en <Link href="/ds/nuevo-proyecto">Nuevo proyecto</Link>.
          </p>
          <p>
            <strong>Proyecto existente:</strong> instala solo lo que necesites desde el <Link href="/ds/registry">registry</Link>.
          </p>
        </Prose>
        <CodeBlock
          lang="bash"
          code={`npx shadcn@latest add https://ui.astraticnetwork.com/r/app-shell.json
npx shadcn@latest add https://ui.astraticnetwork.com/r/data-table.json`}
        />
      </DocSection>

      <DocSection id="mapa" title="Por dónde seguir">
        <NextLinks
          links={[
            { href: "/ds/patrones/anatomia", label: "Anatomía de página", text: "El layout fijo: sidebar, cifras, bloque de operación y panel." },
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "Dónde va cada botón, filtro y acción." },
            { href: "/ds/fundamentos/color", label: "Color", text: "Tokens, acento y los cinco colores de estado." },
            { href: "/ds/componentes", label: "Catálogo de componentes", text: "Todos los bloques del kit con su código." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
