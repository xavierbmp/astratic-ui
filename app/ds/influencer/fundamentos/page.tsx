import { DocPage, DocSection, Example, NextLinks, Prose, Rules, SpecTable, Swatch } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { TINTS, tintClass, tintLabel } from "@/lib/influencer/tints"

export const metadata = { title: "Fundamentos · Influencer Workspace" }

export default function InfluencerFundamentosPage() {
  return (
    <DocPage
      eyebrow="Influencer Workspace · Fundamentos"
      title="Fundamentos"
      lead="Lo que cambia respecto a Astratic UI se reduce a cuatro cosas: las superficies, la forma, los tintes y el espacio. Tipografía, iconos y colores de estado son los del madre."
    >
      <DocSection id="superficies" title="Superficies" lead="La página es gris; lo que importa es blanco y flota con una sombra suave. No hay bordes de bloque.">
        <div className="theme-influencer grid gap-3 rounded-lg border bg-background p-6 sm:grid-cols-2">
          <Swatch name="Fondo de página" token="--background" note="Gris claro con un punto frío" />
          <Swatch name="Superficie (bloque)" token="--card" note="Blanco" />
          <Swatch name="Relleno interior" token="--muted" note="Filas, chips y tarjetas dentro de un bloque" />
          <Swatch name="Acento" token="--brand" note="Heredado: lo activo y el aviso destacado" />
        </div>
        <Example title="Bloque sobre la página" description="rounded-2xl · bg-card · shadow-card · p-5" className="theme-influencer">
          <div className="rounded-2xl bg-card p-5 shadow-card">
            <p className="text-base font-semibold">Un bloque</p>
            <p className="mt-1 text-sm text-muted-foreground">Sin borde: la sombra lo separa del fondo.</p>
            <div className="mt-4 rounded-xl bg-background/70 px-3.5 py-3 text-sm">Una fila dentro del bloque, en el gris de la página.</div>
          </div>
        </Example>
        <Rules
          items={[
            <><code>shadow-card</code> lee <code>--card-shadow</code>: aquí es suave y difusa; en Astratic UI vale lo que <code>shadow-xs</code>. Es la única sombra de bloque.</>,
            <>Dentro de un bloque, las filas y tarjetas pequeñas van en <code>bg-background/70</code> (el gris de la página, un poco transparente) y pasan a <code>bg-muted</code> al pasar el ratón.</>,
            <>Nada de tarjetas dentro de tarjetas con sombra: un bloque tiene sombra; lo de dentro, no.</>,
          ]}
        />
      </DocSection>

      <DocSection id="forma" title="Forma" lead="El radio base sube de 10 px a 16 px y todo lo demás se deriva de él.">
        <SpecTable
          columns={["Elemento", "Clase", "Resultado"]}
          rows={[
            ["Bloque, tarjeta de collab, cifra, perfil", <code key="a">rounded-2xl</code>, "≈ 29 px"],
            ["Filas, tarjetas de tarea, enlaces, avisos", <code key="b">rounded-xl</code>, "≈ 22 px"],
            ["Logo de marca, icono de red", <code key="c">rounded-xl</code> , "≈ 22 px, cuadrado de 40 px"],
            ["Icono de cifra, chips, etiquetas, botón de tarea", <code key="d">rounded-full</code>, "Círculo o píldora"],
            ["Botones, campos, selects", "Los del madre", "Heredan el radio base: salen un poco más redondos, y está bien así"],
          ]}
        />
      </DocSection>

      <DocSection id="tintes" title="Tintes" lead="Seis colores pastel con su texto oscuro del mismo tono. Colorean por marca o por tipo, nunca por estado.">
        <div className="theme-influencer grid grid-cols-2 gap-3 rounded-lg border bg-background p-6 sm:grid-cols-3">
          {TINTS.map((t) => (
            <div key={t} className={`flex flex-col gap-1 rounded-xl p-4 ${tintClass[t]}`}>
              <span className="text-sm font-semibold">{tintLabel[t]}</span>
              <span className="font-mono text-[11px] opacity-80">bg-tint-{t}</span>
              <span className="font-mono text-[11px] opacity-80">text-tint-{t}-foreground</span>
            </div>
          ))}
        </div>
        <CodeBlock
          code={`import { tintClass, tintFor } from "@/lib/influencer/tints"

// Un tinte estable por marca: el mismo nombre da siempre el mismo color.
<span className={tintClass[tintFor(collab.brand)]}>…</span>

// O uno fijo por tipo de cosa (las cifras del inicio, por ejemplo).
<StatTile tint="peach" … />`}
        />
        <Rules
          items={[
            <><strong>Los estados no se tiñen.</strong> Hecho, en curso, pendiente, vencido y borrador siguen siendo los cinco tonos de <code>StatusBadge</code>; una tarea vencida va en <code>text-danger</code>, no en rosa.</>,
            <>Un tinte siempre con su <code>-foreground</code>: nunca texto negro ni blanco encima.</>,
            <>Solo tienen valor dentro de <code>.theme-influencer</code>. Fuera del workspace no existen.</>,
            <>En oscuro se invierten (fondo oscuro del tono, texto claro) sin tocar el código.</>,
          ]}
        />
      </DocSection>

      <DocSection id="espacio" title="Espacio y tipografía">
        <SpecTable
          columns={["Qué", "Valor"]}
          rows={[
            ["Margen de página", "16 px en móvil, 34 px desde md (el del madre)"],
            ["Entre bloques", "24 px (gap-6)"],
            ["Dentro de un bloque", "20 px (p-5); cabecera con 16 px bajo ella (mb-4)"],
            ["Entre filas de un bloque", "8 px (gap-2)"],
            ["Columna derecha (xl)", "372 px fijos; por debajo de 1280 px todo en una columna"],
            ["Título de página", "27 px semibold (heredado)"],
            ["Título de bloque", "16 px semibold, contador al lado en gris"],
            ["Cifra", "24 px semibold, tabular-nums; etiqueta a 14 px en gris"],
            ["Texto de trabajo", "14 px; secundario 12 px en gris"],
          ]}
        />
        <Prose>
          <p>
            La barra inferior del móvil mide 56 px más el área segura: las páginas llevan <code>pb-28</code> por debajo de{" "}
            <code>md</code> para que nada quede tapado.
          </p>
        </Prose>
      </DocSection>

      <NextLinks
        links={[
          { href: "/ds/influencer/componentes", label: "Componentes", text: "Las piezas propias del workspace." },
          { href: "/ds/fundamentos/color", label: "Color (Astratic UI)", text: "Los tokens que se heredan." },
        ]}
      />
    </DocPage>
  )
}
