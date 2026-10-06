"use client"

import * as React from "react"
import { UploadCloudIcon } from "lucide-react"
import { cn } from "cn"

/**
 * Zona para soltar o elegir archivos. En el portal, cada archivo sube directo a R2 con una URL
 * firmada y por partes (aguanta cortes); aquí se queda en el navegador.
 */
export function ZonaSubida({ onArchivos, accept, multiple = true, titulo = "Arrastra aquí los archivos o elígelos", ayuda, compacta, className }: { onArchivos: (archivos: File[]) => void; accept?: string; multiple?: boolean; titulo?: string; ayuda?: string; compacta?: boolean; className?: string }) {
  const entrada = React.useRef<HTMLInputElement>(null)
  const [encima, setEncima] = React.useState(false)
  return (
    <div
      data-slot="ws-zona-subida"
      role="button"
      tabIndex={0}
      onClick={() => entrada.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          entrada.current?.click()
        }
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setEncima(true)
      }}
      onDragLeave={() => setEncima(false)}
      onDrop={(e) => {
        e.preventDefault()
        setEncima(false)
        const archivos = Array.from(e.dataTransfer.files)
        if (archivos.length) onArchivos(multiple ? archivos : archivos.slice(0, 1))
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-control text-center transition-colors outline-none hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50",
        compacta ? "px-3 py-4" : "px-4 py-8",
        encima && "border-brand bg-brand-soft",
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
