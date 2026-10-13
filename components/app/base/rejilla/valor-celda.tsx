"use client"

import * as React from "react"
import { CheckIcon, StarIcon } from "lucide-react"
import { cn } from "cn"
import { ESTRELLAS_POR_DEFECTO, opcionDe, textoDeValor, type DefCampo, type ValorCampo } from "@/lib/base/campos"
import { ALTURAS_FILA, type AlturaFila } from "@/lib/base/vistas"
import { FichaOpcion, FichaVinculo } from "@/components/app/base/apariencia"

/** Líneas de texto que caben en una fila de esta altura (el texto mide 18 px con 6 px de margen arriba y abajo). */
const lineas = (altura: AlturaFila) => Math.max(1, Math.floor((ALTURAS_FILA[altura].px - 12) / 18))

/**
 * El valor de una celda en reposo, como en Airtable: texto cortado (o en varias líneas si la fila
 * es alta), números a la derecha, opciones como fichas de color, el registro vinculado (que se
 * abre al pulsarlo), la casilla, enlaces y estrellas.
 */
export function ValorCelda<T>({
  campo,
  valor,
  altura,
  editable,
  onCambiar,
  onAbrirVinculo,
}: {
  campo: DefCampo<T>
  valor: ValorCampo
  altura: AlturaFila
  editable: boolean
  /** Casilla y estrellas se cambian con un clic, sin editor. */
  onCambiar: (v: ValorCampo) => void
  /** Abre la ficha del registro vinculado (la marca de un contacto). */
  onAbrirVinculo?: (id: string) => void
}) {
  const varias = lineas(altura) > 1
  const recorte = varias ? ({ WebkitLineClamp: lineas(altura), display: "-webkit-box", WebkitBoxOrient: "vertical" } as React.CSSProperties) : undefined

  switch (campo.tipo) {
    case "casilla":
      return (
        <button
          type="button"
          role="checkbox"
          aria-checked={valor === true}
          aria-label={campo.nombre}
          disabled={!editable}
          onClick={() => onCambiar(valor !== true)}
          className={cn("flex size-4 items-center justify-center rounded-[4px] border border-control", valor === true && "border-brand bg-brand text-brand-foreground")}
        >
          {valor === true && <CheckIcon className="size-3" />}
        </button>
      )
    case "select":
    case "multiselect": {
      const ids = Array.isArray(valor) ? valor : typeof valor === "string" && valor ? [valor] : []
      return (
        <span className={cn("flex min-w-0 gap-1", varias ? "flex-wrap content-start" : "overflow-hidden")}>
          {ids.map((id) => {
            const o = opcionDe(campo, id)
            return <FichaOpcion key={id} label={o?.label ?? id} color={o?.color} tono={o?.tono} className="flex-none" />
          })}
        </span>
      )
    }
    case "vinculo": {
      if (typeof valor !== "string" || !valor) return null
      const label = opcionDe(campo, valor)?.label ?? valor
      return <FichaVinculo label={label} onAbrir={onAbrirVinculo ? () => onAbrirVinculo(valor) : undefined} className="flex-none" />
    }
    case "calificacion": {
      const maximo = campo.formato?.maximo ?? ESTRELLAS_POR_DEFECTO
      const n = typeof valor === "number" ? valor : 0
      return (
        <span className="group/estrellas flex items-center">
          {Array.from({ length: maximo }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1} de ${maximo}`}
              disabled={!editable}
              onClick={() => onCambiar(n === i + 1 ? 0 : i + 1)}
              className={cn("p-px", i < n ? "text-opcion-amarillo-fuerte" : "text-transparent group-hover/estrellas:text-muted-foreground/40")}
            >
              <StarIcon className="size-3.5" fill="currentColor" strokeWidth={0} />
            </button>
          ))}
        </span>
      )
    }
    case "numero":
    case "moneda":
    case "porcentaje":
      return <span className="block w-full truncate text-right tabular-nums">{textoDeValor(campo, valor)}</span>
    case "url":
    case "email": {
      const texto = textoDeValor(campo, valor)
      if (!texto) return null
      const href = campo.tipo === "email" ? `mailto:${texto}` : /^https?:\/\//i.test(texto) ? texto : `https://${texto}`
      return (
        <a href={href} target="_blank" rel="noreferrer" className={cn("min-w-0 underline decoration-muted-foreground/40 underline-offset-2 hover:decoration-foreground", !varias && "truncate")} style={recorte} onMouseDown={(e) => e.stopPropagation()}>
          {texto}
        </a>
      )
    }
    default:
      return (
        <span className={cn("min-w-0 break-words whitespace-pre-line", !varias && "truncate whitespace-nowrap")} style={recorte}>
          {textoDeValor(campo, valor)}
        </span>
      )
  }
}
