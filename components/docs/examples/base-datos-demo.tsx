"use client"

import * as React from "react"
import { toast } from "sonner"
import { fmt } from "@/lib/format"
import { demoRecords, type DemoRecord } from "@/lib/demo-data"
import { camposDemoRegistros, escribirEnRegistro, vistasDemoRegistros } from "@/lib/demo-base"
import { useBaseLocal, useEnNavegador } from "@/hooks/use-base-local"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/app/states"
import { BaseDatos } from "@/components/app/base/base-datos"

/** Una base entera, con sus vistas guardadas en este navegador: lo mismo que en un portal. */
export function BaseDatosDemo() {
  const [registros, setRegistros] = React.useState<DemoRecord[]>(demoRecords)
  const campos = React.useMemo(() => camposDemoRegistros(demoRecords), [])
  const base = useBaseLocal("docs-base-datos", campos, vistasDemoRegistros)
  const enNavegador = useEnNavegador()
  return (
    <div className="h-[560px]">
      {enNavegador && (
        <BaseDatos
          clave="docs-base-datos"
          base={base}
          campos={campos}
          filas={registros}
          getId={(r) => r.id}
          hoy="2026-10-06"
          objeto={{ singular: "registro", plural: "registros", nuevo: "Nuevo registro" }}
          onAbrir={(id) => toast(`Aquí se abriría la ficha de ${registros.find((r) => r.id === id)?.name ?? ""}`)}
          onEscribir={(cambios) => setRegistros((rs) => rs.map((r) => cambios.filter((c) => c.fila.id === r.id).reduce((x, c) => escribirEnRegistro(x, c.campo, c.valor), r)))}
          onNuevo={() => toast("Aquí se abriría el alta")}
          onBorrar={(ids) => setRegistros((rs) => rs.filter((r) => !ids.includes(r.id)))}
          kanban={{ resumen: (rs) => fmt.eur(rs.reduce((a, r) => a + r.value, 0)) }}
          vacio={(hayFiltro, limpiar) => <EmptyState title="Nada coincide" description="Quita algún filtro." action={hayFiltro ? <Button variant="outline" size="sm" onClick={limpiar}>Quitar filtros</Button> : undefined} />}
        />
      )}
    </div>
  )
}
