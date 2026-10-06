"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, MapPinIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { inlineRestClass } from "@/components/app/inline-field"
import { PAGINAS_TAREA, type DondeTarea, type PaginaTarea } from "@/lib/influencer/modelo"
import { migasDonde, tiposDePagina, type ContextoTareas } from "@/lib/influencer/tareas"

type Opcion = { clave: string; donde: DondeTarea; label: string; detalle?: string; busqueda: string }
type Grupo = { titulo: string; opciones: Opcion[] }

const claveDe = (d: DondeTarea) => JSON.stringify(d)

const normal = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")

/** Cada palabra escrita tiene que estar en la opción: «lumea cob» encuentra los cobros de Lumea y nada más. */
function filtrar(valor: string, busqueda: string) {
  const v = normal(valor)
  return normal(busqueda)
    .split(/\s+/)
    .filter(Boolean)
    .every((p) => v.includes(p))
    ? 1
    : 0
}

/** Todas las opciones de dónde puede vivir una tarea, agrupadas: cada campaña con sus tipos y piezas, el CRM y Personal. */
function gruposDeOpciones(ctx: ContextoTareas, limitar?: { pagina?: PaginaTarea; collabId?: string }): Grupo[] {
  const grupos: Grupo[] = []
  const nombreMarca = (id: string) => ctx.marcas.find((m) => m.id === id)?.nombre ?? ""
  const paginas: PaginaTarea[] = limitar?.collabId ? ["campanas"] : limitar?.pagina ? [limitar.pagina] : ["campanas", "crm", "personal"]
  if (paginas.includes("campanas")) {
    const collabs = ctx.collabs.filter((c) => !limitar?.collabId || c.id === limitar.collabId)
    for (const c of collabs) {
      const nombre = `${nombreMarca(c.marcaId)} · ${c.campana}`
      const opciones: Opcion[] = []
      for (const t of tiposDePagina("campanas")) {
        const donde = { pagina: "campanas", tipo: t.id, collabId: c.id } as DondeTarea // `t.id` es de Campañas: sale de sus tipos.
        opciones.push({ clave: claveDe(donde), donde, label: t.label, busqueda: `${nombre} ${t.label} campaña` })
        if (t.id === "contenidos") {
          for (const p of c.piezas) {
            const conPieza: DondeTarea = { pagina: "campanas", tipo: "contenidos", collabId: c.id, piezaId: p.id }
            opciones.push({ clave: claveDe(conPieza), donde: conPieza, label: `Contenidos › ${p.titulo}`, busqueda: `${nombre} contenidos ${p.titulo}` })
          }
        }
      }
      grupos.push({ titulo: `Campañas · ${nombre}`, opciones })
    }
  }
  if (paginas.includes("crm")) {
    grupos.push({
      titulo: "CRM",
      opciones: tiposDePagina("crm").map((t) => {
        const donde = { pagina: "crm", tipo: t.id } as DondeTarea // `t.id` es del CRM: sale de sus tipos.
        return { clave: claveDe(donde), donde, label: t.label, detalle: t.id === "propuesta" || t.id === "marca" || t.id === "contacto" ? "sin elegir cuál" : undefined, busqueda: `crm ${t.label}` }
      }),
    })
    const registros = (titulo: string, tipo: "propuesta" | "marca" | "contacto", lista: { id: string; label: string }[]) =>
      grupos.push({
        titulo,
        opciones: lista.map((r) => {
          const donde: DondeTarea = { pagina: "crm", tipo, registroId: r.id }
          return { clave: claveDe(donde), donde, label: r.label, busqueda: `crm ${tipo} ${r.label}` }
        }),
      })
    registros("CRM · Propuestas", "propuesta", ctx.propuestas.map((p) => ({ id: p.id, label: `${nombreMarca(p.marcaId)} · ${p.campana}` })))
    registros("CRM · Marcas", "marca", ctx.marcas.map((m) => ({ id: m.id, label: m.nombre })))
    registros("CRM · Contactos", "contacto", ctx.contactos.map((c) => ({ id: c.id, label: `${c.nombre} (${nombreMarca(c.marcaId)})` })))
  }
  if (paginas.includes("personal")) {
    grupos.push({
      titulo: PAGINAS_TAREA.personal,
      opciones: tiposDePagina("personal").map((t) => {
        const donde = { pagina: "personal", tipo: t.id } as DondeTarea // `t.id` es de Personal: sale de sus tipos.
        return { clave: claveDe(donde), donde, label: t.label, busqueda: `personal ${t.label}` }
      }),
    })
  }
  return grupos
}

/**
 * Dónde vive una tarea: su página y su tipo (y la campaña, la pieza o el registro del CRM), en un
 * solo desplegable con buscador. «lumea cob» encuentra «Campañas · Lumea Skin · Rutina de noche ›
 * Cobros». Con `limitar`, solo lo de una página o una campaña (la pestaña o la ficha ya lo dicen).
 */
export function DondeSelector({
  value,
  onChange,
  ctx,
  limitar,
  defaultOpen,
  invalido,
  id,
  variant = "outline",
  className,
}: {
  value?: DondeTarea
  onChange: (d: DondeTarea) => void
  ctx: ContextoTareas
  limitar?: { pagina?: PaginaTarea; collabId?: string }
  defaultOpen?: boolean
  invalido?: boolean
  id?: string
  /** `inline`: en la ficha se lee como texto y se elige al pulsarlo, como los demás campos. */
  variant?: "outline" | "inline"
  className?: string
}) {
  const [open, setOpen] = React.useState(!!defaultOpen)
  const grupos = React.useMemo(() => gruposDeOpciones(ctx, limitar), [ctx, limitar])
  const actual = value ? claveDe(value) : undefined
  const migas = value ? migasDonde(value, ctx).map((m) => m.label) : []
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {variant === "inline" ? (
          <button id={id} type="button" aria-expanded={open} aria-haspopup="listbox" className={cn(inlineRestClass, "text-sm", className)}>
            <span className="truncate">{value ? migas.join(" › ") : "Elige la página y el tipo"}</span>
          </button>
        ) : (
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalido || undefined}
            className={cn("h-9 w-full justify-between gap-2 px-3 font-normal", !value && "text-muted-foreground", className)}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPinIcon className="size-4 flex-none text-muted-foreground" aria-hidden />
              <span className="truncate">{value ? migas.join(" › ") : "Elige la página y el tipo"}</span>
            </span>
            <ChevronDownIcon className="size-4 flex-none text-muted-foreground" />
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(92vw,30rem)] p-0">
        <Command filter={filtrar}>
          <CommandInput placeholder="Busca una campaña, una marca o un tipo…" />
          <CommandList className="max-h-80">
            <CommandEmpty>Nada coincide</CommandEmpty>
            {grupos.map((g) => (
              <CommandGroup key={g.titulo} heading={g.titulo}>
                {g.opciones.map((o) => (
                  <CommandItem
                    key={o.clave}
                    value={`${o.busqueda} ${o.clave}`}
                    onSelect={() => {
                      onChange(o.donde)
                      setOpen(false)
                    }}
                  >
                    <span className="flex-1 truncate">{o.label}</span>
                    {o.detalle && <span className="text-xs text-muted-foreground">{o.detalle}</span>}
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
