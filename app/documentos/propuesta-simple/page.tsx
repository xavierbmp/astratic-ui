import type { Metadata } from "next"
import { StatusBadge } from "@/components/app/status-badge"
import { DocViewer } from "@/components/document/sheet"
import {
  DocCellLines,
  DocCellTitle,
  DocKeyFacts,
  DocList,
  DocNotice,
  DocSignOff,
  DocSimpleSection,
  DocSimpleSheet,
  DocSimpleTitle,
  DocTable,
  DocTerms,
  DocText,
} from "@/components/document/simple"
import { DocToolbar } from "@/components/document/toolbar"

export const metadata: Metadata = { title: "Propuesta simple demo · Brisa Pilates" }

/*
 * Propuesta simple de ejemplo para un cliente ficticio (Brisa Pilates). Enseña todas las piezas de
 * components/document/simple compuestas como un documento real de dos hojas.
 */

const FOOTER = "Web nueva y reservas · Brisa Pilates y Astratic Network Devs"

export default function PropuestaSimpleDemoPage() {
  return (
    <DocViewer
      pages={2}
      toolbar={<DocToolbar title="Propuesta Brisa Pilates" meta="Documento de ejemplo · A4 · 2 hojas" backHref="/ds/documentos/simple" />}
    >
      <DocSimpleSheet footer={FOOTER}>
        <DocSimpleTitle title="Web nueva y reservas online para Brisa Pilates">
          Propuesta para rehacer la web del estudio, que las alumnas reserven clase desde el móvil y que Brisa aparezca bien
          en Google cuando alguien busca pilates en la zona.
        </DocSimpleTitle>

        <DocKeyFacts
          items={[
            { label: "Precio", value: "1.900 €" },
            { label: "Plazo", value: "4 semanas" },
            { label: "Mantenimiento", value: "35 € al mes" },
          ]}
        />

        <DocSimpleSection title="Situación actual">
          <DocText>
            He revisado la web actual, la ficha de Google y cómo se gestionan hoy las reservas. Esto es lo que más frena ahora
            mismo:
          </DocText>
          <DocTable
            columns={[{ label: "Punto" }, { label: "Área", className: "w-[110px] text-muted-foreground" }, { label: "Impacto", className: "w-[76px]" }]}
            rows={[
              ["La web no se ve bien en el móvil, que es desde donde entra casi todo el mundo", "Web", <Impact key="i" level="alto" />],
              ["Las reservas se hacen por WhatsApp y a veces se pierden mensajes", "Reservas", <Impact key="i" level="alto" />],
              ["Los horarios y los precios de la web no están actualizados", "Web", <Impact key="i" level="alto" />],
              ["La ficha de Google no tiene fotos ni horario", "Google", <Impact key="i" level="medio" />],
              ["La web tarda en cargar desde el móvil", "Web", <Impact key="i" level="medio" />],
              ["No hay forma de dejar el email para enterarse de clases nuevas", "Contenido", <Impact key="i" level="medio" />],
            ]}
          />
        </DocSimpleSection>

        <DocSimpleSection title="Por qué empezar por las reservas">
          <DocText>
            La mayoría de mensajes que llegan al estudio son para preguntar si queda sitio en una clase. Si la reserva se hace
            desde la web, las alumnas ven al momento qué clases tienen plazas y el estudio deja de cuadrar horarios por
            WhatsApp. Por eso es lo primero que montaría.
          </DocText>
        </DocSimpleSection>

        <DocSimpleSection title="Condiciones">
          <DocTerms
            items={[
              { label: "Precio", value: "1.900 €, la mitad al empezar y la otra mitad al publicar la web" },
              { label: "Mantenimiento", value: "35 € al mes desde el segundo mes: copias, actualizaciones y cambios pequeños" },
              { label: "Incluye", value: "Diseño, textos, reservas online, ficha de Google y una hora de formación" },
              { label: "Propiedad", value: "La web, el dominio y los contenidos son vuestros" },
              { label: "No incluye", value: "Sesiones de fotos, anuncios en Google o redes y la cuota de la herramienta de reservas" },
            ]}
          />
          <DocText muted>Precios sin IVA.</DocText>
        </DocSimpleSection>
      </DocSimpleSheet>

      <DocSimpleSheet footer={FOOTER}>
        <DocSimpleSection title="Plan de trabajo" className="mt-[38px]">
          <DocTable
            columns={[{ label: "Momento", className: "w-[135px]" }, { label: "Qué se hace" }]}
            rows={[
              [
                <DocCellTitle key="m" badge={<StatusBadge tone="info" dot>Base</StatusBadge>}>
                  Semana 1
                </DocCellTitle>,
                <DocCellLines
                  key="l"
                  items={[
                    { lead: "Contenido", text: "Reunión de una hora para cerrar clases, horarios, precios y fotos." },
                    { lead: "Diseño", text: "Propuesta de portada y de la página de clases para validarla antes de montar el resto." },
                  ]}
                />,
              ],
              [
                <DocCellTitle key="m" badge={<StatusBadge tone="info" dot>Web</StatusBadge>}>
                  Semanas 2 y 3
                </DocCellTitle>,
                <DocCellLines
                  key="l"
                  items={[
                    { lead: "Web", text: "Montaje de todas las páginas, pensadas primero para el móvil." },
                    { lead: "Reservas", text: "Calendario de clases con plazas y un email de confirmación en cada reserva." },
                  ]}
                />,
              ],
              [
                <DocCellTitle key="m" badge={<StatusBadge tone="success" dot>Publicación</StatusBadge>}>
                  Semana 4
                </DocCellTitle>,
                <DocCellLines
                  key="l"
                  items={[
                    { lead: "Google", text: "Ficha completa con fotos, horario y enlace directo a las reservas." },
                    { lead: "Formación", text: "Una hora para que el estudio cambie horarios y precios sin depender de nadie." },
                  ]}
                />,
              ],
              [
                <DocCellTitle key="m" badge={<StatusBadge dot>Continuo</StatusBadge>}>
                  Desde el mes 2
                </DocCellTitle>,
                <DocCellLines key="l" items={[{ lead: "Mantenimiento", text: "Copias, actualizaciones y cambios pequeños cada mes." }]} />,
              ],
            ]}
          />
          <DocNotice>
            Los plazos cuentan desde que tenga el contenido de la semana 1. Si las fotos o los textos se retrasan, la
            publicación se mueve lo mismo.
          </DocNotice>
        </DocSimpleSection>

        <DocSimpleSection title="Qué necesito">
          <DocList
            items={[
              { label: "Acceso al dominio actual", status: <StatusBadge tone="success" dot>Hecho</StatusBadge> },
              { label: "Clases, horarios y precios actualizados" },
              { label: "Fotos del estudio y de las clases, en una carpeta de Drive o similar" },
              { label: "Acceso a la ficha de Google del estudio" },
            ]}
          />
        </DocSimpleSection>

        <DocSimpleSection title="Conformidad">
          <DocSignOff parties={[{ name: "Brisa Pilates" }, { name: "Astratic Network Devs", signer: "Xavier Motjé" }]} />
        </DocSimpleSection>
      </DocSimpleSheet>
    </DocViewer>
  )
}

function Impact({ level }: { level: "alto" | "medio" | "bajo" }) {
  if (level === "alto") return <StatusBadge tone="info" dot>Alto</StatusBadge>
  if (level === "medio") return <StatusBadge dot>Medio</StatusBadge>
  return <StatusBadge dot>Bajo</StatusBadge>
}
