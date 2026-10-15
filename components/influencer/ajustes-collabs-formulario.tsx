"use client"

import * as React from "react"
import { ChevronDownIcon, PackageIcon, PlusIcon, Settings2Icon, Trash2Icon, XIcon } from "lucide-react"
import { cn } from "cn"
import { CAMPOS_BRIEF, LISTA_CAMPOS_BRIEF, LISTA_TIPOS_PIEZA, TIPOS_PIEZA, type AjustesCollabs, type FormatoPieza, type PackContenido, type TipoCondicion } from "@/lib/influencer/modelo"
import { ICONO_CONDICION_DE_SERIE, esquemaAjustesCollabs } from "@/lib/influencer/ajustes-collabs"
import { idNuevo } from "@/lib/influencer/tareas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ListaOrdenable } from "@/components/app/base/menu-comun"
import { CampoFormulario, Formulario, FormularioCabecera, FormularioCuerpo, FormularioPie } from "@/components/app/formulario/formulario-dialog"
import { CasillasOpcion, IconosOpcion } from "@/components/app/formulario/opciones-visuales"
import { SelectorBuscable } from "@/components/app/formulario/selector-buscable"
import { ICONOS_PIEZA, IconoTipoPieza } from "@/components/influencer/piezas-editor"
import { SelectorPlataforma } from "@/components/influencer/plataformas"
import { SelectorIconoCondicion } from "@/components/influencer/condiciones-editor"

const OPCIONES_TIPO = LISTA_TIPOS_PIEZA.map((t) => {
  const Icono = ICONOS_PIEZA[t]
  return { value: t, label: TIPOS_PIEZA[t].label, icono: <Icono /> }
})
const OPCIONES_BRIEF = LISTA_CAMPOS_BRIEF.map((c) => ({ value: c, label: CAMPOS_BRIEF[c].label, descripcion: CAMPOS_BRIEF[c].descripcion }))

/** Una fila de formato: nombre y guion a la vista; qué se entrega y dónde se publica, al desplegarla. */
function FilaFormato({ formato, asa, onCambiar, onQuitar }: { formato: FormatoPieza; asa: React.ReactNode; onCambiar: (f: FormatoPieza) => void; onQuitar: () => void }) {
  const [abierta, setAbierta] = React.useState(false)
  return (
    <div className="rounded-lg border bg-card p-1.5">
      <div className="flex items-center gap-2">
        {asa}
        <IconoTipoPieza tipo={formato.tipo} />
        <Input value={formato.nombre} onChange={(e) => onCambiar({ ...formato, nombre: e.target.value })} aria-label="Nombre del formato" className="h-8 min-w-0 flex-1" />
        {formato.tipo !== "texto" && (
          <label className="flex flex-none items-center gap-1.5 text-xs text-muted-foreground">
            <Switch size="sm" checked={formato.conGuion} onCheckedChange={(c) => onCambiar({ ...formato, conGuion: c })} aria-label={`${formato.nombre} pide script`} /> Script
          </label>
        )}
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Más de ${formato.nombre}`} aria-expanded={abierta} onClick={() => setAbierta((a) => !a)}>
          <ChevronDownIcon className={cn("transition-transform", abierta && "rotate-180")} />
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar ${formato.nombre}`} onClick={onQuitar}>
          <Trash2Icon />
        </Button>
      </div>
      {abierta && (
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 pb-1 pl-7 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            Qué entregas <IconosOpcion tamano="sm" aria-label="Qué entregas" opciones={OPCIONES_TIPO} valor={formato.tipo} onChange={(t) => t && onCambiar({ ...formato, tipo: t, conGuion: t !== "texto" && formato.conGuion })} />
          </span>
          <span className="flex items-center gap-2">
            Dónde <SelectorPlataforma tamano="sm" aria-label="Dónde se publica" value={formato.plataforma} onChange={(plataforma) => onCambiar({ ...formato, plataforma })} className="w-48" />
          </span>
        </div>
      )}
    </div>
  )
}

/** Un pack: su nombre y sus entregables como fichas (la × quita uno); «+» añade otro formato. */
function FilaPack({ pack, formatos, asa, onCambiar, onQuitar }: { pack: PackContenido; formatos: FormatoPieza[]; asa: React.ReactNode; onCambiar: (p: PackContenido) => void; onQuitar: () => void }) {
  return (
    <div className="rounded-lg border bg-card p-1.5">
      <div className="flex items-center gap-2">
        {asa}
        <span className="grid size-6 flex-none place-items-center rounded-md bg-brand-soft text-brand">
          <PackageIcon className="size-3.5" />
        </span>
        <Input value={pack.nombre} onChange={(e) => onCambiar({ ...pack, nombre: e.target.value })} aria-label="Nombre del pack" placeholder="Lanzamiento" className="h-8 min-w-0 flex-1" />
        <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar ${pack.nombre || "el pack"}`} onClick={onQuitar}>
          <Trash2Icon />
        </Button>
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-1 pl-7">
        {pack.formatos.map((id, i) => {
          const f = formatos.find((x) => x.id === id)
          if (!f) return null
          return (
            <span key={`${id}-${i}`} className="inline-flex h-7 items-center gap-1 rounded-md bg-muted pr-0.5 pl-1 text-xs">
              <IconoTipoPieza tipo={f.tipo} className="size-5 bg-card" />
              {f.nombre}
              <button type="button" aria-label={`Quitar ${f.nombre} del pack`} onClick={() => onCambiar({ ...pack, formatos: pack.formatos.filter((_, j) => j !== i) })} className="grid size-5 place-items-center rounded-sm text-muted-foreground hover:bg-card hover:text-foreground">
                <XIcon className="size-3" />
              </button>
            </span>
          )
        })}
        <SelectorBuscable
          aspecto="boton"
          aria-label={`Añadir un entregable a ${pack.nombre || "el pack"}`}
          disparador={
            <span className="inline-flex h-7 items-center gap-1 rounded-md px-1.5 text-xs font-medium text-brand hover:bg-brand-soft">
              <PlusIcon className="size-3.5" /> Entregable
            </span>
          }
          opciones={formatos.map((f) => ({ value: f.id, label: f.nombre, icono: <IconoTipoPieza tipo={f.tipo} /> }))}
          valor={undefined}
          placeholder="Busca un formato"
          onChange={(id) => id && onCambiar({ ...pack, formatos: [...pack.formatos, id] })}
        />
      </div>
    </div>
  )
}

/**
 * Los ajustes de la tabla de collabs: los valores de serie del alta que cambia cada influencer. Los
 * días del guion antes de publicar, sus formatos de pieza y sus condiciones (con su icono y sus días
 * de serie; ordenar arrastrando, cambiar en el sitio, añadir y quitar), sus packs de contenido (varios
 * entregables de un clic) y los apartados que le pide a la marca de serie. Pantalla
 * de un `FormularioDialog`: sola, desde el engranaje de la tabla, o encima del alta.
 */
export function AjustesCollabsFormulario({
  ajustes,
  migas,
  onVolver,
  onCancelar,
  onGuardar,
  enPagina,
}: {
  ajustes: AjustesCollabs
  migas?: string
  onVolver?: () => void
  onCancelar: () => void
  onGuardar: (ajustes: AjustesCollabs) => void
  /** Pintado en una página (Ajustes de bloques), sin la cabecera del diálogo: lo titula el bloque que lo lleva. */
  enPagina?: boolean
}) {
  const [a, setA] = React.useState(ajustes)
  const [error, setError] = React.useState<string>()
  const cambiar = (parcial: Partial<AjustesCollabs>) => {
    setA((x) => ({ ...x, ...parcial }))
    setError(undefined)
  }
  const cambiarFormato = (f: FormatoPieza) => cambiar({ formatos: a.formatos.map((x) => (x.id === f.id ? f : x)) })
  const cambiarCondicion = (c: TipoCondicion) => cambiar({ condiciones: a.condiciones.map((x) => (x.id === c.id ? c : x)) })
  const cambiarPack = (p: PackContenido) => cambiar({ packs: a.packs.map((x) => (x.id === p.id ? p : x)) })

  return (
    <>
      {!enPagina && <FormularioCabecera icono={Settings2Icon} titulo="Ajustes de las collabs" descripcion="Lo que sale de serie al crear una collab. Todo se cambia después en cada una." migas={migas} onVolver={onVolver} />}
      <Formulario
        onSubmit={(e) => {
          e.preventDefault()
          // Un pack sin nombre toma el de lo que lleva; uno vacío (o con formatos ya quitados) no se guarda.
          const packs = a.packs
            .map((p) => ({ ...p, formatos: p.formatos.filter((id) => a.formatos.some((f) => f.id === id)) }))
            .filter((p) => p.formatos.length)
            .map((p) => ({ ...p, nombre: p.nombre.trim() || `Pack de ${p.formatos.length}` }))
          const limpios = { ...a, formatos: a.formatos.map((f) => ({ ...f, nombre: f.nombre.trim() || TIPOS_PIEZA[f.tipo].label })), condiciones: a.condiciones.filter((c) => c.nombre.trim()), packs }
          const r = esquemaAjustesCollabs.safeParse(limpios)
          if (!r.success) return setError(r.error.issues[0]?.message ?? "Revisa los ajustes")
          onGuardar(r.data)
        }}
      >
        <FormularioCuerpo>
          <CampoFormulario etiqueta="Script" htmlFor="aj-dias" ayuda="Cuántos días antes de publicar va el script, de serie. Si ya no da tiempo, el entregable sale sin fecha de script y la pones tú.">
            <div className="flex items-center gap-2 text-sm">
              <Input id="aj-dias" type="number" min={0} max={90} inputMode="numeric" value={a.diasGuion} onChange={(e) => cambiar({ diasGuion: Math.max(0, Math.round(Number(e.target.value) || 0)) })} className="h-10 w-24" />
              días antes de publicar
            </div>
          </CampoFormulario>

          <CampoFormulario etiqueta="Formatos de pieza" ayuda="Los atajos para añadir piezas, en este orden. Arrastra para ordenarlos; la flecha cambia qué se entrega y dónde se publica.">
            <ListaOrdenable items={a.formatos} clave={(f) => f.id} onReordenar={(formatos) => cambiar({ formatos })} className="flex flex-col gap-1.5">
              {(f, asa) => <FilaFormato formato={f} asa={asa} onCambiar={cambiarFormato} onQuitar={() => cambiar({ formatos: a.formatos.filter((x) => x.id !== f.id) })} />}
            </ListaOrdenable>
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => cambiar({ formatos: [...a.formatos, { id: idNuevo("fp"), nombre: "", tipo: "video", plataforma: "instagram", conGuion: true }] })}>
              <PlusIcon /> Añadir formato
            </Button>
          </CampoFormulario>

          <CampoFormulario etiqueta="Condiciones" ayuda="Las que eliges en cada collab o en cada pieza: en los entregables se ven con su icono y sus días. Con días, los que salen de serie al añadirla.">
            <ListaOrdenable items={a.condiciones} clave={(c) => c.id} onReordenar={(condiciones) => cambiar({ condiciones })} className="flex flex-col gap-1.5">
              {(c, asa) => (
                <div className="flex items-center gap-2 rounded-lg border bg-card p-1.5">
                  {asa}
                  <SelectorIconoCondicion valor={c.icono} nombre={c.nombre} onChange={(icono) => cambiarCondicion({ ...c, icono })} />
                  <Input value={c.nombre} onChange={(e) => cambiarCondicion({ ...c, nombre: e.target.value })} aria-label="Nombre de la condición" placeholder="Exclusividad" className="h-8 min-w-0 flex-1" />
                  <label className="flex flex-none items-center gap-1.5 text-xs text-muted-foreground">
                    <Switch size="sm" checked={c.conDias} onCheckedChange={(v) => cambiarCondicion({ ...c, conDias: v })} aria-label={`${c.nombre} con días`} /> Con días
                  </label>
                  {c.conDias && (
                    <label className="flex flex-none items-center gap-1 text-xs text-muted-foreground">
                      <Input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={c.dias ?? ""}
                        placeholder="—"
                        onChange={(e) => cambiarCondicion({ ...c, dias: e.target.value ? Math.max(1, Math.round(Number(e.target.value))) : undefined })}
                        aria-label={`Días de serie de ${c.nombre}`}
                        className="h-8 w-16 text-right tabular-nums"
                      />
                      días
                    </label>
                  )}
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar ${c.nombre}`} onClick={() => cambiar({ condiciones: a.condiciones.filter((x) => x.id !== c.id) })}>
                    <Trash2Icon />
                  </Button>
                </div>
              )}
            </ListaOrdenable>
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => cambiar({ condiciones: [...a.condiciones, { id: idNuevo("cd"), nombre: "", conDias: true, icono: ICONO_CONDICION_DE_SERIE }] })}>
              <PlusIcon /> Añadir condición
            </Button>
          </CampoFormulario>

          <CampoFormulario etiqueta="Packs de contenido" ayuda="Varios entregables que se añaden de un clic al crear la collab o al añadir piezas. También se guardan desde ahí, con «Guardar como pack».">
            <ListaOrdenable items={a.packs} clave={(p) => p.id} onReordenar={(packs) => cambiar({ packs })} className="flex flex-col gap-1.5">
              {(p, asa) => <FilaPack pack={p} formatos={a.formatos} asa={asa} onCambiar={cambiarPack} onQuitar={() => cambiar({ packs: a.packs.filter((x) => x.id !== p.id) })} />}
            </ListaOrdenable>
            <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => cambiar({ packs: [...a.packs, { id: idNuevo("pk"), nombre: "", formatos: [] }] })}>
              <PlusIcon /> Añadir pack
            </Button>
          </CampoFormulario>

          <CampoFormulario etiqueta="Lo que le pides a la marca, de serie" ayuda="Al pedirle el brief, salen marcados; en cada collab quitas o añades.">
            <CasillasOpcion aria-label="Apartados del brief" opciones={OPCIONES_BRIEF} valores={a.camposBrief} onChange={(camposBrief) => cambiar({ camposBrief })} />
          </CampoFormulario>
        </FormularioCuerpo>
        <FormularioPie izquierda={error && <span className="text-danger">{error}</span>}>
          <Button type="button" variant="outline" size="lg" onClick={onVolver ?? onCancelar}>
            {onVolver ? "Volver" : "Cancelar"}
          </Button>
          <Button type="submit" size="lg">
            Guardar ajustes
          </Button>
        </FormularioPie>
      </Formulario>
    </>
  )
}
