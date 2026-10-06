import { BanknoteIcon, CircleCheckIcon, MessageSquareWarningIcon, SparklesIcon, WalletIcon } from "lucide-react"
import { fmt } from "@/lib/format"
import { HOY, demoCollabs, demoMarcas, demoPerfil } from "@/lib/influencer/demo-data"
import { eventosDeCollabs } from "@/lib/influencer/agenda"
import { BrandMark } from "@/components/influencer/brand-mark"
import { Agenda } from "@/components/influencer/agenda"
import { PiezaCard } from "@/components/influencer/pieza-card"
import { describirEntregables, siguienteHito, unidadesHechas, unidadesTotales } from "@/lib/influencer/collabs"
import { Button } from "@/components/ui/button"
import { Block, BlockHeader } from "@/components/influencer/block"
import { StatRow, StatTile } from "@/components/influencer/stat-tile"
import { CollabCard, CollabCardRow } from "@/components/influencer/collab-card"
import { ProfilePanel } from "@/components/influencer/profile-panel"
import { NoticeHighlight, NoticeItem } from "@/components/influencer/notice-card"
import { LinkGridExample, TaskBlockExample, TaskTableExample } from "@/components/docs/examples/influencer-examples"
import { DocPage, DocSection, Example, NextLinks, Prose, Rules } from "@/components/docs/doc"

export const metadata = { title: "Componentes · Influencer Workspace" }

const EXAMPLE = "theme-influencer"

export default function InfluencerComponentesPage() {
  const [lumea, botanica] = demoCollabs
  const tarjeta = (c: typeof lumea) => ({
    campaign: c.campana,
    deliverables: describirEntregables(c),
    done: unidadesHechas(c),
    total: unidadesTotales(c),
    nextLabel: siguienteHito(c)?.label ?? "Todo entregado",
    nextDate: siguienteHito(c)?.fecha ?? c.hasta,
    tint: c.tint,
  })
  return (
    <DocPage
      eyebrow="Influencer Workspace · Componentes"
      title="Componentes"
      lead="Las piezas propias del workspace, en components/influencer. Todo lo demás (botones, formularios, estados, sidebar) es el kit de Astratic UI tal cual."
    >
      <DocSection id="block" title="Bloque" lead="La superficie base de toda página: blanco, redondo, con sombra suave. La cabecera lleva el título, el contador y «Ver todo» o una acción.">
        <Example className={EXAMPLE} code={`<Block>
  <BlockHeader title="Collabs en curso" count={4} href="/workspace/collabs" />
  …
</Block>

<Block>
  <BlockHeader title="Mis enlaces" action={<Button variant="ghost" size="sm">Editar</Button>} />
  …
</Block>`}>
          <Block className="max-w-md">
            <BlockHeader title="Collabs en curso" count={4} href="#" />
            <p className="text-sm text-muted-foreground">El contenido del bloque.</p>
          </Block>
        </Example>
        <Rules
          items={[
            <>Lo que va dentro de <code>BlockHeader</code> como hijo (pestañas, filtros) sigue al título; en móvil baja a una línea propia bajo la cabecera.</>,
            <>Un bloque, una pregunta. Si hace falta un segundo título dentro, son dos bloques.</>,
          ]}
        />
      </DocSection>

      <DocSection id="stat" title="Cifra" lead="Icono en un círculo de tinte, número grande y etiqueta. Con href, la tarjeta entera lleva a su página. Solo en las páginas de inicio.">
        <Example className={EXAMPLE} code={`<StatRow>
  <StatTile icon={WalletIcon} label="Pendiente de cobro" value={fmt.eur(3240)} tint="peach" href="/workspace/cobros" />
  <StatTile icon={BanknoteIcon} label="Cobrado este año" value={fmt.eur(18650)} tint="mint" href="/workspace/cobros" />
</StatRow>`}>
          <StatRow className="max-w-2xl">
            <StatTile icon={WalletIcon} label="Pendiente de cobro" value={fmt.eur(3240)} tint="peach" href="#" />
            <StatTile icon={BanknoteIcon} label="Cobrado este año" value={fmt.eur(18650)} tint="mint" href="#" />
            <StatTile icon={SparklesIcon} label="Collabs en curso" value={4} tint="rose" />
          </StatRow>
        </Example>
      </DocSection>

      <DocSection id="collab" title="Tarjeta de collab" lead="La imagen de la campaña (o un tinte si no la hay), el logo de la marca, las piezas hechas de las totales y el siguiente hito. En fila, se deslizan.">
        <Example className={EXAMPLE} code={`<CollabCardRow>
  <CollabCard
    brand="Lumea Skin" campaign="Rutina de noche" deliverables="1 reel + 3 stories"
    done={2} total={4} nextLabel="Entregar la V1 del reel" nextDate="2026-10-09"
    tint="rose" coverUrl={cover} href="/workspace/collabs/lumea"
  />
</CollabCardRow>`}>
          <CollabCardRow className="mx-0 px-0">
            <CollabCard brand="Lumea Skin" {...tarjeta(lumea)} coverUrl={lumea.coverUrl} href="#" />
            <CollabCard brand="Botánica Lab" {...tarjeta(botanica)} href="#" />
          </CollabCardRow>
        </Example>
        <Rules
          items={[
            <>Con imagen, el texto va en blanco sobre un degradado oscuro; sin imagen, el tinte de la marca (<code>tintFor(brand)</code>) con su texto del mismo tono.</>,
            <>Tamaño fijo de 288 × 208 px: así la fila se desliza igual en el móvil y en el ordenador.</>,
            <>La barra de progreso son las piezas del brief, una por segmento: se entiende sin leer el 2/4.</>,
          ]}
        />
      </DocSection>

      <DocSection id="task" title="Tarea" lead="Un círculo para marcarla, el título, la collab a la que pertenece y la fecha, en rojo si venció y en naranja si es hoy. Al hacerla se tacha.">
        <Example className={EXAMPLE} code={`<TaskCard
  title="Enviar el guion a la marca" context="Botánica Lab · Sérum de vitamina C"
  dueAt="2026-10-06" tone="hoy" done={false} onToggle={…}
/>`}>
          <TaskBlockExample />
        </Example>
      </DocSection>

      <DocSection id="profile" title="Mini panel del perfil" lead="Foto, nombre, nicho y tramo, y una fila por red con seguidores, visualizaciones medias y el enlace a su perfil.">
        <Example className={EXAMPLE} code={`<ProfilePanel
  name={profile.name} handle={profile.handle} photoUrl={profile.photoUrl}
  niche="Skincare y maquillaje" tier="50K–100K" city="Valencia"
  accounts={profile.accounts}
  actions={<><Button variant="outline" size="sm">Media kit</Button><Button variant="ghost" size="sm">Ver perfil</Button></>}
/>`}>
          <ProfilePanel
            className="max-w-sm"
            name={demoPerfil.nombre}
            handle={demoPerfil.handle}
            photoUrl={demoPerfil.fotoUrl}
            niche={demoPerfil.nicho}
            tier={demoPerfil.tramo}
            city={demoPerfil.ciudad}
            accounts={demoPerfil.cuentas.map((c) => ({ network: c.red, handle: c.handle, url: c.url, followers: c.seguidores, avgViews: c.visualizacionesMedias }))}
            actions={
              <>
                <Button variant="outline" size="sm">
                  Media kit
                </Button>
                <Button variant="ghost" size="sm">
                  Ver perfil
                </Button>
              </>
            }
          />
        </Example>
      </DocSection>

      <DocSection id="notice" title="Avisos" lead="El que más importa va en una tarjeta del acento con su acción; los demás, en lista, con el punto y la negrita si no están leídos.">
        <Example className={EXAMPLE} code={`<NoticeHighlight
  eyebrow="Red Astratic" title="Nueva oportunidad de la red: Nuura"
  description="1 reel + 3 stories · 1.100 € (880 € para ti)"
  action={<Button size="sm" variant="secondary">Ver la propuesta</Button>}
/>
<NoticeItem icon={MessageSquareWarningIcon} title="Maison Vero ha pedido cambios" meta="hace 1 hora" unread href="…" />`}>
          <Block className="max-w-sm">
            <BlockHeader title="Avisos" count={2} href="#" hrefLabel="Ver todos" />
            <NoticeHighlight
              eyebrow="Red Astratic"
              title="Nueva oportunidad de la red: Nuura"
              description="1 reel + 3 stories · 1.100 € (880 € para ti)"
              action={
                <Button size="sm" variant="secondary" className="w-fit">
                  Ver la propuesta
                </Button>
              }
            />
            <ul className="mt-3 flex flex-col">
              <li>
                <NoticeItem icon={MessageSquareWarningIcon} title="Maison Vero ha pedido cambios en el reel" description="2 notas en la V1" meta="hace 1 hora" unread href="#" />
              </li>
              <li>
                <NoticeItem icon={CircleCheckIcon} title="Lumea Skin ha aprobado el guion" meta="ayer" href="#" />
              </li>
            </ul>
          </Block>
        </Example>
      </DocSection>

      <DocSection id="links" title="Directorio de enlaces" lead="Los enlaces de uso diario en mosaico, con el icono de su web. En modo edición se ordenan arrastrando, se editan y se borran con confirmación.">
        <Example className={EXAMPLE} code={`const [links, setLinks] = useState(initial)
const [editing, setEditing] = useState(false)

<LinkGrid links={links} onChange={setLinks} editing={editing} />`}>
          <LinkGridExample />
        </Example>
        <Prose>
          <p>
            El icono sale del servicio de favicons de Google a partir del dominio; si la dirección no es válida, la
            inicial del nombre. Nuevo y editar comparten el mismo diálogo (react-hook-form + zod); borrar pide
            confirmación y el toast ofrece deshacer.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="tabbar" title="Barra inferior del móvil" lead="Las cinco páginas principales, fijas abajo, por debajo de md. La sidebar heredada sigue mandando en pantallas medianas y grandes.">
        <Prose>
          <p>
            <code>MobileTabBar</code> recibe las mismas entradas que la sidebar (<code>workspaceTabs</code> en{" "}
            <code>app/workspace/nav.ts</code>) y marca la activa por la ruta. Se ve en la demo con el navegador por
            debajo de 768 px. Las páginas llevan <code>pb-28 md:pb-10</code> para que no tape el final.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="operar" title="Piezas de operar" lead="Las páginas donde se trabaja (Propuestas, la ficha de collab, la pieza) usan el kit madre dentro de bloques del hijo, más estas piezas propias.">
        <Prose>
          <p>
            Regla de los dos registros: lo que resume va en el estilo visual de arriba; donde se trabaja se usa{" "}
            <code>Toolbar</code>, <code>FilterMenu</code>, <code>Kanban</code>, <code>DataTable</code>, <code>DetailSheet</code> e{" "}
            <code>InlineField</code> de Astratic UI tal cual, dentro de un <code>Block</code> con <code>p-0</code>. Lo que
            no existía en el madre y hacía falta para operar nace aquí.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="brand" title="Marca" lead="El logo de la marca o sus iniciales sobre su tinte: la misma pieza en tarjetas, tablas, fichas y cabeceras.">
        <Example className={EXAMPLE} code={`<BrandMark name="Lumea Skin" tint="rose" size="lg" />
<BrandMark name="Botánica Lab" tint="mint" />
<BrandMark name="Maison Vero" tint="peach" size="sm" logoUrl={logo} />`}>
          <div className="flex items-center gap-3">
            <BrandMark name="Lumea Skin" tint="rose" size="lg" />
            <BrandMark name="Botánica Lab" tint="mint" />
            <BrandMark name="Maison Vero" tint="peach" size="sm" />
            <BrandMark name="Glow Studio" tint="lavender" size="xs" />
          </div>
        </Example>
      </DocSection>

      <DocSection id="task-table" title="Lista de tareas" lead="La lista de operar, al estilo de Notion: agrupada por fecha, se marca con el círculo, título y fecha se editan en el sitio, abajo se añade escribiendo y Enter, y la selección saca la barra de acciones.">
        <Example className={EXAMPLE} code={`<TaskTable
  tareas={tareas} hoy="2026-10-06"
  relacionFija={{ tipo: "collab", id: "lumea", label: "Lumea Skin · Rutina de noche" }}
  onToggle={…} onUpdate={…} onCreate={…} onDelete={…}
/>`}>
          <TaskTableExample />
        </Example>
        <Rules
          items={[
            <>La misma lista sirve para una collab, una propuesta o todas: con <code>relacionFija</code> las nuevas nacen atadas; con <code>contexto</code> se enseña a qué pertenece cada una.</>,
            <><code>TaskDialog</code> es el diálogo de tarea de toda la app («Nuevo → Tarea» del Inicio, «Nueva tarea» de una collab): desde una página se abre ya atado a ese registro y la tarea aparece también en la lista general.</>,
            <>Las automáticas (<code>origen: "auto"</code>) salen de las fechas del brief y llevan la etiqueta «Auto»; se pueden mover como las demás.</>,
          ]}
        />
      </DocSection>

      <DocSection id="agenda" title="Agenda" lead="Mes con los hitos de cada pieza (guion, grabación, V1, publicación, resultados), los cobros y las tareas con fecha, cada uno con el tinte de su collab. En el móvil, la lista del mes.">
        <Example className={EXAMPLE} code={`const eventos = [...eventosDeCollabs(collabs, marcas), ...eventosDeTareas(tareas, collabs)]
<Agenda eventos={eventos} hoy={hoy} />`}>
          <Agenda eventos={eventosDeCollabs(demoCollabs.slice(0, 2), demoMarcas)} hoy={HOY} className="w-full" />
        </Example>
      </DocSection>

      <DocSection id="pieza" title="Tarjeta de pieza" lead="Una pieza en la biblioteca de la collab: miniatura, estado, qué toca ahora y en qué versión van el guion y el vídeo.">
        <Example className={EXAMPLE} code={`<PiezaCard pieza={pieza} tint={collab.tint} hoy={hoy} href="/workspace/collabs/vero/contenidos/vero-reel" />`}>
          <div className="grid max-w-3xl gap-3 md:grid-cols-2">
            <PiezaCard pieza={demoCollabs[2].piezas[0]} tint="peach" hoy={HOY.slice(0, 10)} href="/workspace/collabs/vero/contenidos/vero-reel" />
            <PiezaCard pieza={demoCollabs[0].piezas[0]} tint="rose" hoy={HOY.slice(0, 10)} href="/workspace/collabs/lumea/contenidos/lumea-reel" />
          </div>
        </Example>
      </DocSection>

      <DocSection id="revision" title="Guion, vídeo y notas" lead="Las piezas de la revisión: el guion como documento con las citas marcadas, el vídeo con una marca por segundo y el panel de notas, para ella (resolver, contestar) y para la marca (escribir, anclar, aprobar).">
        <Prose>
          <p>
            <code>GuionViewer</code> parte el texto en apartados (los títulos en mayúsculas) y marca cada cita de una nota con
            su número; con <code>onCitar</code>, seleccionar texto propone una nota ahí. <code>VideoViewer</code> pinta el
            fotograma, un carril de marcas y la barra de tiempo; con <code>onMarcarSegundo</code>, pulsar en la barra
            propone una nota en ese segundo. <code>NotesPanel</code> enseña las notas numeradas con su progreso y, en{" "}
            <code>modo="marca"</code>, el formulario para escribirlas. Se ven en{" "}
            <a href="/workspace/collabs/vero/contenidos/vero-reel" className="text-brand underline-offset-2 hover:underline">la pieza</a> y en{" "}
            <a href="/revisar/rv-vero-reel-v1" className="text-brand underline-offset-2 hover:underline">la revisión de la marca</a>.
          </p>
          <p>
            <code>ThemeBody</code> pone la clase del tema en <code>&lt;body&gt;</code> mientras la página está montada:
            sin ella, las fichas, diálogos y menús (que se pintan en un portal fuera del shell) saldrían con los tokens
            del madre y sin tintes. Va una vez en el shell del workspace y en las páginas sin shell (la revisión).
          </p>
        </Prose>
      </DocSection>

      <NextLinks
        links={[
          { href: "/ds/influencer/patrones", label: "Página de inicio", text: "Cómo se juntan estas piezas en la primera página." },
          { href: "/ds/influencer/operar", label: "Páginas de operar", text: "Propuestas, Collabs, la ficha de collab, la pieza y la revisión." },
          { href: "/workspace", label: "Abrir el workspace", text: "Todo junto con datos de ejemplo." },
        ]}
      />
    </DocPage>
  )
}
