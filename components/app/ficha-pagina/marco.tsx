"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, SproutIcon, StarIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { BarraBloque } from "@/components/app/base/barra-bloque"

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
 * El encabezado de la página de un registro: el mismo que el de una base (`BarraBloque`). A la izquierda el recorrido o
 * la vuelta a la lista, a la derecha las acciones. Si no caben, las acciones bajan a su propia línea.
 */
export function FichaBarra({ inicio, className, children, ...props }: Omit<React.ComponentProps<"div">, "children"> & { inicio?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <BarraBloque data-slot="ficha-barra" inicio={inicio} className={cn("z-30 font-sans text-sm leading-normal", className)} {...props}>
      {children}
    </BarraBloque>
  )
}

/** Un grupo de botones de la barra, con 6 px entre ellos. */
export function FichaGrupo({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-wrap items-center gap-1.5", className)} {...props} />
}

/**
 * Un botón de la página de un registro: el botón de siempre del design system (`Button` outline), con icono, verbo y
 * objeto. `sm` para los de dentro de un bloque.
 */
export function BotonFicha({ tamano = "md", asChild, className, type, ...props }: React.ComponentProps<"button"> & { tamano?: "md" | "sm"; asChild?: boolean }) {
  return <Button data-slot="boton-ficha" variant="outline" size={tamano === "md" ? "sm" : "xs"} asChild={asChild} type={asChild ? undefined : (type ?? "button")} className={className} {...props} />
}

/** Botón de un solo icono (las flechas, el «…»). Lleva siempre `aria-label`. */
export function BotonFichaIcono({ tamano = "md", asChild, className, type, ...props }: React.ComponentProps<"button"> & { tamano?: "md" | "sm"; asChild?: boolean; "aria-label": string }) {
  return <Button data-slot="boton-ficha" variant="outline" size={tamano === "md" ? "icon-sm" : "icon-xs"} asChild={asChild} type={asChild ? undefined : (type ?? "button")} title={props["aria-label"]} className={cn("flex-none", className)} {...props} />
}

/** Favorita y Semilla: los dos conmutadores de la barra. Encendidos, el icono relleno de su color. `soloIcono` cuando la barra va llena (la cola de revisión). */
export function BotonFavorita({ activa, soloIcono, className, ...props }: Omit<React.ComponentProps<"button">, "children"> & { activa: boolean; soloIcono?: boolean }) {
  return (
    <Button type="button" variant="outline" size={soloIcono ? "icon-sm" : "sm"} aria-pressed={activa} aria-label={soloIcono ? "Favorita" : undefined} data-slot="boton-ficha" className={cn(activa && "bg-muted", className)} {...props}>
      <StarIcon className={cn(activa && "fill-ficha-favorita text-ficha-favorita")} aria-hidden />
      {!soloIcono && "Favorita"}
    </Button>
  )
}

export function BotonSemilla({ activa, soloIcono, className, ...props }: Omit<React.ComponentProps<"button">, "children"> & { activa: boolean; soloIcono?: boolean }) {
  return (
    <Button type="button" variant="outline" size={soloIcono ? "icon-sm" : "sm"} aria-pressed={activa} aria-label={soloIcono ? "Semilla" : undefined} data-slot="boton-ficha" className={cn(activa && "bg-muted", className)} {...props}>
      <SproutIcon className={cn(activa && "fill-ficha-semilla-hoja text-ficha-semilla")} aria-hidden />
      {!soloIcono && "Semilla"}
    </Button>
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
    <div className="flex items-center gap-1">
      <BotonFichaIcono aria-label={`Anterior: ${etiqueta}`} disabled={!onAnterior} onClick={onAnterior}>
        <ChevronLeftIcon aria-hidden />
      </BotonFichaIcono>
      <BotonFichaIcono aria-label={`Siguiente: ${etiqueta}`} disabled={!onSiguiente} onClick={onSiguiente}>
        <ChevronRightIcon aria-hidden />
      </BotonFichaIcono>
      <div className="ml-1 text-[13px] whitespace-nowrap text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">
          {posicion} de {total}
        </span>
        {vista ? ` en «${vista}»` : null}
      </div>
    </div>
  )
}
