"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import type { EditorTextoProps } from "@/components/influencer/editor-texto-base"

export type { EditorTextoProps }
export type { MarcaNota } from "@/components/influencer/editor-notas"
export type { ContextoVariables } from "@/components/influencer/editor-variable"

/**
 * El editor de texto del workspace, cargado bajo demanda: Tiptap pesa y solo hace falta en las
 * páginas que escriben o enseñan un documento (guion, brief, contrato). Mientras carga, su esqueleto.
 */
export const EditorTexto = dynamic<EditorTextoProps>(() => import("@/components/influencer/editor-texto-base").then((m) => m.EditorTextoBase), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col gap-2.5 p-5" aria-busy="true" aria-label="Cargando el editor">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  ),
})
