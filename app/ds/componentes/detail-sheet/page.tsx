import Link from "next/link"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { DetailSheetDemo } from "@/components/docs/examples/detail-sheet-demo"

export const metadata = { title: "Sheet de detalle" }

const example = `const [openId, setOpenId] = React.useState<string | null>(null)
const record = records.find((r) => r.id === openId)

<DetailSheet open={record !== undefined} onOpenChange={(o) => !o && setOpenId(null)}>
  {record && (
    <>
      <DetailHeader
        leading={<AvatarInitials name={record.name} size="lg" variant="entity" />}
        title={record.name}
        subtitle={\`\${record.code} · \${record.category}\`}
        status={<StatusBadge tone={phase.tone}>{phase.label}</StatusBadge>}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={edit}><PenLineIcon /> Editar</Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={\`/registros/\${record.id}\`}><ExternalLinkIcon /> Abrir página</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" aria-label="Más acciones" className="ml-auto"><EllipsisIcon /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={duplicate}><CopyIcon /> Duplicar</DropdownMenuItem>
                <DropdownMenuItem onClick={archive}><ArchiveIcon /> Archivar</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setConfirm(true)}><Trash2Icon /> Eliminar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <Tabs defaultValue="resumen" className="flex min-h-0 flex-1 flex-col gap-0">
        <TabsList variant="line" className="w-full justify-start rounded-none border-b px-4">
          <TabsTrigger value="resumen" className="flex-none">Resumen</TabsTrigger>
          <TabsTrigger value="actividad" className="flex-none">Actividad</TabsTrigger>
        </TabsList>
        <DetailBody>
          <TabsContent value="resumen">
            <DetailSection title="Datos">
              <DetailFields>
                <DetailField label="Responsable">{record.owner}</DetailField>
                <DetailField label="Fase">
                  <Select value={record.stage} onValueChange={setStage}>
                    <SelectTrigger size="sm" className="h-7 w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>{stages.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent>
                  </Select>
                </DetailField>
                <DetailField label="Valor"><span className="font-semibold tabular-nums">{fmt.eur(record.value)}</span></DetailField>
                <DetailField label="Vencimiento">{fmt.dateLong(record.dueAt)}</DetailField>
              </DetailFields>
            </DetailSection>
          </TabsContent>
          <TabsContent value="actividad">…</TabsContent>
        </DetailBody>
      </Tabs>

      <DetailFooter>
        <Button variant="ghost" onClick={() => setOpenId(null)}>Cerrar</Button>
        <Button onClick={advance} disabled={record.stage === "ganado"}><ArrowRightIcon /> Avanzar fase</Button>
      </DetailFooter>
    </>
  )}
</DetailSheet>`

function PropsTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-mono text-[13px] font-semibold">{children}</h3>
}

export default function DetailSheetPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Sheet de detalle"
      lead="El panel lateral derecho donde se lee y se opera un registro sin salir de la página. Tres zonas fijas: cabecera, cuerpo y pie."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Se abre al pulsar una fila o una tarjeta y se coloca por encima de la página, que sigue debajo con su
            búsqueda, sus filtros y su selección intactos. Es la única forma de ver un registro: nunca un modal, y solo
            una página propia cuando la ficha es larga (campañas, eventos). En ese caso el sheet sigue existiendo como
            vista rápida y ofrece «Abrir página» en la cabecera.
          </p>
          <p>
            Las reglas de comportamiento (qué va en cada zona, edición inline, cierre) están en{" "}
            <Link href="/ds/patrones/convenciones#sheet">Convenciones</Link>. Aquí, el componente.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <code>width</code> 440 por defecto. 400 para fichas simples: un solo bloque de campos y sin pestañas.
            </>,
            <>
              El sheet muestra un registro que ya existe. Crear y editar es un <code>Dialog</code> de 480 px (ver
              Formularios); solo los campos de estado (fase, responsable) se editan inline dentro del sheet.
            </>,
            <>
              Se abre desde <code>onRowClick</code> de la tabla o <code>onCardClick</code> del kanban con el id del
              registro. El estado <code>openId</code> vive en la página, no en el componente.
            </>,
          ]}
        />
      </DocSection>

      <DocSection
        id="ejemplo"
        title="Ejemplo"
        lead="Un registro con cabecera completa, dos pestañas, cinco campos y pie con la acción principal. Se cierra con Escape, con la X o pulsando fuera."
      >
        <Example title="Registro con pestañas y acciones" description="La fase se edita inline con un Select pequeño; eliminar pasa por el diálogo de confirmación." code={example}>
          <DetailSheetDemo />
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              <strong>Tres zonas fijas.</strong> <code>DetailHeader</code>: avatar o monograma, título, subtítulo
              «código · categoría», badge de estado y acciones. <code>DetailBody</code>: scroll propio y pestañas de
              tipo línea si hay más de un bloque. <code>DetailFooter</code>: «Cerrar» ghost a la izquierda de la
              acción principal.
            </>,
            <>
              <strong>Una sola acción principal en el pie:</strong> la siguiente cosa útil que se puede hacer con el
              registro («Avanzar fase», «Enviar», «Cobrar»). Cuando no aplica se deshabilita, no desaparece.
            </>,
            <>
              Acciones secundarias en la cabecera como outline <code>sm</code> («Editar», «Copiar enlace», «Abrir
              página»). Duplicar, archivar y eliminar van en el menú «…», con eliminar en{" "}
              <code>variant=&quot;destructive&quot;</code> y separado del resto.
            </>,
            <>
              Edición inline solo de campos de estado (fase, responsable) con <code>Select</code> y{" "}
              <code>SelectTrigger size=&quot;sm&quot;</code>. Todo lo demás se edita con «Editar», que abre el
              formulario.
            </>,
            <>
              Los campos van en <code>DetailFields</code> (lista de definición «etiqueta · valor») dentro de un{" "}
              <code>DetailSection</code> con título de 13 px. Cifras con <code>tabular-nums</code>, fechas con{" "}
              <code>fmt.dateLong</code>.
            </>,
            <>
              «Abrir página» en la cabecera cuando el registro tiene página propia. El sheet es entonces la vista
              rápida y no repite toda la ficha.
            </>,
            <>
              Cierra con Escape y con clic fuera sin guardar nada. Si hay edición pendiente, ocurre en el diálogo, no
              en el sheet.
            </>,
            <>
              En móvil ocupa el ancho completo; <code>width</code> solo aplica a partir de <code>sm</code>.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "Fila clicable que abre el sheet; el detalle no navega.",
            "Badge de estado junto al título, no perdido en el cuerpo.",
            "«Cerrar» ghost y una acción principal en el pie.",
            "Menú «…» para duplicar, archivar y eliminar.",
          ]}
          donts={[
            "Modal centrado para ver un registro.",
            "Dos botones principales en el pie.",
            "Formulario completo dentro del sheet.",
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
              ["onOpenChange", <code key="t">(open: boolean) =&gt; void</code>, "Se llama al cerrar con Escape, la X o clic fuera."],
              ["width", <code key="t">number · 440</code>, "Ancho en px a partir de sm. En móvil ocupa todo el ancho."],
              ["className", <code key="t">string</code>, "Clases extra para el contenedor del sheet."],
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
              ["title", <code key="t">ReactNode</code>, "Nombre del registro."],
              ["subtitle", <code key="t">ReactNode</code>, "Una línea: «código · categoría». Se trunca."],
              ["status", <code key="t">ReactNode</code>, "StatusBadge a la derecha del título."],
              ["actions", <code key="t">ReactNode</code>, "Botones outline sm y menú «…». Van en una segunda fila."],
              ["className", <code key="t">string</code>, "Clases extra."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>DetailSection</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["title", <code key="t">ReactNode</code>, "Título de 13 px."],
              ["action", <code key="t">ReactNode</code>, "Enlace o botón de texto a la derecha del título («Añadir»)."],
              ["className", <code key="t">string</code>, "Clases extra."],
              ["children", <code key="t">ReactNode</code>, "DetailFields, una lista, un progreso."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>DetailField</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["label", <code key="t">ReactNode</code>, "Etiqueta en gris, columna izquierda."],
              ["children", <code key="t">ReactNode</code>, "Valor: texto, badge, avatar con nombre o Select pequeño."],
            ]}
          />
        </div>
        <Prose>
          <p>
            <code>DetailBody</code>, <code>DetailFields</code> y <code>DetailFooter</code> no tienen props propias:
            aceptan las de un <code>div</code> (<code>className</code>, <code>children</code>).{" "}
            <code>DetailFields</code> renderiza una <code>dl</code> a dos columnas y cada <code>DetailField</code> su
            par <code>dt</code> y <code>dd</code>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/detail-sheet.json" />
        <Prose>
          <p>
            Añade <code>sheet</code> de shadcn si no está. El ejemplo usa además <code>avatar-initials</code>,{" "}
            <code>status-badge</code> y <code>confirm-dialog</code>, que se instalan igual.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "Las tres zonas del sheet y las interacciones fijas." },
            { href: "/ds/componentes/data-table", label: "Tabla de datos", text: "La fila clicable que abre el sheet." },
            { href: "/ds/componentes/forms", label: "Formularios", text: "El Dialog de 480 px para crear y editar." },
            { href: "/ds/componentes/feedback", label: "Feedback", text: "Confirmación para eliminar, «Deshacer» para archivar." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
