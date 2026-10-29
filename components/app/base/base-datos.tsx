"use client"

import * as React from "react"
import { toast } from "sonner"
import { PlusIcon, Trash2Icon, UploadIcon, type LucideIcon } from "lucide-react"
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
import { TIPOS_CAMPO, aFiltrable, campoDePropio, colorPorDefecto, textoDeValor, type CampoPropio, type DefCampo, type OpcionCampo, type ValorCampo } from "@/lib/base/campos"
import { LISTA_TIPOS_VISTA, TIPOS_VISTA, agruparEnNiveles, aplicarAjustes, clavesDeGrupos, coloresDeRegistro, columnasDeVista, idBase, lineasDeRejilla, type VistaBase } from "@/lib/base/vistas"
import { BarraBase, type MenuDeBarra } from "@/components/app/base/barra-base"
import { LateralVistas } from "@/components/app/base/lateral-vistas"
import { PestanasVistas } from "@/components/app/base/pestanas-vistas"
import { useVistasEnPestanas } from "@/components/app/base/vistas-en-pestanas"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ICONO_VISTA } from "@/components/app/base/apariencia"
import { useLadoLateral, type ControlLateral } from "@/components/app/controles-lateral"
import { EditorCampo } from "@/components/app/base/editor-campo"
import { AjustesCampo, type PestanaAjustes } from "@/components/app/base/ajustes-campo"
import { FormularioBase, type ValoresFormulario } from "@/components/app/base/formulario-base"
import { ImportarDialog } from "@/components/app/base/importar-dialog"
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
 * Una vista que pone la página, la misma para todas las personas (Xavier, 2026-10-19: «Propuestas de Astratic»): va
 * arriba del todo con su candado y no se borra, no cambia de nombre ni se configura. Puede enseñar sus propios
 * registros y abrirlos a su manera (en otra página); en ella no se escribe, no se arrastra, no se crea ni se borra.
 */
export type VistaFija<T> = {
  vista: VistaBase
  icono?: LucideIcon
  /** Sus registros, si no son los de la base. */
  filas?: T[]
  /** Abrir uno de sus registros, si no es con la ficha de la base. */
  onAbrir?: (id: string) => void
  /** Su kanban: el resumen de cada columna, las plegadas y los botones de cada tarjeta. */
  kanban?: { resumen?: (filas: T[]) => React.ReactNode; plegadas?: string[]; acciones?: (fila: T) => React.ReactNode }
  vacio?: React.ReactNode
}

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
  filas: filasBase,
  getId,
  hoy,
  objeto,
  celdas,
  abiertoId,
  onAbrir: onAbrirBase,
  onEscribir: onEscribirBase,
  onCrear,
  onBorrar: onBorrarBase,
  onDuplicar,
  propios,
  onGuardarCampo,
  onBorrarCampo,
  onAbrirVinculo,
  onNuevo,
  onImportar,
  crearCamposAlImportar,
  ajustesTabla,
  portada,
  tarjetaGaleria,
  lateral: lateralPropio,
  ficha: fichaPagina,
  kanban: kanbanBase,
  lateralInicial,
  accionesSeleccion: accionesSeleccionBase,
  formulario,
  nuevoInicial = false,
  vacio: vacioBase,
  vistasFijas,
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
  /**
   * Importar desde un Excel o un CSV (o lo pegado de una hoja de cálculo), con qué columna va a qué campo: «Importar»
   * junto a la acción principal. La página crea un registro por fila con los valores de sus campos (por id).
   */
  onImportar?: (filas: ValoresFormulario[], nuevos: DefCampo<T>[]) => void
  /**
   * Al importar, una columna también puede crear su campo (con `onGuardarCampo`): la base lo da de alta antes y la
   * página lo recibe en `nuevos` de `onImportar` para escribir sus valores (`registrosDeFilas(filas, [...campos, ...nuevos], …)`).
   */
  crearCamposAlImportar?: boolean
  /** Los ajustes de la tabla (valores por defecto, opciones y su orden): un engranaje junto a la acción principal. */
  ajustesTabla?: { label: string; onAbrir: () => void }
  /** La imagen de cada registro en las tarjetas del kanban y la galería. */
  portada?: (fila: T) => string | null | undefined
  /** Una tarjeta a medida para la galería (una tarjeta de perfil): la pinta la página; la vista sigue filtrando, ordenando y abriendo. */
  tarjetaGaleria?: (fila: T) => React.ReactNode
  /**
   * Un lateral propio en lugar del de las vistas (las carpetas de las ideas). Las vistas siguen en
   * el menú del nombre de la vista. `nombre` es para el botón que lo abre y lo cierra. Si `contenido`
   * es una función, recibe con qué pasarse al otro lado y plegarse (`ControlesLateral`).
   */
  lateral?: { nombre: string; contenido: React.ReactNode | ((control: ControlLateral) => React.ReactNode) }
  /**
   * La ficha integrada de la página (`usePanelFicha`) cuando la base va dentro de un `WorkGrid` con
   * panel: entonces la ficha ocupa la columna del panel y la base no pinta la suya.
   */
  ficha?: PanelFicha
  /** Si el lateral de vistas empieza abierto (de serie, sí; cerrado si la página tiene panel). */
  lateralInicial?: boolean
  /** Del kanban: el resumen de cada columna, las que empiezan plegadas y los botones al pie de cada tarjeta. */
  kanban?: { resumen?: (filas: T[]) => React.ReactNode; plegadas?: string[]; acciones?: (fila: T) => React.ReactNode }
  /** Botones de más en la barra de la selección (copiar emails, exportar…). */
  accionesSeleccion?: (ids: string[]) => React.ReactNode
  /**
   * `extra`: lo propio de la página arriba del formulario de alta, que no es un campo (segmentar al dar de alta).
   * `principales`: los campos que salen abiertos mientras la persona no elija los suyos; el resto, plegados.
   */
  formulario?: { titulo?: string; descripcion?: string; textoCrear?: string; icono?: LucideIcon; extra?: React.ReactNode; principales?: string[] }
  /** Llegar con el formulario abierto («Nuevo contacto» desde otra página). */
  nuevoInicial?: boolean
  vacio?: (hayFiltro: boolean, limpiar: () => void, busqueda: string) => React.ReactNode
  /** Las vistas fijas de la página, arriba de las de cada persona. */
  vistasFijas?: VistaFija<T>[]
  /**
   * Lo que la página pinta con los registros que se ven, en su orden: la ficha y sus flechas. Se le
   * pasa `ficha` para su `DetailSheet`: con la ficha integrada, se pinta a la derecha de la base.
   */
  children?: (registros: T[], ficha: PanelFicha) => React.ReactNode
}) {
  // Una vista fija abierta manda sobre la de la persona: sus registros, cómo se abren y nada que escribir.
  const [fijaId, setFijaId] = useLocalStorage<string | null>(`base-fija:${clave}`, null)
  const fija = vistasFijas?.find((f) => f.vista.id === fijaId)
  const vista = fija?.vista ?? base.vista
  const filas = fija?.filas ?? filasBase
  const onAbrir = fija?.onAbrir ?? onAbrirBase
  const onEscribir = fija ? undefined : onEscribirBase
  const onBorrar = fija ? undefined : onBorrarBase
  const kanban = fija ? fija.kanban : kanbanBase
  const accionesSeleccion = fija ? undefined : accionesSeleccionBase
  const vacio = fija ? () => fija.vacio : vacioBase
  const activarVista = (id: string) => {
    setFijaId(null)
    base.activar(id)
  }
  const crearVista = (tipo: Parameters<typeof base.crear>[0]) => {
    setFijaId(null)
    return base.crear(tipo)
  }
  const fijas = vistasFijas?.length ? { vistas: vistasFijas.map((f) => ({ id: f.vista.id, nombre: f.vista.nombre, icono: f.icono })), activa: fija?.vista.id ?? null, onActivar: setFijaId } : undefined
  // Las vistas van de serie como pestañas laterales, estrechas, así que se ven siempre (reportes cmvsixcu y cmvtrp16);
  // un lateral propio (las carpetas) empieza cerrado si la página tiene panel, para dejar sitio a la base.
  // Sin `VistasEnPestanas` en el shell, como antes: la lista ancha, cerrada si la página tiene panel.
  const enPestanas = useVistasEnPestanas()
  const [lateral, setLateral] = useLocalStorage(lateralPropio || !enPestanas ? `base-lateral:${clave}` : `base-vistas-abiertas:${clave}`, lateralInicial ?? (lateralPropio || !enPestanas ? !fichaPagina : true))
  const [formaGuardada, setFormaVistas] = useLocalStorage<"pestanas" | "lista">(`base-forma-vistas:${clave}`, "pestanas")
  const formaVistas = enPestanas ? formaGuardada : "lista"
  // Todo lateral se pasa al otro lado y se pliega desde su cabecera (Xavier, 2026-10-16).
  const { lado, cambiarLado } = useLadoLateral(`base:${clave}`)
  const control: ControlLateral = { lado, onCambiarLado: cambiarLado, onPlegar: () => setLateral(false) }
  const [busqueda, setBusqueda] = React.useState("")
  const [marcadas, setMarcadas] = React.useState<Set<string>>(new Set())
  const [menu, setMenu] = React.useState<MenuDeBarra | null>(null)
  const [nuevo, setNuevo] = React.useState(nuevoInicial)
  const [importando, setImportando] = React.useState(false)
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
    if (!fija) base.cambiar({ filtro: { union: "y", condiciones: [] } })
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

  // Los campos nuevos de una importación se crean antes que sus registros y salen visibles al final de la vista.
  const importar = (filas: ValoresFormulario[], nuevos: CampoPropio[]) => {
    nuevos.forEach((c) => onGuardarCampo?.(c))
    if (nuevos.length) base.cambiar((v) => ({ campos: [...v.campos.filter((c) => !nuevos.some((n) => n.id === c.id)), ...nuevos.map((n) => ({ id: n.id, visible: true }))] }))
    onImportar?.(filas, nuevos.map((n) => campoDePropio<T>(n, () => undefined)))
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
    !fija && (abrirNuevo || ajustesTabla || onImportar) ? (
      <>
        {onImportar && (
          <Button variant="ghost" size="sm" onClick={() => setImportando(true)} aria-label={`Importar ${objeto.plural}`} title="Importar desde un Excel o un CSV">
            <UploadIcon /> <span className="hidden lg:inline">Importar</span>
          </Button>
        )}
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
  const textoVacio = registros.length === 0 ? vacio?.(hayFiltro, limpiar, busqueda) : undefined

  const cuerpo = () => {
    if (movil) return <ListaMovil registros={registros} columnas={columnas} getId={getId} celdas={celdas} abiertoId={abiertoId} onAbrir={onAbrir} vacio={textoVacio} />
    switch (tipo) {
      case "kanban":
        return <KanbanBase {...tarjetas} campo={campos.find((c) => c.id === vista.apilar)} registros={registros} getId={getId} abiertoId={abiertoId} onAbrir={onAbrir} onEscribir={escribirUno} clave={`${clave}:${vista.id}`} resumen={kanban?.resumen} plegadas={kanban?.plegadas} acciones={kanban?.acciones} />
      case "galeria":
        return <GaleriaBase {...tarjetas} registros={registros} getId={getId} abiertoId={abiertoId} onAbrir={onAbrir} vacio={textoVacio} aMedida={tarjetaGaleria} />
      case "calendario":
        return <CalendarioBase campo={campos.find((c) => c.id === vista.fecha)} principal={campos.find((c) => c.principal)} registros={registros} getId={getId} hoy={hoy} colorDe={colorDe} abiertoId={abiertoId} onAbrir={onAbrir} onEscribir={escribirUno} />
      default:
        return (
          <Rejilla
            lineas={lineas}
            busqueda={busqueda}
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
            onCambiarVista={fija ? () => undefined : base.cambiar}
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
            vacio={vacio?.(hayFiltro, limpiar, busqueda)}
          />
        )
    }
  }

  const pintarLateral = () => {
    if (!lateral || movil) return null
    if (lateralPropio) return typeof lateralPropio.contenido === "function" ? lateralPropio.contenido(control) : lateralPropio.contenido
    if (formaVistas === "pestanas")
      return (
        <PestanasVistas
          vistas={base.vistas}
          activa={vista.id}
          onActivar={activarVista}
          menuCrear={(alCrear, boton) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>{boton}</DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-72" onCloseAutoFocus={(e) => e.preventDefault()}>
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Tipo de vista</DropdownMenuLabel>
                {LISTA_TIPOS_VISTA.map((t) => {
                  const Icono = ICONO_VISTA[t]
                  return (
                    <DropdownMenuItem key={t} className="items-start" onSelect={() => alCrear(crearVista(t))}>
                      <Icono className="mt-0.5 text-brand" />
                      <span className="grid gap-0.5">
                        <span>{TIPOS_VISTA[t].label}</span>
                        <span className="text-xs text-muted-foreground">{TIPOS_VISTA[t].ayuda}</span>
                      </span>
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          onEditar={base.editar}
          onDuplicar={base.duplicar}
          onBorrar={borrarVista}
          onReordenar={base.reordenar}
          fijas={fijas}
          onLista={() => setFormaVistas("lista")}
          {...control}
        />
      )
    return (
      <LateralVistas
        onPestanas={enPestanas ? () => setFormaVistas("pestanas") : undefined}
        clave={clave}
        vistas={base.vistas}
        activa={vista.id}
        onActivar={activarVista}
        onCrear={crearVista}
        onRenombrar={base.renombrar}
        onDuplicar={base.duplicar}
        onBorrar={borrarVista}
        onReordenar={base.reordenar}
        fijas={fijas}
        {...control}
      />
    )
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
        ladoLateral={lado}
        onLateral={() => setLateral(!lateral)}
        nombreLateral={lateralPropio?.nombre}
        onCambiar={base.cambiar}
        acciones={{
          renombrar: (n) => base.renombrar(vista.id, n),
          duplicar: () => base.duplicar(vista.id),
          borrar: base.vistas.length > 1 ? () => borrarVista(vista.id) : undefined,
          activar: activarVista,
          crear: crearVista,
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
        fijas={fijas}
      />
      <div data-slot="base-datos" className="flex min-h-0 flex-1" style={{ "--ficha-w": `${ficha.ancho}px` } as React.CSSProperties}>
        {lado === "izquierda" && pintarLateral()}
        <div className="flex min-w-0 flex-1 flex-col">{cuerpo()}</div>
        {lado === "derecha" && pintarLateral()}
        {ficha.activa && !fichaPagina && children && <PanelFichaBase ficha={ficha} />}
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
          icono={formulario?.icono}
          hoy={hoy}
          campos={formulario?.principales && !base.formularioConfigurado ? base.formulario.map((c) => ({ ...c, visible: !!c.campo.principal || !!c.campo.obligatorio || formulario.principales!.includes(c.campo.id) })) : base.formulario}
          onConfigurar={base.cambiarFormulario}
          iniciales={iniciales}
          onCrear={onCrear}
          onCrearOpcion={onGuardarCampo ? crearOpcion : undefined}
          textoCrear={formulario?.textoCrear}
          extra={formulario?.extra}
        />
      )}

      {onImportar && <ImportarDialog open={importando} onOpenChange={setImportando} campos={campos} objeto={objeto} crearCampos={!!onGuardarCampo && crearCamposAlImportar} onImportar={importar} />}

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
