"use client"

import * as React from "react"
import { BanIcon, ClapperboardIcon, ImageIcon, ImagesIcon, MessageSquareTextIcon, PlusIcon, Trash2Icon, TypeIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { TIPOS_PIEZA, type FormatoPieza, type TipoPieza } from "@/lib/influencer/modelo"
import { REDES_PIEZA, type PiezaPedidaForm } from "@/lib/influencer/formularios"
import { FORMATOS_PIEZA_DE_SERIE, cambiarFormatoDePieza, piezaDeFormato } from "@/lib/influencer/formatos-pieza"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SocialIcon, socialLabel } from "@/components/app/social-icons"
import { SelectorBuscable, type OpcionSelector } from "@/components/app/formulario/selector-buscable"
import { CampoFecha } from "@/components/app/formulario/campo-fecha"
import { IconosOpcion } from "@/components/app/formulario/opciones-visuales"

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

/**
 * Las piezas que se piden. Cada una nace de un formato (Reel, Story, Carrusel… o los que se cree
 * ella, como «Mención en la bio»), que le pone el tipo, la red y un nombre que se cambia al momento;
 * después, el día de publicación, dónde sale y, si hace falta, unas indicaciones. Abajo, un atajo por
 * formato añade otra pieza de un clic. Con `onNuevoFormato`, ningún formato falta: se crea desde el
 * desplegable o desde los atajos, y `onEditarFormato` cambia uno. Lo usan el alta de una collab,
 * «Nueva pieza» y el formulario de la marca.
 */
export function PiezasEditor({
  value,
  onChange,
  errores,
  ventana,
  formatos = FORMATOS_PIEZA_DE_SERIE,
  hoy,
  onNuevoFormato,
  onEditarFormato,
  className,
}: {
  value: PiezaPedidaForm[]
  onChange: (piezas: PiezaPedidaForm[]) => void
  errores?: (string | undefined)[]
  ventana?: { desde?: string; hasta?: string }
  formatos?: FormatoPieza[]
  hoy?: string
  /** Crear un formato que no está; `usar` lo pone donde se pidió (una pieza o una nueva) al crearlo. */
  onNuevoFormato?: (nombre: string, usar: (formato: FormatoPieza) => void) => void
  onEditarFormato?: (id: string) => void
  className?: string
}) {
  const [conIndicaciones, setConIndicaciones] = React.useState<Set<number>>(() => new Set(value.flatMap((p, i) => (p.indicaciones ? [i] : []))))
  const cambiar = (i: number, pieza: PiezaPedidaForm) => onChange(value.map((p, j) => (j === i ? pieza : p)))
  const anadir = (formato: FormatoPieza) => onChange([...value, piezaDeFormato(formato, ventana?.hasta ?? "")])
  const quitar = (i: number) => {
    onChange(value.filter((_, j) => j !== i))
    setConIndicaciones((s) => new Set([...s].filter((j) => j !== i).map((j) => (j > i ? j - 1 : j))))
  }
  const alternarIndicaciones = (i: number) => setConIndicaciones((s) => new Set(s.has(i) ? [...s].filter((j) => j !== i) : [...s, i]))

  const opciones: OpcionSelector[] = formatos.map((f) => ({ value: f.id, label: f.nombre, detalle: f.red ? socialLabel[f.red] : TIPOS_PIEZA[f.tipo].label, icono: <IconoTipoPieza tipo={f.tipo} />, editable: !!onEditarFormato }))

  return (
    <div data-slot="ws-piezas-editor" className={cn("flex flex-col gap-2", className)}>
      {value.map((p, i) => {
        const formato = formatos.find((f) => f.id === p.formato)
        return (
          <div key={i} className="rounded-xl border bg-card p-2.5">
            <div className="flex items-center gap-2">
              <SelectorBuscable
                tamano="sm"
                aria-label={`Formato de la pieza ${i + 1}`}
                opciones={opciones}
                valor={formato?.id}
                placeholder={TIPOS_PIEZA[p.tipo].label}
                buscar="Busca un formato"
                onChange={(id) => {
                  const elegido = formatos.find((f) => f.id === id)
                  if (elegido) cambiar(i, cambiarFormatoDePieza(p, elegido, formato))
                }}
                crear={onNuevoFormato && { label: "Nuevo formato", onCrear: (texto) => onNuevoFormato(texto, (nuevo) => cambiar(i, cambiarFormatoDePieza(p, nuevo, formato))) }}
                onEditar={onEditarFormato}
                className="w-36 flex-none sm:w-44"
              />
              <Input value={p.titulo} onChange={(e) => cambiar(i, { ...p, titulo: e.target.value })} placeholder="Ponle nombre: «Reel de la rutina de noche»" aria-label={`Nombre de la pieza ${i + 1}`} aria-invalid={!!errores?.[i]} className="h-8 min-w-0 flex-1" />
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar la pieza ${i + 1}`} onClick={() => quitar(i)}>
                <Trash2Icon />
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <CampoFecha tamano="sm" valor={p.publicacion} onChange={(dia) => cambiar(i, { ...p, publicacion: dia })} hoy={hoy} min={ventana?.desde} max={ventana?.hasta} placeholder="Sin día todavía" aria-label={`Día de publicación de la pieza ${i + 1}`} />
              <IconosOpcion tamano="sm" aria-label={`Dónde se publica la pieza ${i + 1}`} opciones={OPCIONES_RED} valor={p.red ?? SIN_RED} onChange={(v) => cambiar(i, { ...p, red: REDES_PIEZA.find((r) => r === v) })} />
              <Button type="button" variant="ghost" size="sm" aria-pressed={conIndicaciones.has(i)} className={cn("ml-auto text-muted-foreground", conIndicaciones.has(i) && "bg-muted text-foreground")} onClick={() => alternarIndicaciones(i)}>
                <MessageSquareTextIcon /> Indicaciones
              </Button>
            </div>
            {errores?.[i] && <p className="mt-1.5 text-xs text-danger">{errores[i]}</p>}
            {conIndicaciones.has(i) && <Textarea value={p.indicaciones} onChange={(e) => cambiar(i, { ...p, indicaciones: e.target.value })} rows={2} placeholder="Lo que debe tener esta pieza: duración, qué enseñar, texto en pantalla…" aria-label={`Indicaciones de la pieza ${i + 1}`} className="mt-2" />}
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
