import { DocPage, DocSection, DoDont, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Página de inicio · Influencer Workspace" }

export default function InfluencerPatronesPage() {
  return (
    <DocPage
      eyebrow="Influencer Workspace · Patrones"
      title="Página de inicio"
      lead="La primera página que se diseña y la que fija el estilo: abrir la app y saber en diez segundos cómo va todo y qué toca. Es la única página con cifras arriba."
    >
      <DocSection id="anatomia" title="Anatomía">
        <SpecTable
          columns={["Zona", "Bloque", "Qué responde"]}
          rows={[
            ["Cabecera", "Saludo con la fecha, la frase de lo urgente (lleva a las tareas) y el botón «Nuevo»", "¿Qué día es y qué hay que hacer ya?"],
            ["Columna principal", "Cifras (4): pendiente de cobro, cobrado este año, collabs en curso, propuestas abiertas", "¿Cómo voy?"],
            ["", "Collabs en curso: tarjetas grandes que se deslizan", "¿En qué estoy trabajando?"],
            ["", "Tareas: pestañas Hoy · Esta semana · Vencidas, tarjetas con el círculo para marcarlas", "¿Qué me toca?"],
            ["Columna derecha (372 px)", "Mini panel del perfil con sus redes", "¿Cómo me ven las marcas?"],
            ["", "Avisos: el destacado en color y la lista", "¿Qué ha pasado?"],
            ["", "Mis enlaces: el directorio editable", "¿Dónde está lo que uso a diario?"],
          ]}
        />
        <CodeBlock
          code={`<PageBody className="gap-6 px-4 pb-28 md:px-[34px] md:pb-10">
  <header>…saludo, frase de lo urgente, botón Nuevo…</header>
  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_372px]">
    <div className="flex min-w-0 flex-col gap-6">
      <StatRow>…4 StatTile…</StatRow>
      <Block>…CollabCardRow…</Block>
      <Block>…pestañas + TaskCard…</Block>
    </div>
    <div className="flex min-w-0 flex-col gap-6">
      <ProfilePanel … />
      <Block>…NoticeHighlight + NoticeItem…</Block>
      <Block>…LinkGrid…</Block>
    </div>
  </div>
</PageBody>`}
        />
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <><strong>Dos columnas solo desde 1280 px.</strong> Por debajo, una columna en este orden: saludo, cifras, collabs, tareas, perfil, avisos, enlaces.</>,
            <><strong>En el móvil</strong> las cifras van de dos en dos, las collabs se deslizan, el margen de página baja a 16 px y la barra inferior sustituye a la sidebar.</>,
            <><strong>Las cifras llevan a su página.</strong> Cada <code>StatTile</code> tiene <code>href</code>; no hay cifra decorativa.</>,
            <><strong>Las tareas se marcan aquí mismo</strong>, sin abrir nada: el círculo cambia el estado y la tarjeta se tacha. El Inicio solo enseña las de hoy, la semana y las vencidas; «Ver todo» abre la página de tareas, que es de operar: lista completa, fechas editables, filtros y creación.</>,
            <><strong>El aviso destacado es uno</strong>: el más importante (una oportunidad nueva, cambios pedidos, un cobro vencido). El resto, en lista, del más nuevo al más viejo.</>,
            <><strong>Los enlaces son suyos:</strong> añadir, editar, ordenar y borrar desde el propio bloque, con «Editar» en su cabecera. Sin página de ajustes.</>,
            <><strong>Estados:</strong> cada bloque dice cómo llenarse cuando está vacío (<code>EmptyState</code>), carga con un esqueleto de su forma y, si falla, lo dice y deja reintentar sin tumbar el resto.</>,
          ]}
        />
      </DocSection>

      <DocSection id="do-dont" title="Qué sí y qué no">
        <DoDont
          dos={[
            <>Una cosa principal por bloque y el detalle a un toque.</>,
            <>Imágenes de campaña y de perfil: hacen reconocible cada cosa de un vistazo.</>,
            <>Tintes por marca o por tipo; estados con <code>StatusBadge</code> y los colores de estado.</>,
            <>Reutilizar el kit madre para todo lo que no sea visual: diálogos, formularios, confirmaciones, toasts.</>,
          ]}
          donts={[
            <>Cifras arriba en una página que no sea de inicio.</>,
            <>Un panel de información fijo a la derecha con bloques configurables: aquí la columna derecha son bloques normales.</>,
            <>Una tabla densa como bloque principal del inicio.</>,
            <>Bloques pequeños repartidos por la pantalla: si hay más de siete, sobra alguno.</>,
          ]}
        />
      </DocSection>

      <DocSection id="siguientes" title="Lo que viene">
        <Prose>
          <p>
            Construidas después del Inicio: Propuestas y Collabs con su ficha completa (brief, contenidos con la revisión
            de guion y vídeo, materiales y tareas), en <a href="/ds/influencer/operar" className="text-brand underline-offset-2 hover:underline">Páginas de operar</a>.
            Quedan Tareas (la página general), Contenidos (ideas y planificación), Cobros, Perfil y tarifas, Academia y Ajustes.
          </p>
        </Prose>
      </DocSection>

      <NextLinks
        links={[
          { href: "/ds/influencer/componentes", label: "Componentes", text: "Las piezas de la página." },
        ]}
      />
    </DocPage>
  )
}
