"use client"

import * as React from "react"
import { toast } from "sonner"
import { BookmarkPlusIcon, ChevronDownIcon, LayoutTemplateIcon } from "lucide-react"
import { idNuevo } from "@/lib/influencer/tareas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { ConfirmDialog } from "@/components/app/confirm-dialog"

/** Lo que tiene cualquier plantilla de documento: guiones y contratos. */
export type PlantillaDocumento = { id: string; nombre: string; descripcion: string; texto: string }

/**
 * Plantillas de un documento (guion, contrato): empezar desde una guardada (si ya hay texto, pregunta
 * antes de sustituirlo) o guardar el de ahora como plantilla para la próxima vez.
 */
export function PlantillasMenu<T extends PlantillaDocumento>({ plantillas, onGuardar, texto, onAplicar, disabled, que = "documento" }: { plantillas: T[]; onGuardar: (nueva: PlantillaDocumento) => void; texto: string; onAplicar: (html: string) => void; disabled?: boolean; que?: string }) {
  const [sustituir, setSustituir] = React.useState<T | null>(null)
  const [guardando, setGuardando] = React.useState(false)
  const [nombre, setNombre] = React.useState("")
  const hayTexto = texto.replace(/<[^>]+>/g, "").trim().length > 0

  const aplicar = (p: T) => {
    if (hayTexto) return setSustituir(p)
    onAplicar(p.texto)
    toast.success(`Plantilla «${p.nombre}» aplicada`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled}>
            <LayoutTemplateIcon /> Plantillas <ChevronDownIcon className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Empezar desde</DropdownMenuLabel>
          {plantillas.map((p) => (
            <DropdownMenuItem key={p.id} onSelect={() => aplicar(p)} className="flex-col items-start gap-0">
              <span className="font-medium">{p.nombre}</span>
              <span className="text-xs text-muted-foreground">{p.descripcion}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={!hayTexto} onSelect={() => setGuardando(true)}>
            <BookmarkPlusIcon /> Guardar este {que} como plantilla
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={sustituir !== null}
        onOpenChange={(o) => !o && setSustituir(null)}
        title={`¿Empezar desde «${sustituir?.nombre ?? ""}»?`}
        description="Se sustituye el texto de este borrador por la plantilla. Puedes deshacerlo con ⌘Z."
        confirmLabel="Usar la plantilla"
        onConfirm={() => {
          if (!sustituir) return
          onAplicar(sustituir.texto)
          toast.success(`Plantilla «${sustituir.nombre}» aplicada`)
        }}
      />

      <Dialog open={guardando} onOpenChange={setGuardando}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Guardar como plantilla</DialogTitle>
            <DialogDescription>Se guarda la estructura y el texto de este {que} para empezar los siguientes desde aquí.</DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (!nombre.trim()) return
              onGuardar({ id: idNuevo("pl"), nombre: nombre.trim(), descripcion: "Tu plantilla", texto })
              toast.success("Plantilla guardada")
              setNombre("")
              setGuardando(false)
            }}
          >
            <Field>
              <FieldLabel htmlFor="pg-nombre">Nombre</FieldLabel>
              <Input id="pg-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder={que === "guion" ? "Reel de skincare" : "Colaboración estándar"} autoFocus />
            </Field>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setGuardando(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={!nombre.trim()}>
                Guardar plantilla
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
