"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { demoRecords, recordStatus, stages, type DemoRecord } from "@/lib/demo-data"
import type { CampoFiltrable } from "@/lib/filtros/core"
import { filtrarFilas } from "@/lib/filtros/core"
import { useFiltrosAvanzados } from "@/hooks/use-filtros-avanzados"
import { Button } from "@/components/ui/button"
import { FilterBar } from "@/components/app/filter-bar"
import type { FiltroRapido } from "@/components/app/quick-filters"

const lista = (xs: string[]) => [...new Set(xs)].sort().map((x) => ({ value: x, label: x }))

const campos: CampoFiltrable<DemoRecord>[] = [
  { id: "nombre", label: "Nombre", tipo: "texto", grupo: "Datos", valor: (r) => r.name },
  { id: "fase", label: "Fase", tipo: "select", grupo: "Estado", opciones: stages.map((s) => ({ value: s.id, label: s.label })), valor: (r) => r.stage },
  { id: "estado", label: "Estado", tipo: "select", grupo: "Estado", opciones: Object.entries(recordStatus).map(([k, m]) => ({ value: k, label: m.label })), valor: (r) => r.status },
  { id: "responsable", label: "Responsable", tipo: "select", grupo: "Gestión", opciones: lista(demoRecords.map((r) => r.owner)), valor: (r) => r.owner },
  { id: "categoria", label: "Categoría", tipo: "select", grupo: "Datos", opciones: lista(demoRecords.map((r) => r.category)), valor: (r) => r.category },
  { id: "etiquetas", label: "Etiqueta", tipo: "multiselect", grupo: "Datos", opciones: lista(demoRecords.flatMap((r) => r.tags)), valor: (r) => r.tags },
  { id: "valor", label: "Valor", tipo: "numero", grupo: "Negocio", valor: (r) => r.value },
]

const RAPIDOS: FiltroRapido[] = [
  { id: "campo:fase", clase: "campo", campo: "fase" },
  { id: "campo:estado", clase: "campo", campo: "estado" },
  { id: "campo:responsable", clase: "campo", campo: "responsable" },
  { id: "campo:categoria", clase: "campo", campo: "categoria" },
  { id: "campo:etiquetas", clase: "campo", campo: "etiquetas" },
  { id: "guardado:grandes", clase: "guardado", label: "Más de 40.000 €", union: "y", condiciones: [{ campo: "valor", op: "mayor", valor: "40000" }] },
]

/**
 * La FilterBar de verdad sobre datos de ejemplo, en un recuadro que se puede estrechar desde su
 * esquina: los rápidos que no caben pasan a «+N» y «Filtros» siempre queda a la vista. Las
 * condiciones van en la URL (?f=), así que se monta dentro de Suspense.
 */
export function FilterBarDemo() {
  return (
    <React.Suspense fallback={<div className="h-10 w-full max-w-[720px] animate-pulse rounded-lg bg-muted" />}>
      <Demo />
    </React.Suspense>
  )
}

function Demo() {
  const av = useFiltrosAvanzados("ds-filter-bar", campos, RAPIDOS)
  const [q, setQ] = React.useState("")
  const filas = React.useMemo(() => {
    const s = q.trim().toLowerCase()
    return filtrarFilas(demoRecords, av.grupo, campos).filter((r) => !s || r.name.toLowerCase().includes(s))
  }, [av.grupo, q])

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full max-w-full min-w-[320px] resize-x overflow-hidden rounded-lg border border-dashed p-3" style={{ width: 720 }}>
        <FilterBar
          filtros={av}
          campos={campos}
          filas={filas}
          objeto="los registros"
          buscador={{ value: q, onChange: setQ, placeholder: "Buscar registro…" }}
          onLimpiar={() => setQ("")}
          actions={<Button onClick={() => toast("Aquí se crearía un registro")}><PlusIcon /> Nuevo registro</Button>}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {filas.length} de {demoRecords.length} registros. Arrastra la esquina inferior derecha del recuadro para estrecharlo o ensancharlo.
      </p>
    </div>
  )
}
