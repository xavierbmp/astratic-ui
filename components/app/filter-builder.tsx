"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, ListFilterIcon, PlusIcon, SettingsIcon, SlidersHorizontalIcon, StarIcon, Trash2Icon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/app/multi-select"
import {
  defOperador,
  describirCondicion,
  operadorPorDefecto,
  operadoresDe,
  type CampoFiltrable,
  type Condicion,
  type GrupoCondiciones,
} from "@/lib/filtros/core"

/**
 * Constructor de filtros al estilo Airtable: campo + operador + valor, unidos con Y o con O.
 * Los operadores que se ofrecen salen del tipo del campo (texto, número, fecha, lista, sí/no).
 *
 * Es controlado: el grupo de condiciones vive donde lo use la página (normalmente en la URL) y
 * aquí solo se edita. Los filtros rápidos escriben en este mismo grupo, así que todo lo activo
 * se ve junto en los chips.
 */
export function FilterBuilder<T>({
  campos,
  value,
  onChange,
  objeto = "registros",
  onCrearCampo,
  onGuardarRapido,
  onEditarRapidos,
}: {
  campos: CampoFiltrable<T>[]
  value: GrupoCondiciones
  onChange: (next: GrupoCondiciones) => void
  /** Para el texto de cabecera: «Mostrar las empresas que cumplen…». */
  objeto?: string
  /** Si se pasa, el selector de campo ofrece crear uno nuevo. */
  onCrearCampo?: () => void
  /** Si se pasa, se puede guardar el filtro actual como rápido. */
  onGuardarRapido?: (grupo: GrupoCondiciones) => void
  /** Si se pasa, desde aquí se eligen los filtros rápidos que se ven en la toolbar. */
  onEditarRapidos?: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const condiciones = value.condiciones
  const n = condiciones.length

  const set = (condiciones: Condicion[]) => onChange({ ...value, condiciones })
  const editar = (i: number, cambio: Partial<Condicion>) =>
    set(condiciones.map((c, j) => (j === i ? { ...c, ...cambio } : c)))
  const quitar = (i: number) => set(condiciones.filter((_, j) => j !== i))
  const anadir = () => {
    const nueva = condicionNueva(campos)
    if (nueva) set([...condiciones, nueva])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-active={n > 0 || undefined}
          className={cn("h-8 flex-none gap-1.5 text-sm", n > 0 && "border-foreground/30 bg-muted/60")}
        >
          <SlidersHorizontalIcon />
          <span>Filtros</span>
          {n > 0 && <span className="rounded-sm bg-foreground px-1.5 text-xs font-medium text-background tabular-nums">{n}</span>}
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,44rem)] p-0">
        <div className="flex items-center gap-2 border-b px-3 py-2 text-xs text-muted-foreground">
          <ListFilterIcon className="size-3.5" />
          {n === 0 ? (
            <span>Sin filtros. Añade una condición para acotar la lista.</span>
          ) : (
            <span className="flex items-center gap-1.5">
              Mostrar {objeto} que cumplen
              <Select value={value.union} onValueChange={(u) => onChange({ ...value, union: u as "y" | "o" })}>
                <SelectTrigger size="sm" className="h-6 w-auto gap-1 px-1.5 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="y">todas las condiciones</SelectItem>
                  <SelectItem value="o">alguna condición</SelectItem>
                </SelectContent>
              </Select>
            </span>
          )}
        </div>

        {n > 0 && (
          <div className="flex max-h-[50vh] flex-col gap-1.5 overflow-y-auto p-3">
            {condiciones.map((c, i) => (
              <FilaCondicion
                key={`${i}-${c.campo}-${c.op}`}
                union={value.union}
                indice={i}
                condicion={c}
                campos={campos}
                onChange={(cambio) => editar(i, cambio)}
                onRemove={() => quitar(i)}
                onCrearCampo={onCrearCampo}
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1 border-t px-2 py-2">
          <Button variant="ghost" size="sm" onClick={anadir} disabled={campos.length === 0}>
            <PlusIcon /> Añadir condición
          </Button>
          {onGuardarRapido && n > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onGuardarRapido(value)}>
              <StarIcon /> Guardar como rápido
            </Button>
          )}
          {n > 0 && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => set([])}>
              <Trash2Icon /> Quitar todos
            </Button>
          )}
          {onEditarRapidos && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground"
              onClick={() => {
                setOpen(false)
                onEditarRapidos()
              }}
            >
              <SettingsIcon /> Filtros rápidos
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** La condición que se añade al pulsar «Añadir condición»: el primer campo con su operador por defecto. */
export function condicionNueva<T>(campos: CampoFiltrable<T>[]): Condicion | null {
  const campo = campos[0]
  return campo ? { campo: campo.id, op: operadorPorDefecto(campo.tipo) } : null
}

/** Una condición editable: campo, operador y valor. La usan el constructor y la edición de un filtro rápido. */
export function FilaCondicion<T>({
  union,
  indice,
  condicion,
  campos,
  onChange,
  onRemove,
  onCrearCampo,
}: {
  union: "y" | "o"
  indice: number
  condicion: Condicion
  campos: CampoFiltrable<T>[]
  onChange: (cambio: Partial<Condicion>) => void
  onRemove: () => void
  onCrearCampo?: () => void
}) {
  const campo = campos.find((f) => f.id === condicion.campo)
  const ops = campo ? operadoresDe(campo.tipo) : []
  const def = campo ? defOperador(campo.tipo, condicion.op) : undefined

  // Al cambiar de campo el operador puede no existir para el tipo nuevo: se reinicia.
  const cambiarCampo = (id: string) => {
    const nuevo = campos.find((f) => f.id === id)
    if (!nuevo) return
    const sigueValiendo = defOperador(nuevo.tipo, condicion.op)
    onChange({ campo: id, op: sigueValiendo ? condicion.op : operadorPorDefecto(nuevo.tipo), valor: undefined })
  }
  const cambiarOp = (op: string) => {
    const nuevo = campo ? defOperador(campo.tipo, op as Condicion["op"]) : undefined
    onChange({ op: op as Condicion["op"], valor: nuevo?.sinValor ? undefined : condicion.valor })
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-12 flex-none text-xs text-muted-foreground">
        {indice === 0 ? "Donde" : union === "y" ? "Y" : "O"}
      </span>
      <SelectorCampo campos={campos} value={condicion.campo} onChange={cambiarCampo} onCrearCampo={onCrearCampo} />
      <Select value={condicion.op} onValueChange={cambiarOp}>
        <SelectTrigger size="sm" className="h-8 w-44 flex-none text-xs"><SelectValue /></SelectTrigger>
        <SelectContent>
          {ops.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="min-w-40 flex-1">
        {def?.sinValor ? (
          <span className="block px-1 text-xs text-muted-foreground">Sin valor</span>
        ) : (
          <ValorCondicion campo={campo} multiple={def?.multiple} valor={condicion.valor} onChange={(valor) => onChange({ valor })} />
        )}
      </div>
      <Button variant="ghost" size="icon-sm" aria-label="Quitar condición" className="flex-none text-muted-foreground" onClick={onRemove}>
        <XIcon />
      </Button>
    </div>
  )
}

function SelectorCampo<T>({
  campos,
  value,
  onChange,
  onCrearCampo,
}: {
  campos: CampoFiltrable<T>[]
  value: string
  onChange: (id: string) => void
  onCrearCampo?: () => void
}) {
  const [open, setOpen] = React.useState(false)
  const actual = campos.find((f) => f.id === value)
  const grupos = agruparCampos(campos)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" role="combobox" aria-expanded={open} className="h-8 w-40 flex-none justify-between gap-1 px-2 text-xs font-normal">
          <span className="truncate">{actual?.label ?? "Elegir campo"}</span>
          <ChevronDownIcon className="size-3.5 flex-none text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Buscar campo…" />
          <CommandList>
            <CommandEmpty>Ningún campo coincide</CommandEmpty>
            {grupos.map(([grupo, items]) => (
              <CommandGroup key={grupo} heading={grupo}>
                {items.map((f) => (
                  <CommandItem
                    key={f.id}
                    value={`${f.label} ${grupo}`}
                    onSelect={() => {
                      onChange(f.id)
                      setOpen(false)
                    }}
                  >
                    <span className="flex-1 truncate">{f.label}</span>
                    {f.id === value && <CheckIcon className="size-3.5" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
            {onCrearCampo && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="crear campo nuevo"
                    onSelect={() => {
                      setOpen(false)
                      onCrearCampo()
                    }}
                  >
                    <PlusIcon className="size-3.5" /> Crear campo nuevo
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Entrada del valor según el tipo del campo. El texto y los números se escriben en local y se
 * aplican a los 350 ms: si no, cada tecla lanzaría una recarga del listado.
 */
function ValorCondicion<T>({
  campo,
  multiple,
  valor,
  onChange,
}: {
  campo: CampoFiltrable<T> | undefined
  multiple?: boolean
  valor: string | string[] | undefined
  onChange: (v: string | string[] | undefined) => void
}) {
  const inicial = Array.isArray(valor) ? "" : (valor ?? "")
  const [texto, setTexto] = React.useState(inicial)
  const comprometido = React.useRef(inicial)
  React.useEffect(() => {
    if (texto === comprometido.current) return
    const t = setTimeout(() => {
      comprometido.current = texto
      onChange(texto === "" ? undefined : texto)
    }, 350)
    return () => clearTimeout(t)
  }, [texto, onChange])

  if (!campo) return null

  if (multiple) {
    return (
      <MultiSelect
        options={campo.opciones ?? []}
        value={Array.isArray(valor) ? valor : valor ? [valor] : []}
        onChange={(v) => onChange(v.length ? v : undefined)}
        placeholder="Elegir…"
        emptyText="Sin opciones"
        className="min-h-8 py-1 text-xs"
      />
    )
  }
  if (campo.tipo === "fecha") {
    return <Input type="date" className="h-8 text-xs" value={typeof valor === "string" ? valor : ""} onChange={(e) => onChange(e.target.value || undefined)} />
  }
  if (campo.tipo === "numero") {
    return <Input type="number" inputMode="decimal" placeholder="Valor" className="h-8 text-xs" value={texto} onChange={(e) => setTexto(e.target.value)} />
  }
  return <Input placeholder="Valor" className="h-8 text-xs" value={texto} onChange={(e) => setTexto(e.target.value)} />
}

export function agruparCampos<T>(campos: CampoFiltrable<T>[]): Array<[string, CampoFiltrable<T>[]]> {
  const mapa = new Map<string, CampoFiltrable<T>[]>()
  for (const c of campos) {
    const g = c.grupo ?? "Campos"
    const lista = mapa.get(g)
    if (lista) lista.push(c)
    else mapa.set(g, [c])
  }
  return [...mapa.entries()]
}

/** Chips de las condiciones activas, para `ActiveFilters`. */
export function chipsDeGrupo<T>(
  grupo: GrupoCondiciones,
  campos: CampoFiltrable<T>[],
  onChange: (next: GrupoCondiciones) => void,
): { label: string; onRemove: () => void }[] {
  return grupo.condiciones.map((c, i) => ({
    label: describirCondicion(c, campos),
    onRemove: () => onChange({ ...grupo, condiciones: grupo.condiciones.filter((_, j) => j !== i) }),
  }))
}
