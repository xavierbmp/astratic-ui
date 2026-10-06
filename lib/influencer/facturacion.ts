// Facturación de una collab: el cálculo de cada factura (base, IVA y retención), su estado, lo
// facturado y cobrado frente a lo pactado, y los datos listos para copiar en su programa de
// facturación. El portal no emite facturas (Verifactu): las apunta, las adjunta y las sigue.
import type { Collab, DatosFacturacion, DatosFiscales, EstadoCobro, EstadoFactura, Factura, PlazoCobro } from "@/lib/influencer/modelo"
import { fmt } from "@/lib/format"
import { describirEntregables } from "@/lib/influencer/collabs"
import { diasEntre, soloFecha, sumarDias } from "@/lib/influencer/fechas"

/** Días de pago si las condiciones no dicen otra cosa. */
export const DIAS_PAGO_POR_DEFECTO = 30

const aCentimos = (euros: number) => Math.round(euros * 100)

/** Base, IVA, retención y total de una factura, redondeados al céntimo. */
export function calcularFactura(f: Pick<Factura, "base" | "ivaPct" | "irpfPct">) {
  const base = aCentimos(f.base)
  const iva = Math.round((base * f.ivaPct) / 100)
  const irpf = Math.round((base * f.irpfPct) / 100)
  return { base: base / 100, iva: iva / 100, irpf: irpf / 100, total: (base + iva - irpf) / 100 }
}

export function estadoDeFactura(f: Factura, hoy: string): EstadoFactura {
  if (f.cobradaEl) return "cobrada"
  if (diasEntre(soloFecha(hoy), f.vencimiento) < 0) return "vencida"
  return f.enviadaEl ? "enviada" : "emitida"
}

/** Lo que ella factura: el importe o, en las collabs de la red, su 80 % a Astratic. */
export function baseFacturable(c: Collab) {
  return c.importeNeto ?? c.importe
}

export function importeDePlazo(c: Collab, plazo: PlazoCobro) {
  return Math.round(baseFacturable(c) * plazo.porcentaje) / 100
}

/** Lo pactado frente a lo facturado y lo cobrado, en base imponible. */
export function resumenFacturacion(c: Collab, facturas: Factura[], hoy: string) {
  const suma = (lista: Factura[]) => lista.reduce((a, f) => a + aCentimos(f.base), 0) / 100
  const pactado = baseFacturable(c)
  const facturado = suma(facturas)
  const cobrado = suma(facturas.filter((f) => f.cobradaEl))
  const vencido = suma(facturas.filter((f) => estadoDeFactura(f, hoy) === "vencida"))
  return { pactado, facturado, cobrado, vencido, pendiente: facturado - cobrado, porFacturar: Math.max(0, pactado - facturado) }
}

/** El estado de cobro de la collab que resulta de sus facturas: lo que se guarda en `collab.cobro`. */
export function cobroDeFacturas(c: Collab, facturas: Factura[], hoy: string): Collab["cobro"] {
  if (facturas.length === 0) return { estado: "por-facturar" }
  const r = resumenFacturacion(c, facturas, hoy)
  const ultima = [...facturas].sort((a, b) => a.emitidaEl.localeCompare(b.emitidaEl))[facturas.length - 1]
  const estado: EstadoCobro = r.vencido > 0 ? "vencido" : r.porFacturar === 0 && r.pendiente === 0 ? "cobrado" : r.facturado > 0 && r.pendiente > 0 ? "facturado" : "por-facturar"
  return { estado, vencimiento: ultima.vencimiento, factura: ultima.numero }
}

/** «30 días tras publicar» → 30. Si no hay número, los días por defecto. */
export function diasDePago(condiciones: string) {
  const dias = condiciones.match(/(\d+)\s*d[ií]as/i)
  return dias ? Number(dias[1]) : DIAS_PAGO_POR_DEFECTO
}

export function vencimientoPorDefecto(emitidaEl: string, condiciones: string) {
  return sumarDias(emitidaEl, diasDePago(condiciones))
}

export function conceptoPorDefecto(c: Collab, plazo?: PlazoCobro) {
  const base = `Campaña «${c.campana}»: ${describirEntregables(c)}`
  return plazo && plazo.porcentaje < 100 ? `${base} (${plazo.concepto})` : base
}

/** El siguiente número de su serie del año («2026-018»), mirando todas sus facturas. */
export function siguienteNumero(facturas: Factura[], hoy: string) {
  const ano = soloFecha(hoy).slice(0, 4)
  const usados = facturas.map((f) => f.numero.match(new RegExp(`^${ano}-(\\d+)$`))?.[1]).filter((n): n is string => !!n).map(Number)
  return `${ano}-${String(Math.max(0, ...usados) + 1).padStart(3, "0")}`
}

/** El primer plazo que aún no tiene factura, para proponerlo al añadir una. */
export function siguientePlazo(c: Collab, facturas: Factura[]) {
  return c.plazos.find((p) => !facturas.some((f) => f.plazoId === p.id)) ?? null
}

/**
 * Todo lo que hace falta para hacer la factura en su programa, en texto para copiar de una vez:
 * cliente, concepto, importes, vencimiento y cómo se paga.
 */
export function datosParaCopiar({ factura, cliente, emisora }: { factura: Pick<Factura, "concepto" | "base" | "ivaPct" | "irpfPct" | "vencimiento">; cliente?: DatosFacturacion; emisora: DatosFiscales }) {
  const c = calcularFactura(factura)
  const lineas = [
    cliente ? `Cliente: ${cliente.razonSocial} · ${cliente.nif} · ${cliente.direccion}` : "Cliente: faltan los datos de facturación de la marca",
    cliente?.pedido ? `Nº de pedido: ${cliente.pedido}` : null,
    `Concepto: ${factura.concepto}`,
    `Base imponible: ${fmt.eurDecimals(c.base)}`,
    `IVA (${factura.ivaPct} %): ${fmt.eurDecimals(c.iva)}`,
    factura.irpfPct > 0 ? `Retención IRPF (${factura.irpfPct} %): −${fmt.eurDecimals(c.irpf)}` : null,
    `Total: ${fmt.eurDecimals(c.total)}`,
    `Vencimiento: ${fmt.dateLong(factura.vencimiento)}`,
    `Forma de pago: transferencia a ${emisora.iban}`,
  ]
  return lineas.filter((l): l is string => l !== null).join("\n")
}

/** El email para reclamar un cobro vencido, listo para enviar desde su correo. */
export function emailDeReclamacion({ factura, campana, contacto, firma }: { factura: Factura; campana: string; contacto: string; firma: string }) {
  const total = fmt.eurDecimals(calcularFactura(factura).total)
  return {
    asunto: `Factura ${factura.numero} · ${campana}`,
    cuerpo: `Hola ${contacto.split(" ")[0] || ""},\n\nTe escribo por la factura ${factura.numero} de la campaña «${campana}», de ${total}, que venció el ${fmt.dateLong(factura.vencimiento)}. ¿Me confirmas cuándo está previsto el pago?\n\nGracias,\n${firma}`,
  }
}
