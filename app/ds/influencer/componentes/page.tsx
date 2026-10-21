import { BanknoteIcon, CircleCheckIcon, MessageSquareWarningIcon, SparklesIcon, WalletIcon } from "lucide-react"
import { fmt } from "@/lib/format"
import { HOY, demoMarcas, demoPerfil } from "@/lib/influencer/demo-data"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { eventosDeCollabs } from "@/lib/influencer/agenda"
import { BrandMark } from "@/components/influencer/brand-mark"
import { Agenda } from "@/components/influencer/agenda"
import { MediaKitHojas } from "@/components/influencer/media-kit-doc"
import { marcasTrabajadas, obtenerMediaKit } from "@/lib/influencer/consultas"
import { bloquesVisibles } from "@/lib/influencer/media-kit"
import { PiezaCard } from "@/components/influencer/pieza-card"
import { DIAS_COLLAB_NUEVA, describirEntregables, hitosPendientes, marcaDe, siguienteHito, unidadesHechas, unidadesTotales } from "@/lib/influencer/collabs"
import type { Collab } from "@/lib/influencer/modelo"
import { Block, BlockHeader } from "@/components/influencer/block"
import { StatRow, StatTile } from "@/components/influencer/stat-tile"
import { CifraCabecera, CifrasCabecera } from "@/components/influencer/cifras-cabecera"
import { CollabCard, CollabCardRow } from "@/components/influencer/collab-card"
import { FranjaCollabs, type CollabEnFranja } from "@/components/influencer/franja-collabs"
import { MiniCalendario } from "@/components/influencer/mini-calendario"
import { NoticeHighlight, NoticeItem } from "@/components/influencer/notice-card"
import { LinkGridExample, LinkRowExample, ProfilePanelExample, TaskBlockExample, TaskTableExample } from "@/components/docs/examples/influencer-examples"
import { EditorGuionExample, FotosExample, ReproductorNotasExample, SugerenciasGuionExample, GanttExample, PiezasEditorExample, RevisionExample } from "@/components/docs/examples/collabs-examples"
import { AgendaContenidosExample, CalendarioContenidosExample, CapturaIdeaExample, CaptionExample, GaleriaIdeasExample } from "@/components/docs/examples/contenidos-examples"
import { DocPage, DocSection, Example, NextLinks, Prose, Rules } from "@/components/docs/doc"
import { primerosPasos } from "@/lib/influencer/primeros-pasos"
import { demoAcuerdo, demoDatosFiscales, demoDatosPersonales } from "@/lib/influencer/demo-documentos"
import { demoCapitulosBiblia, demoLecturasBiblia } from "@/lib/influencer/demo-biblia"
import { CompletarPerfil } from "@/components/influencer/completar-perfil"
import { AsistenteMarco, AsistentePaso } from "@/components/influencer/asistente"
import { PildorasEjemplo } from "@/components/docs/examples/influencer-examples"
import { Button } from "@/components/ui/button"

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
  const panel = (c: Collab, nueva: boolean): CollabEnFranja => {
    const [ahora, despues] = hitosPendientes(c)
    return { id: c.id, marca: marcaDe(c, demoMarcas).nombre, campana: c.campana, portadaUrl: c.coverUrl, tint: c.tint, hechas: unidadesHechas(c), totales: unidadesTotales(c), ahora, despues, tareas: nueva ? 0 : 2, nueva, href: "#" }
  }
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

      <DocSection id="stat" title="Cifra" lead="Icono en un círculo de tinte, número grande y etiqueta. Con href, la tarjeta entera lleva a su página. Solo en el Inicio: en las demás portadas, las cifras van en la cabecera.">
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

      <DocSection id="cifras-cabecera" title="Cifras en la cabecera" lead="Las cifras clave de una portada que no es el Inicio (Pipeline, Collabs, Cobros, Tarifas), a la derecha del título, en la prop stats de PageHeader; los botones de la página bajan a la fila de las pestañas. Sin tarjetas ni iconos: número, nombre y una línea de detalle, separadas por una raya fina. Con onClick filtran la lista de debajo.">
        <Example className={EXAMPLE} code={`<PageHeader
  title="Cobros"
  description="Lo que te deben, lo que toca facturar y lo cobrado."
  stats={
    <CifrasCabecera>
      <CifraCabecera label="Vencido" value={fmt.eur(760)} hint="1 factura" onClick={…} active={…} />
      <CifraCabecera label="Por cobrar" value={fmt.eur(3240)} hint="4 facturas enviadas" onClick={…} />
      <CifraCabecera label="Cobrado este año" value={fmt.eur(18650)} />
    </CifrasCabecera>
  }
/>`}>
          <CifrasCabecera>
            <CifraCabecera label="Vencido" value={fmt.eur(760)} hint="1 factura" />
            <CifraCabecera label="Por cobrar" value={fmt.eur(3240)} hint="4 facturas enviadas" />
            <CifraCabecera label="Cobrado este año" value={fmt.eur(18650)} hint="12 facturas" />
          </CifrasCabecera>
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

      <DocSection id="franja" title="Collabs en diagonal" lead="Las collabs en marcha como paneles que llenan todo su hueco y se pisan en diagonal, la más urgente encima de la siguiente: la imagen de la campaña, lo que toca ahora y lo que viene después, las piezas hechas y sus tareas. La recién creada va en el acento.">
        <Example className={EXAMPLE} code={`<FranjaCollabs
  collabs={[
    { id, marca: "Lumea Skin", campana: "Rutina de noche", portadaUrl, tint: "rose", hechas: 2, totales: 4,
      ahora: { label: "Entregar la V1 · Reel", fecha: "2026-10-09" },
      despues: { label: "Publicar · Reel", fecha: "2026-10-14" },
      tareas: 2, nueva: false, href: "/workspace/collabs/lumea" },
    …
  ]}
/>`}>
          <FranjaCollabs className="h-80 w-full" collabs={demoCollabs.slice(0, 4).map((c, i) => panel(c, i === 1))} />
        </Example>
        <Rules
          items={[
            <>Hasta cuatro paneles: los nuevos primero y luego por lo que toca antes. Uno solo ocupa todo el bloque sin cortes.</>,
            <>Nueva es la creada hace menos de {DIAS_COLLAB_NUEVA} días (<code>esCollabNueva</code>): fondo o degradado del acento, la etiqueta «Nueva» y un poco más ancha.</>,
            <>Al pasar el ratón (o con el foco del teclado), el panel sube encima de todos, pierde el corte y se queda casi todo el bloque; los demás se quedan en una tira de su imagen, sin texto. En el móvil, los paneles se deslizan conservando el corte.</>,
            <>«Ahora» y «Después» son los dos primeros hitos sin hacer (<code>hitosPendientes</code>); sin ninguno, «Todo entregado».</>,
          ]}
        />
      </DocSection>

      <DocSection id="mini-calendario" title="Calendario pequeño" lead="El mes de un vistazo para un resumen, como Google Calendar: cada día es un bloque con lo que tiene escrito en pequeño (hitos, cobros, tareas) en el tinte de su collab, y crece hasta llenar su bloque. Es el MiniCalendario del madre con los eventos de la agenda.">
        <Example className={EXAMPLE} code={`<Block>
  <BlockHeader title="Calendario" href="/workspace/contenidos/planificacion" />
  <MiniCalendario eventos={eventos} hoy={hoy} hrefDia={(dia) => "/workspace/contenidos/planificacion?dia=" + dia} />
</Block>`}>
          <Block className="h-[30rem] w-full max-w-md">
            <BlockHeader title="Calendario" href="#" />
            <MiniCalendario className="flex-1" eventos={eventosDeCollabs(demoCollabs, demoMarcas)} hoy={HOY} />
          </Block>
        </Example>
        <Rules
          items={[
            <>Dos cosas escritas por día y «+N», que lleva a ese día en el calendario completo; el nombre entero, al pasar el ratón. Las hechas, tachadas y atenuadas. Cinco o seis semanas, las que pida el mes.</>,
            <>Para operar (mover, crear) está el calendario completo: este solo enseña y lleva a su sitio.</>,
          ]}
        />
      </DocSection>

      <DocSection id="profile" title="Tarjeta del perfil" lead="Foto, nombre, nicho y tramo; arriba a la derecha sus enlaces y, debajo, las views medias y la interacción de la red elegida. Al pie, una ficha por red con sus seguidores (al pulsarla, las cifras pasan a ser las suyas) y el media kit.">
        <Example className={EXAMPLE} code={`<ProfilePanel
  name={profile.name} handle={profile.handle} photoUrl={profile.photoUrl}
  niche="Skincare y maquillaje" tier="50K–100K" city="Valencia"
  accounts={profile.accounts} href="/workspace/perfil"
  links={<LinkRow links={links} onChange={setLinks} editing={editing} onEditingChange={setEditing} />}
  actions={<ProfileTile icon={<FileTextIcon />} label="Media kit" detail="Ver el PDF" asChild><a href="/media-kit" /></ProfileTile>}
/>`}>
          <ProfilePanelExample />
        </Example>
        <Rules
          items={[
            <>Abre en la red con más seguidores. La interacción solo sale si la red la tiene.</>,
            <>Las fichas del pie (cada red y el media kit, con <code>ProfileTile</code>) crecen hasta llenar la tarjeta: junto a las cifras, a la misma altura, no queda hueco.</>,
            <>Por debajo de 448 px de tarjeta, los enlaces y las cifras bajan bajo el nombre. En la tarjeta caben cuatro enlaces a la vista (<code>LinkRow max={4}</code>).</>,
          ]}
        />
      </DocSection>

      <DocSection id="notice" title="Avisos" lead="El que más importa (una oportunidad de la red) va en una tarjeta ancha: el logotipo, el antetítulo con su punto verde, la marca y la collab de título, lo que se pide en pastillas y la acción; a la derecha, el mosaico de productos, la tarjeta del producto y la pastilla de cristal con el fee. Los demás, en el desplegable de la campana (`PanelAvisos`: sin leer y todos, marcar todo como leído y el engranaje) o en lista, con el punto y la negrita si no están leídos.">
        <Example className={EXAMPLE} code={`<NoticeHighlight
  eyebrow="Nueva oportunidad de Astratic"
  title="Nuura - Lanzamiento del champú sólido"
  chips={["1 reel", "3 stories", "del 20 al 31 de octubre"]}
  producto={{ titulo: "Lanzamiento del champú sólido", detalle: "Nuura · Instagram", etiqueta: "Nuevo" }}
  cifra={{ etiqueta: "Fee", valor: "880 €" }}
  accion={{ etiqueta: "Revisar la propuesta", href: "…" }}
/>
<NoticeItem icon={MessageSquareWarningIcon} title="Maison Vero ha pedido cambios" meta="hace 1 hora" unread href="…" />`}>
          <div className="flex w-full flex-col gap-4">
            <NoticeHighlight
              eyebrow="Nueva oportunidad de Astratic"
              title="Nuura - Lanzamiento del champú sólido"
              chips={["1 reel", "3 stories", "del 20 al 31 de octubre"]}
              producto={{ titulo: "Lanzamiento del champú sólido", detalle: "Nuura · Instagram", etiqueta: "Nuevo" }}
              cifra={{ etiqueta: "Fee", valor: "880 €" }}
              accion={{ etiqueta: "Revisar la propuesta", href: "#" }}
            />
            <Block className="max-w-sm">
              <BlockHeader title="Avisos" count={2} href="#" hrefLabel="Ver todos" />
              <ul className="flex flex-col">
                <li>
                  <NoticeItem icon={MessageSquareWarningIcon} title="Maison Vero ha pedido cambios en el reel" description="2 notas en la V1" meta="hace 1 hora" unread href="#" />
                </li>
                <li>
                  <NoticeItem icon={CircleCheckIcon} title="Lumea Skin ha aprobado el guion" meta="ayer" href="#" />
                </li>
              </ul>
            </Block>
          </div>
        </Example>
      </DocSection>

      <DocSection id="links" title="Directorio de enlaces" lead="Los enlaces de uso diario en mosaico, con el icono de su web. En modo edición se ordenan arrastrando, se editan y se borran con confirmación. Son LinkGrid y LinkRow del madre, tal cual, dentro de un bloque del hijo.">
        <Example className={EXAMPLE} code={`const [links, setLinks] = useState(initial)
const [editing, setEditing] = useState(false)

<LinkGrid links={links} onChange={setLinks} editing={editing} />`}>
          <LinkGridExample />
        </Example>
        <Example className={EXAMPLE} code={`// En la cabecera de una página: los cinco primeros, «+N» y el lápiz
<LinkRow links={links} onChange={setLinks} editing={editing} onEditingChange={setEditing} />`}>
          <LinkRowExample />
        </Example>
        <Prose>
          <p>
            El icono sale del servicio de favicons de Google a partir del dominio; si la dirección no es válida, la
            inicial del nombre. Nuevo y editar comparten el mismo diálogo (react-hook-form + zod); borrar pide
            confirmación y el toast ofrece deshacer. <code>LinkRow</code> es la misma lista en una fila de iconos para la
            cabecera del Inicio: cinco a la vista, «+N» despliega el resto y el lápiz abre este directorio en un diálogo.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="tabbar" title="Barra inferior del móvil" lead="Las cinco páginas principales, fijas abajo, por debajo de md. La sidebar heredada sigue mandando en pantallas medianas y grandes.">
        <Prose>
          <p>
            <code>MobileTabBar</code> recibe las mismas entradas que la sidebar (<code>workspaceTabs</code> en{" "}
            <code>app/workspace/nav.ts</code> de la app del workspace) y marca la activa por la ruta. Se ve con el navegador por
            debajo de 768 px. Las páginas llevan <code>pb-28 md:pb-10</code> para que no tape el final.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="operar" title="Piezas de operar" lead="Las páginas donde se trabaja (el CRM, la ficha de collab, la pieza) usan la anatomía del madre tal cual, como el CRM del Portal Astratic, más estas piezas propias.">
        <Prose>
          <p>
            Regla de los dos registros: lo que resume y las cifras de arriba van en el estilo visual del hijo; el bloque
            donde se trabaja es el del madre sin adornos: <code>WorkGrid</code>, la <code>BaseDatos</code> al estilo Airtable,{" "}
            <code>InsightsPanel</code> y <code>DetailSheet</code>. Lo que no
            existía en el madre y hacía falta para operar nace aquí.
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

      <DocSection id="task-table" title="Lista de tareas de un sitio" lead="Las tareas de una campaña, una de sus pestañas, una pieza, una propuesta o una marca, en la lista de operar: agrupadas por cuándo tocan, con alta rápida que ya nace en su sitio y la barra de acciones al seleccionar. Es una vista de la misma base que la página de Tareas.">
        <Example className={EXAMPLE} code={`<TaskTable
  tareas={tareasDe(todas, { collabId: "lumea", tipo: "contenidos" })}
  todas={todas} hoy="2026-10-06" ctx={ctx} etiquetas={etiquetas}
  donde={{ tipo: "collabs", collabId: "lumea" }}
  acciones={acciones}   // onAbrir, onToggle, onCrear, onGuardarVarias, onBorrarVarias…
/>`}>
          <TaskTableExample />
        </Example>
        <Rules
          items={[
            <>Cada tarea tiene <strong>un tipo</strong> (<code>DondeTarea</code>), que es la página en la que sale además de en Tareas: <strong>Sin tipo</strong> (general, la de por defecto, solo en Tareas y el Inicio), CRM, Collabs, Contenido o Cobros. En Collabs y Cobros puede ser de una campaña (y, desde Contenidos, de una pieza); en el CRM, de una propuesta, una marca o un contacto. Siempre se puede no concretar: «Sin campaña». Lo que se hace lo dice el título.</>,
            <>Una sola base de tareas: cada página enseña su trozo con <code>tareasDe(tareas, filtro)</code> y lo que se crea ahí nace con su <code>donde</code>, así que sale en su página y en Tareas.</>,
            <><code>TaskDialog</code> es el alta de toda la app: «Tipo» y, debajo, la campaña o la ficha del CRM si el tipo la tiene (<code>SelectorTipo</code> y <code>SelectorDeQue</code>). Nace sin tipo; con <code>dondeInicial</code>, con el de la página desde la que se crea; con <code>dondeFijo</code> no pregunta; con <code>plantilla</code> llega rellena y con sus subtareas.</>,
            <>Los cambios pasan por <code>lib/influencer/tareas-cambios.ts</code> (guardar apuntando la actividad, la siguiente de una que se repite, borrar con sus subtareas, deshacer, colocar a mano).</>,
          ]}
        />
      </DocSection>

      <DocSection id="tareas" title="Página de Tareas" lead="Las piezas de la página de Tareas, que replica una base de datos de Notion: lo de hoy primero, compacto, y debajo todas las tareas en dos bloques, una vista a elegir al lado (plegable) y la base con sus vistas.">
        <Rules
          items={[
            <><code>TareasHoy</code>, compacto para que quepa la base debajo (Xavier, 2026-10-16: como mucho un tercio de la pantalla; lo que no cabe se desvanece y «Ver todas» lo despliega): cabecera con el día y los atajos a mañana, esperando y esta semana; filas de una línea con las vencidas arriba («Pasar todo a hoy») y lo de hoy por importancia (<code>ordenarHoy</code>), reordenable arrastrando, cada dato en su columna (icono, título, de dónde es, etiquetas, prioridad y cuándo); las hechas de hoy, plegadas.</>,
            <><strong>Icono de cada tarea</strong> (<code>task-icono.tsx</code>, Xavier 2026-10-16): <code>IconoDeTarea</code> en su cuadradito del tinte de su página (<code>TINTE_DE_TIPO</code>); de serie, el de la automatización que la creó (feedback, guion, publicar, factura…) o el de su tipo (<code>iconoDeTarea</code>); <code>SelectorIconoTarea</code> deja elegir otro de <code>ICONOS_TAREA</code> en la fila de Hoy y en la ficha, con «Volver al de serie».</>,
            <><strong>Filtro rápido</strong> (<code>FiltrosRapidosTareas</code>, encima de Hoy): una fila sutil, solo icono y texto (sin cápsulas; la elegida en negro con su raya), con la página de la que son (Todas, Generales, CRM, Collabs, Contenido, Cobros) y cuántas abiertas tiene cada una. Recorta Hoy y la base a la vez (<code>pasaFiltroRapido</code>). Sin etiquetas desde el 2026-10-19: se filtran en la base.</>,
            <>Subtareas: toda tarea que las tiene lleva su flechita con el progreso (<code>BotonSubtareas</code>) en Hoy, la lista, el tablero y la tabla; al desplegarla salen en pequeño (<code>MiniSubtareas</code>) para marcarlas sin abrir la ficha. Al hacer la última, un aviso ofrece dar por hecha la tarea.</>,
            <>Se añaden ya en el alta (Xavier, 2026-10-15) con <code>EditorSubtareas</code>: una lista que se escribe, Intro añade la siguiente y borrar una vacía vuelve a la anterior. La misma lista sirve en las plantillas y en las automatizaciones. La vista de serie «Subtareas» (<code>madre</code>, «Tarea principal») las enseña agrupadas por su tarea; llega también a quien ya tenía sus vistas (<code>VistaDeSerie.nueva</code> y <code>ConfigBase.ofrecidas</code> en <code>lib/base/vistas.ts</code>).</>,
            <>Campos propios (<code>CampoTarea</code>: texto, número, fecha, selección, selección múltiple, casilla o enlace) en <code>Tarea.valores</code>: se crean y editan con <code>CampoTareaDialog</code> desde la ficha («+ Nuevo campo», o pulsando su nombre) o desde «Propiedades», y entran en filtros, orden, grupos y columnas (<code>idCampoPropio</code>, <code>CampoPropioInline</code>).</>,
            <>La página de Tareas es una <code>BaseDatos</code> (<code>base-tareas.ts</code>) con <code>CalendarioTareas</code> en su lateral (mes o semana, por fecha o por fecha límite, arrastrar a otro día, «+» en un día y «Sin fecha»).</>,
            <><code>TareasLista</code>: las tareas dentro de una ficha (<code>TaskTable</code>): grupos plegables con su «+», subtareas anidadas y arrastre por el asa (cambia su valor con <code>asignarCampo</code>).</>,
            <><code>TaskSheet</code> / <code>TareaDetalle</code>: la ficha, con una sola lista de campos editables (tipo y campaña o ficha primero, después estado, prioridad, fechas, etiquetas y los campos propios, con «+ Nuevo campo»), «Para hacerla» (<code>TareaContexto</code>, si es de una campaña o una ficha), subtareas, descripción, comentarios y actividad.</>,
            <>Celdas comunes en <code>task-cells.tsx</code>: <code>CasillaTarea</code>, <code>PrioridadIcono</code>, <code>EstadoTareaBadge</code>, <code>DondeChip</code>, <code>FechaTarea</code>, <code>EtiquetasTarea</code>, <code>ProgresoSubtareas</code>, <code>EsperandoDias</code>.</>,
            <><strong>Repetir</strong> (<code>SelectorRepeticion</code> con <code>EditorRepeticion</code>, en la ficha y en el alta): atajos y, debajo, cada cuántos días, días laborables, semanas, meses o años; los días de la semana; el día del mes («el día 13», «el segundo martes», «el último viernes»); si se cuenta desde su fecha o desde que se hace; y si termina un día o tras N veces. Se guarda una vez, al cerrar. La lógica, en <code>siguienteRepeticion</code>.</>,
            <><strong>Colores</strong> (Xavier, 2026-10-13): cada una elige por qué se pintan las tareas del calendario (urgencia, prioridad, primera etiqueta, marca de la campaña o nada) y el color de cada tramo de urgencia (vencida, hoy, los próximos N días, más adelante, sin fecha) en <code>ColoresTareasDialog</code>, desde «Colores» en la cabecera del bloque. De serie, por urgencia: vencida en rojo y hoy y los tres días siguientes en verde, sin los tintes de las marcas. Las fechas de las listas (<code>FechaTarea</code>) siguen siempre la urgencia. Lo reparte <code>ColoresTareasProvider</code>; la lógica, en <code>lib/influencer/colores-tareas.ts</code>.</>,
          ]}
        />
      </DocSection>

      <DocSection id="automatizaciones" title="Automatizaciones" lead="«Cuando pasa esto, se crea una tarea o un registro», por bloque: una propuesta que pasa a Ganada crea la collab; una collab nueva, una tarea por contenido en su fecha, el contrato y la factura; un comentario de la marca, la tarea «Nuevo feedback» con cada comentario como subtarea.">
        <Rules
          items={[
            <>El motor es puro (<code>lib/influencer/automatizaciones.ts</code>): <code>EVENTOS</code> (los estados de la propuesta y de la collab, la collab nueva y lo que hace la marca), cada uno de un bloque (<code>BLOQUES_AUTOMATIZABLES</code>); <code>planificar</code> saca de lo que ha pasado las tareas y los registros de sus reglas activas, y <code>aplicarPlan</code> los aplica a la lista sin duplicar nada (cada tarea lleva su <code>clave</code>: regla y registro).</>,
            <>Una regla tiene un evento y una acción: una tarea (título con variables como <code>{"{marca}"}</code>, días antes o después de una fecha, prioridad, página en la que sale y subtareas; una por cada contenido o, en el feedback, una por versión con cada comentario como subtarea) o un registro (la collab desde una propuesta, el contrato desde una collab).</>,
            <>Cada persona tiene las suyas; sin tocarlas, las de serie (<code>AUTOMATIZACIONES_DE_SERIE</code>). Las de serie se cambian, se apagan o se borran, y «Restaurar por defecto» las devuelve por bloque (<code>restaurarDeSerie</code>, <code>difiereDeSerie</code>).</>,
            <><code>AutomatizacionesBloque</code> es la lista de un bloque, con su interruptor, lo que la dispara y lo que hace, «Nueva automatización» y «Restaurar por defecto»; <code>AutomatizacionFormulario</code>, el formulario de una, en una pantalla de <code>FormularioDialog</code>.</>,
            <>En el portal, lo que hace ella se dispara en el navegador (la tarea sale al momento y el aviso dice cuántas) y lo que hace la marca, en el servidor.</>,
          ]}
        />
      </DocSection>

      <DocSection id="agenda" title="Agenda" lead="Mes con los hitos de cada pieza (guion, grabación, V1, publicación, resultados), los cobros y las tareas con fecha, cada uno con el tinte de su collab. En el móvil, la lista del mes. Es la Agenda del madre: eventoDeCalendario le da a cada evento su tipo, su marca y su tinte.">
        <Example className={EXAMPLE} code={`const eventos = [...eventosDeCollabs(collabs, marcas), ...eventosDeTareas(tareas, collabs)]
<Agenda eventos={eventos} hoy={hoy} />`}>
          <Agenda eventos={eventosDeCollabs(demoCollabs.slice(0, 2), demoMarcas)} hoy={HOY} className="w-full" />
        </Example>
      </DocSection>

      <DocSection id="media-kit" title="Media kit" lead="El media kit en hojas A4, con los bloques que ella elige y en su orden, repartidos sin partir ninguno. Es el mismo en el editor, en /media-kit y en cada propuesta.">
        <Example className={EXAMPLE} code={`<DocViewer pages={hojasMediaKit(bloques, { perfil, kit, marcasTrabajadas: marcas })}>
  <MediaKitHojas perfil={perfil} kit={kit} bloques={bloquesVisibles(kit, { conPrecios })} marcasTrabajadas={marcas} logos={logos} pie="Marta Albiol · Media kit" />
</DocViewer>`}>
          <div className="theme-light flex w-full justify-center overflow-hidden rounded-xl bg-muted p-4">
            <div className="flex flex-col gap-4 [zoom:0.45]">
              <MediaKitHojas perfil={demoPerfil} kit={obtenerMediaKit()} bloques={bloquesVisibles(obtenerMediaKit()).slice(0, 4)} marcasTrabajadas={marcasTrabajadas()} pie={`${demoPerfil.nombre} · Media kit`} />
            </div>
          </div>
        </Example>
      </DocSection>

      <DocSection id="pieza" title="Tarjeta de pieza" lead="Una pieza en la lista de contenidos: la fecha de publicación delante, la miniatura, el estado, qué toca y en qué versión va cada parte. Compacta, en la barra lateral con sus partes como enlaces.">
        <Example className={EXAMPLE} code={`<PiezaCard pieza={pieza} tint={collab.tint} hoy={hoy} href="…/contenidos/vero-reel" />
<PiezaCard pieza={pieza} tint={collab.tint} hoy={hoy} href="…" compacta activa parteActiva="media" />`}>
          <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_264px]">
            <div className="flex flex-col gap-2">
              <PiezaCard pieza={demoCollabs[2].piezas[0]} tint="peach" hoy={HOY.slice(0, 10)} href="#" />
              <PiezaCard pieza={demoCollabs[0].piezas[2]} tint="rose" hoy={HOY.slice(0, 10)} href="#" />
            </div>
            <PiezaCard pieza={demoCollabs[2].piezas[0]} tint="peach" hoy={HOY.slice(0, 10)} href="#" compacta activa parteActiva="media" />
          </div>
        </Example>
      </DocSection>

      <DocSection id="gantt" title="Cronograma (Gantt)" lead="Una fila por pieza con sus fases (guion, grabación, edición, revisión, resultados) entre sus hitos, el rombo de la publicación y la línea de hoy. Arrastrar una fila (o las flechas con ella enfocada) mueve la publicación y todas sus fases. Es el Gantt del madre con las fases en su tinte, «Pieza» de columna y la publicación de hito.">
        <Example className={EXAMPLE} code={`<Gantt
  hoy={hoy}
  filas={piezas.map((p) => ({ id: p.id, titulo: p.titulo, fases: fasesDePieza(p), publicacion: p.publicacion }))}
  onMover={(id, dias) => …}
  onAbrir={(id) => router.push(…)}
/>`}>
          <GanttExample />
        </Example>
        <Rules
          items={[
            <>Las fases salen de <code>fasesDePieza</code> (<code>lib/influencer/cronograma.ts</code>), con la misma regla que las tareas automáticas: guion 10 días antes, grabación 7, v1 5, publicación y resultados 7 después.</>,
            <>Cada fase con su tinte (por tipo de trabajo, nunca por estado); hecha, atenuada con su check; tarde, con el filo en rojo.</>,
            <>En el móvil se desliza en horizontal con los nombres fijos; escala «Días» o «Semanas».</>,
          ]}
        />
      </DocSection>

      <DocSection id="editor" title="Editor de texto" lead="El editor del workspace (Tiptap, de código abierto): guiones, brief, contratos y conclusiones. Títulos, listas, citas, resaltado, enlaces y alineación; notas de la marca marcadas sobre el texto; variables de contrato como fichas; recuento de palabras.">
        <Example className={EXAMPLE} code={`<EditorTexto
  value={html} onChange={setHtml}
  notas={[{ id, numero: 1, cita: "Fórmula con retinal al 0,1 %", resuelta: true }]}
  variables={{ valores, verDatos, etiqueta }}   // contratos: {{collab.importe}} como ficha
  pie={({ palabras }) => …}
/>`}>
          <EditorGuionExample />
        </Example>
        <Rules
          items={[
            <>Se carga bajo demanda (<code>editor-texto.tsx</code> con <code>next/dynamic</code>): solo pesa en las páginas que escriben.</>,
            <>Lo mismo se escribe y se lee: <code>editable={"{false}"}</code> es la vista de la marca, con las mismas clases de <code>PROSA</code>.</>,
            <>Variables: <code>{"<span data-variable=\"collab.importe\">"}</code> en el HTML, ficha en pantalla, el dato al «Ver con los datos»; escribir <code>{"{{clave}}"}</code> la crea.</>,
          ]}
        />
      </DocSection>

      <DocSection id="sugerencias" title="Sugerencias de cambio en el texto" lead="Como el modo sugerencia de Google Docs: quien revisa escribe encima del guion o del copy sin cambiar el original; lo borrado queda tachado y lo nuevo resaltado, y cada cambio es una sugerencia que la creadora acepta o rechaza.">
        <Example className={EXAMPLE} code={`<EditorTexto value={original} editable sugerir={{ pendientes, onCambios: ({ original, tramos }) => sincronizarSugerencias(original, tramos, abiertas) }} />
<EditorTexto value={original} editable={false} sugerencias={marcas} notaSeleccionada={id} onSeleccionarNota={setId} />`}>
          <SugerenciasGuionExample />
        </Example>
        <Rules
          items={[
            <>El original no cambia: <code>sugerir</code> lo compara con lo escrito (<code>tramosDeCambio</code>, palabra a palabra) y cada cambio se ancla al original con su cita y lo que la rodea (<code>lib/revision-sugerencias.ts</code>).</>,
            <>Borrar una frase y escribir otra es un solo «Reemplazar»; seguir escribiendo en una sugerencia la cambia y deshacerla la retira (<code>sincronizarSugerencias</code>).</>,
            <>Aceptar aplica el cambio a la versión siguiente (<code>aplicarCambiosHtml</code>, sin pantalla). Lo que ya no encuentra su sitio se avisa.</>,
          ]}
        />
      </DocSection>

      <DocSection id="notas-video" title="Notas sobre el vídeo" lead="Como en Frame.io: un reproductor con play y pausa, y quien revisa pulsa en un punto del vídeo para dejar ahí una nota en ese segundo; con el tick se guarda y el vídeo sigue. Elegir una nota lleva el vídeo a su fotograma con la nota encima.">
        <Example className={EXAMPLE} code={`<ReproductorNotas videoUrl={url} portadaUrl={portada} ancho={280} notas={notas} seleccionada={id} onSeleccionar={setId} onAnotar={({ segundo, x, y, texto }) => …} />`}>
          <ReproductorNotasExample />
        </Example>
      </DocSection>

      <DocSection id="revision" title="Revisión: visor y conversación" lead="Como la revisión de Feedback: el contenido sobre un lienzo con sus versiones, comparar con la anterior y zoom; las notas de la marca en su sitio (segundo del vídeo o punto de la foto), y la conversación con el progreso de las notas.">
        <Example className={EXAMPLE} code={`<VisorMedia version={v} anterior={comparar ? previa : null} medio="video" notas={v.notas} zoom={100} onMarcar={…} />
<Conversacion notas={v.notas} mensajes={v.mensajes} lado="influencer" onResolver={…} onResponder={…} onEnviar={…} />`}>
          <RevisionExample />
        </Example>
        <Example className={EXAMPLE} code={`<VisorMedia version={carrusel} medio="imagen" notas={notas} zoom={75} />`}>
          <FotosExample />
        </Example>
        <Prose>
          <p>
            En la pieza, junto al guion o al vídeo, y en lo que ve la marca con el enlace de revisión. Son <code>VisorMedia</code> y <code>Conversacion</code> del madre (<a href="/ds/componentes/revision">Revisión con notas</a>) con el tinte de la marca de fondo, el estado de cada versión y los textos que hablan de la marca: ella hace la pieza. <code>lado="marca"</code> deja escribir notas ancladas; <code>lado="influencer"</code>, resolverlas, contestar y escribir a la marca.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="marca" title="Para la marca, sin cuenta" lead="Las piezas de lo que se manda por enlace: el formulario rápido de piezas, compartir el enlace y la página de la marca.">
        <Example className={EXAMPLE} code={`<PlataformasEditor value={plataformas} onChange={setPlataformas} />\n<PiezasEditor value={piezas} onChange={setPiezas} plataformas={plataformas} condiciones={tipos} hoy={hoy} campana="Rutina de noche" />`}>
          <PiezasEditorExample />
        </Example>
        <Rules
          items={[
            <><code>PlataformasEditor</code>: dónde se publica la campaña. Instagram, TikTok y YouTube a la vista, «Más plataformas» con el resto del marketing de influencers y «Otra» para escribir la que falte; en píldoras, se eligen varias. <code>SelectorPlataforma</code> elige la de un formato e <code>IconoPlataforma</code> pinta su icono.</>,
            <><code>PiezasEditor</code> (en pantalla, «Entregables»): arriba, sin recuadro, un atajo por cada formato de las <code>plataformas</code> elegidas y «Más formatos» (todos, o uno nuevo escribiéndolo). Cada entregable es una tarjeta: el icono de su formato con el de su plataforma (se pulsa para cambiarlo), su nombre de serie con la campaña («Reel · Otoño», se cambia al momento), su importe con <code>conImporte</code> y, en la franja de abajo, «Publica el», «Script el …» con su día (de serie, unos días antes de publicar; «Sin script» en su calendario lo quita), sus condiciones en línea (<code>CondicionesEditor</code>) e «Indicaciones».</>,
            <><code>CondicionesEditor</code>: cada condición es su icono y sus días (el nombre, al pasar por encima), en una sola fila que se desplaza con el borde difuminado si no caben. El «+» abre la lista para escribir, elegir (sale con sus días de serie) o quitar las marcadas; con <code>onNuevoTipo</code>, la que no existe se crea encima con <code>CondicionFormulario</code> (nombre, icono y días de serie). <code>SelectorIconoCondicion</code> cambia el icono desde una fila de los ajustes. Con <code>onNuevoFormato</code> y <code>onEditarFormato</code>, el formato que falta se crea o se cambia encima (<code>FormatoPiezaFormulario</code>). Lo usan el formulario de la marca, «Nueva collab» y «Añadir piezas».</>,
            <><code>CompartirEnlace</code> y <code>CompartirEnlaceDialog</code>, del madre: copiar, WhatsApp, email desde su correo y, con <code>verComo=&quot;Ver como la marca&quot;</code>, abrirlo como lo verá. Revisión, formulario, contrato e informe se mandan igual.</>,
            <><code>PaginaMarca</code>: la página sin cuenta (cabecera con el logotipo de Astratic, lo que es y para quién y la creadora; pie con la privacidad y la firma de Astratic; <code>acciones</code> para botones junto al tema). <code>LogoAstratic</code> y <code>SelloAstratic</code> (con <code>ASTRATIC_URL</code> de <code>lib/influencer/astratic.ts</code>): el logotipo y la firma «Gestionado con» que llevan a la web de Astratic, en lo que ve la marca y en los documentos. <code>InvitacionDevs</code>: el recuadro discreto de Astratic Network Devs al compartir o descargar en lo que ve la marca (sirve de <code>DropdownMenuItem asChild</code>). <code>ZonaSubida</code>, del madre: soltar o elegir archivos.</>,
            <><code>Firmas</code> (contrato) y <code>ResumenResultados</code>, <code>CifrasPieza</code> y <code>Capturas</code> (informe): las mismas en el workspace y en la página de la marca.</>,
          ]}
        />
        <Prose>
          <p>
            <code>ThemeBody</code> pone la clase del tema en <code>&lt;body&gt;</code> mientras la página está montada:
            sin ella, las fichas, diálogos y menús (que se pintan en un portal fuera del shell) saldrían con los tokens
            del madre y sin tintes. Va una vez en el shell del workspace y en <code>PaginaMarca</code>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="contenidos" title="Contenidos: ideas y planificación" lead="Las piezas de Contenidos: el directorio de ideas y notas (en carpetas que van unas dentro de otras), que es una base de Notion con galería, y la planificación de lo que publica, de las collabs y propio, en un mismo calendario. Un contenido propio es un espacio de trabajo, no un formulario: un guion y un caption.">
        <Example className={EXAMPLE} code={`<CapturaIdea onApuntar={apuntar} onImagen={conCaptura} onNota={nuevaNota} destino="Tendencias" />
<ApunteCard apunte={a} estado={estadoDeIdea(a, contenidos)} pilar={pilar} hoy={hoy} propiedades={vista.propiedades} onAbrir={abrir} onFavorito={favorita} accion={<BotonPlanificar />} />`}>
          <div className="grid w-full gap-4">
            <CapturaIdeaExample />
            <GaleriaIdeasExample />
          </div>
        </Example>
        <Example className={EXAMPLE} code={`<DndContext onDragEnd={alSoltar}>
  <CalendarioContenidos entradas={entradas} hoy={hoy} ancla={ancla} modo="semana" onAbrir={abrir} onNuevo={planificarEse} />
</DndContext>`}>
          <CalendarioContenidosExample />
        </Example>
        <Example className={EXAMPLE} code={`<AgendaContenidos entradas={entradas} hoy={hoy} desde={hoy} dias={14} onAbrir={abrir} onNuevo={planificarEse} />`}>
          <AgendaContenidosExample />
        </Example>
        <Example className={EXAMPLE} code={`<EditorCaption valor={contenido} onCambiar={(cambio) => guardar({ ...contenido, ...cambio })} />
<AntesDePublicar pasos={antesDePublicar(contenido)} onIr={irASeccion} />`}>
          <CaptionExample />
        </Example>
        <Rules
          items={[
            <><code>ApunteCard</code>: una idea o una nota en la galería (portada con la imagen que elija, el principio del texto o el tinte de su pilar), con las propiedades que pide la vista y la caducidad siempre. La estrella, la casilla y la acción no abren la ficha. <code>COLUMNAS_GALERIA</code> da el tamaño de tarjeta de la vista.</>,
            <><code>CapturaIdea</code>: apuntar en cinco segundos, con texto o un enlace (la red sale del dominio) o con una captura.</>,
            <>Las carpetas son las del madre (<code>CarpetasBloque</code> con <code>lib/carpetas.ts</code>: cada una sabe su madre y su <code>orden</code> entre sus hermanas), con el tinte de cada una y los atajos Todo, Favoritas y Sin carpeta. Una carpeta enseña también lo de las que lleva dentro; al borrarla, lo suyo sube a su madre. Las notas se enlazan con ideas (<code>VinculoApunte</code>, <code>enlazar</code>). Lo que se adjunta usa los tipos de los materiales (<code>tipoDeArchivo</code>, <code>ICONOS_MATERIAL</code>).</>,
            <><code>CalendarioContenidos</code> (mes o semana, sobre el <code>CalendarioPeriodo</code> del madre) y <code>AgendaContenidos</code> (lista con los huecos libres): pintan <code>EntradaCalendario</code> de <code>lib/influencer/planificacion.ts</code>, sea contenido propio, pieza de collab (con candado: fecha pactada), hito, tarea, cobro o fecha clave. El calendario no pone su <code>DndContext</code>: lo pone la página para poder soltar ideas de fuera.</>,
            <><code>EditorCaption</code>: un solo texto con los hashtags dentro; cuenta lo que admite cada red (Instagram, 2.200 caracteres y 5 hashtags), enseña lo que se ve antes de «más» y avisa de la publicidad sin marcar. <code>AntesDePublicar</code>: lo que falta, poco y útil.</>,
            <><code>Teleprompter</code>: el guion a pantalla completa, con velocidad, tamaño de letra y espejo, para leerlo desde otro dispositivo al grabar.</>,
          ]}
        />
      </DocSection>

      <DocSection id="completar-perfil" title="Completar el perfil" lead="Fijo al pie de la sidebar (prop sidebarExtra de AppShell) hasta que esté todo: el progreso, el siguiente paso a un clic y, al pulsar el progreso, todos los pasos. No se puede quitar: se va solo al acabar. Con la sidebar plegada, un anillo con el mismo desplegable.">
        <Example className={EXAMPLE} code={`<AppShell … sidebarExtra={<CompletarPerfil pasos={primerosPasos(datos)} />}>`}>
          <div className="w-64">
            <CompletarPerfil
              pasos={primerosPasos({ perfil: demoPerfil, acuerdo: demoAcuerdo, fiscales: demoDatosFiscales, envio: demoDatosPersonales.envio, capitulos: demoCapitulosBiblia, lecturas: demoLecturasBiblia, tieneTarifas: true, marcasPropias: 0, instagramConectado: false, trabajoContado: false })}
            />
          </div>
        </Example>
        <Rules
          items={[
            <>Cada paso sale hecho o no <strong>de los datos</strong> (<code>primerosPasos</code>), nunca se marca a mano. Los que se hacen en la bienvenida llevan a su paso (<code>/bienvenida?paso=…</code>); el resto, a su página.</>,
            <>Sustituye a los primeros pasos que iban arriba del Inicio (Xavier, 2026-10-16: «que salga en el sidebar propio, así lo tiene siempre ahí»). No sale en el workspace propio de Astratic, sí en un perfil de prueba.</>,
          ]}
        />
      </DocSection>

      <DocSection id="asistente" title="Asistente por pasos" lead="El marco de la bienvenida: ocupa la pantalla, con el logotipo y la salida arriba, los pasos en vertical a la izquierda (hecho, para más tarde, el de ahora, pendiente) y cada paso en un bloque con su título, una frase de por qué y la fila de botones. En el móvil, una barra de progreso por tramos.">
        <Example className={EXAMPLE} code={`<AsistenteMarco logo={<DocLogo devs={false} />} pasos={pasos} salida={<Button variant="ghost" size="sm">Ir a mi workspace</Button>}>
  <AsistentePaso etiqueta="Cómo trabajas" titulo="Qué collabs te encajan" descripcion="…" pie={<PiePaso … />}>
    <PildorasMultiples opciones={…} valores={…} onChange={…} />
  </AsistentePaso>
</AsistenteMarco>`}>
          <div className="max-h-[560px] overflow-hidden rounded-xl border">
            <AsistenteMarco
              logo={<span className="text-sm font-semibold">Astratic</span>}
              pasos={[
                { id: "inicio", titulo: "Bienvenida", estado: "hecho", href: "#" },
                { id: "perfil", titulo: "Tu perfil", estado: "saltado", href: "#" },
                { id: "trabajo", titulo: "Cómo trabajas", estado: "actual", href: "#" },
                { id: "tarifas", titulo: "Tus tarifas", estado: "pendiente", href: "#" },
              ]}
              salida={<Button variant="ghost" size="sm">Ir a mi workspace</Button>}
            >
              <AsistentePaso etiqueta="Cómo trabajas" titulo="Qué collabs te encajan" descripcion="Con esto te proponemos solo campañas que aceptarías." pie={<><span /><Button>Continuar</Button></>}>
                <PildorasEjemplo />
              </AsistentePaso>
            </AsistenteMarco>
          </div>
        </Example>
        <Rules
          items={[
            <>Un paso, una pregunta grande: lo que se pide se entiende sin explicación y nada es obligatorio. Lo que se puede dejar lleva «Lo haré más tarde» y sale «Para más tarde» en el riel.</>,
            <>Al continuar se guarda lo del paso con las acciones de siempre de su página (perfil, tarifas, CRM, ajustes): el asistente no tiene datos propios salvo lo que no vive en otro sitio.</>,
            <>Opciones cortas en píldoras (<code>PildorasOpcion</code> y <code>PildorasMultiples</code> del madre); lo elegido, con filo y en negrita, y con su check si se eligen varias.</>,
          ]}
        />
      </DocSection>

      <NextLinks
        links={[
          { href: "/ds/influencer/patrones", label: "Página de inicio", text: "Cómo se juntan estas piezas en la primera página." },
          { href: "/ds/influencer/operar", label: "Páginas de operar", text: "Propuestas, Collabs, la ficha de collab, la pieza y la revisión." },
        ]}
      />
    </DocPage>
  )
}
