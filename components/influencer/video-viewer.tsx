"use client"

import * as React from "react"
import Image from "next/image"
import { PlayIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import type { Nota, Version } from "@/lib/influencer/modelo"
import { tintClass, type Tint } from "@/lib/influencer/tints"

export function segundos(s: number) {
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`
}

/**
 * El vídeo con sus notas por segundo: el fotograma, la barra de tiempo con una marca por nota y, si
 * se pasa `onMarcarSegundo`, pulsar en la barra propone una nota en ese segundo.
 */
export function VideoViewer({ version, notas, tint, seleccionada, onSeleccionar, onMarcarSegundo, segundoMarcado, className }: { version: Version; notas: Nota[]; tint: Tint; seleccionada?: string | null; onSeleccionar?: (id: string) => void; onMarcarSegundo?: (segundo: number) => void; segundoMarcado?: number | null; className?: string }) {
  const barra = React.useRef<HTMLDivElement>(null)
  const archivo = version.archivo
  const duracion = archivo?.duracion ?? 30
  const pins = notas.flatMap((nota, i) => (nota.ancla?.tipo === "segundo" ? [{ nota, numero: i + 1, segundo: nota.ancla.segundo }] : []))
  const posicion = seleccionada ? pins.find((p) => p.nota.id === seleccionada)?.segundo : segundoMarcado

  const marcar = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onMarcarSegundo || !barra.current) return
    const r = barra.current.getBoundingClientRect()
    const s = Math.round(((e.clientX - r.left) / r.width) * duracion)
    onMarcarSegundo(Math.min(duracion, Math.max(0, s)))
  }

  return (
    <div data-slot="ws-video" className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn("relative aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-2xl", tintClass[tint])}>
        {archivo?.posterUrl && <Image src={archivo.posterUrl} alt="" fill sizes="300px" className="object-cover" />}
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-14 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm">
            <PlayIcon className="ml-0.5 size-6 fill-current" />
          </span>
        </span>
        {posicion !== undefined && posicion !== null && <span className="absolute top-3 right-3 rounded-md bg-black/60 px-1.5 py-0.5 font-mono text-xs text-white">{segundos(posicion)}</span>}
        {pins.map((p) => (
          <button
            key={p.nota.id}
            type="button"
            onClick={() => onSeleccionar?.(p.nota.id)}
            aria-label={`Nota ${p.numero} en el segundo ${p.segundo}`}
            // Las marcas van en un carril a la derecha del fotograma, de arriba abajo según el segundo: no tapan el centro.
            style={{ top: `${8 + (p.segundo / duracion) * 78}%`, left: "82%" }}
            className={cn("absolute grid size-7 place-items-center rounded-full text-xs font-semibold text-white shadow-pop ring-2 ring-white transition-transform hover:scale-110", p.nota.resuelta ? "bg-success" : "bg-brand", seleccionada === p.nota.id && "scale-110 ring-4")}
          >
            {p.numero}
          </button>
        ))}
      </div>
      <div className="w-full max-w-[300px]">
        <div ref={barra} onClick={marcar} className={cn("relative h-2 rounded-full bg-muted", onMarcarSegundo && "cursor-crosshair")} role={onMarcarSegundo ? "slider" : undefined} aria-label="Línea de tiempo">
          {posicion !== undefined && posicion !== null && <span className="absolute top-1/2 h-4 w-0.5 -translate-y-1/2 rounded bg-foreground" style={{ left: `${(posicion / duracion) * 100}%` }} />}
          {pins.map((p) => (
            <button
              key={p.nota.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onSeleccionar?.(p.nota.id)
              }}
              aria-label={`Nota ${p.numero}`}
              style={{ left: `${(p.segundo / duracion) * 100}%` }}
              className={cn("absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card", p.nota.resuelta ? "bg-success" : "bg-brand")}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>0:00</span>
          <span>{segundos(duracion)}</span>
        </div>
        {archivo && (
          <p className="mt-1 truncate text-center text-xs text-muted-foreground">
            {archivo.nombre} · {fmt.bytes(archivo.tamano)}
          </p>
        )}
      </div>
    </div>
  )
}
