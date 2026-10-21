"use client"

import * as React from "react"
import { toast } from "sonner"
import { FilePlus2Icon, ListTodoIcon, PencilIcon, PlusIcon, RotateCcwIcon, ZapIcon } from "lucide-react"
import { cn } from "cn"
import { EVENTOS, describirAccion, difiereDeSerie, esDeSerie, reglaNueva, reglasDelBloque, restaurarDeSerie, type Automatizacion, type BloqueAutomatizable } from "@/lib/influencer/automatizaciones"
import { idNuevo } from "@/lib/influencer/tareas"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { FormularioDialog } from "@/components/app/formulario/formulario-dialog"
import { AutomatizacionFormulario } from "@/components/influencer/automatizacion-formulario"

type Editando = { regla: Automatizacion; nueva: boolean }

const NOMBRE_VARIABLE: Record<string, string> = { marca: "Marca", campana: "Campaña", pieza: "Contenido", parte: "Guion o contenido" }

/** El texto con sus variables («{marca}») como una etiqueta con su nombre, que se lee mejor que las llaves. */
function ConVariables({ texto }: { texto: string }) {
  return texto.split(/(\{\w+\})/).map((trozo, i) => {
    const variable = /^\{(\w+)\}$/.exec(trozo)?.[1]
    return variable && NOMBRE_VARIABLE[variable] ? (
      <span key={i} className="mx-0.5 rounded bg-muted px-1 py-px text-xs font-medium text-foreground">
        {NOMBRE_VARIABLE[variable]}
      </span>
    ) : (
      <React.Fragment key={i}>{trozo}</React.Fragment>
    )
  })
}

/**
 * Las automatizaciones de un bloque (Xavier, 2026-10-15: «si un registro está en el estado X, se
 * crea un registro en Y o la tarea Z»): cada una en una línea, con su interruptor, lo que la dispara
 * y lo que hace; se crean, se cambian y se borran (con «Deshacer»), y las de serie se recuperan con
 * «Restaurar por defecto». `reglas` son todas las suyas: aquí solo se tocan las de este bloque.
 */
export function AutomatizacionesBloque({ bloque, reglas, onCambiar, className }: { bloque: BloqueAutomatizable; reglas: Automatizacion[]; onCambiar: (reglas: Automatizacion[]) => void; className?: string }) {
  const [editando, setEditando] = React.useState<Editando | null>(null)
  const suyas = reglasDelBloque(reglas, bloque)
  const cambiar = (r: Automatizacion) => onCambiar(reglas.some((x) => x.id === r.id) ? reglas.map((x) => (x.id === r.id ? r : x)) : [...reglas, r])
  const borrar = (r: Automatizacion) => {
    const antes = reglas
    onCambiar(reglas.filter((x) => x.id !== r.id))
    setEditando(null)
    toast.success("Automatización eliminada", { description: esDeSerie(r) ? "Predeterminada. Se recupera con «Restaurar por defecto»." : undefined, action: { label: "Deshacer", onClick: () => onCambiar(antes) } })
  }
  const restaurar = () => {
    const antes = reglas
    onCambiar(restaurarDeSerie(reglas, bloque))
    toast.success("Automatizaciones predeterminadas restauradas", { action: { label: "Deshacer", onClick: () => onCambiar(antes) } })
  }

  return (
    <div data-slot="automatizaciones-bloque" className={cn("flex flex-col gap-2", className)}>
      {suyas.length === 0 ? (
        <p className="rounded-xl bg-background/70 px-3 py-4 text-center text-sm text-muted-foreground">Sin automatizaciones. Crea una o restaura las predeterminadas.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {suyas.map((r) => {
            const Icono = r.accion.tipo === "registro" ? FilePlus2Icon : ListTodoIcon
            return (
              <li key={r.id} className="group flex items-start gap-3 rounded-xl bg-background/70 px-3 py-2.5 hover:bg-muted">
                <Switch checked={r.activa} onCheckedChange={(activa) => cambiar({ ...r, activa })} aria-label={`${r.activa ? "Apagar" : "Encender"}: ${describirAccion(r.accion)}`} className="mt-0.5" />
                <button type="button" onClick={() => setEditando({ regla: r, nueva: false })} className={cn("min-w-0 flex-1 text-left text-sm", !r.activa && "text-muted-foreground")}>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ZapIcon className="size-3.5 flex-none" aria-hidden />
                    {EVENTOS[r.evento].label}
                    {esDeSerie(r) && <span className="rounded-full bg-muted px-1.5 text-[11px]">De serie</span>}
                  </span>
                  <span className="mt-0.5 flex items-start gap-1.5">
                    <Icono className="mt-0.5 size-4 flex-none text-muted-foreground" aria-hidden />
                    <span className="min-w-0">
                      <ConVariables texto={describirAccion(r.accion)} />
                    </span>
                  </span>
                </button>
                <Button type="button" variant="ghost" size="icon-xs" aria-label="Cambiar la automatización" className="text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100" onClick={() => setEditando({ regla: r, nueva: false })}>
                  <PencilIcon />
                </Button>
              </li>
            )
          })}
        </ul>
      )}
      <div className="flex flex-wrap items-center gap-1">
        <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={() => setEditando({ regla: reglaNueva(bloque, idNuevo("auto")), nueva: true })}>
          <PlusIcon /> Nueva automatización
        </Button>
        {difiereDeSerie(reglas, bloque) && (
          <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" onClick={restaurar}>
            <RotateCcwIcon /> Restaurar por defecto
          </Button>
        )}
      </div>

      <FormularioDialog open={editando !== null} onOpenChange={(o) => !o && setEditando(null)}>
        {editando && (
          <AutomatizacionFormulario
            key={editando.regla.id}
            regla={editando.regla}
            bloque={bloque}
            nueva={editando.nueva}
            onCancelar={() => setEditando(null)}
            onEliminar={editando.nueva ? undefined : () => borrar(editando.regla)}
            onGuardar={(r) => {
              cambiar(r)
              setEditando(null)
              toast.success(editando.nueva ? "Automatización creada" : "Automatización guardada")
            }}
          />
        )}
      </FormularioDialog>
    </div>
  )
}
