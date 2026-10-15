"use client"

import * as React from "react"
import { ChevronDownIcon, RepeatIcon } from "lucide-react"
import { cn } from "cn"
import type { DiaDelMes, FrecuenciaTarea, Repeticion } from "@/lib/influencer/modelo"
import { describirDiaDelMes, describirRepeticion, esUltimaSemanaDelMes } from "@/lib/influencer/tareas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InlineAutoEdit, inlineRestClass } from "@/components/app/inline-field"

/** Las unidades del «Cada N …». Trimestral no sale: se edita como «cada 3 meses». */
const UNIDADES: { id: Exclude<FrecuenciaTarea, "trimestral">; label: string }[] = [
  { id: "diaria", label: "días" },
  { id: "laborables", label: "días laborables" },
  { id: "semanal", label: "semanas" },
  { id: "mensual", label: "meses" },
  { id: "anual", label: "años" },
]

const ATAJOS: { label: string; frecuencia: Exclude<FrecuenciaTarea, "trimestral"> }[] = [
  { label: "Cada día", frecuencia: "diaria" },
  { label: "Laborables", frecuencia: "laborables" },
  { label: "Cada semana", frecuencia: "semanal" },
  { label: "Cada mes", frecuencia: "mensual" },
  { label: "Cada año", frecuencia: "anual" },
]

/** De lunes a domingo, con el número de `Date.getDay()` que guarda `Repeticion.dias`. */
const DIAS_SEMANA = [
  { valor: 1, corto: "L", nombre: "lunes" },
  { valor: 2, corto: "M", nombre: "martes" },
  { valor: 3, corto: "X", nombre: "miércoles" },
  { valor: 4, corto: "J", nombre: "jueves" },
  { valor: 5, corto: "V", nombre: "viernes" },
  { valor: 6, corto: "S", nombre: "sábado" },
  { valor: 0, corto: "D", nombre: "domingo" },
]

const MAX_CADA = 365

/** Trimestral se enseña como «cada 3 meses»; lo que no aplica a la frecuencia se quita. */
function limpia(r: Repeticion): Repeticion {
  const base = r.frecuencia === "trimestral" ? { ...r, frecuencia: "mensual" as const, cada: 3 * (r.cada ?? 1) } : r
  const porMeses = base.frecuencia === "mensual" || base.frecuencia === "anual"
  return {
    frecuencia: base.frecuencia,
    ...(base.cada && base.cada > 1 && base.frecuencia !== "laborables" ? { cada: base.cada } : {}),
    ...(base.frecuencia === "semanal" && base.dias?.length ? { dias: base.dias } : {}),
    ...(porMeses && base.diaDelMes && base.diaDelMes !== "dia" ? { diaDelMes: base.diaDelMes } : {}),
    ...(base.desde === "hecha" ? { desde: "hecha" as const } : {}),
    ...(base.hasta ? { hasta: base.hasta } : {}),
    ...(base.veces ? { veces: base.veces } : {}),
  }
}

function Fila({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex min-w-0 items-center gap-1.5">{children}</div>
    </div>
  )
}

/**
 * Cómo se repite una tarea, como en Notion o Todoist: atajos arriba y, debajo, cada cuántos días,
 * semanas, meses o años; qué días de la semana; qué día del mes (el 13 o el segundo martes); si se
 * cuenta desde su fecha o desde el día en que se hace; y cuándo termina. `fecha` es la de la tarea:
 * de ella salen el día del mes y el día de la semana por defecto.
 */
export function EditorRepeticion({ value, onChange, fecha }: { value?: Repeticion; onChange: (r: Repeticion | undefined) => void; fecha: string }) {
  const r = value ? limpia(value) : undefined
  const cambiar = (c: Partial<Repeticion>) => r && onChange(limpia({ ...r, ...c }))
  const fin = r?.hasta ? "hasta" : r?.veces ? "veces" : "nunca"
  const opcionesDiaMes: { id: DiaDelMes; label: string }[] = [
    { id: "dia", label: describirDiaDelMes(fecha, "dia") },
    { id: "semana", label: describirDiaDelMes(fecha, "semana") },
    ...(esUltimaSemanaDelMes(fecha) ? [{ id: "ultima-semana" as const, label: describirDiaDelMes(fecha, "ultima-semana") }] : []),
  ]

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-1">
        <Button type="button" size="xs" variant={r ? "outline" : "default"} onClick={() => onChange(undefined)}>
          No se repite
        </Button>
        {ATAJOS.map((a) => (
          <Button key={a.frecuencia} type="button" size="xs" variant={r?.frecuencia === a.frecuencia && !r.cada ? "default" : "outline"} onClick={() => onChange(limpia({ ...r, frecuencia: a.frecuencia, cada: undefined }))}>
            {a.label}
          </Button>
        ))}
      </div>

      {r && (
        <>
          <Fila label="Cada">
            {r.frecuencia !== "laborables" && (
              <Input
                type="number"
                min={1}
                max={MAX_CADA}
                value={r.cada ?? 1}
                onChange={(e) => cambiar({ cada: Math.min(MAX_CADA, Math.max(1, Math.floor(Number(e.target.value) || 1))) })}
                className="h-8 w-16 tabular-nums"
                aria-label="Cada cuántos"
              />
            )}
            <Select value={r.frecuencia} onValueChange={(v) => cambiar({ frecuencia: v as FrecuenciaTarea })}>
              <SelectTrigger size="sm" className="min-w-0 flex-1" aria-label="Unidad">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UNIDADES.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Fila>

          {r.frecuencia === "semanal" && (
            <Fila label="Los días">
              <ToggleGroup
                type="multiple"
                variant="outline"
                size="sm"
                spacing={1}
                value={(r.dias?.length ? r.dias : [new Date(`${fecha.slice(0, 10)}T12:00:00`).getDay()]).map(String)}
                onValueChange={(vs) => vs.length && cambiar({ dias: vs.map(Number) })}
                aria-label="Qué días de la semana"
              >
                {DIAS_SEMANA.map((d) => (
                  <ToggleGroupItem key={d.valor} value={String(d.valor)} aria-label={d.nombre} className="size-7 px-0 text-xs">
                    {d.corto}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </Fila>
          )}

          {(r.frecuencia === "mensual" || r.frecuencia === "anual") && (
            <Fila label="Qué día">
              <Select value={r.diaDelMes ?? "dia"} onValueChange={(v) => cambiar({ diaDelMes: v as DiaDelMes })}>
                <SelectTrigger size="sm" className="min-w-0 flex-1" aria-label="Qué día del mes">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {opcionesDiaMes.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.label.charAt(0).toUpperCase() + o.label.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Fila>
          )}

          <Fila label="Cuenta desde">
            <ToggleGroup type="single" variant="outline" size="sm" value={r.desde ?? "fecha"} onValueChange={(v) => v && cambiar({ desde: v as "fecha" | "hecha" })} className="w-full">
              <ToggleGroupItem value="fecha" className="flex-1 text-xs">
                Su fecha
              </ToggleGroupItem>
              <ToggleGroupItem value="hecha" className="flex-1 text-xs">
                Cuando la hago
              </ToggleGroupItem>
            </ToggleGroup>
          </Fila>

          <Fila label="Termina">
            <Select
              value={fin}
              onValueChange={(v) => cambiar(v === "hasta" ? { hasta: fecha.slice(0, 10), veces: undefined } : v === "veces" ? { veces: 5, hasta: undefined } : { hasta: undefined, veces: undefined })}
            >
              <SelectTrigger size="sm" className={cn("min-w-0", fin === "nunca" ? "flex-1" : "w-28")} aria-label="Cuándo termina">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nunca">Nunca</SelectItem>
                <SelectItem value="hasta">El día</SelectItem>
                <SelectItem value="veces">Tras</SelectItem>
              </SelectContent>
            </Select>
            {fin === "hasta" && <Input type="date" value={r.hasta} min={fecha.slice(0, 10)} onChange={(e) => e.target.value && cambiar({ hasta: e.target.value })} className="h-8 min-w-0 flex-1" aria-label="Último día" />}
            {fin === "veces" && (
              <>
                <Input type="number" min={1} max={999} value={r.veces} onChange={(e) => cambiar({ veces: Math.min(999, Math.max(1, Math.floor(Number(e.target.value) || 1))) })} className="h-8 w-16 tabular-nums" aria-label="Cuántas veces" />
                <span className="text-xs text-muted-foreground">veces</span>
              </>
            )}
          </Fila>

          <p className="rounded-md bg-muted/60 px-2 py-1.5 text-xs text-muted-foreground">{describirRepeticion(r, fecha)}</p>
        </>
      )}
    </div>
  )
}

/**
 * El campo «Repetir» con su editor en un desplegable. `variant="inline"` es el de la ficha (texto en
 * reposo, arranca abierto si se acaba de pulsar «+ Repetir»); `outline`, el de los formularios. Se
 * edita un borrador y se guarda una sola vez, al cerrar: escribir «12» no deja dos cambios.
 */
export function SelectorRepeticion({
  value,
  onChange,
  fecha,
  variant = "outline",
  id,
  className,
}: {
  value?: Repeticion
  onChange: (r: Repeticion | undefined) => void
  fecha: string
  variant?: "outline" | "inline"
  id?: string
  className?: string
}) {
  const autoEdit = React.useContext(InlineAutoEdit)
  const [abierto, setAbierto] = React.useState(autoEdit)
  const [borrador, setBorrador] = React.useState(value)
  const texto = value ? describirRepeticion(value, fecha) : "No se repite"
  const cambiarAbierto = (abrir: boolean) => {
    if (abrir) setBorrador(value)
    else if (JSON.stringify(borrador) !== JSON.stringify(value)) onChange(borrador)
    setAbierto(abrir)
  }
  return (
    <Popover open={abierto} onOpenChange={cambiarAbierto}>
      <PopoverTrigger asChild>
        {variant === "inline" ? (
          <button type="button" id={id} className={inlineRestClass}>
            <span className={cn("truncate text-sm", !value && "text-muted-foreground")}>{texto}</span>
          </button>
        ) : (
          <Button type="button" id={id} variant="outline" className={cn("w-full justify-between font-normal", className)}>
            <span className="flex min-w-0 items-center gap-1.5">
              {value && <RepeatIcon className="text-muted-foreground" />}
              <span className="truncate">{texto}</span>
            </span>
            <ChevronDownIcon className="text-muted-foreground" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[22rem]">
        <EditorRepeticion value={borrador} onChange={setBorrador} fecha={fecha} />
      </PopoverContent>
    </Popover>
  )
}
