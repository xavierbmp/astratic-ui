"use client"

import * as React from "react"
import { ChevronDownIcon, PlusIcon, XIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { TipoFiltro } from "@/lib/filtros/core"
import type { Orden } from "@/lib/vistas/core"
import type { VistaBase } from "@/lib/base/vistas"
import { ListaCampos, SelectorCampo, type CampoMenu } from "@/components/app/base/selector-campo"
import { CabeceraMenu, CopiarDeVista, ListaOrdenable } from "@/components/app/base/menu-comun"

/** Cómo se nombra cada sentido según el tipo, como en Airtable: A → Z, 1 → 9, primero → último. */
export function sentidos(tipo: TipoFiltro | undefined): Record<"asc" | "desc", string> {
  switch (tipo) {
    case "numero":
    case "fecha":
      return { asc: "1 → 9", desc: "9 → 1" }
    case "booleano":
      return { asc: "☐ → ☑", desc: "☑ → ☐" }
    case "select":
    case "multiselect":
      return { asc: "Primero → último", desc: "Último → primero" }
    default:
      return { asc: "A → Z", desc: "Z → A" }
  }
}

/** Un sentido para elegir, en un desplegable dentro de la caja partida. */
export function SelectorSentido({ tipo, value, onChange }: { tipo: TipoFiltro | undefined; value: "asc" | "desc"; onChange: (d: "asc" | "desc") => void }) {
  const nombres = sentidos(tipo)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex h-8 w-36 flex-none items-center justify-between gap-1 px-2 text-left hover:bg-muted/60">
          {nombres[value]}
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onSelect={() => onChange("asc")}>{nombres.asc}</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onChange("desc")}>{nombres.desc}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * «Ordenar», como en Airtable: sin orden, la lista de campos para elegir el primero; con orden, una
 * fila por campo (campo · sentido · quitar · asa) y «Añadir otra clasificación». Manda el primero
 * y los demás desempatan.
 */
export function MenuOrden({ campos, orden, otrasVistas, onCambiar }: { campos: CampoMenu[]; orden: Orden[]; otrasVistas: VistaBase[]; onCambiar: (o: Orden[]) => void }) {
  const [anadiendo, setAnadiendo] = React.useState(false)
  const libres = campos.filter((c) => !orden.some((o) => o.campo === c.id))
  const conClave = orden.map((o) => ({ ...o, clave: o.campo }))
  return (
    <div className="flex w-[min(94vw,460px)] flex-col text-[13px]">
      <CabeceraMenu titulo="Ordenar por" ayuda="Manda el primer campo; los siguientes ordenan lo que empata. Lo vacío va siempre al final.">
        <CopiarDeVista vistas={otrasVistas} onCopiar={(v) => onCambiar(v.orden)} />
      </CabeceraMenu>
      {orden.length === 0 ? (
        <ListaCampos campos={campos} onElegir={(id) => onCambiar([{ campo: id, dir: "asc" }])} className="border-t" />
      ) : (
        <>
          <ListaOrdenable items={conClave} clave={(o) => o.clave} onReordenar={(xs) => onCambiar(xs.map(({ campo, dir }) => ({ campo, dir })))} className="flex flex-col gap-2 px-4 py-1">
            {(o, asa) => {
              const campo = campos.find((c) => c.id === o.campo)
              const cambiar = (cambio: Partial<Orden>) => onCambiar(orden.map((x) => (x.campo === o.campo ? { ...x, ...cambio } : x)))
              return (
                <div className="flex items-stretch divide-x rounded-md border bg-background">
                  <SelectorCampo campos={[...(campo ? [campo] : []), ...libres]} value={o.campo} onChange={(id) => cambiar({ campo: id })} className="w-48 rounded-none rounded-l-md border-0" />
                  <SelectorSentido tipo={campo?.tipo} value={o.dir} onChange={(dir) => cambiar({ dir })} />
                  <button type="button" aria-label="Quitar este orden" className="flex w-8 flex-none items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => onCambiar(orden.filter((x) => x.campo !== o.campo))}>
                    <XIcon className="size-3.5" />
                  </button>
                  {asa}
                </div>
              )
            }}
          </ListaOrdenable>
          {libres.length > 0 && (
            <Popover open={anadiendo} onOpenChange={setAnadiendo}>
              <PopoverTrigger asChild>
                <button type="button" className="mx-4 mt-1 mb-3 inline-flex items-center gap-1 self-start text-muted-foreground hover:text-foreground">
                  <PlusIcon className="size-3.5" /> Añadir otra clasificación
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-0">
                <ListaCampos
                  campos={libres}
                  onElegir={(id) => {
                    onCambiar([...orden, { campo: id, dir: "asc" }])
                    setAnadiendo(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
        </>
      )}
    </div>
  )
}
