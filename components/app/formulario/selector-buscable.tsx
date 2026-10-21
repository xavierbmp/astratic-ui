"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, PencilIcon, PlusIcon, SearchIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ESQUINAS_FORMULARIO } from "@/components/app/formulario/formulario-dialog"

/** Una opción con su cara: el logo o el avatar de un registro, el icono de un tipo. */
export type OpcionSelector = { value: string; label: string; detalle?: string; icono?: React.ReactNode; editable?: boolean }

const sinAcentos = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").trim()

const ALTOS = { md: 40, sm: 32 }

/**
 * Elegir una opción escribiendo, como en un campo de texto: al pulsarlo, el propio campo pasa a ser
 * donde se escribe y debajo salen las opciones, que se recorren con la rueda o las flechas y se
 * filtran al escribir. Si lo escrito no existe, la última opción es el botón «Crear «…»» (`onCrear`):
 * nunca se queda nadie sin poder poner lo que quiere. Con `onEditar`, las opciones `editable` llevan
 * un lápiz; con `vaciable`, una cruz para quitar lo elegido. Con `marcados`, varias llevan la marca de
 * elegidas (una lista en la que se pone y se quita: las condiciones de una pieza).
 *
 * El panel cubre el campo y es modal a propósito: dentro de un diálogo, uno no modal no deja usar la
 * rueda del ratón en la lista. `tamano="sm"` es el de dentro de una fila. Con `aspecto="boton"`, en
 * vez del campo se pulsa lo que se pase en `disparador` (el icono de una tarjeta) y la lista sale debajo.
 */
export function SelectorBuscable({
  id,
  opciones,
  valor,
  marcados,
  onChange,
  placeholder = "Escribe o elige",
  vacio = "Nada se llama así",
  onCrear,
  onEditar,
  vaciable,
  invalido,
  disabled,
  tamano = "md",
  aspecto = "campo",
  disparador,
  abiertoAlEmpezar = false,
  className,
  "aria-label": ariaLabel,
}: {
  id?: string
  opciones: OpcionSelector[]
  valor: string | undefined
  /** Las que salen marcadas además de `valor`, cuando se eligen varias. */
  marcados?: string[]
  /** Con `vaciable`, la cruz llama con «». */
  onChange: (valor: string) => void
  placeholder?: string
  vacio?: string
  /** Dar de alta lo escrito cuando no existe: recibe el texto. */
  onCrear?: (texto: string) => void
  onEditar?: (valor: string) => void
  vaciable?: boolean
  invalido?: boolean
  disabled?: boolean
  tamano?: keyof typeof ALTOS
  aspecto?: "campo" | "boton"
  /** Con `aspecto="boton"`, lo que se ve y se pulsa. */
  disparador?: React.ReactNode
  /** Que salga ya abierto, para escribir sin pulsar (al desplegar las condiciones de una pieza). */
  abiertoAlEmpezar?: boolean
  className?: string
  "aria-label"?: string
}) {
  const [abierto, setAbierto] = React.useState(abiertoAlEmpezar)
  const [texto, setTexto] = React.useState("")
  const [activo, setActivo] = React.useState(0)
  const entrada = React.useRef<HTMLInputElement>(null)
  const lista = React.useRef<HTMLDivElement>(null)
  const listaId = React.useId()
  const elegida = opciones.find((o) => o.value === valor)
  const busqueda = texto.trim()
  const visibles = busqueda ? opciones.filter((o) => sinAcentos(`${o.label} ${o.detalle ?? ""}`).includes(sinAcentos(busqueda))) : opciones
  const puedeCrear = !!onCrear && busqueda !== "" && !opciones.some((o) => sinAcentos(o.label) === sinAcentos(busqueda))
  const total = visibles.length + (puedeCrear ? 1 : 0)

  const abrir = (inicial = "") => {
    if (disabled) return
    setTexto(inicial)
    setActivo(Math.max(0, inicial ? 0 : visibles.findIndex((o) => o.value === valor)))
    setAbierto(true)
  }
  const elegir = (v: string) => {
    onChange(v)
    setAbierto(false)
  }
  const crear = () => {
    setAbierto(false)
    onCrear?.(busqueda)
  }
  const confirmar = (i: number) => (i < visibles.length ? elegir(visibles[i].value) : puedeCrear ? crear() : undefined)

  // La opción activa se queda a la vista al moverse con las flechas.
  React.useEffect(() => {
    lista.current?.querySelector(`[data-indice="${activo}"]`)?.scrollIntoView({ block: "nearest" })
  }, [activo])

  return (
    <Popover open={abierto} onOpenChange={setAbierto} modal>
      <div data-slot="selector-buscable" className={cn("relative min-w-0", aspecto === "boton" ? "flex-none" : tamano === "md" ? "w-full" : "max-w-full", className)}>
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            aria-label={ariaLabel}
            disabled={disabled}
            data-invalido={invalido || undefined}
            onKeyDown={(e) => {
              // Escribir con el campo enfocado ya busca: la primera letra abre la lista con ella.
              if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
                e.preventDefault()
                abrir(e.key)
              }
            }}
            onClick={(e) => {
              e.preventDefault()
              abrir()
            }}
            className={
              aspecto === "boton"
                ? "rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                : cn(
                    "flex w-full min-w-0 items-center gap-2 border border-input bg-transparent text-left text-sm transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-invalido:border-destructive data-invalido:ring-3 data-invalido:ring-destructive/20 dark:bg-input/30",
                    tamano === "md" ? "h-10 rounded-md px-3" : "h-8 rounded-sm px-2 text-[13px]",
                    vaciable && elegida && "pr-8",
                  )
            }
          >
            {aspecto === "boton" ? (
              disparador
            ) : (
              <>
                {elegida?.icono}
                <span className={cn("min-w-0 flex-1 truncate", !elegida && "text-muted-foreground")}>{elegida?.label ?? placeholder}</span>
                {elegida?.detalle && tamano === "md" && <span className="hidden max-w-[45%] truncate text-xs text-muted-foreground sm:inline">{elegida.detalle}</span>}
                {!(vaciable && elegida) && <ChevronDownIcon className="size-4 flex-none text-muted-foreground" />}
              </>
            )}
          </button>
        </PopoverTrigger>
        {vaciable && elegida && !disabled && aspecto === "campo" && (
          <button type="button" aria-label={`Quitar ${elegida.label}`} onClick={() => onChange("")} className="absolute top-1/2 right-2 grid size-5 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground">
            <XIcon className="size-3.5" />
          </button>
        )}
      </div>
      <PopoverContent
        align="start"
        sideOffset={aspecto === "boton" ? 6 : -ALTOS[tamano]}
        className={cn("group min-w-64 gap-0 overflow-hidden p-0 data-[side=top]:flex-col-reverse", ESQUINAS_FORMULARIO, aspecto === "boton" ? "w-72" : "w-(--radix-popover-trigger-width)")}
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          entrada.current?.focus()
        }}
      >
        <div className={cn("flex flex-none items-center gap-2 border-b group-data-[side=top]:border-t group-data-[side=top]:border-b-0", tamano === "md" ? "h-10 px-3" : "h-8 px-2")}>
          {busqueda || !elegida?.icono ? <SearchIcon className="size-4 flex-none text-muted-foreground" /> : elegida.icono}
          <input
            ref={entrada}
            role="combobox"
            aria-expanded
            aria-controls={listaId}
            aria-activedescendant={total ? `${listaId}-${activo}` : undefined}
            aria-label={ariaLabel ?? placeholder}
            value={texto}
            placeholder={elegida?.label ?? placeholder}
            onChange={(e) => {
              setTexto(e.target.value)
              setActivo(0)
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault()
                if (total) setActivo((a) => (a + (e.key === "ArrowDown" ? 1 : -1) + total) % total)
              } else if (e.key === "Enter") {
                e.preventDefault()
                confirmar(activo)
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div ref={lista} id={listaId} role="listbox" className="max-h-72 overflow-y-auto p-1">
          {visibles.map((o, i) => (
            <div
              key={o.value}
              id={`${listaId}-${i}`}
              role="option"
              aria-selected={i === activo}
              data-indice={i}
              onMouseMove={() => setActivo(i)}
              onClick={() => elegir(o.value)}
              className={cn("group/opcion flex cursor-default items-center gap-2.5 rounded-md px-2 py-2 text-sm", i === activo && "bg-muted")}
            >
              {o.icono}
              <span className="min-w-0 flex-1">
                <span className="block truncate">{o.label}</span>
                {o.detalle && <span className="block truncate text-xs text-muted-foreground">{o.detalle}</span>}
              </span>
              {o.editable && onEditar && (
                <button
                  type="button"
                  aria-label={`Cambiar ${o.label}`}
                  className={cn("grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-background hover:text-foreground", i === activo ? "opacity-100" : "opacity-0")}
                  onClick={(e) => {
                    e.stopPropagation()
                    setAbierto(false)
                    onEditar(o.value)
                  }}
                >
                  <PencilIcon className="size-3.5" />
                </button>
              )}
              {(o.value === valor || marcados?.includes(o.value)) && <CheckIcon className="size-4 text-brand" />}
            </div>
          ))}
          {puedeCrear && (
            <button
              type="button"
              id={`${listaId}-${visibles.length}`}
              role="option"
              aria-selected={activo === visibles.length}
              data-indice={visibles.length}
              onMouseMove={() => setActivo(visibles.length)}
              onClick={crear}
              className={cn("mt-1 flex w-full items-center gap-2 rounded-md border border-dashed border-brand/40 px-2 py-2 text-left text-sm font-medium text-brand", activo === visibles.length ? "bg-brand-soft" : "bg-brand-soft/50")}
            >
              <PlusIcon className="size-4 flex-none" />
              <span className="truncate">Crear «{busqueda}»</span>
            </button>
          )}
          {total === 0 && <p className="px-2 py-3 text-center text-sm text-muted-foreground">{opciones.length ? vacio : "Sin opciones. Escribe para crear una"}</p>}
        </div>
      </PopoverContent>
    </Popover>
  )
}
