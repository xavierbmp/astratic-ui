"use client"

// Cómo se ve cada cosa de la base: el icono de cada tipo de campo, los colores de las opciones y
// la ficha de una opción. Las clases van escritas enteras para que Tailwind las encuentre.

import * as React from "react"
import {
  AlignLeftIcon,
  CalendarDaysIcon,
  CircleDotIcon,
  Columns3Icon,
  EuroIcon,
  GlobeIcon,
  HashIcon,
  LayoutGridIcon,
  Link2Icon,
  MailIcon,
  PercentIcon,
  PhoneIcon,
  SquareCheckIcon,
  StarIcon,
  Table2Icon,
  TagsIcon,
  TypeIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import { AvatarInitials } from "@/components/app/avatar-initials"
import type { TipoFiltro } from "@/lib/filtros/core"
import type { ColorOpcion, TipoCampo } from "@/lib/base/campos"
import type { TipoVista } from "@/lib/base/vistas"

export const ICONO_TIPO: Record<TipoCampo, LucideIcon> = {
  texto: TypeIcon,
  texto_largo: AlignLeftIcon,
  casilla: SquareCheckIcon,
  multiselect: TagsIcon,
  select: CircleDotIcon,
  fecha: CalendarDaysIcon,
  telefono: PhoneIcon,
  email: MailIcon,
  url: GlobeIcon,
  numero: HashIcon,
  moneda: EuroIcon,
  porcentaje: PercentIcon,
  calificacion: StarIcon,
  vinculo: Link2Icon,
}

/** El icono de cada tipo de vista: los mismos del conmutador de vistas del design system. */
export const ICONO_VISTA: Record<TipoVista, LucideIcon> = {
  cuadricula: Table2Icon,
  kanban: Columns3Icon,
  galeria: LayoutGridIcon,
  calendario: CalendarDaysIcon,
}

/** El icono para los campos que solo se conocen por su tipo de filtro (fuera de una base). */
export const ICONO_FILTRO: Record<TipoFiltro, LucideIcon> = {
  texto: TypeIcon,
  numero: HashIcon,
  fecha: CalendarDaysIcon,
  select: CircleDotIcon,
  multiselect: TagsIcon,
  booleano: SquareCheckIcon,
}

export const CLASE_OPCION: Record<ColorOpcion, string> = {
  azul: "bg-opcion-azul text-opcion-azul-foreground",
  cian: "bg-opcion-cian text-opcion-cian-foreground",
  verde: "bg-opcion-verde text-opcion-verde-foreground",
  amarillo: "bg-opcion-amarillo text-opcion-amarillo-foreground",
  naranja: "bg-opcion-naranja text-opcion-naranja-foreground",
  rojo: "bg-opcion-rojo text-opcion-rojo-foreground",
  rosa: "bg-opcion-rosa text-opcion-rosa-foreground",
  morado: "bg-opcion-morado text-opcion-morado-foreground",
  gris: "bg-opcion-gris text-opcion-gris-foreground",
}

/** El color fuerte: la marca de color de la fila y la muestra del selector de colores. */
export const CLASE_FUERTE: Record<ColorOpcion, string> = {
  azul: "bg-opcion-azul-fuerte",
  cian: "bg-opcion-cian-fuerte",
  verde: "bg-opcion-verde-fuerte",
  amarillo: "bg-opcion-amarillo-fuerte",
  naranja: "bg-opcion-naranja-fuerte",
  rojo: "bg-opcion-rojo-fuerte",
  rosa: "bg-opcion-rosa-fuerte",
  morado: "bg-opcion-morado-fuerte",
  gris: "bg-opcion-gris-fuerte",
}

/** La ficha de una opción, redondeada y con su color, como en Airtable. Sin color, gris. */
export function FichaOpcion({ label, color, className, children }: { label: string; color?: ColorOpcion; className?: string; children?: React.ReactNode }) {
  return (
    <span className={cn("inline-flex max-w-full min-w-0 items-center gap-1 rounded-full px-2 py-px text-xs leading-[18px] whitespace-nowrap", CLASE_OPCION[color ?? "gris"], className)}>
      <span className="truncate">{label}</span>
      {children}
    </span>
  )
}

/**
 * Un registro de otra base (la marca de un contacto): sus iniciales y su nombre en una ficha con
 * borde, distinta de las opciones de color. Con `onAbrir`, se pulsa y abre su ficha.
 */
export function FichaVinculo({ label, onAbrir, className, children }: { label: string; onAbrir?: () => void; className?: string; children?: React.ReactNode }) {
  const contenido = (
    <>
      <AvatarInitials name={label} size="xs" variant="entity" className="size-4 rounded-[4px] text-[8px]" />
      <span className={cn("truncate", onAbrir && "group-hover/vinculo:underline group-hover/vinculo:underline-offset-2")}>{label}</span>
    </>
  )
  const clase = cn("group/vinculo inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-md border bg-background py-px pr-2 pl-0.5 text-xs leading-[18px] whitespace-nowrap", className)
  if (!onAbrir)
    return (
      <span className={clase}>
        {contenido}
        {children}
      </span>
    )
  return (
    <span className={clase}>
      {/* Se abre sin seleccionar la celda de debajo ni abrir la tarjeta en la que va. */}
      <button
        type="button"
        title={`Abrir ${label}`}
        className="flex min-w-0 items-center gap-1.5 text-left"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onAbrir()
        }}
      >
        {contenido}
      </button>
      {children}
    </span>
  )
}

/** El icono del tipo de un campo, en gris y del tamaño de la cabecera. */
export function IconoCampo({ icono: Icono, className }: { icono: LucideIcon; className?: string }) {
  return <Icono aria-hidden className={cn("size-3.5 flex-none text-muted-foreground", className)} />
}
