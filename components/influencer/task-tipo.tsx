"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import { InlineField, inlineRestClass } from "@/components/app/inline-field"
import { COLLABS_ACTIVAS, LISTA_TIPOS_TAREA, TIPOS_TAREA, type DondeTarea, type TipoTarea } from "@/lib/influencer/modelo"
import { cambiarTipo, collabDe, nombreDeCampana, registroDe, registrosPosibles, type ContextoTareas } from "@/lib/influencer/tareas"

/** Las tareas de Collabs y Cobros concretan una campaña; las del CRM, una ficha. Las de sin tipo, nada. */
export function etiquetaDeQue(tipo: TipoTarea): string | null {
  if (tipo === "collabs" || tipo === "cobros") return "Campaña"
  return tipo === "crm" ? "Ficha del CRM" : null
}

/**
 * El tipo de una tarea: Sin tipo, CRM, Collabs o Cobros, las páginas en las que sale. Al cambiarlo,
 * la campaña se conserva entre Collabs y Cobros y lo demás se quita.
 */
export function SelectorTipo({ value, onChange, id, variant = "outline" }: { value: DondeTarea; onChange: (d: DondeTarea) => void; id?: string; variant?: "outline" | "inline" }) {
  const opciones = LISTA_TIPOS_TAREA.map((t) => ({ value: t, label: TIPOS_TAREA[t] }))
  if (variant === "inline")
    return (
      <InlineField
        value={value.tipo}
        tipo="select"
        required
        opciones={opciones}
        onSave={async (v) => onChange(cambiarTipo(value, String(v) as TipoTarea))} // valor de LISTA_TIPOS_TAREA
        render={() => <span className={cn("text-sm", value.tipo === "sin-tipo" && "text-muted-foreground")}>{TIPOS_TAREA[value.tipo]}</span>}
      />
    )
  return (
    <Select value={value.tipo} onValueChange={(v) => onChange(cambiarTipo(value, v as TipoTarea))}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opciones.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

type Opcion = { clave: string; label: string; donde: DondeTarea }

const SIN = "__sin"

const normal = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

/** Cada palabra escrita tiene que estar en la opción: «lumea rut» encuentra «Lumea Skin · Rutina de noche» y nada más. */
function filtrar(valor: string, busqueda: string) {
  const v = normal(valor)
  return normal(busqueda)
    .split(/\s+/)
    .filter(Boolean)
    .every((p) => v.includes(p))
    ? 1
    : 0
}

/** Las campañas (las que están en marcha primero) o las fichas del CRM, según el tipo. */
function gruposDe(tipo: TipoTarea, ctx: ContextoTareas): { titulo: string; opciones: Opcion[] }[] {
  if (tipo === "collabs" || tipo === "cobros") {
    const opcion = (c: (typeof ctx.collabs)[number]): Opcion => ({ clave: c.id, label: nombreDeCampana(c, ctx), donde: { tipo, collabId: c.id } })
    const activas = ctx.collabs.filter((c) => COLLABS_ACTIVAS.includes(c.estado))
    const otras = ctx.collabs.filter((c) => !COLLABS_ACTIVAS.includes(c.estado))
    return [
      { titulo: "En marcha", opciones: activas.map(opcion) },
      { titulo: "Terminadas y otras", opciones: otras.map(opcion) },
    ].filter((g) => g.opciones.length > 0)
  }
  if (tipo === "crm") {
    const grupos = new Map<string, Opcion[]>()
    for (const r of registrosPosibles(ctx)) grupos.set(r.grupo, [...(grupos.get(r.grupo) ?? []), { clave: `${r.tipo}:${r.id}`, label: r.label, donde: { tipo: "crm", registro: { tipo: r.tipo, id: r.id } } }])
    return [...grupos].map(([titulo, opciones]) => ({ titulo, opciones }))
  }
  return []
}

function claveDe(d: DondeTarea): string {
  if (d.tipo === "collabs" || d.tipo === "cobros") return d.collabId ?? SIN
  if (d.tipo === "crm") return d.registro ? `${d.registro.tipo}:${d.registro.id}` : SIN
  return SIN
}

/** «Lumea Skin · Rutina de noche», con la pieza si la tiene; «Sin campaña» si no es de ninguna. */
function textoDeQue(d: DondeTarea, ctx: ContextoTareas): string | null {
  const collab = collabDe(d, ctx)
  if (collab) {
    const pieza = d.tipo === "collabs" && d.piezaId ? collab.piezas.find((p) => p.id === d.piezaId) : undefined
    return `${nombreDeCampana(collab, ctx)}${pieza ? ` › ${pieza.titulo}` : ""}`
  }
  return registroDe(d, ctx)?.nombre ?? null
}

/**
 * De qué campaña es una tarea de Collabs o de Cobros, o de qué ficha del CRM es una del CRM, con
 * buscador y siempre con la opción de ninguna («Sin campaña»). No sale en las de sin tipo.
 */
export function SelectorDeQue({
  value,
  onChange,
  ctx,
  id,
  variant = "outline",
  className,
}: {
  value: DondeTarea
  onChange: (d: DondeTarea) => void
  ctx: ContextoTareas
  id?: string
  /** `inline`: en la ficha se lee como texto y se elige al pulsarlo, como los demás campos. */
  variant?: "outline" | "inline"
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const grupos = React.useMemo(() => gruposDe(value.tipo, ctx), [value.tipo, ctx])
  const etiqueta = etiquetaDeQue(value.tipo)
  if (!etiqueta) return null
  const ninguna = value.tipo === "crm" ? "Sin ficha" : "Sin campaña"
  const actual = claveDe(value)
  const texto = textoDeQue(value, ctx)
  const elegir = (d: DondeTarea) => {
    onChange(d)
    setOpen(false)
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === "inline" ? (
          <button id={id} type="button" aria-expanded={open} aria-haspopup="listbox" className={cn(inlineRestClass, "text-sm", !texto && "text-muted-foreground", className)}>
            <span className="truncate">{texto ?? ninguna}</span>
          </button>
        ) : (
          <Button id={id} type="button" variant="outline" role="combobox" aria-expanded={open} className={cn("h-9 w-full justify-between gap-2 px-3 font-normal", !texto && "text-muted-foreground", className)}>
            <span className="truncate">{texto ?? ninguna}</span>
            <ChevronDownIcon className="size-4 flex-none text-muted-foreground" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,24rem)] p-0">
        <Command filter={filtrar}>
          <CommandInput placeholder={value.tipo === "crm" ? "Busca una propuesta, una marca o un contacto…" : "Busca una campaña o una marca…"} />
          <CommandList className="max-h-72">
            <CommandEmpty>Nada coincide</CommandEmpty>
            <CommandGroup>
              <CommandItem value={ninguna} onSelect={() => elegir({ tipo: value.tipo })}>
                <span className="flex-1 text-muted-foreground">{ninguna}</span>
                {actual === SIN && <CheckIcon className="size-3.5" />}
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            {grupos.map((g) => (
              <CommandGroup key={g.titulo} heading={g.titulo}>
                {g.opciones.map((o) => (
                  <CommandItem key={o.clave} value={`${o.label} ${o.clave}`} onSelect={() => elegir(o.donde)}>
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.clave === actual && <CheckIcon className="size-3.5" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
