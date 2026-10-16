// Las vistas de una base al estilo Airtable, como las guarda Airtable: un filtro en árbol, el orden
// por varios campos, grupos de hasta tres niveles, los campos de la vista (orden, visibles y ancho),
// los totales del pie, el color de las filas y su altura. Cada persona tiene las suyas.
//
// Es puro: reparte, agrupa y colorea sobre las filas ya cargadas, con los mismos motores de filtro,
// orden y grupos que el resto del design system (`lib/filtros`, `lib/vistas/core.ts`).

import { GRUPO_VACIO, contarCondiciones, cumpleGrupo, grupoVacio, type CampoFiltrable, type GrupoCondiciones } from "@/lib/filtros/core"
import { SIN_VALOR, agruparFilas, type Agrupacion, type Calculo, type Orden } from "@/lib/vistas/core"
import { aFiltrable, esDeUnaOpcion, opcionDe, type ColorOpcion, type DefCampo } from "@/lib/base/campos"

/** Las formas de ver una base: la cuadrícula, el kanban, la galería de tarjetas y el calendario. */
export type TipoVista = "cuadricula" | "kanban" | "galeria" | "calendario"

export const TIPOS_VISTA: Record<TipoVista, { label: string; ayuda: string }> = {
  cuadricula: { label: "Cuadrícula", ayuda: "Una fila por registro, como una hoja de cálculo." },
  kanban: { label: "Kanban", ayuda: "Columnas por una selección o un vínculo; arrastra para cambiarla." },
  galeria: { label: "Galería", ayuda: "Una tarjeta por registro, con los campos que elijas." },
  calendario: { label: "Calendario", ayuda: "Los registros en el día de un campo de fecha." },
}

export const LISTA_TIPOS_VISTA = Object.keys(TIPOS_VISTA) as TipoVista[]

/** Los campos que se ven de serie en una tarjeta nueva (kanban y galería), además del principal. */
const CAMPOS_EN_TARJETA = 4

export type AlturaFila = "corta" | "media" | "alta" | "extra"

/** Las alturas de fila de Airtable, en píxeles. */
export const ALTURAS_FILA: Record<AlturaFila, { label: string; px: number }> = {
  corta: { label: "Corta", px: 32 },
  media: { label: "Media", px: 56 },
  alta: { label: "Alta", px: 88 },
  extra: { label: "Extraalta", px: 128 },
}

export const ALTO_CABECERA = 32
export const ALTO_GRUPO = 36
export const ANCHO_POR_DEFECTO = 180
export const ANCHO_PRINCIPAL = 260
export const ANCHO_MINIMO = 80
export const ANCHO_MAXIMO = 800
/** Como en Airtable: hasta tres niveles de grupo. */
export const MAX_NIVELES_GRUPO = 3

/** Un campo dentro de la vista: dónde va, si se ve y su ancho. */
export type CampoVista = { id: string; visible: boolean; ancho?: number }

/** Lo que pinta una regla de color: la fila entera o solo las celdas de los campos de sus condiciones. */
export type AlcanceColor = "fila" | "celda"

export const ALCANCES_COLOR: Record<AlcanceColor, string> = { fila: "Toda la fila", celda: "Solo la celda" }

/**
 * Una regla de color: lo que cumple el filtro se pinta del color, la fila entera (de serie) o solo
 * la celda de cada campo de la regla («Notas contiene urgente» pinta la celda de Notas). Manda la
 * primera que se cumple.
 */
export type ReglaColor = { id: string; color: ColorOpcion; filtro: GrupoCondiciones; alcance?: AlcanceColor }

/**
 * El color de la vista: la marca de cada fila, del color de la opción de un campo de selección
 * (`campo`), y las reglas, que pintan filas o celdas. Una regla de fila manda sobre el campo.
 */
export type ColorVista = { campo?: string; reglas?: ReglaColor[] }

/** Cómo se guardaba antes el color (un modo u otro): se lee y se pasa a la forma de ahora. */
export type ColorVistaAntiguo = { modo: "campo"; campo: string } | { modo: "condiciones"; reglas: ReglaColor[] }

export type VistaBase = {
  id: string
  nombre: string
  /** Sin él, cuadrícula (las vistas guardadas antes del kanban). */
  tipo?: TipoVista
  /** Kanban: el campo que reparte las columnas (una selección o un vínculo). */
  apilar?: string
  /** Calendario: el campo de fecha que pone cada registro en su día. */
  fecha?: string
  filtro: GrupoCondiciones
  orden: Orden[]
  grupos: Agrupacion[]
  /** Todos los campos de la base, en el orden de la vista. El principal va siempre primero y visible. */
  campos: CampoVista[]
  /** El total del pie de cada columna. */
  calculos: Record<string, Calculo>
  color?: ColorVista
  altura: AlturaFila
  /** Columnas fijas a la izquierda, contando la principal. */
  congelar: number
  /** Las cabeceras parten el nombre en varias líneas en vez de cortarlo. */
  ajustarCabeceras?: boolean
  /** Los grupos plegados, por su clave (`nivel:id`, unidos con «/»). */
  plegados: string[]
}

/** Un campo del formulario de alta: su orden y si sale. Los obligatorios salen siempre. */
export type CampoFormulario = { id: string; visible: boolean }

/**
 * Lo que cada persona ajusta de un campo de serie en todas sus vistas: el orden y el color de sus
 * opciones (las opciones en sí las pone la página).
 */
export type AjusteCampo = { opciones?: { id: string; color?: ColorOpcion }[] }

/**
 * Todo lo que guarda cada persona de una base: sus vistas, la que tiene abierta, su formulario, sus
 * ajustes de los campos de serie y las vistas de serie que ya conoce (`ofrecidas`), para que una de
 * serie nueva le llegue una vez y, si la borra, no vuelva.
 */
export type ConfigBase = { vistas: VistaBase[]; activa?: string; formulario?: CampoFormulario[]; ajustes?: Record<string, AjusteCampo>; ofrecidas?: string[] }

/** Una vista de serie. `nueva`: llegó después de que hubiera vistas guardadas, así que se añade a quien ya tenía las suyas. */
export type VistaDeSerie = VistaBase & { nueva?: boolean }

/**
 * Los campos con los ajustes de cada persona: las opciones de un campo de serie en su orden (las
 * que no estén en el ajuste, al final) y con su color. Los estados (opciones con `tono`) conservan
 * el suyo: es el de `StatusBadge` en todo el portal.
 */
export function aplicarAjustes<T>(campos: DefCampo<T>[], ajustes: Record<string, AjusteCampo> | undefined): DefCampo<T>[] {
  if (!ajustes || !Object.keys(ajustes).length) return campos
  return campos.map((campo) => {
    const ajuste = ajustes[campo.id]?.opciones
    if (!ajuste || !campo.opciones) return campo
    const posicion = new Map(ajuste.map((o, i) => [o.id, i]))
    const colores = new Map(ajuste.map((o) => [o.id, o.color]))
    const opciones = [...campo.opciones]
      .sort((a, b) => (posicion.get(a.id) ?? ajuste.length) - (posicion.get(b.id) ?? ajuste.length))
      .map((o) => (o.tono || !colores.get(o.id) ? o : { ...o, color: colores.get(o.id) }))
    return { ...campo, opciones }
  })
}

let contador = 0
/** Un id nuevo para vistas, reglas y opciones. */
export const idBase = (prefijo: string) => `${prefijo}-${Date.now().toString(36)}-${(contador += 1).toString(36)}`

/**
 * Una vista nueva, sin filtro, orden ni grupos. La cuadrícula enseña todo salvo lo que nace oculto;
 * las tarjetas (kanban y galería), el principal y unos pocos más, como Airtable.
 */
export function vistaNueva<T>(
  nombre: string,
  campos: DefCampo<T>[],
  { id = idBase("v"), tipo = "cuadricula", apilar: apilarPedido, fecha: fechaPedida }: { id?: string; tipo?: TipoVista; apilar?: string; fecha?: string } = {},
): VistaBase {
  const apilar = tipo === "kanban" ? (apilarPedido ?? camposApilables(campos)[0]?.id) : undefined
  const fecha = tipo === "calendario" ? (fechaPedida ?? camposDeFecha(campos)[0]?.id) : undefined
  let enTarjeta = 0
  const visible = (c: DefCampo<T>) => {
    if (c.principal) return true
    if (c.ocultoDeSerie) return false
    if (tipo === "cuadricula") return true
    if (c.id === apilar || enTarjeta >= CAMPOS_EN_TARJETA) return false
    enTarjeta += 1
    return true
  }
  return {
    id,
    nombre,
    ...(tipo === "cuadricula" ? {} : { tipo }),
    ...(apilar ? { apilar } : {}),
    ...(fecha ? { fecha } : {}),
    filtro: GRUPO_VACIO,
    orden: [],
    grupos: [],
    campos: campos.map((c) => ({ id: c.id, visible: visible(c) })),
    calculos: {},
    altura: "corta",
    congelar: 1,
    plegados: [],
  }
}

/** Los campos que pueden repartir las columnas de un kanban: una selección única o un vínculo. */
export const camposApilables = <T>(campos: DefCampo<T>[]) => campos.filter((c) => esDeUnaOpcion(c.tipo))

/** Los campos que pueden poner los registros en el calendario. */
export const camposDeFecha = <T>(campos: DefCampo<T>[]) => campos.filter((c) => c.tipo === "fecha")

/**
 * La vista al día con los campos que hay ahora: quita los que ya no existen y añade al final los
 * nuevos (visibles, salvo los que nacen ocultos). El principal va primero y siempre visible.
 */
export function normalizarVista<T>(vista: VistaBase, campos: DefCampo<T>[]): VistaBase {
  const existen = new Map(campos.map((c) => [c.id, c]))
  const conocidos = new Set(vista.campos.map((c) => c.id))
  const principal = campos.find((c) => c.principal)
  const lista = [
    ...vista.campos.filter((c) => existen.has(c.id)),
    ...campos.filter((c) => !conocidos.has(c.id)).map((c) => ({ id: c.id, visible: !c.ocultoDeSerie })),
  ]
  const ordenada = principal
    ? [{ ...(lista.find((c) => c.id === principal.id) ?? { id: principal.id }), visible: true }, ...lista.filter((c) => c.id !== principal.id)]
    : lista
  const sigue = (id: string) => existen.has(id)
  // Si el campo del kanban o del calendario ya no está, se toma otro que sirva.
  const apilar = vista.tipo === "kanban" ? (camposApilables(campos).find((c) => c.id === vista.apilar) ?? camposApilables(campos)[0])?.id : vista.apilar
  const fecha = vista.tipo === "calendario" ? (camposDeFecha(campos).find((c) => c.id === vista.fecha) ?? camposDeFecha(campos)[0])?.id : vista.fecha
  return {
    ...vista,
    apilar,
    fecha,
    campos: ordenada,
    orden: vista.orden.filter((o) => sigue(o.campo)),
    grupos: vista.grupos.filter((g) => sigue(g.campo)).slice(0, MAX_NIVELES_GRUPO),
    calculos: Object.fromEntries(Object.entries(vista.calculos).filter(([id]) => sigue(id))),
    color: colorAlDia(vista.color, sigue),
    congelar: Math.max(1, vista.congelar),
  }
}

/** La vista de serie tal cual se guarda: sin la marca de nueva. */
function sinMarcaDeNueva(vista: VistaDeSerie): VistaBase {
  const copia = { ...vista }
  delete copia.nueva
  return copia
}

/**
 * Las vistas guardadas más las de serie que aún no conocía: una de serie que no está entre las
 * guardadas ni entre las ya ofrecidas se añade al final. Sin lista de ofrecidas (lo guardado antes
 * de que existiera), se dan por conocidas todas las de serie salvo las nuevas.
 */
function conLasDeSerieNuevas(config: ConfigBase, deSerie: VistaDeSerie[]): VistaBase[] {
  const guardadas = new Set(config.vistas.map((v) => v.id))
  const conocidas = new Set(config.ofrecidas ?? deSerie.filter((v) => !v.nueva).map((v) => v.id))
  return [...config.vistas, ...deSerie.filter((v) => !guardadas.has(v.id) && !conocidas.has(v.id)).map(sinMarcaDeNueva)]
}

/** La configuración al día: sin vistas, las de serie (y las de serie nuevas, a quien ya tenía las suyas); la activa, una que exista. */
export function normalizarConfig<T>(config: ConfigBase | null | undefined, campos: DefCampo<T>[], deSerie: VistaDeSerie[]): ConfigBase {
  const vistas = (config?.vistas?.length ? conLasDeSerieNuevas(config, deSerie) : deSerie.map(sinMarcaDeNueva)).map((v) => normalizarVista(v, campos))
  const activa = vistas.some((v) => v.id === config?.activa) ? config?.activa : vistas[0]?.id
  return { vistas, activa, formulario: config?.formulario, ...(config?.ajustes ? { ajustes: config.ajustes } : {}), ofrecidas: deSerie.map((v) => v.id) }
}

/** Los campos que se ven, en el orden de la vista y con su ancho. */
export function columnasDeVista<T>(vista: VistaBase, campos: DefCampo<T>[]): { campo: DefCampo<T>; ancho: number }[] {
  const porId = new Map(campos.map((c) => [c.id, c]))
  return vista.campos.flatMap((cv) => {
    const campo = porId.get(cv.id)
    if (!campo || !cv.visible) return []
    return [{ campo, ancho: cv.ancho ?? (campo.principal ? ANCHO_PRINCIPAL : ANCHO_POR_DEFECTO) }]
  })
}

/** Cuántos campos esconde la vista: el «63 campos ocultos» de la barra. */
export const camposOcultos = (vista: VistaBase) => vista.campos.filter((c) => !c.visible).length

/** El texto del botón de filtro: «Filtrado por Marca» con un campo, «Filtrado por 3 campos» con varios. */
export function textoFiltro<T>(filtro: GrupoCondiciones, campos: DefCampo<T>[]): string | null {
  if (grupoVacio(filtro)) return null
  const ids = camposDeFiltro(filtro)
  if (ids.length === 1) return `Filtrado por ${campos.find((c) => c.id === ids[0])?.nombre ?? "1 campo"}`
  return `Filtrado por ${ids.length} campos`
}

export const textoCampos = (n: number, accion: string) => `${accion} por ${n} ${n === 1 ? "campo" : "campos"}`

export { contarCondiciones }

// ---------- Grupos de varios niveles ----------

export type NodoGrupo<T> = {
  /** Única en toda la rejilla: la de sus padres y la suya («0:marca-1/1:true»). */
  clave: string
  nivel: number
  campo: string
  id: string
  label: string
  filas: T[]
  hijos: NodoGrupo<T>[]
}

/**
 * Reparte las filas en grupos de hasta tres niveles. Solo salen los grupos con filas, como en
 * Airtable; el orden de los grupos es el de cada nivel (sus opciones, o A → Z y Z → A).
 */
export function agruparEnNiveles<T>(filas: T[], niveles: Agrupacion[], campos: CampoFiltrable<T>[], ref: { hoy: string }, padre = "", nivel = 0): NodoGrupo<T>[] {
  const agrupacion = niveles[nivel]
  if (!agrupacion) return []
  const campo = campos.find((c) => c.id === agrupacion.campo)
  // Los textos se ordenan por el abecedario; las listas por sus opciones, y fechas y números de menor
  // a mayor: en esos, «Z → A» o «9 → 1» es el mismo orden al revés (lo vacío sigue al final).
  const natural = campo !== undefined && campo.tipo !== "texto" && campo.tipo !== "multiselect"
  const repartidos = agruparFilas(filas, { ...agrupacion, ordenGrupos: natural ? "opciones" : agrupacion.ordenGrupos, ocultarVacios: true }, campos.map(porCombinacion), ref)
  const enOrden = natural && agrupacion.ordenGrupos === "desc" ? [...repartidos.filter((g) => g.id !== SIN_VALOR).reverse(), ...repartidos.filter((g) => g.id === SIN_VALOR)] : repartidos
  return enOrden.map((g) => {
    const clave = `${padre}${padre ? "/" : ""}${nivel}:${g.id}`
    return { clave, nivel, campo: agrupacion.campo, id: g.id, label: g.label, filas: g.filas, hijos: agruparEnNiveles(g.filas, niveles, campos, ref, clave, nivel + 1) }
  })
}

/**
 * En la rejilla, una selección múltiple agrupa por la combinación entera («Instagram, TikTok»),
 * como Airtable: así cada registro sale una sola vez y no se repite en cada una de sus opciones.
 */
function porCombinacion<T>(campo: CampoFiltrable<T>): CampoFiltrable<T> {
  if (campo.tipo !== "multiselect") return campo
  const etiqueta = (id: string) => campo.opciones?.find((o) => o.value === id)?.label ?? id
  return {
    ...campo,
    tipo: "texto",
    valor: (fila) => {
      const v = campo.valor(fila)
      const ids = Array.isArray(v) ? v : v ? [String(v)] : []
      return ids.length ? ids.map(etiqueta).join(", ") : null
    },
  }
}

/** Una línea de la rejilla: la cabecera de un grupo o un registro. */
export type LineaRejilla<T> = { tipo: "grupo"; nodo: NodoGrupo<T> } | { tipo: "registro"; fila: T; numero: number }

/**
 * Las líneas que pinta la rejilla, en orden: cada grupo con su cabecera y, si no está plegado, lo
 * de dentro. El número de cada registro es su posición en toda la vista, como en Airtable.
 */
export function lineasDeRejilla<T>(filas: T[], nodos: NodoGrupo<T>[], plegados: Set<string>): LineaRejilla<T>[] {
  if (nodos.length === 0) return filas.map((fila, i) => ({ tipo: "registro", fila, numero: i + 1 }))
  const lineas: LineaRejilla<T>[] = []
  let numero = 0
  const recorrer = (lista: NodoGrupo<T>[]) => {
    for (const nodo of lista) {
      lineas.push({ tipo: "grupo", nodo })
      if (plegados.has(nodo.clave)) {
        numero += nodo.filas.length
        continue
      }
      if (nodo.hijos.length) recorrer(nodo.hijos)
      else for (const fila of nodo.filas) lineas.push({ tipo: "registro", fila, numero: (numero += 1) })
    }
  }
  recorrer(nodos)
  return lineas
}

/** Todas las claves de grupo, para «Contraer todo». */
export function clavesDeGrupos<T>(nodos: NodoGrupo<T>[]): string[] {
  return nodos.flatMap((n) => [n.clave, ...clavesDeGrupos(n.hijos)])
}

// ---------- Color de filas y celdas ----------

/** El color en la forma de ahora (o el de antes, traducido), sin el campo si ya no existe y sin nada si queda vacío. */
export function colorAlDia(color: ColorVista | ColorVistaAntiguo | undefined, existe: (id: string) => boolean): ColorVista | undefined {
  if (!color) return undefined
  const actual: ColorVista = "modo" in color ? (color.modo === "campo" ? { campo: color.campo } : { reglas: color.reglas }) : color
  const campo = actual.campo && existe(actual.campo) ? actual.campo : undefined
  const reglas = actual.reglas?.length ? actual.reglas : undefined
  if (!campo && !reglas) return undefined
  return { ...(campo ? { campo } : {}), ...(reglas ? { reglas } : {}) }
}

/** Los campos que nombra un filtro, en todos sus niveles. */
export function camposDeFiltro(filtro: GrupoCondiciones): string[] {
  const ids = new Set<string>()
  const recorrer = (g: GrupoCondiciones) => {
    g.condiciones.forEach((c) => ids.add(c.campo))
    g.grupos?.forEach(recorrer)
  }
  recorrer(filtro)
  return [...ids]
}

/** Las reglas que son solo de un campo (todas sus condiciones van sobre él): las que se editan desde su cabecera. */
export const reglasDeCampo = (color: ColorVista | undefined, campoId: string): ReglaColor[] =>
  (color?.reglas ?? []).filter((r) => !r.filtro.grupos?.length && r.filtro.condiciones.length > 0 && r.filtro.condiciones.every((c) => c.campo === campoId))

/** Cómo se pinta un registro: la marca de color (izquierda o punto de la tarjeta), el fondo de la fila entera y el de cada celda. */
export type ColoresRegistro = { marca?: ColorOpcion; fondo?: ColorOpcion; celdas: Map<string, ColorOpcion> }

/**
 * Los colores de un registro según la vista. La primera regla de fila que cumple pinta la fila
 * entera y su marca; si no hay, la marca es la de su opción del campo elegido. Cada celda toma la
 * primera regla de celda que cumple y nombra su campo.
 */
export function coloresDeRegistro<T>(fila: T, color: ColorVista | undefined, campos: DefCampo<T>[], filtrables: CampoFiltrable<T>[], ref: { hoy: string }): ColoresRegistro {
  const celdas = new Map<string, ColorOpcion>()
  if (!color) return { celdas }
  const cumple = (r: ReglaColor) => !grupoVacio(r.filtro) && cumpleGrupo(fila, r.filtro, filtrables, ref)
  const reglas = color.reglas ?? []
  const deFila = reglas.find((r) => (r.alcance ?? "fila") === "fila" && cumple(r))?.color
  for (const r of reglas) {
    if (r.alcance !== "celda" || !cumple(r)) continue
    for (const id of camposDeFiltro(r.filtro)) if (!celdas.has(id)) celdas.set(id, r.color)
  }
  return { marca: deFila ?? colorDeOpcion(fila, color.campo, campos), fondo: deFila, celdas }
}

function colorDeOpcion<T>(fila: T, campoId: string | undefined, campos: DefCampo<T>[]): ColorOpcion | undefined {
  const campo = campoId ? campos.find((c) => c.id === campoId) : undefined
  const v = campo?.valor(fila)
  return campo && typeof v === "string" ? opcionDe(campo, v)?.color : undefined
}

/** La marca de color de un registro (la de las tarjetas y el calendario). */
export function colorDeFila<T>(fila: T, color: ColorVista | undefined, campos: DefCampo<T>[], ref: { hoy: string }): ColorOpcion | undefined {
  return coloresDeRegistro(fila, color, campos, campos.map(aFiltrable), ref).marca
}

/** Mover un elemento de una lista de `desde` a `hasta` (arrastrar columnas, vistas, condiciones). */
export function mover<X>(lista: X[], desde: number, hasta: number): X[] {
  if (desde === hasta || desde < 0 || hasta < 0 || desde >= lista.length || hasta >= lista.length) return lista
  const copia = [...lista]
  const [x] = copia.splice(desde, 1)
  copia.splice(hasta, 0, x)
  return copia
}

// ---------- Formulario de alta ----------

/**
 * Los campos del formulario en su orden, con si salen. De serie salen todos los que se pueden
 * escribir; los obligatorios salen siempre; los nuevos se añaden al final, encendidos los de serie.
 */
export function camposDeFormulario<T>(config: CampoFormulario[] | undefined, campos: DefCampo<T>[]): { campo: DefCampo<T>; visible: boolean }[] {
  const escribibles = campos.filter((c) => !c.soloLectura)
  const porId = new Map(escribibles.map((c) => [c.id, c]))
  const guardados = (config ?? []).filter((c) => porId.has(c.id))
  const conocidos = new Set(guardados.map((c) => c.id))
  const lista = [...guardados, ...escribibles.filter((c) => !conocidos.has(c.id)).map((c) => ({ id: c.id, visible: !c.propio && !c.ocultoDeSerie }))]
  return lista.flatMap((cf) => {
    const campo = porId.get(cf.id)
    return campo ? [{ campo, visible: cf.visible || !!campo.obligatorio || !!campo.principal }] : []
  })
}
