"use client"

import * as React from "react"
import Image from "next/image"
import { CameraIcon, ImagePlusIcon, Loader2Icon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

/** Elegir una imagen del ordenador o del móvil: un `input` escondido que abre el botón que lo pide. */
function useElegirImagen(onArchivo?: (archivo: File) => void) {
  const entrada = React.useRef<HTMLInputElement>(null)
  const input = onArchivo ? (
    <input
      ref={entrada}
      type="file"
      accept="image/*"
      hidden
      onChange={(e) => {
        const archivo = e.target.files?.[0]
        if (archivo) onArchivo(archivo)
        e.target.value = ""
      }}
    />
  ) : null
  return { input, abrir: () => entrada.current?.click() }
}

/**
 * La cabecera de un formulario como una tarjeta de perfil: una imagen de portada (la de la campaña)
 * y, encima de su esquina inferior izquierda, el logo. Los dos son opcionales y se cambian al
 * pulsarlos; quien la usa sube el archivo y devuelve su enlace. `logo` es lo que se pinta, de 64 px (el logo de
 * la marca elegida o sus iniciales); sin él, un hueco para añadirlo. Los campos van debajo, a la
 * derecha del logo, en la misma rejilla que el resto del formulario.
 */
export function PortadaFormulario({
  portada,
  onPortada,
  onQuitarPortada,
  subiendoPortada,
  textoPortada = "Imagen de portada",
  logo,
  onLogo,
  subiendoLogo,
  textoLogo = "Logo",
  vaciaClassName,
  children,
}: {
  portada?: string
  onPortada?: (archivo: File) => void
  onQuitarPortada?: () => void
  subiendoPortada?: boolean
  textoPortada?: string
  logo?: React.ReactNode
  /** Sin él, el logo solo se ve (sale de lo elegido) y no se cambia aquí. */
  onLogo?: (archivo: File) => void
  subiendoLogo?: boolean
  textoLogo?: string
  /** El fondo de la portada sin imagen (el tinte de la marca elegida). */
  vaciaClassName?: string
  children: React.ReactNode
}) {
  const elegirPortada = useElegirImagen(onPortada)
  const elegirLogo = useElegirImagen(onLogo)

  return (
    <div data-slot="portada-formulario" className="col-span-6 overflow-hidden rounded-xl border bg-card">
      <div className={cn("relative h-28 bg-muted sm:h-32", !portada && vaciaClassName)}>
        {portada && <Image src={portada} alt="" fill unoptimized sizes="680px" className="object-cover" />}
        {onPortada && (
          <div className="absolute top-2.5 right-2.5 flex gap-1.5">
            {portada && onQuitarPortada && (
              <Button type="button" variant="outline" size="icon-sm" aria-label="Quitar la imagen" onClick={onQuitarPortada} className="bg-card/90 backdrop-blur">
                <XIcon />
              </Button>
            )}
            <Button type="button" variant="outline" size="sm" onClick={elegirPortada.abrir} disabled={subiendoPortada} className="bg-card/90 backdrop-blur">
              {subiendoPortada ? <Loader2Icon className="animate-spin" /> : <ImagePlusIcon />} {portada ? "Cambiar" : textoPortada}
            </Button>
            {elegirPortada.input}
          </div>
        )}
      </div>
      <div className="px-4 pb-4">
        <div className="-mt-8 mb-3 flex items-end">
          <button
            type="button"
            disabled={!onLogo || subiendoLogo}
            onClick={elegirLogo.abrir}
            aria-label={onLogo ? `Cambiar el ${textoLogo.toLowerCase()}` : textoLogo}
            className="group/logo relative grid size-16 place-items-center overflow-hidden rounded-xl bg-card text-muted-foreground shadow-xs ring-4 ring-card disabled:cursor-default"
          >
            {logo ?? (
              <span className="grid size-full place-items-center rounded-xl border border-dashed border-input">
                <ImagePlusIcon className="size-5" />
              </span>
            )}
            {onLogo && (
              <span className={cn("absolute inset-0 grid place-items-center bg-foreground/40 text-background opacity-0 transition-opacity group-hover/logo:opacity-100", subiendoLogo && "opacity-100")}>
                {subiendoLogo ? <Loader2Icon className="size-5 animate-spin" /> : <CameraIcon className="size-5" />}
              </span>
            )}
          </button>
          {elegirLogo.input}
        </div>
        <div className="grid grid-cols-6 gap-x-4 gap-y-5">{children}</div>
      </div>
    </div>
  )
}
