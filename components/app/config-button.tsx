"use client"

import { Settings2Icon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

/**
 * El botoncito de «configurar esto»: abre la configuración de lo que tiene al lado (las fases de
 * un pipeline, los remitentes de un bloque, las opciones de un campo). Es el mismo icono que el
 * de los campos de la tabla, para que se reconozca en todas partes.
 *
 * La configuración vive donde se usa, nunca en una página de ajustes aparte.
 */
export function ConfigButton({ label, onClick, className }: { label: string; onClick: () => void; className?: string }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      <Settings2Icon />
    </Button>
  )
}
