import { DocPage, DocSection, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { StatusBadge } from "@/components/app/status-badge"

export const metadata = { title: "Arquitectura de datos" }

export default function DatosPage() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Arquitectura de datos"
      lead="Cómo se modelan los datos de un portal de operación para que la interfaz del kit encaje sin fricción. Es una base a adaptar por proyecto, no un esquema cerrado: cada portal añade sus campos y sus módulos, pero respeta estas piezas."
    >
      <DocSection id="entidades" title="Entidades" lead="Tres capas: lo que gestiona cada módulo, lo que le da contexto y lo que cuelga de cualquier cosa.">
        <SpecTable
          columns={["Capa", "Ejemplos", "Regla"]}
          rows={[
            [
              "Registro principal",
              "Marca, Campaña, Factura, Evento, Talento",
              "Uno por módulo. Es lo que lista la página de operación, lo que abre el sheet y lo que tiene fase o estado. Lleva un code legible.",
            ],
            [
              "Entidad de contexto",
              "Contacto, Persona del equipo, Proveedor",
              "Existe por sí misma pero se ve casi siempre desde un registro principal: los contactos de una marca, el responsable de una campaña. Tiene una página sencilla propia.",
            ],
            [
              "Entidad de apoyo",
              "Nota, Archivo, Tarea, Actividad, Comentario",
              "Cuelga de cualquier registro por relación polimórfica (entityType, entityId). Se ve en las pestañas del sheet y en el panel. No tiene página propia.",
            ],
          ]}
        />
        <Rules
          items={[
            <>
              La relación polimórfica son dos columnas: <code>entityType</code> («Campaign», «Invoice») y <code>entityId</code>. Prisma no la valida
              como clave foránea, así que la capa de datos comprueba que el registro existe antes de crear la nota o la tarea, y borra en cascada
              al eliminar el registro.
            </>,
            <>Un módulo es un registro principal y una página de operación. Si un módulo necesita dos listados grandes, son dos módulos.</>,
          ]}
        />
      </DocSection>

      <DocSection
        id="campos"
        title="Campos estándar y nombres"
        lead="Toda tabla los lleva. El kit los espera: el sheet muestra createdAt, la tabla ordena por updatedAt y el archivo depende de archivedAt."
      >
        <SpecTable
          columns={["Campo", "Tipo", "Uso"]}
          rows={[
            [<code key="id">id</code>, "String @id @default(cuid())", "Clave técnica. Nunca se muestra."],
            [
              <code key="code">code</code>,
              "String @unique",
              "Identificador legible («REG-0001», «F-2026-014»). Se muestra como subtítulo y se busca por él. Lo genera la capa de datos con un contador por tipo.",
            ],
            [<code key="createdAt">createdAt</code>, "DateTime @default(now())", "Fecha de alta. Sheet y actividad."],
            [<code key="updatedAt">updatedAt</code>, "DateTime @updatedAt", "Última modificación. Orden por defecto de las tablas."],
            [<code key="createdById">createdById</code>, "String, FK a User", "Quién lo creó. Solo en la actividad y en el sheet."],
            [
              <code key="ownerId">ownerId</code>,
              "String?, FK a User",
              "Responsable. Solo en lo que tiene dueño. Es el filtro «Responsable» y el segmento «Míos».",
            ],
            [
              <code key="archivedAt">archivedAt</code>,
              "DateTime?",
              "Archivar en vez de borrar. Las listas excluyen lo archivado por defecto y «Archivados» es un segmento. Eliminar solo desde ahí y con confirmación.",
            ],
          ]}
        />
        <Rules
          items={[
            <>
              Tablas y campos en <strong>inglés y en singular</strong> en Prisma: <code>Brand</code>, <code>Campaign</code>, <code>Invoice</code>,{" "}
              <code>ownerId</code>. La interfaz en español: «Marcas», «Campañas», «Responsable». La traducción vive en la página, no en la base de
              datos.
            </>,
            <>
              Enumeraciones fijas como <code>enum</code> de Prisma en inglés (<code>ACTIVE</code>, <code>OVERDUE</code>) y su etiqueta en un mapa del
              cliente, como hace <code>recordStatus</code> en <code>lib/demo-data.ts</code>.
            </>,
            <>
              Dinero en céntimos como <code>Int</code> o en <code>Decimal(12, 2)</code>; nunca <code>Float</code>. Se formatea con <code>fmt.eur</code>{" "}
              al pintar (ver Copy y formato).
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="fases-y-estados" title="Fases y estados" lead="Son dos cosas distintas y viven en sitios distintos. Mezclarlas es el error más común.">
        <Prose>
          <p>
            <strong>Fase</strong> (<code>stage</code>) es la posición en el pipeline: ordenada, configurable por el administrador y distinta en cada
            portal. Vive en una tabla <code>Stage</code> con <code>order</code> y <code>tone</code>, y el registro apunta a ella con{" "}
            <code>stageId</code>. Es lo que pinta el kanban y lo que cambia «Avanzar fase».
          </p>
          <p>
            <strong>Estado</strong> (<code>status</code>) es la situación operativa: fija en código, igual en todos los portales y cambiada por el
            sistema o por una acción concreta («Cerrar»). Es un <code>enum</code> de cinco valores y cada uno tiene un tono fijo de{" "}
            <code>StatusBadge</code>.
          </p>
        </Prose>
        <SpecTable
          columns={["Estado", "Significa", "Badge"]}
          rows={[
            ["ACTIVE", "Vigente y en uso", <StatusBadge key="a" tone="success" dot>Activo</StatusBadge>],
            ["PENDING", "Espera una acción de alguien", <StatusBadge key="p" tone="warning" dot>Pendiente</StatusBadge>],
            ["OVERDUE", "Fecha de pago o plazo pasada", <StatusBadge key="o" tone="danger" dot>Vencido</StatusBadge>],
            ["DRAFT", "Aún no cuenta", <StatusBadge key="d" tone="neutral" dot>Borrador</StatusBadge>],
            ["CLOSED", "Terminado, ya no cambia", <StatusBadge key="c" tone="info" dot>Cerrado</StatusBadge>],
          ]}
        />
        <Rules
          items={[
            <>
              Las fases también llevan <code>tone</code>: el administrador lo elige entre los cinco al crear la fase. Así el kanban y los badges de
              fase usan la misma paleta que los estados (ver Color).
            </>,
            <>Un registro puede estar en la fase «Propuesta» y con estado «Vencido» a la vez. Se muestran los dos: fase como badge sin punto, estado con punto.</>,
            <>
              «Vencido» depende de la fecha, así que la capa de datos decide si lo guarda (un proceso nocturno lo marca) o lo calcula al leer. La
              interfaz recibe siempre <code>status</code> resuelto y el filtro «Estado» funciona igual que los demás.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="relaciones" title="Relaciones y eventos de dominio">
        <Rules
          items={[
            <>
              <strong>Uno a muchos</strong> con clave foránea directa: <code>Campaign.brandId</code>. La interfaz lo muestra como campo del sheet con
              enlace al padre y como filtro si tiene pocos valores.
            </>,
            <>
              <strong>Muchos a muchos con datos propios</strong> mediante tabla intermedia explícita: <code>CampaignTalent (campaignId, talentId, fee,
              state)</code>. Nunca la relación implícita de Prisma cuando hay que guardar algo sobre el vínculo. La interfaz lo pinta como una lista
              dentro del sheet o como una pestaña.
            </>,
            <>
              <strong>Entre módulos</strong>, el registro principal de uno referencia al de otro: <code>Invoice.campaignId</code>. La factura se ve
              desde la campaña (pestaña Facturación) y la campaña desde la factura (campo con enlace).
            </>,
            <>
              <strong>Evento de dominio, tarea en otro módulo.</strong> Cuando un cambio de estado en un módulo obliga a actuar en otro, no se llama al
              otro módulo: se emite un evento («campaña cerrada») y un manejador crea la <code>Task</code> en el módulo destino («Emitir factura»,
              para Administración). La tarea aparece en el dashboard de esa área y enlaza al registro de origen. Es el patrón propuesto a Twic: la
              operación no tiene que acordarse de avisar a administración.
            </>,
            <>
              Los manejadores viven en <code>lib/events/*.ts</code>, se ejecutan en la misma transacción que el cambio y son idempotentes: repetir el
              evento no crea dos tareas.
            </>,
          ]}
        />
        <CodeBlock
          lang="ts"
          title="lib/events/campaign.ts"
          code={`export async function onCampaignClosed(tx: Prisma.TransactionClient, campaign: Campaign, actorId: string) {
  const sourceKey = \`campaign:\${campaign.id}:invoice\`

  await tx.task.upsert({
    where: { sourceKey },
    update: {},
    create: {
      sourceKey,
      title: \`Emitir factura de \${campaign.name}\`,
      area: "ADMIN",
      entityType: "Campaign",
      entityId: campaign.id,
      dueAt: addDays(new Date(), 5),
      createdById: actorId,
    },
  })

  await tx.activity.create({
    data: { entityType: "Campaign", entityId: campaign.id, actorId, type: "closed", payload: { stageId: campaign.stageId } },
  })
}`}
        />
      </DocSection>

      <DocSection id="esquema" title="Esquema de ejemplo" lead="Un módulo genérico con todo lo anterior. Se copia, se renombra Record por el registro real y se añaden los campos del proyecto.">
        <CodeBlock
          lang="prisma"
          title="prisma/schema.prisma"
          code={`model Record {
  id          String    @id @default(cuid())
  code        String    @unique
  name        String
  category    String?
  stageId     String
  status      Status    @default(DRAFT)
  value       Int       @default(0)
  dueAt       DateTime?
  ownerId     String?
  createdById String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  archivedAt  DateTime?

  stage     Stage     @relation(fields: [stageId], references: [id])
  owner     User?     @relation("owned", fields: [ownerId], references: [id])
  createdBy User      @relation("created", fields: [createdById], references: [id])
  contacts  Contact[]

  @@index([stageId, status, archivedAt])
}

model Stage {
  id      String   @id @default(cuid())
  name    String
  order   Int
  tone    Tone     @default(NEUTRAL)
  records Record[]
}

model Contact {
  id       String  @id @default(cuid())
  name     String
  email    String?
  role     String?
  recordId String
  record   Record  @relation(fields: [recordId], references: [id], onDelete: Cascade)
}

model Activity {
  id         String   @id @default(cuid())
  entityType String
  entityId   String
  actorId    String
  type       String
  payload    Json?
  createdAt  DateTime @default(now())

  @@index([entityType, entityId, createdAt])
}

model Task {
  id          String    @id @default(cuid())
  title       String
  area        String
  entityType  String
  entityId    String
  sourceKey   String?   @unique
  assigneeId  String?
  dueAt       DateTime?
  doneAt      DateTime?
  createdById String
  createdAt   DateTime  @default(now())
}

model User {
  id      String   @id @default(cuid())
  name    String
  email   String   @unique
  area    String
  role    Role     @default(USER)
  owned   Record[] @relation("owned")
  created Record[] @relation("created")
}

enum Status {
  DRAFT
  ACTIVE
  PENDING
  OVERDUE
  CLOSED
}

enum Tone {
  SUCCESS
  INFO
  WARNING
  DANGER
  NEUTRAL
}

enum Role {
  ADMIN
  USER
}`}
        />
        <SpecTable
          columns={["Concepto", "Dónde vive", "Cómo se muestra"]}
          rows={[
            ["Fase", <><code>Stage</code> + <code>Record.stageId</code></>, "Columna «Fase», columnas del kanban, select en el sheet, filtro «Fase», «Avanzar fase»."],
            ["Estado", <><code>enum Status</code> en <code>Record.status</code></>, "StatusBadge con punto, filtro «Estado», cifras de la página."],
            ["Responsable", <code key="owner">Record.ownerId</code>, "Avatar con nombre, filtro «Responsable», segmento «Míos», acción «Asignar» en bloque."],
            ["Código", <code key="code">Record.code</code>, "Subtítulo de la primera columna y del sheet. Entra en la búsqueda."],
            ["Archivado", <code key="archived">Record.archivedAt</code>, "Excluido por defecto. Segmento «Archivados»; «Eliminar» solo desde ahí."],
            ["Contactos, notas, archivos, tareas", <>Tablas de apoyo con <code>entityType</code> y <code>entityId</code></>, "Pestañas del sheet y bloque «Tareas de hoy» del dashboard."],
            ["Actividad", <code key="activity">Activity</code>, "Pestaña Actividad del sheet y bloque «Actividad reciente» del panel."],
            ["Preferencias de interfaz", <><code>UserPreference</code> (localStorage en la v1)</>, "Panel, vista, columnas. Ver Paneles personalizables."],
          ]}
        />
      </DocSection>

      <DocSection id="acceso" title="Actividad, permisos y acceso a datos" lead="Tres reglas que no dependen del proyecto.">
        <Rules
          items={[
            <>
              <strong>Actividad.</strong> Toda mutación de <code>lib/db</code> escribe una fila en <code>Activity</code> en la misma transacción:{" "}
              <code>type</code> corto («created», «stage_changed», «archived») y <code>payload</code> con el antes y el después. No se edita ni se
              borra. Es lo único que se muestra con hora relativa («hace 2 h»).
            </>,
            <>
              <strong>Permisos.</strong> <code>User.area</code> dice de qué parte del negocio es la persona (operación, administración, dirección) y{" "}
              <code>User.role</code> es el rol del sistema: <code>ADMIN</code> ve todo y configura fases; <code>USER</code> ve su área. El filtro por
              área se aplica en la capa de datos, nunca en el componente: la página recibe solo lo que puede ver.
            </>,
            <>
              <strong>Multi-tenant</strong> solo si hace falta: un <code>wsDb(scopeId)</code> que devuelve un cliente de Prisma extendido e inyecta{" "}
              <code>where: {"{ workspaceId }"}</code> en cada consulta. El resto del código no sabe que existe.
            </>,
            <>
              <strong>Acceso.</strong> Todo pasa por <code>lib/db/&lt;entidad&gt;.ts</code>. Nada fuera de esa carpeta importa{" "}
              <code>@prisma/client</code>. Las páginas reciben datos de Server Components; las mutaciones son Server Actions que llaman a las mismas
              funciones. Los filtros de la interfaz se traducen 1:1 al objeto <code>filters</code> (ver Filtros y vistas).
            </>,
          ]}
        />
        <CodeBlock
          lang="ts"
          title="lib/db/records.ts"
          code={`export type Ctx = { userId: string; area: string; role: Role }

export type RecordFilters = {
  q?: string
  stageId?: string[]
  status?: Status[]
  ownerId?: string[]
  dueFrom?: Date
  dueTo?: Date
  archived?: boolean
}

export type RecordSort = { field: "name" | "value" | "dueAt" | "updatedAt"; dir: "asc" | "desc" }
export type Page<T> = { items: T[]; total: number; page: number; pageSize: number }

export async function list(ctx: Ctx, filters: RecordFilters, sort: RecordSort = { field: "updatedAt", dir: "desc" }, page = 1, pageSize = 25): Promise<Page<RecordRow>> { … }
export async function get(ctx: Ctx, id: string): Promise<RecordDetail | null> { … }
export async function create(ctx: Ctx, input: RecordInput): Promise<RecordRow> { … }
export async function update(ctx: Ctx, id: string, patch: Partial<RecordInput>): Promise<RecordRow> { … }
export async function archive(ctx: Ctx, id: string): Promise<void> { … }
export async function bulkUpdate(ctx: Ctx, ids: string[], patch: Partial<RecordInput>): Promise<number> { … }
export async function bulkArchive(ctx: Ctx, ids: string[]): Promise<number> { … }`}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/filtros", label: "Filtros y vistas", text: "Los filtros que recibe list(filters, sort, page)." },
            { href: "/ds/patrones/paneles", label: "Paneles personalizables", text: "UserPreference y la regla de persistencia." },
            { href: "/ds/componentes/status-badge", label: "Badges de estado", text: "Los cinco tonos a los que se mapean fases y estados." },
            { href: "/ds/componentes/detail-sheet", label: "Sheet de detalle", text: "Las pestañas que consumen notas, archivos y actividad." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
