"use client"

import * as React from "react"
import Image from "next/image"
import { PauseIcon, PlayIcon, Volume2Icon, VolumeXIcon } from "lucide-react"
import { cn } from "cn"
import { notasEnFotograma, puntoEnCaja, segundoDeNota } from "@/lib/notas-medio"
import { Button } from "@/components/ui/button"
import { Chincheta, EscribirNota, NotaAbierta } from "@/components/app/notas-medio"

/** Un segundo como «1:05». */
const tiempo = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`

/** Una nota del vídeo: su segundo y, si se dejó sobre el fotograma, su punto (en %). */
export type NotaEnVideo = { id: string; numero: number; segundo: number; x?: number; y?: number; autor: string; texto: string; resuelta: boolean }

/** Dónde se pinta una nota sin punto (de antes de poder pulsar en el fotograma): abajo, en el centro. */
const SIN_PUNTO = { x: 50, y: 82 }

/** Proporción de un vídeo vertical (reel, story, TikTok): alto / ancho. */
const VERTICAL = 16 / 9

export type PropsReproductorNotas = {
  videoUrl?: string
  /** La portada, mientras carga o si no hay vídeo. */
  portadaUrl?: string
  /** En segundos, hasta que el vídeo diga la suya. */
  duracion?: number
  /** Ancho del vídeo, en px. */
  ancho: number
  /** Clases del fondo mientras carga o si falta. */
  fondo?: string
  notas: NotaEnVideo[]
  seleccionada?: string | null
  /** Abrir una nota (desde su chincheta o su marca en la línea). Elegirla desde fuera para el vídeo en su fotograma. */
  onSeleccionar?: (id: string) => void
  /** Quien revisa: pulsar en el vídeo lo para y deja escribir una nota en ese segundo y ese punto. */
  onAnotar?: (nota: { segundo: number; x: number; y: number; texto: string }) => void
}

/**
 * El vídeo como en Frame.io: reproductor con play y pausa, la línea de tiempo con las notas y, para
 * quien revisa, pulsar en un punto del vídeo lo para y abre ahí una nota; al guardarla con el tick,
 * el vídeo sigue si estaba en marcha. Parado, se ven las notas de ese fotograma; elegir una nota (en
 * la conversación o en la línea) lleva el vídeo a su fotograma y la abre encima.
 */
export function ReproductorNotas({ videoUrl, portadaUrl, duracion: duracionDada, ancho, fondo = "bg-muted text-muted-foreground", notas, seleccionada, onSeleccionar, onAnotar }: PropsReproductorNotas) {
  const video = React.useRef<HTMLVideoElement>(null)
  const linea = React.useRef<HTMLDivElement>(null)
  const [actual, setActual] = React.useState(0)
  const [duracionVideo, setDuracionVideo] = React.useState<number | null>(null)
  const [reproduciendo, setReproduciendo] = React.useState(false)
  const [silencio, setSilencio] = React.useState(false)
  const [borrador, setBorrador] = React.useState<{ segundo: number; x: number; y: number; seguir: boolean } | null>(null)
  const duracion = duracionVideo ?? duracionDada ?? 30
  const fotograma = { ancho, alto: ancho * VERTICAL }
  const elegida = notas.find((n) => n.id === seleccionada)
  const enPantalla = reproduciendo || borrador ? [] : notasEnFotograma(notas, actual)
  const abierta = elegida && enPantalla.some((n) => n.id === elegida.id) ? elegida : null

  // Elegir una nota desde fuera (la conversación) para el vídeo en su fotograma.
  const segundoElegido = elegida?.segundo
  React.useEffect(() => {
    const v = video.current
    if (!v || segundoElegido === undefined) return
    v.pause()
    v.currentTime = segundoElegido
  }, [seleccionada, segundoElegido])

  // La duración del vídeo (si se cargó antes de que la página respondiera, se lee al reproducir o moverse).
  const leerDuracion = (v: HTMLVideoElement) => {
    if (Number.isFinite(v.duration) && v.duration > 0) setDuracionVideo(v.duration)
  }
  const ir = (s: number) => {
    const destino = Math.min(duracion, Math.max(0, s))
    setActual(destino)
    if (video.current) video.current.currentTime = destino
  }
  const alternar = () => {
    const v = video.current
    if (!v) return
    if (v.paused) void v.play()
    else v.pause()
  }

  const pulsarFotograma = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onAnotar) return alternar()
    const v = video.current
    const punto = puntoEnCaja(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY)
    // Con una nota a medias, pulsar en otro sitio la cambia de sitio sin perder lo escrito.
    if (borrador) return setBorrador({ ...borrador, ...punto })
    const seguir = Boolean(v && !v.paused)
    v?.pause()
    setBorrador({ segundo: segundoDeNota(v?.currentTime ?? actual), ...punto, seguir })
  }
  const cerrarBorrador = () => {
    if (borrador?.seguir) void video.current?.play()
    setBorrador(null)
  }

  const segundoEn = (clientX: number) => {
    const r = linea.current?.getBoundingClientRect()
    return r ? ((clientX - r.left) / r.width) * duracion : actual
  }

  return (
    <div style={{ width: ancho }} className="flex max-w-full flex-none flex-col gap-2">
      <div className={cn("relative aspect-[9/16] overflow-hidden rounded-xl shadow-pop", fondo)}>
        {videoUrl ? (
          <video
            ref={video}
            src={videoUrl}
            poster={portadaUrl}
            muted={silencio}
            className="size-full object-cover"
            onLoadedMetadata={(e) => leerDuracion(e.currentTarget)}
            onTimeUpdate={(e) => {
              setActual(e.currentTarget.currentTime)
              leerDuracion(e.currentTarget)
            }}
            onPlay={(e) => {
              setReproduciendo(true)
              leerDuracion(e.currentTarget)
            }}
            onPause={() => setReproduciendo(false)}
            playsInline
          />
        ) : (
          portadaUrl && <Image src={portadaUrl} alt="" fill sizes={`${ancho}px`} className="object-cover" />
        )}
        <div onClick={pulsarFotograma} aria-hidden className={cn("absolute inset-0", onAnotar ? "cursor-crosshair" : "cursor-pointer")} />
        {!reproduciendo && actual === 0 && !borrador && videoUrl && (
          <button type="button" onClick={alternar} aria-label="Reproducir" className="absolute inset-0 m-auto grid size-14 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <PlayIcon className="ml-0.5 size-6 fill-current" />
          </button>
        )}
        {enPantalla.map((n) => (
          <Chincheta key={n.id} numero={n.numero} resuelta={n.resuelta} activa={n.id === seleccionada} onClick={() => onSeleccionar?.(n.id)} style={{ left: `${n.x ?? SIN_PUNTO.x}%`, top: `${n.y ?? SIN_PUNTO.y}%` }} />
        ))}
        {abierta && <NotaAbierta punto={{ x: abierta.x ?? SIN_PUNTO.x, y: abierta.y ?? SIN_PUNTO.y }} fotograma={fotograma} numero={abierta.numero} autor={abierta.autor} texto={abierta.texto} contexto={tiempo(abierta.segundo)} resuelta={abierta.resuelta} />}
        {borrador && (
          <>
            <Chincheta pendiente style={{ left: `${borrador.x}%`, top: `${borrador.y}%` }} />
            <EscribirNota
              key={`${borrador.segundo}`}
              punto={borrador}
              fotograma={fotograma}
              contexto={`Nota en ${tiempo(borrador.segundo)}`}
              onCancelar={cerrarBorrador}
              onGuardar={(texto) => {
                onAnotar?.({ segundo: borrador.segundo, x: borrador.x, y: borrador.y, texto })
                cerrarBorrador()
              }}
            />
          </>
        )}
        <span className="pointer-events-none absolute top-2.5 right-2.5 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-xs text-white">{tiempo(actual)}</span>
      </div>

      <div
        ref={linea}
        role="slider"
        tabIndex={0}
        aria-label="Línea de tiempo"
        aria-valuemin={0}
        aria-valuemax={Math.round(duracion)}
        aria-valuenow={Math.round(actual)}
        aria-valuetext={tiempo(actual)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId)
          ir(segundoEn(e.clientX))
        }}
        onPointerMove={(e) => e.currentTarget.hasPointerCapture(e.pointerId) && ir(segundoEn(e.clientX))}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault()
            ir(actual + (e.key === "ArrowLeft" ? -1 : 1))
          }
        }}
        className="relative h-2.5 cursor-pointer touch-none rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="absolute inset-y-0 left-0 rounded-full bg-foreground/20" style={{ width: `${(actual / duracion) * 100}%` }} />
        {notas.map((n) => (
          <button
            key={n.id}
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onSeleccionar?.(n.id)}
            aria-label={`Nota ${n.numero} en ${tiempo(n.segundo)}`}
            style={{ left: `${Math.min(100, (n.segundo / duracion) * 100)}%` }}
            className={cn("absolute top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-card", n.resuelta ? "bg-success" : "bg-brand", seleccionada === n.id && "scale-125")}
          >
            {n.numero}
          </button>
        ))}
        {borrador && <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-brand bg-card" style={{ left: `${(borrador.segundo / duracion) * 100}%` }} />}
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon-sm" onClick={alternar} disabled={!videoUrl} aria-label={reproduciendo ? "Pausa" : "Reproducir"}>
          {reproduciendo ? <PauseIcon className="fill-current" /> : <PlayIcon className="fill-current" />}
        </Button>
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {tiempo(actual)} / {tiempo(duracion)}
        </span>
        <Button variant="ghost" size="icon-sm" className="ml-auto" onClick={() => setSilencio((s) => !s)} disabled={!videoUrl} aria-label={silencio ? "Activar el sonido" : "Silenciar"}>
          {silencio ? <VolumeXIcon /> : <Volume2Icon />}
        </Button>
      </div>
    </div>
  )
}
