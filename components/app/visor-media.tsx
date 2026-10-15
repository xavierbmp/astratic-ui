"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { puntoEnCaja } from "@/lib/notas-medio"
import { type Ancla, type ArchivoRevision, type NotaRevision, type VersionRevision } from "@/lib/revision-notas"
import { Chincheta, EscribirNota, NotaAbierta } from "@/components/app/notas-medio"
import { ReproductorNotas, type NotaEnVideo } from "@/components/app/reproductor-notas"

type Pin = { nota: NotaRevision; numero: number }

/** Dejar una nota escrita en un sitio del contenido (el punto de una foto o el segundo y el punto del vídeo). */
type Anotar = (texto: string, ancla: Ancla) => void

/** Lo que comparten la foto y el vídeo: sus notas, la elegida, dejar una nota y el fondo mientras carga. */
type PropsMedio = { pins: Pin[]; seleccionada?: string | null; onSeleccionar?: (id: string) => void; onAnotar?: Anotar; ancho: number; fondo: string }

/** Proporción de las fotos del visor: alto / ancho. */
const PROPORCION_FOTO = 5 / 4

/**
 * Una foto con sus notas clavadas donde las dejó quien revisa. Con `onAnotar`, pulsar en ella abre ahí
 * la caja de escribir la nota; la nota elegida se abre encima de su chincheta.
 */
function FotoConNotas({ archivo, indice, pins, seleccionada, onSeleccionar, onAnotar, ancho, fondo }: PropsMedio & { archivo: ArchivoRevision; indice: number }) {
  const [borrador, setBorrador] = React.useState<{ x: number; y: number } | null>(null)
  const fotograma = { ancho, alto: ancho * PROPORCION_FOTO }
  const abierta = borrador ? null : pins.find((p) => p.nota.id === seleccionada)
  const pulsar = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onAnotar) setBorrador(puntoEnCaja(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY))
  }
  return (
    <div onClick={pulsar} style={{ width: ancho }} className={cn("relative aspect-[4/5] max-w-full flex-none overflow-hidden rounded-lg shadow-pop", fondo, onAnotar && "cursor-crosshair")}>
      {archivo.url && <Image src={archivo.url} alt={archivo.nombre} fill sizes={`${ancho}px`} className="object-cover" unoptimized={archivo.url.startsWith("blob:")} />}
      {pins.map((p) => p.nota.ancla?.tipo === "punto" && <Chincheta key={p.nota.id} numero={p.numero} resuelta={p.nota.resuelta} activa={seleccionada === p.nota.id} onClick={() => onSeleccionar?.(p.nota.id)} style={{ left: `${p.nota.ancla.x}%`, top: `${p.nota.ancla.y}%` }} />)}
      {abierta?.nota.ancla?.tipo === "punto" && <NotaAbierta punto={abierta.nota.ancla} fotograma={fotograma} numero={abierta.numero} autor={abierta.nota.autor} texto={abierta.nota.texto} resuelta={abierta.nota.resuelta} />}
      {borrador && (
        <>
          <Chincheta pendiente style={{ left: `${borrador.x}%`, top: `${borrador.y}%` }} />
          <EscribirNota
            punto={borrador}
            fotograma={fotograma}
            onCancelar={() => setBorrador(null)}
            onGuardar={(texto) => {
              onAnotar?.(texto, { tipo: "punto", ...borrador, imagen: indice })
              setBorrador(null)
            }}
          />
        </>
      )}
    </div>
  )
}

/** Las notas de una versión que van en un segundo del vídeo, con su número. */
const notasEnVideo = (pins: Pin[]): NotaEnVideo[] =>
  pins.flatMap(({ nota, numero }) => (nota.ancla?.tipo === "segundo" ? [{ id: nota.id, numero, segundo: nota.ancla.segundo, x: nota.ancla.x, y: nota.ancla.y, autor: nota.autor, texto: nota.texto, resuelta: nota.resuelta }] : []))

function EtiquetaVersion({ version, estado, atenuada }: { version: VersionRevision; estado?: string; atenuada?: boolean }) {
  return (
    <p className={cn("mb-2 flex items-center gap-2 text-xs", atenuada && "opacity-60")}>
      <span className={cn("rounded-md px-1.5 py-0.5 font-semibold", atenuada ? "bg-muted" : "bg-brand text-brand-foreground")}>v{version.numero}</span>
      <span className="text-muted-foreground">
        {fmt.date(version.creadaEl)}
        {estado && ` · ${estado.toLowerCase()}`}
      </span>
    </p>
  )
}

export type PropsVisorMedia<V extends VersionRevision> = {
  version: V
  anterior?: V | null
  medio: "video" | "imagen"
  notas: NotaRevision[]
  seleccionada?: string | null
  onSeleccionar?: (id: string) => void
  /** Quien revisa: pulsar en una foto o en el vídeo abre ahí la caja de escribir la nota (en el vídeo, en ese segundo). */
  onAnotar?: Anotar
  /** En %, de 50 a 200. */
  zoom?: number
  /** El estado de una versión, en palabras («En revisión»), junto a su número. */
  estado?: (v: V) => string
  /** Clases del fondo de cada archivo mientras carga o si falta (`bg-muted` de serie; un tinte en un hijo). */
  fondo?: string
  className?: string
}

/**
 * El contenido de una versión sobre un lienzo de puntos, como en Feedback y Frame.io: las fotos (una o
 * un carrusel) o el vídeo con su reproductor, con las notas en su sitio. Quien revisa pulsa en la foto
 * o en el vídeo y escribe la nota ahí; elegir una nota la abre encima (en el vídeo, en su fotograma).
 * Con `anterior`, la versión previa al lado para comparar.
 */
export function VisorMedia<V extends VersionRevision>({ version, anterior, medio, notas, seleccionada, onSeleccionar, onAnotar, zoom = 100, estado, fondo = "bg-muted text-muted-foreground", className }: PropsVisorMedia<V>) {
  const pins: Pin[] = notas.map((nota, i) => ({ nota, numero: i + 1 }))
  const ancho = Math.round(300 * (zoom / 100))

  const contenido = (v: V, actual: boolean) => {
    const archivos = v.archivos ?? []
    const propios = actual ? pins : v.notas.map((nota, i) => ({ nota, numero: i + 1 }))
    const accion = actual ? { onSeleccionar, onAnotar, seleccionada } : {}
    return (
      <div key={v.id} className={cn("flex flex-col", !actual && "opacity-70 saturate-50")}>
        <EtiquetaVersion version={v} estado={estado?.(v)} atenuada={!actual} />
        <div className="flex gap-4">
          {archivos.length === 0 ? (
            <div style={{ width: ancho }} className={cn("grid aspect-[4/5] place-items-center rounded-lg text-xs", fondo)}>
              Sin archivo
            </div>
          ) : medio === "video" ? (
            <ReproductorNotas
              videoUrl={archivos[0].videoUrl}
              portadaUrl={archivos[0].url}
              duracion={archivos[0].duracion}
              ancho={ancho}
              fondo={fondo}
              notas={notasEnVideo(propios)}
              seleccionada={accion.seleccionada}
              onSeleccionar={accion.onSeleccionar}
              onAnotar={accion.onAnotar ? ({ segundo, x, y, texto }) => accion.onAnotar?.(texto, { tipo: "segundo", segundo, x, y }) : undefined}
            />
          ) : (
            archivos.map((a, i) => (
              <div key={`${a.nombre}-${i}`} className="flex flex-col gap-1.5">
                <FotoConNotas archivo={a} indice={i} pins={propios.filter((p) => p.nota.ancla?.tipo === "punto" && p.nota.ancla.imagen === i)} ancho={ancho} fondo={fondo} {...accion} />
                {archivos.length > 1 && <span className="text-center text-[11px] text-muted-foreground">{i + 1} de {archivos.length}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div data-slot="visor-media" className={cn("min-h-0 overflow-auto bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]", className)}>
      <div className="flex min-h-full w-max min-w-full items-center justify-center gap-10 p-3 sm:p-8">
        {anterior && contenido(anterior, false)}
        {contenido(version, true)}
      </div>
    </div>
  )
}
