"use client"

import * as React from "react"
import { PlusIcon, Trash2Icon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TIPOS_CAMPO_TAREA, type CampoTarea, type TipoCampoTarea } from "@/lib/influencer/modelo"
import { idNuevo } from "@/lib/influencer/tareas"

const CON_OPCIONES: TipoCampoTarea[] = ["select", "multiselect"]

/**
 * Crear o cambiar un campo de las tareas, como una propiedad de Notion: su nombre, su tipo y, en
 * las selecciones, sus opciones. El tipo no se cambia una vez creado, para no perder lo escrito;
 * borrar el campo quita su valor de todas las tareas.
 */
export function CampoTareaDialog({
  open,
  onOpenChange,
  campo,
  nombresUsados,
  onGuardar,
  onBorrar,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** El campo que se edita; sin él, se crea uno. */
  campo?: CampoTarea | null
  /** Los nombres de los demás campos, para no repetir. */
  nombresUsados: string[]
  onGuardar: (campo: CampoTarea) => void
  onBorrar?: (id: string) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{campo ? "Editar el campo" : "Nuevo campo"}</DialogTitle>
          <DialogDescription>Sale en la ficha de todas las tareas y se puede usar para filtrar, ordenar, agrupar y como columna.</DialogDescription>
        </DialogHeader>
        {/* El formulario se monta al abrir: arranca con los datos del campo, sin efectos que lo rellenen. */}
        <FormularioCampo key={campo?.id ?? "nuevo"} campo={campo} nombresUsados={nombresUsados} onGuardar={onGuardar} onBorrar={onBorrar} onCerrar={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function FormularioCampo({
  campo,
  nombresUsados,
  onGuardar,
  onBorrar,
  onCerrar,
}: {
  campo?: CampoTarea | null
  nombresUsados: string[]
  onGuardar: (campo: CampoTarea) => void
  onBorrar?: (id: string) => void
  onCerrar: () => void
}) {
  const [nombre, setNombre] = React.useState(campo?.nombre ?? "")
  const [tipo, setTipo] = React.useState<TipoCampoTarea>(campo?.tipo ?? "texto")
  const [opciones, setOpciones] = React.useState<{ id: string; label: string }[]>(campo?.opciones ?? [])
  const [error, setError] = React.useState<string | null>(null)

  const conOpciones = CON_OPCIONES.includes(tipo)
  const guardar = (e: React.FormEvent) => {
    e.preventDefault()
    const limpio = nombre.trim()
    if (!limpio) return setError("Ponle un nombre")
    if (nombresUsados.some((n) => n.toLowerCase() === limpio.toLowerCase())) return setError("Ya hay un campo con ese nombre")
    const validas = opciones.map((o) => ({ ...o, label: o.label.trim() })).filter((o) => o.label)
    if (conOpciones && validas.length === 0) return setError("Añade al menos una opción")
    onGuardar({ id: campo?.id ?? idNuevo("c"), nombre: limpio, tipo, opciones: conOpciones ? validas : undefined })
    onCerrar()
  }

  return (
    <form onSubmit={guardar} noValidate className="grid gap-4">
      <Field data-invalid={!!error || undefined}>
        <FieldLabel htmlFor="campo-nombre">Nombre</FieldLabel>
        <Input id="campo-nombre" autoFocus value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Plataforma, Presupuesto, Enlace al Drive…" aria-invalid={!!error} />
        <FieldError errors={error ? [{ message: error }] : []} />
      </Field>
      <Field>
        <FieldLabel htmlFor="campo-tipo">Tipo</FieldLabel>
        <Select value={tipo} onValueChange={(v) => setTipo(v as TipoCampoTarea)} disabled={!!campo}>
          <SelectTrigger id="campo-tipo" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TIPOS_CAMPO_TAREA) as TipoCampoTarea[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TIPOS_CAMPO_TAREA[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {campo && <p className="text-xs text-muted-foreground">El tipo no se cambia una vez creado.</p>}
      </Field>
      {conOpciones && (
        <div className="grid gap-1.5">
          <span className="text-sm font-medium">Opciones</span>
          <ul className="grid gap-1">
            {opciones.map((o, i) => (
              <li key={o.id} className="flex items-center gap-1">
                <Input
                  aria-label={`Opción ${i + 1}`}
                  // La opción recién añadida llega con el cursor puesto; Enter añade la siguiente.
                  autoFocus={i === opciones.length - 1 && !o.label}
                  value={o.label}
                  onChange={(e) => setOpciones((os) => os.map((x) => (x.id === o.id ? { ...x, label: e.target.value } : x)))}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return
                    e.preventDefault()
                    if (o.label.trim()) setOpciones((os) => [...os, { id: idNuevo("o"), label: "" }])
                  }}
                  className="h-8 text-sm"
                />
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar ${o.label || "la opción"}`} onClick={() => setOpciones((os) => os.filter((x) => x.id !== o.id))}>
                  <XIcon />
                </Button>
              </li>
            ))}
          </ul>
          <Button type="button" variant="ghost" size="sm" className="justify-self-start" onClick={() => setOpciones((os) => [...os, { id: idNuevo("o"), label: "" }])}>
            <PlusIcon /> Añadir opción
          </Button>
        </div>
      )}
      <DialogFooter className="sm:justify-between">
        {campo && onBorrar ? (
          <Button
            type="button"
            variant="ghost"
            className="text-danger hover:text-danger"
            onClick={() => {
              onBorrar(campo.id)
              onCerrar()
            }}
          >
            <Trash2Icon /> Eliminar el campo
          </Button>
        ) : (
          <span />
        )}
        <span className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit">{campo ? "Guardar" : "Crear campo"}</Button>
        </span>
      </DialogFooter>
    </form>
  )
}
