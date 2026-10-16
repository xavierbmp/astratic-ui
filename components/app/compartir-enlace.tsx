"use client"

import * as React from "react"
import Link from "next/link"
import { CopyIcon, ExternalLinkIcon, MailIcon, MessageCircleIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useOrigen } from "@/hooks/use-origen"
import { copiarTexto } from "@/lib/portapapeles"

type Envio = {
  /** Ruta del enlace, sin dominio: `/revisar/rv-…`. */
  ruta: string
  /** Lo que se escribe antes del enlace en WhatsApp y en el email. */
  mensaje: string
  asunto: string
  email?: string
  /** Texto del botón que abre el enlace como lo verá quien lo recibe. */
  verComo?: string
}

/**
 * Un enlace sin cuenta para alguien de fuera (un cliente, una marca), listo para mandar: copiar,
 * WhatsApp, email desde el correo de quien lo manda y abrirlo como lo verá quien lo recibe. El
 * dominio se añade al copiar (la ruta se pinta igual en servidor y cliente).
 */
export function CompartirEnlace({ ruta, mensaje, asunto, email, verComo = "Abrir el enlace", nota, className }: Envio & { nota?: React.ReactNode; className?: string }) {
  const origen = useOrigen()
  const completo = `${origen}${ruta}`
  const texto = `${mensaje} ${completo}`
  return (
    <div data-slot="compartir-enlace" className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-center gap-2">
        <Input readOnly value={completo} onFocus={(e) => e.currentTarget.select()} className="h-8 font-mono text-xs" aria-label="Enlace para compartir" />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={async () => {
            await copiarTexto(completo, "Enlace copiado")
          }}
        >
          <CopyIcon /> Copiar
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" asChild>
          <a href={`https://wa.me/?text=${encodeURIComponent(texto)}`} target="_blank" rel="noreferrer">
            <MessageCircleIcon /> WhatsApp
          </a>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={`mailto:${email ?? ""}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(texto)}`}>
            <MailIcon /> Email
          </a>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={ruta} target="_blank">
            <ExternalLinkIcon /> {verComo}
          </Link>
        </Button>
      </div>
      {nota && <p className="text-xs text-muted-foreground">{nota}</p>}
    </div>
  )
}

/** El mismo envío en un diálogo, para enseñarlo justo después de crear el enlace. */
export function CompartirEnlaceDialog({ open, onOpenChange, titulo, descripcion, ...envio }: Envio & { open: boolean; onOpenChange: (o: boolean) => void; titulo: string; descripcion: React.ReactNode; nota?: React.ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descripcion}</DialogDescription>
        </DialogHeader>
        <CompartirEnlace {...envio} />
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Hecho</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
