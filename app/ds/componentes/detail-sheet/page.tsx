import Link from "next/link"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { DetailSheetDemo } from "@/components/docs/examples/detail-sheet-demo"
import { FichaRecorridoDemo } from "@/components/docs/examples/ficha-recorrido-demo"
import { FichaCompactaDemo } from "@/components/docs/examples/ficha-compacta-demo"

export const metadata = { title: "Sheet de detalle" }

const example = `const [openId, setOpenId] = React.useState<string | null>(null)
const i = rows.findIndex((r) => r.id === openId)          // lista filtrada: para las flechas
const record = i >= 0 ? rows[i] : null

<DetailSheet open={record !== null} onOpenChange={(o) => !o && setOpenId(null)}>
  {record && (
    <>
      <DetailHeader
        leading={<AvatarInitials name={record.name} size="lg" variant="entity" />}
        title={<InlineTitle parts={[{ key: "name", value: record.name, placeholder: "Nombre", required: true }]} onSave={saveMany} />}
        subtitle={\`\${record.code} · \${record.category}\`}
        status={<StatusBadge tone={phase.tone}>{phase.label}</StatusBadge>}
        nav={<RecordPager index={i} total={rows.length} label="registro" onPrev={() => setOpenId(rows[i - 1].id)} onNext={() => setOpenId(rows[i + 1].id)} />}
        actions={<>{/* outline sm + menú «…» con eliminar al final */}</>}
      />
      <Tabs key={record.id} defaultValue="resumen" className="flex min-h-0 flex-1 flex-col gap-0">
        <TabsList variant="line" className="w-full justify-start rounded-none border-b px-4">…</TabsList>
        <DetailBody>
          <TabsContent value="resumen">
            <DetailSection title="Gestión" icon={UserCogIcon} collapsible storageKey="registro.gestion" summary={resumen}>
              <DetailFields>
                <DetailField label="Fase">
                  <InlineField value={record.stage} tipo="select" required opciones={stages} onSave={save("stage")} render={badge} />
                </DetailField>
                <DetailField label="Responsable" empty={!record.owner}>
                  <InlineField value={record.owner} tipo="select" opciones={team} placeholder="Añadir responsable" onSave={save("owner")} />
                </DetailField>
              </DetailFields>
            </DetailSection>
            <DetailSection title="Tareas" icon={ListChecksIcon} count={tasks.length} collapsible
              defaultOpen={tasks.length > 0} storageKey="registro.tareas"
              action={<DetailSectionAction onClick={newTask}>Añadir</DetailSectionAction>}>
              …
            </DetailSection>
            <DetailMeta>Creado el 2 de septiembre de 2026 · actualizado hace 2 horas</DetailMeta>
          </TabsContent>
        </DetailBody>
      </Tabs>
      <DetailFooter>
        <Button variant="ghost" onClick={() => setOpenId(null)}>Cerrar</Button>
        <Button onClick={advance}><ArrowRightIcon /> Avanzar fase</Button>
      </DetailFooter>
    </>
  )}
</DetailSheet>`

const exampleCompacta = `<DetailHeader … actions={<><Button variant="outline" size="sm"><SendIcon /> Añadir a campaña</Button>…</>} />
<DetailSummary>
  <DetailLinks
    links={[
      { key: "web", label: "Web", icon: GlobeIcon, href: web, title: dominio },
      { key: "linkedin", label: "LinkedIn", icon: Linkedin, href: linkedin },
      { key: "telefono", label: "Teléfono", icon: PhoneIcon, href: telefono ? \`tel:\${telefono}\` : null },
    ]}
    editor={<DetailFields>…los mismos campos con InlineField…</DetailFields>}
  >
    2.642 seguidores
  </DetailLinks>
  <DetailFields columns={2}>
    <DetailField label="Fase">…</DetailField>
    <DetailField label="Valor">…</DetailField>
    <DetailField label="Contacto">…</DetailField>
    <DetailField label="Cierre" empty={!cierre}>…</DetailField>
  </DetailFields>
</DetailSummary>
<Tabs defaultValue="seguimiento">…
  <InteractionLog
    entries={seguimiento}
    autoEditId={recienApuntado}
    actions={<>
      <Button variant="outline" size="sm" onClick={() => apuntar("followup")}><SendIcon /> Follow-up</Button>
      <Button variant="outline" size="sm" onClick={() => apuntar("status")}><MessageSquareTextIcon /> Status</Button>
    </>}
    onSaveNote={(e, nota) => guardarNota(e.id, nota)}
    onDelete={(e) => setBorrar(e)}
  />
</Tabs>`

const exampleSplit = `<DetailSheet open={open} onOpenChange={(o) => !o && tryTo(close)} width={1040}>
  <DetailHeader … nav={<RecordPager … />} />
  <DetailSplit
    asideWidth={320}
    aside={
      <DetailSection title="Recorrido" icon={RouteIcon}>
        <StepTimeline items={steps} value={stepId} onSelect={(id) => tryTo(() => setStepId(id))} />
      </DetailSection>
    }
  >
    <div className="p-4 md:p-6">{/* el paso elegido, en grande */}</div>
  </DetailSplit>
  <DetailFooter>…</DetailFooter>
</DetailSheet>

<ConfirmDialog open={pending !== null} title="¿Descartar los cambios?" confirmLabel="Descartar cambios"
  cancelLabel="Seguir editando" destructive onConfirm={runPending} … />`

function PropsTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-mono text-[13px] font-semibold">{children}</h3>
}

export default function DetailSheetPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Sheet de detalle"
      lead="La ficha de un registro: un panel lateral que se lee de un vistazo, ordenado por bloques, y en el que cada dato se edita donde se lee. Tres zonas fijas: cabecera, cuerpo y pie."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Se abre al pulsar una fila o una tarjeta y se coloca por encima de la página, que sigue debajo con su
            búsqueda, sus filtros y su selección intactos. Es la única forma de ver un registro: nunca un modal. Desde
            la propia ficha se pasa al registro anterior o al siguiente de la lista, sin cerrarla.
          </p>
          <p>
            No hay botón «Editar»: el nombre y cada campo se editan pulsándolos. El <code>Dialog</code> de formulario
            queda solo para crear (ver <Link href="/ds/componentes/forms">Formularios</Link>).
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <code>width</code> 480 por defecto. Las fichas de dos columnas (<code>DetailSplit</code>), 960 a 1040.
              En móvil ocupa todo el ancho.
            </>,
            <>
              Se abre desde <code>onRowClick</code> de la tabla o <code>onCardClick</code> del kanban con el id del
              registro, y el id va en la URL (<code>?registro=</code>) para poder compartirlo. El estado vive en la
              página.
            </>,
            <>
              Escape cierra la ficha, salvo con el foco en un campo: entonces cancela ese campo y la ficha sigue
              abierta.
            </>,
          ]}
        />
      </DocSection>

      <DocSection
        id="ejemplo"
        title="La ficha"
        lead="Tres registros para recorrer con las flechas. Pulsa el nombre, la fase o cualquier valor para editarlo; los campos vacíos están al pie de cada bloque como «+ Campo». Pliega un bloque y abre otro registro: sigue plegado."
      >
        <Example title="Ficha por bloques, editable en el sitio" description="Cada guardado tarda un poco a propósito: el campo se atenúa mientras guarda. Un valor negativo en «Valor» devuelve un error y el campo vuelve atrás." code={example}>
          <DetailSheetDemo />
        </Example>
      </DocSection>

      <DocSection id="anatomia" title="Anatomía">
        <Rules
          items={[
            <>
              <strong>Cabecera</strong> (<code>DetailHeader</code>): avatar, nombre editable con{" "}
              <code>InlineTitle</code> (nombre y apellidos se editan juntos, uno al lado del otro), subtítulo corto
              («cargo · empresa», «código · categoría»), <code>StatusBadge</code> junto al título y{" "}
              <code>RecordPager</code> arriba a la derecha. Debajo, acciones secundarias outline <code>sm</code> y el
              menú «…» con eliminar al final, en rojo.
            </>,
            <>
              <strong>Cuerpo por bloques</strong> (<code>DetailSection</code>): primero los campos agrupados por tema,
              luego los campos propios, luego las listas relacionadas con su contador y «Añadir», y al final las notas
              internas y <code>DetailMeta</code> (creado, origen, actualizado). Con más de un tipo de contenido
              (notas, tareas, actividad), pestañas de tipo línea.
            </>,
            <>
              <strong>Bloques plegables</strong> desde su título, con icono. Con <code>storageKey</code> cada persona
              los encuentra como los dejó; plegado, el bloque enseña una línea de resumen. Las listas vacías empiezan
              plegadas.
            </>,
            <>
              <strong>Campos</strong> en <code>DetailFields</code>: etiqueta a la izquierda con el mismo ancho en toda
              la ficha, valor a la derecha. En reposo ningún valor lleva caja ni flecha: se lee como texto, insignias
              o enlaces. Al pulsar aparece su control del mismo alto (nada salta).
            </>,
            <>
              <strong>Campos vacíos</strong>: no ocupan fila. Se recogen al pie del bloque como «+ Campo»; al pulsar
              uno, el campo aparece ya editándose. Así la ficha enseña lo que se sabe y sigue invitando a completar lo
              que falta.
            </>,
            <>
              <strong>Pie</strong> (<code>DetailFooter</code>): «Cerrar» ghost y la acción principal del registro
              («Avanzar fase», «Añadir a campaña»). Cuando no aplica se deshabilita, no desaparece.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="resumen" title="Resumen arriba y seguimiento">
        <Prose>
          <p>
            Cuando la ficha se abre decenas de veces al día (prospectar, hacer seguimiento), lo que se mira siempre no
            puede estar repartido en bloques que hay que recorrer. Va arriba, en un <code>DetailSummary</code> fijo
            justo debajo de la cabecera: los enlaces del registro como iconos en una fila (<code>DetailLinks</code>: un
            clic abre el enlace, el lápiz los edita y los que faltan se ven atenuados) y sus cuatro o seis datos clave
            en dos columnas (<code>DetailFields columns={"{2}"}</code>). El perfil completo, las etiquetas y los campos
            propios pasan a una pestaña «Datos».
          </p>
          <p>
            Debajo, el trabajo. Para un registro al que se le hace seguimiento, <code>InteractionLog</code>: cada botón
            («Follow-up», «Status») <strong>crea la entrada al pulsarlo</strong>, con la fecha de hoy; la nota es
            opcional y se escribe después en la propia tarjeta. Queda el historial, lo último arriba. La tarjeta del
            kanban enseña el principio de la última entrada.
          </p>
        </Prose>
        <Example title="Resumen compacto y registro de seguimiento" description="Pulsa el icono atenuado o el lápiz para rellenar un enlace. «Status» crea la entrada con la nota ya editándose; «Follow-up» la crea sin más." code={exampleCompacta}>
          <FichaCompactaDemo />
        </Example>
        <Rules
          items={[
            <>
              <strong>Las acciones del trabajo, arriba.</strong> En la cabecera van las dos o tres que mueven el
              registro por su flujo («Normalizada», «Añadir a campaña», «Nuevo contacto»); el resto, en «…». Una acción
              que ya no aplica no se enseña.
            </>,
            <>
              <strong>Un bloque solo sale si tiene algo.</strong> Las listas relacionadas vacías («Campañas»,
              «Oportunidades») no ocupan sitio en una ficha compacta: se crean desde la cabecera o el pie.
            </>,
            <>
              <strong>Sin formulario previo.</strong> Apuntar un seguimiento cuesta un clic. Nada de diálogos para
              elegir fecha o tipo: la fecha es hoy y el tipo es el botón.
            </>,
            <>
              <strong>Cada entrada es de quien la apuntó.</strong> Con <code>locked</code> se lee, sin editor ni
              papelera. Borrar pide confirmación.
            </>,
          ]}
        />
      </DocSection>

      <DocSection
        id="dos-columnas"
        title="Ficha de dos columnas"
        lead="Para un registro que recorre una secuencia: un contacto dentro de una campaña, un pedido por sus fases. A la izquierda el recorrido; a la derecha, en grande, el paso elegido."
      >
        <Example title="Recorrido y paso en grande" description="Pulsa el mensaje 2 para editarlo solo para esta persona. Con cambios sin guardar, cambiar de paso, de contacto o cerrar pide confirmación." code={exampleSplit}>
          <FichaRecorridoDemo />
        </Example>
        <Rules
          items={[
            <>
              <code>DetailSplit</code> reparte la ficha en dos columnas con scroll propio; en móvil se apilan (el
              recorrido arriba).
            </>,
            <>
              <code>StepTimeline</code>: cada paso con su punto (hecho, lo que toca ahora, lo que vendrá, lo que no
              pasará), su insignia de estado y una línea con el día y la fecha. La ficha se abre en lo que toca ahora
              o, si la secuencia acabó, en lo último que pasó.
            </>,
            <>
              Lo que ya pasó se ve tal cual fue y no se edita. Lo que está por pasar se ve exactamente como será y,
              si tiene sentido, se edita en el sitio.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="por-registro" title="Contenido editable para un solo registro">
        <Prose>
          <p>
            Cuando un contenido sale de una plantilla (el email de un paso de campaña), cada registro lo ve{" "}
            <strong>exactamente como le llega</strong> y se puede reescribir solo para él, sin tocar la plantilla ni a
            los demás.
          </p>
        </Prose>
        <Rules
          items={[
            <>Se lee tal cual; al pasar por encima se marca y avisa «Pulsa para editar»; al pulsar pasa a editor.</>,
            <>
              «Guardar para Ana» (y ⌘+Enter) lo deja solo para esa persona. Queda la insignia «Editado a mano» y «Volver
              a la plantilla», que se deshace desde el toast.
            </>,
            <>
              En la vista previa de la plantilla, unas flechas recorren los registros empezando por los que lo tienen
              pendiente, con un buscador en el nombre. Si el registro tiene su versión editada, se dice que los
              cambios de la plantilla no le llegan.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="botones" title="Botones de acción propios">
        <Prose>
          <p>
            Tras las acciones secundarias de la cabecera, <code>RecordActions</code> pinta los botones que cada persona
            se ha creado para ese tipo de registro y un engranaje para gestionarlos. Cada botón hace una o varias cosas
            seguidas de un clic: poner un campo a un valor, añadir una etiqueta, meter el registro en una campaña. La
            página declara qué se puede hacer (<code>operaciones</code>, con sus valores o una función que los carga al
            abrir el editor) y lo ejecuta (<code>onEjecutar</code>); el kit guarda los botones y ofrece el editor.
          </p>
        </Prose>
        <Rules
          items={[
            <>Se guardan en el navegador de cada persona con la clave <code>botones:&lt;clave&gt;</code>, una por tipo de registro.</>,
            <>Crear y editar se hace en el mismo diálogo que la lista; borrar pide confirmación con el nombre del botón.</>,
            <>Mientras un botón trabaja, todos se desactivan y el suyo gira. El resultado se cuenta en un toast, con aviso si algo no se pudo hacer.</>,
            <>Si una acción necesita decidir algo (a qué contactos meter en la campaña), se pregunta en un diálogo al ejecutarla, con lo más probable ya marcado.</>,
          ]}
        />
      </DocSection>

      <DocSection id="cambios" title="Cambios sin guardar">
        <Rules
          items={[
            <>
              Si hay un editor con cambios y se va a cambiar de registro, de paso o cerrar, <code>ConfirmDialog</code>{" "}
              «¿Descartar los cambios?» con <code>cancelLabel=&quot;Seguir editando&quot;</code> y «Descartar
              cambios» destructivo.
            </>,
            <>Escape solo sale del editor si no hay cambios; con cambios no hace nada (no se pierde trabajo con una tecla).</>,
            <>Los campos sueltos no necesitan aviso: guardan al salir.</>,
          ]}
        />
      </DocSection>

      <DocSection id="html" title="HTML que no escribe el portal">
        <Prose>
          <p>
            El cuerpo de un email, una firma pegada o un documento importado se pintan en <code>HtmlFrame</code>: un
            marco aislado, sin scripts y con sus propios estilos, que crece con su contenido y toma el color del tema.
            Así ese HTML no puede cambiar los estilos de la página ni ejecutar nada. Nunca{" "}
            <code>dangerouslySetInnerHTML</code> con HTML de fuera.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <DoDont
          dos={[
            "Fila clicable que abre la ficha; las flechas pasan al siguiente sin cerrarla.",
            "Campos agrupados por tema en bloques plegables, listas relacionadas después.",
            "Valores en reposo sin cajas; el control aparece al pulsar.",
            "Campos vacíos al pie del bloque como «+ Campo».",
            "«Cerrar» ghost y una acción principal en el pie.",
          ]}
          donts={[
            "Modal centrado para ver un registro.",
            "Un botón «Editar» que abre un formulario para cambiar un dato.",
            "Una lista larga de campos sin agrupar, con los vacíos ocupando filas.",
            "Selects y cajas siempre visibles en reposo.",
            "Botón destructivo suelto en la cabecera.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <div className="flex flex-col gap-2">
          <PropsTitle>DetailSheet</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["open", <code key="t">boolean</code>, "Si está abierto. Controlado desde la página."],
              ["onOpenChange", <code key="t">(open: boolean) =&gt; void</code>, "Se llama al cerrar con Escape (fuera de un campo), la X o clic fuera."],
              ["width", <code key="t">number · 480</code>, "Ancho en px a partir de sm. 960-1040 para DetailSplit."],
              ["children", <code key="t">ReactNode</code>, "Cabecera, cuerpo y pie, en ese orden."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>DetailHeader</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["leading", <code key="t">ReactNode</code>, "AvatarInitials lg: variant=\"entity\" para registros, la variante por defecto para personas."],
              ["title", <code key="t">ReactNode</code>, "El nombre: un texto o un InlineTitle para editarlo en el sitio."],
              ["subtitle", <code key="t">ReactNode</code>, "Una línea corta. Se trunca."],
              ["status", <code key="t">ReactNode</code>, "StatusBadge a la derecha del título."],
              ["nav", <code key="t">ReactNode</code>, "RecordPager, arriba a la derecha."],
              ["actions", <code key="t">ReactNode</code>, "Botones outline sm y menú «…», en una segunda fila."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>DetailSection</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["title", <code key="t">ReactNode</code>, "Título de 13 px."],
              ["icon", <code key="t">LucideIcon</code>, "Icono del bloque, en gris."],
              ["count", <code key="t">number</code>, "Nº de elementos de una lista relacionada."],
              ["action", <code key="t">ReactNode</code>, "DetailSectionAction («Añadir», «Nuevo campo») o un ConfigButton."],
              ["collapsible", <code key="t">boolean</code>, "Se pliega desde el título."],
              ["defaultOpen", <code key="t">boolean · true</code>, "Cómo empieza. false para listas vacías."],
              ["storageKey", <code key="t">string</code>, "Recuerda si está plegado, por tipo de ficha y bloque: «contacto.gestion»."],
              ["summary", <code key="t">ReactNode</code>, "Lo que se lee con el bloque plegado."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>DetailField</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["label", <code key="t">ReactNode</code>, "Etiqueta en gris, columna izquierda de ancho fijo."],
              ["empty", <code key="t">boolean</code>, "El campo no tiene valor: DetailFields lo recoge como «+ Campo»."],
              ["onConfig", <code key="t">() =&gt; void</code>, "Pulsar la etiqueta abre la configuración del campo (sus opciones, su tipo)."],
              ["children", <code key="t">ReactNode</code>, "El valor: normalmente un InlineField."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>InlineField</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["value", <code key="t">string · number · boolean · string[] · null</code>, "El valor actual."],
              ["tipo", <code key="t">texto · textarea · numero · fecha · url · email · telefono · select · multiselect · booleano</code>, "Decide el control al editar."],
              ["onSave", <code key="t">(v) =&gt; Promise&lt;string | void&gt;</code>, "Guarda. Devuelve el mensaje de error, o nada."],
              ["render", <code key="t">(v) =&gt; ReactNode</code>, "Cómo se lee en reposo: insignias, enlaces, cifras."],
              ["opciones", <code key="t">{"{ value, label }[]"}</code>, "Para select y multiselect."],
              ["required", <code key="t">boolean</code>, "select sin «Sin valor»."],
              ["placeholder", <code key="t">string</code>, "«Añadir …», lo que se lee si está vacío."],
              ["readOnly", <code key="t">boolean</code>, "Se ve pero no se edita."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>InlineTitle</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["parts", <code key="t">{"{ key, value, placeholder, required? }[]"}</code>, "Las partes del nombre; se editan juntas."],
              ["onSave", <code key="t">(values) =&gt; Promise&lt;string | void&gt;</code>, "Guarda todas a la vez."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>RecordPager</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["index · total", <code key="t">number</code>, "Posición (desde 0) y tamaño de la lista filtrada. Con uno solo, no se pinta."],
              ["onPrev · onNext", <code key="t">() =&gt; void</code>, "Abren el anterior o el siguiente."],
              ["label", <code key="t">string · registro</code>, "Lo que se recorre, para los textos de ayuda."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>DetailSplit · StepTimeline · HtmlFrame</PropsTitle>
          <SpecTable
            columns={["Pieza", "Props", "Descripción"]}
            rows={[
              ["DetailSplit", <code key="t">aside, asideWidth · 300</code>, "Dos columnas con scroll propio; se apilan en móvil."],
              ["StepTimeline", <code key="t">{"items: { id, title, meta, status, icon, state }[], value, onSelect"}</code>, "state: done · current · upcoming · off."],
              ["HtmlFrame", <code key="t">html, onClick, interceptarEnlaces</code>, "HTML de fuera en un marco aislado que crece con su contenido."],
            ]}
          />
        </div>
        <Prose>
          <p>
            <code>DetailBody</code>, <code>DetailFields</code>, <code>DetailMeta</code> y <code>DetailFooter</code>{" "}
            aceptan las props de su elemento (<code>className</code>, <code>children</code>).
          </p>
        </Prose>
        <div className="flex flex-col gap-2">
          <PropsTitle>DetailSummary, DetailLinks e InteractionLog</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["DetailFields columns", <code key="t">1 | 2 · 1</code>, "Con 2, los campos van en dos columnas (datos cortos) y vuelven a una cuando la ficha se estrecha."],
              ["DetailLinks links", <code key="t">DetailLink[]</code>, "key, label, icon y href. Sin href el enlace está vacío: se pinta atenuado y al pulsarlo se abre el editor."],
              ["DetailLinks editor", <code key="t">ReactNode</code>, "Los mismos campos con InlineField. Se abre con el lápiz, en un popover."],
              ["DetailLinks children", <code key="t">ReactNode</code>, "Algo más en la misma fila, a la derecha (una cifra)."],
              ["InteractionLog entries", <code key="t">LogEntry[]</code>, "id, title, date, note, author, icon, tone y locked. Lo último, primero."],
              ["InteractionLog actions", <code key="t">ReactNode</code>, "Botones outline sm que crean una entrada."],
              ["InteractionLog onSaveNote", <code key="t">(entry, note) =&gt; Promise&lt;string | void&gt;</code>, "Si se pasa, la nota se edita en el sitio. Devuelve el error o nada."],
              ["InteractionLog onDelete", <code key="t">(entry) =&gt; void</code>, "Papelera al pasar el ratón. La página confirma."],
              ["InteractionLog autoEditId", <code key="t">string | null</code>, "Entrada recién creada cuya nota arranca editándose."],
            ]}
          />
        </div>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/detail-sheet.json" />
        <Prose>
          <p>
            Trae <code>inline-field</code> y <code>multi-select</code>. Para la ficha de dos columnas, además{" "}
            <code>step-timeline</code> y <code>html-frame</code>. Para el registro de seguimiento,{" "}
            <code>interaction-log</code>; los iconos de LinkedIn e Instagram de <code>DetailLinks</code> salen de{" "}
            <code>social-icons</code>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "Edición en el sitio, configuración in situ y cambios sin guardar." },
            { href: "/ds/componentes/data-table", label: "Tabla de datos", text: "La fila clicable que abre la ficha." },
            { href: "/ds/componentes/forms", label: "Formularios", text: "El Dialog de 480 px para crear." },
            { href: "/ds/componentes/feedback", label: "Feedback", text: "Confirmación para eliminar, «Deshacer» para lo reversible." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
