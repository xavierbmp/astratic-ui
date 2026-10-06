"use client"

import * as React from "react"
import Image from "next/image"
import { PauseIcon, PlayIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { ESTADOS_VERSION, estadoDe, type AnclaNota, type ArchivoVersion, type Nota, type Version } from "@/lib/influencer/modelo"
import { tintClass, type Tint } from "@/lib/influencer/tints"
import { segundos } from "@/components/influencer/conversacion"

type Pin = { nota: Nota; numero: number }

function Chincheta({ numero, resuelta, activa, pendiente, onClick, style }: { numero?: number; resuelta?: boolean; activa?: boolean; pendiente?: boolean; onClick?: () => void; style: React.CSSProperties }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      style={style}
      aria-label={pendiente ? "Nueva nota aquí" : `Nota ${numero}`}
      className={cn(
        "absolute z-10 grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full rounded-bl-none text-xs font-semibold text-white shadow-pop ring-2 ring-white transition-transform hover:scale-110",
        pendiente ? "border-2 border-dashed border-white bg-brand/60" : resuelta ? "bg-success" : "bg-brand",
        activa && "scale-110 ring-4",
      )}
    >
      {numero}
    </button>
  )
}

/** Una foto con sus notas clavadas donde las dejó la marca; pulsar en ella propone una nota ahí. */
function FotoConNotas({ archivo, indice, pins, pendiente, seleccionada, onSeleccionar, onMarcar, ancho, tint }: { archivo: ArchivoVersion; indice: number; pins: Pin[]; pendiente?: AnclaNota | null; seleccionada?: string | null; onSeleccionar?: (id: string) => void; onMarcar?: (a: AnclaNota) => void; ancho: number; tint: Tint }) {
  const marcar = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMarcar) return
    const r = e.currentTarget.getBoundingClientRect()
    onMarcar({ tipo: "punto", x: Math.round(((e.clientX - r.left) / r.width) * 100), y: Math.round(((e.clientY - r.top) / r.height) * 100), imagen: indice })
  }
  return (
    <div onClick={marcar} style={{ width: ancho }} className={cn("relative aspect-[4/5] flex-none overflow-hidden rounded-lg shadow-pop", tintClass[tint], onMarcar && "cursor-crosshair")}>
      {archivo.url && <Image src={archivo.url} alt={archivo.nombre} fill sizes={`${ancho}px`} className="object-cover" unoptimized={archivo.url.startsWith("blob:")} />}
      {pins.map((p) => p.nota.ancla?.tipo === "punto" && <Chincheta key={p.nota.id} numero={p.numero} resuelta={p.nota.resuelta} activa={seleccionada === p.nota.id} onClick={() => onSeleccionar?.(p.nota.id)} style={{ left: `${p.nota.ancla.x}%`, top: `${p.nota.ancla.y}%` }} />)}
      {pendiente?.tipo === "punto" && pendiente.imagen === indice && <Chincheta pendiente style={{ left: `${pendiente.x}%`, top: `${pendiente.y}%` }} />}
    </div>
  )
}

/**
 * El vídeo con su línea de tiempo: se reproduce si hay archivo (en el portal, de R2), y las notas
 * van como marcas en su segundo. Pulsar en la línea propone una nota en ese segundo.
 */
function VideoConNotas({ archivo, pins, pendiente, seleccionada, onSeleccionar, onMarcar, ancho, tint }: { archivo: ArchivoVersion; pins: Pin[]; pendiente?: AnclaNota | null; seleccionada?: string | null; onSeleccionar?: (id: string) => void; onMarcar?: (a: AnclaNota) => void; ancho: number; tint: Tint }) {
  const video = React.useRef<HTMLVideoElement>(null)
  const [actual, setActual] = React.useState(0)
  const [reproduciendo, setReproduciendo] = React.useState(false)
  const duracion = archivo.duracion ?? 30
  const enSegundo = pins.flatMap((p) => (p.nota.ancla?.tipo === "segundo" ? [{ ...p, segundo: p.nota.ancla.segundo }] : []))

  const ir = (s: number) => {
    setActual(s)
    if (video.current) video.current.currentTime = s
  }
  const pulsarLinea = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const s = Math.min(duracion, Math.max(0, Math.round(((e.clientX - r.left) / r.width) * duracion)))
    ir(s)
    onMarcar?.({ tipo: "segundo", segundo: s })
  }
  const alternar = () => {
    const v = video.current
    if (!v) return
    if (v.paused) void v.play()
    else v.pause()
  }

  return (
    <div style={{ width: ancho }} className="flex flex-none flex-col gap-2">
      <div className={cn("relative aspect-[9/16] overflow-hidden rounded-xl shadow-pop", tintClass[tint])}>
        {archivo.videoUrl ? (
          <video ref={video} src={archivo.videoUrl} poster={archivo.url} className="size-full object-cover" onTimeUpdate={(e) => setActual(e.currentTarget.currentTime)} onPlay={() => setReproduciendo(true)} onPause={() => setReproduciendo(false)} playsInline />
        ) : (
          archivo.url && <Image src={archivo.url} alt="" fill sizes={`${ancho}px`} className="object-cover" />
        )}
        <button type="button" onClick={alternar} disabled={!archivo.videoUrl} aria-label={reproduciendo ? "Pausa" : "Reproducir"} title={archivo.videoUrl ? undefined : "En el portal se reproduce el archivo subido"} className={cn("absolute inset-0 m-auto grid size-14 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-opacity", reproduciendo && "opacity-0 hover:opacity-100")}>
          {reproduciendo ? <PauseIcon className="size-6 fill-current" /> : <PlayIcon className="ml-0.5 size-6 fill-current" />}
        </button>
        <span className="absolute top-2.5 right-2.5 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-xs text-white">{segundos(actual)}</span>
      </div>
      <div onClick={pulsarLinea} role="slider" aria-label="Línea de tiempo" aria-valuemin={0} aria-valuemax={duracion} aria-valuenow={Math.round(actual)} tabIndex={0} className={cn("relative h-2.5 rounded-full bg-muted", onMarcar && "cursor-crosshair")}>
        <span className="absolute inset-y-0 left-0 rounded-full bg-foreground/15" style={{ width: `${(actual / duracion) * 100}%` }} />
        {enSegundo.map((p) => (
          <button
            key={p.nota.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              ir(p.segundo)
              onSeleccionar?.(p.nota.id)
            }}
            aria-label={`Nota ${p.numero} en ${segundos(p.segundo)}`}
            style={{ left: `${(p.segundo / duracion) * 100}%` }}
            className={cn("absolute top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[10px] font-semibold text-white ring-2 ring-card", p.nota.resuelta ? "bg-success" : "bg-brand", seleccionada === p.nota.id && "scale-125")}
          >
            {p.numero}
          </button>
        ))}
        {pendiente?.tipo === "segundo" && <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-brand bg-card" style={{ left: `${(pendiente.segundo / duracion) * 100}%` }} />}
      </div>
      <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
        <span>0:00</span>
        <span>{segundos(duracion)}</span>
      </div>
    </div>
  )
}

function EtiquetaVersion({ version, atenuada }: { version: Version; atenuada?: boolean }) {
  const e = estadoDe(ESTADOS_VERSION, version.estado)
  return (
    <p className={cn("mb-2 flex items-center gap-2 text-xs", atenuada && "opacity-60")}>
      <span className={cn("rounded-md px-1.5 py-0.5 font-semibold", atenuada ? "bg-muted" : "bg-brand text-brand-foreground")}>v{version.numero}</span>
      <span className="text-muted-foreground">
        {fmt.date(version.creadaEl)} · {e.label.toLowerCase()}
      </span>
    </p>
  )
}

/**
 * El contenido de una versión sobre un lienzo de puntos, como en Feedback: las fotos (una o un
 * carrusel) o el vídeo, con las notas en su sitio. Con `anterior`, la versión previa al lado para
 * comparar. `zoom` en %, de 50 a 200.
 */
export function VisorMedia({ version, anterior, medio, notas, seleccionada, onSeleccionar, onMarcar, marcaPendiente, zoom = 100, tint, className }: { version: Version; anterior?: Version | null; medio: "video" | "imagen"; notas: Nota[]; seleccionada?: string | null; onSeleccionar?: (id: string) => void; onMarcar?: (a: AnclaNota) => void; marcaPendiente?: AnclaNota | null; zoom?: number; tint: Tint; className?: string }) {
  const pins: Pin[] = notas.map((nota, i) => ({ nota, numero: i + 1 }))
  const ancho = Math.round((medio === "video" ? 260 : 300) * (zoom / 100))

  const contenido = (v: Version, actual: boolean) => {
    const archivos = v.archivos ?? []
    const propios = actual ? pins : v.notas.map((nota, i) => ({ nota, numero: i + 1 }))
    const accion = actual ? { onSeleccionar, onMarcar, pendiente: marcaPendiente, seleccionada } : {}
    return (
      <div key={v.id} className={cn("flex flex-col", !actual && "opacity-70 saturate-50")}>
        <EtiquetaVersion version={v} atenuada={!actual} />
        <div className="flex gap-4">
          {archivos.length === 0 ? (
            <div style={{ width: ancho }} className={cn("grid aspect-[4/5] place-items-center rounded-lg text-xs", tintClass[tint])}>
              Sin archivo
            </div>
          ) : medio === "video" ? (
            <VideoConNotas archivo={archivos[0]} pins={propios} ancho={ancho} tint={tint} {...accion} />
          ) : (
            archivos.map((a, i) => (
              <div key={`${a.nombre}-${i}`} className="flex flex-col gap-1.5">
                <FotoConNotas archivo={a} indice={i} pins={propios.filter((p) => p.nota.ancla?.tipo === "punto" && p.nota.ancla.imagen === i)} ancho={ancho} tint={tint} {...accion} />
                {archivos.length > 1 && <span className="text-center text-[11px] text-muted-foreground">{i + 1} de {archivos.length}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div data-slot="ws-visor-media" className={cn("min-h-0 overflow-auto bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]", className)}>
      <div className="flex min-h-full w-max min-w-full items-center justify-center gap-10 p-8">
        {anterior && contenido(anterior, false)}
        {contenido(version, true)}
      </div>
    </div>
  )
}
