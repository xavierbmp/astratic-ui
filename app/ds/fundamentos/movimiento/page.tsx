import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { MotionDemo } from "@/components/docs/examples/motion-demo"

export const metadata = { title: "Movimiento" }

export default function MovimientoPage() {
  return (
    <DocPage
      eyebrow="Fundamentos"
      title="Movimiento"
      lead="Discreto y funcional. El movimiento sirve para decir de dónde viene algo y a dónde va, nunca para adornar. Si dudas, no animes."
    >
      <DocSection id="principios" title="Principios" lead="Pocas reglas y ninguna excepción por gusto. Casi todas ya están aplicadas en los componentes de shadcn y del kit.">
        <Rules
          items={[
            <><strong>Micro-interacciones entre 150 y 250 ms.</strong> Cambio de color al pasar el ratón (150), aparición de la BulkBar (200), chevron de la fila (150). Por debajo de 100 ms no se percibe; por encima de 250 estorba.</>,
            <><strong>Capas.</strong> Lo que aparece en su sitio (menú, popover, tooltip, diálogo) entra en 100 a 150 ms con fundido y zoom del 95 %. Lo que se desplaza (sheet lateral, toasts) tarda entre 200 y 300 ms. Nada pasa de 300 ms. shadcn ya trae estos valores.</>,
            <><strong>Easing.</strong> Lo que entra decelera: <code>ease-out</code>, es decir <code>cubic-bezier(0, 0, 0.2, 1)</code>. Lo que sale puede acelerar. Nunca bounce, elastic ni spring: un portal no rebota.</>,
            <><strong>Solo <code>transform</code> y <code>opacity</code>.</strong> Nada de animar <code>height</code>, <code>width</code>, <code>margin</code>, sombras ni fondos grandes: fuerzan layout y se ven a saltos. Los cambios de color al pasar el ratón usan <code>transition-colors</code>, que no toca el layout.</>,
            <><strong>Los botones responden al instante.</strong> <code>active:translate-y-px</code> ya está en <code>Button</code>. Sin animaciones de pulsación, sin ondas.</>,
            <><strong>Los popovers salen de su ancla.</strong> <code>origin-(--radix-*-content-transform-origin)</code> viene en los componentes de shadcn y no se quita.</>,
            <><strong>Cargas con skeleton</strong> (<code>TableSkeleton</code>, <code>KanbanSkeleton</code>, <code>KpiSkeleton</code>), nunca spinners de página. El único giro permitido es <code>Loader2Icon</code> con <code>animate-spin</code> en un botón que está enviando o en un toast de carga.</>,
            <><strong><code>prefers-reduced-motion</code> se respeta</strong> desde <code>globals.css</code> para todo el portal; ningún componente tiene que hacer nada.</>,
          ]}
        />
      </DocSection>

      <DocSection id="que-se-anima" title="Qué se anima y qué no" lead="Se anima lo que cambia de capa o de sitio. Lo que cambia de contenido, no.">
        <DoDont
          dos={[
            "BulkBar al aparecer: fundido y 8 px desde abajo en 200 ms. Al desaparecer, de golpe.",
            "Sheet lateral: desliza desde la derecha en 200 ms; el fondo se atenúa en 100 ms.",
            "Menús, popovers y tooltips: fundido y zoom del 95 % desde el ancla.",
            "DragOverlay del kanban: la tarjeta arrastrada se inclina 1° y sube con shadow-pop; al soltar vuelve en 180 ms.",
            "Toasts: entran deslizando desde la esquina inferior derecha.",
            "Chevron de fila y flecha de enlace al pasar el ratón: opacidad o 2 px de desplazamiento.",
          ]}
          donts={[
            "Cambiar de vista tabla ↔ kanban: instantáneo, sin fundidos ni transiciones de altura.",
            "Filas al filtrar, ordenar o paginar: aparecen y desaparecen de golpe.",
            "Cifras: nada de contadores que suben ni dígitos que ruedan.",
            "Fondos y colores de página, incluido el cambio de tema (ThemeProvider lleva disableTransitionOnChange).",
            "Rebotes, elásticos, parallax o cualquier animación decorativa.",
            "Animar height o width de un bloque para expandirlo.",
          ]}
        />
      </DocSection>

      <DocSection id="duraciones" title="Duraciones por elemento" lead="Lo que hay hoy en el kit y en los componentes de shadcn. Un elemento nuevo copia la fila que más se le parezca.">
        <SpecTable
          columns={["Elemento", "Duración", "Easing", "Propiedades"]}
          rows={[
            ["Hover de botón, fila, ítem de menú", "150 ms", "ease-in-out (por defecto de Tailwind)", <><code>color</code>, <code>background-color</code> con <code>transition-colors</code></>],
            ["Pulsación de botón", "Instantánea", "Sin easing", <><code>active:translate-y-px</code></>],
            ["BulkBar", "200 ms", "ease (tw-animate)", <><code>opacity</code> 0 a 1 · <code>translateY</code> 8 px a 0</>],
            ["Menú desplegable, popover, select", "100 ms", "ease (tw-animate)", <><code>opacity</code> · <code>scale</code> 95 % a 100 % · 8 px desde el lado del ancla</>],
            ["Tooltip", "150 ms", "ease (tw-animate)", <><code>opacity</code> · <code>scale</code> 95 % · 8 px desde el lado del ancla</>],
            ["Diálogo y confirmación", "100 ms", "ease (tw-animate)", <><code>opacity</code> · <code>scale</code> 95 %. El fondo solo <code>opacity</code></>],
            ["Sheet de detalle", "200 ms", "ease-in-out (shadcn)", <><code>translateX</code> desde la derecha. El fondo <code>opacity</code> en 100 ms</>],
            ["Kanban: reordenar tarjetas", "200 ms", "ease (dnd-kit)", <><code>transform</code> de las tarjetas que se apartan</>],
            ["Kanban: soltar la tarjeta", "180 ms", "cubic-bezier(0.2, 0, 0, 1)", <><code>transform</code>: vuelve del <code>rotate-1</code> y pierde <code>shadow-pop</code></>],
            ["Toasts (sonner)", "400 ms", "ease (sonner)", <><code>transform</code> · <code>opacity</code>. Lo gestiona sonner</>],
            ["Sidebar al colapsar", "200 ms", "linear (shadcn)", <><code>width</code>. La única excepción de layout, y viene de serie</>],
            ["Skeleton", "2 s en bucle", "cubic-bezier(0.4, 0, 0.6, 1)", <><code>opacity</code> con <code>animate-pulse</code></>],
            ["Chevron de fila, flecha de enlace", "150 ms", "ease-in-out (por defecto de Tailwind)", <><code>opacity</code> · <code>translateX</code> 2 px</>],
          ]}
        />
        <Rules
          items={[
            <>Las clases de tw-animate-css leen <code>duration-*</code> y <code>ease-*</code> de Tailwind: <code>animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out</code> es una entrada completa. Sin <code>duration-*</code>, tw-animate usa 150 ms; sin <code>ease-*</code>, usa <code>ease</code>.</>,
            <>Los componentes de shadcn animan la salida con <code>data-closed:animate-out</code> y la misma duración. Los elementos propios del kit (BulkBar, chips, filas) desaparecen sin animación: quitar algo es inmediato.</>,
            <>Las distancias son cortas: 8 px (<code>slide-in-from-bottom-2</code>) para lo que aparece en su sitio, el ancho completo solo para el sheet. Nunca <code>slide-in-from-bottom-full</code> en una tarjeta.</>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo" lead="Una tarjeta que entra con las clases del sistema y un toast con «Deshacer». Al ocultar la tarjeta no hay animación: como la BulkBar, quitar algo es inmediato.">
        <Example>
          <MotionDemo />
        </Example>
        <CodeBlock
          title="components/docs/examples/motion-demo.tsx"
          code={`"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function MotionDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" onClick={() => setOpen((o) => !o)}>
        {open ? <EyeOffIcon /> : <EyeIcon />}
        {open ? "Ocultar tarjeta" : "Mostrar tarjeta"}
      </Button>
      {open && (
        <div className="rounded-lg border bg-card p-4 shadow-xs animate-in fade-in-0 slide-in-from-bottom-2 duration-200 ease-out">
          …
        </div>
      )}
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Registro archivado", {
            action: { label: "Deshacer", onClick: () => toast("Registro restaurado") },
          })
        }
      >
        Lanzar toast
      </Button>
    </div>
  )
}`}
        />
      </DocSection>

      <DocSection id="movimiento-reducido" title="Movimiento reducido" lead="Quien pide menos movimiento en su sistema operativo no ve ninguna animación. Está resuelto una vez, en globals.css, para todo el portal.">
        <CodeBlock
          title="app/globals.css"
          lang="css"
          code={`@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`}
        />
        <Prose>
          <p>
            El bloque fuerza a 0,01 ms la duración de todas las animaciones y transiciones cuando el sistema pide menos movimiento. El{" "}
            <code>!important</code> gana a las clases de tw-animate y a los estilos inline que escribe dnd-kit al arrastrar. Además limita
            cada animación a una iteración, con lo que <code>animate-pulse</code> y <code>animate-spin</code> se quedan quietos, y desactiva el
            scroll suave.
          </p>
          <p>
            El resultado es que todo salta a su estado final: la BulkBar aparece, el sheet ya está abierto, los toasts entran sin deslizarse,
            los skeletons son bloques grises fijos. Como la duración no es cero, <code>animationend</code> y <code>transitionend</code> siguen
            disparándose, así que los componentes de Radix que esperan a que termine la salida para desmontarse funcionan igual.
          </p>
          <p>
            Ningún componente necesita variantes <code>motion-reduce:</code> ni comprobar la preferencia en JavaScript. Si un portal añade
            una animación propia con <code>animate-in</code> o <code>transition-*</code>, ya queda cubierta.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/bulk-bar", label: "Barra de selección", text: "La entrada de 200 ms ya implementada." },
            { href: "/ds/componentes/kanban", label: "Kanban", text: "DragOverlay con rotación de 1° y shadow-pop." },
            { href: "/ds/componentes/detail-sheet", label: "Sheet de detalle", text: "La capa que se desliza desde la derecha." },
            { href: "/ds/componentes/states", label: "Estados", text: "Skeletons en vez de spinners." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
