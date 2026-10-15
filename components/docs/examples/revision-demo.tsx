"use client"

import * as React from "react"
import type { Ancla, Mensaje, NotaRevision, VersionRevision } from "@/lib/revision-notas"
import { Conversacion } from "@/components/app/conversacion"
import { VisorMedia } from "@/components/app/visor-media"

type Lado = "equipo" | "cliente"

const NOTAS: NotaRevision<Lado>[] = [
  { id: "n1", autor: "Cliente", el: "2026-10-13T10:12:00", texto: "El logo queda tapado: súbelo un poco.", ancla: { tipo: "punto", x: 30, y: 22, imagen: 0 }, resuelta: false, respuestas: [{ id: "r1", autor: "Equipo", lado: "equipo", el: "2026-10-13T10:40:00", texto: "Hecho en la siguiente." }] },
  { id: "n2", autor: "Cliente", el: "2026-10-13T10:15:00", texto: "Mejor el producto en primer plano.", ancla: { tipo: "punto", x: 62, y: 70, imagen: 1 }, resuelta: true, respuestas: [] },
]

const MENSAJES: Mensaje<Lado>[] = [{ id: "m1", autor: "Equipo", lado: "equipo", el: "2026-10-13T09:30:00", texto: "Te dejo la primera versión del carrusel." }]

const VERSION: VersionRevision = { id: "v1", numero: 1, creadaEl: "2026-10-13", archivos: [{ nombre: "portada.jpg", tamano: 0 }, { nombre: "producto.jpg", tamano: 0 }], notas: NOTAS }

/** El visor y la conversación de una versión, enlazados: pulsar una nota la marca en los dos y pulsar en la foto propone una nueva. */
export function RevisionDemo() {
  const [notas, setNotas] = React.useState(NOTAS)
  const [seleccionada, setSeleccionada] = React.useState<string | null>(null)
  const [pendiente, setPendiente] = React.useState<Ancla | null>(null)
  return (
    <div className="grid h-[520px] w-full overflow-hidden rounded-lg border bg-card lg:grid-cols-[minmax(0,1fr)_320px]">
      <VisorMedia version={{ ...VERSION, notas }} medio="imagen" notas={notas} seleccionada={seleccionada} onSeleccionar={setSeleccionada} onMarcar={setPendiente} marcaPendiente={pendiente} zoom={70} estado={() => "En revisión"} className="max-lg:hidden" />
      <Conversacion
        notas={notas}
        mensajes={MENSAJES}
        lado="cliente"
        ladoAutor="equipo"
        seleccionada={seleccionada}
        onSeleccionar={setSeleccionada}
        anclaPendiente={pendiente}
        onQuitarAncla={() => setPendiente(null)}
        onEnviar={(texto, ancla) => setNotas((n) => [...n, { id: `n${n.length + 1}`, autor: "Cliente", el: "2026-10-14T09:00:00", texto, ancla, resuelta: false, respuestas: [] }])}
        className="min-h-0 border-l"
      />
    </div>
  )
}
