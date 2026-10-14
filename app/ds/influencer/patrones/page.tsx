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
            ["Cabecera", "Saludo con la fecha y la frase de lo urgente (lleva a «Por hacer»); a la derecha, el botón «Nuevo»", "¿Qué día es y qué hay que hacer ya?"],
            ["Arriba (6:5, misma altura)", "Tarjeta del perfil: foto y nombre, sus enlaces arriba a la derecha (LinkRow), las views medias y la interacción de la red elegida, y al pie una ficha por red con sus seguidores y el media kit, que crecen hasta llenarla", "¿Cómo me ven las marcas y dónde está lo que uso a diario?"],
            ["", "Cifras (4, de dos en dos): pendiente de cobro, cobrado este año, collabs en curso, propuestas abiertas", "¿Cómo voy?"],
            ["En medio (2:3, misma altura)", "Calendario del mes como Google Calendar: cada día con lo que tiene escrito en pequeño (hitos, cobros, tareas)", "¿Qué tengo este mes?"],
            ["", "Por hacer: arriba las tareas de hoy (con las vencidas) y las siguientes, cada grupo en su fila; abajo, hasta cuatro collabs en paneles que se pisan en diagonal", "¿Qué me toca y en qué estoy trabajando?"],
            ["Abajo", "Rendimiento: con Instagram conectado, sus cifras de 28 días y la evolución, y lo cobrado mes a mes; sin conectar, lo cobrado en grande y cómo conectarlo", "¿Cómo van mis redes y lo que gano?"],
          ]}
        />
        <CodeBlock
          code={`<PageBody className="gap-6 px-4 pb-28 md:px-[34px] md:pb-10">
  <header>…saludo, frase de lo urgente · botón Nuevo…</header>
  <div className="grid gap-6 xl:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
    <ProfilePanel links={<LinkRow max={4} … />} actions={<ProfileTile … />} … />
    <StatRow className="xl:grid-cols-2 xl:grid-rows-2 xl:[&>*]:justify-between">…4 StatTile…</StatRow>
  </div>
  <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
    <Block>…MiniCalendario…</Block>
    <Block>…TaskCard en dos filas (hoy, siguientes) + FranjaCollabs…</Block>
  </div>
  <section>…Rendimiento: cifras clave, evolución e ingresos por mes…</section>
</PageBody>`}
        />
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <><strong>Dos columnas solo desde 1280 px.</strong> Por debajo, una columna en este orden: saludo, perfil, cifras, por hacer, calendario y rendimiento. Arriba, el perfil y las cifras a la misma altura y sin huecos; en medio, el calendario y «Por hacer», también a la misma altura (Xavier, 2026-10-14).</>,
            <><strong>En el móvil</strong> las cifras van de dos en dos, los paneles de las collabs se deslizan, el margen de página baja a 16 px y la barra inferior sustituye a la sidebar.</>,
            <><strong>Las cifras llevan a su página.</strong> Cada <code>StatTile</code> tiene <code>href</code>; no hay cifra decorativa.</>,
            <><strong>Las tareas se marcan aquí mismo</strong>, sin abrir nada: el círculo cambia el estado y la tarjeta se tacha; el título abre su ficha. «Por hacer» enseña las de hoy (con las vencidas) y las siguientes, cada grupo en su fila; sin nada para hoy, solo las siguientes. «Ver tareas» abre la página de tareas, que es de operar.</>,
            <><strong>Sin avisos ni lista de tareas abajo</strong> (Xavier, 2026-10-14): las tareas ya están en «Por hacer» y los avisos, en la campana de la cabecera. Abajo va el rendimiento.</>,
            <><strong>Los enlaces son suyos y van en la tarjeta del perfil</strong>, arriba a la derecha (Xavier, 2026-10-14): los cinco primeros a la vista, «+N» despliega el resto en la misma fila y el lápiz abre el directorio para añadir, ordenar, editar y borrar. Sin página de ajustes.</>,
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
