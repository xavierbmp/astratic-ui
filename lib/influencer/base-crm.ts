// Las bases del CRM al estilo Airtable (marcas, propuestas y plantillas): sus campos de serie (se
// ocultan, no se borran), los propios, sus vistas de serie y cómo se escribe un valor en cada
// registro. Puro: lo usan las páginas y las pruebas. Los contactos tienen su archivo
// (`base-contactos.ts`).

import { campoDePropio, conValorPropio, opcionesDeEstados, textoLimpio, type CampoPropio, type DefCampo, type ValorCampo } from "@/lib/base/campos"
import { vistaNueva, type VistaBase } from "@/lib/base/vistas"
import { soloFecha } from "@/lib/influencer/fechas"
import { contactoDePropuesta, importeDe, type ResumenMarca } from "@/lib/influencer/crm"
import { COLOR_DE_TINTE, opcionesDeMarcas } from "@/lib/influencer/base-contactos"
import { TINTS, tintLabel, type Tint } from "@/lib/influencer/tints"
import {
  CANALES_PLANTILLA,
  ESTADOS_PROPUESTA,
  FORMATOS,
  LISTA_FORMATOS,
  MOTIVOS_PERDIDA,
  ORIGENES,
  RELACIONES_MARCA,
  USOS_PLANTILLA,
  describirPiezas,
  type Contacto,
  type Marca,
  type Plantilla,
  type Propuesta,
  type Tarifa,
} from "@/lib/influencer/modelo"

const texto = (v: string | undefined) => v ?? null
/** ¿Es una de las claves de la lista? (lo escrito en una celda de selección). */
const esDe = <K extends string>(o: Record<K, unknown>, v: ValorCampo): v is K => typeof v === "string" && v in o
const deLista = (o: Record<string, string>) => Object.entries(o).map(([id, label]) => ({ id, label }))
const ATRIBUCIONES = [
  { id: "propia", label: "Tuya" },
  { id: "red", label: "De la red" },
]

// ---------- Marcas ----------

export function camposBaseMarcas({ marcas, contactos, resumenes, propios }: { marcas: Marca[]; contactos: Contacto[]; resumenes: Map<string, ResumenMarca>; propios: CampoPropio[] }): DefCampo<Marca>[] {
  const r = (m: Marca) => resumenes.get(m.id)
  const sectores = [...new Set(marcas.map((m) => m.sector).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"))
  return [
    { id: "nombre", nombre: "Nombre", tipo: "texto", principal: true, obligatorio: true, grupo: "Datos", valor: (m) => m.nombre },
    { id: "relacion", nombre: "Relación", tipo: "select", soloLectura: true, opciones: opcionesDeEstados(RELACIONES_MARCA), grupo: "Relación", descripcion: "Sale de sus propuestas y collabs.", valor: (m) => r(m)?.relacion ?? null },
    { id: "sector", nombre: "Sector", tipo: "texto", grupo: "Datos", descripcion: sectores.length ? `Los que tienes: ${sectores.join(", ")}.` : undefined, valor: (m) => texto(m.sector) },
    { id: "principal", nombre: "Contacto principal", tipo: "vinculo", vinculo: { objeto: "persona" }, soloLectura: true, opciones: contactos.map((c) => ({ id: c.id, label: c.nombre })), grupo: "Relación", descripcion: "Se cambia desde Contactos o la ficha de la marca.", valor: (m) => r(m)?.principal?.id ?? null },
    { id: "valorAbierto", nombre: "Valor abierto", tipo: "moneda", formato: { decimales: 0 }, soloLectura: true, grupo: "Dinero", valor: (m) => r(m)?.valorAbierto ?? 0 },
    { id: "ultimoContacto", nombre: "Último contacto", tipo: "fecha", soloLectura: true, grupo: "Seguimiento", valor: (m) => (r(m)?.ultimoContacto ? soloFecha(r(m)?.ultimoContacto ?? "") : null) },
    { id: "atribucion", nombre: "Atribución", tipo: "select", opciones: ATRIBUCIONES, grupo: "Relación", descripcion: "Tuya: la trajiste tú y es tuya 12 meses. De la red: la trae Astratic.", valor: (m) => m.atribucion },
    { id: "atribucionHasta", nombre: "Tuya hasta", tipo: "fecha", grupo: "Relación", valor: (m) => texto(m.atribucionHasta) },
    { id: "web", nombre: "Web", tipo: "url", grupo: "Datos", valor: (m) => texto(m.web) },
    { id: "instagram", nombre: "Instagram", tipo: "texto", grupo: "Datos", valor: (m) => texto(m.instagram) },
    { id: "contactos", nombre: "Contactos", tipo: "numero", soloLectura: true, grupo: "Relación", valor: (m) => r(m)?.contactos ?? 0 },
    { id: "propuestasAbiertas", nombre: "Propuestas abiertas", tipo: "numero", soloLectura: true, grupo: "Dinero", valor: (m) => r(m)?.propuestasAbiertas ?? 0 },
    { id: "collabs", nombre: "Collabs", tipo: "numero", soloLectura: true, grupo: "Dinero", valor: (m) => r(m)?.collabs ?? 0 },
    { id: "facturado", nombre: "Facturado", tipo: "moneda", formato: { decimales: 0 }, soloLectura: true, grupo: "Dinero", valor: (m) => r(m)?.facturado ?? 0 },
    { id: "tint", nombre: "Color", tipo: "select", obligatorio: true, ocultoDeSerie: true, opciones: TINTS.map((t) => ({ id: t, label: tintLabel[t], color: COLOR_DE_TINTE[t] })), grupo: "Datos", valor: (m) => m.tint },
    { id: "notas", nombre: "Notas", tipo: "texto_largo", ocultoDeSerie: true, grupo: "Datos", valor: (m) => texto(m.notas) },
    { id: "creadaEl", nombre: "Añadida", tipo: "fecha", soloLectura: true, ocultoDeSerie: true, grupo: "Datos", valor: (m) => soloFecha(m.creadaEl) },
    ...propios.map((p) => campoDePropio<Marca>(p, (m) => m.valores)),
  ]
}

export const vistasDeSerieMarcas = (campos: DefCampo<Marca>[]): VistaBase[] => [
  vistaNueva("Todas las marcas", campos, { id: "marcas-todas" }),
  vistaNueva("Tarjetas", campos, { id: "marcas-tarjetas", tipo: "galeria" }),
]

/**
 * Una marca con el valor de un campo cambiado. Pasar a «De la red» quita el «tuya hasta»; volver a
 * tuya lo pone desde hoy si no tenía. Lo calculado no se escribe.
 */
export function escribirEnMarca(marca: Marca, campo: DefCampo<Marca>, valor: ValorCampo, hoy: string): Marca {
  if (campo.soloLectura) return marca
  if (campo.propio) return conValorPropio(marca, campo.id, valor)
  switch (campo.id) {
    case "nombre":
      return textoLimpio(valor) ? { ...marca, nombre: textoLimpio(valor) ?? marca.nombre } : marca
    case "sector":
      return { ...marca, sector: textoLimpio(valor) ?? "" }
    case "atribucion":
      if (valor === "red") return { ...marca, atribucion: "red", atribucionHasta: undefined }
      return valor === "propia" ? { ...marca, atribucion: "propia", atribucionHasta: marca.atribucionHasta ?? soloFecha(hoy) } : marca
    case "atribucionHasta":
      return { ...marca, atribucionHasta: textoLimpio(valor) }
    case "tint":
      return TINTS.includes(valor as Tint) ? { ...marca, tint: valor as Tint } : marca
    case "instagram":
      return { ...marca, instagram: textoLimpio(valor)?.replace(/^@/, "") }
    case "web":
    case "notas":
      return { ...marca, [campo.id]: textoLimpio(valor) }
    default:
      return marca
  }
}

// ---------- Propuestas (el pipeline) ----------

export function camposBasePropuestas({ marcas, contactos, tarifas, propios }: { marcas: Marca[]; contactos: Contacto[]; tarifas: Tarifa[]; propios: CampoPropio[] }): DefCampo<Propuesta>[] {
  const marca = (p: Propuesta) => marcas.find((m) => m.id === p.marcaId)
  const nombreMarca = (id: string | undefined) => marcas.find((m) => m.id === id)?.nombre
  const opcionesContacto = [...contactos]
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"))
    .map((c) => ({ id: c.id, label: nombreMarca(c.marcaId) ? `${c.nombre} · ${nombreMarca(c.marcaId)}` : c.nombre }))
  return [
    { id: "campana", nombre: "Campaña", tipo: "texto", principal: true, obligatorio: true, grupo: "Datos", valor: (p) => p.campana },
    { id: "marca", nombre: "Marca", tipo: "vinculo", vinculo: { objeto: "marca" }, obligatorio: true, opciones: opcionesDeMarcas(marcas), grupo: "Datos", valor: (p) => p.marcaId },
    { id: "estado", nombre: "Estado", tipo: "select", obligatorio: true, opciones: opcionesDeEstados(ESTADOS_PROPUESTA), grupo: "Estado", valor: (p) => p.estado },
    { id: "importe", nombre: "Importe", tipo: "moneda", formato: { decimales: 0 }, soloLectura: true, grupo: "Dinero", descripcion: "Sale del presupuesto o de tus tarifas por lo que piden.", valor: (p) => importeDe(p, tarifas) },
    { id: "siguientePaso", nombre: "Siguiente paso", tipo: "texto", grupo: "Seguimiento", valor: (p) => texto(p.siguientePaso) },
    { id: "siguienteFecha", nombre: "Fecha del paso", tipo: "fecha", grupo: "Seguimiento", valor: (p) => texto(p.siguienteFecha) },
    { id: "contacto", nombre: "Contacto", tipo: "vinculo", vinculo: { objeto: "persona" }, opciones: opcionesContacto, grupo: "Datos", descripcion: "Con quién hablas. Si no eliges, el principal de la marca.", valor: (p) => contactoDePropuesta(p, contactos)?.id ?? null },
    { id: "piden", nombre: "Piden", tipo: "texto", soloLectura: true, grupo: "Datos", valor: (p) => describirPiezas(p.piezas) || null },
    { id: "formatos", nombre: "Formatos", tipo: "multiselect", soloLectura: true, ocultoDeSerie: true, opciones: LISTA_FORMATOS.map((f) => ({ id: f, label: FORMATOS[f].label })), grupo: "Datos", valor: (p) => [...new Set(p.piezas.map((x) => x.formato))] },
    { id: "ofrecen", nombre: "Lo que ofrecen", tipo: "moneda", formato: { decimales: 0 }, grupo: "Dinero", valor: (p) => p.ofrecen ?? null },
    { id: "presupuesto", nombre: "Con presupuesto", tipo: "casilla", soloLectura: true, ocultoDeSerie: true, grupo: "Dinero", valor: (p) => !!p.presupuesto },
    { id: "origen", nombre: "Origen", tipo: "select", obligatorio: true, opciones: deLista(ORIGENES), grupo: "Estado", valor: (p) => p.origen },
    { id: "ultimoContacto", nombre: "Último contacto", tipo: "fecha", soloLectura: true, grupo: "Seguimiento", valor: (p) => soloFecha(p.ultimoContacto) },
    { id: "desde", nombre: "Publicar desde", tipo: "fecha", grupo: "Fechas", valor: (p) => texto(p.desde) },
    { id: "hasta", nombre: "Publicar hasta", tipo: "fecha", ocultoDeSerie: true, grupo: "Fechas", valor: (p) => texto(p.hasta) },
    { id: "motivoPerdida", nombre: "Motivo de pérdida", tipo: "select", ocultoDeSerie: true, opciones: deLista(MOTIVOS_PERDIDA), grupo: "Estado", valor: (p) => texto(p.motivoPerdida) },
    { id: "atribucion", nombre: "Atribución", tipo: "select", soloLectura: true, ocultoDeSerie: true, opciones: ATRIBUCIONES, grupo: "Estado", valor: (p) => marca(p)?.atribucion ?? null },
    { id: "notas", nombre: "Notas", tipo: "texto_largo", ocultoDeSerie: true, grupo: "Datos", valor: (p) => texto(p.notas) },
    { id: "creadaEl", nombre: "Creada", tipo: "fecha", soloLectura: true, ocultoDeSerie: true, grupo: "Fechas", valor: (p) => soloFecha(p.creadaEl) },
    ...propios.map((x) => campoDePropio<Propuesta>(x, (p) => p.valores)),
  ]
}

/** El pipeline en kanban por estado (la de siempre), todas en cuadrícula y los pasos en el calendario. */
export function vistasDeSeriePropuestas(campos: DefCampo<Propuesta>[]): VistaBase[] {
  return [
    vistaNueva("Pipeline", campos, { id: "propuestas-pipeline", tipo: "kanban", apilar: "estado" }),
    vistaNueva("Todas las propuestas", campos, { id: "propuestas-todas" }),
    vistaNueva("Siguientes pasos", campos, { id: "propuestas-pasos", tipo: "calendario", fecha: "siguienteFecha" }),
  ]
}

/**
 * Una propuesta con el valor de un campo cambiado. El estado no pasa por aquí: tiene sus efectos
 * (ganar crea la collab, perder pide el motivo) y lo cambia la página con sus acciones.
 */
export function escribirEnPropuesta(p: Propuesta, campo: DefCampo<Propuesta>, valor: ValorCampo): Propuesta {
  if (campo.soloLectura) return p
  if (campo.propio) return conValorPropio(p, campo.id, valor)
  switch (campo.id) {
    case "campana":
      return textoLimpio(valor) ? { ...p, campana: textoLimpio(valor) ?? p.campana } : p
    case "marca":
      return typeof valor === "string" && valor ? { ...p, marcaId: valor } : p
    case "contacto":
      return { ...p, contactoId: textoLimpio(valor) }
    case "ofrecen":
      return { ...p, ofrecen: typeof valor === "number" ? valor : undefined }
    case "origen":
      return esDe(ORIGENES, valor) ? { ...p, origen: valor } : p
    case "motivoPerdida":
      return { ...p, motivoPerdida: esDe(MOTIVOS_PERDIDA, valor) ? valor : undefined }
    case "siguientePaso":
    case "siguienteFecha":
    case "desde":
    case "hasta":
    case "notas":
      return { ...p, [campo.id]: textoLimpio(valor) }
    default:
      return p
  }
}

// ---------- Plantillas ----------

export function camposBasePlantillas({ propios }: { propios: CampoPropio[] }): DefCampo<Plantilla>[] {
  return [
    { id: "nombre", nombre: "Nombre", tipo: "texto", principal: true, obligatorio: true, grupo: "Datos", valor: (p) => p.nombre },
    { id: "uso", nombre: "Para qué", tipo: "select", obligatorio: true, opciones: deLista(USOS_PLANTILLA), grupo: "Datos", valor: (p) => p.uso },
    { id: "canal", nombre: "Canal", tipo: "select", obligatorio: true, opciones: deLista(CANALES_PLANTILLA), grupo: "Datos", valor: (p) => p.canal },
    { id: "favorita", nombre: "Favorita", tipo: "casilla", grupo: "Datos", valor: (p) => p.favorita },
    { id: "asunto", nombre: "Asunto", tipo: "texto", grupo: "Texto", valor: (p) => texto(p.asunto) },
    { id: "cuerpo", nombre: "Texto", tipo: "texto_largo", grupo: "Texto", valor: (p) => p.cuerpo },
    { id: "usos", nombre: "Veces usada", tipo: "numero", soloLectura: true, grupo: "Uso", valor: (p) => p.usos },
    { id: "ultimoUso", nombre: "Último uso", tipo: "fecha", soloLectura: true, grupo: "Uso", valor: (p) => (p.ultimoUso ? soloFecha(p.ultimoUso) : null) },
    { id: "actualizadaEl", nombre: "Editada", tipo: "fecha", soloLectura: true, grupo: "Uso", valor: (p) => soloFecha(p.actualizadaEl) },
    { id: "creadaEl", nombre: "Creada", tipo: "fecha", soloLectura: true, ocultoDeSerie: true, grupo: "Uso", valor: (p) => soloFecha(p.creadaEl) },
    ...propios.map((x) => campoDePropio<Plantilla>(x, (p) => p.valores)),
  ]
}

export const vistasDeSeriePlantillas = (campos: DefCampo<Plantilla>[]): VistaBase[] => [
  { ...vistaNueva("Por momento", campos, { id: "plantillas-todas" }), grupos: [{ campo: "uso", ordenGrupos: "asc" }] },
  vistaNueva("Tarjetas", campos, { id: "plantillas-tarjetas", tipo: "galeria" }),
]

/** Una plantilla con el valor de un campo cambiado (y la fecha de edición al día si cambia el texto). */
export function escribirEnPlantilla(p: Plantilla, campo: DefCampo<Plantilla>, valor: ValorCampo, ahora: string): Plantilla {
  if (campo.soloLectura) return p
  if (campo.propio) return conValorPropio(p, campo.id, valor)
  switch (campo.id) {
    case "nombre":
      return textoLimpio(valor) ? { ...p, nombre: textoLimpio(valor) ?? p.nombre, actualizadaEl: ahora } : p
    case "uso":
      return esDe(USOS_PLANTILLA, valor) ? { ...p, uso: valor } : p
    case "canal":
      return esDe(CANALES_PLANTILLA, valor) ? { ...p, canal: valor } : p
    case "favorita":
      return { ...p, favorita: valor === true }
    case "asunto":
      return { ...p, asunto: textoLimpio(valor), actualizadaEl: ahora }
    case "cuerpo":
      return typeof valor === "string" ? { ...p, cuerpo: valor, actualizadaEl: ahora } : p
    default:
      return p
  }
}
