"use client"

import * as React from "react"
import Image from "next/image"
import { toast } from "sonner"
import { PaperclipIcon, XIcon } from "lucide-react"
import { enlaceSeguro } from "@/lib/base/campos"
import { Button } from "@/components/ui/button"
import { ZonaSubida } from "@/components/app/zona-subida"

/** Sube un archivo y devuelve su dirección, o null si no se ha podido. */
type SubirArchivoBase = (archivo: File) => Promise<string | null>

/** Las imágenes que se admiten: sin SVG, que puede llevar código. */
const TIPOS_IMAGEN = "image/jpeg,image/png,image/webp,image/gif,image/avif"

const Subida = React.createContext<SubirArchivoBase | null>(null)

/** Cómo sube archivos este portal: con él, las bases ofrecen los campos de imagen y de archivo adjunto. */
export function SubidaBaseProvider({ subir, children }: { subir: SubirArchivoBase; children: React.ReactNode }) {
  return <Subida.Provider value={subir}>{children}</Subida.Provider>
}

export const useSubidaBase = () => React.useContext(Subida)

/** Lo que se ve al editar un campo de imagen o adjunto: lo que hay, con su botón de quitar, o la zona para subirlo. */
export function ControlArchivoCampo({ tipo, valor, onCambiar }: { tipo: string; valor: string | null; onCambiar: (valor: string | null) => void }) {
  const subir = useSubidaBase()
  const [subiendo, setSubiendo] = React.useState(false)
  const esImagen = tipo === "imagen"
  const enlace = enlaceSeguro(valor)
  if (enlace)
    return (
      <div className="flex items-center gap-2">
        {esImagen ? (
          <span className="relative block size-14 flex-none overflow-hidden rounded-lg bg-muted">
            <Image src={enlace} alt="" fill sizes="56px" unoptimized className="object-cover" />
          </span>
        ) : (
          <a href={enlace} target="_blank" rel="noreferrer" className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-sm underline-offset-2 hover:underline">
            <PaperclipIcon className="size-4 flex-none text-muted-foreground" aria-hidden /> Abrir archivo
          </a>
        )}
        <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={() => onCambiar(null)}>
          <XIcon /> Quitar
        </Button>
      </div>
    )
  return (
    <ZonaSubida
      compacta
      multiple={false}
      accept={esImagen ? TIPOS_IMAGEN : undefined}
      desactivada={subiendo || !subir}
      titulo={subiendo ? "Subiendo…" : esImagen ? "Subir imagen" : "Subir archivo"}
      onArchivos={async ([archivo]) => {
        if (!archivo || !subir) return
        if (esImagen && !TIPOS_IMAGEN.split(",").includes(archivo.type)) return void toast.error("Sube una imagen JPG, PNG, WebP, GIF o AVIF.")
        setSubiendo(true)
        const direccion = await subir(archivo)
        setSubiendo(false)
        if (direccion) onCambiar(direccion)
      }}
    />
  )
}
