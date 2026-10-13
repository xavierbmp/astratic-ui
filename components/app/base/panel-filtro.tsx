"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, CircleHelpIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { NIVELES_GRUPO, contarCondiciones, defOperador, grupoVacio, operadorPorDefecto, operadoresDe, type Condicion, type GrupoCondiciones } from "@/lib/filtros/core"
import { ListaOrdenable } from "@/components/app/base/menu-comun"
import { SelectorCampo, type CampoMenu } from "@/components/app/base/selector-campo"
import { ValorFiltro } from "@/components/app/base/valor-filtro"

/** La condición que se añade: el primer campo con su primer operador, como en Airtable. */
export function condicionNueva(campos: CampoMenu[]): Condicion | null {
  const campo = campos[0]
  return campo ? { campo: campo.id, op: operadorPorDefecto(campo.tipo) } : null
}

/**
 * El editor de filtros de Airtable: «Donde» + campo + operador + valor, unidas con «y» u «o», y
 * grupos de condiciones dentro (hasta tres niveles). Cada cambio se aplica al momento. Es el mismo
 * en la base y en el botón «Filtros» del resto de páginas.
 */
export function PanelFiltro({
  campos,
  value,
  onChange,
  objeto = "registros",
  otrasVistas,
  pie,
}: {
  campos: CampoMenu[]
  value: GrupoCondiciones
  onChange: (next: GrupoCondiciones) => void
  /** Para «En esta vista, se muestran los contactos que…». */
  objeto?: string
  /** «Copiar desde otra vista»: las demás vistas y su filtro. */
  otrasVistas?: { id: string; nombre: string; filtro: GrupoCondiciones }[]
  /** Botones de más, a la derecha del pie (guardar como rápido…). */
  pie?: React.ReactNode
}) {
  const n = contarCondiciones(value)
  const anadir = () => {
    const nueva = condicionNueva(campos)
    if (nueva) onChange({ ...value, condiciones: [...value.condiciones, nueva] })
  }
  const anadirGrupo = () => onChange({ ...value, grupos: [...(value.grupos ?? []), { union: "y", condiciones: [] }] })

  return (
    <div className="flex max-h-[70vh] w-[min(94vw,720px)] flex-col text-[13px]">
      <div className="flex items-center gap-1 px-4 pt-3 text-muted-foreground">
        Filtro
        <Tooltip>
          <TooltipTrigger asChild>
            <CircleHelpIcon className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent className="max-w-64">Solo se ven los registros que cumplen las condiciones. Un grupo mezcla «y» con «o»: «(Lumea o Nuura) y sin email».</TooltipContent>
        </Tooltip>
      </div>
      <p className="px-4 pt-2 pb-1 text-muted-foreground">{n === 0 && !(value.grupos ?? []).length ? "No se aplican condiciones de filtrado" : `En esta vista, se muestran los ${objeto} que cumplen:`}</p>
      <div className="flex min-h-0 flex-col gap-2 overflow-y-auto px-4 py-2">
        <ItemsGrupo grupo={value} nivel={1} campos={campos} onChange={onChange} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pt-1 pb-3">
        <button type="button" className="inline-flex items-center gap-1 font-medium text-brand hover:underline disabled:opacity-50" onClick={anadir} disabled={!campos.length}>
          <PlusIcon className="size-3.5" /> Añadir condición
        </button>
        <button type="button" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" onClick={anadirGrupo}>
          <PlusIcon className="size-3.5" /> Añadir grupo de condiciones
        </button>
        <span className="ml-auto flex items-center gap-1">
          {pie}
          {otrasVistas && otrasVistas.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="text-muted-foreground hover:text-foreground">Copiar desde otra vista</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {otrasVistas.map((v) => (
                  <DropdownMenuItem key={v.id} onSelect={() => onChange(v.filtro)}>{v.nombre}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </span>
      </div>
    </div>
  )
}

/** «Donde», luego un desplegable «y / o» en la segunda y el mismo texto en las siguientes, como en Airtable. */
function Union({ indice, union, onChange }: { indice: number; union: "y" | "o"; onChange: (u: "y" | "o") => void }) {
  if (indice === 0) return <span className="w-14 flex-none pt-1.5 text-muted-foreground">Donde</span>
  if (indice > 1) return <span className="w-14 flex-none pt-1.5 pl-2 text-muted-foreground">{union}</span>
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex h-8 w-14 flex-none items-center justify-between rounded-md border px-2 hover:bg-muted">
          {union}
          <ChevronDownIcon className="size-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={() => onChange("y")}>y</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onChange("o")}>o</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ItemsGrupo({ grupo, nivel, campos, onChange }: { grupo: GrupoCondiciones; nivel: number; campos: CampoMenu[]; onChange: (next: GrupoCondiciones) => void }) {
  const grupos = grupo.grupos ?? []
  const setCondiciones = (condiciones: Condicion[]) => onChange({ ...grupo, condiciones })
  const setGrupos = (gs: GrupoCondiciones[]) => onChange({ ...grupo, grupos: gs })
  const setUnion = (union: "y" | "o") => onChange({ ...grupo, union })
  // Las condiciones no tienen id: se ordenan por su posición, que es lo que se arrastra.
  const conPosicion = grupo.condiciones.map((condicion, i) => ({ condicion, clave: `c${nivel}-${i}` }))

  return (
    <>
      <ListaOrdenable items={conPosicion} clave={(x) => x.clave} onReordenar={(xs) => setCondiciones(xs.map((x) => x.condicion))} className="flex flex-col gap-2">
        {({ condicion: c }, asa) => {
          const i = grupo.condiciones.indexOf(c)
          return (
            <FilaCondicion
              indice={i}
              union={grupo.union}
              onUnion={setUnion}
              condicion={c}
              campos={campos}
              onChange={(cambio) => setCondiciones(grupo.condiciones.map((x, j) => (j === i ? { ...x, ...cambio } : x)))}
              onQuitar={() => setCondiciones(grupo.condiciones.filter((_, j) => j !== i))}
              asa={asa}
            />
          )
        }}
      </ListaOrdenable>
      {grupos.map((g, i) => {
        const indice = grupo.condiciones.length + i
        const cambiar = (next: GrupoCondiciones) => setGrupos(grupos.map((x, j) => (j === i ? next : x)))
        return (
          <div key={`g${nivel}-${i}`} className="flex items-start gap-2">
            <Union indice={indice} union={grupo.union} onChange={setUnion} />
            <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-md border bg-muted/50 p-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="flex-1 pl-1">
                  {grupoVacio(g) ? "Añade condiciones a este grupo" : g.union === "o" ? "Cualquiera de los siguientes es verdadero…" : "Todos los siguientes son verdaderos…"}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-xs" aria-label="Añadir al grupo"><PlusIcon /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => {
                        const nueva = condicionNueva(campos)
                        if (nueva) cambiar({ ...g, condiciones: [...g.condiciones, nueva] })
                      }}
                    >
                      Añadir condición
                    </DropdownMenuItem>
                    {nivel + 1 < NIVELES_GRUPO && (
                      <DropdownMenuItem onSelect={() => cambiar({ ...g, grupos: [...(g.grupos ?? []), { union: "y", condiciones: [] }] })}>Añadir grupo de condiciones</DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon-xs" aria-label="Quitar el grupo" onClick={() => setGrupos(grupos.filter((_, j) => j !== i))}><Trash2Icon /></Button>
              </div>
              <ItemsGrupo grupo={g} nivel={nivel + 1} campos={campos} onChange={cambiar} />
            </div>
          </div>
        )
      })}
    </>
  )
}

/**
 * Una condición en una caja partida, como en Airtable: campo · operador · valor · papelera · asa.
 * La casilla no tiene operador: «es» y la casilla marcada o no.
 */
export function FilaCondicion({
  indice,
  union,
  onUnion,
  condicion,
  campos,
  onChange,
  onQuitar,
  asa,
  campoFijo,
}: {
  indice: number
  union: "y" | "o"
  onUnion: (u: "y" | "o") => void
  condicion: Condicion
  campos: CampoMenu[]
  onChange: (cambio: Partial<Condicion>) => void
  onQuitar: () => void
  asa?: React.ReactNode
  /** Sin elegir campo ni «y/o»: la condición de un solo campo (los colores de su cabecera). */
  campoFijo?: boolean
}) {
  const campo = campos.find((c) => c.id === condicion.campo)
  const def = campo ? defOperador(campo.tipo, condicion.op) : undefined

  const cambiarCampo = (id: string) => {
    const nuevo = campos.find((c) => c.id === id)
    if (!nuevo) return
    const mismoTipo = campo?.tipo === nuevo.tipo
    onChange({ campo: id, op: mismoTipo ? condicion.op : operadorPorDefecto(nuevo.tipo), valor: mismoTipo && nuevo.tipo !== "select" && nuevo.tipo !== "multiselect" ? condicion.valor : undefined })
  }

  return (
    <div className="flex items-start gap-2">
      {!campoFijo && <Union indice={indice} union={union} onChange={onUnion} />}
      <div className="flex min-w-0 flex-1 items-stretch divide-x rounded-md border bg-background">
        {!campoFijo && <SelectorCampo campos={campos} value={condicion.campo} onChange={cambiarCampo} className="rounded-none rounded-l-md border-0" />}
        {campo?.tipo === "booleano" ? (
          <span className="flex h-8 w-40 flex-none items-center px-2 text-muted-foreground">es</span>
        ) : (
          <SelectorOperador campo={campo} value={condicion.op} onChange={(op) => {
            const nuevo = campo ? defOperador(campo.tipo, op) : undefined
            const cambiaClase = !!nuevo?.sinValor || nuevo?.multiple !== def?.multiple || nuevo?.fecha !== def?.fecha
            onChange({ op, valor: cambiaClase ? undefined : condicion.valor })
          }} />
        )}
        {campo && def ? <ValorFiltro key={`${condicion.campo}-${condicion.op}`} campo={campo} def={def} condicion={condicion} onChange={onChange} /> : <span className="flex-1" />}
        <button type="button" aria-label="Quitar la condición" className="flex w-8 flex-none items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground" onClick={onQuitar}>
          <Trash2Icon className="size-3.5" />
        </button>
        {asa}
      </div>
    </div>
  )
}

function SelectorOperador({ campo, value, onChange }: { campo: CampoMenu | undefined; value: Condicion["op"]; onChange: (op: Condicion["op"]) => void }) {
  const [abierto, setAbierto] = React.useState(false)
  const ops = campo ? operadoresDe(campo.tipo) : []
  const actual = ops.find((o) => o.value === value)
  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <button type="button" className="flex h-8 w-40 flex-none items-center justify-between gap-1 px-2 text-left hover:bg-muted/60">
          <span className="truncate">{actual?.label ?? "Elige"}</span>
          <ChevronDownIcon className="size-3.5 flex-none text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <Command>
          <CommandInput placeholder="Encuentra un operador" autoFocus />
          <CommandList>
            <CommandEmpty>Ningún operador se llama así</CommandEmpty>
            <CommandGroup>
              {ops.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.label}
                  onSelect={() => {
                    onChange(o.value)
                    setAbierto(false)
                  }}
                >
                  <span className="flex-1">{o.label}</span>
                  {o.value === value && <CheckIcon className="size-3.5" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
