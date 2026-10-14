import type { Metadata } from "next"
import { DocToolbar } from "@/components/document/toolbar"
import {
  GuideBook,
  GuideChapter,
  GuideCover,
  GuidePart,
  GuideSources,
  GuideStats,
  GuideToc,
  type GuideTocPart,
} from "@/components/document/guide"
import { GuideMarkdown } from "@/components/document/guide-markdown"

export const metadata: Metadata = { title: "Guía de ejemplo" }

/* Demo del formato «Guía»: una guía corta de uso del portal para el equipo de un cliente inventado. */

const partes: GuideTocPart[] = [
  {
    number: "1",
    title: "Antes de empezar",
    chapters: [
      { id: "acceso", number: "1.1", title: "Entrar al portal" },
      { id: "pantalla", number: "1.2", title: "Cómo se lee una pantalla" },
    ],
  },
  {
    number: "2",
    title: "El día a día",
    chapters: [{ id: "pedidos", number: "2.1", title: "Registrar un pedido" }],
  },
]

const acceso = `
Cada persona del equipo entra con su cuenta de Google de la empresa. No hay contraseñas que recordar ni que compartir: si la cuenta existe en el dominio, entra; si no, el portal la rechaza.

> [!consejo] Guarda el acceso directo
> La dirección es la misma en el ordenador y en el móvil. En el móvil, «Añadir a pantalla de inicio» la deja como una app más.

## Lo que ves al entrar

La primera pantalla es el panel: las cifras del día, lo que está pendiente y los últimos movimientos. Cada cifra lleva a su lista.

| Cifra | Qué cuenta | De dónde sale |
|---|---|---|
| Pedidos de hoy | Los que entraron desde las 0:00 | Pedidos, filtrados por fecha |
| Por entregar | Los que no tienen fecha de entrega | Pedidos, estado «Preparado» |
| Incidencias | Las abiertas | Incidencias, estado «Abierta» |

> [!ojo]
> Si una cifra sale a cero cuando no debería, lo primero es mirar el filtro de fecha del panel, que se queda guardado.

\`\`\`figura
cifras
\`\`\`
`

const pantalla = `
Todas las pantallas del portal siguen la misma anatomía, así que aprender una es aprenderlas todas.

## Las cuatro zonas

1. **Cabecera**, con el título y las acciones principales a la derecha.
2. **Cifras**, cuatro como mucho, que resumen lo que hay debajo.
3. **La tabla**, con el buscador, los filtros y las vistas guardadas.
4. **La ficha**, que se abre a la derecha al pulsar una fila, sin salir de la lista.

> [!dato] Las vistas se guardan solas
> Cada filtro, orden y agrupación que dejes puesto se recuerda por persona y por pantalla.

> [!ejemplo]
> Marta filtra los pedidos de Barcelona con estado «Preparado» y los agrupa por transportista. Al día siguiente la pantalla se abre igual.
`

const pedidos = `
Un pedido se registra desde el botón «Nuevo pedido» de la cabecera o pegando el email del cliente en la bandeja de entrada del portal, que lo lee y rellena los campos que reconoce.

## Lo que hay que rellenar

- Cliente, buscando por nombre o CIF.
- Líneas, con producto, cantidad y precio. El total se calcula solo.
- Fecha de entrega comprometida, que es la que vigila el panel.

> [!ley] Facturas
> La factura no sale del portal: se prepara aquí con todos los datos y se emite en el programa de facturación, que es el que cumple con Verifactu.

## Antes de dar el pedido por cerrado

- [ ] El cliente ha confirmado la fecha.
- [ ] Las líneas coinciden con el albarán.
- [ ] La factura está emitida y apuntada en el pedido.

> [!resumen]
> Un pedido entra por botón o por email, se completa con cliente, líneas y fecha, y se cierra cuando la factura está emitida y apuntada.
`

export default function GuiaDemoPage() {
  return (
    <GuideBook toolbar={<DocToolbar title="Guía de ejemplo" meta="Formato guía" />} footer="Guía del portal · Portal Rumbo">
      <GuideCover
        eyebrow="Guía"
        meta="Portal Rumbo · Edición 2026"
        title={
          <>
            El portal,
            <br />
            explicado para el equipo
          </>
        }
        lead="Cómo se entra, cómo se lee cada pantalla y cómo se registra el trabajo del día. Una guía corta para leer el primer día y volver cuando haga falta."
        footer={["Astratic Network", "Ejemplo del formato guía"]}
      />
      <section className="mb-6">
        <h2 className="mb-5 text-[22px] font-semibold tracking-[-0.02em]">Contenido</h2>
        <GuideToc parts={partes} pages={{ acceso: 3, pantalla: 4, pedidos: 6 }} />
      </section>
      <GuidePart number="1" title="Antes de empezar" lead="Lo que conviene saber el primer día." chapters={partes[0].chapters} />
      <GuideChapter id="acceso" number="1.1" title="Entrar al portal" lead="Con la cuenta de la empresa, desde cualquier sitio." minutes={2}>
        <GuideMarkdown
          source={acceso}
          figures={{
            cifras: (
              <GuideStats
                items={[
                  { value: "24", label: "Pedidos de hoy" },
                  { value: "7", label: "Por entregar" },
                  { value: "1", label: "Incidencias abiertas" },
                ]}
                source="Datos de ejemplo."
              />
            ),
          }}
        />
      </GuideChapter>
      <GuideChapter id="pantalla" number="1.2" title="Cómo se lee una pantalla" minutes={3}>
        <GuideMarkdown source={pantalla} />
      </GuideChapter>
      <GuidePart number="2" title="El día a día" chapters={partes[1].chapters} />
      <GuideChapter id="pedidos" number="2.1" title="Registrar un pedido" minutes={4}>
        <GuideMarkdown source={pedidos} />
      </GuideChapter>
      <section className="break-before-page">
        <h2 className="mb-5 text-[22px] font-semibold tracking-[-0.02em]">Fuentes</h2>
        <GuideSources
          items={[
            { title: "Manual del portal", by: "Astratic Network", note: "Documento interno del proyecto" },
            { title: "Reglamento de facturación", by: "BOE", url: "https://www.boe.es/buscar/act.php?id=BOE-A-2012-14696" },
          ]}
        />
      </section>
    </GuideBook>
  )
}
