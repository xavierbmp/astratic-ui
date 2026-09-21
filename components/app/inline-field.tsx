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
 * Pide a los campos de dentro que arranquen ya editando. Lo pone `DetailFields` cuando se pulsa
 * «+ Campo» en un campo vacío: el campo aparece con el cursor dentro (o con su lista abierta).
 */
export const InlineAutoEdit = React.createContext(false)

/** Clases del valor en reposo: se lee como texto y, al pasar por encima, se ve que se puede pulsar. */
export const inlineRestClass =
  "-mx-1 flex min-h-7 w-[calc(100%+0.5rem)] min-w-0 items-center gap-1.5 rounded-md px-1 text-left transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"

/**
 * Valor editable en el sitio, para las fichas: se ve el dato y, al pulsarlo, se edita.
 *
 * En reposo todos los tipos se leen igual, como texto o insignias, sin bordes ni cajas: la ficha
 * se lee de un vistazo y el control solo aparece cuando se pulsa. Texto, números, fechas y enlaces
 * pasan a un campo del mismo alto (nada salta) y se guardan al salir o con Enter (Escape cancela).
 * Las listas abren su desplegable y guardan al elegir; los sí/no son un interruptor. Mientras
 * guarda, el campo se atenúa; si la acción devuelve un error se avisa con un toast y el valor
 * vuelve a lo que estaba.
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
  onCreate,
  onManage,
  manageLabel,
  required,
}: {
  value: ValorInline
  tipo?: InlineTipo
  /** Opciones de `select` y `multiselect`. */
  opciones?: MultiOption[]
  /** `multiselect`: crear una opción escribiéndola y gestionarlas desde el pie (ver `MultiSelect`). */
  onCreate?: (texto: string) => Promise<MultiOption | null>
  onManage?: () => void
  manageLabel?: string
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
  /** `select`: el campo no puede quedar vacío (sin la opción «Sin valor»). */
  required?: boolean
}) {
  const autoEdit = React.useContext(InlineAutoEdit)
  const [editando, setEditando] = React.useState(autoEdit)
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

  if (readOnly) return <span className={cn("flex min-h-7 items-center text-muted-foreground", className)}>{pintar(actual, render, placeholder, true)}</span>

  // ---- Controles que no necesitan modo edición ----

  if (tipo === "booleano") {
    return (
      <span className={cn("inline-flex min-h-7 items-center gap-2", className)}>
        <Switch checked={Boolean(actual)} disabled={disabled || guardando} onCheckedChange={(c) => void guardar(c)} />
        <span className="text-xs text-muted-foreground">{actual ? "Sí" : "No"}</span>
        {guardando && <Loader2Icon className="size-3 animate-spin text-muted-foreground" />}
      </span>
    )
  }

  if (tipo === "select") {
    const vacio = esVacio(actual)
    return (
      <span className={cn("flex min-w-0 items-center gap-1.5", className)}>
        <Select
          value={typeof actual === "string" && actual ? actual : ""}
          disabled={disabled || guardando}
          defaultOpen={autoEdit}
          onValueChange={(v) => void guardar(v === VACIO ? null : v)}
        >
          <SelectTrigger
            size="sm"
            className={cn(
              inlineRestClass,
              "h-7 justify-between border-transparent bg-transparent py-0 shadow-none dark:bg-transparent dark:hover:bg-muted data-[state=open]:bg-muted [&>svg]:opacity-0 hover:[&>svg]:opacity-100 focus-visible:[&>svg]:opacity-100 data-[state=open]:[&>svg]:opacity-100",
              guardando && "opacity-60",
            )}
          >
            <SelectValue placeholder={placeholder}>{!vacio && render ? render(actual) : undefined}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {!required && <SelectItem value={VACIO} className="text-muted-foreground">Sin valor</SelectItem>}
            {(opciones ?? []).map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {guardando && <Loader2Icon className="size-3 flex-none animate-spin text-muted-foreground" />}
      </span>
    )
  }

  if (tipo === "multiselect") {
    return (
      <span className={cn("flex min-w-0 items-center gap-1.5", className)}>
        <MultiSelect
          variant="inline"
          options={opciones ?? []}
          value={Array.isArray(actual) ? actual : []}
          onChange={(v) => void guardar(v)}
          placeholder={placeholder}
          disabled={disabled || guardando}
          defaultOpen={autoEdit}
          renderValue={render ? () => render(actual) : undefined}
          className={cn(guardando && "opacity-60")}
          onCreate={onCreate}
          onManage={onManage}
          manageLabel={manageLabel}
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
        placeholder={placeholder}
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
      className={cn("group/inline", inlineRestClass, tipo === "textarea" && "items-start py-1", guardando && "opacity-60", className)}
    >
      <span className={cn("min-w-0 flex-1", vacio && "text-muted-foreground", tipo === "textarea" ? "whitespace-pre-wrap" : "truncate")}>
        {pintar(actual, render, placeholder)}
      </span>
      {guardando ? (
        <Loader2Icon className="size-3 flex-none animate-spin text-muted-foreground" />
      ) : (
        <PencilIcon className="size-3 flex-none text-muted-foreground opacity-0 transition-opacity group-hover/inline:opacity-100 group-focus-visible/inline:opacity-100" />
      )}
    </button>
  )
}

const VACIO = "__vacio__"

type ParteTitulo = { key: string; value: string | null; placeholder: string; required?: boolean }

/**
 * El nombre de la ficha, editable donde se lee: se pulsa el título y pasa a campo. Con varias
 * partes (nombre y apellidos) se editan juntas, una al lado de otra. Enter guarda, Escape cancela
 * y salir del grupo guarda. Una parte `required` no puede quedar vacía.
 */
export function InlineTitle({
  parts,
  onSave,
  className,
}: {
  parts: ParteTitulo[]
  onSave: (values: Record<string, string | null>) => Promise<string | void>
  className?: string
}) {
  const [editando, setEditando] = React.useState(false)
  const [guardando, setGuardando] = React.useState(false)
  // Lo guardado se enseña mientras el servidor confirma; en cuanto llegan otros valores, mandan esos.
  const firma = parts.map((p) => p.value ?? "").join("|")
  const [optimista, setOptimista] = React.useState<{ firma: string; valores: Record<string, string | null> } | null>(null)
  const valores = optimista && optimista.firma === firma ? optimista.valores : Object.fromEntries(parts.map((p) => [p.key, p.value]))
  const texto = parts.map((p) => valores[p.key]).filter(Boolean).join(" ")

  const guardar = async (nuevos: Record<string, string | null>) => {
    setEditando(false)
    const falta = parts.find((p) => p.required && !nuevos[p.key])
    if (falta) return void toast.error(`${falta.placeholder} no puede quedar vacío`)
    if (parts.every((p) => (nuevos[p.key] ?? null) === (valores[p.key] ?? null))) return
    setOptimista({ firma, valores: nuevos })
    setGuardando(true)
    const error = await onSave(nuevos)
    setGuardando(false)
    if (error) {
      setOptimista(null)
      toast.error(error)
    }
  }

  if (editando) return <EditorTitulo parts={parts} valores={valores} onCancel={() => setEditando(false)} onCommit={(v) => void guardar(v)} />

  return (
    <button
      type="button"
      disabled={guardando}
      onClick={() => setEditando(true)}
      title="Editar el nombre"
      className={cn(
        "group/title -mx-1 inline-flex max-w-[calc(100%+0.5rem)] items-center gap-1.5 rounded-md px-1 text-left outline-none transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50",
        guardando && "opacity-60",
        className,
      )}
    >
      <span className={cn("min-w-0 truncate", !texto && "text-muted-foreground")}>{texto || parts[0]?.placeholder}</span>
      {guardando ? (
        <Loader2Icon className="size-3 flex-none animate-spin text-muted-foreground" />
      ) : (
        <PencilIcon className="size-3 flex-none text-muted-foreground opacity-0 transition-opacity group-hover/title:opacity-100 group-focus-visible/title:opacity-100" />
      )}
    </button>
  )
}

function EditorTitulo({
  parts,
  valores,
  onCommit,
  onCancel,
}: {
  parts: ParteTitulo[]
  valores: Record<string, string | null>
  onCommit: (v: Record<string, string | null>) => void
  onCancel: () => void
}) {
  const [textos, setTextos] = React.useState(() => Object.fromEntries(parts.map((p) => [p.key, valores[p.key] ?? ""])))
  // Enter o Escape cierran el editor; el blur que llega después no debe volver a guardar.
  const cerrado = React.useRef(false)
  const commit = () => {
    if (cerrado.current) return
    cerrado.current = true
    onCommit(Object.fromEntries(parts.map((p) => [p.key, textos[p.key].trim() || null])))
  }
  return (
    <span
      className="-mx-1 flex w-full items-center gap-1.5"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) commit()
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault()
          e.stopPropagation()
          cerrado.current = true
          onCancel()
        } else if (e.key === "Enter") {
          e.preventDefault()
          commit()
        }
      }}
    >
      {parts.map((p, i) => (
        <Input
          key={p.key}
          autoFocus={i === 0}
          aria-label={p.placeholder}
          placeholder={p.placeholder}
          value={textos[p.key]}
          onChange={(e) => setTextos((t) => ({ ...t, [p.key]: e.target.value }))}
          className="h-7 min-w-0 flex-1 px-1 text-[15px] font-semibold"
        />
      ))}
    </span>
  )
}

function EntradaInline({
  tipo,
  valor,
  multiline,
  placeholder,
  onCommit,
  onCancel,
}: {
  tipo: InlineTipo
  valor: ValorInline
  multiline?: number
  placeholder?: string
  onCommit: (v: ValorInline) => void
  onCancel: () => void
}) {
  const [texto, setTexto] = React.useState(() => (valor == null ? "" : String(valor)))
  // Enter o Escape cierran el campo; el blur que llega después no debe volver a guardar.
  const cerrado = React.useRef(false)

  const commit = () => {
    if (cerrado.current) return
    cerrado.current = true
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
      // Escape cierra el campo, no la ficha que lo contiene.
      e.preventDefault()
      e.stopPropagation()
      cerrado.current = true
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
          placeholder={placeholder}
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
    <span className="-mx-1 flex items-center gap-1">
      <Input
        autoFocus
        type={tipo === "numero" ? "number" : tipo === "fecha" ? "date" : tipo === "email" ? "email" : "text"}
        inputMode={tipo === "numero" ? "decimal" : tipo === "telefono" ? "tel" : tipo === "url" ? "url" : undefined}
        value={tipo === "fecha" ? texto.slice(0, 10) : texto}
        placeholder={placeholder}
        onChange={(e) => setTexto(e.target.value)}
        onBlur={commit}
        onKeyDown={teclas}
        className="h-7 px-1 text-sm"
      />
      <span className="text-muted-foreground" aria-hidden>
        <CheckIcon className="size-3.5" />
      </span>
    </span>
  )
}

export function esVacio(v: ValorInline | undefined): boolean {
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
