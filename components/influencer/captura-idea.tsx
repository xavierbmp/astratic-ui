"use client"

import * as React from "react"
import { FileTextIcon, ImageIcon, LightbulbIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

/**
 * Apuntar una idea en cinco segundos: se escribe o se pega un enlace (un reel, un TikTok) y Enter.
 * Con una captura, la idea nace con su imagen. `destino` dice a qué carpeta va a parar.
 */
export function CapturaIdea({
  onApuntar,
  onImagen,
  onNota,
  destino,
  className,
}: {
  onApuntar: (texto: string) => void
  /** Apuntar con una captura del móvil. */
  onImagen?: (archivo: File) => void
  /** Empezar una nota en blanco. */
  onNota?: () => void
  destino?: string
  className?: string
}) {
  const [texto, setTexto] = React.useState("")
  const campo = React.useRef<HTMLInputElement>(null)
  const archivo = React.useRef<HTMLInputElement>(null)

  const apuntar = () => {
    const limpio = texto.trim()
    if (!limpio) return campo.current?.focus()
    onApuntar(limpio)
    setTexto("")
  }

  return (
    <form
      data-slot="ws-captura-idea"
      onSubmit={(e) => {
        e.preventDefault()
        apuntar()
      }}
      className={cn("flex items-center gap-1.5 rounded-2xl bg-card py-1.5 pr-1.5 pl-3.5 shadow-card", className)}
    >
      <LightbulbIcon className="size-4 flex-none text-muted-foreground" aria-hidden />
      <input
        ref={campo}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Apunta una idea o pega un enlace de Instagram, TikTok o YouTube…"
        aria-label="Apuntar una idea"
        className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      {destino && <span className="hidden flex-none text-xs text-muted-foreground lg:inline">en {destino}</span>}
      {onImagen && (
        <>
          <input
            ref={archivo}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => {
              const elegido = e.target.files?.[0]
              if (elegido) onImagen(elegido)
              e.target.value = ""
            }}
          />
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Apuntar con una captura" title="Apuntar con una captura" onClick={() => archivo.current?.click()}>
            <ImageIcon />
          </Button>
        </>
      )}
      {onNota && (
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Nueva nota" title="Nueva nota" onClick={onNota}>
          <FileTextIcon />
        </Button>
      )}
      <Button type="submit" size="sm">
        Apuntar
      </Button>
    </form>
  )
}
