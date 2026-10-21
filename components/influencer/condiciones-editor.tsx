"use client"

import * as React from "react"
import {
  AtSignIcon,
  BadgeCheckIcon,
  CalendarDaysIcon,
  ClockIcon,
  CopyrightIcon,
  EuroIcon,
  EyeIcon,
  FileTextIcon,
  GiftIcon,
  HashIcon,
  LinkIcon,
  LockIcon,
  MegaphoneIcon,
  PercentIcon,
  PinIcon,
  PlusIcon,
  RepeatIcon,
  ShieldCheckIcon,
  StarIcon,
  TagIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import type { Condicion, TipoCondicion } from "@/lib/influencer/modelo"
import { ICONOS_CONDICION, condicionDeTipo, iconoSugerido } from "@/lib/influencer/ajustes-collabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { IconosOpcion } from "@/components/app/formulario/opciones-visuales"
import { SelectorBuscable, type OpcionSelector } from "@/components/app/formulario/selector-buscable"
import { ESQUINAS_FORMULARIO } from "@/components/app/formulario/formulario-dialog"

const DIBUJOS: Record<(typeof ICONOS_CONDICION)[number]["id"], LucideIcon> = {
  candado: LockIcon,
  copyright: CopyrightIcon,
  megafono: MegaphoneIcon,
  enlace: LinkIcon,
  estrella: StarIcon,
  chincheta: PinIcon,
  reloj: ClockIcon,
  calendario: CalendarDaysIcon,
  ojo: EyeIcon,
  aprobado: BadgeCheckIcon,
  escudo: ShieldCheckIcon,
  etiqueta: TagIcon,
  porcentaje: PercentIcon,
  regalo: GiftIcon,
  personas: UsersIcon,
  repetir: RepeatIcon,
  arroba: AtSignIcon,
  hashtag: HashIcon,
  euro: EuroIcon,
  documento: FileTextIcon,
}

const esIcono = (icono: string): icono is keyof typeof DIBUJOS => Object.hasOwn(DIBUJOS, icono)

/** El icono de una condición; sin icono guardado, el que le va por su nombre. */
export function IconoCondicion({ icono, nombre, className }: { icono?: string; nombre: string; className?: string }) {
  const id = icono ?? iconoSugerido(nombre)
  const Dibujo = esIcono(id) ? DIBUJOS[id] : FileTextIcon
  return <Dibujo className={cn("size-3.5", className)} />
}

/** Las opciones de icono de una condición, para elegir el suyo. */
export const OPCIONES_ICONO_CONDICION = ICONOS_CONDICION.map((i) => ({ value: i.id, label: i.nombre, icono: <IconoCondicion icono={i.id} nombre={i.nombre} /> }))

/** Elegir el icono de una condición desde una fila (los ajustes de la tabla): el botón con el suyo y la rejilla debajo. */
export function SelectorIconoCondicion({ valor, nombre, onChange }: { valor?: string; nombre: string; onChange: (icono: string) => void }) {
  const [abierto, setAbierto] = React.useState(false)
  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`Icono de ${nombre || "la condición"}`} className="grid size-8 flex-none place-items-center rounded-md border border-input text-brand transition-colors hover:bg-muted">
          <IconoCondicion icono={valor} nombre={nombre} className="size-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={cn("w-auto p-2", ESQUINAS_FORMULARIO)}>
        <IconosOpcion
          tamano="sm"
          aria-label="Icono"
          className="grid grid-cols-5"
          opciones={OPCIONES_ICONO_CONDICION}
          valor={valor ?? iconoSugerido(nombre)}
          onChange={(v) => {
            if (v) onChange(v)
            setAbierto(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

/**
 * Las condiciones pactadas (exclusividad, derechos de uso, publicidad pagada…) en poco sitio: cada
 * una es su icono y sus días (el nombre, al pasar por encima), en una sola línea que se desplaza si
 * no caben. El «+» abre su lista para escribir, elegir (sale ya con sus días de serie) o quitar las
 * que tienen la marca; lo escrito que no existe se crea con `onNuevoTipo` (su formulario, encima),
 * que la devuelve con `usar`. Vale para la collab entera y para una pieza.
 */
export function CondicionesEditor({
  value,
  onChange,
  tipos,
  onNuevoTipo,
  textoVacio = "Condición",
  className,
}: {
  value: Condicion[]
  onChange: (condiciones: Condicion[]) => void
  tipos: TipoCondicion[]
  onNuevoTipo?: (nombre: string, usar: (tipo: TipoCondicion) => void) => void
  /** Lo que dice el botón cuando aún no hay ninguna. */
  textoVacio?: string
  className?: string
}) {
  const conDias = (c: Condicion) => tipos.find((t) => t.id === c.id)?.conDias ?? c.dias !== undefined
  // Si no caben en la línea, se desplazan y el borde se difumina mientras quede algo por ver.
  const fila = React.useRef<HTMLDivElement>(null)
  const [quedaMas, setQuedaMas] = React.useState(false)
  const medir = React.useCallback(() => {
    const f = fila.current
    setQuedaMas(!!f && f.scrollLeft + f.clientWidth < f.scrollWidth - 1)
  }, [])
  React.useEffect(() => {
    const f = fila.current
    if (!f) return
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(f)
    return () => observador.disconnect()
  }, [medir, value.length])
  const sueltas = value.filter((c) => !tipos.some((t) => t.id === c.id))
  const opciones: OpcionSelector[] = [
    ...tipos.map((t) => ({ value: t.id, label: t.nombre, detalle: t.conDias ? (t.dias ? `${t.dias} días por defecto` : "Con días") : undefined, icono: <IconoOpcion icono={t.icono} nombre={t.nombre} /> })),
    ...sueltas.map((c) => ({ value: c.id, label: c.nombre, icono: <IconoOpcion icono={c.icono} nombre={c.nombre} /> })),
  ]
  const alternar = (id: string) => {
    if (value.some((c) => c.id === id)) return onChange(value.filter((c) => c.id !== id))
    const tipo = tipos.find((t) => t.id === id)
    if (tipo) onChange([...value, condicionDeTipo(tipo)])
  }

  return (
    <div data-slot="ws-condiciones" className={cn("flex min-w-0 items-center gap-1", className)}>
      {value.length > 0 && (
        <div ref={fila} onScroll={medir} className={cn("flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", quedaMas && "[mask-image:linear-gradient(to_right,black_calc(100%-24px),transparent)]")}>
          {value.map((c) => (
            <Tooltip key={c.id}>
              <TooltipTrigger asChild>
                <span className={cn("inline-flex h-6 flex-none items-center rounded-full bg-brand-soft text-xs text-brand", conDias(c) ? "gap-0.5 pr-1.5 pl-1.5" : "w-6 justify-center")}>
                  <span role="img" aria-label={c.nombre} className="grid place-items-center">
                    <IconoCondicion icono={c.icono} nombre={c.nombre} />
                  </span>
                  {conDias(c) && (
                    <span className="flex items-center">
                      <input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={c.dias ?? ""}
                        placeholder="—"
                        aria-label={`Días de ${c.nombre}`}
                        onChange={(e) => {
                          const dias = e.target.value ? Math.max(1, Math.round(Number(e.target.value))) : undefined
                          onChange(value.map((x) => (x.id === c.id ? { ...x, dias } : x)))
                        }}
                        style={{ width: `${Math.max(1, String(c.dias ?? "").length) + 0.6}ch` }}
                        className="h-4.5 rounded-sm bg-transparent text-right font-medium text-foreground tabular-nums outline-none [appearance:textfield] placeholder:text-muted-foreground focus:bg-card [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-muted-foreground">d</span>
                    </span>
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {c.nombre}
                {c.dias ? ` · ${c.dias} días` : ""}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      )}
      <SelectorBuscable
        aspecto="boton"
        aria-label={value.length ? "Añadir o quitar condiciones" : "Añadir una condición"}
        disparador={
          value.length ? (
            <span className="grid size-6 place-items-center rounded-full border border-dashed border-input text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <PlusIcon className="size-3.5" />
            </span>
          ) : (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-dashed border-input px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <PlusIcon className="size-3.5" /> {textoVacio}
            </span>
          )
        }
        opciones={opciones}
        valor={undefined}
        marcados={value.map((c) => c.id)}
        placeholder="Busca o escribe una condición"
        vacio="Sin coincidencias. Escribe para crearla"
        onChange={alternar}
        onCrear={onNuevoTipo ? (nombre) => onNuevoTipo(nombre, (tipo) => onChange([...value, condicionDeTipo(tipo)])) : undefined}
      />
    </div>
  )
}

function IconoOpcion({ icono, nombre }: { icono?: string; nombre: string }) {
  return (
    <span className="grid size-6 flex-none place-items-center rounded-md bg-muted text-muted-foreground">
      <IconoCondicion icono={icono} nombre={nombre} />
    </span>
  )
}
