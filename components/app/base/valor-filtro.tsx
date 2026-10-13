"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, PlusIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Checkbox } from "@/components/ui/checkbox"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DIAS_RELATIVOS, TRAMOS_RELATIVOS, leerValorFecha, type Condicion, type DefOperador } from "@/lib/filtros/core"
import { FichaOpcion } from "@/components/app/base/apariencia"
import type { CampoMenu } from "@/components/app/base/selector-campo"

const CAJA = "h-8 min-w-0 bg-transparent px-2 text-[13px] outline-none placeholder:text-muted-foreground"

/**
 * El valor de una condición, según el tipo del campo y el operador: texto o número que se aplica al
 * dejar de escribir, opciones con su color, la casilla, o un día relativo a hoy o un tramo en las
 * fechas, como en Airtable.
 */
export function ValorFiltro({ campo, def, condicion, onChange }: { campo: CampoMenu; def: DefOperador; condicion: Condicion; onChange: (cambio: Partial<Condicion>) => void }) {
  if (campo.tipo === "booleano") {
    return (
      <label className="flex h-8 flex-1 items-center px-2">
        <Checkbox checked={condicion.op === "verdadero"} onCheckedChange={(c) => onChange({ op: c === true ? "verdadero" : "falso", valor: undefined })} aria-label="Marcada" />
      </label>
    )
  }
  if (def.sinValor) return <span className="h-8 flex-1" />
  if (def.fecha) return <ValorFecha tramo={def.fecha === "tramo"} valor={typeof condicion.valor === "string" ? condicion.valor : undefined} onChange={(valor) => onChange({ valor })} />
  if (campo.tipo === "select" || campo.tipo === "multiselect") {
    const valores = Array.isArray(condicion.valor) ? condicion.valor : condicion.valor ? [condicion.valor] : []
    return def.multiple ? (
      <ValorOpciones campo={campo} valores={valores} onChange={(v) => onChange({ valor: v.length ? v : undefined })} />
    ) : (
      <ValorOpcion campo={campo} valor={valores[0]} onChange={(v) => onChange({ valor: v })} />
    )
  }
  return <ValorTexto numero={campo.tipo === "numero"} valor={typeof condicion.valor === "string" ? condicion.valor : ""} onChange={(v) => onChange({ valor: v === "" ? undefined : v })} />
}

/** Texto o número: se aplica a los 350 ms de dejar de escribir, para no recalcular la tabla con cada tecla. */
function ValorTexto({ numero, valor, onChange }: { numero: boolean; valor: string; onChange: (v: string) => void }) {
  const [texto, setTexto] = React.useState(valor)
  const ultimo = React.useRef(valor)
  React.useEffect(() => {
    if (texto === ultimo.current) return
    const t = setTimeout(() => {
      ultimo.current = texto
      onChange(texto)
    }, 350)
    return () => clearTimeout(t)
  }, [texto, onChange])
  return (
    <input
      className={cn(CAJA, "flex-1")}
      inputMode={numero ? "decimal" : undefined}
      placeholder={numero ? "Introduce un número" : "Introduce un valor"}
      value={texto}
      onChange={(e) => setTexto(numero ? e.target.value.replace(/[^\d.,-]/g, "") : e.target.value)}
    />
  )
}

function ListaOpciones({ campo, marcadas, onElegir }: { campo: CampoMenu; marcadas: string[]; onElegir: (id: string) => void }) {
  return (
    <Command>
      <CommandInput placeholder="Encuentra una opción" autoFocus />
      <CommandList className="max-h-64">
        <CommandEmpty>Ninguna opción se llama así</CommandEmpty>
        <CommandGroup>
          {(campo.opciones ?? []).map((o) => (
            <CommandItem key={o.value} value={`${o.label} ${o.value}`} onSelect={() => onElegir(o.value)}>
              <FichaOpcion label={o.label} color={o.color} />
              {marcadas.includes(o.value) && <CheckIcon className="ml-auto size-3.5" />}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

function ValorOpcion({ campo, valor, onChange }: { campo: CampoMenu; valor: string | undefined; onChange: (v: string | undefined) => void }) {
  const [abierto, setAbierto] = React.useState(false)
  const opcion = campo.opciones?.find((o) => o.value === valor)
  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(CAJA, "flex flex-1 items-center justify-between gap-1 text-left hover:bg-muted/60")}>
          {opcion ? <FichaOpcion label={opcion.label} color={opcion.color} /> : <span className="text-muted-foreground">Selecciona una opción</span>}
          <ChevronDownIcon className="size-3.5 flex-none text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <ListaOpciones
          campo={campo}
          marcadas={valor ? [valor] : []}
          onElegir={(id) => {
            onChange(id)
            setAbierto(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

function ValorOpciones({ campo, valores, onChange }: { campo: CampoMenu; valores: string[]; onChange: (v: string[]) => void }) {
  const [abierto, setAbierto] = React.useState(false)
  const alternar = (id: string) => onChange(valores.includes(id) ? valores.filter((v) => v !== id) : [...valores, id])
  return (
    <div className="flex min-h-8 min-w-0 flex-1 flex-wrap items-center gap-1 px-1.5 py-1">
      {valores.map((id) => {
        const o = campo.opciones?.find((x) => x.value === id)
        return (
          <FichaOpcion key={id} label={o?.label ?? id} color={o?.color}>
            <button type="button" aria-label={`Quitar ${o?.label ?? id}`} className="-mr-1 rounded-full opacity-60 hover:opacity-100" onClick={() => alternar(id)}>
              <XIcon className="size-3" />
            </button>
          </FichaOpcion>
        )
      })}
      <Popover open={abierto} onOpenChange={setAbierto}>
        <PopoverTrigger asChild>
          <button type="button" aria-label="Añadir una opción" className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground">
            <PlusIcon className="size-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-0">
          <ListaOpciones campo={campo} marcadas={valores} onElegir={alternar} />
        </PopoverContent>
      </Popover>
      {valores.length === 0 && <span className="text-[13px] text-muted-foreground">Selecciona opciones</span>}
    </div>
  )
}

/** Un día relativo a hoy («hace 3 días», una fecha exacta) o un tramo («los últimos 7 días»), como en Airtable. */
function ValorFecha({ tramo, valor, onChange }: { tramo: boolean; valor: string | undefined; onChange: (v: string) => void }) {
  const modos: readonly { value: string; label: string; numero?: boolean; sufijo?: string }[] = tramo ? TRAMOS_RELATIVOS : DIAS_RELATIVOS
  const { modo, n, dia } = leerValorFecha(valor ?? (tramo ? "semana_pasada" : undefined))
  const actual = modos.find((m) => m.value === modo) ?? modos[0]
  const [abierto, setAbierto] = React.useState(false)
  const elegir = (nuevo: string) => {
    const def = modos.find((m) => m.value === nuevo)
    if (nuevo === "exacta") onChange(dia ?? new Date().toISOString().slice(0, 10))
    else onChange(def?.numero ? `${nuevo}:${n ?? 7}` : nuevo)
    setAbierto(false)
  }
  return (
    <div className="flex min-w-0 flex-1 items-center divide-x">
      <Popover open={abierto} onOpenChange={setAbierto}>
        <PopoverTrigger asChild>
          <button type="button" className={cn(CAJA, "flex w-40 flex-none items-center justify-between gap-1 text-left hover:bg-muted/60")}>
            <span className="truncate">{actual.label}</span>
            <ChevronDownIcon className="size-3.5 flex-none text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-56 p-1">
          {modos.map((m) => (
            <button key={m.value} type="button" className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-[13px] hover:bg-muted" onClick={() => elegir(m.value)}>
              {m.label}
              {m.value === actual.value && <CheckIcon className="size-3.5" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      {actual.numero && (
        <span className="flex flex-1 items-center gap-1.5 pr-2">
          <input
            className={cn(CAJA, "w-16")}
            inputMode="numeric"
            aria-label="Número de días"
            value={n ?? ""}
            onChange={(e) => onChange(`${actual.value}:${e.target.value.replace(/\D/g, "")}`)}
          />
          <span className="text-[13px] text-muted-foreground">{actual.sufijo}</span>
        </span>
      )}
      {actual.value === "exacta" && <input type="date" aria-label="Fecha" className={cn(CAJA, "flex-1")} value={dia ?? ""} onChange={(e) => e.target.value && onChange(e.target.value)} />}
      {!actual.numero && actual.value !== "exacta" && <span className="flex-1" />}
    </div>
  )
}
