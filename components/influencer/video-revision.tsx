"use client"

import { cn } from "cn"
import { fmt } from "@/lib/format"
import { ESTADOS_VERSION, estadoDe, type AnclaNota, type Nota, type Version } from "@/lib/influencer/modelo"
import { tintClass, type Tint } from "@/lib/influencer/tints"
import { ReproductorNotas, type NotaEnVideo } from "@/components/app/reproductor-notas"

/** Ancho del vídeo vertical al 100 %. */
const ANCHO_VIDEO = 320

/** Las notas de la versión que van en un segundo del vídeo, con el número con el que salen en la conversación. */
function notasEnVideo(notas: Nota[]): NotaEnVideo[] {
  return notas.flatMap((n, i) => (n.ancla?.tipo === "segundo" ? [{ id: n.id, numero: i + 1, segundo: n.ancla.segundo, x: n.ancla.x, y: n.ancla.y, autor: n.autor, texto: n.texto, resuelta: n.resuelta }] : []))
}

/**
 * El vídeo de una versión para revisarlo, como en Frame.io: el reproductor con play y pausa y sus
 * notas en el fotograma. Con `onAnotar`, pulsar en el vídeo deja una nota en ese segundo y ese punto;
 * elegir una nota (en la conversación) lleva el vídeo a su fotograma con la nota encima.
 */
export function VideoRevision({ version, notas, seleccionada, onSeleccionar, onAnotar, zoom = 100, tint, className }: { version: Version; notas: Nota[]; seleccionada?: string | null; onSeleccionar?: (id: string) => void; onAnotar?: (texto: string, ancla: AnclaNota) => void; zoom?: number; tint: Tint; className?: string }) {
  const archivo = version.archivos?.[0]
  const estado = estadoDe(ESTADOS_VERSION, version.estado)
  return (
    <div data-slot="ws-video-revision" className={cn("min-h-0 overflow-auto bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]", className)}>
      <div className="flex min-h-full w-max min-w-full flex-col items-center justify-center p-3 sm:p-8">
        <p className="mb-2 flex items-center gap-2 text-xs">
          <span className="rounded-md bg-brand px-1.5 py-0.5 font-semibold text-brand-foreground">v{version.numero}</span>
          <span className="text-muted-foreground">
            {fmt.date(version.creadaEl)} · {estado.label.toLowerCase()}
          </span>
        </p>
        <ReproductorNotas
          videoUrl={archivo?.videoUrl}
          portadaUrl={archivo?.url}
          duracion={archivo?.duracion}
          ancho={Math.round(ANCHO_VIDEO * (zoom / 100))}
          fondo={tintClass[tint]}
          notas={notasEnVideo(notas)}
          seleccionada={seleccionada}
          onSeleccionar={onSeleccionar}
          onAnotar={onAnotar ? ({ segundo, x, y, texto }) => onAnotar(texto, { tipo: "segundo", segundo, x, y }) : undefined}
        />
      </div>
    </div>
  )
}
