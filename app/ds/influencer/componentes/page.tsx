import { BanknoteIcon, CircleCheckIcon, MessageSquareWarningIcon, SparklesIcon, WalletIcon } from "lucide-react"
import { fmt } from "@/lib/format"
import { demoCollabs, demoProfile } from "@/lib/influencer/demo-data"
import { Button } from "@/components/ui/button"
import { Block, BlockHeader } from "@/components/influencer/block"
import { StatRow, StatTile } from "@/components/influencer/stat-tile"
import { CollabCard, CollabCardRow } from "@/components/influencer/collab-card"
import { ProfilePanel } from "@/components/influencer/profile-panel"
import { NoticeHighlight, NoticeItem } from "@/components/influencer/notice-card"
import { LinkGridExample, TaskBlockExample } from "@/components/docs/examples/influencer-examples"
import { DocPage, DocSection, Example, NextLinks, Prose, Rules } from "@/components/docs/doc"

export const metadata = { title: "Componentes · Influencer Workspace" }

const EXAMPLE = "theme-influencer"

export default function InfluencerComponentesPage() {
  const [lumea, botanica] = demoCollabs
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
            <CollabCard
              brand={lumea.brand}
              campaign={lumea.campaign}
              deliverables={lumea.deliverables}
              done={lumea.done}
              total={lumea.total}
              nextLabel={lumea.nextLabel}
              nextDate={lumea.nextDate}
              tint={lumea.tint}
              coverUrl={lumea.coverUrl}
              href="#"
            />
            <CollabCard
              brand={botanica.brand}
              campaign={botanica.campaign}
              deliverables={botanica.deliverables}
              done={botanica.done}
              total={botanica.total}
              nextLabel={botanica.nextLabel}
              nextDate={botanica.nextDate}
              tint={botanica.tint}
              href="#"
            />
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
            name={demoProfile.name}
            handle={demoProfile.handle}
            photoUrl={demoProfile.photoUrl}
            niche={demoProfile.niche}
            tier={demoProfile.tier}
            city={demoProfile.city}
            accounts={demoProfile.accounts}
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

      <NextLinks
        links={[
          { href: "/ds/influencer/patrones", label: "Página de inicio", text: "Cómo se juntan estas piezas en la primera página." },
          { href: "/workspace", label: "Abrir la demo", text: "Todo junto con datos de ejemplo." },
        ]}
      />
    </DocPage>
  )
}
