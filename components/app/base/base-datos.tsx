"use client"

import * as React from "react"
import { toast } from "sonner"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { BulkBar } from "@/components/app/bulk-bar"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useIsMobile } from "@/hooks/use-mobile"
import type { BaseApi } from "@/hooks/use-base"
import { filtrarFilas, operadorPorDefecto } from "@/lib/filtros/core"
import { ordenarFilas, valoresDeFiltro } from "@/lib/vistas/core"
import { TIPOS_CAMPO, aFiltrable, colorPorDefecto, textoDeValor, type CampoPropio, type DefCampo, type OpcionCampo, type ValorCampo } from "@/lib/base/campos"
import { agruparEnNiveles, clavesDeGrupos, colorDeFila, columnasDeVista, idBase, lineasDeRejilla, type VistaBase } from "@/lib/base/vistas"
import { BarraBase, type MenuDeBarra } from "@/components/app/base/barra-base"
import { LateralVistas } from "@/components/app/base/lateral-vistas"
import { EditorCampo } from "@/components/app/base/editor-campo"
import { FormularioBase, type ValoresFormulario } from "@/components/app/base/formulario-base"
import { ListaMovil } from "@/components/app/base/lista-movil"
import { camposMenuDeBase } from "@/components/app/base/selector-campo"
import { Rejilla, type CambioCelda } from "@/components/app/base/rejilla/rejilla"
import type { AccionesCampo } from "@/components/app/base/rejilla/menu-campo"

export type { CambioCelda }

const sinAcentos = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")

type EditorAbierto = { ancla: HTMLElement; campo?: CampoPropio; lugar?: { antesDe?: string; despuesDe?: string } }

/**
 * Una base de datos al estilo Airtable, entera: la barra de la vista, el lateral de vistas, la
 * rejilla, el formulario de alta y los campos propios. La página pone los datos y lo que pasa al
 * escribir, crear o borrar; la base hace el resto (filtrar, buscar, ordenar, agrupar, colorear,
 * seleccionar, copiar y pegar, y recordar las vistas de cada persona con `useBase`).
 *
 * En el móvil la rejilla cede el sitio a una lista de tarjetas, con los mismos filtros y orden.
 */
export function BaseDatos<T>({
  clave,
  base,
  campos,
  filas,
  getId,
  hoy,
  objeto,
  celdas,
  abiertoId,
  onAbrir,
  onEscribir,
  onCrear,
  onBorrar,
  onDuplicar,
  propios,
  onGuardarCampo,
  onBorrarCampo,
  accionesSeleccion,
  formulario,
  nuevoInicial = false,
  vacio,
  children,
}: {
  /** Para recordar en este navegador si el lateral de vistas está abierto. */
  clave: string
  base: BaseApi<T>
  campos: DefCampo<T>[]
  filas: T[]
  getId: (fila: T) => string
  hoy: string
  /** «contacto» / «contactos» y el género para los textos («Nuevo contacto»). */
  objeto: { singular: string; plural: string; nuevo: string }
  celdas?: Partial<Record<string, (fila: T) => React.ReactNode>>
  abiertoId?: string | null
  onAbrir: (id: string) => void
  onEscribir?: (cambios: CambioCelda<T>[]) => void
  onCrear?: (valores: ValoresFormulario) => string | void
  onBorrar?: (ids: string[]) => void
  onDuplicar?: (id: string) => void
  /** Los campos propios tal como se guardan, para editarlos. */
  propios?: CampoPropio[]
  onGuardarCampo?: (campo: CampoPropio) => void
  onBorrarCampo?: (id: string) => void
  /** Botones de más en la barra de la selección (copiar emails, exportar…). */
  accionesSeleccion?: (ids: string[]) => React.ReactNode
  formulario?: { titulo?: string; descripcion?: string; textoCrear?: string }
  /** Llegar con el formulario abierto («Nuevo contacto» desde otra página). */
  nuevoInicial?: boolean
  vacio?: (hayFiltro: boolean, limpiar: () => void) => React.ReactNode
  /** Lo que la página pinta con los registros que se ven, en su orden (la ficha y sus flechas). */
  children?: (registros: T[]) => React.ReactNode
}) {
  const { vista } = base
  const [lateral, setLateral] = useLocalStorage(`base-lateral:${clave}`, true)
  const [busqueda, setBusqueda] = React.useState("")
  const [marcadas, setMarcadas] = React.useState<Set<string>>(new Set())
  const [menu, setMenu] = React.useState<MenuDeBarra | null>(null)
  const [nuevo, setNuevo] = React.useState(nuevoInicial)
  const [editor, setEditor] = React.useState<EditorAbierto | null>(null)
  const [borrandoCampo, setBorrandoCampo] = React.useState<DefCampo<T> | null>(null)
  const movil = useIsMobile()

  const filtrables = React.useMemo(() => campos.map(aFiltrable), [campos])
  const camposMenu = React.useMemo(() => camposMenuDeBase(campos), [campos])
  const ref = React.useMemo(() => ({ hoy }), [hoy])

  // Buscar en todos los campos → el filtro de la vista → su orden → sus grupos.
  const { registros, lineas, nodos } = React.useMemo(() => {
    const q = sinAcentos(busqueda.trim())
    const buscadas = q ? filas.filter((f) => campos.some((c) => sinAcentos(textoDeValor(c, c.valor(f))).includes(q))) : filas
    const ordenadas = ordenarFilas(filtrarFilas(buscadas, vista.filtro, filtrables, ref), vista.orden, filtrables)
    const nodos = vista.grupos.length ? agruparEnNiveles(ordenadas, vista.grupos, filtrables, ref) : []
    const lineas = lineasDeRejilla(ordenadas, nodos, new Set(vista.plegados))
    const registros = lineas.flatMap((l) => (l.tipo === "registro" ? [l.fila] : []))
    return { registros, lineas, nodos }
  }, [busqueda, filas, campos, vista.filtro, vista.orden, vista.grupos, vista.plegados, filtrables, ref])

  const columnas = React.useMemo(() => columnasDeVista(vista, campos), [vista, campos])
  const hayFiltro = busqueda.trim() !== "" || vista.filtro.condiciones.length > 0 || (vista.filtro.grupos ?? []).length > 0
  const limpiar = () => {
    setBusqueda("")
    base.cambiar({ filtro: { union: "y", condiciones: [] } })
  }
  const nombres = campos.map((c) => c.nombre)

  const cabeceraDe = (id: string) => document.querySelector<HTMLElement>(`[data-campo="${CSS.escape(id)}"]`)

  const accionesCampo = (campo: DefCampo<T>): AccionesCampo => {
    const propio = propios?.find((p) => p.id === campo.id)
    const abrirEditor = (lugar?: EditorAbierto["lugar"], editar?: CampoPropio) => {
      const ancla = cabeceraDe(campo.id)
      if (ancla) setEditor({ ancla, campo: editar, lugar })
    }
    return {
      tipo: TIPOS_CAMPO[campo.tipo].filtro,
      editar: propio && onGuardarCampo ? () => abrirEditor(undefined, propio) : undefined,
      insertarIzquierda: onGuardarCampo && !campo.principal ? () => abrirEditor({ antesDe: campo.id }) : undefined,
      insertarDerecha: onGuardarCampo ? () => abrirEditor({ despuesDe: campo.id }) : undefined,
      ordenar: (dir) => base.cambiar({ orden: [{ campo: campo.id, dir }] }),
      filtrar: () => {
        base.cambiar((v) => ({ filtro: { ...v.filtro, condiciones: [...v.filtro.condiciones, { campo: campo.id, op: operadorPorDefecto(TIPOS_CAMPO[campo.tipo].filtro) }] } }))
        setMenu("filtro")
      },
      agrupar: () => {
        base.cambiar((v) => (v.grupos.some((g) => g.campo === campo.id) || v.grupos.length >= 3 ? {} : { grupos: [...v.grupos, { campo: campo.id, ordenGrupos: "asc", ...(campo.tipo === "fecha" ? { modoFecha: "dia" as const } : {}) }] }))
        setMenu("grupos")
      },
      ocultar: campo.principal ? undefined : () => base.cambiar((v) => ({ campos: v.campos.map((c) => (c.id === campo.id ? { ...c, visible: false } : c)) })),
      borrar: propio && onBorrarCampo ? () => setBorrandoCampo(campo) : undefined,
    }
  }

  const guardarCampo = (campo: CampoPropio) => {
    const lugar = editor?.lugar
    const esNuevo = !propios?.some((p) => p.id === campo.id)
    onGuardarCampo?.(campo)
    setEditor(null)
    if (!esNuevo) return toast.success("Campo guardado")
    // Como en Airtable, el campo nuevo sale donde se pidió («a la izquierda de…») y visible.
    const junto = lugar?.antesDe ?? lugar?.despuesDe
    base.cambiar((v) => {
      const lista = v.campos.filter((c) => c.id !== campo.id)
      const i = junto ? lista.findIndex((c) => c.id === junto) : -1
      const pos = i === -1 ? lista.length : lugar?.antesDe ? i : i + 1
      lista.splice(pos, 0, { id: campo.id, visible: true })
      return { campos: lista }
    })
    toast.success(`Campo «${campo.nombre}» creado`)
  }

  const crearOpcion = (campoId: string, label: string): OpcionCampo | null => {
    const propio = propios?.find((p) => p.id === campoId)
    if (!propio || !onGuardarCampo || !label) return null
    const nueva = { id: idBase("o"), label, color: colorPorDefecto(propio.opciones?.length ?? 0) }
    onGuardarCampo({ ...propio, opciones: [...(propio.opciones ?? []), nueva] })
    return nueva
  }

  const borrarVista = (id: string) => {
    const posicion = base.vistas.findIndex((v) => v.id === id)
    const vistaBorrada = base.vistas[posicion]
    if (!vistaBorrada) return
    base.borrar(id)
    toast.success(`Vista «${vistaBorrada.nombre}» eliminada`, { action: { label: "Deshacer", onClick: () => base.restaurar(vistaBorrada, posicion) } })
  }

  const iniciales = React.useMemo(() => inicialesDeFiltro(vista, campos), [vista, campos])
  const marcadasVisibles = [...marcadas].filter((id) => registros.some((f) => getId(f) === id))
  const accionNueva = onCrear ? (
    <Button size="sm" onClick={() => setNuevo(true)}>
      <PlusIcon /> {objeto.nuevo}
    </Button>
  ) : undefined

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-xl border bg-card">
      <BarraBase
        vista={vista}
        vistas={base.vistas}
        campos={campos}
        camposMenu={camposMenu}
        objeto={objeto.plural}
        lateralAbierto={lateral && !movil}
        onLateral={() => setLateral(!lateral)}
        onCambiar={base.cambiar}
        acciones={{ renombrar: (n) => base.renombrar(vista.id, n), duplicar: () => base.duplicar(vista.id), borrar: base.vistas.length > 1 ? () => borrarVista(vista.id) : undefined }}
        onContraer={() => base.cambiar({ plegados: clavesDeGrupos(nodos) })}
        onExpandir={() => base.cambiar({ plegados: [] })}
        busqueda={busqueda}
        onBuscar={setBusqueda}
        accion={accionNueva}
        menu={menu}
        onMenu={setMenu}
      />
      <div className="flex min-h-0 flex-1">
        {lateral && !movil && (
          <LateralVistas
            vistas={base.vistas}
            activa={vista.id}
            onActivar={base.activar}
            onCrear={() => base.crear()}
            onRenombrar={base.renombrar}
            onDuplicar={base.duplicar}
            onBorrar={borrarVista}
            onReordenar={base.reordenar}
          />
        )}
        {movil ? (
          <ListaMovil registros={registros} columnas={columnas} getId={getId} celdas={celdas} abiertoId={abiertoId} onAbrir={onAbrir} vacio={registros.length === 0 ? vacio?.(hayFiltro, limpiar) : undefined} />
        ) : (
          <Rejilla
            lineas={lineas}
            registros={registros}
            columnas={columnas}
            vista={vista}
            getId={getId}
            colorDe={(f) => colorDeFila(f, vista.color, campos, ref)}
            celdas={celdas}
            objeto={objeto}
            marcadas={marcadas}
            onMarcar={setMarcadas}
            abiertoId={abiertoId}
            onAbrir={onAbrir}
            onEscribir={onEscribir}
            onNuevo={onCrear ? () => setNuevo(true) : undefined}
            onCambiarVista={base.cambiar}
            accionesCampo={accionesCampo}
            onAnadirCampo={onGuardarCampo ? (ancla) => setEditor({ ancla }) : undefined}
            onEditarCampo={(id, ancla) => {
              const propio = propios?.find((p) => p.id === id)
              if (propio && onGuardarCampo) setEditor({ ancla, campo: propio })
            }}
            onCrearOpcion={onGuardarCampo ? crearOpcion : undefined}
            onDuplicar={onDuplicar}
            onBorrar={
              onBorrar
                ? (ids) => {
                    onBorrar(ids)
                    setMarcadas(new Set())
                  }
                : undefined
            }
            vacio={vacio?.(hayFiltro, limpiar)}
          />
        )}
      </div>

      <Popover open={!!editor} onOpenChange={(abierto) => !abierto && setEditor(null)}>
        <PopoverAnchor virtualRef={{ current: editor?.ancla ?? null }} />
        <PopoverContent align="start" className="w-auto p-0">
          {editor && (
            <EditorCampo
              key={editor.campo?.id ?? "nuevo"}
              campo={editor.campo}
              nombresUsados={nombres.filter((n) => n !== editor.campo?.nombre)}
              onGuardar={guardarCampo}
              onCancelar={() => setEditor(null)}
            />
          )}
        </PopoverContent>
      </Popover>

      <BulkBar count={marcadasVisibles.length} onClear={() => setMarcadas(new Set())}>
        {accionesSeleccion?.(marcadasVisibles)}
        {onBorrar && (
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:text-danger"
            onClick={() => {
              onBorrar(marcadasVisibles)
              setMarcadas(new Set())
            }}
          >
            <Trash2Icon /> Eliminar
          </Button>
        )}
      </BulkBar>

      {onCrear && (
        <FormularioBase
          open={nuevo}
          onOpenChange={setNuevo}
          titulo={formulario?.titulo ?? objeto.nuevo}
          descripcion={formulario?.descripcion}
          campos={base.formulario}
          onConfigurar={base.cambiarFormulario}
          iniciales={iniciales}
          onCrear={onCrear}
          textoCrear={formulario?.textoCrear}
        />
      )}

      {children?.(registros)}

      <ConfirmDialog
        open={!!borrandoCampo}
        onOpenChange={(abierto) => !abierto && setBorrandoCampo(null)}
        title={`¿Eliminar el campo «${borrandoCampo?.nombre ?? ""}»?`}
        description="Se borra de todos los registros, con lo que tenga escrito, y de todas tus vistas. No se puede deshacer."
        confirmLabel="Eliminar el campo"
        destructive
        onConfirm={() => {
          if (borrandoCampo) onBorrarCampo?.(borrandoCampo.id)
          setBorrandoCampo(null)
        }}
      />
    </div>
  )
}

/**
 * Lo que llega rellenado al crear desde una vista filtrada, como en Airtable: si la vista enseña
 * «Marca es Lumea», el registro nuevo nace con esa marca.
 */
function inicialesDeFiltro<T>(vista: VistaBase, campos: DefCampo<T>[]): ValoresFormulario {
  const out: ValoresFormulario = {}
  for (const { campo: id, valor } of valoresDeFiltro(vista.filtro)) {
    const campo = campos.find((c) => c.id === id)
    if (!campo || campo.soloLectura) continue
    const v: ValorCampo = campo.tipo === "casilla" ? valor === "true" : campo.tipo === "multiselect" ? [valor] : valor
    out[id] = v
  }
  return out
}
