"use client"

import * as React from "react"
import { ClapperboardIcon, ImageIcon, ImagesIcon, MessageSquareTextIcon, PlusIcon, Trash2Icon, TypeIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { LISTA_TIPOS_PIEZA, TIPOS_PIEZA, type TipoPieza } from "@/lib/influencer/modelo"
import { PIEZA_VACIA, REDES_PIEZA, type PiezaPedidaForm } from "@/lib/influencer/formularios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SocialIcon, socialLabel, type SocialNetwork } from "@/components/app/social-icons"

export const ICONOS_PIEZA: Record<TipoPieza, LucideIcon> = { video: ClapperboardIcon, foto: ImageIcon, carrusel: ImagesIcon, texto: TypeIcon }

const SIN_RED = "ninguna"

/**
 * Las piezas que se piden, sin formatos cerrados: «Añadir pieza», su tipo (vídeo, foto, carrusel o
 * texto), un nombre libre («Reel de la rutina»), la fecha si se sabe, dónde se publica y, si hace
 * falta, unas indicaciones. Lo usan el formulario de la marca y el alta de una collab.
 */
export function PiezasEditor({ value, onChange, errores, ventana, className }: { value: PiezaPedidaForm[]; onChange: (piezas: PiezaPedidaForm[]) => void; errores?: (string | undefined)[]; ventana?: { desde?: string; hasta?: string }; className?: string }) {
  const [conIndicaciones, setConIndicaciones] = React.useState<Set<number>>(() => new Set(value.flatMap((p, i) => (p.indicaciones ? [i] : []))))
  const cambiar = (i: number, cambios: Partial<PiezaPedidaForm>) => onChange(value.map((p, j) => (j === i ? { ...p, ...cambios } : p)))
  const quitar = (i: number) => {
    onChange(value.filter((_, j) => j !== i))
    setConIndicaciones((s) => new Set([...s].filter((j) => j !== i).map((j) => (j > i ? j - 1 : j))))
  }

  return (
    <div data-slot="ws-piezas-editor" className={cn("flex flex-col gap-2", className)}>
      {value.map((p, i) => {
        const Icono = ICONOS_PIEZA[p.tipo]
        return (
          <div key={i} className="rounded-xl border bg-card p-2.5">
            <div className="grid gap-2 sm:grid-cols-[140px_minmax(0,1fr)_auto] sm:items-center">
              <Select value={p.tipo} onValueChange={(v) => cambiar(i, { tipo: LISTA_TIPOS_PIEZA.find((t) => t === v) ?? p.tipo })}>
                <SelectTrigger aria-label={`Tipo de la pieza ${i + 1}`} className="w-full">
                  <span className="flex items-center gap-2">
                    <Icono className="size-4 text-muted-foreground" />
                    <SelectValue />
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {LISTA_TIPOS_PIEZA.map((t) => (
                    <SelectItem key={t} value={t}>
                      {TIPOS_PIEZA[t].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input value={p.titulo} onChange={(e) => cambiar(i, { titulo: e.target.value })} placeholder={p.tipo === "video" ? "Reel de la rutina de noche" : p.tipo === "carrusel" ? "Carrusel con tres looks" : p.tipo === "foto" ? "Foto del producto" : "Texto para la newsletter"} aria-label={`Nombre de la pieza ${i + 1}`} aria-invalid={!!errores?.[i]} />
              <div className="flex items-center gap-1 justify-self-end">
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Añadir indicaciones" aria-pressed={conIndicaciones.has(i)} className={cn(conIndicaciones.has(i) && "bg-muted")} onClick={() => setConIndicaciones((s) => new Set(s.has(i) ? [...s].filter((j) => j !== i) : [...s, i]))}>
                  <MessageSquareTextIcon />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar la pieza ${i + 1}`} disabled={value.length === 1} onClick={() => quitar(i)}>
                  <Trash2Icon />
                </Button>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:ml-[148px]">
              <Input type="date" value={p.publicacion} min={ventana?.desde} max={ventana?.hasta} onChange={(e) => cambiar(i, { publicacion: e.target.value })} aria-label={`Fecha de publicación de la pieza ${i + 1}`} />
              <Select value={p.red ?? SIN_RED} onValueChange={(v) => cambiar(i, { red: REDES_PIEZA.find((r) => r === v) })}>
                <SelectTrigger aria-label={`Red de la pieza ${i + 1}`} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REDES_PIEZA.map((r: SocialNetwork) => (
                    <SelectItem key={r} value={r}>
                      <SocialIcon network={r} className="size-3.5" /> {socialLabel[r]}
                    </SelectItem>
                  ))}
                  <SelectItem value={SIN_RED}>Sin publicar (solo archivos)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errores?.[i] && <p className="mt-1.5 text-xs text-danger">{errores[i]}</p>}
            {conIndicaciones.has(i) && <Textarea value={p.indicaciones} onChange={(e) => cambiar(i, { indicaciones: e.target.value })} rows={2} placeholder="Lo que debe tener esta pieza: duración, qué enseñar, texto en pantalla…" aria-label={`Indicaciones de la pieza ${i + 1}`} className="mt-2" />}
          </div>
        )
      })}
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => onChange([...value, { ...PIEZA_VACIA, publicacion: ventana?.hasta ?? "" }])}>
        <PlusIcon /> Añadir pieza
      </Button>
    </div>
  )
}
