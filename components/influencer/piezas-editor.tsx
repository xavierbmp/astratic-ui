"use client"

import * as React from "react"
import { BanIcon, ClapperboardIcon, FileSignatureIcon, ImageIcon, ImagesIcon, MessageSquareTextIcon, PlusIcon, Trash2Icon, TypeIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { TIPOS_PIEZA, type FormatoPieza, type TipoCondicion, type TipoPieza } from "@/lib/influencer/modelo"
import { REDES_PIEZA, type PiezaPedidaForm } from "@/lib/influencer/formularios"
import { AJUSTES_COLLABS_DE_SERIE, cambiarFormatoDePieza, cambiarPublicacion, fechaGuionPorDefecto, piezaDeFormato } from "@/lib/influencer/ajustes-collabs"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SocialIcon, socialLabel } from "@/components/app/social-icons"
import { SelectorBuscable, type OpcionSelector } from "@/components/app/formulario/selector-buscable"
import { CampoFecha } from "@/components/app/formulario/campo-fecha"
import { IconosOpcion } from "@/components/app/formulario/opciones-visuales"
import { CondicionesEditor } from "@/components/influencer/condiciones-editor"

export const ICONOS_PIEZA: Record<TipoPieza, LucideIcon> = { video: ClapperboardIcon, foto: ImageIcon, carrusel: ImagesIcon, texto: TypeIcon }

const SIN_RED = "ninguna"

const OPCIONES_RED = [
  ...REDES_PIEZA.map((r) => ({ value: r, label: socialLabel[r], icono: <SocialIcon network={r} /> })),
  { value: SIN_RED, label: "Sin publicar (solo archivos)", icono: <BanIcon /> },
]

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
  onNuevaCondicion?: (nombre: string) => TipoCondicion
  className?: string
}

/**
 * Las piezas que se piden. Cada una nace de un formato (Reel, Story… o los suyos, como «Mención en la
 * bio») que le pone el tipo, la red, si pide guion y un nombre de serie con la campaña («Reel ·
 * Lanzamiento»), que se cambia al momento. Después, el día de publicación, dónde sale, el guion con
 * su fecha (de serie, `diasGuion` antes de publicar si da tiempo), sus condiciones e indicaciones.
 * Abajo, un atajo por formato añade otra de un clic. Lo usan el alta de una collab, «Nueva pieza» y
 * el formulario de la marca.
 */
export function PiezasEditor({ value, onChange, errores, formatos = AJUSTES_COLLABS_DE_SERIE.formatos, condiciones, hoy, campana = "", diasGuion = AJUSTES_COLLABS_DE_SERIE.diasGuion, onNuevoFormato, onEditarFormato, onNuevaCondicion, className }: Props) {
  const [abiertos, setAbiertos] = React.useState<Record<number, Set<"indicaciones" | "condiciones">>>({})
  const ctx = { campana, diasGuion, hoy }
  const cambiar = (i: number, pieza: PiezaPedidaForm) => onChange(value.map((p, j) => (j === i ? pieza : p)))
  const anadir = (formato: FormatoPieza) => onChange([...value, piezaDeFormato(formato, "", ctx)])
  const quitar = (i: number) => {
    onChange(value.filter((_, j) => j !== i))
    setAbiertos((a) => Object.fromEntries(Object.entries(a).flatMap(([k, v]) => (Number(k) === i ? [] : [[Number(k) > i ? Number(k) - 1 : Number(k), v]]))))
  }
  const abierto = (i: number, parte: "indicaciones" | "condiciones") => abiertos[i]?.has(parte) ?? false
  const alternar = (i: number, parte: "indicaciones" | "condiciones") =>
    setAbiertos((a) => {
      const s = new Set(a[i])
      if (s.has(parte)) s.delete(parte)
      else s.add(parte)
      return { ...a, [i]: s }
    })

  const opciones: OpcionSelector[] = formatos.map((f) => ({ value: f.id, label: f.nombre, detalle: f.red ? socialLabel[f.red] : TIPOS_PIEZA[f.tipo].label, icono: <IconoTipoPieza tipo={f.tipo} />, editable: !!onEditarFormato }))

  return (
    <div data-slot="ws-piezas-editor" className={cn("flex flex-col gap-2", className)}>
      {value.map((p, i) => {
        const formato = formatos.find((f) => f.id === p.formato)
        const conTexto = p.tipo === "texto"
        const verCondiciones = !!condiciones && (abierto(i, "condiciones") || !!p.condiciones?.length)
        const verIndicaciones = abierto(i, "indicaciones") || !!p.indicaciones
        return (
          <div key={i} className="rounded-xl border bg-card p-2.5">
            <div className="flex items-center gap-2">
              <SelectorBuscable
                tamano="sm"
                aria-label={`Formato de la pieza ${i + 1}`}
                opciones={opciones}
                valor={formato?.id}
                placeholder={TIPOS_PIEZA[p.tipo].label}
                onChange={(id) => {
                  const elegido = formatos.find((f) => f.id === id)
                  if (elegido) cambiar(i, cambiarFormatoDePieza(p, elegido, ctx))
                }}
                onCrear={onNuevoFormato && ((texto) => onNuevoFormato(texto, (nuevo) => cambiar(i, cambiarFormatoDePieza(p, nuevo, ctx))))}
                onEditar={onEditarFormato}
                className="w-36 flex-none sm:w-44"
              />
              <Input value={p.titulo} onChange={(e) => cambiar(i, { ...p, titulo: e.target.value, nombreManual: true })} placeholder={formato?.nombre ?? "Nombre de la pieza"} aria-label={`Nombre de la pieza ${i + 1}`} aria-invalid={!!errores?.[i]} className="h-8 min-w-0 flex-1" />
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar la pieza ${i + 1}`} onClick={() => quitar(i)}>
                <Trash2Icon />
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CampoFecha tamano="sm" valor={p.publicacion} onChange={(dia) => cambiar(i, cambiarPublicacion(p, dia, ctx))} hoy={hoy} placeholder="Día de publicación" aria-label={`Día de publicación de la pieza ${i + 1}`} />
              <IconosOpcion tamano="sm" aria-label={`Dónde se publica la pieza ${i + 1}`} opciones={OPCIONES_RED} valor={p.red ?? SIN_RED} onChange={(v) => cambiar(i, { ...p, red: REDES_PIEZA.find((r) => r === v) })} />
              {!conTexto && (
                <div className="flex items-center gap-1.5">
                  <label className="flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-input px-2 text-[13px] has-data-[state=checked]:border-brand has-data-[state=checked]:bg-brand-soft">
                    <Checkbox
                      checked={p.requiereGuion !== false}
                      onCheckedChange={(c) => cambiar(i, { ...p, requiereGuion: c === true, fechaGuion: c === true ? p.fechaGuion || fechaGuionPorDefecto(p.publicacion, diasGuion, hoy) : "" })}
                      aria-label={`La pieza ${i + 1} requiere guion`}
                    />
                    Guion
                  </label>
                  {p.requiereGuion !== false && <CampoFecha tamano="sm" valor={p.fechaGuion ?? ""} onChange={(dia) => cambiar(i, { ...p, fechaGuion: dia })} hoy={hoy} max={p.publicacion || undefined} placeholder="Día del guion" aria-label={`Día del guion de la pieza ${i + 1}`} />}
                </div>
              )}
              <div className="ml-auto flex items-center gap-1">
                {condiciones && (
                  <Button type="button" variant="ghost" size="sm" aria-pressed={verCondiciones} className={cn("text-muted-foreground", verCondiciones && "bg-muted text-foreground")} onClick={() => alternar(i, "condiciones")}>
                    <FileSignatureIcon /> Condiciones{p.condiciones?.length ? ` · ${p.condiciones.length}` : ""}
                  </Button>
                )}
                <Button type="button" variant="ghost" size="sm" aria-pressed={verIndicaciones} className={cn("text-muted-foreground", verIndicaciones && "bg-muted text-foreground")} onClick={() => alternar(i, "indicaciones")}>
                  <MessageSquareTextIcon /> Indicaciones
                </Button>
              </div>
            </div>
            {errores?.[i] && <p className="mt-1.5 text-xs text-danger">{errores[i]}</p>}
            {verCondiciones && condiciones && <CondicionesEditor tamano="sm" value={p.condiciones ?? []} onChange={(cs) => cambiar(i, { ...p, condiciones: cs })} tipos={condiciones} onNuevoTipo={onNuevaCondicion} className="mt-2" />}
            {verIndicaciones && <Textarea value={p.indicaciones} onChange={(e) => cambiar(i, { ...p, indicaciones: e.target.value })} rows={2} placeholder="Lo que debe tener esta pieza: duración, qué enseñar, texto en pantalla…" aria-label={`Indicaciones de la pieza ${i + 1}`} className="mt-2" />}
          </div>
        )
      })}

      <div className={cn("flex flex-wrap items-center gap-1.5", value.length === 0 && "rounded-xl border border-dashed p-3")}>
        <span className="mr-1 text-xs text-muted-foreground">{value.length ? "Añadir otra:" : "Elige el formato de la primera pieza:"}</span>
        {formatos.map((f) => (
          <button key={f.id} type="button" onClick={() => anadir(f)} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-input bg-card pr-2.5 pl-1 text-xs transition-colors hover:bg-muted">
            <IconoTipoPieza tipo={f.tipo} className="size-5 rounded-full" /> {f.nombre}
          </button>
        ))}
        {onNuevoFormato && (
          <button type="button" onClick={() => onNuevoFormato("", anadir)} className="inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-input px-2.5 text-xs text-brand transition-colors hover:bg-brand-soft">
            <PlusIcon className="size-3.5" /> Nuevo formato
          </button>
        )}
      </div>
    </div>
  )
}
