import { DocPage, DocSection, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Influencer Workspace" }

export default function InfluencerIntroPage() {
  return (
    <DocPage
      eyebrow="Design system hijo · v0.1"
      title="Influencer Workspace"
      lead="El primer design system hijo de Astratic UI: el workspace que Astratic Network da a las influencers de su red. Hereda la base (botones, formularios, sidebar, estados, lo técnico) y cambia lo que se ve: fondo gris con superficies blancas, bloques grandes con aire, imágenes y color."
    >
      <DocSection id="que-es" title="Qué es un design system hijo">
        <Prose>
          <p>
            Astratic UI es el design system <strong>madre</strong>: define los tokens, los componentes de shadcn, el kit
            de aplicación y las convenciones de los portales operativos. Un <strong>hijo</strong> no vuelve a decidir nada
            de eso: lo hereda tal cual y añade encima una capa de estilo y unos componentes propios para un tipo de
            producto distinto. Aquí, un espacio de trabajo personal que se usa desde el móvil, para una sola persona, con
            pocas cosas en pantalla y mucho más visual que un CRM.
          </p>
          <p>
            En la práctica son tres piezas: una capa de tokens en <code>globals.css</code> (<code>.theme-influencer</code>),
            una carpeta de componentes (<code>components/influencer</code>) y unas reglas de página propias
            (<code>.claude/rules/influencer-workspace.md</code>). Todo lo demás es Astratic UI. Si mañana hace falta otro
            hijo, se añade igual y aparece en el selector de la cabecera.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="hereda-cambia" title="Qué hereda y qué cambia">
        <SpecTable
          columns={["Pieza", "Hereda de Astratic UI", "Cambia aquí"]}
          rows={[
            ["Sidebar y cabecera", "El shell entero: sidebar, migas, buscador ⌘K, bicho, campana y tema", "Fondo blanco sobre el gris de la página; en el móvil se añade una barra inferior con las cinco páginas"],
            ["Botones, formularios, diálogos", "Tal cual: mismas variantes, tamaños y copy", "Nada"],
            ["Tipografía e iconos", "Geist y lucide, mismos tamaños", "Nada"],
            ["Estados y feedback", "StatusBadge, EmptyState, skeletons, toasts, ConfirmDialog", "Nada"],
            ["Lo técnico", "Campos, relaciones, filtros, configuración in situ, fichas", "Nada: cuando una página lo necesite, se usa el kit madre"],
            ["Superficies", "Tarjeta blanca con borde y sombra mínima", "Fondo gris claro, tarjetas blancas sin borde y con sombra suave"],
            ["Forma", "Radio base 10 px", "Radio base 16 px: bloques rounded-2xl, elementos rounded-xl, chips rounded-full"],
            ["Color", "Un acento (índigo) y cinco colores de estado", "Lo mismo, más seis tintes pastel para tarjetas, etiquetas e iconos"],
            ["Layout de página", "Cifras + toolbar + un bloque + panel de información", "Bloques grandes y pocos; cifras solo en las páginas de inicio; imágenes de campaña y de perfil"],
          ]}
        />
      </DocSection>

      <DocSection id="principios" title="Principios">
        <Rules
          items={[
            <><strong>Móvil primero.</strong> Se diseña para 390 px y se ensancha: barra inferior con las cinco páginas, una columna, filas que se deslizan. En el ordenador, la sidebar heredada y dos columnas.</>,
            <><strong>Una cosa principal por pantalla.</strong> Cada bloque responde a una pregunta («¿qué me toca?», «¿cómo van mis collabs?») y el detalle está a un toque. Si al mirar una página no se sabe dónde poner los ojos, sobra información.</>,
            <><strong>Cifras solo en el inicio.</strong> La fila de cifras arriba es cosa de la página de inicio. Las demás páginas empiezan por su contenido.</>,
            <><strong>Imágenes y color con sentido.</strong> La foto de la campaña, el logo de la marca y la foto de perfil hacen reconocible cada cosa. Los tintes pastel colorean por marca o por tipo, nunca por estado: los estados siguen siendo los cinco de Astratic UI.</>,
            <><strong>Dos registros: mostrar y operar.</strong> Lo que resume o enseña (el Inicio, el perfil, los avisos, las tarjetas de collab) va en este estilo visual. Donde se trabaja (la lista completa de tareas, la agenda, el tablero de propuestas, la ficha de una collab) se es detallado y funcional sin miedo, al estilo de Astratic UI o de Notion: tablas, filtros, edición en el sitio. Cada «Ver todo» del Inicio lleva a una página de operar.</>,
            <><strong>Aire.</strong> Bloques con padding de 20 px, 24 px entre bloques, tipografía más grande en lo importante (cifras a 24 px, títulos de bloque a 16 px) y texto secundario en gris.</>,
            <><strong>Nada se inventa dos veces.</strong> Lo que ya resuelve Astratic UI se usa tal cual. Un componente nuevo nace en <code>components/influencer</code>, se documenta aquí y entra en el registry.</>,
          ]}
        />
      </DocSection>

      <DocSection id="activar" title="Cómo se activa" lead="El tema vive en un subárbol: la clase en el shell del workspace y todo lo de dentro cambia de piel.">
        <CodeBlock
          code={`// app/workspace/shell.tsx
export function WorkspaceShell({ children }) {
  return (
    <div className="theme-influencer contents">
      <AppShell brand={workspaceBrand} user={workspaceUser} nav={workspaceNav}>
        {children}
      </AppShell>
      <MobileTabBar tabs={workspaceTabs} />
    </div>
  )
}`}
        />
        <Prose>
          <p>
            El modo oscuro funciona igual que en el madre: <code>.dark .theme-influencer</code> redefine los mismos tokens.
            Fuera del subárbol no cambia nada, así que el workspace puede convivir con el resto del portal.
          </p>
        </Prose>
      </DocSection>

      <NextLinks
        links={[
          { href: "/ds/influencer/fundamentos", label: "Fundamentos", text: "Superficies, forma, tintes y espacio." },
          { href: "/ds/influencer/componentes", label: "Componentes", text: "Bloque, cifra, tarjeta de collab, tarea, perfil, avisos, enlaces y barra del móvil." },
          { href: "/ds/influencer/patrones", label: "Página de inicio", text: "La anatomía de la primera página y sus reglas." },
        ]}
      />
    </DocPage>
  )
}
