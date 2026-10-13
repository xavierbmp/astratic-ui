"use client"

import * as React from "react"
import { ChevronDownIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MODOS_FECHA, type Agrupacion, type ModoFecha } from "@/lib/vistas/core"
import { MAX_NIVELES_GRUPO, type VistaBase } from "@/lib/base/vistas"
import { ListaCampos, SelectorCampo, type CampoMenu } from "@/components/app/base/selector-campo"
import { IconoCampo } from "@/components/app/base/apariencia"
import { CabeceraMenu, CopiarDeVista } from "@/components/app/base/menu-comun"
import { SelectorSentido } from "@/components/app/base/menu-orden"

/** Los que se sugieren primero para agrupar, como en Airtable: listas, casillas y fechas. */
const SUGERIDOS = new Set(["select", "multiselect", "booleano"])

/** Lo nuevo al elegir un campo: las fechas, por día (como Airtable); el resto, en su orden. */
const nivelNuevo = (campo: CampoMenu): Agrupacion => ({ campo: campo.id, ordenGrupos: "asc", ...(campo.tipo === "fecha" ? { modoFecha: "dia" as ModoFecha } : {}) })

/**
 * «Agrupar», como en Airtable: hasta tres niveles, cada uno con su campo y su orden (y, en las
 * fechas, por día, semana o mes); «Añadir subgrupo»; «Contraer todo» y «Expandir todos».
 */
export function MenuGrupos({
  campos,
  grupos,
  otrasVistas,
  onCambiar,
  onContraer,
  onExpandir,
}: {
  campos: CampoMenu[]
  grupos: Agrupacion[]
  otrasVistas: VistaBase[]
  onCambiar: (g: Agrupacion[]) => void
  onContraer: () => void
  onExpandir: () => void
}) {
  const [todos, setTodos] = React.useState(false)
  const [anadiendo, setAnadiendo] = React.useState(false)
  const libres = campos.filter((c) => !grupos.some((g) => g.campo === c.id))
  const sugeridos = libres.filter((c) => SUGERIDOS.has(c.tipo))
  const elegir = (id: string) => {
    const campo = campos.find((c) => c.id === id)
    if (campo) onCambiar([...grupos, nivelNuevo(campo)])
  }

  return (
    <div className="flex w-[min(94vw,480px)] flex-col text-[13px]">
      <CabeceraMenu titulo="Agrupar por" ayuda="Junta los registros por el valor de un campo. Hasta tres niveles: marca, y dentro, por estado.">
        {grupos.length > 0 ? (
          <>
            <button type="button" className="hover:text-foreground" onClick={onContraer}>Contraer todo</button>
            <button type="button" className="hover:text-foreground" onClick={onExpandir}>Expandir todos</button>
          </>
        ) : (
          <CopiarDeVista vistas={otrasVistas} onCopiar={(v) => onCambiar(v.grupos)} />
        )}
      </CabeceraMenu>

      {grupos.length === 0 ? (
        todos || sugeridos.length === 0 ? (
          <ListaCampos campos={libres} onElegir={elegir} className="border-t" />
        ) : (
          <div className="flex flex-col border-t px-2 py-1">
            <span className="px-2 py-1.5 text-muted-foreground">Elige un campo para agrupar por</span>
            {sugeridos.map((c) => (
              <button key={c.id} type="button" className="flex h-8 items-center gap-2 rounded-sm px-2 text-left hover:bg-muted" onClick={() => elegir(c.id)}>
                <IconoCampo icono={c.icono} />
                <span className="truncate">{c.label}</span>
              </button>
            ))}
            <button type="button" className="flex h-8 items-center gap-2 rounded-sm px-2 text-left text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setTodos(true)}>
              <ChevronDownIcon className="size-3.5" /> Ver todos los campos
            </button>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-2 px-4 pb-3">
          {grupos.map((g, i) => {
            const campo = campos.find((c) => c.id === g.campo)
            const cambiar = (cambio: Partial<Agrupacion>) => onCambiar(grupos.map((x, j) => (j === i ? { ...x, ...cambio } : x)))
            return (
              <div key={g.campo} className="flex items-stretch divide-x rounded-md border bg-background">
                <SelectorCampo
                  campos={[...(campo ? [campo] : []), ...libres]}
                  value={g.campo}
                  onChange={(id) => {
                    const nuevo = campos.find((c) => c.id === id)
                    if (nuevo) cambiar({ ...nivelNuevo(nuevo), ordenGrupos: g.ordenGrupos })
                  }}
                  className="w-48 rounded-none rounded-l-md border-0"
                />
                <SelectorSentido tipo={campo?.tipo} value={g.ordenGrupos === "desc" ? "desc" : "asc"} onChange={(dir) => cambiar({ ordenGrupos: dir })} />
                {campo?.tipo === "fecha" && <SelectorModoFecha value={g.modoFecha ?? "dia"} onChange={(modoFecha) => cambiar({ modoFecha })} />}
                <span className="flex-1" />
                <button type="button" aria-label="Quitar este nivel" className="flex w-8 flex-none items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => onCambiar(grupos.filter((_, j) => j !== i))}>
                  <Trash2Icon className="size-3.5" />
                </button>
              </div>
            )
          })}
          {grupos.length < MAX_NIVELES_GRUPO && libres.length > 0 && (
            <Popover open={anadiendo} onOpenChange={setAnadiendo}>
              <PopoverTrigger asChild>
                <button type="button" className="inline-flex items-center gap-1 self-start text-muted-foreground hover:text-foreground">
                  <PlusIcon className="size-3.5" /> Añadir subgrupo
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-64 p-0">
                <ListaCampos
                  campos={libres}
                  onElegir={(id) => {
                    elegir(id)
                    setAnadiendo(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      )}
    </div>
  )
}

const MODOS_GRUPO_FECHA: ModoFecha[] = ["dia", "semana", "mes", "relativo"]

function SelectorModoFecha({ value, onChange }: { value: ModoFecha; onChange: (m: ModoFecha) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="flex h-8 flex-none items-center gap-1 px-2 hover:bg-muted/60">
          {MODOS_FECHA[value]}
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {MODOS_GRUPO_FECHA.map((m) => (
          <DropdownMenuItem key={m} onSelect={() => onChange(m)}>{MODOS_FECHA[m]}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
