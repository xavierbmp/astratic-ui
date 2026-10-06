// Cobros: lo que le deben a la creadora, collab a collab y plazo a plazo, con su factura si ya la
// hizo. Cada línea es un plazo de cobro (o una factura sin plazo, como un extra) y se sigue desde
// «Por facturar» hasta «Cobrada». De aquí salen las cifras de la página, el orden de lo urgente, la
// previsión, los impuestos del trimestre y la exportación para la gestoría.
import { ESTADOS_FACTURA, type Collab, type DatosFacturacion, type DatosFiscales, type Estado, type EstadoFactura, type Factura, type Marca, type PlazoCobro } from "@/lib/influencer/modelo"
import type { Evento } from "@/lib/influencer/agenda"
import { marcaDe } from "@/lib/influencer/collabs"
import { baseFacturable, calcularFactura, diasDePago, estadoDeFactura, importeDePlazo } from "@/lib/influencer/facturacion"
import { diasEntre, soloFecha, sumarDias } from "@/lib/influencer/fechas"

export type EstadoLineaCobro = "por-facturar" | EstadoFactura

/** En el orden del trabajo: facturar, enviar, esperar (o reclamar si vence) y cobrar. */
export const ESTADOS_LINEA_COBRO: Estado<EstadoLineaCobro>[] = [{ id: "por-facturar", label: "Por facturar", tone: "neutral" }, ...ESTADOS_FACTURA]

/** Con el contenido publicado o entregado ya toca facturar lo que quede del plan de cobro. */
const ESTADOS_PARA_FACTURAR: Collab["estado"][] = ["publicada", "por-cobrar", "cerrada"]

/** Días hacia delante que mira la previsión de cobros. */
export const DIAS_PREVISION = 30

export type LineaCobro = {
  /** El id del plazo o, si la factura no cubre ningún plazo, el de la factura. */
  id: string
  collab: Collab
  plazo?: PlazoCobro
  factura?: Factura
  estado: EstadoLineaCobro
  /** Base imponible: la de la factura o, sin factura, la parte que toca por el plazo. */
  base: number
  /** Lo que llega al banco (base + IVA − retención). Sin factura, con sus porcentajes de siempre. */
  total: number
  /** Cuándo se espera el dinero: el vencimiento de la factura o, sin ella, el fin de la collab más los días de pago. */
  previsto: string
  /** Sin factura y con el contenido ya publicado o entregado. */
  tocaFacturar: boolean
  /** Días desde que venció; 0 si no está vencida. */
  diasVencida: number
}

type Impuestos = Pick<DatosFiscales, "ivaPct" | "irpfPct">

const sumaBases = (lineas: { base: number }[]) => Math.round(lineas.reduce((a, l) => a + l.base * 100, 0)) / 100

function lineaDeFactura(collab: Collab, factura: Factura, plazo: PlazoCobro | undefined, dia: string): LineaCobro {
  const estado = estadoDeFactura(factura, dia)
  return {
    id: plazo?.id ?? factura.id,
    collab,
    plazo,
    factura,
    estado,
    base: factura.base,
    total: calcularFactura(factura).total,
    previsto: factura.vencimiento,
    tocaFacturar: false,
    diasVencida: estado === "vencida" ? diasEntre(factura.vencimiento, dia) : 0,
  }
}

function lineaPorFacturar(collab: Collab, plazo: PlazoCobro, impuestos: Impuestos): LineaCobro {
  const base = importeDePlazo(collab, plazo)
  return {
    id: plazo.id,
    collab,
    plazo,
    estado: "por-facturar",
    base,
    total: calcularFactura({ base, ...impuestos }).total,
    previsto: sumarDias(collab.hasta, diasDePago(collab.brief.condicionesPago)),
    tocaFacturar: ESTADOS_PARA_FACTURAR.includes(collab.estado),
    diasVencida: 0,
  }
}

/**
 * Todas las líneas de cobro: una por plazo de cada collab que se cobra (los regalos y las canceladas
 * no) y una por cada factura que no cubre ningún plazo. Una collab sin plan de cobro y sin facturas
 * cuenta como un solo plazo del 100 %.
 */
export function lineasDeCobro({ collabs, facturas, hoy, impuestos }: { collabs: Collab[]; facturas: Factura[]; hoy: string; impuestos: Impuestos }): LineaCobro[] {
  const dia = soloFecha(hoy)
  return collabs.flatMap((c) => {
    const suyas = facturas.filter((f) => f.collabId === c.id)
    const cobrable = c.tipo !== "regalo" && c.estado !== "cancelada" && baseFacturable(c) > 0
    const sinPlan: PlazoCobro[] = suyas.length ? [] : [{ id: `${c.id}-total`, concepto: "Todo", porcentaje: 100 }]
    const plazos = cobrable ? (c.plazos.length ? c.plazos : sinPlan) : []
    const dePlazos = plazos.map((p) => {
      const factura = suyas.find((f) => f.plazoId === p.id)
      return factura ? lineaDeFactura(c, factura, p, dia) : lineaPorFacturar(c, p, impuestos)
    })
    const sueltas = suyas.filter((f) => !plazos.some((p) => p.id === f.plazoId)).map((f) => lineaDeFactura(c, f, undefined, dia))
    return [...dePlazos, ...sueltas]
  })
}

/** Qué es la línea, en corto: el plazo («Al aprobar el guion · 50 %») o el concepto de la factura. */
export function conceptoDeLinea(l: LineaCobro) {
  if (!l.plazo) return l.factura?.concepto ?? ""
  return l.plazo.porcentaje < 100 ? `${l.plazo.concepto} · ${l.plazo.porcentaje} %` : l.plazo.concepto
}

/** Lo que pide la línea ahora mismo, o nada si solo hay que esperar. */
export function siguientePasoDe(l: LineaCobro): string | null {
  if (l.estado === "vencida") return l.factura?.reclamaciones?.length ? "Volver a reclamar" : "Reclamar el pago"
  if (l.estado === "emitida") return "Enviar la factura"
  if (l.estado === "por-facturar" && l.tocaFacturar) return "Hacer la factura"
  return null
}

const PRIORIDAD: Record<EstadoLineaCobro, number> = { vencida: 0, emitida: 1, "por-facturar": 3, enviada: 4, cobrada: 6 }

/** Lo urgente primero: vencidas (la más antigua arriba), sin enviar, lo que toca facturar, lo que se espera y, al final, lo cobrado. */
export function ordenarLineas(a: LineaCobro, b: LineaCobro) {
  const prioridad = (l: LineaCobro) => (l.estado === "por-facturar" && l.tocaFacturar ? 2 : l.estado === "por-facturar" ? 5 : PRIORIDAD[l.estado])
  const diferencia = prioridad(a) - prioridad(b)
  if (diferencia !== 0) return diferencia
  if (a.estado === "vencida") return b.diasVencida - a.diasVencida
  if (a.estado === "cobrada") return (b.factura?.cobradaEl ?? "").localeCompare(a.factura?.cobradaEl ?? "")
  return a.previsto.localeCompare(b.previsto)
}

export type Trimestre = { ano: string; numero: 1 | 2 | 3 | 4; desde: string; hasta: string }

const FIN_DE_TRIMESTRE = ["03-31", "06-30", "09-30", "12-31"] as const

export function trimestreDe(fecha: string): Trimestre {
  const dia = soloFecha(fecha)
  const ano = dia.slice(0, 4)
  const numero = (Math.floor((Number(dia.slice(5, 7)) - 1) / 3) + 1) as Trimestre["numero"]
  const mesInicio = String((numero - 1) * 3 + 1).padStart(2, "0")
  return { ano, numero, desde: `${ano}-${mesInicio}-01`, hasta: `${ano}-${FIN_DE_TRIMESTRE[numero - 1]}` }
}

export const enTrimestre = (fecha: string | undefined, t: Trimestre) => !!fecha && fecha >= t.desde && fecha <= t.hasta

/** Las cifras de la página: lo vencido, lo que se espera, lo que falta por facturar y lo cobrado este año. */
export function cifrasCobros(lineas: LineaCobro[], hoy: string) {
  const ano = soloFecha(hoy).slice(0, 4)
  const trimestre = trimestreDe(hoy)
  const vencidas = lineas.filter((l) => l.estado === "vencida")
  const porCobrar = lineas.filter((l) => l.estado === "emitida" || l.estado === "enviada")
  const porFacturar = lineas.filter((l) => l.estado === "por-facturar")
  const cobradas = lineas.filter((l) => l.factura?.cobradaEl?.startsWith(ano))
  return {
    vencido: sumaBases(vencidas),
    vencidas: vencidas.length,
    masAntigua: Math.max(0, ...vencidas.map((l) => l.diasVencida)),
    porCobrar: sumaBases(porCobrar),
    facturasPorCobrar: porCobrar.length,
    sinEnviar: porCobrar.filter((l) => l.estado === "emitida").length,
    porFacturar: sumaBases(porFacturar),
    tocaFacturar: porFacturar.filter((l) => l.tocaFacturar).length,
    cobradoAno: sumaBases(cobradas),
    cobradoTrimestre: sumaBases(cobradas.filter((l) => enTrimestre(l.factura?.cobradaEl, trimestre))),
  }
}

/** Lo que se espera cobrar en los próximos días (lo vencido también: se espera ya), por fecha. */
export function previsionCobros(lineas: LineaCobro[], hoy: string, dias = DIAS_PREVISION) {
  const limite = sumarDias(soloFecha(hoy), dias)
  const proximas = lineas.filter((l) => l.estado !== "cobrada" && l.previsto <= limite).sort((a, b) => a.previsto.localeCompare(b.previsto))
  return { lineas: proximas, total: sumaBases(proximas) }
}

/** Lo facturado en el trimestre (por fecha de emisión) con el IVA repercutido y la retención: lo que pide la gestoría para los modelos 303 y 130. */
export function impuestosDelTrimestre(facturas: Factura[], t: Trimestre) {
  const del = facturas.filter((f) => enTrimestre(f.emitidaEl, t))
  const calculos = del.map(calcularFactura)
  const suma = (clave: "base" | "iva" | "irpf" | "total") => Math.round(calculos.reduce((a, c) => a + c[clave] * 100, 0)) / 100
  return { facturas: del.length, base: suma("base"), iva: suma("iva"), irpf: suma("irpf"), total: suma("total") }
}

/** Lo cobrado en cada trimestre del año, por fecha de cobro. */
export function cobradoPorTrimestre(facturas: Factura[], ano: string) {
  return ([1, 2, 3, 4] as const).map((numero) => {
    const t = trimestreDe(`${ano}-${String(numero * 3).padStart(2, "0")}-01`)
    return { numero, cobrado: sumaBases(facturas.filter((f) => enTrimestre(f.cobradaEl, t))) }
  })
}

/** Cada línea como evento de la agenda: el día que se cobró o el día en que se espera. */
export function eventosDeCobros(lineas: LineaCobro[], marcas: Marca[]): Evento[] {
  return lineas.map((l) => ({
    id: l.id,
    fecha: l.factura?.cobradaEl ?? l.previsto,
    titulo: `${l.factura ? `Factura ${l.factura.numero}` : "Por facturar"} · ${l.collab.campana}`,
    contexto: marcaDe(l.collab, marcas).nombre,
    tipo: "cobro",
    tint: l.collab.tint,
    href: `/workspace/collabs/${l.collab.id}/facturacion`,
    hecho: l.estado === "cobrada",
  }))
}

const CABECERA_CSV = ["Número", "Emitida", "Vence", "Cobrada", "Estado", "Cliente", "NIF del cliente", "Concepto", "Base", "IVA %", "IVA", "IRPF %", "Retención", "Total", "Marca", "Campaña"]

/**
 * Las facturas en filas para un CSV (la gestoría lo abre en Excel), con el cliente de cada una: la
 * marca o, en las collabs de la red, Astratic. Los importes van con coma decimal.
 */
export function filasDeFacturas({ facturas, collabs, marcas, astratic, hoy }: { facturas: Factura[]; collabs: Collab[]; marcas: Marca[]; astratic: DatosFacturacion; hoy: string }) {
  const numero = (v: number) => v.toFixed(2).replace(".", ",")
  const filas = [...facturas]
    .sort((a, b) => a.numero.localeCompare(b.numero))
    .map((f) => {
      const collab = collabs.find((c) => c.id === f.collabId)
      const marca = collab ? marcaDe(collab, marcas) : null
      const cliente = f.destinatario === "astratic" ? astratic : collab?.facturacion
      const c = calcularFactura(f)
      const estado = ESTADOS_FACTURA.find((e) => e.id === estadoDeFactura(f, hoy))?.label ?? ""
      return [f.numero, f.emitidaEl, f.vencimiento, f.cobradaEl ?? "", estado, cliente?.razonSocial ?? marca?.nombre ?? "", cliente?.nif ?? "", f.concepto, numero(c.base), f.ivaPct, numero(c.iva), f.irpfPct, numero(c.irpf), numero(c.total), marca?.nombre ?? "", collab?.campana ?? ""]
    })
  return { cabecera: CABECERA_CSV, filas }
}
