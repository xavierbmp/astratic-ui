"use client"

import * as React from "react"
import { HOY } from "@/lib/influencer/demo-data"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { PIEZA_VACIA, type PiezaPedidaForm } from "@/lib/influencer/formularios"
import { fasesDePieza, moverPieza } from "@/lib/influencer/cronograma"
import { etiquetaDePieza } from "@/lib/influencer/collabs"
import { Gantt } from "@/components/influencer/gantt"
import { EditorTexto } from "@/components/influencer/editor-texto"
import { Conversacion } from "@/components/influencer/conversacion"
import { VisorMedia } from "@/components/influencer/visor-media"
import { PiezasEditor } from "@/components/influencer/piezas-editor"

const [lumea, , vero, glow] = demoCollabs

/** El cronograma de Lumea Skin: arrastra una fila para mover sus fechas. */
export function GanttExample() {
  const [piezas, setPiezas] = React.useState(lumea.piezas)
  return (
    <Gantt
      className="w-full"
      hoy={HOY}
      filas={piezas.map((p) => ({ id: p.id, titulo: p.titulo, subtitulo: etiquetaDePieza(p), fases: fasesDePieza(p), publicacion: p.publicacion, publicada: !!p.publicada }))}
      onMover={(id, dias) => setPiezas((ps) => ps.map((p) => (p.id === id ? moverPieza(p, dias) : p)))}
    />
  )
}

/** El guion del reel de Lumea con la nota de la marca marcada en el texto. */
export function EditorGuionExample() {
  const v = lumea.piezas[0].guion[0]
  const [texto, setTexto] = React.useState(v.texto ?? "")
  const [nota, setNota] = React.useState<string | null>(null)
  const marcas = v.notas.flatMap((n, i) => (n.ancla?.tipo === "texto" ? [{ id: n.id, numero: i + 1, cita: n.ancla.cita, resuelta: n.resuelta }] : []))
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl bg-card shadow-card">
      <EditorTexto value={texto} onChange={setTexto} notas={marcas} notaSeleccionada={nota} onSeleccionarNota={setNota} className="h-full" contenidoClassName="px-6 py-5" />
    </div>
  )
}

/** El vídeo de Maison Vero con las dos notas de la marca y su conversación. */
export function RevisionExample() {
  const v = vero.piezas[0].media[0]
  const [nota, setNota] = React.useState<string | null>(null)
  return (
    <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="overflow-hidden rounded-2xl bg-card shadow-card">
        <VisorMedia version={v} medio="video" notas={v.notas} seleccionada={nota} onSeleccionar={setNota} tint={vero.tint} className="h-[520px]" />
      </div>
      <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl bg-card shadow-card">
        <Conversacion notas={v.notas} mensajes={v.mensajes} lado="influencer" seleccionada={nota} onSeleccionar={setNota} className="flex-1" />
      </div>
    </div>
  )
}

/** Las fotos del carrusel de Glow Studio con la nota clavada en la segunda. */
export function FotosExample() {
  const v = glow.piezas[1].media[0]
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-card shadow-card">
      <VisorMedia version={v} medio="imagen" notas={v.notas} zoom={75} tint={glow.tint} className="h-[420px]" />
    </div>
  )
}

/** «Añadir pieza», como lo ve la marca en su formulario. */
export function PiezasEditorExample() {
  const [piezas, setPiezas] = React.useState<PiezaPedidaForm[]>([
    { ...PIEZA_VACIA, titulo: "Reel de la rutina de noche", publicacion: "2026-10-15" },
    { ...PIEZA_VACIA, tipo: "carrusel", titulo: "Carrusel con los tres pasos", publicacion: "2026-10-18" },
  ])
  return <PiezasEditor value={piezas} onChange={setPiezas} className="w-full" />
}
