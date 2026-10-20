"use client"

import * as React from "react"
import { CheckIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { Checkbox } from "@/components/ui/checkbox"
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
                  "grid flex-none place-items-center rounded-md border border-input text-muted-foreground transition-colors outline-none hover:bg-muted/60 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
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

/**
 * Elegir varias de una lista que hay que explicar (los apartados que se le piden a la marca): una
 * tarjeta con casilla por opción, en dos columnas. Las marcadas, en `brand-soft` con su borde.
 */
export function CasillasOpcion<V extends string>({ opciones, valores, onChange, columnas = 2, className, "aria-label": ariaLabel }: { opciones: OpcionTarjeta<V>[]; valores: V[]; onChange: (valores: V[]) => void; columnas?: 1 | 2 | 3; className?: string; "aria-label"?: string }) {
  const alternar = (v: V) => onChange(valores.includes(v) ? valores.filter((x) => x !== v) : [...valores, v])
  return (
    <div role="group" aria-label={ariaLabel} className={cn("grid gap-2", columnas === 2 && "sm:grid-cols-2", columnas === 3 && "sm:grid-cols-3", className)}>
      {opciones.map(({ value, label, descripcion, icono: Icono }) => (
        <label key={value} className="flex cursor-pointer items-start gap-3 rounded-xl border border-input p-3 transition-colors hover:bg-muted/50 has-data-[state=checked]:border-brand has-data-[state=checked]:bg-brand-soft">
          <Checkbox checked={valores.includes(value)} onCheckedChange={() => alternar(value)} className="mt-0.5" />
          {Icono && <Icono className="mt-0.5 size-4 flex-none text-muted-foreground" />}
          <span className="min-w-0 flex-1 text-sm">
            <span className="block font-medium">{label}</span>
            {descripcion && <span className="mt-0.5 block text-xs text-muted-foreground">{descripcion}</span>}
          </span>
        </label>
      ))}
    </div>
  )
}

export type OpcionPildora<V extends string> = { value: V; label: string; icono?: React.ReactNode }

const PILDORA = "inline-flex h-8 items-center gap-1.5 rounded-full border border-input px-3 text-sm transition-colors outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-3.5 [&_svg]:text-muted-foreground"
const PILDORA_ELEGIDA = "border-brand bg-brand-soft font-medium text-foreground ring-1 ring-brand hover:bg-brand-soft [&_svg]:text-brand"

/**
 * Elegir una entre opciones cortas que se leen de un vistazo (un tramo de seguidores, cuántas collabs al mes): una
 * fila de píldoras que salta de línea. Con `opcional`, volver a pulsar la elegida la quita. Para varias,
 * `PildorasMultiples`.
 */
export function PildorasOpcion<V extends string>({ opciones, valor, onChange, opcional, className, "aria-label": ariaLabel, id }: { opciones: OpcionPildora<V>[]; valor: V | undefined; onChange: (valor: V | undefined) => void; opcional?: boolean; className?: string; "aria-label"?: string; id?: string }) {
  return (
    <div id={id} role="radiogroup" aria-label={ariaLabel} className={cn("flex flex-wrap gap-1.5", className)}>
      {opciones.map((o) => {
        const elegida = o.value === valor
        return (
          <button key={o.value} type="button" role="radio" aria-checked={elegida} onClick={() => onChange(elegida && opcional ? undefined : o.value)} className={cn(PILDORA, elegida && PILDORA_ELEGIDA)}>
            {o.icono}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** Elegir varias entre opciones cortas (los tipos de collab que acepta, los idiomas): píldoras que se marcan y se quitan. */
export function PildorasMultiples<V extends string>({ opciones, valores, onChange, className, "aria-label": ariaLabel, id }: { opciones: OpcionPildora<V>[]; valores: V[]; onChange: (valores: V[]) => void; className?: string; "aria-label"?: string; id?: string }) {
  const alternar = (v: V) => onChange(valores.includes(v) ? valores.filter((x) => x !== v) : [...valores, v])
  return (
    <div id={id} role="group" aria-label={ariaLabel} className={cn("flex flex-wrap gap-1.5", className)}>
      {opciones.map((o) => {
        const marcada = valores.includes(o.value)
        return (
          <button key={o.value} type="button" aria-pressed={marcada} onClick={() => alternar(o.value)} className={cn(PILDORA, marcada && PILDORA_ELEGIDA)}>
            {marcada ? <CheckIcon strokeWidth={3} aria-hidden /> : o.icono}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
