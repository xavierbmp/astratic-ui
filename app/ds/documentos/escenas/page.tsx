import * as React from "react"
import { cn } from "cn"
import { CheckCircle2Icon, MessageSquareTextIcon } from "lucide-react"
import { DocPage, DocSection, DoDont, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { RepetirEntrada } from "@/components/docs/examples/repetir-entrada"
import { EscenaEjemploAprobacion, EscenaEjemploPanel } from "@/components/document/escenas/ejemplos"
import { M, r } from "@/components/document/escenas/piezas"

export const metadata = { title: "Escenas y movimiento" }

const usoCode = `import { Escenario, Plano, Pieza, Tarjeta, Lineas, curva, Cursor, E } from "@/components/document/escenas/piezas"

export function EscenaAprobacion() {
  return (
    <Escenario etiqueta="Un cliente revisa una pieza y la aprueba">
      {/* Detrás: la pantalla real, inclinada y fundida por los bordes */}
      <Plano giro="rotateX(40deg) rotateZ(-22deg)" x={-4} y={10} w={66} h={74} className="rounded-[2.4cqw] bg-card shadow-card">
        …la lista de proyectos…
      </Plano>
      {/* Las líneas unen la pieza con lo que se dice de ella */}
      <Lineas trazos={[curva([52, 30], [64, 18])]} />
      {/* Delante: lo que cuenta la funcionalidad, levantado y entrando una pieza detrás de otra */}
      <Pieza x={18} y={14} w={36} retraso={0.15} quieta>
        <Tarjeta className="p-[1.6cqw]">…la pieza con sus notas…</Tarjeta>
      </Pieza>
      <Pieza x={64} y={10} w={32} retraso={0.5}>
        <Tarjeta className="p-[1.6cqw]"><span className={E.pequeno}>¿Podemos subir un poco el logo?</span></Tarjeta>
      </Pieza>
    </Escenario>
  )
}`

const movimientoCode = `import { M, r } from "@/components/document/escenas/piezas"

<p className={cn("text-[8cqw] font-semibold", M.revela)} style={r(0.1)}>+50 %</p>
<p className={M.sube} style={r(0.3)}>creció la inversión en el último año</p>
<div className={M.creceY} style={r(0.4, { height: "72%" })} />   {/* una columna */}
<div className={M.desliza} style={{ "--duracion": "36s" }}>…logos dos veces…</div>`

/** Una diapositiva 16:9 como las de la auditoría: lo justo a un lado y la escena en grande al otro. */
function Diapositiva({ titulo, texto, puntos, children }: { titulo: string; texto: string; puntos: { icono: React.ReactNode; texto: string }[]; children: React.ReactNode }) {
  return (
    <div className="@container aspect-video w-full overflow-hidden rounded-xl border bg-background">
      <div className="grid h-full grid-cols-[0.75fr_1.45fr] items-stretch gap-[3cqw] p-[4cqw]">
        <div className="flex flex-col justify-center gap-[1.6cqw]">
          <p className={cn("text-[3.2cqw] leading-[1.05] font-semibold tracking-[-0.035em]", M.revela)}>{titulo}</p>
          <p className={cn("text-[1.4cqw] leading-[1.45] text-muted-foreground", M.sube)} style={r(0.2)}>
            {texto}
          </p>
          <ul className="flex flex-col gap-[1cqw]">
            {puntos.map((p, i) => (
              <li key={p.texto} className={cn("flex items-center gap-[1cqw] text-[1.3cqw] font-medium", M.sube)} style={r(0.35 + i * 0.12)}>
                <span className={cn("grid size-[2.8cqw] place-items-center rounded-full bg-brand-soft text-brand [&_svg]:size-[55%]", M.salta)} style={r(0.5 + i * 0.12)}>
                  {p.icono}
                </span>
                {p.texto}
              </li>
            ))}
          </ul>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Las primitivas de movimiento, en pequeño: una cifra que sale desde abajo, unas columnas que crecen y un muro que se desliza. */
function MuestraMovimiento() {
  const columnas = [0.42, 0.58, 0.5, 0.72, 0.64, 0.86, 1]
  const logos = ["Nórdica", "Pulso", "Mareta", "Vela", "Olmo", "Brisa", "Lumen", "Atlas"]
  return (
    <div className="@container grid aspect-[3/1] w-full grid-cols-3 gap-[2cqw] overflow-hidden rounded-xl border bg-background p-[3cqw]">
      <div className="flex flex-col justify-center gap-[1cqw]">
        <p className={cn("text-[7cqw] leading-none font-semibold tracking-[-0.05em] text-brand tabular-nums", M.revela)} style={r(0.1)}>
          +50 %
        </p>
        <p className={cn("text-[1.5cqw] text-muted-foreground", M.sube)} style={r(0.35)}>
          revela y sube
        </p>
      </div>
      <div className="flex items-end gap-[0.8cqw] border-b border-border">
        {columnas.map((v, i) => (
          <span
            key={i}
            className={cn("flex-1 rounded-t-[0.6cqw]", i === columnas.length - 1 ? "bg-linear-to-t from-brand to-brand/75" : "bg-brand/20", M.creceY)}
            style={r(0.2 + i * 0.06, { height: `${v * 100}%` })}
          />
        ))}
      </div>
      <div className="relative overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]">
        <div className={cn("flex flex-col gap-[0.8cqw] pb-[0.8cqw]", M.desliza)} style={{ "--duracion": "14s" } as React.CSSProperties}>
          {[0, 1].map((vuelta) => (
            <React.Fragment key={vuelta}>
              {logos.map((l) => (
                <span key={l} className="grid place-items-center rounded-[1cqw] bg-card py-[1.2cqw] text-[1.5cqw] font-semibold tracking-[-0.02em] shadow-card">
                  {l}
                </span>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function EscenasPage() {
  return (
    <DocPage
      eyebrow="Documentos"
      title="Escenas y movimiento"
      lead="Cómo enseñar una funcionalidad en una propuesta, una presentación o una landing sin poner una captura: una escena con piezas de la interfaz que flotan sobre un plano en perspectiva, y el movimiento que hace que todo entre en su momento."
    >
      <DocSection id="que-es" title="Qué es una escena">
        <Prose>
          <p>
            Una escena es un <strong>mockup conceptual</strong> de una funcionalidad (lo que en el sector se llama <em>feature showcase</em> o
            <em> exploded UI</em>). Parte de cómo es de verdad el producto, pero solo enseña el momento que lo vende: el correo que se analiza solo,
            la pieza que el cliente aprueba, el cobro que llega. Detrás va la pantalla real inclinada y fundida; delante, levantadas, las dos o
            tres piezas que lo cuentan, unidas por líneas y con un cursor si hay una acción.
          </p>
          <p>
            Nació en la presentación de la auditoría del workspace de influencers (Xavier, 2026-10-28, «nivel SaaS mega pro»), donde sustituyó a las
            capturas de cada función del portal. Sirve igual para la funcionalidad estrella de una propuesta elaborada, la portada de una landing o
            una diapositiva.
          </p>
        </Prose>
        <RepetirEntrada>
          <div className="flex flex-col gap-4">
            <Diapositiva
              titulo="El cliente aprueba sobre la pieza"
              texto="Deja sus notas en el punto exacto y aprueba cada versión desde su enlace."
              puntos={[
                { icono: <MessageSquareTextIcon />, texto: "Notas en su sitio" },
                { icono: <CheckCircle2Icon />, texto: "Aprobado por escrito" },
              ]}
            >
              <EscenaEjemploAprobacion />
            </Diapositiva>
            <Diapositiva
              titulo="Tu negocio, en cifras"
              texto="Lo que importa de un vistazo, al día y sin montar informes."
              puntos={[
                { icono: <CheckCircle2Icon />, texto: "Evolución y reparto" },
                { icono: <CheckCircle2Icon />, texto: "Lo que mejora, destacado" },
              ]}
            >
              <EscenaEjemploPanel />
            </Diapositiva>
          </div>
        </RepetirEntrada>
      </DocSection>

      <DocSection id="anatomia" title="Anatomía">
        <SpecTable
          columns={["Pieza", "Qué es", "Cómo se usa"]}
          rows={[
            [<code key="a">Escenario</code>, "El lienzo 4:3 con su halo. Cabe entero en su columna y dentro todo mide en cqw de su ancho.", "Uno por escena, con su descripción en etiqueta (se lee como una imagen)."],
            [<code key="b">Plano</code>, "La pantalla real de fondo, inclinada en 3D y fundida por los bordes.", "giro: rotateX(38–52deg) rotateZ(-20 a -34deg). Una lista, un calendario o un panel."],
            [<code key="c">Pieza</code>, "Lo que flota delante. Entra a su retraso y después flota muy poco, cada una a su ritmo.", "x, y y w en % del escenario. quieta para la principal, que no se mueve."],
            [<code key="d">Tarjeta</code>, "La tarjeta blanca de la interfaz con sombra en capas.", "suave para las pequeñas. Nunca una tarjeta con sombra dentro de otra."],
            [<code key="e">Lineas · curva</code>, "Líneas que unen una pieza con lo que se dice de ella y se dibujan solas.", "Puntos en % del escenario, como las piezas."],
            [<code key="f">Cursor · ConIA · Monograma · Sello · Barra</code>, "El cursor (con el + de soltar), la pastilla de la IA, el monograma de una marca inventada, el sello de quien habla y la barra que hace de texto.", "Solo si cuentan algo: un cursor por escena como mucho."],
            [<code key="g">E</code>, "La escala de textos de dentro (micro, pequeño, texto, título, cifra, etiqueta).", "Siempre en cqw: así la escena se ve igual en el móvil, la pantalla y el PDF."],
          ]}
        />
        <CodeBlock code={usoCode} lang="tsx" />
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <><strong>Basada en la realidad, no fiel a ella.</strong> Las piezas se parecen a las del producto (mismas tarjetas, tokens y forma), pero solo sale lo que cuenta la funcionalidad.</>,
            <><strong>Una idea por escena</strong> y de tres a seis piezas delante. Si hay que explicarla, sobra algo.</>,
            <><strong>El texto al lado, mínimo:</strong> título, una frase y dos puntos cortos. La escena es la protagonista.</>,
            <><strong>Datos inventados y coherentes</strong> (marcas, personas y cifras de ejemplo que cuadran entre sí). Nunca datos reales de un cliente.</>,
            <><strong>Profundidad sin ruido:</strong> plano inclinado detrás, sombras en capas y piezas a distintas alturas. Nada de glassmorphism, degradados morados ni brillos de más.</>,
            <><strong>Solo tokens.</strong> Las marcas inventadas van en los tonos suaves (brand, success, info, warning, danger); en el workspace, con sus tintes.</>,
            <><strong>Movimiento con propósito:</strong> todo entra una pieza detrás de otra y después flota muy poco. Las líneas se dibujan, el cursor llega al final.</>,
            <><strong>Quieta en el PDF y con «menos movimiento».</strong> Las entradas solo guardan su estado inicial durante el retraso: sin animación, todo sale en su sitio.</>,
            <><strong>Se comprueba a tamaño real</strong> (1920 × 958 en el modo llamada), en el móvil y en el PDF antes de darla por buena.</>,
          ]}
        />
        <DoDont
          dos={[
            "El correo de una marca levantado del inbox, con los datos que saca la IA en tarjetitas unidas por líneas.",
            "El vídeo en el móvil con las notas clavadas en su segundo y un «Aprobado» flotando.",
            "La cifra del cliente en grande que sale desde abajo y su gráfica que se dibuja.",
          ]}
          donts={[
            "Una captura de pantalla entera metida en un marco de navegador para una funcionalidad concreta.",
            "Diez tarjetas flotando sin una idea que las una.",
            "Animaciones que rebotan, cifras que cuentan o que se repiten sin parar delante de lo que hay que leer.",
          ]}
        />
      </DocSection>

      <DocSection id="movimiento" title="Movimiento" lead="Las mismas animaciones sirven fuera de la escena, en toda la presentación: cifras, titulares, gráficas, muros de logos y fondos.">
        <RepetirEntrada>
          <MuestraMovimiento />
        </RepetirEntrada>
        <SpecTable
          columns={["Clase", "Para qué"]}
          rows={[
            [<code key="1">sube · deLado · aparece</code>, "La entrada de textos, tarjetas y bloques."],
            [<code key="2">revela</code>, "Cifras y titulares grandes, que salen desde abajo como de una ranura."],
            [<code key="3">salta</code>, "Iconos, marcas de verificación y pastillas."],
            [<code key="4">creceY · creceX · revelaX</code>, "Columnas que crecen, barras que se llenan y líneas de gráfica que se descubren."],
            [<code key="5">tacha</code>, "La raya que tacha una cifra con la que se compara (el 20 % de una agencia tradicional)."],
            [<code key="6">escribe · cursor</code>, "Un buscador que se escribe solo, con su cursor."],
            [<code key="7">flota · acerca · late · empuja</code>, "Lo que se mueve sin parar, muy poco: piezas que flotan, una foto que se acerca, un punto que late y la flecha que invita a seguir."],
            [<code key="8">desliza · deslizaAlReves</code>, "Columnas de logos que se desplazan sin fin (la pista lleva sus piezas dos veces y un hueco abajo)."],
            [<code key="9">luz · trama</code>, "El fondo vivo de las diapositivas oscuras y de marca: dos luces que derivan y una trama de puntos."],
          ]}
        />
        <CodeBlock code={movimientoCode} lang="tsx" />
        <Prose>
          <p>
            Cada pieza lleva su clase y su retraso con <code>r(segundos)</code>; lo que se mueve sin parar, su fase con <code>fase()</code> para
            que no vaya todo a la vez. Si la diapositiva se monta de nuevo al abrirla (con una <code>key</code> por diapositiva), todo vuelve a entrar.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="archivos" title="Archivos">
        <CodeBlock
          lang="bash"
          code={`components/document/escenas/
  piezas.tsx              Escenario, Plano, Pieza, Tarjeta, Lineas, curva, Cursor, ConIA, Monograma, Sello, Barra, E · M, r, fase
  escenas.module.css      perspectiva, planos, sombras en capas, entrada y flotación de las piezas
  movimiento.module.css   las animaciones de entrada y de fondo de toda la presentación
  ejemplos.tsx            las dos escenas de esta página (aprobación y panel)`}
        />
      </DocSection>

      <NextLinks
        links={[
          { href: "/ds/documentos/elaborada", label: "Propuesta elaborada", text: "Donde va la funcionalidad estrella de cada propuesta." },
          { href: "/ds/fundamentos/movimiento", label: "Movimiento en los portales", text: "En el día a día de un portal, el movimiento es mucho más sutil." },
        ]}
      />
    </DocPage>
  )
}
