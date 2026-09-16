import type { Metadata } from "next"
import {
  BadgePercentIcon,
  BoxIcon,
  GraduationCapIcon,
  HandshakeIcon,
  InfoIcon,
  LayersIcon,
  LayoutGridIcon,
  LifeBuoyIcon,
  PlugIcon,
  RouteIcon,
  ShieldCheckIcon,
  TagIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { fmt } from "@/lib/format"
import {
  DocAction,
  DocBand,
  DocBlockChips,
  DocCover,
  DocFigure,
  DocSheet,
  DocViewer,
} from "@/components/document/sheet"
import {
  DocBlockIntro,
  DocCallout,
  DocCards,
  DocComplexity,
  DocFacts,
  DocFeature,
  DocFeatureGrid,
  DocHeading,
  DocIconList,
  DocIndex,
  DocItemHeader,
  DocMark,
  DocNote,
  DocPill,
} from "@/components/document/content"
import {
  DocChecklist,
  DocChoices,
  DocContact,
  DocOffer,
  DocPanel,
  DocPlanCard,
  DocPriceTable,
  DocSignatures,
  DocStat,
  DocSteps,
  DocTimeline,
  type DocPlanLine,
} from "@/components/document/commercial"
import { DocToolbar } from "@/components/document/toolbar"
import { MockDashboard, MockOrders } from "./mockups"

export const metadata: Metadata = { title: "Propuesta demo · Portal Rumbo" }

/*
 * Propuesta de ejemplo para un cliente ficticio (Rumbo Logística). Enseña todas las piezas de
 * components/document compuestas como un documento real. Se exporta a PDF con «Exportar PDF».
 */

const DOC = "Propuesta Portal Rumbo · Septiembre 2026"
const PAGES = 14

function Sheet(props: Omit<React.ComponentProps<typeof DocSheet>, "title">) {
  return <DocSheet title={DOC} {...props} />
}

const pages = [
  { n: "0", label: "Setup", price: 1200, days: 3, complexity: 1 },
  { n: "1.2", label: "Pedidos", price: 3200, days: 14, complexity: 3 },
  { n: "1.3", label: "Rutas y flota", price: 3800, days: 18, complexity: 4 },
  { n: "1.4", label: "Incidencias", price: 2400, days: 10, complexity: 2 },
  { n: "2.1", label: "CRM", price: 2400, days: 12, complexity: 2 },
  { n: "2.2", label: "Portal del cliente", price: 3200, days: 15, complexity: 3 },
  { n: "3.1", label: "Facturación", price: 3600, days: 16, complexity: 3 },
  { n: "3.2", label: "Proveedores y gastos", price: 2400, days: 11, complexity: 2 },
  { n: "A.1", label: "App del conductor", price: 2800, days: 14, complexity: 3 },
  { n: "A.2", label: "Avisos por WhatsApp", price: 900, days: 5, complexity: 1 },
] as const

const page = (n: (typeof pages)[number]["n"]) => pages.find((p) => p.n === n)!
const esencial = new Set(["0", "1.2", "1.3", "1.4", "2.1"])
const total = (ids?: Set<string>) => pages.filter((p) => !ids || ids.has(p.n)).reduce((s, p) => s + p.price, 0)
const COMPLETO = total()
const ESENCIAL = total(esencial)
const COMPLETO_INICIO = 24500
const IVA = Math.round(COMPLETO_INICIO * 0.21)

const planLines = (ids?: Set<string>): DocPlanLine[] =>
  pages.map((p) => ({
    number: p.n === "0" ? undefined : p.n,
    label: p.label,
    value: fmt.eur(p.price),
    included: !ids || ids.has(p.n),
  }))

function Item({ n, title, children, id }: { n: (typeof pages)[number]["n"]; title?: string; id?: string; children: React.ReactNode }) {
  const p = page(n)
  return (
    <DocItemHeader id={id} number={n} title={title ?? p.label} price={fmt.eur(p.price)} days={p.days} complexity={p.complexity}>
      {children}
    </DocItemHeader>
  )
}

export default function PropuestaDemoPage() {
  return (
    <DocViewer
      pages={PAGES}
      toolbar={<DocToolbar title="Propuesta Portal Rumbo" meta="Documento de ejemplo · A4 · 14 hojas" backHref="/ds/documentos/elaborada" />}
    >
      {/* 01 · Portada */}
      <DocCover
        client={
          <div className="flex items-center gap-2.5">
            <AvatarInitials name="Rumbo Logística" variant="entity" />
            <div className="leading-tight">
              <div className="text-[15px] font-semibold">Rumbo Logística</div>
              <div className="text-[11px] text-muted-foreground">Transporte y última milla</div>
            </div>
          </div>
        }
        meta="Portal a medida · Septiembre 2026"
        title={
          <>
            Propuesta <DocMark>Portal Rumbo</DocMark>
          </>
        }
        lead="Desarrollo del portal web de Rumbo, con el alcance, el precio y el plazo de cada página."
        actions={
          <>
            <DocAction href="#paquetes">Ver paquetes</DocAction>
            <DocAction href="#introduccion" variant="secondary">
              Ver contenido
            </DocAction>
          </>
        }
        figure={
          <DocFigure frame="inset" zoom={0.611}>
            <MockDashboard />
          </DocFigure>
        }
        footer={["Preparada para Rumbo Logística · Documento de ejemplo con datos ficticios", "Precios sin IVA"]}
      >
        <DocBlockChips
          label="3 bloques"
          items={[
            { number: "1", title: "Operaciones", meta: fmt.eur(9400), href: "#bloque-1" },
            { number: "2", title: "Clientes", meta: fmt.eur(5600), href: "#bloque-2" },
            { number: "3", title: "Administración", meta: fmt.eur(6000), href: "#bloque-3" },
          ]}
        />
      </DocCover>

      {/* 02 · Introducción e índice */}
      <Sheet id="introduccion" section="Introducción">
        <DocHeading
          eyebrow="Introducción"
          title={
            <>
              Un portal a medida para <DocMark>toda la operación</DocMark>
            </>
          }
          lead="Hoy los pedidos llegan por email, las rutas se planifican a mano cada mañana y la facturación se hace a final de mes cruzando albaranes. Esta propuesta reúne todo eso en un portal propio, con cada página pensada para el equipo que la usa."
        />
        <DocFacts
          items={[
            { icon: LayersIcon, title: "Tecnología", text: "Next.js, Postgres en Neon, Tailwind y shadcn/ui, desplegado en Vercel, con acceso con la cuenta de Google de Rumbo." },
            { icon: HandshakeIcon, title: "Forma de trabajo", text: "Cada bloque arranca con un kickoff con su responsable, y cada página se valida en el entorno de pruebas antes de pasar a producción." },
            { icon: TagIcon, title: "Precio", text: "Aproximado por página, según días de desarrollo y complejidad. Puede variar si cambia el alcance. Precios sin IVA." },
          ]}
        />
        <DocCallout label="Propuesta modular" className="mt-4">
          El <strong>Setup es obligatorio</strong> y el resto de páginas se eligen <strong>a la carta</strong>. Los paquetes
          Esencial y Completo son dos combinaciones recomendadas.
        </DocCallout>
        <DocIndex
          className="mt-4"
          items={[
            { token: "0", title: "Setup", meta: `${fmt.eur(1200)} · obligatorio`, page: 3, href: "#setup" },
            { token: "1", title: "Operaciones", meta: fmt.eur(9400), page: 3, href: "#bloque-1" },
            { token: "2", title: "Clientes", meta: fmt.eur(5600), page: 7, href: "#bloque-2" },
            { token: "3", title: "Administración", meta: fmt.eur(6000), page: 8, href: "#bloque-3" },
            { token: "A", title: "Add-ons y fase 2", meta: "opcionales", page: 9, href: "#addons" },
            { token: "P", title: "Paquetes e incluido siempre", meta: `desde ${fmt.eur(ESENCIAL)}`, page: 10, href: "#paquetes" },
            { token: "€", title: "Resumen económico y costes fijos", meta: "Completo desde el inicio", page: 11, href: "#inversion" },
            { token: "T", title: "Plazos", meta: "Esencial en 11 semanas, Completo en 20", page: 12, href: "#plazos" },
            { token: "S", title: "Siguientes pasos, pago y contacto", page: 13, href: "#siguientes-pasos" },
            { token: "✓", title: "Aceptación", page: 14, href: "#aceptacion" },
          ]}
        />
        <div className="mt-4 flex items-center gap-2">
          <DocPill tone="solid">Precio</DocPill>
          <DocPill>Días laborables de desarrollo</DocPill>
          <DocComplexity value={3} />
          <span className="ml-auto text-[11px] text-muted-foreground">Las pantallas son mockups con datos de ejemplo.</span>
        </div>
      </Sheet>

      {/* 03 · Setup y bloque 1 */}
      <Sheet id="setup" section="Setup y Operaciones">
        <Item n="0">
          La base sobre la que se construye todo el portal. Es obligatorio, se hace una sola vez y sirve para cualquier
          combinación de páginas.
        </Item>
        <DocFeatureGrid cols={2} className="mt-5">
          <DocFeature number="0.1" title="Acceso y roles">
            Inicio de sesión con Google y permisos por rol: dirección, tráfico, administración y cliente.
          </DocFeature>
          <DocFeature number="0.2" title="Entornos">
            Entorno de pruebas para validar cada página y entorno de producción en el dominio de Rumbo.
          </DocFeature>
          <DocFeature number="0.3" title="Datos de partida">
            Clientes, vehículos, conductores y tarifas importados desde las hojas de cálculo actuales.
          </DocFeature>
          <DocFeature number="0.4" title="Copias y registro">
            Copias de seguridad diarias y registro de quién cambia qué en cada ficha.
          </DocFeature>
        </DocFeatureGrid>

        <div id="bloque-1" className="mt-14">
          <DocHeading eyebrow="Bloque 1" title="1. Operaciones" className="mb-6" />
          <DocBlockIntro
            price={fmt.eur(9400)}
            priceNote="3 páginas, con el dashboard incluido"
            items={[
              { number: "1.1", label: "Dashboard", value: "incluido" },
              { number: "1.2", label: "Pedidos", value: fmt.eur(3200) },
              { number: "1.3", label: "Rutas y flota", value: fmt.eur(3800) },
              { number: "1.4", label: "Incidencias", value: fmt.eur(2400) },
            ]}
            note="Incluye kickoff con el responsable de tráfico, sin coste aparte."
          >
            <p>
              El día a día de Rumbo en un solo sitio. Los pedidos entran por un único canal, se asignan a rutas y furgonetas y
              se siguen hasta la entrega, con las incidencias registradas y resueltas en el mismo portal.
            </p>
            <p>
              Tráfico deja de planificar a mano cada mañana, los conductores salen con su hoja de ruta y Dirección ve el estado
              de la operación sin pedir informes.
            </p>
          </DocBlockIntro>
        </div>
        <DocCards
          cols={4}
          className="mt-8"
          items={[
            { icon: LayoutGridIcon, title: "1.1 Dashboard", text: "El estado del día en una pantalla.", href: "#dashboard", link: "Página 04" },
            { icon: BoxIcon, title: "1.2 Pedidos", text: "De la entrada a la entrega.", href: "#pedidos", link: "Página 05" },
            { icon: RouteIcon, title: "1.3 Rutas y flota", text: "Rutas diarias y vehículos.", href: "#rutas", link: "Página 06" },
            { icon: TriangleAlertIcon, title: "1.4 Incidencias", text: "Lo que falla, resuelto.", href: "#incidencias", link: "Página 06" },
          ]}
        />
      </Sheet>

      {/* 04 · 1.1 Dashboard */}
      <Sheet id="dashboard" section="1. Operaciones">
        <DocItemHeader number="1.1" title="Dashboard" badge={<DocPill tone="soft">Incluido</DocPill>}>
          La pantalla de inicio de Dirección y Tráfico: el estado de la operación del día en una sola vista, con datos que se
          actualizan solos desde cada página, sin pedir informes a nadie.
        </DocItemHeader>
        <DocBand className="mt-6">
          <DocFigure caption="Mockup ilustrativo con datos de ejemplo.">
            <MockDashboard />
          </DocFigure>
        </DocBand>
        <DocFeatureGrid className="mt-6">
          <DocFeature number="1.1.1" title="Pedidos del día">
            Entrados, entregados, en ruta y retrasados, comparados con la semana anterior.
          </DocFeature>
          <DocFeature number="1.1.2" title="Rutas en curso">
            Avance de cada ruta y conductor, con aviso de retrasos y averías.
          </DocFeature>
          <DocFeature number="1.1.3" title="Flota">
            Furgonetas activas, en taller y próximos vencimientos de ITV y seguro.
          </DocFeature>
          <DocFeature number="1.1.4" title="Incidencias">
            Abiertas por tipo y antigüedad, y las que llevan más de 24 horas.
          </DocFeature>
          <DocFeature number="1.1.5" title="Negocio" span={2}>
            Facturado del mes, cobros pendientes y coste medio por parada, visibles solo para Dirección.
          </DocFeature>
        </DocFeatureGrid>
      </Sheet>

      {/* 05 · 1.2 Pedidos */}
      <Sheet id="pedidos" section="1. Operaciones">
        <Item n="1.2">
          Todos los pedidos en una tabla, desde que entran por email, por el portal del cliente o a mano, hasta que se
          entregan. Cada pedido guarda su estado, su ruta y su historial, y se acaban los pedidos perdidos en el correo.
        </Item>
        <DocBand className="mt-6">
          <DocFigure caption="Mockup ilustrativo con datos de ejemplo.">
            <MockOrders />
          </DocFigure>
        </DocBand>
        <DocFeatureGrid cols={2} className="mt-6">
          <DocFeature number="1.2.1" title="Entrada de pedidos">
            Alta manual, importación desde CSV y lectura de los pedidos que llegan a un buzón de email.
          </DocFeature>
          <DocFeature number="1.2.2" title="Estados y seguimiento">
            De pendiente a entregado, con la fecha y la persona de cada cambio.
          </DocFeature>
          <DocFeature number="1.2.3" title="Prueba de entrega">
            Firma del destinatario y foto del albarán adjuntas al pedido.
          </DocFeature>
          <DocFeature number="1.2.4" title="Vistas y filtros">
            Tabla, kanban por estado y calendario de entregas, con filtros por ruta, cliente y estado.
          </DocFeature>
        </DocFeatureGrid>
        <DocNote icon={PlugIcon} title="Integraciones" className="mt-4">
          lectura de pedidos desde un buzón de email propio de Rumbo, sin coste mensual aparte.
        </DocNote>
      </Sheet>

      {/* 06 · 1.3 Rutas y flota, 1.4 Incidencias */}
      <Sheet id="rutas" section="1. Operaciones">
        <Item n="1.3">
          Planificación de las rutas de cada día y control de la flota. Los pedidos se reparten por zona y furgoneta con el
          orden de paradas ya calculado, y cada vehículo tiene su ficha con mantenimientos y vencimientos.
        </Item>
        <DocFeatureGrid cols={2} className="mt-5">
          <DocFeature number="1.3.1" title="Planificador de rutas">
            Reparto de los pedidos del día por zona y furgoneta, con el orden de paradas optimizado y ajustable a mano.
          </DocFeature>
          <DocFeature number="1.3.2" title="Hoja de ruta">
            PDF por conductor con paradas, franjas horarias y teléfono de cada destinatario.
          </DocFeature>
          <DocFeature number="1.3.3" title="Fichas de vehículo">
            Matrícula, conductor asignado, kilómetros y documentación de cada furgoneta.
          </DocFeature>
          <DocFeature number="1.3.4" title="Mantenimientos y vencimientos">
            ITV, seguro y revisiones, con aviso 30 días antes de cada vencimiento.
          </DocFeature>
        </DocFeatureGrid>
        <DocNote icon={PlugIcon} title="Integraciones" className="mt-4">
          Google Maps para calcular y ordenar las paradas, unos 40 €/mes según volumen.
        </DocNote>

        <div className="mt-12">
          <Item n="1.4" id="incidencias">
            Registro y seguimiento de todo lo que sale mal en una entrega, para resolverlo rápido y ver dónde se repite.
          </Item>
        </div>
        <DocFeatureGrid className="mt-5">
          <DocFeature number="1.4.1" title="Registro">
            Retrasos, daños, ausencias y direcciones erróneas, desde el portal o la hoja de ruta.
          </DocFeature>
          <DocFeature number="1.4.2" title="Asignación y resolución">
            Responsable, plazo y estado de cada incidencia, con aviso si se atasca.
          </DocFeature>
          <DocFeature number="1.4.3" title="Informe mensual">
            Incidencias por tipo, cliente, ruta y conductor, para atacar las que más se repiten.
          </DocFeature>
        </DocFeatureGrid>
        <DocCallout tone="soft" label="Resultado" className="mt-auto">
          Con el bloque completo, <strong>cada pedido tiene dueño, ruta y estado</strong> desde que entra hasta que se entrega,
          y lo que falla queda registrado para no repetirlo.
        </DocCallout>
      </Sheet>

      {/* 07 · Bloque 2 */}
      <Sheet id="bloque-2" section="2. Clientes">
        <DocHeading eyebrow="Bloque 2" title="2. Clientes" className="mb-6" />
        <DocBlockIntro
          price={fmt.eur(5600)}
          priceNote="2 páginas"
          items={[
            { number: "2.1", label: "CRM", value: fmt.eur(2400) },
            { number: "2.2", label: "Portal del cliente", value: fmt.eur(3200) },
          ]}
          note="Incluye kickoff con el responsable comercial, sin coste aparte."
        >
          <p>
            Todo lo que tiene que ver con los clientes de Rumbo: captar nuevos, tener al día sus fichas y tarifas, y darles un
            acceso propio para que pidan y sigan sus envíos sin llamar ni escribir.
          </p>
        </DocBlockIntro>

        <div className="mt-12 flex flex-col gap-5">
          <Item n="2.1">
            Pipeline de clientes potenciales y fichas de los clientes actuales, con sus contactos, tarifas y el historial de
            pedidos e incidencias.
          </Item>
          <DocFeatureGrid>
            <DocFeature number="2.1.1" title="Pipeline">
              Oportunidades por fase, de primer contacto a cliente, con el valor mensual estimado.
            </DocFeature>
            <DocFeature number="2.1.2" title="Fichas de cliente">
              Contactos, direcciones de recogida, tarifas pactadas y documentos.
            </DocFeature>
            <DocFeature number="2.1.3" title="Tareas y seguimientos">
              Llamadas, visitas y recordatorios asignados a cada comercial.
            </DocFeature>
          </DocFeatureGrid>
        </div>

        <div className="mt-10 flex flex-col gap-5">
          <Item n="2.2">
            Un acceso propio para cada cliente, con su logo y solo sus datos. Hace sus pedidos, sigue sus envíos en tiempo real
            y descarga albaranes y facturas.
          </Item>
          <DocFeatureGrid cols={2}>
            <DocFeature number="2.2.1" title="Alta de pedidos">
              Uno a uno o por importación, con las direcciones habituales guardadas.
            </DocFeature>
            <DocFeature number="2.2.2" title="Seguimiento de envíos">
              Estado y hora estimada de cada entrega, con enlace para compartir con el destinatario.
            </DocFeature>
            <DocFeature number="2.2.3" title="Documentos">
              Albaranes firmados y facturas descargables en PDF.
            </DocFeature>
            <DocFeature number="2.2.4" title="Usuarios del cliente">
              Cada cliente da de alta a su equipo con permiso de consulta o de pedido.
            </DocFeature>
          </DocFeatureGrid>
          <DocNote icon={ShieldCheckIcon} title="Seguridad">
            cada cliente solo ve sus pedidos, sus documentos y sus usuarios.
          </DocNote>
        </div>
      </Sheet>

      {/* 08 · Bloque 3 */}
      <Sheet id="bloque-3" section="3. Administración">
        <DocHeading eyebrow="Bloque 3" title="3. Administración" className="mb-6" />
        <DocBlockIntro
          price={fmt.eur(6000)}
          priceNote="2 páginas"
          items={[
            { number: "3.1", label: "Facturación", value: fmt.eur(3600) },
            { number: "3.2", label: "Proveedores y gastos", value: fmt.eur(2400) },
          ]}
          note="Incluye kickoff con administración, sin coste aparte."
        >
          <p>
            La facturación deja de hacerse a mano a final de mes. Las facturas salen de los pedidos entregados y las tarifas de
            cada cliente, y los gastos de la flota quedan registrados por vehículo.
          </p>
        </DocBlockIntro>

        <div className="mt-12 flex flex-col gap-5">
          <Item n="3.1">
            Facturas mensuales generadas a partir de los pedidos entregados, con control de cobros y vencidos.
          </Item>
          <DocFeatureGrid>
            <DocFeature number="3.1.1" title="Facturación automática">
              Borrador mensual por cliente según sus tarifas, revisable antes de emitir.
            </DocFeature>
            <DocFeature number="3.1.2" title="Cobros y vencidos">
              Estado de cada factura y aviso de las que vencen.
            </DocFeature>
            <DocFeature number="3.1.3" title="Exportación a gestoría">
              Libro de facturas en Excel al cerrar cada mes.
            </DocFeature>
          </DocFeatureGrid>
        </div>

        <div className="mt-10 flex flex-col gap-5">
          <Item n="3.2">
            Combustible, talleres, peajes y seguros registrados por vehículo, para saber cuánto cuesta cada furgoneta y cada
            ruta.
          </Item>
          <DocFeatureGrid>
            <DocFeature number="3.2.1" title="Registro de gastos">
              Tickets y facturas de proveedor con foto desde el móvil.
            </DocFeature>
            <DocFeature number="3.2.2" title="Coste por vehículo">
              Gasto mensual y coste por kilómetro de cada furgoneta.
            </DocFeature>
            <DocFeature number="3.2.3" title="Proveedores">
              Fichas con contacto, condiciones y gasto acumulado.
            </DocFeature>
          </DocFeatureGrid>
        </div>
        <DocCallout tone="soft" label="Resultado" className="mt-auto">
          Con el bloque completo, <strong>la facturación sale de los datos que ya están en el portal</strong> y{" "}
          <strong>cada gasto queda asignado a su vehículo</strong>.
        </DocCallout>
      </Sheet>

      {/* 09 · Add-ons y fase 2 */}
      <Sheet id="addons" section="Add-ons y fase 2">
        <DocHeading
          eyebrow="Add-ons"
          title={
            <>
              Add-ons y <DocMark>fase 2</DocMark>
            </>
          }
          lead="Funcionalidades opcionales que se suman a cualquier paquete, ahora o más adelante, sobre la misma base."
        />
        <div className="flex flex-col gap-5">
          <Item n="A.1">
            Una app web que el conductor instala en su móvil, con la ruta del día y todo lo necesario para cerrar cada entrega
            sin papel.
          </Item>
          <DocFeatureGrid>
            <DocFeature number="A.1.1" title="Ruta del día">
              Paradas en orden con navegación al siguiente destino.
            </DocFeature>
            <DocFeature number="A.1.2" title="Entrega">
              Firma en pantalla, foto del albarán e incidencias en un toque.
            </DocFeature>
            <DocFeature number="A.1.3" title="Sin cobertura">
              Funciona sin conexión y sincroniza al recuperarla.
            </DocFeature>
          </DocFeatureGrid>
        </div>

        <div className="mt-10 flex flex-col gap-4">
          <Item n="A.2">
            Aviso automático al destinatario con la franja de entrega y el enlace de seguimiento, y otro cuando el pedido se
            entrega.
          </Item>
          <DocNote icon={PlugIcon} title="Integraciones">
            WhatsApp Business, con un coste por mensaje según la tarifa de Meta.
          </DocNote>
        </div>

        <div className="mt-10">
          <DocItemHeader number="A.3" title="Integración contable" badge={<DocPill>Se presupuesta aparte</DocPill>}>
            Envío automático de facturas y gastos al programa de contabilidad de Rumbo. Se presupuesta cuando se confirme qué
            programa usan y qué datos hay que enviar.
          </DocItemHeader>
        </div>

        <DocCallout tone="soft" label="Fase 2" className="mt-auto">
          Ideas para más adelante, sin presupuesto en esta propuesta: <strong>tarifas por zona</strong>,{" "}
          <strong>previsión de demanda</strong> y <strong>control horario de conductores</strong>.
        </DocCallout>
      </Sheet>

      {/* 10 · Paquetes */}
      <Sheet id="paquetes" section="Paquetes">
        <DocHeading
          eyebrow="Paquetes"
          title={
            <>
              Paquetes: <DocMark>Completo</DocMark> y <DocMark>Esencial</DocMark>
            </>
          }
          className="mb-6"
        />
        <div className="grid grid-cols-2 gap-4">
          <DocPlanCard
            featured
            name="Paquete Completo"
            tag="Todo el portal"
            price={fmt.eur(COMPLETO)}
            priceNote="+ IVA · con los add-ons A.1 y A.2"
            description="Todo el portal descrito en esta propuesta, con la app del conductor y los avisos por WhatsApp. Incluye los 3 kickoffs."
            lines={planLines()}
            highlight="Dashboard de Operaciones"
            stats={[
              { label: "Listo en", value: "unas 20 semanas", hint: "unos 5 meses" },
              { label: "Costes fijos", value: "unos 110 €/mes", hint: "más WhatsApp por uso" },
            ]}
          />
          <DocPlanCard
            name="Paquete Esencial"
            tag="El núcleo"
            price={fmt.eur(ESENCIAL)}
            priceNote="+ IVA"
            description="Lo imprescindible del día a día: pedidos, rutas, flota, incidencias y CRM. Incluye los kickoffs de Operaciones y Clientes."
            lines={planLines(esencial)}
            highlight="Dashboard de Operaciones"
            stats={[
              { label: "Listo en", value: "unas 11 semanas", hint: "unos 2,5 meses" },
              { label: "Costes fijos", value: "unos 90 €/mes" },
            ]}
          />
        </div>
        <DocOffer
          icon={BadgePercentIcon}
          title="Completo contratado desde el inicio"
          price={fmt.eur(COMPLETO_INICIO)}
          priceNote="+ IVA"
          className="mt-4"
        >
          Si se contrata el Completo desde el principio, en lugar de empezar por el Esencial y ampliar después.
        </DocOffer>
        <DocPanel label="Incluido siempre" className="mt-4 py-5">
          <DocIconList
            items={[
              { icon: LayoutGridIcon, text: "Dashboard de cada bloque contratado" },
              { icon: HandshakeIcon, text: "Kickoff con el responsable de cada bloque" },
              { icon: GraduationCapIcon, text: "Onboarding del equipo al entregar" },
              { icon: LifeBuoyIcon, text: "3 meses de mantenimiento desde la entrega final" },
            ]}
          />
        </DocPanel>
      </Sheet>

      {/* 11 · Resumen económico */}
      <Sheet id="inversion" section="Resumen económico">
        <DocHeading
          eyebrow="Inversión"
          title={
            <>
              Resumen <DocMark>económico</DocMark>
            </>
          }
          className="mb-6"
        />
        <DocPriceTable
          columns={["Paquete Completo desde el inicio", "Días", "Precio"]}
          rows={[
            ...pages.slice(0, 1).map((p) => ({ number: p.n, label: p.label, cells: [p.days, fmt.eur(p.price)] })),
            { number: "1.1", label: "Dashboard", muted: true, cells: ["", "incluido"] },
            ...pages.slice(1).map((p) => ({ number: p.n, label: p.label, cells: [p.days, fmt.eur(p.price)] })),
          ]}
          summary={[
            { label: "Suma a la carta", value: fmt.eur(COMPLETO) },
            { label: "Contratación desde el inicio", value: `−${fmt.eur(COMPLETO - COMPLETO_INICIO)}` },
            { label: "Base imponible", value: fmt.eur(COMPLETO_INICIO) },
            { label: "IVA 21 %", value: fmt.eur(IVA) },
            { label: "Total", value: fmt.eur(COMPLETO_INICIO + IVA), strong: true },
          ]}
        />
        <DocPriceTable
          className="mt-4"
          columns={["Costes fijos mensuales", "Esencial", "Completo"]}
          rows={[
            { label: "Hosting y base de datos (Vercel y Neon)", cells: ["unos 40 €", "unos 60 €"] },
            { label: "Email para avisos y lectura de pedidos", cells: ["unos 10 €", "unos 10 €"] },
            { label: "Mapas y rutas (Google Maps, según volumen)", cells: ["unos 40 €", "unos 40 €"] },
            { label: "WhatsApp, por mensaje enviado", muted: true, cells: ["—", "según uso"] },
          ]}
        />
        <DocNote icon={InfoIcon} className="mt-4">
          Los costes fijos se pagan directamente a cada proveedor, a nombre de Rumbo, y dependen del uso real. Son orientativos.
        </DocNote>
      </Sheet>

      {/* 12 · Plazos */}
      <Sheet id="plazos" section="Plazos">
        <DocHeading
          eyebrow="Plazos"
          title={
            <>
              Plazos, <DocMark>página a página</DocMark>
            </>
          }
          lead="Días laborables de desarrollo de cada página. Las que no dependen de otra se construyen en paralelo, y la validación del equipo de Rumbo se hace mientras se construye la siguiente, así que no suma plazo."
        />
        <DocTimeline
          weeks={20}
          ticks={[1, 4, 8, 11, 14, 17, 20]}
          markers={[
            { week: 11, label: "Esencial" },
            { week: 20, label: "Completo", tone: "dark" },
          ]}
          rows={[
            { label: "Setup", from: 0, to: 0.6, days: 3, weeks: "1" },
            { label: "Pedidos", from: 0.6, to: 3.4, days: 14, weeks: "1 a 4" },
            { label: "Rutas y flota", from: 3.4, to: 7, days: 18, weeks: "4 a 7" },
            { label: "Incidencias", from: 7, to: 9, days: 10, weeks: "8 a 9" },
            { label: "CRM", from: 8.6, to: 11, days: 12, weeks: "9 a 11" },
            { milestone: true, label: "Fin del paquete Esencial", value: "Semana 11", hint: "unos 2,5 meses" },
            { label: "Avisos por WhatsApp", from: 11, to: 12, days: 5, weeks: "12", tone: "dark" },
            { label: "Portal del cliente", from: 11, to: 14, days: 15, weeks: "12 a 14", tone: "dark" },
            { label: "Facturación", from: 12, to: 15.2, days: 16, weeks: "13 a 16", tone: "dark" },
            { label: "Proveedores y gastos", from: 14, to: 16.2, days: 11, weeks: "15 a 17", tone: "dark" },
            { label: "App del conductor", from: 16.6, to: 19.4, days: 14, weeks: "17 a 20", tone: "dark" },
            { milestone: true, tone: "dark", label: "Fin del paquete Completo", value: "Semana 20", hint: "unos 5 meses" },
          ]}
          legend={[
            { label: "Paquete Esencial", tone: "brand" },
            { label: "Resto del paquete Completo", tone: "dark" },
          ]}
        />
        <p className="mt-auto text-[11.5px] text-muted-foreground">
          Los plazos son orientativos y cuentan desde el kickoff. La integración contable (A.3) se planifica cuando se defina
          su alcance.
        </p>
      </Sheet>

      {/* 13 · Siguientes pasos */}
      <Sheet id="siguientes-pasos" section="Siguientes pasos">
        <DocHeading
          eyebrow="Siguientes pasos"
          title={
            <>
              Siguientes <DocMark>pasos</DocMark>
            </>
          }
        />
        <DocSteps
          items={[
            { title: "Revisión de la propuesta", text: "Rumbo revisa la propuesta y anota dudas o cambios." },
            { title: "Reunión y confirmación", text: "Reunión para resolver dudas y confirmar el paquete o las páginas a contratar." },
            {
              title: "Definición final",
              text: "Repaso con tráfico, comercial y administración para cerrar el alcance de cada página. Esta propuesta se ha preparado antes de ese repaso, así que es el momento de añadir o quitar funcionalidades.",
            },
            { title: "Arranque", text: "Arranque en el orden elegido. Cada bloque empieza con un kickoff con su responsable." },
            { title: "Entregas por página", text: "Cada página se publica al terminarla, así el equipo la usa mientras se construye el resto." },
            { title: "Portal completo", text: "Entrega final con onboarding del equipo y 3 meses de mantenimiento incluidos." },
          ]}
        />
        <p className="mt-3 text-[11.5px] text-muted-foreground">Los plazos son orientativos y dependen de cada fase.</p>

        <div className="mt-auto grid grid-cols-2 gap-4">
          <DocPanel tone="dark" label="Forma de pago">
            <div className="grid grid-cols-2 gap-4">
              <DocStat value="50 %" label="al empezar" />
              <DocStat value="50 %" label="al terminar el portal" />
            </div>
            <p className="mt-5 text-[11.5px] text-primary-foreground/60">Precios sin IVA. Transferencia a 15 días.</p>
          </DocPanel>
          <DocPanel label="Contacto">
            <DocContact email="info@astraticnetwork.com" phone="608 89 91 48" />
          </DocPanel>
        </div>
      </Sheet>

      {/* 14 · Aceptación */}
      <Sheet id="aceptacion" section="Aceptación">
        <DocHeading
          eyebrow="Aceptación"
          title={
            <>
              Aceptación de <DocMark>la propuesta</DocMark>
            </>
          }
          lead="Marcad un paquete o las páginas a la carta y devolved el documento firmado. Precios sin IVA."
          className="mb-5"
        />
        <DocChoices
          items={[
            { label: "Paquete Esencial", value: fmt.eur(ESENCIAL) },
            { label: "Paquete Completo", value: fmt.eur(COMPLETO) },
            { label: "Completo desde el inicio", value: fmt.eur(COMPLETO_INICIO) },
            { label: "A la carta: Setup y lo marcado abajo" },
          ]}
        />
        <div className="mt-3 flex flex-col gap-3">
          <DocChecklist title="0. Setup" items={[{ label: "Setup (obligatorio)", value: fmt.eur(1200), checked: true }]} />
          <DocChecklist
            title="1. Operaciones"
            items={[
              { label: "1.1 Dashboard", value: "incluido con cualquier página del bloque", muted: true },
              { label: "1.2 Pedidos", value: fmt.eur(3200), children: ["Entrada de pedidos", "Estados y seguimiento", "Prueba de entrega", "Vistas y filtros"] },
              { label: "1.3 Rutas y flota", value: fmt.eur(3800), children: ["Planificador de rutas", "Hoja de ruta", "Fichas de vehículo", "Mantenimientos"] },
              { label: "1.4 Incidencias", value: fmt.eur(2400), children: ["Registro", "Asignación y resolución", "Informe mensual"] },
            ]}
          />
          <div className="grid grid-cols-2 gap-3">
            <DocChecklist
              title="2. Clientes"
              items={[
                { label: "2.1 CRM", value: fmt.eur(2400) },
                { label: "2.2 Portal del cliente", value: fmt.eur(3200) },
              ]}
            />
            <DocChecklist
              title="3. Administración"
              items={[
                { label: "3.1 Facturación", value: fmt.eur(3600) },
                { label: "3.2 Proveedores y gastos", value: fmt.eur(2400) },
              ]}
            />
          </div>
          <DocChecklist
            title="Add-ons"
            items={[
              { label: "A.1 App del conductor", value: fmt.eur(2800) },
              { label: "A.2 Avisos por WhatsApp", value: fmt.eur(900) },
            ]}
          />
        </div>
        <DocSignatures className="mt-auto pt-4" parties={["Por Rumbo Logística", "Por Astratic Network"]} />
      </Sheet>
    </DocViewer>
  )
}
