"use client"

import * as React from "react"
import { CheckIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { cn } from "cn"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { GRUPO_VACIO, type GrupoCondiciones } from "@/lib/filtros/core"
import { COLORES_OPCION, NOMBRES_COLOR, colorPorDefecto, type ColorOpcion } from "@/lib/base/campos"
import { ALCANCES_COLOR, colorAlDia, idBase, type AlcanceColor, type ColorVista, type ReglaColor } from "@/lib/base/vistas"
import { SelectorCampo, type CampoMenu } from "@/components/app/base/selector-campo"
import { CLASE_FUERTE } from "@/components/app/base/apariencia"
import { CabeceraMenu } from "@/components/app/base/menu-comun"
import { FilaCondicion, condicionNueva } from "@/components/app/base/panel-filtro"

/**
 * «Color», como en Airtable y algo más: la marca de cada fila puede salir de la opción de un campo
 * de selección, y cada regla pinta la fila entera o solo la celda de su campo (cada regla, su
 * color, a qué pinta y sus condiciones). Manda la primera regla que se cumple.
 */
export function MenuColor({ campos, color, onCambiar }: { campos: CampoMenu[]; color: ColorVista | undefined; onCambiar: (c: ColorVista | undefined) => void }) {
  const selecciones = campos.filter((c) => c.tipo === "select")
  const cambiar = (cambio: ColorVista) => onCambiar(colorAlDia({ ...color, ...cambio }, () => true))
  return (
    <div className="flex w-[min(94vw,720px)] flex-col text-[13px]">
      <CabeceraMenu titulo="Color de filas y celdas" ayuda="La marca de cada fila puede salir de un campo de selección. Cada regla pinta la fila entera o solo la celda de su campo; manda la primera que se cumple.">
        {color && <button type="button" className="hover:text-foreground" onClick={() => onCambiar(undefined)}>Quitar color</button>}
      </CabeceraMenu>
      <div className="flex items-center gap-2 px-4 pb-3">
        <span className="text-muted-foreground">Marca de la fila por</span>
        {selecciones.length ? (
          <div className="rounded-md border">
            <SelectorCampo campos={selecciones} value={color?.campo ?? ""} onChange={(id) => cambiar({ campo: id })} className="border-0" />
          </div>
        ) : (
          <span className="text-muted-foreground">ningún campo (no hay de selección única)</span>
        )}
        {color?.campo && <button type="button" className="text-muted-foreground hover:text-foreground" onClick={() => cambiar({ campo: undefined })}>Quitar</button>}
      </div>
      <ReglasColor campos={campos} reglas={color?.reglas ?? []} onCambiar={(reglas) => cambiar({ reglas })} />
    </div>
  )
}

function ReglasColor({ campos, reglas, onCambiar }: { campos: CampoMenu[]; reglas: ReglaColor[]; onCambiar: (r: ReglaColor[]) => void }) {
  const cambiar = (id: string, cambio: Partial<ReglaColor>) => onCambiar(reglas.map((r) => (r.id === id ? { ...r, ...cambio } : r)))
  return (
    <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto border-t px-4 py-3">
      {reglas.map((r) => (
        <div key={r.id} className="flex items-start gap-2">
          <SelectorColor value={r.color} onChange={(color) => cambiar(r.id, { color })} />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <SelectorAlcance value={r.alcance ?? "fila"} onChange={(alcance) => cambiar(r.id, { alcance })} />
            <CondicionesRegla campos={campos} filtro={r.filtro} onCambiar={(filtro) => cambiar(r.id, { filtro })} />
          </div>
          <button type="button" aria-label="Quitar este color" className="flex size-8 flex-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => onCambiar(reglas.filter((x) => x.id !== r.id))}>
            <Trash2Icon className="size-3.5" />
          </button>
        </div>
      ))}
      <button
        type="button"
        className="inline-flex items-center gap-1 self-start font-medium text-brand hover:underline"
        onClick={() => {
          const c = condicionNueva(campos)
          onCambiar([...reglas, { id: idBase("r"), color: colorPorDefecto(reglas.length), filtro: c ? { union: "y", condiciones: [c] } : GRUPO_VACIO }])
        }}
      >
        <PlusIcon className="size-3.5" /> Añadir regla de color
      </button>
    </div>
  )
}

/** A qué pinta una regla: la fila entera o solo la celda de su campo. */
export function SelectorAlcance({ value, onChange }: { value: AlcanceColor; onChange: (a: AlcanceColor) => void }) {
  return (
    <div role="radiogroup" aria-label="Qué pinta" className="inline-flex self-start rounded-md border p-0.5 text-xs">
      {(Object.keys(ALCANCES_COLOR) as AlcanceColor[]).map((a) => (
        <button
          key={a}
          type="button"
          role="radio"
          aria-checked={value === a}
          className={cn("rounded-[5px] px-2 py-1 text-muted-foreground hover:text-foreground", value === a && "bg-brand-soft text-foreground")}
          onClick={() => onChange(a)}
        >
          {ALCANCES_COLOR[a]}
        </button>
      ))}
    </div>
  )
}

function CondicionesRegla({ campos, filtro, onCambiar }: { campos: CampoMenu[]; filtro: GrupoCondiciones; onCambiar: (f: GrupoCondiciones) => void }) {
  return (
    <>
      {filtro.condiciones.map((c, i) => (
        <FilaCondicion
          key={`${i}-${c.campo}`}
          indice={i}
          union={filtro.union}
          onUnion={(union) => onCambiar({ ...filtro, union })}
          condicion={c}
          campos={campos}
          onChange={(cambio) => onCambiar({ ...filtro, condiciones: filtro.condiciones.map((x, j) => (j === i ? { ...x, ...cambio } : x)) })}
          onQuitar={() => onCambiar({ ...filtro, condiciones: filtro.condiciones.filter((_, j) => j !== i) })}
        />
      ))}
      <button
        type="button"
        className="inline-flex items-center gap-1 self-start pl-16 text-muted-foreground hover:text-foreground"
        onClick={() => {
          const c = condicionNueva(campos)
          if (c) onCambiar({ ...filtro, condiciones: [...filtro.condiciones, c] })
        }}
      >
        <PlusIcon className="size-3.5" /> Añadir condición
      </button>
    </>
  )
}

/** La muestra de color que se pulsa para elegir otro: los colores de las opciones. */
export function SelectorColor({ value, onChange }: { value: ColorOpcion; onChange: (c: ColorOpcion) => void }) {
  const [abierto, setAbierto] = React.useState(false)
  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`Color: ${NOMBRES_COLOR[value]}`} className="flex size-8 flex-none items-center justify-center rounded-md border hover:bg-muted">
          <span className={cn("size-4 rounded-full", CLASE_FUERTE[value])} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="grid w-auto grid-cols-5 gap-1 p-2">
        {COLORES_OPCION.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={NOMBRES_COLOR[c]}
            title={NOMBRES_COLOR[c]}
            className="flex size-7 items-center justify-center rounded-md hover:bg-muted"
            onClick={() => {
              onChange(c)
              setAbierto(false)
            }}
          >
            <span className={cn("flex size-5 items-center justify-center rounded-full text-background", CLASE_FUERTE[c])}>{c === value && <CheckIcon className="size-3" />}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

