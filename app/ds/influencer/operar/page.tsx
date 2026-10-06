import { DocPage, DocSection, DoDont, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Páginas de operar · Influencer Workspace" }

export default function InfluencerOperarPage() {
  return (
    <DocPage
      eyebrow="Influencer Workspace · Patrones"
      title="Páginas de operar"
      lead="Donde se trabaja: el CRM (pipeline, marcas, contactos, plantillas y media kit), Collabs y la ficha de cada collab. Funcionales como el CRM del Portal Astratic: el kit madre tal cual, y el estilo del hijo solo en las cifras de arriba."
    >
      <DocSection id="estructura" title="Cómo se arma una página de operar">
        <Rules
          items={[
            <><strong>La anatomía del madre, sin adornos</strong>: <code>PageHeader</code> con <code>PageTabs</code>, <code>WorkGrid</code> con <code>FilterBar</code>, un <code>Section</code> con la lista o el tablero e <code>InsightsPanel</code> a la derecha. Nada de <code>Block</code> del hijo alrededor de una tabla.</>,
            <><strong>Cifras bonitas solo en las portadas</strong> (el Pipeline): <code>StatRow</code> del hijo en <code>WorkGrid stats</code>. Las bases de datos empiezan por su toolbar.</>,
            <><strong>Filtrar como en el portal</strong>: buscador, filtros rápidos, constructor «Filtros» con los campos de <code>lib/influencer/campos.ts</code> (en la URL, <code>?f=</code>), vistas y campos visibles (<code>ColumnSettings</code>).</>,
            <><strong>Registro abierto</strong>: propuesta, marca y persona en <code>DetailSheet</code> con <code>?registro=id</code>; la collab y la plantilla, página propia.</>,
            <><strong>Todo se edita donde se lee</strong> (<code>InlineField</code>); crear lleva diálogo (react-hook-form + zod); borrar, <code>ConfirmDialog</code> o toast con «Deshacer» si se puede recuperar.</>,
            <><strong>Nada se pide dos veces</strong>: el diálogo de tarea, la lista de tareas, la marca y las piezas de revisión son los mismos componentes en todas las páginas.</>,
          ]}
        />
        <CodeBlock
          code={`<PageBody className="gap-6 px-4 pb-28 md:px-[34px] md:pb-10">
  <CrmHeader description="Tus propuestas por fase…" />          {/* PageHeader + PageTabs del CRM */}
  <WorkGrid
    stats={<StatRow>…4 StatTile…</StatRow>}
    toolbar={<FilterBar filtros={av} campos={campos} vistas={…} actions={<Button>Nueva propuesta</Button>} />}
    aside={<InsightsPanel blocks={[porFase, proximosPasos, cerradas]} />}
  >
    <Section>
      <SectionHeader title="Propuestas" count={8} action={<ColumnSettings … />} />
      <SectionBody>{kanban · tabla · lista · calendario}</SectionBody>
      <BulkBar … />
    </Section>
  </WorkGrid>
  <PropuestaSheet … />   {/* DetailSummary + pestañas Seguimiento · Datos · Tareas */}
</PageBody>`}
        />
      </DocSection>

      <DocSection id="crm" title="CRM">
        <SpecTable
          columns={["Pestaña", "Qué hay"]}
          rows={[
            ["Pipeline", "La portada: cuatro cifras (abierto, ganado en 30 días, pasos para hoy, sin respuesta) y las propuestas en tablero compacto (se arrastran de fase), tabla, lista o calendario de siguientes pasos y ventanas de publicación. Panel con el reparto por fase, los próximos pasos y las cerradas. Ficha con lo esencial arriba (estado, importe, persona, siguiente paso) y pestañas Seguimiento, Datos y Tareas; «Escribir» con la plantilla que toca según el estado y «Preparar propuesta»."],
            ["Marcas", "Base de datos con relación calculada (cliente, en conversación, sin acuerdo, sin propuestas), contacto principal, valor abierto, facturado, atribución y último contacto. Tabla, lista o tarjetas; exportar a CSV. Panel con el reparto por relación, cuándo caduca la atribución de las suyas y a cuáles no tiene cómo escribir. Ficha con su gente, propuestas, collabs, seguimiento y tareas."],
            ["Contactos", "La gente de cada marca: cargo, email (se copia de un clic), teléfono, Instagram, principal y último contacto. Copiar emails en bloque y exportar. Ficha con sus propuestas y su seguimiento."],
            ["Plantillas", "Directorio por uso (primer contacto, tarifas, propuesta, seguimiento, negociación, cierre, agradecimiento) y canal. Cada una se abre en su página: editor con variables y vista previa para una marca, persona y propuesta concretas, como la página de pasos del outreach del portal."],
            ["Media kit", "Editor por bloques (arrastrar, enseñar o esconder, textos de la portada) con la vista previa A4. «Nueva propuesta»: marca, persona, piezas a tarifa, extras, rondas, validez, pago y condiciones; después, PDF o email con plantilla."],
            ["Documentos", "/propuesta/[id] (media kit + presupuesto con condiciones) y /media-kit, en A4 y listos para PDF o para mandar por enlace."],
          ]}
        />
      </DocSection>

      <DocSection id="collabs" title="Collabs y la ficha de collab">
        <SpecTable
          columns={["Parte", "Qué hay"]}
          rows={[
            ["Collabs", "Portada con cuatro cifras (en marcha, entregas de la semana, esperando a la marca, por cobrar), el directorio en tarjetas, tabla, lista o calendario con filtros y, a la derecha, las tareas de hoy, las de los próximos 7 días y lo que espera a la marca. «Nueva collab»: rellenarla ella o pedir el brief a la marca por enlace."],
            ["Brief, arriba", "En todas las pestañas: la imagen de la campaña con su nombre y su estado, los datos clave, el objetivo y las piezas en miniatura. «Ver el brief completo» lo abre en tres columnas: datos que se usan sueltos (importe, fechas, rondas, derechos, menciones, código…), el texto del brief en el editor y los materiales de la marca con su descarga."],
            ["Resumen", "Los entregables con su estado y lo que toca, y el cronograma en Gantt (por defecto: fases por pieza, línea de hoy, arrastrar para mover fechas), calendario o lista de tareas de la collab."],
            ["Contenidos", "Las piezas una encima de otra por fecha de publicación. Al abrir una, la lista pasa a barra lateral con sus partes (guion y vídeo o fotos) y el resto es su editor: el guion en un editor de texto profesional con versiones, comparar con la anterior, plantillas y comprobación contra el brief; el vídeo o las fotos sobre un lienzo con versiones, comparar, zoom y notas en su sitio. La conversación con la marca a la derecha, ocultable."],
            ["Materiales", "Lo de la marca y lo suyo en mosaico, subir arrastrando, enlaces y «Pedir a la marca»: un formulario solo para subir materiales."],
            ["Contrato", "Editor de documento con variables que se rellenan con los datos de la collab («Ver con los datos»), plantillas, cláusulas tipo y la revisión de lo que conviene vigilar (rondas, derechos, exclusividad, pago, publicidad, datos que faltan). Firma ella y la marca firma por enlace. O el PDF de la marca con su lista de cláusulas a revisar."],
            ["Facturación", "Lo pactado frente a lo facturado y cobrado, el plan de cobro por plazos con su factura, las facturas (número, base, IVA, retención, total, vencimiento, PDF, enviada, cobrada, reclamar) y a quién se factura: la marca o, en la red, Astratic. No emite facturas: las apunta y las sigue."],
            ["Resultados", "Las cifras de cada pieza publicada a mano con sus capturas (Instagram y TikTok por API, más adelante), el resumen con CPM, interacción y clics, las conclusiones y el informe para la marca por enlace."],
          ]}
        />
      </DocSection>

      <DocSection id="revisar" title="Lo que ve la marca, sin cuenta">
        <Prose>
          <p>
            Todo con <code>PaginaMarca</code>: cabecera con lo que es y para quién, la creadora delante, Astratic discreto y el pie con
            la privacidad del enlace. <code>/revisar/[token]</code> es la revisión de Feedback adaptada a una creadora: la versión y
            las anteriores, notas en la cita del texto, el segundo del vídeo o el punto de la foto, la conversación, «Pedir cambios»
            y «Aprobar» con su nombre, y «Siguiente por revisar». <code>/formulario/[token]</code> es el brief rápido (o solo los
            materiales), <code>/contrato/[token]</code> la firma y <code>/informe/[token]</code> los resultados.
          </p>
        </Prose>
        <DoDont
          dos={[
            <>Un enlace por cosa, imposible de adivinar, con caducidad y revocable.</>,
            <>La aprobación y la firma quedan registradas con nombre, fecha y hora: es lo que vale si luego hay discusión.</>,
            <>Formularios rápidos: solo la campaña y una pieza son obligatorias; lo demás, opcional y plegado.</>,
          ]}
          donts={[
            <>Pedir cuenta o contraseña a la marca.</>,
            <>Formatos cerrados en las piezas: la marca pone el tipo (vídeo, foto, carrusel, texto) y el nombre que quiera.</>,
          ]}
        />
      </DocSection>

      <DocSection id="datos" title="Datos y lo que falta">
        <Prose>
          <p>
            El modelo vive en <code>lib/influencer/modelo.ts</code> (en español, como la base de datos del portal) y la
            lógica pura en <code>collabs.ts</code>, <code>cronograma.ts</code>, <code>tareas.ts</code>, <code>presupuesto.ts</code>, <code>agenda.ts</code>, <code>guion.ts</code>, <code>contratos.ts</code>, <code>facturacion.ts</code>, <code>informe.ts</code> y <code>formularios.ts</code>.
            Las páginas piden los datos a <code>lib/influencer/consultas.ts</code>, que hoy devuelve los de ejemplo y en
            el Portal Astratic leerá de Prisma con las mismas funciones. Llevar el workspace al portal es copiar{" "}
            <code>app/workspace</code>, <code>app/revisar</code>, <code>app/formulario</code>, <code>app/contrato</code>, <code>app/informe</code>, <code>app/propuesta</code>, <code>app/media-kit</code>, <code>components/influencer</code> y{" "}
            <code>lib/influencer</code>, y cambiar ese archivo.
          </p>
          <p>
            Por construir: la página general de Tareas (todas las de collabs y propuestas más las suyas, con calendario),
            la biblioteca de Contenidos, Cobros, Perfil y tarifas, Biblia y Ajustes.
          </p>
        </Prose>
      </DocSection>

      <NextLinks
        links={[
          { href: "/ds/influencer/componentes", label: "Componentes", text: "Las piezas de operar." },
        ]}
      />
    </DocPage>
  )
}
