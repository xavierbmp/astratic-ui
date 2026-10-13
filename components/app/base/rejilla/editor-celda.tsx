"use client"

import * as React from "react"
import { CheckIcon, PlusIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { opcionDe, valorDeTexto, type DefCampo, type OpcionCampo, type ValorCampo } from "@/lib/base/campos"
import { FichaOpcion } from "@/components/app/base/apariencia"

/** Cómo termina una edición: guardar y quedarse, o guardar y pasar a la celda de al lado o de abajo. */
export type Salida = "quedarse" | "derecha" | "izquierda" | "abajo"

export type PropsEditor<T> = {
  campo: DefCampo<T>
  valor: ValorCampo
  /** Lo que se tecleó para empezar a editar: sustituye al valor, como en una hoja de cálculo. */
  inicial?: string
  onGuardar: (valor: ValorCampo, salida: Salida) => void
  /** Aplica sin cerrar el editor (la selección múltiple sigue abierta mientras se marcan opciones). */
  onAplicar: (valor: ValorCampo) => void
  onCancelar: () => void
  /** Crear una opción nueva escribiendo su nombre (solo en los campos propios). */
  onCrearOpcion?: (label: string) => OpcionCampo | null
  error: (mensaje: string) => void
}

/** El texto que se edita: los números sin formato («1234,5») para poder cambiarlos. */
function textoEditable<T>(campo: DefCampo<T>, valor: ValorCampo): string {
  if (valor === null || valor === undefined) return ""
  if (typeof valor === "number") return String(valor).replace(".", ",")
  return Array.isArray(valor) ? valor.join(", ") : String(valor)
}

/** El editor de una celda según su tipo, como en Airtable. Las casillas y las estrellas no tienen: se cambian con un clic. */
export function EditorCelda<T>(props: PropsEditor<T>) {
  switch (props.campo.tipo) {
    case "select":
    case "multiselect":
      return <EditorOpciones {...props} />
    case "fecha":
      return <EditorFecha {...props} />
    case "texto_largo":
      return <EditorTextoLargo {...props} />
    default:
      return <EditorTexto {...props} />
  }
}

const SALIDA_TECLA = (e: React.KeyboardEvent): Salida | null => {
  if (e.key === "Enter" && !e.shiftKey) return "quedarse"
  if (e.key === "Tab") return e.shiftKey ? "izquierda" : "derecha"
  return null
}

function EditorTexto<T>({ campo, valor, inicial, onGuardar, onCancelar, error }: PropsEditor<T>) {
  const [texto, setTexto] = React.useState(inicial ?? textoEditable(campo, valor))
  const hecho = React.useRef(false)
  const guardar = (salida: Salida) => {
    if (hecho.current) return
    const lectura = valorDeTexto(campo, texto)
    if (!lectura.ok) {
      error(lectura.error)
      return
    }
    hecho.current = true
    onGuardar(lectura.valor, salida)
  }
  const numero = campo.tipo === "numero" || campo.tipo === "moneda" || campo.tipo === "porcentaje" || campo.tipo === "calificacion"
  return (
    <input
      autoFocus
      aria-label={campo.nombre}
      className={cn("absolute inset-0 z-10 h-full w-full rounded-[2px] bg-background px-1.5 text-[13px] ring-2 ring-brand outline-none", numero && "text-right tabular-nums")}
      inputMode={numero ? "decimal" : campo.tipo === "email" ? "email" : campo.tipo === "telefono" ? "tel" : campo.tipo === "url" ? "url" : undefined}
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      onFocus={(e) => inicial === undefined && e.target.select()}
      onKeyDown={(e) => {
        e.stopPropagation()
        const salida = SALIDA_TECLA(e)
        if (salida) {
          e.preventDefault()
          guardar(salida)
        } else if (e.key === "Escape") {
          hecho.current = true
          onCancelar()
        }
      }}
      onBlur={() => guardar("quedarse")}
    />
  )
}

/** El texto largo se abre en una caja más grande sobre la celda: Enter salta de línea y ⌘ + Enter guarda. */
/** Se cuelga de la celda: los editores flotantes salen pegados a ella (la caja de texto largo, encima). */
function Ancla({ encima }: { encima?: boolean }) {
  return (
    <PopoverAnchor asChild>
      <span aria-hidden className={cn("pointer-events-none absolute left-0 w-full", encima ? "top-0 h-0" : "inset-y-0")} />
    </PopoverAnchor>
  )
}

function EditorTextoLargo<T>({ campo, valor, inicial, onGuardar, onCancelar }: PropsEditor<T>) {
  const [texto, setTexto] = React.useState(inicial ?? textoEditable(campo, valor))
  const hecho = React.useRef(false)
  const guardar = (salida: Salida) => {
    if (hecho.current) return
    hecho.current = true
    onGuardar(texto.trim() === "" ? null : texto, salida)
  }
  return (
    <Popover open onOpenChange={(abierto) => !abierto && guardar("quedarse")}>
      <Ancla encima />
      <PopoverContent align="start" side="bottom" sideOffset={0} className="w-[min(90vw,420px)] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
        <textarea
          autoFocus
          aria-label={campo.nombre}
          className="block min-h-40 w-full resize-y rounded-lg bg-background p-2.5 text-[13px] ring-2 ring-brand outline-none"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onBlur={(e) => {
            // Pulsar fuera guarda, como en el resto de celdas; dentro de la caja, no.
            if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) guardar("quedarse")
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              guardar("quedarse")
            } else if (e.key === "Tab") {
              e.preventDefault()
              guardar(e.shiftKey ? "izquierda" : "derecha")
            } else if (e.key === "Escape") {
              e.preventDefault()
              hecho.current = true
              onCancelar()
            }
          }}
        />
        <p className="px-2.5 py-1.5 text-xs text-muted-foreground">⌘ + Enter para guardar · Esc para salir sin guardar</p>
      </PopoverContent>
    </Popover>
  )
}

/**
 * La fecha se escribe en la celda con el selector de fecha del navegador, que se abre solo al
 * empezar. Enter o salir guarda; Escape deja la que había; borrarla la quita.
 */
function EditorFecha<T>({ campo, valor, onGuardar, onCancelar, error }: PropsEditor<T>) {
  const [dia, setDia] = React.useState(typeof valor === "string" ? valor.slice(0, 10) : "")
  const hecho = React.useRef(false)
  const entrada = React.useRef<HTMLInputElement>(null)
  // El calendario del navegador se abre al empezar a editar, como el de Airtable.
  React.useEffect(() => {
    try {
      entrada.current?.showPicker()
    } catch {
      // Sin un clic directo algunos navegadores no lo abren: la fecha se escribe a mano.
    }
  }, [])
  const guardar = (salida: Salida) => {
    if (hecho.current) return
    if (!dia && campo.obligatorio) return error("Este campo no puede quedarse vacío")
    hecho.current = true
    onGuardar(dia || null, salida)
  }
  return (
    <input
      type="date"
      autoFocus
      aria-label={campo.nombre}
      className="absolute inset-0 z-10 h-full w-full rounded-[2px] bg-background px-1.5 text-[13px] ring-2 ring-brand outline-none"
      value={dia}
      ref={entrada}
      onChange={(e) => setDia(e.target.value)}
      onKeyDown={(e) => {
        e.stopPropagation()
        const salida = SALIDA_TECLA(e)
        if (salida) {
          e.preventDefault()
          guardar(salida)
        } else if (e.key === "Escape") {
          hecho.current = true
          onCancelar()
        }
      }}
      onBlur={() => guardar("quedarse")}
    />
  )
}

/**
 * Las opciones en una lista con buscador. En la de una sola, elegir guarda y cierra; en la de
 * varias, cada clic añade o quita y la lista sigue abierta. Si el campo lo permite, lo escrito
 * que no existe se ofrece como opción nueva.
 */
function EditorOpciones<T>({ campo, valor, inicial, onGuardar, onAplicar, onCancelar, onCrearOpcion }: PropsEditor<T>) {
  const varias = campo.tipo === "multiselect"
  const [elegidas, setElegidas] = React.useState<string[]>(Array.isArray(valor) ? valor : typeof valor === "string" && valor ? [valor] : [])
  const [busqueda, setBusqueda] = React.useState(inicial ?? "")
  const existe = (campo.opciones ?? []).some((o) => o.label.toLowerCase() === busqueda.trim().toLowerCase())

  const elegir = (id: string) => {
    if (!varias) return onGuardar(id, "quedarse")
    const siguientes = elegidas.includes(id) ? elegidas.filter((x) => x !== id) : [...elegidas, id]
    setElegidas(siguientes)
    onAplicar(siguientes)
  }
  const crear = () => {
    const nueva = onCrearOpcion?.(busqueda.trim())
    if (!nueva) return
    setBusqueda("")
    if (varias) {
      const siguientes = [...elegidas, nueva.id]
      setElegidas(siguientes)
      onAplicar(siguientes)
    } else onGuardar(nueva.id, "quedarse")
  }

  return (
    <Popover open onOpenChange={(abierto) => !abierto && onCancelar()}>
      <Ancla />
      <PopoverContent align="start" className="w-72 p-0" onKeyDown={(e) => e.key !== "Escape" && e.stopPropagation()}>
        {varias && elegidas.length > 0 && (
          <div className="flex flex-wrap gap-1 border-b p-2">
            {elegidas.map((id) => {
              const o = opcionDe(campo, id)
              return (
                <FichaOpcion key={id} label={o?.label ?? id} color={o?.color}>
                  <button type="button" aria-label={`Quitar ${o?.label ?? id}`} className="-mr-1 rounded-full opacity-60 hover:opacity-100" onClick={() => elegir(id)}>
                    <XIcon className="size-3" />
                  </button>
                </FichaOpcion>
              )
            })}
          </div>
        )}
        <Command>
          <CommandInput autoFocus placeholder="Encuentra una opción" value={busqueda} onValueChange={setBusqueda} />
          <CommandList className="max-h-64">
            <CommandEmpty>{onCrearOpcion ? "Escribe para crear una opción" : "Ninguna opción se llama así"}</CommandEmpty>
            <CommandGroup>
              {(campo.opciones ?? []).map((o) => (
                <CommandItem key={o.id} value={`${o.label} ${o.id}`} onSelect={() => elegir(o.id)}>
                  <FichaOpcion label={o.label} color={o.color} />
                  {elegidas.includes(o.id) && <CheckIcon className="ml-auto size-3.5" />}
                </CommandItem>
              ))}
              {onCrearOpcion && busqueda.trim() && !existe && (
                <CommandItem value={`crear ${busqueda}`} onSelect={crear}>
                  <PlusIcon className="size-3.5" /> Crear «{busqueda.trim()}»
                </CommandItem>
              )}
              {!varias && !campo.obligatorio && elegidas.length > 0 && (
                <CommandItem value="quitar la opción" onSelect={() => onGuardar(null, "quedarse")} className="text-muted-foreground">
                  <XIcon className="size-3.5" /> Quitar la opción
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
