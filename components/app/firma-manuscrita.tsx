"use client"

import * as React from "react"
import { EraserIcon, ImageUpIcon, PenLineIcon, TypeIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ZonaSubida } from "@/components/app/zona-subida"

type Modo = "dibujar" | "escribir" | "subir"

const ANCHO = 600
const ALTO = 200
/** La tinta de la firma: siempre oscura, porque va sobre el papel blanco del documento. */
const TINTA = "#1f2328"
const LETRA = '"Snell Roundhand", "Segoe Script", "Brush Script MT", "Apple Chancery", cursive'

/** El lienzo vacío, a la resolución de la pantalla. */
function prepararLienzo(c: HTMLCanvasElement) {
  const escala = window.devicePixelRatio || 1
  c.width = ANCHO * escala
  c.height = ALTO * escala
  const ctx = c.getContext("2d")
  if (!ctx) return null
  ctx.setTransform(escala, 0, 0, escala, 0, 0)
  ctx.clearRect(0, 0, ANCHO, ALTO)
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  ctx.lineWidth = 2.4
  ctx.strokeStyle = TINTA
  ctx.fillStyle = TINTA
  return ctx
}

/** El nombre con letra manuscrita, centrado y tan grande como quepa. Sin nombre, el recuadro queda limpio. */
function escribirNombre(c: HTMLCanvasElement, texto: string): boolean {
  const ctx = prepararLienzo(c)
  if (!ctx || !texto.trim()) return false
  let tamano = 64
  ctx.font = `${tamano}px ${LETRA}`
  while (ctx.measureText(texto).width > ANCHO - 48 && tamano > 24) ctx.font = `${(tamano -= 4)}px ${LETRA}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(texto.trim(), ANCHO / 2, ALTO / 2)
  return true
}

/** La firma ya hecha, recortada a ANCHO × ALTO, en PNG. */
const exportar = (c: HTMLCanvasElement) => {
  const salida = document.createElement("canvas")
  salida.width = ANCHO
  salida.height = ALTO
  salida.getContext("2d")?.drawImage(c, 0, 0, ANCHO, ALTO)
  return salida.toDataURL("image/png")
}

/**
 * Añadir una firma a un documento: dibujarla con el dedo o el ratón, escribir el nombre con letra manuscrita o subir
 * una imagen. Devuelve la firma como imagen PNG (data URL) en `onChange`, o `null` mientras no hay ninguna. El
 * recuadro va siempre en claro: la firma se pone sobre el papel.
 */
export function FirmaManuscrita({ nombre = "", onChange, desactivada, className }: { nombre?: string; onChange: (imagen: string | null) => void; desactivada?: boolean; className?: string }) {
  const lienzo = React.useRef<HTMLCanvasElement>(null)
  const trazando = React.useRef(false)
  const [modo, setModo] = React.useState<Modo>("dibujar")
  const [escrito, setEscrito] = React.useState(nombre)
  const [hay, setHay] = React.useState(false)
  // La página puede pasar una función nueva en cada render: el recuadro no se vuelve a pintar por eso.
  const avisar = React.useRef(onChange)
  React.useEffect(() => {
    avisar.current = onChange
  })

  const limpiar = () => {
    if (lienzo.current) prepararLienzo(lienzo.current)
    setHay(false)
    avisar.current(null)
  }

  React.useEffect(() => {
    if (lienzo.current) prepararLienzo(lienzo.current)
  }, [])

  /** El recuadro limpio y, al escribir, el nombre con letra manuscrita. */
  const pintar = (m: Modo, texto: string) => {
    const c = lienzo.current
    if (!c) return
    if (m === "escribir" && escribirNombre(c, texto)) {
      setHay(true)
      avisar.current(exportar(c))
    } else {
      prepararLienzo(c)
      setHay(false)
      avisar.current(null)
    }
  }
  const cambiarModo = (m: Modo) => {
    setModo(m)
    pintar(m, escrito)
  }
  const escribir = (texto: string) => {
    setEscrito(texto)
    pintar("escribir", texto)
  }

  const punto = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * ANCHO, y: ((e.clientY - r.top) / r.height) * ALTO }
  }
  const empezar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (modo !== "dibujar" || desactivada) return
    const ctx = e.currentTarget.getContext("2d")
    if (!ctx) return
    e.currentTarget.setPointerCapture(e.pointerId)
    trazando.current = true
    const p = punto(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }
  const mover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!trazando.current) return
    const ctx = e.currentTarget.getContext("2d")
    const p = punto(e)
    ctx?.lineTo(p.x, p.y)
    ctx?.stroke()
  }
  const terminar = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!trazando.current) return
    trazando.current = false
    setHay(true)
    avisar.current(exportar(e.currentTarget))
  }

  const subir = ([archivo]: File[]) => {
    if (!archivo || !lienzo.current) return
    const url = URL.createObjectURL(archivo)
    const img = new Image()
    img.onload = () => {
      const c = lienzo.current
      const ctx = c && prepararLienzo(c)
      if (c && ctx) {
        const escala = Math.min((ANCHO - 24) / img.width, (ALTO - 24) / img.height, 1)
        const w = img.width * escala
        const h = img.height * escala
        ctx.drawImage(img, (ANCHO - w) / 2, (ALTO - h) / 2, w, h)
        setHay(true)
        avisar.current(exportar(c))
      }
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  return (
    <div data-slot="firma-manuscrita" className={cn("flex flex-col gap-2", className)}>
      <Tabs value={modo} onValueChange={(v) => cambiarModo(v as Modo)}>
        <TabsList className="w-full">
          <TabsTrigger value="dibujar" disabled={desactivada}>
            <PenLineIcon /> Dibujar
          </TabsTrigger>
          <TabsTrigger value="escribir" disabled={desactivada}>
            <TypeIcon /> Escribir
          </TabsTrigger>
          <TabsTrigger value="subir" disabled={desactivada}>
            <ImageUpIcon /> Imagen
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {modo === "escribir" && <Input aria-label="Tu nombre para la firma" placeholder="Tu nombre" value={escrito} onChange={(e) => escribir(e.target.value)} disabled={desactivada} />}
      {modo === "subir" && !hay && <ZonaSubida compacta accept="image/png,image/jpeg" onArchivos={subir} titulo="Sube la imagen de tu firma" ayuda="PNG o JPG" desactivada={desactivada} />}
      <div className={cn("theme-light relative overflow-hidden rounded-lg border border-dashed border-input bg-card", modo === "subir" && !hay && "hidden")}>
        <canvas
          ref={lienzo}
          aria-label={modo === "dibujar" ? "Dibuja tu firma" : "Tu firma"}
          className={cn("block aspect-[3/1] w-full touch-none", modo === "dibujar" && !desactivada && "cursor-crosshair")}
          onPointerDown={empezar}
          onPointerMove={mover}
          onPointerUp={terminar}
          onPointerLeave={terminar}
        />
        {!hay && modo === "dibujar" && <span className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-muted-foreground">Firma aquí</span>}
        <span className="pointer-events-none absolute inset-x-6 bottom-8 border-b border-border" aria-hidden />
        {hay && !desactivada && (
          <Button type="button" variant="ghost" size="sm" className="absolute top-1.5 right-1.5 h-7 text-xs text-muted-foreground" onClick={limpiar}>
            <EraserIcon /> Borrar
          </Button>
        )}
      </div>
    </div>
  )
}
