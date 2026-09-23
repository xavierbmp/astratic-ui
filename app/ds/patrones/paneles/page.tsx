import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { PanelDemo } from "@/components/docs/examples/panel-demo"

export const metadata = { title: "Paneles personalizables" }

export default function PanelesPage() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Paneles personalizables"
      lead="El panel de información acompaña al bloque de operación con el contexto que cada usuario quiere ver. Este patrón fija qué puede ir dentro, cómo se personaliza y cómo se recuerda, y extiende esa misma regla al resto de preferencias de la interfaz."
    >
      <DocSection
        id="panel"
        title="El panel de información"
        lead="Columna derecha de 320 px, misma altura que el bloque de operación (ver Anatomía). Un solo componente: InsightsPanel."
      >
        <Prose>
          <p>
            El panel es una <code>Section</code> con cabecera («Información» y un icono de personalizar) y un cuerpo con <strong>bloques</strong> apilados
            y separados por una línea. Cada bloque es un <code>InsightBlock</code>: un id estable, un título de 13 px, un icono opcional y una función{" "}
            <code>render</code> que pinta su contenido. No hay más estructura: ni tarjetas dentro de tarjetas ni pestañas.
          </p>
          <p>
            Desde el icono de personalizar el usuario ve la lista de bloques, activa o desactiva cada uno con un checkbox y los reordena con las flechas.
            «Restablecer» vuelve al orden y la visibilidad que definió la página. Si desactiva todos, el panel lo dice en una línea y sigue en su
            sitio: nunca desaparece.
          </p>
        </Prose>
        <SpecTable
          columns={["Campo", "Tipo", "Para qué"]}
          rows={[
            [<code key="id">id</code>, "string", "Clave estable del bloque. Es lo que se guarda en las preferencias; si cambia, el usuario pierde su ajuste."],
            [<code key="title">title</code>, "string", "Título del bloque, sustantivo corto: «Resumen», «Por fase», «Próximos vencimientos»."],
            [<code key="icon">icon</code>, "LucideIcon", "Icono de 14 px a la izquierda del título. Opcional, pero se recomienda."],
            [<code key="defaultVisible">defaultVisible</code>, "boolean", "false para bloques útiles pero secundarios (Actividad). Por defecto, true."],
            [<code key="action">action</code>, "ReactNode", "Enlace pequeño a la derecha del título: «Ver todas». Nunca un botón que modifique datos."],
            [<code key="render">render</code>, "() => ReactNode", "Contenido del bloque. Se calcula sobre los mismos datos filtrados que el bloque de operación."],
          ]}
        />
        <Rules
          items={[
            <>
              Las preferencias se guardan en <code>localStorage</code> con la clave <code>insights:&lt;storageKey&gt;</code>. Un{" "}
              <code>storageKey</code> por página («registros», «facturas»), nunca compartido entre páginas: cada una tiene bloques distintos.
            </>,
            <>
              Lo guardado es <code>{"{ order: string[], hidden: string[] }"}</code>. Si la página añade un bloque nuevo, aparece al final con su
              visibilidad por defecto; si quita uno, su id se ignora. No hace falta migrar nada.
            </>,
            <>Por debajo de 1280 px el panel baja debajo del bloque y mantiene los mismos bloques y el mismo ajuste.</>,
          ]}
        />
      </DocSection>

      <DocSection
        id="ficha-en-el-panel"
        title="Ficha en el panel"
        lead="La columna derecha también puede enseñar el registro abierto en lugar de la información. Es una preferencia de cada persona y página."
      >
        <Prose>
          <p>
            En los ajustes del panel, «Ficha en el panel» cambia la columna derecha por la ficha del registro abierto. Al pulsar una fila, la
            ficha se pone ahí, sin abrirse encima de la lista, que sigue entera a la vista y se puede usar. Sin ninguna abierta, el panel
            explica cómo elegirla y conserva sus ajustes arriba a la derecha para volver a «Información».
          </p>
          <p>
            Se ensancha o estrecha arrastrando su borde izquierdo (o con las flechas desde el teclado), entre 380 y 960 px y dejando siempre
            sitio a la lista; doble clic vuelve a los 480 de siempre. La lista se ajusta sola: las cifras se recolocan y los filtros rápidos
            que no caben se recogen en «+N».
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <code>usePanelFicha(clave)</code> guarda la preferencia y el ancho en <code>panel-ficha:&lt;clave&gt;</code>; se pasa a{" "}
              <code>WorkGrid ficha</code>, <code>InsightsPanel ficha</code> y <code>DetailSheet ficha</code>. La página no cambia nada más.
            </>,
            <>Solo con dos columnas (1280 px o más). Por debajo, el panel va debajo del bloque, así que la ficha se abre encima como siempre.</>,
            <>El registro abierto se marca en la lista como lo seleccionado (<code>DataTable activeId</code>, <code>Kanban openId</code>).</>,
          ]}
        />
      </DocSection>

      <DocSection
        id="ejemplo"
        title="Ejemplo"
        lead="Tres bloques reales en un contenedor de 320 por 420 px. Abre el icono de personalizar, desactiva o reordena y recarga la página: se mantiene."
      >
        <Example>
          <PanelDemo />
        </Example>
        <CodeBlock
          title="Definición de los bloques"
          code={`const blocks: InsightBlock[] = [
  {
    id: "resumen",
    title: "Resumen",
    icon: BanknoteIcon,
    render: () => (
      <div className="divide-y">
        <InsightStat label="Registros" value={filtered.length} />
        <InsightStat label="Valor medio" value={fmt.eur(media)} />
        <InsightStat label="Cerrados este mes" value={cerrados.length} sub={fmt.eur(valorCerrado)} />
      </div>
    ),
  },
  {
    id: "vencimientos",
    title: "Próximos vencimientos",
    icon: CalendarClockIcon,
    action: <Link href="/registros?orden=vence:asc">Ver todas</Link>,
    render: () => (
      <InsightList
        items={proximos.map((r) => ({
          key: r.id,
          leading: <AvatarInitials name={r.owner} size="sm" />,
          title: r.name,
          subtitle: r.owner,
          trailing: fmt.date(r.dueAt),
        }))}
      />
    ),
  },
  {
    id: "actividad",
    title: "Actividad",
    icon: ActivityIcon,
    defaultVisible: false,
    render: () => <InsightList items={actividad.slice(0, 4).map(toItem)} />,
  },
]

<WorkGrid aside={<InsightsPanel storageKey="registros" blocks={blocks} />}>
  <Section>…</Section>
</WorkGrid>`}
        />
      </DocSection>

      <DocSection
        id="contenido"
        title="Qué va en un bloque y qué no"
        lead="El panel informa; no opera. Todo lo que cambia un registro vive en el bloque de operación, en la barra de selección o en el sheet."
      >
        <SpecTable
          columns={["Tipo de bloque", "Componente", "Ejemplo"]}
          rows={[
            ["Resumen numérico", <code key="stat">InsightStat</code>, "De 2 a 4 pares etiqueta y cifra: valor medio, cerrados este mes, sin actividad 7 días."],
            [
              "Lista corta",
              <>
                <code>InsightList</code> + acción «Ver todas»
              </>,
              "De 3 a 5 ítems con avatar o icono, título, subtítulo y dato a la derecha: próximos vencimientos, últimos cambios.",
            ],
            ["Distribución", "Barras finas por categoría (ver ejemplo)", "Registros por fase, facturas por estado, horas por persona."],
            [
              "Aviso",
              <>
                <code>Alert</code> pequeña o una línea con icono
              </>,
              "«3 facturas vencen esta semana», «2 registros sin responsable». Con enlace a la página filtrada.",
            ],
          ]}
        />
        <DoDont
          dos={[
            "Cifras calculadas sobre lo filtrado, con el mismo formato que la tabla.",
            "Listas de 3 a 5 ítems que abren el sheet del registro y terminan en «Ver todas».",
            "Títulos que son sustantivos: «Por fase», no «Aquí puedes ver las fases».",
            "Un bloque secundario con defaultVisible en false antes que un panel de siete bloques.",
          ]}
          donts={[
            "Acciones que modifiquen registros: asignar, archivar, avanzar fase.",
            "Formularios o campos de entrada de cualquier tipo.",
            "Tablas largas o con scroll propio: para eso está el bloque de operación.",
            "Gráficos grandes de Recharts; una distribución con barras finas es suficiente.",
            "Más de seis bloques definidos por página.",
          ]}
        />
      </DocSection>

      <DocSection
        id="arquetipos"
        title="Bloques recomendados por arquetipo"
        lead="Los cuatro arquetipos de página (ver Anatomía) llevan un panel distinto, o ninguno."
      >
        <SpecTable
          columns={["Página", "Bloques", "Nota"]}
          rows={[
            [
              "Dashboard",
              "Tareas de hoy · Actividad reciente · Requiere atención",
              "El panel se llama «Hoy». «Requiere atención» agrupa vencidos, sin asignar y pendientes de aprobación, con enlace a la página filtrada.",
            ],
            [
              "Operación",
              "Resumen · Distribución por fase o estado · Próximos vencimientos · Actividad (oculto por defecto)",
              "Resumen y distribución se calculan sobre lo filtrado; actividad, sobre toda la página.",
            ],
            [
              "Página de registro",
              "Resumen del registro · Próximos hitos · Actividad",
              "El storageKey lleva el tipo de registro («campana»), no su id: la preferencia vale para todas las campañas.",
            ],
            ["Detalle en sheet", "No hay panel", "El sheet ocupa ese papel con sus pestañas Resumen, Actividad y Archivos."],
          ]}
        />
      </DocSection>

      <DocSection
        id="preferencias"
        title="Otras preferencias que se recuerdan"
        lead="La regla del panel vale para toda la interfaz: lo que el usuario ajusta se recuerda por página y por usuario, y siempre tiene un «Restablecer»."
      >
        <SpecTable
          columns={["Preferencia", "Dónde se elige", "Clave"]}
          rows={[
            ["Vista activa", "Conmutador de vistas de la toolbar", <code key="view">view:&lt;página&gt;</code>],
            ["Bloques del panel", "Icono de personalizar del panel", <code key="insights">insights:&lt;página&gt;</code>],
            [
              "Columnas visibles",
              <>
                Menú «…» de la cabecera del bloque, opción «Columnas» <span className="text-muted-foreground">(pendiente en el kit)</span>
              </>,
              <code key="columns">columns:&lt;página&gt;</code>,
            ],
            [
              "Densidad",
              <>
                Menú «…» de la cabecera del bloque, opción «Compacta» (<code>dense</code> de <code>DataTable</code>){" "}
                <span className="text-muted-foreground">(pendiente en el kit)</span>
              </>,
              <code key="density">density:&lt;página&gt;</code>,
            ],
            [
              "Sidebar colapsada",
              "Botón de colapso de la sidebar",
              <>
                Cookie <code>sidebar_state</code>, la gestiona el componente <code>Sidebar</code>
              </>,
            ],
            ["Tema", "Conmutador claro, oscuro o sistema de la cabecera", <code key="theme">theme</code>],
          ]}
        />
        <Rules
          items={[
            <>
              Las claves llevan el <strong>nombre de la página</strong>, no la ruta completa ni el id de un registro: «registros», «facturas»,
              «campanas».
            </>,
            <>
              Las preferencias son <strong>de interfaz</strong>. Los filtros no lo son (van en la URL, ver Filtros y vistas) y los datos tampoco (van
              en la base de datos).
            </>,
            <>Sidebar y tema son globales del portal; el resto, por página.</>,
          ]}
        />
      </DocSection>

      <DocSection
        id="persistencia"
        title="Regla de persistencia"
        lead="En la v1 todo vive en el navegador. Cuando el portal tiene usuarios con sesión, las mismas claves pasan al servidor sin tocar la interfaz."
      >
        <Rules
          items={[
            <>
              <strong>v1:</strong> <code>useLocalStorage(key, initial)</code>. Por página y por navegador. Se pierde al cambiar de equipo, y eso es
              aceptable mientras no hay sesión.
            </>,
            <>
              <strong>Con usuarios:</strong> tabla <code>UserPreference (userId, key, value json)</code> con la <strong>misma clave</strong>. Un hook{" "}
              <code>usePreference(key, initial)</code> sustituye a <code>useLocalStorage</code> con la misma firma: lee del servidor si hay sesión y
              cae a <code>localStorage</code> si no la hay.
            </>,
            <>
              Escritura optimista: se aplica al momento en el cliente y se guarda en segundo plano con una Server Action. Si falla, no se avisa: es
              una preferencia, no un dato.
            </>,
            <>
              La primera vez que un usuario inicia sesión en un navegador con preferencias locales, se suben las locales. A partir de ahí manda el
              servidor.
            </>,
          ]}
        />
        <CodeBlock
          lang="prisma"
          title="prisma/schema.prisma"
          code={`model UserPreference {
  id        String   @id @default(cuid())
  userId    String
  key       String
  value     Json
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, key])
}`}
        />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/insights-panel", label: "Panel de información", text: "Props de InsightsPanel, InsightList e InsightStat." },
            { href: "/ds/patrones/anatomia", label: "Anatomía de página", text: "Dónde va el panel y qué pasa por debajo de 1280 px." },
            { href: "/ds/patrones/filtros", label: "Filtros y vistas", text: "La vista activa y por qué los filtros no son preferencias." },
            { href: "/ds/patrones/datos", label: "Arquitectura de datos", text: "UserPreference y la capa lib/db." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
