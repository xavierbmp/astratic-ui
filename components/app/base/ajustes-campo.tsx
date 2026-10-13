"use client"

import * as React from "react"
import { PlusIcon, RotateCcwIcon } from "lucide-react"
import { cn } from "cn"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { operadorPorDefecto } from "@/lib/filtros/core"
import { TIPOS_CAMPO, TIPOS_CON_OPCIONES, colorPorDefecto, type CampoPropio, type DefCampo, type OpcionCampo } from "@/lib/base/campos"
import { colorAlDia, idBase, reglasDeCampo, type AjusteCampo, type ColorVista, type ReglaColor } from "@/lib/base/vistas"
import { statusToneClass } from "@/lib/status"
import { FichaOpcion, ICONO_TIPO, IconoCampo } from "@/components/app/base/apariencia"
import { EditorCampo } from "@/components/app/base/editor-campo"
import { ListaOrdenable } from "@/components/app/base/menu-comun"
import { SelectorAlcance, SelectorColor } from "@/components/app/base/menu-color"
import { FilaCondicion } from "@/components/app/base/panel-filtro"
import type { CampoMenu } from "@/components/app/base/selector-campo"

export type PestanaAjustes = "campo" | "colores"

/**
 * Los ajustes de un campo, con doble clic en su cabecera o «Editar el campo» de su menú:
 * - «Campo»: el de un campo propio es su editor (nombre, tipo, opciones con su color y su orden,
 *   formato y descripción); el de uno de serie, el orden y el color de sus opciones, de cada persona.
 * - «Colores»: pintar la fila entera o solo la celda según lo que tenga el campo, en la vista
 *   abierta. Son reglas de color de la vista, las mismas que en «Color» de la barra.
 */
export function AjustesCampo<T>({
  campo,
  campoMenu,
  propio,
  nombresUsados,
  color,
  pestana,
  onGuardarPropio,
  onAjustar,
  onColor,
  onCerrar,
}: {
  /** El campo como se ve (con los ajustes de la persona ya puestos). */
  campo: DefCampo<T>
  campoMenu: CampoMenu
  /** El campo propio tal como se guarda, si lo es y se puede editar. */
  propio?: CampoPropio
  nombresUsados: string[]
  color: ColorVista | undefined
  pestana: PestanaAjustes
  onGuardarPropio?: (campo: CampoPropio) => void
  onAjustar: (ajuste: AjusteCampo | undefined) => void
  onColor: (color: ColorVista | undefined) => void
  onCerrar: () => void
}) {
  return (
    <div className="flex w-[min(94vw,440px)] flex-col text-[13px]">
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <IconoCampo icono={ICONO_TIPO[campo.tipo]} />
        <span className="min-w-0 flex-1 truncate font-medium">{campo.nombre}</span>
        <span className="text-xs text-muted-foreground">{campo.propio ? TIPOS_CAMPO[campo.tipo].label : `${TIPOS_CAMPO[campo.tipo].label} · de serie`}</span>
      </div>
      <Tabs defaultValue={pestana} className="gap-0">
        <div className="px-3 pt-2.5">
          <TabsList className="w-full">
            <TabsTrigger value="campo">Campo</TabsTrigger>
            <TabsTrigger value="colores">Colores</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="campo">
          {propio && onGuardarPropio ? (
            <EditorCampo campo={propio} nombresUsados={nombresUsados} onGuardar={onGuardarPropio} onCancelar={onCerrar} />
          ) : (
            <CampoDeSerie campo={campo} onAjustar={onAjustar} />
          )}
        </TabsContent>
        <TabsContent value="colores">
          <ColoresDeCampo campo={campoMenu} color={color} onColor={onColor} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/** Un campo de serie: su nombre y su tipo no se tocan; sus opciones se ordenan y se colorean, solo para quien lo hace. */
function CampoDeSerie<T>({ campo, onAjustar }: { campo: DefCampo<T>; onAjustar: (ajuste: AjusteCampo | undefined) => void }) {
  const opciones = TIPOS_CON_OPCIONES.includes(campo.tipo) ? (campo.opciones ?? []) : []
  const guardar = (lista: OpcionCampo[]) => onAjustar({ opciones: lista.map((o) => ({ id: o.id, ...(o.tono || !o.color ? {} : { color: o.color }) })) })
  return (
    <div className="flex flex-col gap-3 p-3">
      <p className="text-muted-foreground">
        {campo.descripcion ?? TIPOS_CAMPO[campo.tipo].ayuda} Es un campo de serie: su nombre y su tipo no se cambian, y se oculta desde su menú.
      </p>
      {campo.tipo === "vinculo" && <p className="text-muted-foreground">Cada {campo.vinculo?.objeto ?? "registro"} se abre al pulsarla en la celda.</p>}
      {opciones.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-medium">Opciones</span>
            <button type="button" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" onClick={() => onAjustar(undefined)}>
              <RotateCcwIcon className="size-3.5" /> Como venían
            </button>
          </div>
          <p className="text-xs text-muted-foreground">Las pone el workspace. Arrastra para cambiar su orden y pulsa la muestra para cambiar su color: solo para ti, en todas tus vistas.</p>
          <ListaOrdenable items={opciones} clave={(o) => o.id} onReordenar={guardar} className="flex max-h-64 flex-col gap-1 overflow-y-auto">
            {(o, asa) => (
              <div className="flex items-center gap-1.5">
                {asa}
                {o.tono ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex size-8 flex-none items-center justify-center rounded-md border opacity-60">
                        <span className={cn("size-4 rounded-full", statusToneClass[o.tono])} />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>Es un estado: lleva su color en todo el workspace</TooltipContent>
                  </Tooltip>
                ) : (
                  <SelectorColor value={o.color ?? "gris"} onChange={(color) => guardar(opciones.map((x) => (x.id === o.id ? { ...x, color } : x)))} />
                )}
                <FichaOpcion label={o.label} color={o.color} tono={o.tono} />
              </div>
            )}
          </ListaOrdenable>
        </div>
      )}
    </div>
  )
}

/**
 * Las reglas de color de este campo en la vista abierta: una condición sobre el campo («contiene
 * urgente»), su color y si pinta la fila entera o solo la celda.
 */
function ColoresDeCampo({ campo, color, onColor }: { campo: CampoMenu; color: ColorVista | undefined; onColor: (color: ColorVista | undefined) => void }) {
  const todas = color?.reglas ?? []
  const deEsteCampo = reglasDeCampo(color, campo.id)
  const guardar = (reglas: ReglaColor[]) => onColor(colorAlDia({ ...color, reglas }, () => true))
  const cambiar = (id: string, cambio: Partial<ReglaColor>) => guardar(todas.map((r) => (r.id === id ? { ...r, ...cambio } : r)))
  const quitar = (id: string) => guardar(todas.filter((r) => r.id !== id))
  const anadir = () =>
    guardar([...todas, { id: idBase("r"), color: colorPorDefecto(todas.length), alcance: "celda", filtro: { union: "y", condiciones: [{ campo: campo.id, op: operadorPorDefecto(campo.tipo) }] } }])

  return (
    <div className="flex flex-col gap-3 p-3">
      <p className="text-muted-foreground">
        Pinta la celda o la fila entera según lo que tenga este campo («contiene urgente», «es mayor que 1.000»). Vale para esta vista; todas sus reglas están en «Color» de la barra.
      </p>
      {deEsteCampo.map((r) => (
        <div key={r.id} className="flex flex-col gap-2 rounded-md border p-2">
          {r.filtro.condiciones.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <SelectorColor value={r.color} onChange={(nuevo) => cambiar(r.id, { color: nuevo })} />
              <div className="min-w-0 flex-1">
                <FilaCondicion
                  campoFijo
                  indice={i}
                  union={r.filtro.union}
                  onUnion={(union) => cambiar(r.id, { filtro: { ...r.filtro, union } })}
                  condicion={c}
                  campos={[campo]}
                  onChange={(parcial) => cambiar(r.id, { filtro: { ...r.filtro, condiciones: r.filtro.condiciones.map((x, j) => (j === i ? { ...x, ...parcial } : x)) } })}
                  onQuitar={() => quitar(r.id)}
                />
              </div>
            </div>
          ))}
          <div className="pl-10">
            <SelectorAlcance value={r.alcance ?? "fila"} onChange={(alcance) => cambiar(r.id, { alcance })} />
          </div>
        </div>
      ))}
      <button type="button" className="inline-flex items-center gap-1 self-start font-medium text-brand hover:underline" onClick={anadir}>
        <PlusIcon className="size-3.5" /> Añadir color
      </button>
    </div>
  )
}
