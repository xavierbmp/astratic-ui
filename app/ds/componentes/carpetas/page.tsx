import { CarpetasDemo } from "@/components/docs/examples/carpetas-demo"
import { DocPage, DocSection, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"

export const metadata = { title: "Carpetas" }

export default function CarpetasPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Carpetas"
      lead="Carpetas dentro de carpetas, como en el Finder: se pliegan, se arrastran para ordenarlas o meter una dentro de otra y se crean, renombran, mueven y borran desde su menú, sin salir de la lista."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Cuando lo que se guarda (notas, archivos, ideas) se organiza a gusto de cada uno. Las carpetas se guardan en una
            lista plana: cada una sabe su madre (<code>padreId</code>) y su <code>orden</code> entre sus hermanas. La lógica es
            pura y con tests, en <code>lib/carpetas.ts</code>: el árbol, el nombre completo («Clientes / Propuestas»), mover
            sin meter una carpeta dentro de sí misma y borrar subiendo lo de dentro a su madre.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>En una base, en su lateral</strong> (<code>CarpetasBloque variante=&quot;lateral&quot;</code>), en el sitio
              de las vistas y ensanchable: es lo «mixto» de las bases. Suelto, en un bloque; en el móvil (<code>chips</code>), una
              fila de atajos y el árbol entero en una hoja desde abajo.
            </>,
            <>
              <strong>Arrastrar manda el puntero:</strong> encima de una fila, delante; en su centro, dentro; debajo, detrás.
              Soltar en «Nueva carpeta» la saca arriba del todo.
            </>,
            <>
              <strong>Atajos encima del árbol</strong> (Todo, Favoritas, Sin carpeta), con su icono y su id propio. Cada carpeta
              cuenta también lo de las que lleva dentro.
            </>,
            <>
              <strong>Borrar no borra lo de dentro</strong>: sube a su madre, y el aviso lo dice. Qué se ha plegado y el ancho
              del lateral se recuerdan por persona.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example title="Un bloque de carpetas" description="Arrastra Plantillas dentro de Interno, crea una subcarpeta desde el «…» o borra Clientes.">
          <CarpetasDemo />
        </Example>
      </DocSection>

      <DocSection id="props" title="Props">
        <SpecTable
          columns={["Prop", "Tipo", "Descripción"]}
          rows={[
            [<code key="c">carpetas</code>, <code key="ct">{"C extends CarpetaArbol"}</code>, "La lista plana; cada portal añade lo suyo (un color)."],
            [<code key="a">actual · cuentas</code>, <code key="at">string · Record</code>, "La carpeta o el atajo que se mira y cuánto lleva cada uno."],
            [<code key="co">color</code>, <code key="cot">{"(c) => string"}</code>, "Las clases del punto de cada carpeta. Sin él, gris."],
            [<code key="at2">atajos</code>, <code key="at2t">AtajoCarpetas[]</code>, "Lo de encima del árbol; enFila: false lo quita de la fila del móvil."],
            [<code key="k">claves · contenido · alBorrarIrA</code>, <code key="kt">…</code>, "Dónde se recuerda lo plegado y el ancho, cómo se llama lo de dentro y adónde ir al borrar la carpeta que se mira."],
            [<code key="o">onCrear · onRenombrar · onMover · onBorrar</code>, <code key="ot">funciones</code>, "onMover devuelve false si el destino está dentro de la propia carpeta (lo dice un toast)."],
            [<code key="v">variante</code>, <code key="vt">{'"bloque" | "lateral" | "chips"'}</code>, "Dónde va."],
          ]}
        />
        <Prose>
          <p>
            Sueltos, en <code>arbol-carpetas.tsx</code>: <code>ArbolCarpetas</code> (el árbol solo), <code>OpcionesCarpeta</code>{" "}
            (las carpetas en árbol dentro de un menú, para «Mover a») y <code>NombreEditable</code>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/carpetas.json" />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks links={[{ href: "/ds/componentes/base-de-datos", label: "Base de datos", text: "Las carpetas van en su lateral." }]} />
      </DocSection>
    </DocPage>
  )
}
