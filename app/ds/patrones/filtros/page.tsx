import { DocPage, DocSection, DoDont, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Filtros y vistas" }

const MODELO = `// Lo que guarda cada persona de una base (ConfigBase): sus vistas, la abierta y su formulario.
type VistaBase = {
  id: string; nombre: string
  tipo?: "cuadricula" | "kanban" | "galeria" | "calendario"
  apilar?: string            // kanban: el campo de las columnas
  fecha?: string             // calendario: el campo de fecha
  filtro: GrupoCondiciones   // { union: "y" | "o", condiciones, grupos? } (hasta 3 niveles)
  orden: Orden[]; grupos: Agrupacion[]
  campos: { id: string; visible: boolean; ancho?: number }[]
  calculos: Record<string, Calculo>
  color?: ColorVista         // { campo?, reglas? }: la marca por una selección y reglas de fila o de celda
  altura: AlturaFila; congelar: number
  plegados: string[]
}`

/** Cómo se filtra, se ordena y se guardan las vistas en cualquier base de datos del kit. */
export default function FiltrosPage() {
  return (
    <DocPage
      eyebrow="Patrones"
      title="Filtros y vistas"
      lead="Toda lista se filtra, se ordena, se agrupa y se ve de varias formas con los mismos controles: los de la barra de la base de datos, con los operadores de Airtable. Cada persona tiene sus vistas y cada cambio se le guarda al momento."
    >
      <DocSection id="operadores" title="Operadores por tipo de campo" lead="Un solo juego en todo el kit (lib/filtros/core.ts). El tipo del campo decide cuáles se ofrecen.">
        <SpecTable
          columns={["Tipo", "Operadores"]}
          rows={[
            ["Texto, email, URL, teléfono", "contiene · no contiene · es · no es · está vacío · no está vacío"],
            ["Número, moneda, porcentaje, calificación, progreso", "= · ≠ · < · > · ≤ · ≥ · está vacío · no está vacío"],
            ["Fecha", "es · está dentro de · es antes de · es después de · es el mismo día o antes · es el mismo día o después · no es · vacíos. El valor puede ser un día o relativo: hoy, mañana, ayer, hace N días, dentro de N días, la semana pasada, los últimos N días…"],
            ["Selección única y vínculo", "es · no es · es cualquiera de · no es ninguno de · vacíos"],
            ["Selección múltiple", "tiene cualquiera de · tiene todos los · es exactamente · no tiene ninguno de · vacíos"],
            ["Casilla", "está marcada · no está marcada"],
          ]}
        />
        <Rules
          items={[
            <>Condiciones unidas con <strong>Y</strong> o con <strong>O</strong>, y grupos dentro de grupos (hasta tres niveles) para mezclar las dos.</>,
            <>Se filtra en memoria sobre las filas cargadas, con los campos calculados incluidos (importe, relación, días esperando).</>,
            <>Lo que se crea en una vista filtrada nace con los valores fijos del filtro («Marca es Lumea» → la marca ya puesta).</>,
            <>Las columnas que filtran u ordenan llevan un velo del color de la marca: se ve qué manda en la vista.</>,
          ]}
        />
      </DocSection>

      <DocSection id="vistas" title="Vistas">
        <Prose>
          <p>
            Una vista es una forma guardada de mirar la base: su tipo (cuadrícula, kanban, galería o calendario), su filtro, su orden, sus grupos, sus campos con
            su orden y su ancho, sus totales, su color y su altura. <strong>Son personales</strong>: en el portal se guardan en la base de datos de cada una
            (<code>ConfigBase</code>, con <code>useBase</code>); en la documentación y la demo, en el navegador (<code>useBaseLocal</code>).
          </p>
        </Prose>
        <CodeBlock code={MODELO} lang="ts" />
        <Rules
          items={[
            <>Cada base trae unas vistas de serie (<code>vistasDeSerie…</code>) que son solo el punto de partida: cada persona las cambia, crea otras, las ordena y las borra (siempre queda una).</>,
            <>Cada cambio se guarda al momento, como en Airtable. Si un campo deja de existir, la vista se ajusta sola (<code>normalizarVista</code>).</>,
            <>«Copiar desde otra vista» trae el filtro, el orden o los grupos de otra.</>,
          ]}
        />
        <DoDont
          dos={[<>Las cifras de la portada que filtran ponen su condición en la vista abierta.</>, <>Una búsqueda que encuentra en todos los campos, también los calculados.</>]}
          donts={[<>Filtros rápidos o chips sueltos fuera de la base.</>, <>Filtros en la URL que pisan los de la vista.</>]}
        />
      </DocSection>

      <NextLinks
        links={[
          { href: "/ds/componentes/base-de-datos", label: "Base de datos", text: "La pieza entera, con su demo." },
          { href: "/ds/componentes/toolbar", label: "Barra de la base", text: "Cada botón de la barra." },
        ]}
      />
    </DocPage>
  )
}
