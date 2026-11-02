"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { PopoverContent } from "@/components/ui/popover"

const CAJA = "w-auto rounded-ficha-menu border-0 bg-ficha-superficie p-1.5 font-ficha text-ficha-tinta shadow-ficha-menu ring-0"

/** El contenido de un desplegable de la ficha (radio 20, sombra amplia). Va dentro de `DropdownMenu`. */
export function MenuFichaContenido({ className, align = "end", sideOffset = 8, ...props }: React.ComponentProps<typeof DropdownMenuContent>) {
  return <DropdownMenuContent align={align} sideOffset={sideOffset} className={cn(CAJA, "min-w-60", className)} {...props} />
}

/** Lo mismo para un `Popover` con contenido propio (añadir tarea, elegir tags). */
export function PopoverFichaContenido({ className, align = "end", sideOffset = 8, ...props }: React.ComponentProps<typeof PopoverContent>) {
  return <PopoverContent align={align} sideOffset={sideOffset} className={cn(CAJA, "gap-0", className)} {...props} />
}

export function MenuFichaTitulo({ className, ...props }: React.ComponentProps<typeof DropdownMenuLabel>) {
  return <DropdownMenuLabel className={cn("px-3 pt-2 pb-1.5 text-[12.5px] font-normal text-ficha-tinta-3", className)} {...props} />
}

export const MENU_OPCION = "cursor-pointer gap-2.5 rounded-ficha-opcion px-3 py-2.5 text-sm text-ficha-tinta focus:bg-ficha-campo focus:text-ficha-tinta"

/** Una opción del desplegable, con su punto de color y su check si es la actual. */
export function MenuFichaOpcion({
  punto,
  actual,
  meta,
  className,
  children,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & {
  /** La clase del color del punto (`bg-ficha-ok`). */
  punto?: string
  actual?: boolean
  /** Lo de la derecha, en gris: «12 perfiles». */
  meta?: React.ReactNode
}) {
  return (
    <DropdownMenuItem className={cn(MENU_OPCION, className)} {...props}>
      {punto && <span className={cn("size-2 flex-none rounded-full", punto)} aria-hidden />}
      <span className="flex min-w-0 flex-1 items-center gap-2.5">{children}</span>
      {meta && <span className="flex-none text-[12.5px] text-ficha-tinta-3">{meta}</span>}
      {actual && <CheckIcon className="size-4 flex-none" strokeWidth={2} aria-hidden />}
    </DropdownMenuItem>
  )
}

export function MenuFichaSeparador({ className, ...props }: React.ComponentProps<typeof DropdownMenuSeparator>) {
  return <DropdownMenuSeparator className={cn("mx-2.5 my-1.5 bg-ficha-raya", className)} {...props} />
}

/** La casilla negra de un menú con varias opciones marcables. */
export function CasillaFicha({ marcada, tamano = 20, className }: { marcada: boolean; tamano?: 18 | 20 | 22; className?: string }) {
  const medida = tamano === 18 ? "size-[18px] rounded-md" : tamano === 22 ? "size-[22px] rounded-[7px]" : "size-5 rounded-md"
  return (
    <span className={cn("flex flex-none items-center justify-center", medida, marcada ? "bg-ficha-solido text-ficha-sobre-solido" : "shadow-[inset_0_0_0_1.5px_var(--ficha-casilla)]", className)} aria-hidden>
      {marcada && <CheckIcon className="size-3.5" strokeWidth={2.5} />}
    </span>
  )
}
