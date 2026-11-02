"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "cn"
import { enlaceSeguro, esValorVacio, textoDeValor, type ColorOpcion, type DefCampo, type InicioRegistro } from "@/lib/base/campos"
import { CLASE_FUERTE } from "@/components/app/base/apariencia"
import { TarjetaPerfil } from "@/components/app/base/tarjeta-perfil"
import { ValorCelda } from "@/components/app/base/rejilla/valor-celda"

/** Lo que necesita una tarjeta para pintar un registro (kanban y galería). */
export type PropsTarjetas<T> = {
  /** Los campos que se ven en la tarjeta, en el orden de la vista. El principal va de título. */
  campos: DefCampo<T>[]
  /** La celda de inicio de la base: con ella, la tarjeta es la de perfil. */
  inicio?: (fila: T) => InicioRegistro
  colorDe: (fila: T) => ColorOpcion | undefined
  celdas?: Partial<Record<string, (fila: T) => React.ReactNode>>
  onAbrirVinculo?: (campoId: string, id: string) => void
  /** La imagen de la tarjeta (la portada de una campaña, la miniatura de una idea). */
  portada?: (fila: T) => string | null | undefined
}

/**
 * Un registro en tarjeta. Con celda de inicio, la tarjeta de perfil, y debajo los campos que enciende la vista. Sin ella,
 * su título (el campo principal, con la marca de su color si la vista colorea) y los campos que enseña la vista, cada uno
 * con su nombre en pequeño. Los vacíos no ocupan sitio. Con `portada`, la imagen arriba.
 */
export function TarjetaRegistro<T>({ fila, campos, inicio, colorDe, celdas, onAbrirVinculo, portada }: PropsTarjetas<T> & { fila: T }) {
  const principal = campos.find((c) => c.principal)
  const resto = campos.filter((c) => !c.principal && c.tipo !== "imagen" && !esValorVacio(c.valor(fila)))
  const color = colorDe(fila)
  if (inicio) {
    const datos = inicio(fila)
    return (
      <TarjetaPerfil inicio={{ ...datos, portada: datos.portada ?? portada?.(fila) }}>
        {resto.map((c) => (
          <div key={c.id} className="flex min-w-0 items-center justify-between gap-2 text-xs">
            <span className="flex-none text-muted-foreground">{c.nombre}</span>
            <span className="flex min-w-0 justify-end">{celdas?.[c.id]?.(fila) ?? <ValorCelda campo={c} valor={c.valor(fila)} altura="corta" editable={false} onCambiar={() => undefined} onAbrirVinculo={onAbrirVinculo ? (id) => onAbrirVinculo(c.id, id) : undefined} />}</span>
          </div>
        ))}
      </TarjetaPerfil>
    )
  }
  // Sin portada de la página, el primer campo de imagen que enseña la vista.
  const campoImagen = campos.find((c) => c.tipo === "imagen")
  const imagen = portada?.(fila) ?? (campoImagen && enlaceSeguro(campoImagen.valor(fila))) ?? undefined
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {(portada || campoImagen) && (
        <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-muted">
          {imagen && <Image src={imagen} alt="" fill sizes="320px" unoptimized={!imagen.startsWith("https://")} className="object-cover" />}
        </div>
      )}
      <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold">
        {color && <span aria-hidden className={cn("size-2 flex-none rounded-full", CLASE_FUERTE[color])} />}
        <span className="truncate">{principal ? textoDeValor(principal, principal.valor(fila)) || "Sin nombre" : "Sin nombre"}</span>
      </p>
      {resto.map((c) => (
        <div key={c.id} className="grid min-w-0 gap-0.5">
          <span className="truncate text-[11px] text-muted-foreground">{c.nombre}</span>
          <span className="flex min-h-[18px] min-w-0 text-[13px] leading-[18px]">
            {celdas?.[c.id]?.(fila) ?? <ValorCelda campo={c} valor={c.valor(fila)} altura="corta" editable={false} onCambiar={() => undefined} onAbrirVinculo={onAbrirVinculo ? (id) => onAbrirVinculo(c.id, id) : undefined} />}
          </span>
        </div>
      ))}
    </div>
  )
}
