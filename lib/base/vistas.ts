// Las vistas de una base al estilo Airtable, como las guarda Airtable: un filtro en árbol, el orden
// por varios campos, grupos de hasta tres niveles, los campos de la vista (orden, visibles y ancho),
// los totales del pie, el color de las filas y su altura. Cada persona tiene las suyas.
//
// Es puro: reparte, agrupa y colorea sobre las filas ya cargadas, con los mismos motores de filtro,
// orden y grupos que el resto del design system (`lib/filtros`, `lib/vistas/core.ts`).

import { GRUPO_VACIO, contarCondiciones, cumpleGrupo, grupoVacio, type CampoFiltrable, type GrupoCondiciones } from "@/lib/filtros/core"
import { SIN_VALOR, agruparFilas, type Agrupacion, type Calculo, type Orden } from "@/lib/vistas/core"
import { aFiltrable, opcionDe, type ColorOpcion, type DefCampo } from "@/lib/base/campos"

export type AlturaFila = "corta" | "media" | "alta" | "extra"

/** Las alturas de fila de Airtable, en píxeles. */
export const ALTURAS_FILA: Record<AlturaFila, { label: string; px: number }> = {
  corta: { label: "Corta", px: 32 },
  media: { label: "Media", px: 56 },
  alta: { label: "Alta", px: 88 },
  extra: { label: "Extraalta", px: 128 },
}

export const ALTO_CABECERA = 32
export const ALTO_GRUPO = 48
export const ANCHO_POR_DEFECTO = 180
export const ANCHO_PRINCIPAL = 260
export const ANCHO_MINIMO = 80
export const ANCHO_MAXIMO = 800
/** Como en Airtable: hasta tres niveles de grupo. */
export const MAX_NIVELES_GRUPO = 3

/** Un campo dentro de la vista: dónde va, si se ve y su ancho. */
export type CampoVista = { id: string; visible: boolean; ancho?: number }

/** Una regla de color: las filas que cumplen el filtro se pintan del color. Manda la primera que se cumple. */
export type ReglaColor = { id: string; color: ColorOpcion; filtro: GrupoCondiciones }

/** Pintar las filas por el color de la opción de un campo de selección, o por condiciones. */
export type ColorVista = { modo: "campo"; campo: string } | { modo: "condiciones"; reglas: ReglaColor[] }

export type VistaBase = {
  id: string
  nombre: string
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

/** Todo lo que guarda cada persona de una base: sus vistas, la que tiene abierta y su formulario. */
export type ConfigBase = { vistas: VistaBase[]; activa?: string; formulario?: CampoFormulario[] }

let contador = 0
/** Un id nuevo para vistas, reglas y opciones. */
export const idBase = (prefijo: string) => `${prefijo}-${Date.now().toString(36)}-${(contador += 1).toString(36)}`

/** Una vista de cuadrícula nueva: todo visible salvo lo que nace oculto, sin filtro, orden ni grupos. */
export function vistaNueva<T>(nombre: string, campos: DefCampo<T>[], id = idBase("v")): VistaBase {
  return {
    id,
    nombre,
    filtro: GRUPO_VACIO,
    orden: [],
    grupos: [],
    campos: campos.map((c) => ({ id: c.id, visible: !!c.principal || !c.ocultoDeSerie })),
    calculos: {},
    altura: "corta",
    congelar: 1,
    plegados: [],
  }
}

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
  return {
    ...vista,
    campos: ordenada,
    orden: vista.orden.filter((o) => sigue(o.campo)),
    grupos: vista.grupos.filter((g) => sigue(g.campo)).slice(0, MAX_NIVELES_GRUPO),
    calculos: Object.fromEntries(Object.entries(vista.calculos).filter(([id]) => sigue(id))),
    color: vista.color?.modo === "campo" && !sigue(vista.color.campo) ? undefined : vista.color,
    congelar: Math.max(1, vista.congelar),
  }
}

/** La configuración al día: sin vistas, las de serie; la activa, una que exista. */
export function normalizarConfig<T>(config: ConfigBase | null | undefined, campos: DefCampo<T>[], deSerie: VistaBase[]): ConfigBase {
  const vistas = (config?.vistas?.length ? config.vistas : deSerie).map((v) => normalizarVista(v, campos))
  const activa = vistas.some((v) => v.id === config?.activa) ? config?.activa : vistas[0]?.id
  return { vistas, activa, formulario: config?.formulario }
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
  const ids = new Set<string>()
  const recorrer = (g: GrupoCondiciones) => {
    g.condiciones.forEach((c) => ids.add(c.campo))
    g.grupos?.forEach(recorrer)
  }
  recorrer(filtro)
  if (ids.size === 1) return `Filtrado por ${campos.find((c) => c.id === [...ids][0])?.nombre ?? "1 campo"}`
  return `Filtrado por ${ids.size} campos`
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

// ---------- Color de las filas ----------

/** El color de una fila según la vista: el de su opción o el de la primera regla que cumple. */
export function colorDeFila<T>(fila: T, color: ColorVista | undefined, campos: DefCampo<T>[], ref: { hoy: string }): ColorOpcion | undefined {
  if (!color) return undefined
  if (color.modo === "campo") {
    const campo = campos.find((c) => c.id === color.campo)
    const v = campo?.valor(fila)
    if (!campo || typeof v !== "string") return undefined
    return opcionDe(campo, v)?.color
  }
  const filtrables = campos.map(aFiltrable)
  return color.reglas.find((r) => !grupoVacio(r.filtro) && cumpleGrupo(fila, r.filtro, filtrables, ref))?.color
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
