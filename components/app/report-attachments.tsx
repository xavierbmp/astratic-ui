"use client"

// Imágenes de `ReportButton`: capturas o referencias de cómo se quiere algo (botón, ⌘V o arrastrar) y los
// lienzos marcados sobre la página. Se reducen en el navegador antes de enviarlas: un reporte pesa poco.

import * as React from "react"
import { ImagePlusIcon, PencilRulerIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export type ReportRect = { x: number; y: number; width: number; height: number }

/** Un elemento que se ha movido, cambiado de tamaño o quitado en el lienzo. */
export type ReportCanvasChange = {
  element: { selector: string; path: string; tag: string; text: string }
  from: ReportRect
  /** Dónde se quiere; `null` si se quiere quitar. */
  to: ReportRect | null
}

/** Lo que se ha marcado en un lienzo, además de su imagen. */
export type ReportCanvasData = {
  /** La página en la que se marcó, con la query. */
  url: string
  viewport: string
  changes: ReportCanvasChange[]
  /** Los textos escritos encima. */
  notes: string[]
  /** Cuántos trazos se han dibujado (flechas, lápiz, rectángulos). */
  marks: number
}

export type ReportAttachment = {
  kind: "image" | "canvas"
  name: string
  /** La imagen en data URL (WebP, PNG o JPEG), ya reducida. */
  dataUrl: string
  canvas?: ReportCanvasData
}

/** Un adjunto ya guardado, en la pestaña «Enviados». */
export type ReportAttachmentLink = { kind: ReportAttachment["kind"]; name: string; url: string }

export const MAX_ATTACHMENTS = 6
/** El reporte entero viaja en una petición de 4 MB como mucho. */
const MAX_TOTAL_CHARS = 3_500_000
const MAX_SIDE = 2000

/** Pasa un lienzo de dibujo a data URL en WebP; donde el navegador no sabe hacer WebP (Safari), en JPEG. */
export function canvasToDataUrl(canvas: HTMLCanvasElement) {
  const webp = canvas.toDataURL("image/webp", 0.85)
  return webp.startsWith("data:image/webp") ? webp : canvas.toDataURL("image/jpeg", 0.88)
}

/** Reduce la imagen a 2.000 px de lado como mucho. */
async function shrinkImage(file: Blob): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvasToDataUrl(canvas)
}

/** Las imágenes de un archivo, del portapapeles o de lo que se arrastra. */
export function imageFiles(list: FileList | null | undefined): File[] {
  return Array.from(list ?? []).filter((f) => f.type.startsWith("image/"))
}

type Item = ReportAttachment & { id: number }

let nextId = 0

/** Los adjuntos del borrador, con sus límites de número y de peso. */
export function useAttachments() {
  const [items, setItems] = React.useState<Item[]>([])
  // Copia síncrona: varias imágenes seguidas (pegar o arrastrar varias) cuentan con las anteriores.
  const current = React.useRef<Item[]>([])
  const update = React.useCallback((next: Item[]) => {
    current.current = next
    setItems(next)
  }, [])

  const push = React.useCallback(
    (a: ReportAttachment) => {
      const prev = current.current
      if (prev.length >= MAX_ATTACHMENTS) return void toast.error(`Como mucho ${MAX_ATTACHMENTS} imágenes por reporte.`)
      if (prev.reduce((n, i) => n + i.dataUrl.length, a.dataUrl.length) > MAX_TOTAL_CHARS)
        return void toast.error("Las imágenes pesan demasiado juntas: quita alguna antes de añadir otra.")
      update([...prev, { ...a, id: nextId++ }])
    },
    [update],
  )

  const addFiles = React.useCallback(
    async (files: File[]) => {
      for (const file of files) {
        try {
          const name = file.name.replace(/\.[^.]+$/, "") || "Imagen"
          push({ kind: "image", name, dataUrl: await shrinkImage(file) })
        } catch {
          toast.error(`No se ha podido leer «${file.name}». Prueba con un PNG o un JPG.`)
        }
      }
    },
    [push],
  )

  const remove = React.useCallback((id: number) => update(current.current.filter((i) => i.id !== id)), [update])
  const clear = React.useCallback(() => update([]), [update])
  /** Lo que se envía, sin el id de la lista. */
  const drafts = React.useCallback(
    (): ReportAttachment[] => current.current.map((i) => ({ kind: i.kind, name: i.name, dataUrl: i.dataUrl, canvas: i.canvas })),
    [],
  )

  return { items, push, addFiles, remove, clear, drafts }
}

export function AttachmentsField({
  attachments,
  onCanvas,
}: {
  attachments: ReturnType<typeof useAttachments>
  /** Abre el lienzo; sin ella no se ofrece. */
  onCanvas?: () => void
}) {
  const input = React.useRef<HTMLInputElement>(null)
  const { items, addFiles, remove } = attachments
  const full = items.length >= MAX_ATTACHMENTS

  return (
    <div className="grid min-w-0 gap-2">
      <Label>
        Imágenes <span className="font-normal text-muted-foreground">· opcional</span>
      </Label>
      {items.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {items.map((a) => (
            <li key={a.id} className="group relative size-16 overflow-hidden rounded-md border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL local: next/image no aporta nada */}
              <img src={a.dataUrl} alt={a.name} className="size-full object-cover object-top" />
              {a.kind === "canvas" && (
                <span className="absolute bottom-1 left-1 rounded bg-foreground/80 px-1 text-[10px] leading-4 text-background">Lienzo</span>
              )}
              <Button
                type="button"
                variant="secondary"
                size="icon-xs"
                aria-label={`Quitar «${a.name}»`}
                className="absolute top-1 right-1 size-5 rounded-full opacity-0 shadow-xs group-hover:opacity-100 focus-visible:opacity-100"
                onClick={() => remove(a.id)}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" disabled={full} onClick={() => input.current?.click()}>
          <ImagePlusIcon /> Adjuntar imagen
        </Button>
        {onCanvas && (
          <Button type="button" variant="outline" disabled={full} onClick={onCanvas}>
            <PencilRulerIcon /> Abrir el lienzo
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {full
          ? `Ya hay ${MAX_ATTACHMENTS}, el máximo. Quita alguna para añadir otra.`
          : onCanvas
            ? "Pega una captura con ⌘V o arrástrala aquí. En el lienzo mueves, cambias de tamaño o quitas bloques de la pantalla y dibujas encima."
            : "También puedes pegar una captura con ⌘V o arrastrarla aquí."}
      </p>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          void addFiles(imageFiles(e.target.files))
          e.target.value = ""
        }}
      />
    </div>
  )
}
