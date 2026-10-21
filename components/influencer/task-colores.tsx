"use client"

import * as React from "react"
import { CheckIcon } from "lucide-react"
import { cn } from "cn"
import { PRIORIDADES_TAREA, type EtiquetaTarea, type PrioridadTarea } from "@/lib/influencer/modelo"
import { tintClass } from "@/lib/influencer/tints"
import {
  COLORES_TAREA,
  COLORES_TAREAS_DE_SERIE,
  MAX_DIAS_PROXIMOS,
  OPCIONES_COLOREAR,
  TRAMOS_URGENCIA,
  type ColorDeTarea,
  type ColorTarea,
  type ColoresTareas,
  type ColorearPor,
} from "@/lib/influencer/colores-tareas"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/** El fondo de una tarea pintada (un día del calendario): estados con sus tokens y el resto con tintes. */
const FONDO: Record<ColorTarea, string> = {
  rojo: "bg-danger-soft text-danger",
  naranja: tintClass.peach,
  amarillo: "bg-warning-soft text-warning",
  verde: "bg-success-soft text-success",
  azul: "bg-info-soft text-info",
  morado: tintClass.lavender,
  rosa: tintClass.rose,
  gris: "bg-muted text-muted-foreground",
  ninguno: "bg-muted text-foreground/80",
}

/** El texto de una fecha en ese color. */
export const TEXTO_COLOR: Record<ColorTarea, string> = {
  rojo: "text-danger",
  naranja: "text-tint-peach-foreground",
  amarillo: "text-warning",
  verde: "text-success",
  azul: "text-info",
  morado: "text-tint-lavender-foreground",
  rosa: "text-tint-rose-foreground",
  gris: "text-muted-foreground",
  ninguno: "text-muted-foreground",
}

/** La bolita de la paleta, en el tono fuerte de cada color para distinguirlos de un vistazo. */
const BOLITA: Record<Exclude<ColorTarea, "ninguno">, string> = {
  rojo: "bg-danger",
  naranja: "bg-tint-peach-foreground",
  amarillo: "bg-warning",
  verde: "bg-success",
  azul: "bg-info",
  morado: "bg-tint-lavender-foreground",
  rosa: "bg-tint-rose-foreground",
  gris: "bg-muted-foreground",
}

export const fondoDe = (c: ColorDeTarea) => ("tinte" in c ? tintClass[c.tinte] : FONDO[c.color])

const ColoresContext = React.createContext<{ colores: ColoresTareas; etiquetas: EtiquetaTarea[] }>({ colores: COLORES_TAREAS_DE_SERIE, etiquetas: [] })

/** Los colores que ha elegido ella, para todo lo que pinta tareas debajo (fechas, calendario). Sin él, los de serie. */
export function ColoresTareasProvider({ colores, etiquetas, children }: { colores: ColoresTareas; etiquetas: EtiquetaTarea[]; children: React.ReactNode }) {
  const valor = React.useMemo(() => ({ colores, etiquetas }), [colores, etiquetas])
  return <ColoresContext.Provider value={valor}>{children}</ColoresContext.Provider>
}

export const useColoresTareas = () => React.useContext(ColoresContext)

/** La paleta en una fila de bolitas: la elegida lleva su marca. */
function ElegirColor({ value, onChange, label }: { value: ColorTarea; onChange: (c: ColorTarea) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
      {COLORES_TAREA.map((c) => (
        <button
          key={c.id}
          type="button"
          role="radio"
          aria-checked={value === c.id}
          aria-label={c.label}
          title={c.label}
          onClick={() => onChange(c.id)}
          className={cn(
            "grid size-6 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
            c.id === "ninguno" ? "border border-dashed border-input text-muted-foreground" : cn(BOLITA[c.id], "text-background"),
            value === c.id && "ring-2 ring-foreground/70 ring-offset-1 ring-offset-background",
          )}
        >
          {value === c.id && <CheckIcon className="size-3" aria-hidden />}
        </button>
      ))}
    </div>
  )
}

function Fila({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] items-center gap-3">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  )
}

/**
 * Cómo se pintan las tareas: por qué se colorean (urgencia, prioridad, etiqueta, marca o nada) y qué
 * color lleva cada tramo de urgencia y cada prioridad. Las fechas de las listas siguen siempre la
 * urgencia. Se guarda al momento; «Volver a los de serie» deja la configuración de fábrica.
 */
export function ColoresTareasDialog({ open, onOpenChange, colores, onChange }: { open: boolean; onOpenChange: (o: boolean) => void; colores: ColoresTareas; onChange: (c: ColoresTareas) => void }) {
  const cambiar = (c: Partial<ColoresTareas>) => onChange({ ...colores, ...c })
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Colores de las tareas</DialogTitle>
          <DialogDescription>Criterio de color de las tareas en el calendario y color de las fechas según su urgencia.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <Fila label="Colorear">
            <Select value={colores.por} onValueChange={(v) => cambiar({ por: v as ColorearPor })}>
              <SelectTrigger className="w-full" aria-label="Por qué se colorean">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPCIONES_COLOREAR.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Fila>

          <section className="grid gap-2.5">
            <h3 className="text-xs font-medium text-muted-foreground">Urgencia{colores.por !== "urgencia" && " (las fechas de las listas)"}</h3>
            {TRAMOS_URGENCIA.map((t) => (
              <Fila
                key={t.id}
                label={
                  t.id === "proximos" ? (
                    <span className="flex items-center gap-1.5">
                      Los
                      <Input
                        type="number"
                        min={1}
                        max={MAX_DIAS_PROXIMOS}
                        value={colores.diasProximos}
                        onChange={(e) => cambiar({ diasProximos: Math.min(MAX_DIAS_PROXIMOS, Math.max(1, Math.floor(Number(e.target.value) || 1))) })}
                        className="h-7 w-12 px-1.5 text-center tabular-nums"
                        aria-label="Cuántos días cuentan como próximos"
                      />
                      días
                    </span>
                  ) : (
                    t.label
                  )
                }
              >
                <ElegirColor value={colores.urgencia[t.id]} onChange={(c) => cambiar({ urgencia: { ...colores.urgencia, [t.id]: c } })} label={`Color de ${t.label.toLowerCase()}`} />
              </Fila>
            ))}
          </section>

          {colores.por === "prioridad" && (
            <section className="grid gap-2.5">
              <h3 className="text-xs font-medium text-muted-foreground">Prioridad</h3>
              {PRIORIDADES_TAREA.map((p) => (
                <Fila key={p.id} label={p.label}>
                  <ElegirColor value={colores.prioridad[p.id]} onChange={(c) => cambiar({ prioridad: { ...colores.prioridad, [p.id as PrioridadTarea]: c } })} label={`Color de prioridad ${p.label.toLowerCase()}`} />
                </Fila>
              ))}
            </section>
          )}
          {(colores.por === "etiqueta" || colores.por === "marca") && (
            <p className="text-xs text-muted-foreground">
              {colores.por === "etiqueta" ? "Cada tarea usa el color de su primera etiqueta." : "Las tareas de una campaña usan el color de su marca."}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onChange(COLORES_TAREAS_DE_SERIE)}>
            Volver a los de serie
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Listo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
