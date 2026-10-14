"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "cn"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type OpcionTarjeta<V extends string> = { value: V; label: string; descripcion?: string; icono?: LucideIcon }

/**
 * Elegir una entre pocas opciones que hay que explicar («El brief completo» o «Solo los
 * materiales»): una tarjeta por opción con su icono, su nombre y una frase. La elegida, en
 * `brand-soft` con su borde.
 */
export function TarjetasOpcion<V extends string>({ opciones, valor, onChange, columnas = 2, className, "aria-label": ariaLabel }: { opciones: OpcionTarjeta<V>[]; valor: V; onChange: (valor: V) => void; columnas?: 1 | 2 | 3; className?: string; "aria-label"?: string }) {
  return (
    <RadioGroup
      value={valor}
      onValueChange={(v) => {
        const o = opciones.find((x) => x.value === v)
        if (o) onChange(o.value)
      }}
      aria-label={ariaLabel}
      className={cn("grid gap-2", columnas === 2 && "sm:grid-cols-2", columnas === 3 && "sm:grid-cols-3", className)}
    >
      {opciones.map(({ value, label, descripcion, icono: Icono }) => (
        <label key={value} className="group/tarjeta flex cursor-pointer items-start gap-3 rounded-xl border border-input p-3 transition-colors hover:bg-muted/50 has-data-[state=checked]:border-brand has-data-[state=checked]:bg-brand-soft">
          {Icono && (
            <span className="grid size-8 flex-none place-items-center rounded-lg border bg-card text-muted-foreground group-has-data-[state=checked]/tarjeta:text-brand">
              <Icono className="size-4" />
            </span>
          )}
          <span className="min-w-0 flex-1 text-sm">
            <span className="block font-medium">{label}</span>
            {descripcion && <span className="mt-0.5 block text-xs text-muted-foreground">{descripcion}</span>}
          </span>
          <RadioGroupItem value={value} className="mt-0.5" />
        </label>
      ))}
    </RadioGroup>
  )
}

export type OpcionIcono<V extends string> = { value: V; label: string; icono: React.ReactNode }

/**
 * Elegir una entre pocas opciones que se reconocen por su icono (la red donde se publica, el tipo
 * de pieza): una fila de botones cuadrados con el nombre al pasar el ratón. Con `opcional`, volver
 * a pulsar la elegida la quita.
 */
export function IconosOpcion<V extends string>({ opciones, valor, onChange, opcional, tamano = "md", className, "aria-label": ariaLabel }: { opciones: OpcionIcono<V>[]; valor: V | undefined; onChange: (valor: V | undefined) => void; opcional?: boolean; tamano?: "md" | "sm"; className?: string; "aria-label"?: string }) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className={cn("flex flex-wrap gap-1.5", className)}>
      {opciones.map((o) => {
        const elegida = o.value === valor
        return (
          <Tooltip key={o.value}>
            <TooltipTrigger asChild>
              <button
                type="button"
                role="radio"
                aria-checked={elegida}
                aria-label={o.label}
                onClick={() => onChange(elegida && opcional ? undefined : o.value)}
                className={cn(
                  "grid flex-none place-items-center rounded-lg border border-input text-muted-foreground transition-colors outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
                  tamano === "md" ? "size-10 [&_svg]:size-[18px]" : "size-8 [&_svg]:size-4",
                  elegida && "border-brand bg-brand-soft text-brand hover:bg-brand-soft hover:text-brand",
                )}
              >
                {o.icono}
              </button>
            </TooltipTrigger>
            <TooltipContent>{o.label}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
