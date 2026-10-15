"use client"

import * as React from "react"
import { UploadCloudIcon } from "lucide-react"
import { cn } from "cn"

/**
 * Zona para soltar o elegir archivos: toda subida de archivos del kit pasa por aquí (importar una
 * hoja, adjuntar imágenes, subir una versión o una factura). Se pulsa o se le suelta encima; quien la
 * usa sube los archivos (en un portal, directos a su almacenamiento con una URL firmada).
 */
export function ZonaSubida({
  onArchivos,
  accept,
  multiple = true,
  titulo = "Arrastra aquí los archivos o elígelos",
  ayuda,
  compacta,
  desactivada,
  className,
}: {
  onArchivos: (archivos: File[]) => void
  accept?: string
  multiple?: boolean
  titulo?: string
  ayuda?: string
  compacta?: boolean
  /** Mientras lee o cuando ya no caben más: ni se pulsa ni recibe. */
  desactivada?: boolean
  className?: string
}) {
  const entrada = React.useRef<HTMLInputElement>(null)
  const [encima, setEncima] = React.useState(false)
  const elegir = () => !desactivada && entrada.current?.click()
  return (
    <div
      data-slot="zona-subida"
      role="button"
      tabIndex={desactivada ? -1 : 0}
      aria-disabled={desactivada || undefined}
      onClick={elegir}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          elegir()
        }
      }}
      onDragOver={(e) => {
        if (desactivada) return
        e.preventDefault()
        setEncima(true)
      }}
      onDragLeave={() => setEncima(false)}
      onDrop={(e) => {
        setEncima(false)
        if (desactivada) return
        // Lo que se suelta aquí es de la zona: quien la contiene lo sabe por `isDefaultPrevented()`.
        e.preventDefault()
        const archivos = Array.from(e.dataTransfer.files)
        if (archivos.length) onArchivos(multiple ? archivos : archivos.slice(0, 1))
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-control text-center transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50",
        compacta ? "px-3 py-4" : "px-4 py-8",
        encima && "border-brand bg-brand-soft",
        desactivada && "pointer-events-none opacity-50",
        className,
      )}
    >
      <UploadCloudIcon className={cn("text-muted-foreground", compacta ? "size-5" : "size-7")} aria-hidden />
      <p className="text-sm font-medium">{titulo}</p>
      {ayuda && <p className="text-xs text-muted-foreground">{ayuda}</p>}
      <input
        ref={entrada}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={desactivada}
        className="hidden"
        aria-label={titulo}
        onChange={(e) => {
          const archivos = Array.from(e.target.files ?? [])
          if (archivos.length) onArchivos(archivos)
          e.target.value = ""
        }}
      />
    </div>
  )
}
