"use client"

import { Settings2Icon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

/**
 * El botoncito de «configurar esto»: abre la configuración de lo que tiene al lado (las fases de
 * un pipeline, los remitentes de un bloque, las opciones de un campo, los bloques de una página).
 * Es el mismo icono que el de los campos de la tabla, para que se reconozca en todas partes. Admite
 * las props de `Button`, así que también hace de disparador de un desplegable (`PopoverTrigger asChild`).
 *
 * La configuración vive donde se usa, nunca en una página de ajustes aparte.
 */
export function ConfigButton({ label, className, ...props }: { label: string } & Omit<React.ComponentProps<typeof Button>, "children">) {
  return (
    <Button type="button" variant="ghost" size="icon-xs" aria-label={label} title={label} className={cn("text-muted-foreground hover:text-foreground", className)} {...props}>
      <Settings2Icon />
    </Button>
  )
}
