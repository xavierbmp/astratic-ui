"use client"

import * as React from "react"
import { ChevronDownIcon, StarIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FilterMenu, FilterMenuButton, filterSummary } from "@/components/app/toolbar"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cumpleCondicion, describirCondicion, type CampoFiltrable, type Condicion, type GrupoCondiciones } from "@/lib/filtros/core"

/**
 * Filtros rápidos: los atajos de un clic que hay junto al buscador.
 *
 * Hay dos clases:
 *  - «campo»: un desplegable con las opciones de un campo de lista (Relación, Línea, Etiqueta…),
 *    como los de siempre.
 *  - «guardado»: una condición concreta que el usuario guarda con nombre («Sin contactos»,
 *    «Clientes sin responsable») y que se enciende y apaga con un botón.
 *
 * Los dos escriben en el mismo grupo de condiciones que el constructor de filtros, así que lo
 * activo siempre se ve junto en los chips y se puede afinar desde «Filtros».
 */
export type FiltroRapido =
  | { id: string; clase: "campo"; campo: string; label?: string }
  | { id: string; clase: "guardado"; label: string; union: "y" | "o"; condiciones: Condicion[] }

// `editados`: los rápidos que trae la página, cambiados por el usuario (nombre o condiciones).
type ConfigRapidos = { orden: string[]; ocultos: string[]; propios: FiltroRapido[]; editados?: Record<string, FiltroRapido> }

const VACIA: ConfigRapidos = { orden: [], ocultos: [], propios: [] }

/** Lista de rápidos de la página: los que trae el código más los que ha creado el usuario. */
export function useQuickFilters(pageKey: string, porDefecto: FiltroRapido[]) {
  const [config, setConfig] = useLocalStorage<ConfigRapidos>(`rapidos:${pageKey}`, VACIA)

  const todos = React.useMemo(() => {
    const propios = config.propios ?? []
    const juntos = [...porDefecto.map((r) => config.editados?.[r.id] ?? r), ...propios]
    const porId = new Map(juntos.map((r) => [r.id, r]))
    const vistos = new Set<string>()
    const out: FiltroRapido[] = []
    for (const id of config.orden ?? []) {
      const r = porId.get(id)
      if (r && !vistos.has(id)) {
        out.push(r)
        vistos.add(id)
      }
    }
    for (const r of juntos) if (!vistos.has(r.id)) out.push(r)
    return out
  }, [porDefecto, config.propios, config.orden, config.editados])

  const ocultos = React.useMemo(() => new Set(config.ocultos ?? []), [config.ocultos])
  const visibles = React.useMemo(() => todos.filter((r) => !ocultos.has(r.id)), [todos, ocultos])

  const alternar = React.useCallback(
    (id: string, mostrar: boolean) =>
      setConfig((p) => ({ ...p, ocultos: mostrar ? (p.ocultos ?? []).filter((x) => x !== id) : [...new Set([...(p.ocultos ?? []), id])] })),
    [setConfig],
  )
  const reordenar = React.useCallback((ids: string[]) => setConfig((p) => ({ ...p, orden: ids })), [setConfig])
  const anadir = React.useCallback(
    (r: FiltroRapido) => setConfig((p) => ({ ...p, propios: [...(p.propios ?? []), r], ocultos: (p.ocultos ?? []).filter((x) => x !== r.id) })),
    [setConfig],
  )
  const borrar = React.useCallback(
    (id: string) => setConfig((p) => ({ ...p, propios: (p.propios ?? []).filter((r) => r.id !== id), orden: (p.orden ?? []).filter((x) => x !== id) })),
    [setConfig],
  )
  // Uno propio se cambia en su sitio; uno de la página se guarda aparte, encima del original.
  const editar = React.useCallback(
    (r: FiltroRapido) =>
      setConfig((p) =>
        (p.propios ?? []).some((x) => x.id === r.id)
          ? { ...p, propios: (p.propios ?? []).map((x) => (x.id === r.id ? r : x)) }
          : { ...p, editados: { ...(p.editados ?? {}), [r.id]: r } },
      ),
    [setConfig],
  )
  const esPropio = React.useCallback((id: string) => (config.propios ?? []).some((r) => r.id === id), [config.propios])

  return { visibles, todos, ocultos, alternar, reordenar, anadir, editar, borrar, esPropio }
}

export type QuickFiltersApi = ReturnType<typeof useQuickFilters>

type RapidoCampoT = Extract<FiltroRapido, { clase: "campo" }>
type RapidoGuardadoT = Extract<FiltroRapido, { clase: "guardado" }>

// Hueco entre botones de la fila (gap-2). Lo usa la cuenta de cuántos rápidos caben.
const HUECO = 8

const useLayoutEffectCliente = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect

/**
 * La fila de filtros rápidos. Enseña los que caben en el sitio que deja la toolbar y recoge el
 * resto en un botón «+N» con flecha, que abre un menú con los mismos filtros y sus opciones. Así
 * ninguno queda tapado y «Filtros» (`trailing`), pegado detrás del último, siempre se ve.
 *
 * Para decidir cuántos caben, pinta una copia invisible de todos los botones y mide su ancho:
 * vuelve a contar al cambiar el ancho de la toolbar o el de un botón (al activarse un filtro, su
 * botón enseña la opción elegida y crece).
 */
export function QuickFilters<T>({
  api,
  campos,
  filas,
  value,
  onChange,
  trailing,
  className,
}: {
  api: QuickFiltersApi
  campos: CampoFiltrable<T>[]
  /** Filas que se están mostrando: sirven para los contadores de cada opción. */
  filas: T[]
  value: GrupoCondiciones
  onChange: (next: GrupoCondiciones) => void
  /** Lo que va pegado detrás del último rápido visible (el botón «Filtros»). Nunca se recoge. */
  trailing?: React.ReactNode
  className?: string
}) {
  // Un rápido de un campo que ya no existe (se borró el campo propio) no se enseña.
  const items = React.useMemo(
    () => api.visibles.filter((r) => r.clase === "guardado" || campos.some((c) => c.id === r.campo)),
    [api.visibles, campos],
  )
  const zona = React.useRef<HTMLDivElement>(null)
  const medidas = React.useRef<HTMLDivElement>(null)
  const cola = React.useRef<HTMLDivElement>(null)
  const [caben, setCaben] = React.useState(items.length)
  // Ancho mínimo de la fila: «+N» y «Filtros». Si ni eso cabe, la toolbar pasa las acciones a otra línea.
  const [minimo, setMinimo] = React.useState(0)

  useLayoutEffectCliente(() => {
    const z = zona.current
    const m = medidas.current
    if (!z || !m) return
    const contar = () => {
      const copias = Array.from(m.children) as HTMLElement[]
      const mas = copias.pop()
      const anchos = copias.map((el) => el.offsetWidth)
      const colaW = cola.current?.offsetWidth ?? 0
      const masW = mas?.offsetWidth ?? 0
      setMinimo(anchos.length ? masW + HUECO + colaW : colaW)
      const libre = z.clientWidth - colaW
      if (anchos.reduce((a, w) => a + w + HUECO, 0) <= libre) return setCaben(anchos.length)
      let usado = masW + HUECO
      let n = 0
      while (n < anchos.length && usado + anchos[n] + HUECO <= libre) usado += anchos[n++] + HUECO
      setCaben(n)
    }
    contar()
    const ro = new ResizeObserver(contar)
    ro.observe(z)
    ro.observe(m)
    if (cola.current) ro.observe(cola.current)
    return () => ro.disconnect()
  }, [items])

  const visibles = items.slice(0, caben)
  const recogidos = items.slice(caben)

  return (
    <div ref={zona} data-slot="quick-filters" style={{ minWidth: minimo }} className={cn("relative flex min-w-0 flex-1 items-center gap-2 overflow-hidden py-0.5", className)}>
      {visibles.map((r) =>
        r.clase === "campo" ? (
          <RapidoCampo key={r.id} rapido={r} campos={campos} filas={filas} value={value} onChange={onChange} />
        ) : (
          <RapidoGuardado key={r.id} rapido={r} campos={campos} value={value} onChange={onChange} />
        ),
      )}
      {recogidos.length > 0 && <MasRapidos rapidos={recogidos} campos={campos} filas={filas} value={value} onChange={onChange} />}
      {trailing && (
        <div ref={cola} className="flex flex-none items-center">
          {trailing}
        </div>
      )}
      {/* Copia invisible de todos los botones (y de un «+N») para medirlos sin enseñarlos. */}
      <div ref={medidas} aria-hidden inert className="pointer-events-none invisible absolute top-0 left-0 flex gap-2 whitespace-nowrap">
        {items.map((r) =>
          r.clase === "campo" ? (
            <FilterMenuButton key={r.id} tabIndex={-1} {...botonCampo(r, campos, value)} />
          ) : (
            <BotonGuardado key={r.id} tabIndex={-1} rapido={r} activo={value.condiciones.some((c) => c.de === r.id)} />
          ),
        )}
        <BotonMas n={items.length} activo={false} tabIndex={-1} />
      </div>
    </div>
  )
}

/** Condición que ha puesto un rápido de campo y los valores que tiene elegidos. */
function seleccionDe(rapido: RapidoCampoT, value: GrupoCondiciones): string[] {
  const actual = value.condiciones.find((c) => c.de === rapido.id)
  return Array.isArray(actual?.valor) ? actual.valor : actual?.valor ? [String(actual.valor)] : []
}

/** Etiqueta, resumen y estado del botón de un rápido de campo (sin los contadores, que cuestan). */
function botonCampo<T>(rapido: RapidoCampoT, campos: CampoFiltrable<T>[], value: GrupoCondiciones) {
  const campo = campos.find((f) => f.id === rapido.campo)
  const seleccion = seleccionDe(rapido, value)
  return { label: rapido.label ?? campo?.label ?? rapido.campo, summary: filterSummary(campo?.opciones ?? [], seleccion), active: seleccion.length > 0 }
}

/** Opciones de un rápido de campo con cuántas filas tiene cada una, y cómo escribir la selección. */
function useRapidoCampo<T>(rapido: RapidoCampoT, campos: CampoFiltrable<T>[], filas: T[], value: GrupoCondiciones, onChange: (next: GrupoCondiciones) => void) {
  const campo = campos.find((f) => f.id === rapido.campo)
  const opciones = React.useMemo(() => {
    if (!campo) return []
    return (campo.opciones ?? []).map((o) => ({
      value: o.value,
      label: o.label,
      count: filas.filter((r) => cumpleCondicion(r, { campo: campo.id, op: "alguno", valor: [o.value] }, campos)).length,
    }))
  }, [campo, campos, filas])
  const set = (valores: string[]) => {
    if (!campo) return
    const sin = value.condiciones.filter((c) => c.de !== rapido.id)
    onChange({ ...value, condiciones: valores.length ? [...sin, { campo: campo.id, op: "alguno", valor: valores, de: rapido.id }] : sin })
  }
  return { campo, opciones, seleccion: seleccionDe(rapido, value), set }
}

/** Enciende o apaga una condición guardada. */
function alternarGuardado(rapido: RapidoGuardadoT, value: GrupoCondiciones): GrupoCondiciones {
  const activo = value.condiciones.some((c) => c.de === rapido.id)
  return activo
    ? { ...value, condiciones: value.condiciones.filter((c) => c.de !== rapido.id) }
    : { ...value, condiciones: [...value.condiciones, ...rapido.condiciones.map((c) => ({ ...c, de: rapido.id }))] }
}

/** Desplegable de opciones de un campo de lista. Escribe una condición «es alguno de». */
function RapidoCampo<T>({
  rapido,
  campos,
  filas,
  value,
  onChange,
}: {
  rapido: RapidoCampoT
  campos: CampoFiltrable<T>[]
  filas: T[]
  value: GrupoCondiciones
  onChange: (next: GrupoCondiciones) => void
}) {
  const { campo, opciones, seleccion, set } = useRapidoCampo(rapido, campos, filas, value, onChange)
  if (!campo) return null
  return <FilterMenu label={rapido.label ?? campo.label} options={opciones} value={seleccion} onChange={set} />
}

function BotonGuardado({ rapido, activo, ...props }: React.ComponentProps<typeof Button> & { rapido: RapidoGuardadoT; activo: boolean }) {
  return (
    <Button
      variant="outline"
      size="sm"
      data-active={activo || undefined}
      className={cn("h-8 flex-none gap-1.5 text-sm", activo && "border-foreground/30 bg-muted/60")}
      {...props}
    >
      <StarIcon className={cn(activo && "fill-current")} />
      {rapido.label}
    </Button>
  )
}

/** Botón que enciende o apaga una condición guardada. */
function RapidoGuardado<T>({
  rapido,
  campos,
  value,
  onChange,
}: {
  rapido: RapidoGuardadoT
  campos: CampoFiltrable<T>[]
  value: GrupoCondiciones
  onChange: (next: GrupoCondiciones) => void
}) {
  const activo = value.condiciones.some((c) => c.de === rapido.id)
  const resumen = rapido.condiciones.map((c) => describirCondicion(c, campos)).join(rapido.union === "o" ? " o " : " y ")
  return <BotonGuardado rapido={rapido} activo={activo} title={resumen} onClick={() => onChange(alternarGuardado(rapido, value))} />
}

function BotonMas({ n, activo, ...props }: React.ComponentProps<typeof Button> & { n: number; activo: boolean }) {
  return (
    <Button
      variant="outline"
      size="sm"
      data-active={activo || undefined}
      className={cn("h-8 flex-none gap-1 px-2 text-sm tabular-nums", activo && "border-foreground/30 bg-muted/60")}
      {...props}
    >
      +{n}
      {activo && <span className="size-1.5 rounded-full bg-foreground" aria-hidden />}
      <ChevronDownIcon className="text-muted-foreground" />
    </Button>
  )
}

/** Los rápidos que no caben en la fila, en un menú: cada campo abre sus opciones al lado. */
function MasRapidos<T>({
  rapidos,
  campos,
  filas,
  value,
  onChange,
}: {
  rapidos: FiltroRapido[]
  campos: CampoFiltrable<T>[]
  filas: T[]
  value: GrupoCondiciones
  onChange: (next: GrupoCondiciones) => void
}) {
  const activos = rapidos.filter((r) => value.condiciones.some((c) => c.de === r.id)).length
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BotonMas
          n={rapidos.length}
          activo={activos > 0}
          aria-label={`${rapidos.length} filtros rápidos más${activos ? `, ${activos} activos` : ""}`}
          title={`${rapidos.length} filtros rápidos más`}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Más filtros rápidos</DropdownMenuLabel>
        {rapidos.map((r) =>
          r.clase === "campo" ? (
            <MenuRapidoCampo key={r.id} rapido={r} campos={campos} filas={filas} value={value} onChange={onChange} />
          ) : (
            <DropdownMenuCheckboxItem
              key={r.id}
              checked={value.condiciones.some((c) => c.de === r.id)}
              onCheckedChange={() => onChange(alternarGuardado(r, value))}
              onSelect={(e) => e.preventDefault()}
            >
              <StarIcon className="text-muted-foreground" />
              <span className="flex-1 whitespace-nowrap">{r.label}</span>
            </DropdownMenuCheckboxItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function MenuRapidoCampo<T>({
  rapido,
  campos,
  filas,
  value,
  onChange,
}: {
  rapido: RapidoCampoT
  campos: CampoFiltrable<T>[]
  filas: T[]
  value: GrupoCondiciones
  onChange: (next: GrupoCondiciones) => void
}) {
  const { campo, opciones, seleccion, set } = useRapidoCampo(rapido, campos, filas, value, onChange)
  if (!campo) return null
  const resumen = filterSummary(opciones, seleccion)
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <span className="flex-1 whitespace-nowrap">{rapido.label ?? campo.label}</span>
        {resumen && <span className="ml-2 max-w-28 truncate rounded-sm bg-foreground px-1.5 text-xs font-medium text-background">{resumen}</span>}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="min-w-52">
        {opciones.length === 0 && <DropdownMenuItem disabled>Sin opciones</DropdownMenuItem>}
        {opciones.map((o) => (
          <DropdownMenuCheckboxItem
            key={o.value}
            checked={seleccion.includes(o.value)}
            onCheckedChange={(c) => set(c ? [...seleccion, o.value] : seleccion.filter((v) => v !== o.value))}
            onSelect={(e) => e.preventDefault()}
          >
            <span className="flex-1">{o.label}</span>
            <span className="text-xs tabular-nums text-muted-foreground">{o.count}</span>
          </DropdownMenuCheckboxItem>
        ))}
        {seleccion.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => set([])} className="text-muted-foreground">
              <XIcon /> Quitar filtro
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
