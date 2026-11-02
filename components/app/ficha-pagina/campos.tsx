"use client"

import * as React from "react"
import { cn } from "cn"
import type { DefCampo, ValorCampo } from "@/lib/base/campos"
import { InlineField, type InlineTipo, type ValorInline } from "@/components/app/inline-field"
import { FichaCelda, FichaDato } from "./bloque"
import { eurosFicha, fechaConAno } from "./formato"

/** Lo que necesita `InlineField` dentro de un bloque: sin el aire que lleva en las fichas laterales. */
export const EDITABLE_FICHA = "-mx-1 min-h-0 w-[calc(100%+0.5rem)] px-1 text-[14.5px] [&_button]:h-auto [&_button]:min-h-0 [&_svg]:hidden"

/** Una celda con un dato que se edita en el sitio: su etiqueta, su valor y una nota debajo si hace falta. */
export function CeldaEditable({ etiqueta, base, crece, nota, extra, className, ...campo }: React.ComponentProps<typeof InlineField> & { etiqueta: React.ReactNode; base?: number; crece?: number; nota?: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <FichaCelda base={base} crece={crece} className="px-6 pt-4 pb-[18px]">
      <FichaDato etiqueta={etiqueta} extra={extra}>
        <InlineField {...campo} className={cn(EDITABLE_FICHA, className)} />
      </FichaDato>
      {nota && <div className="mt-1 text-[12.5px] text-ficha-tinta-3">{nota}</div>}
    </FichaCelda>
  )
}

const TIPO_INLINE: Partial<Record<DefCampo<unknown>["tipo"], InlineTipo>> = {
  texto: "texto",
  texto_largo: "textarea",
  numero: "numero",
  moneda: "numero",
  porcentaje: "numero",
  fecha: "fecha",
  select: "select",
  multiselect: "multiselect",
  casilla: "booleano",
  url: "url",
  email: "email",
  telefono: "telefono",
  vinculo: "select",
}

const aInline = (v: ValorCampo): ValorInline => (v === null || v === undefined ? null : typeof v === "string" || typeof v === "number" || typeof v === "boolean" ? v : Array.isArray(v) ? v.map(String) : null)

/** Cómo se lee en reposo el valor de un campo de una base. */
function enReposo<T>(campo: DefCampo<T>) {
  return (v: ValorInline): React.ReactNode => {
    if (v === null || v === "") return null
    if (campo.tipo === "moneda" && typeof v === "number") return eurosFicha(v)
    if (campo.tipo === "porcentaje" && typeof v === "number") return `${v} %`
    if ((campo.tipo === "select" || campo.tipo === "vinculo") && typeof v === "string") return campo.opciones?.find((o) => o.id === v)?.label ?? v
    if (Array.isArray(v)) return v.map((x) => campo.opciones?.find((o) => o.id === x)?.label ?? x).join(", ")
    if (campo.tipo === "fecha" && typeof v === "string") return fechaConAno(v.slice(0, 10))
    if (typeof v === "boolean") return v ? "Sí" : "No"
    return String(v)
  }
}

/** El control editable de un campo de una base, con su tipo y sus opciones. Un campo de solo lectura se lee y ya está. */
export function ValorDeCampo<T>({ campo, fila, onGuardar, className }: { campo: DefCampo<T>; fila: T; onGuardar: (campoId: string, valor: ValorInline) => void | Promise<void>; className?: string }) {
  const valor = aInline(campo.valor(fila))
  const tipo = TIPO_INLINE[campo.tipo] ?? "texto"
  const clase = className ?? "-mx-1 min-h-0 w-[calc(100%+0.5rem)] px-1 text-[14.5px] [&_button]:h-auto [&_button]:min-h-0 [&>span]:whitespace-normal"
  if (campo.soloLectura) return <span className="text-[14.5px]">{enReposo(campo)(valor) ?? <span className="text-ficha-tinta-3">—</span>}</span>
  return <InlineField tipo={tipo} value={valor} placeholder="Añadir" opciones={campo.opciones?.map((o) => ({ value: o.id, label: o.label }))} onSave={async (v) => void (await onGuardar(campo.id, v))} render={enReposo(campo)} className={clase} />
}

/** Una celda por campo, con su nombre encima y su valor editable. */
export function CeldasDeCampos<T>({ campos, fila, onGuardar, base = 220 }: { campos: DefCampo<T>[]; fila: T; onGuardar: (campoId: string, valor: ValorInline) => void | Promise<void>; base?: number }) {
  return campos.map((campo) => (
    <FichaCelda key={campo.id} base={base} className="px-6 pt-4 pb-[18px]">
      <FichaDato etiqueta={campo.nombre}>
        <ValorDeCampo campo={campo} fila={fila} onGuardar={onGuardar} />
      </FichaDato>
    </FichaCelda>
  ))
}
