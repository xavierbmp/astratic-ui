"use client"

import * as React from "react"
import { LayoutDashboardIcon } from "lucide-react"
import { bloquesVisibles, conBloque, conDato, moverBloque, seVe, type AjustesBloques } from "@/lib/bloques"
import { AjustesBloquesBoton, DatosBloque, ListaBloques } from "@/components/app/ajustes-bloques"
import { Section, SectionBody, SectionHeader } from "@/components/app/section"

type Bloque = "resumen" | "contacto" | "actividad" | "documentos"

const BLOQUES: Record<Bloque, { label: string; descripcion: string; datos: { clave: string; label: string }[] }> = {
  resumen: { label: "Resumen", descripcion: "Estado, importe y siguiente paso", datos: [{ clave: "resumen.estado", label: "Estado" }, { clave: "resumen.importe", label: "Importe" }, { clave: "resumen.paso", label: "Siguiente paso" }] },
  contacto: { label: "Contacto", descripcion: "Persona, email y teléfono", datos: [{ clave: "contacto.email", label: "Email" }, { clave: "contacto.telefono", label: "Teléfono" }] },
  actividad: { label: "Actividad", descripcion: "Lo último que ha pasado", datos: [] },
  documentos: { label: "Documentos", descripcion: "Propuestas y contratos", datos: [] },
}

const INICIALES: AjustesBloques<Bloque> = {
  bloques: [
    { id: "resumen", visible: true },
    { id: "contacto", visible: true },
    { id: "actividad", visible: true },
    { id: "documentos", visible: false },
  ],
}

function useAjustes() {
  const [ajustes, setAjustes] = React.useState(INICIALES)
  const lista = ajustes.bloques.map((b) => ({
    ...b,
    label: BLOQUES[b.id].label,
    descripcion: BLOQUES[b.id].descripcion,
    contenido: BLOQUES[b.id].datos.length ? <DatosBloque datos={BLOQUES[b.id].datos} visible={(c) => seVe(ajustes, c)} onCambiar={(c, ver) => setAjustes(conDato(ajustes, c, ver))} /> : undefined,
  }))
  return {
    ajustes,
    lista,
    onMover: (desde: string, hasta: string) => setAjustes(moverBloque(ajustes, desde, hasta)),
    onVisible: (id: string, visible: boolean) => setAjustes(conBloque(ajustes, id, visible)),
  }
}

/** Un editor que ajusta los bloques todo el rato: la lista a la vista. */
export function ListaBloquesDemo() {
  const { ajustes, lista, onMover, onVisible } = useAjustes()
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
      <Section className="flex-none">
        <SectionHeader title="Bloques" count={bloquesVisibles(ajustes).length} />
        <SectionBody className="p-2">
          <ListaBloques bloques={lista} onMover={onMover} onVisible={onVisible} />
        </SectionBody>
      </Section>
      <div className="rounded-lg border bg-card p-3 text-xs">
        <p className="mb-2 font-medium text-muted-foreground">Se ve así</p>
        <ol className="grid gap-1.5">
          {bloquesVisibles(ajustes).map((id) => (
            <li key={id} className="rounded-md bg-muted px-2 py-1.5">
              <span className="font-medium">{BLOQUES[id].label}</span>
              {BLOQUES[id].datos.some((d) => seVe(ajustes, d.clave)) && (
                <span className="block text-muted-foreground">
                  {BLOQUES[id].datos
                    .filter((d) => seVe(ajustes, d.clave))
                    .map((d) => d.label)
                    .join(" · ")}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

/** Una página de bloques: el engranaje de su cabecera. */
export function AjustesBloquesBotonDemo() {
  const { ajustes, lista, onMover, onVisible } = useAjustes()
  return (
    <Section className="w-full max-w-md flex-none">
      <SectionHeader icon={LayoutDashboardIcon} title="Ficha del cliente" action={<AjustesBloquesBoton bloques={lista} onMover={onMover} onVisible={onVisible} />} />
      <SectionBody className="grid gap-2 p-3">
        {bloquesVisibles(ajustes).map((id) => (
          <div key={id} className="rounded-md border px-3 py-2 text-sm">
            {BLOQUES[id].label}
          </div>
        ))}
      </SectionBody>
    </Section>
  )
}
