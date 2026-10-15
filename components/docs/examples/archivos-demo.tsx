"use client"

import * as React from "react"
import { toast } from "sonner"
import { ZonaSubida } from "@/components/app/zona-subida"
import { CompartirEnlace } from "@/components/app/compartir-enlace"
import { LinkGrid, LinkRow, type QuickLink } from "@/components/app/link-grid"

export function ZonaSubidaDemo() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <ZonaSubida onArchivos={(a) => toast.success(`${a.length} ${a.length === 1 ? "archivo" : "archivos"} para subir`)} ayuda="PDF o imágenes, hasta 20 MB cada uno." />
      <ZonaSubida compacta accept="image/*" titulo="Arrastra aquí una imagen o elígela" onArchivos={(a) => toast.success(`${a[0].name} para subir`)} />
    </div>
  )
}

export function CompartirEnlaceDemo() {
  return <CompartirEnlace ruta="/revisar/ejemplo" mensaje="Hola, aquí tienes la versión para revisar:" asunto="Versión para revisar" verComo="Ver como el cliente" nota="El enlace caduca en 30 días y no pide cuenta." className="w-full max-w-md" />
}

const ENLACES: QuickLink[] = [
  { id: "l1", label: "Calendario", url: "https://calendar.google.com" },
  { id: "l2", label: "Drive", url: "https://drive.google.com" },
  { id: "l3", label: "Notion", url: "https://www.notion.so" },
  { id: "l4", label: "Figma", url: "https://www.figma.com" },
  { id: "l5", label: "GitHub", url: "https://github.com" },
  { id: "l6", label: "Vercel", url: "https://vercel.com" },
]

export function LinkGridDemo() {
  const [enlaces, setEnlaces] = React.useState(ENLACES)
  const [editando, setEditando] = React.useState(false)
  return (
    <div className="grid w-full max-w-md gap-6">
      <LinkGrid links={enlaces} onChange={setEnlaces} editing={false} />
      <LinkRow links={enlaces} onChange={setEnlaces} editing={editando} onEditingChange={setEditando} />
    </div>
  )
}
