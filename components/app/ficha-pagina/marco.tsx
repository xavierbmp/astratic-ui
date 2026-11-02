"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { ChevronLeftIcon, ChevronRightIcon, SproutIcon, StarIcon } from "lucide-react"
import { cn } from "cn"

/**
 * El marco de la página de un registro: el fondo y la tipografía de la ficha. Dentro van la barra de acciones
 * (`FichaBarra`) y el contenido (`FichaContenido`). La página lo usa a pantalla entera, sin `PageBody`.
 */
export function FichaPagina({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="ficha-pagina" className={cn("min-h-full flex-1 bg-ficha-fondo font-ficha text-[15px] leading-[1.45] text-ficha-tinta antialiased", className)} {...props} />
}

/** La columna de bloques, con 16 px entre ellos. */
export function FichaContenido({ className, ...props }: React.ComponentProps<"main">) {
  return <main data-slot="ficha-contenido" className={cn("mx-auto box-border flex max-w-[1440px] min-w-0 flex-col gap-4 px-4 pt-1 pb-24 md:px-7", className)} {...props} />
}

/**
 * La barra fija de arriba: a la izquierda el recorrido o la vuelta a la lista, a la derecha las acciones. En pantallas
 * estrechas las acciones bajan a su propia línea.
 */
export function FichaBarra({ inicio, className, children, ...props }: Omit<React.ComponentProps<"header">, "children"> & { inicio?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header data-slot="ficha-barra" className={cn("z-30 bg-ficha-fondo/85 backdrop-blur-[16px] backdrop-saturate-[1.4] md:sticky md:top-0", className)} {...props}>
      <div className="mx-auto box-border flex max-w-[1440px] flex-wrap items-center gap-x-3.5 gap-y-2.5 px-4 py-2.5 md:px-7">
        {inicio}
        <div className="min-w-0 flex-1 basis-0" />
        {children}
      </div>
    </header>
  )
}

/** Un grupo de botones de la barra, con 6 px entre ellos. */
export function FichaGrupo({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-wrap items-center gap-1.5", className)} {...props} />
}

const BASE = "inline-flex cursor-pointer items-center whitespace-nowrap border-0 bg-(image:--ficha-boton) text-ficha-tinta shadow-ficha-boton outline-none transition-[background-image,transform] select-none hover:bg-(image:--ficha-boton-hover) hover:text-ficha-tinta focus-visible:ring-2 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:flex-none [&_svg:not([class*='size-'])]:size-[18px]"

/** Botón en relieve de la ficha: píldora gris con icono, verbo y objeto. `sm` para los de dentro de un bloque. */
export function BotonFicha({ tamano = "md", asChild, className, type, ...props }: React.ComponentProps<"button"> & { tamano?: "md" | "sm"; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="boton-ficha"
      type={asChild ? undefined : (type ?? "button")}
      className={cn(BASE, "justify-center gap-2 rounded-full font-medium", tamano === "md" ? "h-10 pr-3.5 pl-3 text-sm" : "h-[30px] gap-1.5 pr-3 pl-2.5 text-[13px] shadow-ficha-boton-sm [&_svg:not([class*='size-'])]:size-3.5", className)}
      {...props}
    />
  )
}

/** Botón redondo de un solo icono (las flechas, el «…»). Lleva siempre `aria-label`. */
export function BotonFichaIcono({ asChild, className, type, ...props }: React.ComponentProps<"button"> & { asChild?: boolean; "aria-label": string }) {
  const Comp = asChild ? Slot.Root : "button"
  return <Comp data-slot="boton-ficha" type={asChild ? undefined : (type ?? "button")} title={props["aria-label"]} className={cn(BASE, "size-10 flex-none justify-center rounded-full p-0", className)} {...props} />
}

/** Favorita y Semilla: los dos conmutadores de la barra. Encendidos, con su tinte. */
export function BotonFavorita({ activa, className, ...props }: Omit<React.ComponentProps<"button">, "children"> & { activa: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      data-slot="boton-ficha"
      className={cn(BASE, "h-10 gap-2 rounded-full pr-3.5 pl-3 text-sm font-medium", activa && "bg-(image:--ficha-boton-favorita) shadow-ficha-favorita hover:bg-(image:--ficha-boton-favorita)", className)}
      {...props}
    >
      <StarIcon strokeWidth={1.8} className={cn(activa && "fill-ficha-favorita text-ficha-favorita")} aria-hidden />
      Favorita
    </button>
  )
}

export function BotonSemilla({ activa, className, ...props }: Omit<React.ComponentProps<"button">, "children"> & { activa: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={activa}
      data-slot="boton-ficha"
      className={cn(BASE, "h-10 gap-2 rounded-full pr-3.5 pl-3 text-sm font-medium", activa && "bg-(image:--ficha-boton-semilla) shadow-ficha-semilla hover:bg-(image:--ficha-boton-semilla)", className)}
      {...props}
    >
      <SproutIcon strokeWidth={1.8} className={cn(activa && "fill-ficha-semilla-hoja text-ficha-semilla")} aria-hidden />
      Semilla
    </button>
  )
}

/**
 * El recorrido de la lista de la que se viene: las flechas y «12 de 148 en «Moda BCN»». Sin lista no pinta nada: la
 * página enseña en su lugar `Volver`.
 */
export function FichaRecorrido({
  posicion,
  total,
  vista,
  onAnterior,
  onSiguiente,
  etiqueta = "registro",
}: {
  posicion: number
  total: number
  vista?: string
  onAnterior?: () => void
  onSiguiente?: () => void
  /** Cómo se llama el registro en el nombre accesible de las flechas: «Influencer anterior». */
  etiqueta?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <BotonFichaIcono aria-label={`Anterior: ${etiqueta}`} disabled={!onAnterior} onClick={onAnterior}>
        <ChevronLeftIcon strokeWidth={1.8} aria-hidden />
      </BotonFichaIcono>
      <BotonFichaIcono aria-label={`Siguiente: ${etiqueta}`} disabled={!onSiguiente} onClick={onSiguiente}>
        <ChevronRightIcon strokeWidth={1.8} aria-hidden />
      </BotonFichaIcono>
      <div className="ml-1.5 text-sm whitespace-nowrap text-ficha-tinta-2">
        <span className="font-medium text-ficha-tinta tabular-nums">
          {posicion} de {total}
        </span>
        {vista ? ` en «${vista}»` : null}
      </div>
    </div>
  )
}
