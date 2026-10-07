"use client"

import * as React from "react"
import { toast } from "sonner"
import { CopyIcon, TriangleAlertIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import type { Contenido } from "@/lib/influencer/modelo"
import { LIMITES_CAPTION, hashtagsDeTexto, previsualizacion, revisarCaption } from "@/lib/influencer/planificacion"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { SocialIcon, socialLabel } from "@/components/app/social-icons"

export type DatosCaption = Pick<Contenido, "caption" | "publicidad" | "redes">

/**
 * El texto de la publicación en un solo sitio, con los hashtags dentro, como se escribe en la red.
 * Debajo, lo que hace falta mientras se escribe: cuánto lleva y cuánto admite cada red, lo que se
 * ve antes del «más», los hashtags (Instagram, cinco), si es publicidad y lo que no pasaría.
 * «Copiar» lo deja listo para pegar.
 */
export function EditorCaption({ valor, onCambiar, className }: { valor: DatosCaption; onCambiar: (cambio: Partial<Pick<Contenido, "caption" | "publicidad">>) => void; className?: string }) {
  const id = React.useId()
  const texto = valor.caption.trim()
  const avisos = revisarCaption(valor)
  const redes = valor.redes.map((r) => r.red).filter((r) => LIMITES_CAPTION[r])
  const primera = redes[0]
  const vista = primera ? previsualizacion(valor, primera) : null
  const limiteHashtags = redes.map((r) => LIMITES_CAPTION[r]?.hashtags).find((n) => n !== undefined)
  const hashtags = hashtagsDeTexto(texto).length

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      toast.success("Caption copiado: pégalo en la red")
    } catch {
      toast.error("No se ha podido copiar: selecciona el texto y cópialo a mano")
    }
  }

  return (
    <div data-slot="ws-editor-caption" className={cn("grid gap-3", className)}>
      <Textarea id={id} value={valor.caption} onChange={(e) => onCambiar({ caption: e.target.value })} placeholder="Escribe el texto de la publicación, con sus hashtags. La primera línea es la que se ve." aria-label="Caption" className="min-h-40 resize-y text-sm leading-relaxed" />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {redes.map((r) => {
          const max = LIMITES_CAPTION[r]?.max ?? 0
          return (
            <span key={r} className={cn("inline-flex items-center gap-1 tabular-nums", texto.length > max && "font-medium text-danger")}>
              <SocialIcon network={r} className="size-3" /> {fmt.num(texto.length)} de {fmt.num(max)}
            </span>
          )
        })}
        {limiteHashtags !== undefined && (
          <span className={cn("tabular-nums", hashtags > limiteHashtags && "font-medium text-danger")}>
            {hashtags} de {limiteHashtags} hashtags en Instagram
          </span>
        )}
        <Button variant="outline" size="sm" className="ml-auto" onClick={copiar} disabled={!texto}>
          <CopyIcon /> Copiar
        </Button>
      </div>

      {vista && primera && texto && (
        <div className="grid gap-1 rounded-xl bg-background/70 p-3">
          <span className="text-xs text-muted-foreground">Así se ve en {socialLabel[primera]} antes de «más»</span>
          <p className="text-sm whitespace-pre-line">
            {vista.visible}
            {vista.cortado && <span className="text-muted-foreground">… más</span>}
          </p>
        </div>
      )}

      <label className="flex items-start gap-3 rounded-xl bg-background/70 p-3">
        <Switch checked={valor.publicidad} onCheckedChange={(v) => onCambiar({ publicidad: v })} className="mt-0.5" />
        <span className="grid gap-0.5">
          <span className="text-sm font-medium">Es publicidad</span>
          <span className="text-xs text-muted-foreground">Si el producto te lo han regalado o llevas enlace de afiliado, también hay que marcarlo con #publi o «publicidad».</span>
        </span>
      </label>

      {avisos.length > 0 && (
        <ul className="grid gap-1.5">
          {avisos.map((a) => (
            <li key={a.id} className="flex items-start gap-2 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
              <TriangleAlertIcon className="mt-px size-3.5 flex-none" /> {a.texto}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
