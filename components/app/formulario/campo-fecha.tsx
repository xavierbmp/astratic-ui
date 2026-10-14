"use client"

import * as React from "react"
import { CalendarDaysIcon } from "lucide-react"
import { es } from "react-day-picker/locale"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ESQUINAS_FORMULARIO } from "@/components/app/formulario/formulario-dialog"

// Los días viajan como «2026-10-14» (de un momento, «2026-10-14T18:30», se toma el día): se leen y se
// escriben en hora local para que no salten de día.
const dePalabra = (dia: string) => {
  const [a, m, d] = dia.slice(0, 10).split("-").map(Number)
  return a && m && d ? new Date(a, m - 1, d) : undefined
}
const aPalabra = (fecha: Date) => `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`

/**
 * Un día, con su calendario: el botón enseña la fecha («14 oct», con el año si no es el de
 * `hoy`) y el icono, y al pulsarlo se elige en el calendario (lunes primero), entre `min` y `max`.
 * Sin fecha, el calendario abre en el mes de `min` o, si no hay, en el de `hoy`.
 */
export function CampoFecha({
  id,
  valor,
  onChange,
  hoy,
  min,
  max,
  placeholder = "Elige el día",
  invalido,
  disabled,
  tamano = "md",
  aspecto = "campo",
  prefijo,
  className,
  "aria-label": ariaLabel,
}: {
  id?: string
  valor: string
  onChange: (dia: string) => void
  /** «2026-10-14»: marca el día de hoy y decide si se enseña el año. */
  hoy?: string
  min?: string
  max?: string
  placeholder?: string
  invalido?: boolean
  disabled?: boolean
  tamano?: "md" | "sm"
  /** `texto`: sin caja, como un enlace con su icono («Publica el 30 oct»), para dentro de una tarjeta. */
  aspecto?: "campo" | "texto"
  /** Lo que va antes de la fecha en el aspecto `texto` («Publica el»). */
  prefijo?: string
  className?: string
  "aria-label"?: string
}) {
  const [abierto, setAbierto] = React.useState(false)
  const fecha = valor ? dePalabra(valor) : undefined
  const desde = min ? dePalabra(min) : undefined
  const hasta = max ? dePalabra(max) : undefined
  const hoyFecha = hoy ? dePalabra(hoy) : undefined
  const conAno = fecha && hoyFecha && fecha.getFullYear() !== hoyFecha.getFullYear()
  const fueraDeRango = [...(desde ? [{ before: desde }] : []), ...(hasta ? [{ after: hasta }] : [])]

  return (
    <Popover open={abierto} onOpenChange={setAbierto} modal>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          data-invalido={invalido || undefined}
          aria-label={ariaLabel}
          disabled={disabled}
          data-slot="campo-fecha"
          className={cn(
            "flex min-w-0 items-center gap-2 text-left text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-invalido:text-destructive",
            aspecto === "texto"
              ? "h-8 rounded-md px-2 text-[13px] hover:bg-muted"
              : cn("border border-input bg-transparent hover:bg-muted/50 focus-visible:border-ring data-invalido:border-destructive data-invalido:ring-3 data-invalido:ring-destructive/20 dark:bg-input/30", tamano === "md" ? "h-10 w-full rounded-md px-3" : "h-8 rounded-sm px-2 text-[13px]"),
            className,
          )}
        >
          <CalendarDaysIcon className={cn("size-4 flex-none", fecha ? "text-brand" : "text-muted-foreground")} />
          <span className={cn("truncate tabular-nums", !fecha && "text-muted-foreground")}>{fecha ? `${prefijo ? `${prefijo} ` : ""}${fmt.date(fecha)}${conAno ? ` ${fecha.getFullYear()}` : ""}` : placeholder}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-auto p-0", ESQUINAS_FORMULARIO)}>
        <Calendar
          mode="single"
          locale={es}
          weekStartsOn={1}
          selected={fecha}
          defaultMonth={fecha ?? desde ?? hoyFecha}
          today={hoyFecha}
          disabled={fueraDeRango}
          onSelect={(d) => {
            if (!d) return
            onChange(aPalabra(d))
            setAbierto(false)
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
