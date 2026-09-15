"use client"

import * as React from "react"
import { toast } from "sonner"
import { ArchiveIcon, CircleCheckIcon, DownloadIcon, OctagonXIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/app/confirm-dialog"

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast.success("Registro guardado")}>
        <CircleCheckIcon /> Éxito
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("No se ha podido guardar el registro", {
            description: "El servidor ha respondido: «La base de datos no está disponible». Inténtalo de nuevo.",
          })
        }
      >
        <OctagonXIcon /> Error
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Registro archivado", {
            action: { label: "Deshacer", onClick: () => toast("Registro restaurado") },
          })
        }
      >
        <ArchiveIcon /> Con «Deshacer»
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Exportación preparada", {
            description: "24 registros en CSV. El enlace caduca en 24 horas.",
          })
        }
      >
        <DownloadIcon /> Con descripción
      </Button>
    </div>
  )
}

export function ConfirmDialogDemo() {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Trash2Icon /> Eliminar Registro 7
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Eliminar Registro 7?"
        description="Se borrará de forma permanente junto con su actividad y sus archivos. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        destructive
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 900))
          toast.success("Registro 7 eliminado")
        }}
      />
    </>
  )
}
