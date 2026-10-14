"use client"

import * as React from "react"
import { toast } from "sonner"
import { PlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { BulkBar } from "@/components/app/bulk-bar"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { ConfigButton } from "@/components/app/config-button"
import { usePanelFicha, type PanelFicha } from "@/components/app/detail-panel"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useIsMobile } from "@/hooks/use-mobile"
import type { BaseApi } from "@/hooks/use-base"
import { filtrarFilas, operadorPorDefecto } from "@/lib/filtros/core"
import { ordenarFilas, valoresDeFiltro } from "@/lib/vistas/core"
import { TIPOS_CAMPO, aFiltrable, colorPorDefecto, textoDeValor, type CampoPropio, type DefCampo, type OpcionCampo, type ValorCampo } from "@/lib/base/campos"
import { agruparEnNiveles, aplicarAjustes, clavesDeGrupos, coloresDeRegistro, columnasDeVista, idBase, lineasDeRejilla, type VistaBase } from "@/lib/base/vistas"
import { BarraBase, type MenuDeBarra } from "@/components/app/base/barra-base"
import { LateralVistas } from "@/components/app/base/lateral-vistas"
import { EditorCampo } from "@/components/app/base/editor-campo"
import { AjustesCampo, type PestanaAjustes } from "@/components/app/base/ajustes-campo"
import { FormularioBase, type ValoresFormulario } from "@/components/app/base/formulario-base"
import { ListaMovil } from "@/components/app/base/lista-movil"
import { KanbanBase } from "@/components/app/base/kanban-base"
import { GaleriaBase } from "@/components/app/base/galeria-base"
import { CalendarioBase } from "@/components/app/base/calendario-base"
import { PanelFichaBase } from "@/components/app/base/panel-ficha-base"
import { camposMenuDeBase } from "@/components/app/base/selector-campo"
import { Rejilla, type CambioCelda } from "@/components/app/base/rejilla/rejilla"
import type { AccionesCampo } from "@/components/app/base/rejilla/menu-campo"

export type { CambioCelda }

const sinAcentos = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")

/** El editor de un campo nuevo, junto a la cabecera desde la que se pidió («Insertar a la izquierda»…). */
type EditorAbierto = { ancla: HTMLElement; lugar?: { antesDe?: string; despuesDe?: string } }

/** Los ajustes de un campo que ya existe (doble clic en su cabecera). */
type AjustesAbiertos = { ancla: HTMLElement; campoId: string; pestana: PestanaAjustes }

/**
 * Una base de datos con la colocación de Airtable y el aspecto del design system, entera: la barra
 * de la vista, el lateral de vistas (que se ensancha arrastrando), la vista (cuadrícula, kanban,
 * galería o calendario), el formulario de alta, los campos propios y la ficha, encima o integrada a
 * la derecha. La página pone los datos y lo que pasa al escribir, crear o borrar; la base hace el
 * resto (filtrar, buscar, ordenar, agrupar, colorear, seleccionar, copiar y pegar, y recordar las
 * vistas de cada persona con `useBase`).
 *
 * En el móvil la vista cede el sitio a una lista de tarjetas, con los mismos filtros y orden.
 */
export function BaseDatos<T>({
  clave,
  base,
  campos: camposPagina,
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
  onAbrirVinculo,
  onNuevo,
  ajustesTabla,
  portada,
  lateral: lateralPropio,
  ficha: fichaPagina,
  kanban,
  lateralInicial,
  accionesSeleccion,
  formulario,
  nuevoInicial = false,
  vacio,
  children,
}: {
  /** Para recordar en este navegador el lateral de vistas, su ancho y si la ficha va integrada. */
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
  /** Pulsar un registro vinculado (la marca de un contacto) abre su ficha. */
  onAbrirVinculo?: (campoId: string, id: string) => void
  /** «Nuevo …» abre el alta de la página (un diálogo propio) en vez del formulario de la base. */
  onNuevo?: () => void
  /** Los ajustes de la tabla (valores por defecto, opciones y su orden): un engranaje junto a la acción principal. */
  ajustesTabla?: { label: string; onAbrir: () => void }
  /** La imagen de cada registro en las tarjetas del kanban y la galería. */
  portada?: (fila: T) => string | null | undefined
  /**
   * Un lateral propio en lugar del de las vistas (las carpetas de las ideas). Las vistas siguen en
   * el menú del nombre de la vista. `nombre` es para el botón que lo abre y lo cierra.
   */
  lateral?: { nombre: string; contenido: React.ReactNode }
  /**
   * La ficha integrada de la página (`usePanelFicha`) cuando la base va dentro de un `WorkGrid` con
   * panel: entonces la ficha ocupa la columna del panel y la base no pinta la suya.
   */
  ficha?: PanelFicha
  /** Si el lateral de vistas empieza abierto (de serie, sí; cerrado si la página tiene panel). */
  lateralInicial?: boolean
  /** Del kanban: el resumen de cada columna y las que empiezan plegadas. */
  kanban?: { resumen?: (filas: T[]) => React.ReactNode; plegadas?: string[] }
  /** Botones de más en la barra de la selección (copiar emails, exportar…). */
  accionesSeleccion?: (ids: string[]) => React.ReactNode
  formulario?: { titulo?: string; descripcion?: string; textoCrear?: string }
  /** Llegar con el formulario abierto («Nuevo contacto» desde otra página). */
  nuevoInicial?: boolean
  vacio?: (hayFiltro: boolean, limpiar: () => void) => React.ReactNode
  /**
   * Lo que la página pinta con los registros que se ven, en su orden: la ficha y sus flechas. Se le
   * pasa `ficha` para su `DetailSheet`: con la ficha integrada, se pinta a la derecha de la base.
   */
  children?: (registros: T[], ficha: PanelFicha) => React.ReactNode
}) {
  const { vista } = base
  // Con el panel de la página al lado, el lateral de vistas empieza cerrado para dejar sitio a la base.
  const [lateral, setLateral] = useLocalStorage(`base-lateral:${clave}`, lateralInicial ?? !fichaPagina)
  const [busqueda, setBusqueda] = React.useState("")
  const [marcadas, setMarcadas] = React.useState<Set<string>>(new Set())
  const [menu, setMenu] = React.useState<MenuDeBarra | null>(null)
  const [nuevo, setNuevo] = React.useState(nuevoInicial)
  const [editor, setEditor] = React.useState<EditorAbierto | null>(null)
  const [ajustes, setAjustes] = React.useState<AjustesAbiertos | null>(null)
  const [borrandoCampo, setBorrandoCampo] = React.useState<DefCampo<T> | null>(null)
  const movil = useIsMobile()
  const fichaPropia = usePanelFicha(`base:${clave}`)
  const ficha = fichaPagina ?? fichaPropia
  const tipo = vista.tipo ?? "cuadricula"
  // Los campos con lo que cada persona ajusta de los de serie (el orden y el color de sus opciones).
  const campos = React.useMemo(() => aplicarAjustes(camposPagina, base.ajustes), [camposPagina, base.ajustes])

  const filtrables = React.useMemo(() => campos.map(aFiltrable), [campos])
  const camposMenu = React.useMemo(() => camposMenuDeBase(campos), [campos])
  const ref = React.useMemo(() => ({ hoy }), [hoy])

  // Buscar en todos los campos → el filtro de la vista → su orden → sus grupos.
  const { registros, lineas, nodos } = React.useMemo(() => {
    const q = sinAcentos(busqueda.trim())
    const buscadas = q ? filas.filter((f) => campos.some((c) => sinAcentos(textoDeValor(c, c.valor(f))).includes(q))) : filas
    const ordenadas = ordenarFilas(filtrarFilas(buscadas, vista.filtro, filtrables, ref), vista.orden, filtrables)
    // Los grupos son de la cuadrícula: las demás vistas enseñan todo, en el orden de la vista.
    const enCuadricula = (vista.tipo ?? "cuadricula") === "cuadricula"
    const nodos = enCuadricula && vista.grupos.length ? agruparEnNiveles(ordenadas, vista.grupos, filtrables, ref) : []
    const lineas = lineasDeRejilla(ordenadas, nodos, new Set(vista.plegados))
    const registros = enCuadricula ? lineas.flatMap((l) => (l.tipo === "registro" ? [l.fila] : [])) : ordenadas
    return { registros, lineas, nodos }
  }, [busqueda, filas, campos, vista.tipo, vista.filtro, vista.orden, vista.grupos, vista.plegados, filtrables, ref])

  const columnas = React.useMemo(() => columnasDeVista(vista, campos), [vista, campos])
  const hayFiltro = busqueda.trim() !== "" || vista.filtro.condiciones.length > 0 || (vista.filtro.grupos ?? []).length > 0
  const limpiar = () => {
    setBusqueda("")
    base.cambiar({ filtro: { union: "y", condiciones: [] } })
  }
  const nombres = campos.map((c) => c.nombre)

  const cabeceraDe = (id: string) => document.querySelector<HTMLElement>(`[data-campo="${CSS.escape(id)}"]`)

  const abrirAjustes = (campoId: string, pestana: PestanaAjustes, ancla = cabeceraDe(campoId)) => {
    if (ancla) setAjustes({ ancla, campoId, pestana })
  }

  const accionesCampo = (campo: DefCampo<T>): AccionesCampo => {
    const propio = propios?.find((p) => p.id === campo.id)
    const abrirEditor = (lugar?: EditorAbierto["lugar"]) => {
      const ancla = cabeceraDe(campo.id)
      if (ancla) setEditor({ ancla, lugar })
    }
    return {
      tipo: TIPOS_CAMPO[campo.tipo].filtro,
      editar: () => abrirAjustes(campo.id, "campo"),
      colorear: () => abrirAjustes(campo.id, "colores"),
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

  const guardarEditado = (campo: CampoPropio) => {
    onGuardarCampo?.(campo)
    setAjustes(null)
    toast.success("Campo guardado")
  }

  const crearCampo = (campo: CampoPropio) => {
    const lugar = editor?.lugar
    onGuardarCampo?.(campo)
    setEditor(null)
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

  const pintarAjustes = ({ campoId, pestana }: AjustesAbiertos) => {
    const campo = campos.find((c) => c.id === campoId)
    const campoMenu = camposMenu.find((c) => c.id === campoId)
    if (!campo || !campoMenu) return null
    return (
      <AjustesCampo
        key={campoId}
        campo={campo}
        campoMenu={campoMenu}
        propio={propios?.find((p) => p.id === campoId)}
        nombresUsados={nombres.filter((n) => n !== campo.nombre)}
        color={vista.color}
        pestana={pestana}
        onGuardarPropio={onGuardarCampo ? guardarEditado : undefined}
        onAjustar={(ajuste) => base.ajustarCampo(campoId, ajuste)}
        onColor={(color) => base.cambiar({ color })}
        onCerrar={() => setAjustes(null)}
      />
    )
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
  const abrirNuevo = onNuevo ?? (onCrear ? () => setNuevo(true) : undefined)
  const accionNueva =
    abrirNuevo || ajustesTabla ? (
      <>
        {ajustesTabla && <ConfigButton label={ajustesTabla.label} onClick={ajustesTabla.onAbrir} className="size-7" />}
        {abrirNuevo && (
          <Button size="sm" onClick={abrirNuevo} aria-label={objeto.nuevo}>
            <PlusIcon /> <span className="hidden sm:inline">{objeto.nuevo}</span>
          </Button>
        )}
      </>
    ) : undefined

  const coloresDe = (f: T) => coloresDeRegistro(f, vista.color, campos, filtrables, ref)
  const colorDe = (f: T) => coloresDe(f).marca
  const escribirUno = onEscribir ? (fila: T, campo: DefCampo<T>, valor: ValorCampo) => onEscribir([{ fila, campo, valor }]) : undefined
  const tarjetas = { campos: columnas.map((c) => c.campo), colorDe, celdas, onAbrirVinculo, portada }
  const textoVacio = registros.length === 0 ? vacio?.(hayFiltro, limpiar) : undefined

  const cuerpo = () => {
    if (movil) return <ListaMovil registros={registros} columnas={columnas} getId={getId} celdas={celdas} abiertoId={abiertoId} onAbrir={onAbrir} vacio={textoVacio} />
    switch (tipo) {
      case "kanban":
        return <KanbanBase {...tarjetas} campo={campos.find((c) => c.id === vista.apilar)} registros={registros} getId={getId} abiertoId={abiertoId} onAbrir={onAbrir} onEscribir={escribirUno} clave={`${clave}:${vista.id}`} resumen={kanban?.resumen} plegadas={kanban?.plegadas} />
      case "galeria":
        return <GaleriaBase {...tarjetas} registros={registros} getId={getId} abiertoId={abiertoId} onAbrir={onAbrir} vacio={textoVacio} />
      case "calendario":
        return <CalendarioBase campo={campos.find((c) => c.id === vista.fecha)} principal={campos.find((c) => c.principal)} registros={registros} getId={getId} hoy={hoy} colorDe={colorDe} abiertoId={abiertoId} onAbrir={onAbrir} onEscribir={escribirUno} />
      default:
        return (
          <Rejilla
            lineas={lineas}
            registros={registros}
            columnas={columnas}
            vista={vista}
            getId={getId}
            coloresDe={coloresDe}
            celdas={celdas}
            objeto={objeto}
            marcadas={marcadas}
            onMarcar={setMarcadas}
            abiertoId={abiertoId}
            onAbrir={onAbrir}
            onEscribir={onEscribir}
            onNuevo={abrirNuevo}
            onCambiarVista={base.cambiar}
            accionesCampo={accionesCampo}
            onAnadirCampo={onGuardarCampo ? (ancla) => setEditor({ ancla }) : undefined}
            onEditarCampo={(id, ancla) => abrirAjustes(id, "campo", ancla)}
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
            onAbrirVinculo={onAbrirVinculo}
            // Con la ficha integrada, la ficha sigue a la celda activa: se ve el registro en el que se está.
            onActiva={(id) => ficha.activa && id !== abiertoId && onAbrir(id)}
            vacio={vacio?.(hayFiltro, limpiar)}
          />
        )
    }
  }

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
        nombreLateral={lateralPropio?.nombre}
        onCambiar={base.cambiar}
        acciones={{
          renombrar: (n) => base.renombrar(vista.id, n),
          duplicar: () => base.duplicar(vista.id),
          borrar: base.vistas.length > 1 ? () => borrarVista(vista.id) : undefined,
          activar: base.activar,
          crear: base.crear,
        }}
        onContraer={() => base.cambiar({ plegados: clavesDeGrupos(nodos) })}
        onExpandir={() => base.cambiar({ plegados: [] })}
        busqueda={busqueda}
        onBuscar={setBusqueda}
        accion={accionNueva}
        // Sin ficha (cada registro se abre en su página) no hay ficha que integrar.
        panelFicha={children ? { activo: ficha.preferida, onAlternar: () => ficha.alternar(!ficha.preferida) } : undefined}
        menu={menu}
        onMenu={setMenu}
      />
      <div data-slot="base-datos" className="flex min-h-0 flex-1" style={{ "--ficha-w": `${ficha.ancho}px` } as React.CSSProperties}>
        {lateral && !movil && lateralPropio && lateralPropio.contenido}
        {lateral && !movil && !lateralPropio && (
          <LateralVistas
            clave={clave}
            vistas={base.vistas}
            activa={vista.id}
            onActivar={base.activar}
            onCrear={base.crear}
            onRenombrar={base.renombrar}
            onDuplicar={base.duplicar}
            onBorrar={borrarVista}
            onReordenar={base.reordenar}
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col">{cuerpo()}</div>
        {ficha.activa && !fichaPagina && children && <PanelFichaBase ficha={ficha} objeto={objeto.singular} />}
      </div>

      <Popover open={!!editor} onOpenChange={(abierto) => !abierto && setEditor(null)}>
        <PopoverAnchor virtualRef={{ current: editor?.ancla ?? null }} />
        {/* Se abre desde un menú que, al cerrarse, devuelve el foco a la cabecera: eso no lo cierra. */}
        <PopoverContent align="start" className="w-auto p-0" onFocusOutside={(e) => e.preventDefault()}>
          {editor && <EditorCampo nombresUsados={nombres} onGuardar={crearCampo} onCancelar={() => setEditor(null)} />}
        </PopoverContent>
      </Popover>

      <Popover open={!!ajustes} onOpenChange={(abierto) => !abierto && setAjustes(null)}>
        <PopoverAnchor virtualRef={{ current: ajustes?.ancla ?? null }} />
        <PopoverContent align="start" className="w-auto p-0" onFocusOutside={(e) => e.preventDefault()}>
          {ajustes && pintarAjustes(ajustes)}
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
          onCrearOpcion={onGuardarCampo ? crearOpcion : undefined}
          textoCrear={formulario?.textoCrear}
        />
      )}

      {children?.(registros, ficha)}

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
