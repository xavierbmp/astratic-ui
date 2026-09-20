"use client"

import * as React from "react"
import { CheckIcon, Loader2Icon, PencilIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect, type MultiOption } from "@/components/app/multi-select"

export type InlineTipo =
  | "texto"
  | "textarea"
  | "numero"
  | "fecha"
  | "url"
  | "email"
  | "telefono"
  | "select"
  | "multiselect"
  | "booleano"

export type ValorInline = string | number | boolean | string[] | null

/**
 * Valor editable en el sitio, para las fichas: se ve el dato y, al pulsarlo, se edita.
 *
 * Texto, números, fechas y enlaces entran en modo edición con un clic y se guardan al salir o
 * con Enter (Escape cancela). Las listas y los sí/no se manejan con su control directamente,
 * que ya es de un gesto. Mientras guarda, el campo se atenúa; si la acción devuelve un error se
 * avisa con un toast y el valor vuelve a lo que estaba.
 *
 * `onSave` devuelve el mensaje de error, o nada si ha ido bien.
 */
export function InlineField({
  value,
  tipo = "texto",
  opciones,
  placeholder = "Añadir",
  onSave,
  render,
  disabled,
  readOnly,
  className,
  multiline,
}: {
  value: ValorInline
  tipo?: InlineTipo
  /** Opciones de `select` y `multiselect`. */
  opciones?: MultiOption[]
  placeholder?: string
  onSave: (v: ValorInline) => Promise<string | void>
  /** Cómo se pinta en reposo (enlaces, insignias…). Por defecto, el valor en texto. */
  render?: (v: ValorInline) => React.ReactNode
  disabled?: boolean
  /** Se ve, pero no se puede editar (campos calculados como «Creada»). */
  readOnly?: boolean
  className?: string
  /** Para `textarea`: alto inicial en filas. */
  multiline?: number
}) {
  const [editando, setEditando] = React.useState(false)
  const [guardando, setGuardando] = React.useState(false)
  // Valor que se enseña mientras el servidor confirma, para que no parpadee.
  const [optimista, setOptimista] = React.useState<ValorInline | undefined>(undefined)
  const anterior = React.useRef(value)
  React.useEffect(() => {
    if (value !== anterior.current) {
      anterior.current = value
      setOptimista(undefined)
    }
  }, [value])
  const actual = optimista !== undefined ? optimista : value

  const guardar = React.useCallback(
    async (nuevo: ValorInline) => {
      if (iguales(nuevo, actual)) return setEditando(false)
      setEditando(false)
      setOptimista(nuevo)
      setGuardando(true)
      const error = await onSave(nuevo)
      setGuardando(false)
      if (error) {
        setOptimista(undefined)
        toast.error(error)
      }
    },
    [actual, onSave],
  )

  if (readOnly) return <span className={cn("text-muted-foreground", className)}>{pintar(actual, render, placeholder, true)}</span>

  // ---- Controles que no necesitan modo edición ----

  if (tipo === "booleano") {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        <Switch checked={Boolean(actual)} disabled={disabled || guardando} onCheckedChange={(c) => void guardar(c)} />
        <span className="text-xs text-muted-foreground">{actual ? "Sí" : "No"}</span>
        {guardando && <Loader2Icon className="size-3 animate-spin text-muted-foreground" />}
      </span>
    )
  }

  if (tipo === "select") {
    return (
      <span className={cn("inline-flex items-center gap-1.5", className)}>
        <Select
          value={typeof actual === "string" && actual ? actual : ""}
          disabled={disabled || guardando}
          onValueChange={(v) => void guardar(v === VACIO ? null : v)}
        >
          <SelectTrigger size="sm" className="h-7 w-44 text-xs">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={VACIO} className="text-muted-foreground">Sin valor</SelectItem>
            {(opciones ?? []).map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {guardando && <Loader2Icon className="size-3 animate-spin text-muted-foreground" />}
      </span>
    )
  }

  if (tipo === "multiselect") {
    return (
      <span className={cn("flex items-center gap-1.5", className)}>
        <MultiSelect
          options={opciones ?? []}
          value={Array.isArray(actual) ? actual : []}
          onChange={(v) => void guardar(v)}
          placeholder={placeholder}
          disabled={disabled || guardando}
          className="min-h-7 py-0.5 text-xs"
        />
        {guardando && <Loader2Icon className="size-3 flex-none animate-spin text-muted-foreground" />}
      </span>
    )
  }

  // ---- Texto, números, fechas y enlaces: clic para editar ----

  if (editando) {
    return (
      <EntradaInline
        tipo={tipo}
        valor={actual}
        multiline={multiline}
        onCancel={() => setEditando(false)}
        onCommit={(v) => void guardar(v)}
      />
    )
  }

  const vacio = esVacio(actual)
  return (
    <button
      type="button"
      disabled={disabled || guardando}
      onClick={() => setEditando(true)}
      className={cn(
        "group/inline -mx-1 flex w-full min-w-0 items-center gap-1.5 rounded px-1 text-left transition-colors hover:bg-muted/70 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
        guardando && "opacity-60",
        className,
      )}
    >
      <span className={cn("min-w-0 flex-1", vacio && "text-muted-foreground", tipo === "textarea" ? "whitespace-pre-wrap" : "truncate")}>
        {pintar(actual, render, placeholder)}
      </span>
      {guardando ? (
        <Loader2Icon className="size-3 flex-none animate-spin text-muted-foreground" />
      ) : (
        <PencilIcon className="size-3 flex-none text-muted-foreground opacity-0 transition-opacity group-hover/inline:opacity-100" />
      )}
    </button>
  )
}

const VACIO = "__vacio__"

function EntradaInline({
  tipo,
  valor,
  multiline,
  onCommit,
  onCancel,
}: {
  tipo: InlineTipo
  valor: ValorInline
  multiline?: number
  onCommit: (v: ValorInline) => void
  onCancel: () => void
}) {
  const [texto, setTexto] = React.useState(() => (valor == null ? "" : String(valor)))
  // Escape cancela sin guardar; el blur posterior no debe volver a disparar el guardado.
  const cancelado = React.useRef(false)

  const commit = () => {
    if (cancelado.current) return
    const limpio = texto.trim()
    if (tipo === "numero") {
      if (limpio === "") return onCommit(null)
      const n = Number(limpio.replace(",", "."))
      if (Number.isNaN(n)) {
        toast.error("Escribe un número")
        return onCancel()
      }
      return onCommit(n)
    }
    onCommit(limpio === "" ? null : limpio)
  }
  const teclas = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault()
      cancelado.current = true
      onCancel()
    } else if (e.key === "Enter" && (tipo !== "textarea" || e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      commit()
    }
  }

  if (tipo === "textarea") {
    return (
      <span className="block">
        <Textarea
          autoFocus
          rows={multiline ?? 3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={commit}
          onKeyDown={teclas}
          className="min-h-16 text-sm"
        />
        <span className="mt-1 block text-[11px] text-muted-foreground">⌘+Enter para guardar · Esc para cancelar</span>
      </span>
    )
  }

  return (
    <span className="flex items-center gap-1">
      <Input
        autoFocus
        type={tipo === "numero" ? "number" : tipo === "fecha" ? "date" : tipo === "email" ? "email" : "text"}
        inputMode={tipo === "numero" ? "decimal" : tipo === "telefono" ? "tel" : undefined}
        value={tipo === "fecha" ? texto.slice(0, 10) : texto}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={commit}
        onKeyDown={teclas}
        className="h-7 text-sm"
      />
      <span className="text-muted-foreground" aria-hidden>
        <CheckIcon className="size-3.5" />
      </span>
    </span>
  )
}

function esVacio(v: ValorInline): boolean {
  if (v == null) return true
  if (Array.isArray(v)) return v.length === 0
  if (typeof v === "string") return v.trim() === ""
  return false
}

function iguales(a: ValorInline, b: ValorInline): boolean {
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => x === b[i])
  if (esVacio(a) && esVacio(b)) return true
  return a === b
}

function pintar(v: ValorInline, render: ((v: ValorInline) => React.ReactNode) | undefined, placeholder: string, mudo = false) {
  if (esVacio(v)) return mudo ? "—" : placeholder
  if (render) return render(v)
  if (Array.isArray(v)) return v.join(", ")
  if (typeof v === "boolean") return v ? "Sí" : "No"
  return String(v)
}
