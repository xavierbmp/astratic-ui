import * as React from "react"
import { cn } from "cn"
import { CheckIcon, FileImageIcon, MessageSquareTextIcon } from "lucide-react"
import { Barra, ConIA, Cursor, E, Escenario, Lineas, Monograma, Pieza, Plano, Tarjeta, curva, type Tono } from "./piezas"

// Dos escenas de ejemplo para la documentación, con datos inventados: la aprobación de una pieza por el cliente (el
// patrón de una funcionalidad que se cuenta con su momento clave) y un panel de cifras (el de un resumen con datos).

const PROYECTOS: { nombre: string; cliente: string; tono: Tono; estado: string }[] = [
  { nombre: "Campaña de otoño", cliente: "Nórdica Café", tono: "warning", estado: "En revisión" },
  { nombre: "Lanzamiento app", cliente: "Pulso Fit", tono: "info", estado: "En curso" },
  { nombre: "Catálogo 2027", cliente: "Mareta Home", tono: "success", estado: "Aprobado" },
  { nombre: "Evento de prensa", cliente: "Vela Studio", tono: "brand", estado: "Por empezar" },
  { nombre: "Rebranding", cliente: "Olmo Legal", tono: "neutral", estado: "En curso" },
]

/** La aprobación de una pieza: los proyectos inclinados detrás, la pieza con las notas del cliente y el aprobado. */
export function EscenaEjemploAprobacion() {
  return (
    <Escenario etiqueta="Un cliente revisa una pieza, deja sus notas y la aprueba">
      <Plano giro="rotateX(40deg) rotateZ(-22deg)" x={-4} y={10} w={66} h={74} className="flex flex-col gap-[0.8cqw] rounded-[2.4cqw] bg-card p-[1.8cqw] shadow-card">
        <span className={cn(E.titulo, "px-[0.4cqw] pb-[0.6cqw]")}>Proyectos</span>
        {PROYECTOS.map((p) => (
          <span key={p.nombre} className="flex items-center gap-[1cqw] rounded-[1.2cqw] bg-background/70 p-[1.1cqw]">
            <Monograma nombre={p.cliente} tono={p.tono} />
            <span className="flex min-w-0 flex-1 flex-col gap-[0.3cqw]">
              <span className={cn(E.pequeno, "truncate font-semibold")}>{p.nombre}</span>
              <span className={cn(E.micro, "truncate text-muted-foreground")}>{p.cliente}</span>
            </span>
            <span className={cn(E.micro, "rounded-full bg-foreground/6 px-[0.8cqw] py-[0.3cqw] text-muted-foreground")}>{p.estado}</span>
          </span>
        ))}
      </Plano>

      <Lineas trazos={[curva([52, 30], [64, 18]), curva([40, 50], [64, 46])]} retraso={0.9} />

      <Pieza x={18} y={14} w={36} retraso={0.15} quieta z={2}>
        <div className="[transform:perspective(120cqw)_rotateY(14deg)_rotateX(4deg)]">
          <Tarjeta className="flex flex-col gap-[1.2cqw] p-[1.6cqw]">
            <span className="flex items-center gap-[0.8cqw]">
              <FileImageIcon className="size-[1.8cqw] text-muted-foreground" />
              <span className={cn(E.pequeno, "font-semibold")}>Cartel principal · v3</span>
            </span>
            <span className="relative block aspect-[4/3] overflow-hidden rounded-[1.2cqw] bg-brand-soft">
              <span className="absolute inset-x-[12%] top-[16%] h-[34%] rounded-[1cqw] bg-brand/25" />
              <span className="absolute inset-x-[12%] top-[58%] flex flex-col gap-[0.8cqw]">
                <Barra ancho="70%" className="bg-brand/30" />
                <Barra ancho="46%" className="bg-brand/20" />
              </span>
              {[
                ["1", "84%", "26%"],
                ["2", "52%", "62%"],
              ].map(([n, x, y]) => (
                <span
                  key={n}
                  className="absolute grid size-[2.8cqw] -translate-1/2 place-items-center rounded-full bg-brand text-[1.3cqw] font-semibold text-brand-foreground ring-[0.3cqw] ring-card"
                  style={{ left: x, top: y }}
                >
                  {n}
                </span>
              ))}
            </span>
          </Tarjeta>
        </div>
      </Pieza>

      <Pieza x={64} y={10} w={32} retraso={0.5} z={3}>
        <Tarjeta className="flex flex-col gap-[0.9cqw] p-[1.6cqw]">
          <span className="flex items-center gap-[0.8cqw]">
            <Monograma nombre="Nórdica Café" tono="warning" className="size-[2.8cqw] text-[1.1cqw]" />
            <span className={cn(E.micro, "font-semibold")}>Laura · Nórdica</span>
            <MessageSquareTextIcon className="ml-auto size-[1.5cqw] text-muted-foreground" />
          </span>
          <span className={E.pequeno}>¿Podemos subir un poco el logo?</span>
        </Tarjeta>
      </Pieza>

      <Pieza x={64} y={40} w={32} retraso={0.7} z={3}>
        <Tarjeta className="flex flex-col gap-[0.9cqw] p-[1.6cqw]">
          <span className={cn(E.pequeno, "text-muted-foreground")}>El titular, perfecto.</span>
          <span className={cn(E.micro, "flex items-center gap-[0.4cqw] font-medium text-success")}>
            <CheckIcon className="size-[1.3cqw]" strokeWidth={3} />
            Resuelta
          </span>
        </Tarjeta>
      </Pieza>

      <Pieza x={30} y={70} w={40} retraso={0.9} z={4}>
        <Tarjeta className="flex items-center gap-[1cqw] rounded-[1.6cqw] p-[1.2cqw]">
          <ConIA>Resumen de las notas</ConIA>
          <span className={cn(E.micro, "relative ml-auto flex items-center gap-[0.5cqw] rounded-full bg-success px-[1.2cqw] py-[0.7cqw] font-medium text-background")}>
            <CheckIcon className="size-[1.3cqw]" strokeWidth={3} />
            Aprobar
            <Cursor className="absolute top-[55%] left-[70%]" />
          </span>
        </Tarjeta>
      </Pieza>
    </Escenario>
  )
}

const SERIE = [0.3, 0.34, 0.31, 0.42, 0.4, 0.48, 0.45, 0.55, 0.52, 0.62, 0.6, 0.7, 0.66, 0.78, 0.74, 0.86, 0.82, 0.94]

/** Un panel de cifras: la gráfica delante, el reparto y una cifra que mejora flotando, sobre el panel inclinado. */
export function EscenaEjemploPanel() {
  const puntos = SERIE.map((v, i) => `${((i / (SERIE.length - 1)) * 100).toFixed(2)},${(38 - v * 34).toFixed(2)}`).join(" ")
  return (
    <Escenario etiqueta="Un panel con la evolución, el reparto y una cifra que mejora">
      <Plano giro="rotateX(52deg) rotateZ(-26deg)" x={14} y={18} w={74} h={70} className="grid grid-cols-3 gap-[1.4cqw] rounded-[2.6cqw] bg-card/70 p-[2cqw] shadow-card">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="rounded-[1.4cqw] bg-foreground/5" />
        ))}
      </Plano>

      <Pieza x={4} y={16} w={58} retraso={0.15} z={2}>
        <Tarjeta className="flex flex-col gap-[1.4cqw] rounded-[2.4cqw] p-[2.4cqw]">
          <span className={cn(E.micro, "text-muted-foreground")}>Solicitudes · últimos 90 días</span>
          <span className="flex items-baseline gap-[1.2cqw]">
            <span className={E.cifra}>1.284</span>
            <span className={cn(E.micro, "rounded-full bg-success-soft px-[1cqw] py-[0.5cqw] font-semibold text-success")}>+32 %</span>
          </span>
          <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-[15cqw] w-full overflow-visible">
            <polygon points={`0,40 ${puntos} 100,40`} className="fill-brand/12" />
            <polyline points={puntos} className="fill-none stroke-brand" strokeWidth={2.2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </Tarjeta>
      </Pieza>

      <Pieza x={66} y={8} w={30} retraso={0.5} z={3}>
        <Tarjeta className="flex flex-col items-center gap-[1cqw] p-[2cqw]">
          <span className={cn(E.micro, "self-start text-muted-foreground")}>Clientes recurrentes</span>
          <span className="relative w-[62%]">
            <svg viewBox="0 0 36 36" className="w-full -rotate-90">
              <circle cx={18} cy={18} r={15.9} className="fill-none stroke-foreground/8" strokeWidth={3.4} />
              <circle cx={18} cy={18} r={15.9} pathLength={100} strokeDasharray="64 100" className="fill-none stroke-brand" strokeWidth={3.4} strokeLinecap="round" />
            </svg>
            <span className={cn(E.cifraMedia, "absolute inset-0 grid place-items-center")}>64 %</span>
          </span>
        </Tarjeta>
      </Pieza>

      <Pieza x={66} y={56} w={30} retraso={0.7} z={3}>
        <Tarjeta className="flex flex-col gap-[0.8cqw] p-[1.8cqw]">
          <span className={cn(E.micro, "text-muted-foreground")}>Tiempo de respuesta</span>
          <span className="flex items-baseline gap-[1cqw]">
            <span className={E.cifraMedia}>2 h</span>
            <span className={cn(E.micro, "font-semibold text-success")}>−40 %</span>
          </span>
          <svg viewBox="0 0 100 24" className="w-full overflow-visible">
            <path d="M0 4 L14 6 L28 5 L42 11 L56 10 L70 15 L84 16 L100 21" className="fill-none stroke-success" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </Tarjeta>
      </Pieza>
    </Escenario>
  )
}
