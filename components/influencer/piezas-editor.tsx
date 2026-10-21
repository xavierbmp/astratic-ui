"use client"

import * as React from "react"
import { BookmarkPlusIcon, ClapperboardIcon, ImageIcon, ImagesIcon, MessageSquareTextIcon, PackageIcon, PlusIcon, ScrollTextIcon, Trash2Icon, TypeIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { TIPOS_PIEZA, nombrePlataforma, type FormatoPieza, type PackContenido, type TipoCondicion, type TipoPieza } from "@/lib/influencer/modelo"
import type { PiezaPedidaForm } from "@/lib/influencer/formularios"
import { AJUSTES_COLLABS_DE_SERIE, cambiarFormatoDePieza, cambiarPublicacion, describirPack, formatosDePlataformas, piezaDeFormato, piezasDePack } from "@/lib/influencer/ajustes-collabs"
import { idNuevo } from "@/lib/influencer/tareas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { SelectorBuscable, type OpcionSelector } from "@/components/app/formulario/selector-buscable"
import { CampoFecha } from "@/components/app/formulario/campo-fecha"
import { CondicionesEditor } from "@/components/influencer/condiciones-editor"
import { IconoPlataforma } from "@/components/influencer/plataformas"

export const ICONOS_PIEZA: Record<TipoPieza, LucideIcon> = { video: ClapperboardIcon, foto: ImageIcon, carrusel: ImagesIcon, texto: TypeIcon }

/** El icono del tipo de una pieza en su recuadro, el mismo en el desplegable y en los atajos. */
export function IconoTipoPieza({ tipo, className }: { tipo: TipoPieza; className?: string }) {
  const Icono = ICONOS_PIEZA[tipo]
  return (
    <span className={cn("grid size-6 flex-none place-items-center rounded-md bg-muted text-muted-foreground", className)}>
      <Icono className="size-3.5" />
    </span>
  )
}

type Props = {
  value: PiezaPedidaForm[]
  onChange: (piezas: PiezaPedidaForm[]) => void
  errores?: (string | undefined)[]
  formatos?: FormatoPieza[]
  /** Las plataformas de la collab: los atajos son sus formatos (sin ninguna, los de las tres principales). */
  plataformas?: string[]
  /** Su lista de condiciones; sin ella, las piezas no llevan condiciones (el formulario de la marca). */
  condiciones?: TipoCondicion[]
  hoy: string
  /** El nombre de la campaña, para el nombre de serie de cada pieza («Reel · Lanzamiento»). */
  campana?: string
  /** Cuántos días antes de publicar va el guion, de serie. */
  diasGuion?: number
  /** Crear un formato que no está; `usar` lo pone donde se pidió (una pieza o una nueva) al crearlo. */
  onNuevoFormato?: (nombre: string, usar: (formato: FormatoPieza) => void) => void
  onEditarFormato?: (id: string) => void
  /** Crear una condición que no está; `usar` la pone en la pieza al crearla. */
  onNuevaCondicion?: (nombre: string, usar: (tipo: TipoCondicion) => void) => void
  /** Cada entregable lleva su importe (en el alta de una collab; la marca no lo ve). */
  conImporte?: boolean
  /** Con `conImporte`, lo que cobra por cada formato (por su id): el entregable nuevo nace con ese importe, que se cambia a mano. */
  precios?: Partial<Record<string, number>>
  /** Sus packs de contenido: cada uno añade varios entregables de un clic. */
  packs?: PackContenido[]
  /** Guardar los entregables que hay como un pack nuevo (sin ella, no se ofrece). */
  onGuardarPack?: (pack: PackContenido) => void
  className?: string
}

/**
 * Los entregables de una collab. Arriba, un atajo por cada formato de sus plataformas (y «Más
 * formatos»: todos, o uno nuevo escribiéndolo). Cada entregable es una tarjeta: el icono de su formato
 * a la izquierda (se pulsa para cambiarlo), su nombre de serie con la campaña («Reel · Otoño», se
 * cambia al momento), su importe si `conImporte` y, en la franja de abajo, el día de publicación, el
 * del script (de serie, `diasGuion` antes si da tiempo; «Sin script» en su calendario lo quita), sus
 * condiciones (icono y días, en línea) y sus indicaciones. Con `packs`, debajo de los atajos van sus packs de contenido
 * (varios entregables de un clic) y, con `onGuardarPack`, «Guardar como pack» los que hay. Lo usan el alta de una collab,
 * «Nueva pieza» y el formulario de la marca.
 */
export function PiezasEditor({ value, onChange, errores, formatos = AJUSTES_COLLABS_DE_SERIE.formatos, plataformas = [], condiciones, hoy, campana = "", diasGuion = AJUSTES_COLLABS_DE_SERIE.diasGuion, onNuevoFormato, onEditarFormato, onNuevaCondicion, conImporte, precios, packs = [], onGuardarPack, className }: Props) {
  const ctx = { campana, diasGuion, hoy }
  const cambiar = (i: number, pieza: PiezaPedidaForm) => onChange(value.map((p, j) => (j === i ? pieza : p)))
  /** El entregable recién añadido trae el precio de su formato, si ella lo tiene. */
  const conPrecio = (p: PiezaPedidaForm): PiezaPedidaForm => {
    const precio = conImporte && p.formato ? precios?.[p.formato] : undefined
    return precio ? { ...p, importe: String(precio) } : p
  }
  const anadir = (formato: FormatoPieza) => onChange([...value, conPrecio(piezaDeFormato(formato, "", ctx))])
  const atajos = formatosDePlataformas(formatos, plataformas)
  const opciones: OpcionSelector[] = formatos.map((f) => ({ value: f.id, label: f.nombre, detalle: f.plataforma ? nombrePlataforma(f.plataforma) : "Cualquier plataforma", icono: <IconoTipoPieza tipo={f.tipo} />, editable: !!onEditarFormato }))

  return (
    <div data-slot="ws-piezas-editor" className={cn("flex flex-col gap-2.5", className)}>
      <div className="-ml-1 flex flex-wrap items-center gap-x-0.5 gap-y-1">
        {atajos.map((f) => (
          <button key={f.id} type="button" onClick={() => anadir(f)} className="inline-flex h-8 items-center gap-1.5 rounded-md pr-2 pl-1 text-[13px] transition-colors hover:bg-muted">
            <IconoTipoPieza tipo={f.tipo} className="rounded-sm" /> {f.nombre}
          </button>
        ))}
        <SelectorBuscable
          aspecto="boton"
          aria-label="Más formatos"
          disparador={
            <span className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-[13px] font-medium text-brand hover:bg-brand-soft">
              <PlusIcon className="size-4" /> Más formatos
            </span>
          }
          opciones={opciones}
          valor={undefined}
          placeholder="Busca o escribe un formato"
          onChange={(id) => {
            const f = formatos.find((x) => x.id === id)
            if (f) anadir(f)
          }}
          onCrear={onNuevoFormato && ((texto) => onNuevoFormato(texto, anadir))}
          onEditar={onEditarFormato}
        />
      </div>

      {(packs.length > 0 || onGuardarPack) && (
        <div className="-ml-1 flex flex-wrap items-center gap-x-0.5 gap-y-1">
          {packs.map((pack) => (
            <button
              key={pack.id}
              type="button"
              title={describirPack(pack, formatos)}
              onClick={() => onChange([...value, ...piezasDePack(pack, formatos, "", ctx).map(conPrecio)])}
              className="inline-flex h-8 items-center gap-1.5 rounded-md pr-2 pl-1 text-[13px] transition-colors hover:bg-muted"
            >
              <span className="grid size-6 flex-none place-items-center rounded-sm bg-brand-soft text-brand">
                <PackageIcon className="size-3.5" />
              </span>
              {pack.nombre}
              <span className="text-xs text-muted-foreground tabular-nums">{pack.formatos.length}</span>
            </button>
          ))}
          {onGuardarPack && value.some((p) => p.formato) && <GuardarPack piezas={value} packs={packs} onGuardar={onGuardarPack} />}
        </div>
      )}

      {value.length === 0 && <p className="rounded-lg border border-dashed px-3 py-5 text-center text-sm text-muted-foreground">Elige un formato o un pack para añadir entregables.</p>}

      {value.map((p, i) => (
        <TarjetaEntregable
          key={p.clave ?? i}
          numero={i + 1}
          pieza={p}
          error={errores?.[i]}
          formatos={formatos}
          opciones={opciones}
          condiciones={condiciones}
          ctx={ctx}
          onCambiar={(pieza) => cambiar(i, pieza)}
          onQuitar={() => onChange(value.filter((_, j) => j !== i))}
          onNuevoFormato={onNuevoFormato}
          onEditarFormato={onEditarFormato}
          onNuevaCondicion={onNuevaCondicion}
          conImporte={conImporte}
        />
      ))}
    </div>
  )
}

/** «Guardar como pack»: los formatos de los entregables que hay, con el nombre que le dé. */
function GuardarPack({ piezas, packs, onGuardar }: { piezas: PiezaPedidaForm[]; packs: PackContenido[]; onGuardar: (pack: PackContenido) => void }) {
  const [abierto, setAbierto] = React.useState(false)
  const [nombre, setNombre] = React.useState("")
  const limpio = nombre.trim()
  const repetido = packs.some((p) => p.nombre.trim().toLocaleLowerCase("es") === limpio.toLocaleLowerCase("es"))
  const guardar = () => {
    if (!limpio || repetido) return
    onGuardar({ id: idNuevo("pk"), nombre: limpio.slice(0, 40), formatos: piezas.flatMap((p) => (p.formato ? [p.formato] : [])) })
    setNombre("")
    setAbierto(false)
  }
  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <button type="button" className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-[13px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
          <BookmarkPlusIcon className="size-4" /> Guardar como pack
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-2 p-3">
        <p className="text-sm font-medium">Nuevo pack con estos {piezas.length} entregables</p>
        <Input
          autoFocus
          value={nombre}
          maxLength={40}
          placeholder="Lanzamiento de producto"
          aria-label="Nombre del pack"
          aria-invalid={repetido}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              guardar()
            }
          }}
        />
        {repetido && <p className="text-xs text-danger">Ya tienes un pack que se llama así</p>}
        <Button type="button" size="sm" className="w-fit" disabled={!limpio || repetido} onClick={guardar}>
          Guardar pack
        </Button>
      </PopoverContent>
    </Popover>
  )
}

type PropsTarjeta = {
  numero: number
  pieza: PiezaPedidaForm
  error?: string
  formatos: FormatoPieza[]
  opciones: OpcionSelector[]
  condiciones?: TipoCondicion[]
  ctx: { campana: string; diasGuion: number; hoy: string }
  onCambiar: (pieza: PiezaPedidaForm) => void
  onQuitar: () => void
  onNuevoFormato?: Props["onNuevoFormato"]
  onEditarFormato?: (id: string) => void
  onNuevaCondicion?: Props["onNuevaCondicion"]
  conImporte?: boolean
}

/** Un entregable: el icono de su formato, su nombre y su importe arriba; su día, su guion, sus condiciones y sus indicaciones en la franja de abajo. */
function TarjetaEntregable({ numero, pieza: p, error, formatos, opciones, condiciones, ctx, onCambiar, onQuitar, onNuevoFormato, onEditarFormato, onNuevaCondicion, conImporte }: PropsTarjeta) {
  const [indicaciones, setIndicaciones] = React.useState(!!p.indicaciones)
  const formato = formatos.find((f) => f.id === p.formato)
  const Icono = ICONOS_PIEZA[p.tipo]
  const conGuion = p.tipo !== "texto"
  const plataforma = p.plataforma ?? formato?.plataforma

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center gap-3 p-3">
        <SelectorBuscable
          aspecto="boton"
          aria-label={`Formato del entregable ${numero}`}
          disparador={
            <span className="relative grid size-11 place-items-center rounded-lg bg-muted text-foreground transition-colors hover:bg-accent">
              <Icono className="size-5" />
              {plataforma && (
                <span className="absolute -right-1.5 -bottom-1.5 grid size-5 place-items-center rounded-full bg-card text-muted-foreground shadow-xs ring-2 ring-card">
                  <IconoPlataforma plataforma={plataforma} className="size-3" />
                </span>
              )}
            </span>
          }
          opciones={opciones}
          valor={formato?.id}
          placeholder="Busca o escribe un formato"
          onChange={(id) => {
            const elegido = formatos.find((f) => f.id === id)
            if (elegido) onCambiar(cambiarFormatoDePieza(p, elegido, ctx))
          }}
          onCrear={onNuevoFormato && ((texto) => onNuevoFormato(texto, (nuevo) => onCambiar(cambiarFormatoDePieza(p, nuevo, ctx))))}
          onEditar={onEditarFormato}
        />
        <div className="min-w-0 flex-1">
          <input
            value={p.titulo}
            onChange={(e) => onCambiar({ ...p, titulo: e.target.value, nombreManual: true })}
            placeholder={formato?.nombre ?? "Nombre del entregable"}
            aria-label={`Nombre del entregable ${numero}`}
            aria-invalid={!!error}
            className="-ml-1.5 w-full rounded-md bg-transparent px-1.5 py-0.5 text-[15px] font-medium outline-none placeholder:text-muted-foreground hover:bg-muted/60 focus:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
          />
          <p className="truncate text-xs text-muted-foreground">{[formato?.nombre ?? TIPOS_PIEZA[p.tipo].label, plataforma ? nombrePlataforma(plataforma) : "Sin plataforma", TIPOS_PIEZA[p.tipo].label].filter((x, j, xs) => xs.indexOf(x) === j).join(" · ")}</p>
        </div>
        {conImporte && (
          <label className="flex h-8 w-20 flex-none items-center gap-1 rounded-md border border-input px-2 text-[13px] text-muted-foreground transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 hover:bg-muted/50 sm:w-24">
            <input
              value={p.importe ?? ""}
              onChange={(e) => onCambiar({ ...p, importe: e.target.value.replace(/[^\d.,]/g, "") })}
              inputMode="decimal"
              placeholder="Importe"
              aria-label={`Importe del entregable ${numero}`}
              className="w-full min-w-0 bg-transparent text-right text-foreground tabular-nums outline-none placeholder:text-muted-foreground"
            />
            €
          </label>
        )}
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar el entregable ${numero}`} onClick={onQuitar} className="text-muted-foreground">
          <Trash2Icon />
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-0.5 border-t bg-muted/30 px-1.5 py-1">
        <CampoFecha aspecto="texto" prefijo="Publica el" valor={p.publicacion} onChange={(dia) => onCambiar(cambiarPublicacion(p, dia, ctx))} hoy={ctx.hoy} placeholder="¿Cuándo se publica?" aria-label={`Día de publicación del entregable ${numero}`} />
        {conGuion && (
          <CampoFecha
            aspecto="texto"
            icono={ScrollTextIcon}
            prefijo="Script el"
            valor={p.requiereGuion === false ? "" : (p.fechaGuion ?? "")}
            onChange={(dia) => onCambiar({ ...p, requiereGuion: true, fechaGuion: dia })}
            vaciar={p.requiereGuion === false ? undefined : { texto: "Sin script", onVaciar: () => onCambiar({ ...p, requiereGuion: false, fechaGuion: "" }) }}
            hoy={ctx.hoy}
            max={p.publicacion || undefined}
            placeholder={p.requiereGuion === false ? "Sin script" : "Script: ¿qué día?"}
            aria-label={`Día del script del entregable ${numero}`}
          />
        )}
        {/* Con base 0 no salta de línea por lo que ocupan las condiciones: si no caben, se desplazan. */}
        <span className="ml-auto flex min-w-40 flex-1 basis-0 items-center justify-end gap-1">
          {condiciones && <CondicionesEditor value={p.condiciones ?? []} onChange={(cs) => onCambiar({ ...p, condiciones: cs })} tipos={condiciones} onNuevoTipo={onNuevaCondicion} className="px-1" />}
          <Button type="button" variant="ghost" size="sm" aria-pressed={indicaciones} className={cn("flex-none text-muted-foreground", indicaciones && "bg-muted text-foreground")} onClick={() => setIndicaciones((x) => !x)}>
            <MessageSquareTextIcon /> Indicaciones
          </Button>
        </span>
      </div>

      {error && <p className="border-t px-3 py-1.5 text-xs text-danger">{error}</p>}
      {indicaciones && (
        <div className="border-t px-3 py-2.5">
          <Textarea autoFocus={!p.indicaciones} value={p.indicaciones} onChange={(e) => onCambiar({ ...p, indicaciones: e.target.value })} rows={2} placeholder="Duración, contenido, texto en pantalla…" aria-label={`Indicaciones del entregable ${numero}`} className="rounded-md" />
        </div>
      )}
    </div>
  )
}
