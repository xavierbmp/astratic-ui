"use client"

import * as React from "react"
import { BracesIcon, CheckIcon, ChevronDownIcon, ListFilterIcon, PlusIcon, SettingsIcon, SlidersHorizontalIcon, StarIcon, Trash2Icon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/app/multi-select"
import {
  NIVELES_GRUPO,
  contarCondiciones,
  defOperador,
  describirCondicion,
  describirGrupo,
  grupoVacio,
  operadorPorDefecto,
  operadoresDe,
  type CampoFiltrable,
  type Condicion,
  type GrupoCondiciones,
} from "@/lib/filtros/core"

/**
 * Constructor de filtros al estilo Airtable: campo + operador + valor, unidos con Y o con O.
 * Los operadores que se ofrecen salen del tipo del campo (texto, número, fecha, lista, sí/no).
 * Como en Notion, se pueden meter grupos dentro (hasta tres niveles) para mezclar Y con O:
 * «(Lumea o Nuura) y sin hacer».
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
  etiqueta = "Filtros",
  variant = "outline",
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
  /** El texto del botón: «Filtros» en la toolbar, «Filtro de la vista» en la cabecera de una vista. */
  etiqueta?: string
  /** `ghost` para ir junto a «Ordenar» y «Agrupar» en la cabecera de una vista. */
  variant?: "outline" | "ghost"
}) {
  const [open, setOpen] = React.useState(false)
  const n = contarCondiciones(value)
  const conGrupos = (value.grupos ?? []).length > 0

  const anadir = () => {
    const nueva = condicionNueva(campos)
    if (nueva) onChange({ ...value, condiciones: [...value.condiciones, nueva] })
  }
  const anadirGrupo = () => {
    const nueva = condicionNueva(campos)
    if (nueva) onChange({ ...value, grupos: [...(value.grupos ?? []), { union: value.union === "y" ? "o" : "y", condiciones: [nueva] }] })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          data-active={n > 0 || undefined}
          className={cn("h-8 flex-none gap-1.5 text-sm", n > 0 && variant === "outline" && "border-foreground/30 bg-muted/60", n > 0 && "text-foreground")}
        >
          <SlidersHorizontalIcon />
          <span>{etiqueta}</span>
          {n > 0 && <span className="rounded-sm bg-foreground px-1.5 text-xs font-medium text-background tabular-nums">{n}</span>}
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,46rem)] p-0">
        <div className="flex items-center gap-2 border-b px-3 py-2 text-xs text-muted-foreground">
          <ListFilterIcon className="size-3.5" />
          {n === 0 ? (
            <span>Sin filtros. Añade una condición para acotar la lista.</span>
          ) : (
            <span className="flex items-center gap-1.5">
              Mostrar {objeto} que cumplen
              <SelectorUnion value={value.union} onChange={(union) => onChange({ ...value, union })} />
            </span>
          )}
        </div>

        {n > 0 && (
          <div className="flex max-h-[55vh] flex-col gap-1.5 overflow-y-auto p-3">
            <ItemsGrupo grupo={value} nivel={1} campos={campos} onChange={onChange} onCrearCampo={onCrearCampo} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1 border-t px-2 py-2">
          <Button variant="ghost" size="sm" onClick={anadir} disabled={campos.length === 0}>
            <PlusIcon /> Añadir condición
          </Button>
          <Button variant="ghost" size="sm" onClick={anadirGrupo} disabled={campos.length === 0}>
            <BracesIcon /> Añadir grupo
          </Button>
          {/* Un rápido guarda una lista plana de condiciones: con grupos dentro no se puede. */}
          {onGuardarRapido && n > 0 && !conGrupos && (
            <Button variant="ghost" size="sm" onClick={() => onGuardarRapido(value)}>
              <StarIcon /> Guardar como rápido
            </Button>
          )}
          {n > 0 && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onChange({ union: value.union, condiciones: [] })}>
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

function SelectorUnion({ value, onChange }: { value: "y" | "o"; onChange: (u: "y" | "o") => void }) {
  return (
    <Select value={value} onValueChange={(u) => onChange(u === "o" ? "o" : "y")}>
      <SelectTrigger size="sm" className="h-6 w-auto gap-1 px-1.5 text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="y">todas las condiciones</SelectItem>
        <SelectItem value="o">alguna condición</SelectItem>
      </SelectContent>
    </Select>
  )
}

/**
 * Las condiciones y los grupos de un grupo, en filas: «Donde», y luego «Y» u «O». Cada grupo de
 * dentro va en su caja, con su propia Y u O y sus botones para añadir.
 */
function ItemsGrupo<T>({
  grupo,
  nivel,
  campos,
  onChange,
  onCrearCampo,
}: {
  grupo: GrupoCondiciones
  nivel: number
  campos: CampoFiltrable<T>[]
  onChange: (next: GrupoCondiciones) => void
  onCrearCampo?: () => void
}) {
  const grupos = grupo.grupos ?? []
  const setCondiciones = (condiciones: Condicion[]) => onChange({ ...grupo, condiciones })
  // Un grupo que se queda sin condiciones desaparece: una caja vacía no filtra nada.
  const setGrupos = (gs: GrupoCondiciones[]) => onChange({ ...grupo, grupos: gs.filter((g) => !grupoVacio(g)) })
  const prefijo = (i: number) => (i === 0 ? "Donde" : grupo.union === "y" ? "Y" : "O")
  return (
    <>
      {grupo.condiciones.map((c, i) => (
        <FilaCondicion
          key={`c-${i}-${c.campo}-${c.op}`}
          union={grupo.union}
          indice={i}
          condicion={c}
          campos={campos}
          onChange={(cambio) => setCondiciones(grupo.condiciones.map((x, j) => (j === i ? { ...x, ...cambio } : x)))}
          onRemove={() => setCondiciones(grupo.condiciones.filter((_, j) => j !== i))}
          onCrearCampo={onCrearCampo}
        />
      ))}
      {grupos.map((g, i) => (
        <div key={`g-${i}`} className="flex items-start gap-1.5">
          <span className="w-12 flex-none pt-2 text-xs text-muted-foreground">{prefijo(grupo.condiciones.length + i)}</span>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-lg border bg-muted/30 p-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Cumplen
              <SelectorUnion value={g.union} onChange={(union) => setGrupos(grupos.map((x, j) => (j === i ? { ...x, union } : x)))} />
              <Button variant="ghost" size="icon-sm" aria-label="Quitar grupo" className="ml-auto text-muted-foreground" onClick={() => setGrupos(grupos.filter((_, j) => j !== i))}>
                <XIcon />
              </Button>
            </div>
            <ItemsGrupo grupo={g} nivel={nivel + 1} campos={campos} onChange={(next) => setGrupos(grupos.map((x, j) => (j === i ? next : x)))} onCrearCampo={onCrearCampo} />
            <div className="flex flex-wrap gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  const nueva = condicionNueva(campos)
                  if (nueva) setGrupos(grupos.map((x, j) => (j === i ? { ...x, condiciones: [...x.condiciones, nueva] } : x)))
                }}
              >
                <PlusIcon /> Condición
              </Button>
              {nivel + 1 < NIVELES_GRUPO && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    const nueva = condicionNueva(campos)
                    if (nueva) setGrupos(grupos.map((x, j) => (j === i ? { ...x, grupos: [...(x.grupos ?? []), { union: x.union === "y" ? "o" : "y", condiciones: [nueva] }] } : x)))
                  }}
                >
                  <BracesIcon /> Grupo
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
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
          <ValorCondicion campo={campo} multiple={def?.multiple} numerico={def?.numerico} sufijo={def?.sufijo} valor={condicion.valor} onChange={(valor) => onChange({ valor })} />
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
  numerico,
  sufijo,
  valor,
  onChange,
}: {
  campo: CampoFiltrable<T> | undefined
  multiple?: boolean
  /** El operador pide un número de días, no un valor del campo. */
  numerico?: boolean
  sufijo?: string
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

  if (numerico) {
    return (
      <span className="flex items-center gap-1.5">
        <Input type="number" inputMode="numeric" min={0} placeholder="7" className="h-8 w-20 text-xs" value={texto} onChange={(e) => setTexto(e.target.value)} />
        {sufijo && <span className="text-xs text-muted-foreground">{sufijo}</span>}
      </span>
    )
  }
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

/** Chips de las condiciones activas, para `ActiveFilters`. Cada grupo de dentro va en un chip entero. */
export function chipsDeGrupo<T>(
  grupo: GrupoCondiciones,
  campos: CampoFiltrable<T>[],
  onChange: (next: GrupoCondiciones) => void,
): { label: string; onRemove: () => void }[] {
  const grupos = grupo.grupos ?? []
  return [
    ...grupo.condiciones.map((c, i) => ({
      label: describirCondicion(c, campos),
      onRemove: () => onChange({ ...grupo, condiciones: grupo.condiciones.filter((_, j) => j !== i) }),
    })),
    ...grupos
      .map((g, i) => ({ g, i }))
      .filter(({ g }) => !grupoVacio(g))
      .map(({ g, i }) => ({
        label: describirGrupo(g, campos),
        onRemove: () => onChange({ ...grupo, grupos: grupos.filter((_, j) => j !== i) }),
      })),
  ]
}
