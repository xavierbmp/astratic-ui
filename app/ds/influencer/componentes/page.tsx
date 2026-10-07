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
import { describirEntregables, siguienteHito, unidadesHechas, unidadesTotales } from "@/lib/influencer/collabs"
import { Button } from "@/components/ui/button"
import { Block, BlockHeader } from "@/components/influencer/block"
import { StatRow, StatTile } from "@/components/influencer/stat-tile"
import { CollabCard, CollabCardRow } from "@/components/influencer/collab-card"
import { ProfilePanel } from "@/components/influencer/profile-panel"
import { NoticeHighlight, NoticeItem } from "@/components/influencer/notice-card"
import { LinkGridExample, TaskBlockExample, TaskTableExample } from "@/components/docs/examples/influencer-examples"
import { EditorGuionExample, FotosExample, GanttExample, PiezasEditorExample, RevisionExample } from "@/components/docs/examples/collabs-examples"
import { AgendaContenidosExample, CalendarioContenidosExample, CapturaIdeaExample, CaptionExample, GaleriaIdeasExample } from "@/components/docs/examples/contenidos-examples"
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

      <DocSection id="stat" title="Cifra" lead="Icono en un círculo de tinte, número grande y etiqueta. Con href, la tarjeta entera lleva a su página. Solo en las portadas: el Inicio y el Pipeline del CRM.">
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
            <code>app/workspace/nav.ts</code> de la app del workspace) y marca la activa por la ruta. Se ve con el navegador por
            debajo de 768 px. Las páginas llevan <code>pb-28 md:pb-10</code> para que no tape el final.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="operar" title="Piezas de operar" lead="Las páginas donde se trabaja (el CRM, la ficha de collab, la pieza) usan la anatomía del madre tal cual, como el CRM del Portal Astratic, más estas piezas propias.">
        <Prose>
          <p>
            Regla de los dos registros: lo que resume y las cifras de arriba van en el estilo visual del hijo; el bloque
            donde se trabaja es el del madre sin adornos: <code>WorkGrid</code>, <code>FilterBar</code>, <code>Section</code>,{" "}
            <code>Kanban</code>, <code>DataTable</code>, <code>InsightsPanel</code> y <code>DetailSheet</code>. Lo que no
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
            <>Cada tarea tiene <strong>un tipo</strong> (<code>DondeTarea</code>), que es la página en la que sale además de en Tareas: <strong>Sin tipo</strong> (general, la de por defecto, solo en Tareas y el Inicio), CRM, Collabs o Cobros. En Collabs y Cobros puede ser de una campaña (y, desde Contenidos, de una pieza); en el CRM, de una propuesta, una marca o un contacto. Siempre se puede no concretar: «Sin campaña». Lo que se hace lo dice el título.</>,
            <>Una sola base de tareas: cada página enseña su trozo con <code>tareasDe(tareas, filtro)</code> y lo que se crea ahí nace con su <code>donde</code>, así que sale en su página y en Tareas.</>,
            <><code>TaskDialog</code> es el alta de toda la app: «Tipo» y, debajo, la campaña o la ficha del CRM si el tipo la tiene (<code>SelectorTipo</code> y <code>SelectorDeQue</code>). Nace sin tipo; con <code>dondeInicial</code>, con el de la página desde la que se crea; con <code>dondeFijo</code> no pregunta; con <code>plantilla</code> llega rellena y con sus subtareas.</>,
            <>Los cambios pasan por <code>lib/influencer/tareas-cambios.ts</code> (guardar apuntando la actividad, la siguiente de una que se repite, borrar con sus subtareas, deshacer, colocar a mano).</>,
          ]}
        />
      </DocSection>

      <DocSection id="tareas" title="Página de Tareas" lead="Las piezas de la página de Tareas, que replica una base de datos de Notion: lo de hoy primero, compacto, y debajo todas las tareas en dos bloques, una vista a elegir al lado (plegable) y la base con sus vistas.">
        <Rules
          items={[
            <><code>TareasHoy</code>, compacto para que quepa la base debajo: cabecera con el día y los atajos a mañana, esperando y esta semana; filas de una línea con las vencidas arriba («Pasar todo a hoy») y lo de hoy por importancia (<code>ordenarHoy</code>), reordenable arrastrando; seis a la vista y «Ver N más»; las hechas de hoy, plegadas.</>,
            <>Subtareas: toda tarea que las tiene lleva su flechita con el progreso (<code>BotonSubtareas</code>) en Hoy, la lista, el tablero y la tabla; al desplegarla salen en pequeño (<code>MiniSubtareas</code>) para marcarlas sin abrir la ficha. Al hacer la última, un aviso ofrece dar por hecha la tarea.</>,
            <>Campos propios (<code>CampoTarea</code>: texto, número, fecha, selección, selección múltiple, casilla o enlace) en <code>Tarea.valores</code>: se crean y editan con <code>CampoTareaDialog</code> desde la ficha («+ Nuevo campo», o pulsando su nombre) o desde «Propiedades», y entran en filtros, orden, grupos y columnas (<code>idCampoPropio</code>, <code>CampoPropioInline</code>).</>,
            <><code>TareasLista</code>: grupos plegables con su «+», subtareas anidadas, selección y arrastre por el asa para colocar a mano o mover de grupo (lo que cambia su valor, con <code>asignarCampo</code>).</>,
            <><code>TableroTareas</code>: columnas por un campo (el estado, por defecto) y filas por otro (una por campaña); el mismo arrastre que la lista. <code>CalendarioTareas</code>: mes o semana, por fecha o por fecha límite, arrastrar a otro día, «+» en un día y «Sin fecha».</>,
            <><code>columnasTareas</code> da las columnas de la tabla (<code>TablaAgrupada</code> del madre), todas editables en su celda. <code>NombreGrupoTarea</code> pinta la cabecera de un grupo según el campo (estado, prioridad, campaña con su logo, etiqueta…).</>,
            <><code>TaskSheet</code> / <code>TareaDetalle</code>: la ficha, con una sola lista de campos editables (tipo y campaña o ficha primero, después estado, prioridad, fechas, etiquetas y los campos propios, con «+ Nuevo campo»), «Para hacerla» (<code>TareaContexto</code>, si es de una campaña o una ficha), subtareas, descripción, comentarios y actividad.</>,
            <>Celdas comunes en <code>task-cells.tsx</code>: <code>CasillaTarea</code>, <code>PrioridadBandera</code>, <code>EstadoTareaBadge</code>, <code>DondeChip</code>, <code>FechaTarea</code>, <code>EtiquetasTarea</code>, <code>ProgresoSubtareas</code>, <code>EsperandoDias</code>.</>,
          ]}
        />
      </DocSection>

      <DocSection id="agenda" title="Agenda" lead="Mes con los hitos de cada pieza (guion, grabación, V1, publicación, resultados), los cobros y las tareas con fecha, cada uno con el tinte de su collab. En el móvil, la lista del mes.">
        <Example className={EXAMPLE} code={`const eventos = [...eventosDeCollabs(collabs, marcas), ...eventosDeTareas(tareas, collabs)]
<Agenda eventos={eventos} hoy={hoy} />`}>
          <Agenda eventos={eventosDeCollabs(demoCollabs.slice(0, 2), demoMarcas)} hoy={HOY} className="w-full" />
        </Example>
      </DocSection>

      <DocSection id="media-kit" title="Media kit" lead="El media kit en hojas A4, con los bloques que ella elige y en su orden, repartidos sin partir ninguno. Es el mismo en el editor, en /media-kit y en cada propuesta.">
        <Example className={EXAMPLE} code={`<DocViewer pages={hojasMediaKit(bloques)}>
  <MediaKitHojas perfil={perfil} kit={kit} bloques={bloquesVisibles(kit, { conPrecios })} marcasTrabajadas={marcas} pie="Marta Albiol · Media kit" />
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

      <DocSection id="gantt" title="Cronograma (Gantt)" lead="Una fila por pieza con sus fases (guion, grabación, edición, revisión, resultados) entre sus hitos, el rombo de la publicación y la línea de hoy. Arrastrar una fila (o las flechas con ella enfocada) mueve la publicación y todas sus fases.">
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
            En la pieza, junto al guion o al vídeo, y en lo que ve la marca con el enlace de revisión. <code>lado="marca"</code> deja escribir notas ancladas; <code>lado="influencer"</code>, resolverlas, contestar y escribir a la marca.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="marca" title="Para la marca, sin cuenta" lead="Las piezas de lo que se manda por enlace: el formulario rápido de piezas, compartir el enlace y la página de la marca.">
        <Example className={EXAMPLE} code={`<PiezasEditor value={piezas} onChange={setPiezas} ventana={{ desde, hasta }} />`}>
          <PiezasEditorExample />
        </Example>
        <Rules
          items={[
            <><code>PiezasEditor</code>: «Añadir pieza» con tipo (vídeo, foto, carrusel, texto), nombre libre, fecha, red e indicaciones. Sin formatos cerrados. Lo usan el formulario de la marca, «Nueva collab» y «Añadir piezas».</>,
            <><code>CompartirEnlace</code> y <code>CompartirEnlaceDialog</code>: copiar, WhatsApp, email desde su correo y «Ver como la marca». Revisión, formulario, contrato e informe se mandan igual.</>,
            <><code>PaginaMarca</code>: la página sin cuenta (cabecera con lo que es y para quién, la creadora delante, pie con la privacidad). <code>ZonaSubida</code>: soltar o elegir archivos.</>,
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
            <>Las carpetas son un árbol (<code>lib/influencer/carpetas.ts</code>: cada una sabe su madre y el orden entre hermanas es el de la lista). Una carpeta enseña también lo de las que lleva dentro; al borrarla, lo suyo sube a su madre. Las notas se enlazan con ideas (<code>VinculoApunte</code>, <code>enlazar</code>). Lo que se adjunta usa los tipos de los materiales (<code>tipoDeArchivo</code>, <code>ICONOS_MATERIAL</code>).</>,
            <><code>CalendarioContenidos</code> (mes o semana) y <code>AgendaContenidos</code> (lista con los huecos libres): pintan <code>EntradaCalendario</code> de <code>lib/influencer/planificacion.ts</code>, sea contenido propio, pieza de collab (con candado: fecha pactada), hito, tarea, cobro o fecha clave. El calendario no pone su <code>DndContext</code>: lo pone la página para poder soltar ideas de fuera.</>,
            <><code>EditorCaption</code>: un solo texto con los hashtags dentro; cuenta lo que admite cada red (Instagram, 2.200 caracteres y 5 hashtags), enseña lo que se ve antes de «más» y avisa de la publicidad sin marcar. <code>AntesDePublicar</code>: lo que falta, poco y útil.</>,
            <><code>Teleprompter</code>: el guion a pantalla completa, con velocidad, tamaño de letra y espejo, para leerlo desde otro dispositivo al grabar.</>,
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
