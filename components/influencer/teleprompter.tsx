"use client"

import * as React from "react"
import { FlipHorizontal2Icon, MinusIcon, PauseIcon, PlayIcon, PlusIcon, RotateCcwIcon } from "lucide-react"
import { cn } from "cn"
import { textoPlano } from "@/lib/influencer/guion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"

const TAMANOS = ["text-2xl", "text-3xl", "text-4xl", "text-5xl"] as const
/** Píxeles por segundo en la velocidad 1; la 10 es diez veces más rápida. */
const PIXELES_POR_SEGUNDO = 12

/**
 * El guion a pantalla completa para leerlo mientras graba, desde otro dispositivo (el ordenador o
 * una tablet junto al móvil): se desplaza solo, con su velocidad y su tamaño de letra, y en espejo
 * para los teleprompters de cristal. Espacio para empezar o parar, flechas para la velocidad.
 */
export function Teleprompter({ open, onOpenChange, titulo, guion }: { open: boolean; onOpenChange: (open: boolean) => void; titulo: string; guion: string }) {
  const [andando, setAndando] = React.useState(false)
  const [velocidad, setVelocidad] = React.useState(4)
  const [tamano, setTamano] = React.useState(2)
  const [espejo, setEspejo] = React.useState(false)
  const caja = React.useRef<HTMLDivElement>(null)
  const parrafos = textoPlano(guion).split("\n").filter((p) => p.trim())

  // El desplazamiento va al ritmo de la pantalla: un efecto que solo existe mientras anda.
  React.useEffect(() => {
    if (!andando) return
    let anterior = performance.now()
    let marco = requestAnimationFrame(function paso(ahora) {
      const el = caja.current
      if (!el) return
      el.scrollTop += (velocidad * PIXELES_POR_SEGUNDO * (ahora - anterior)) / 1000
      anterior = ahora
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) return setAndando(false)
      marco = requestAnimationFrame(paso)
    })
    return () => cancelAnimationFrame(marco)
  }, [andando, velocidad])

  const alTeclado = (e: React.KeyboardEvent) => {
    if (e.key === " ") {
      e.preventDefault()
      setAndando((a) => !a)
    }
    if (e.key === "ArrowUp" || e.key === "ArrowRight") setVelocidad((v) => Math.min(10, v + 1))
    if (e.key === "ArrowDown" || e.key === "ArrowLeft") setVelocidad((v) => Math.max(1, v - 1))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setAndando(false)
        onOpenChange(o)
      }}
    >
      <DialogContent onKeyDown={alTeclado} className="flex h-dvh w-screen max-w-none flex-col gap-0 rounded-none border-0 bg-foreground p-0 text-background sm:max-w-none">
        <DialogTitle className="sr-only">Teleprompter: {titulo}</DialogTitle>
        <DialogDescription className="sr-only">Espacio para empezar o parar y flechas para la velocidad.</DialogDescription>
        <div ref={caja} className="relative min-h-0 flex-1 overflow-y-auto px-6 md:px-24">
          {/* La línea de lectura: lo que hay que decir ahora va a la altura de los ojos, cerca de la cámara. */}
          <div className="pointer-events-none sticky top-[28%] z-10 -mb-px h-px bg-background/30" aria-hidden />
          <div className={cn("mx-auto max-w-4xl py-[30vh] leading-snug font-semibold", TAMANOS[tamano], espejo && "-scale-x-100")}>
            {parrafos.length ? parrafos.map((p, i) => <p key={i} className="mb-8">{p}</p>) : <p className="opacity-60">Escribe el guion para leerlo aquí.</p>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-background/15 p-3 pr-14">
          <Button size="sm" variant="secondary" onClick={() => setAndando((a) => !a)}>
            {andando ? <PauseIcon /> : <PlayIcon />} {andando ? "Parar" : "Empezar"}
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label="Volver al principio"
            className="text-background hover:bg-background/10 hover:text-background"
            onClick={() => {
              setAndando(false)
              caja.current?.scrollTo({ top: 0 })
            }}
          >
            <RotateCcwIcon />
          </Button>
          <label className="flex items-center gap-2 text-xs">
            Velocidad
            <Slider value={[velocidad]} min={1} max={10} step={1} onValueChange={([v]) => setVelocidad(v)} className="w-28" aria-label="Velocidad" />
            <span className="w-4 tabular-nums">{velocidad}</span>
          </label>
          <span className="flex items-center gap-1 text-xs">
            Letra
            <Button size="icon-sm" variant="ghost" aria-label="Letra más pequeña" className="text-background hover:bg-background/10 hover:text-background" onClick={() => setTamano((t) => Math.max(0, t - 1))}>
              <MinusIcon />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Letra más grande" className="text-background hover:bg-background/10 hover:text-background" onClick={() => setTamano((t) => Math.min(TAMANOS.length - 1, t + 1))}>
              <PlusIcon />
            </Button>
          </span>
          <Button size="sm" variant="ghost" aria-pressed={espejo} className={cn("text-background hover:bg-background/10 hover:text-background", espejo && "bg-background/15")} onClick={() => setEspejo((v) => !v)}>
            <FlipHorizontal2Icon /> Espejo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
