import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/app/status-badge"
import { DocPage, DocSection, DoDont, Example, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import {
  DocCellLines,
  DocCellTitle,
  DocKeyFacts,
  DocNotice,
  DocSimpleSection,
  DocSimpleTitle,
  DocTable,
  DocTerms,
  DocText,
} from "@/components/document/simple"

export const metadata = { title: "Propuesta simple" }

const code = `import { DocViewer } from "@/components/document/sheet"
import { DocToolbar } from "@/components/document/toolbar"
import { DocSimpleSheet, DocSimpleTitle, DocKeyFacts, DocSimpleSection, DocText, DocTable, DocTerms } from "@/components/document/simple"

const FOOTER = "Visibilidad en Google · Cliente y Astratic Network Devs"

export default function Page() {
  return (
    <DocViewer pages={2} toolbar={<DocToolbar title="Propuesta Cliente" />}>
      <DocSimpleSheet footer={FOOTER}>
        <DocSimpleTitle title="Visibilidad en Google para Cliente">Plan de trabajo mensual para…</DocSimpleTitle>
        <DocKeyFacts items={[{ label: "Cuota", value: "250 € al mes" }, { label: "Ámbito", value: "Google Maps y web" }]} />
        <DocSimpleSection title="Situación actual">
          <DocText>He revisado…</DocText>
          <DocTable columns={[{ label: "Punto" }, { label: "Área", className: "w-[110px] text-muted-foreground" }, { label: "Impacto", className: "w-[76px]" }]} rows={…} />
        </DocSimpleSection>
        <DocSimpleSection title="Condiciones">
          <DocTerms items={[{ label: "Cuota", value: "250 € al mes" }, …]} />
        </DocSimpleSection>
      </DocSimpleSheet>
      <DocSimpleSheet footer={FOOTER}>{/* Plan de trabajo, aviso, qué necesito y conformidad */}</DocSimpleSheet>
    </DocViewer>
  )
}`

function Paper({ children }: { children: React.ReactNode }) {
  return <div className="theme-light bg-background px-[58px] pt-2 pb-10 text-[12px] leading-[1.65] text-foreground">{children}</div>
}

export default function PropuestaSimpleDocPage() {
  return (
    <DocPage
      eyebrow="Documentos"
      title="Propuesta simple"
      lead="Para servicios y trabajos que no son un portal: una web, SEO, una mensualidad o un presupuesto corto. Una o dos hojas sin portada que se leen de arriba abajo. Es la maqueta de la propuesta a Feel The Diving."
    >
      <div className="-mt-6">
        <Button asChild>
          <Link href="/documentos/propuesta-simple">
            Abrir la demo <ArrowUpRightIcon />
          </Link>
        </Button>
      </div>

      <DocSection id="estructura" title="Estructura" lead="De arriba abajo. Lo que no aplica se quita; el orden no cambia.">
        <SpecTable
          columns={["Parte", "Qué lleva", "Componente"]}
          rows={[
            ["Hoja", "Logo arriba en cada hoja, márgenes de 58 px y pie con el título y «1 / 2».", <code key="c">DocSimpleSheet</code>],
            ["Título", "Qué se propone y para quién, con una entradilla de dos líneas.", <code key="c">DocSimpleTitle</code>],
            ["Cifras clave", "De 2 a 4: precio o cuota, plazo, ámbito, mantenimiento.", <code key="c">DocKeyFacts</code>],
            ["Situación actual", "Qué se ha revisado y una tabla de puntos con área e impacto.", <code key="c">DocTable · StatusBadge</code>],
            ["Por qué", "Un párrafo que justifica por dónde se empieza.", <code key="c">DocSimpleSection · DocText</code>],
            ["Condiciones", "Precio, qué incluye, propiedad y qué no incluye.", <code key="c">DocTerms</code>],
            ["Plan de trabajo", "Por momentos (semana, mes) con badge de fase y líneas que empiezan en negrita.", <code key="c">DocTable · DocCellTitle · DocCellLines</code>],
            ["Aviso", "Lo que no se puede garantizar o de qué depende el plazo.", <code key="c">DocNotice</code>],
            ["Qué necesito", "Accesos y material del cliente, con «Hecho» cuando ya está.", <code key="c">DocList</code>],
            ["Conformidad", "Firma, nombre y fecha de las dos partes; el de Astratic ya puesto.", <code key="c">DocSignOff</code>],
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Cómo se ve">
        <Example padded={false} description="Título, cifras clave, situación y condiciones, a tamaño real.">
          <Paper>
            <DocSimpleTitle title="Visibilidad en Google para Cliente">
              Plan de trabajo mensual para mejorar cómo aparece el negocio en Google Maps, en la web y con contenido propio.
            </DocSimpleTitle>
            <DocKeyFacts
              items={[
                { label: "Cuota", value: "250 € al mes" },
                { label: "Ámbito", value: "Google Maps, web y blog" },
                { label: "Blog", value: "1 artículo al mes" },
              ]}
            />
            <DocSimpleSection title="Situación actual">
              <DocTable
                columns={[{ label: "Punto" }, { label: "Área", className: "w-[110px] text-muted-foreground" }, { label: "Impacto", className: "w-[76px]" }]}
                rows={[
                  ["El negocio todavía no aparece en Google Maps", "Google Maps", <StatusBadge key="b" tone="info" dot>Alto</StatusBadge>],
                  ["Varias descripciones de Google tienen faltas de ortografía", "SEO", <StatusBadge key="b" dot>Medio</StatusBadge>],
                ]}
              />
            </DocSimpleSection>
            <DocSimpleSection title="Plan de trabajo">
              <DocTable
                columns={[{ label: "Momento", className: "w-[135px]" }, { label: "Qué se hace" }]}
                rows={[
                  [
                    <DocCellTitle key="m" badge={<StatusBadge tone="info" dot>Base</StatusBadge>}>Mes 1</DocCellTitle>,
                    <DocCellLines key="l" items={[{ lead: "Google Maps", text: "Dar de alta la ficha del negocio." }, { lead: "Web", text: "Metadatos, ortografía e idiomas." }]} />,
                  ],
                ]}
              />
              <DocNotice>Nadie puede garantizar una posición concreta en Google. Lo que sí se garantiza es el trabajo de cada mes.</DocNotice>
            </DocSimpleSection>
            <DocSimpleSection title="Condiciones">
              <DocTerms
                items={[
                  { label: "Cuota", value: "250 € al mes" },
                  { label: "No incluye", value: "Anuncios en Google Ads, redes sociales y web nueva" },
                ]}
              />
              <DocText muted>Precios sin IVA.</DocText>
            </DocSimpleSection>
          </Paper>
        </Example>
        <CodeBlock code={code} lang="tsx" />
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <><strong>Sin portada, índice ni acento.</strong> El único color son los badges de estado (<code>info</code> para impacto alto y fases de trabajo, <code>success</code> para publicado o hecho, <code>neutral</code> para el resto).</>,
            <><strong>Tablas de lectura:</strong> cabecera gris pequeña, línea negra debajo y filas con filo gris. Sin bordes laterales ni fondos.</>,
            <><strong>Primera persona y tono directo</strong> («He revisado», «Qué necesito»), en el idioma del cliente.</>,
            <><strong>Un aviso honesto</strong> sobre lo que no depende de nosotros (posiciones en Google, plazos que dependen del cliente).</>,
            <><strong>Máximo dos hojas</strong> para un trabajo normal. Si pide más, probablemente es una propuesta elaborada.</>,
          ]}
        />
        <DoDont
          dos={["Cifras clave arriba para que el precio se vea sin leer nada más.", "Qué no incluye, siempre escrito."]}
          donts={["Tarjetas, sombras o bloques negros: eso es de la elaborada.", "Párrafos largos de venta: una situación, un porqué y el plan."]}
        />
        <Prose>
          <p>
            La demo completa está en <Link href="/documentos/propuesta-simple">/documentos/propuesta-simple</Link>.
          </p>
        </Prose>
      </DocSection>
    </DocPage>
  )
}
