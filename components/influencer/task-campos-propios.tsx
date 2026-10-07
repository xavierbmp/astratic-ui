"use client"

import { CheckIcon } from "lucide-react"
import { fmt } from "@/lib/format"
import type { CampoTarea, Tarea, TipoCampoTarea, ValorCampoTarea } from "@/lib/influencer/modelo"
import { conValor } from "@/lib/influencer/campos-tareas"
import { InlineField, type InlineTipo } from "@/components/app/inline-field"

const TIPO_INLINE: Record<TipoCampoTarea, InlineTipo> = { texto: "texto", numero: "numero", fecha: "fecha", select: "select", multiselect: "multiselect", casilla: "booleano", url: "url" }

/** El valor de un campo propio en una lista o una tarjeta, de solo lectura: «Instagram, TikTok», «12 oct», ✓. */
export function ValorPropio({ campo, valor }: { campo: CampoTarea; valor: ValorCampoTarea | undefined }) {
  if (valor === undefined || valor === "" || (Array.isArray(valor) && valor.length === 0)) return null
  const opcion = (id: string) => campo.opciones?.find((o) => o.id === id)?.label ?? id
  switch (campo.tipo) {
    case "casilla":
      return valor ? <CheckIcon className="size-3.5 text-success" aria-label={`${campo.nombre}: sí`} /> : null
    case "fecha":
      return <span>{fmt.date(String(valor))}</span>
    case "select":
      return <span>{opcion(String(valor))}</span>
    case "multiselect":
      return <span className="truncate">{(Array.isArray(valor) ? valor : [String(valor)]).map(opcion).join(", ")}</span>
    case "url":
      return (
        <a href={String(valor)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="truncate text-brand hover:underline">
          {String(valor).replace(/^https?:\/\/(www\.)?/, "")}
        </a>
      )
    default:
      return <span className="truncate">{String(valor)}</span>
  }
}

/** Un campo propio editable donde se lee, en la ficha o en su celda de la tabla. */
export function CampoPropioInline({ campo, tarea, onGuardar }: { campo: CampoTarea; tarea: Tarea; onGuardar: (t: Tarea) => void }) {
  const valor = tarea.valores?.[campo.id]
  return (
    <InlineField
      value={valor ?? (campo.tipo === "casilla" ? false : null)}
      tipo={TIPO_INLINE[campo.tipo]}
      opciones={campo.opciones?.map((o) => ({ value: o.id, label: o.label }))}
      onSave={async (v) => onGuardar(conValor(tarea, campo.id, v))}
      render={campo.tipo === "fecha" || campo.tipo === "select" || campo.tipo === "multiselect" ? () => <ValorPropio campo={campo} valor={valor} /> : undefined}
    />
  )
}
