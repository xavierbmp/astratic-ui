// Las bases de la demo (`/demo`) al estilo Airtable: los campos de cada una y sus vistas de serie.
// Es el mismo patrón que siguen los portales: campos de serie que se ocultan y no se borran, cómo se
// lee y se escribe cada uno, y unas vistas con las que empezar.

import { opcionesDeEstados, textoLimpio, type DefCampo, type ValorCampo } from "@/lib/base/campos"
import { vistaNueva, type VistaBase } from "@/lib/base/vistas"
import { invoiceStatus, invoiceTotal, paymentMethods, recordStatus, stages, type DemoInvoice, type DemoPayment, type DemoRecord, type InvoiceStatus, type Stage } from "@/lib/demo-data"

const deLista = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "es")).map((x) => ({ id: x, label: x }))

export function camposDemoRegistros(registros: DemoRecord[]): DefCampo<DemoRecord>[] {
  return [
    { id: "name", nombre: "Registro", tipo: "texto", principal: true, obligatorio: true, grupo: "Datos", valor: (r) => r.name },
    { id: "stage", nombre: "Fase", tipo: "select", obligatorio: true, opciones: opcionesDeEstados(stages), grupo: "Estado", valor: (r) => r.stage },
    { id: "owner", nombre: "Responsable", tipo: "select", obligatorio: true, opciones: deLista(registros.map((r) => r.owner)), grupo: "Datos", valor: (r) => r.owner },
    { id: "value", nombre: "Valor", tipo: "moneda", formato: { decimales: 0 }, grupo: "Dinero", valor: (r) => r.value },
    { id: "status", nombre: "Estado", tipo: "select", obligatorio: true, opciones: opcionesDeEstados(Object.entries(recordStatus).map(([id, s]) => ({ id, label: s.label, tone: s.tone }))), grupo: "Estado", valor: (r) => r.status },
    { id: "dueAt", nombre: "Vence", tipo: "fecha", grupo: "Fechas", valor: (r) => r.dueAt.slice(0, 10) },
    { id: "progress", nombre: "Progreso", tipo: "porcentaje", grupo: "Estado", valor: (r) => r.progress },
    { id: "category", nombre: "Categoría", tipo: "select", opciones: deLista(registros.map((r) => r.category)), grupo: "Datos", valor: (r) => r.category },
    { id: "code", nombre: "Código", tipo: "texto", grupo: "Datos", valor: (r) => r.code },
    { id: "tags", nombre: "Etiquetas", tipo: "multiselect", opciones: deLista(registros.flatMap((r) => r.tags)), grupo: "Datos", valor: (r) => r.tags },
    { id: "updatedAt", nombre: "Actualizado", tipo: "fecha", soloLectura: true, grupo: "Fechas", valor: (r) => r.updatedAt.slice(0, 10) },
  ]
}

export const vistasDemoRegistros = (campos: DefCampo<DemoRecord>[]): VistaBase[] => [
  vistaNueva("Todos los registros", campos, { id: "demo-todos" }),
  vistaNueva("Por fase", campos, { id: "demo-fases", tipo: "kanban", apilar: "stage" }),
  vistaNueva("Vencimientos", campos, { id: "demo-vencimientos", tipo: "calendario", fecha: "dueAt" }),
]

const esFase = (v: ValorCampo): v is Stage => stages.some((s) => s.id === v)
const esEstado = (v: ValorCampo): v is DemoRecord["status"] => typeof v === "string" && v in recordStatus

/** Un registro de la demo con el valor de un campo cambiado (la fase mueve también su columna). */
export function escribirEnRegistro(r: DemoRecord, campo: DefCampo<DemoRecord>, valor: ValorCampo): DemoRecord {
  if (campo.soloLectura) return r
  switch (campo.id) {
    case "stage":
      return esFase(valor) ? { ...r, stage: valor, columnId: valor } : r
    case "value":
    case "progress":
      return typeof valor === "number" ? { ...r, [campo.id]: valor } : r
    case "tags":
      return { ...r, tags: Array.isArray(valor) ? valor : [] }
    case "status":
      return esEstado(valor) ? { ...r, status: valor } : r
    default:
      return textoLimpio(valor) ? { ...r, [campo.id]: textoLimpio(valor) } : r
  }
}

// ---------- Facturación ----------

const esEstadoFactura = (v: ValorCampo): v is InvoiceStatus => typeof v === "string" && v in invoiceStatus

export function camposDemoFacturas(): DefCampo<DemoInvoice>[] {
  return [
    { id: "code", nombre: "Factura", tipo: "texto", principal: true, soloLectura: true, grupo: "Datos", valor: (f) => f.code },
    { id: "recordName", nombre: "Registro", tipo: "texto", soloLectura: true, grupo: "Datos", valor: (f) => f.recordName },
    { id: "status", nombre: "Estado", tipo: "select", obligatorio: true, opciones: opcionesDeEstados(Object.entries(invoiceStatus).map(([id, s]) => ({ id, label: s.label, tone: s.tone }))), grupo: "Estado", valor: (f) => f.status },
    { id: "total", nombre: "Importe", tipo: "moneda", soloLectura: true, grupo: "Dinero", descripcion: "Base más el 21 % de IVA.", valor: (f) => invoiceTotal(f.base) },
    { id: "issuedAt", nombre: "Emisión", tipo: "fecha", soloLectura: true, grupo: "Fechas", valor: (f) => f.issuedAt },
    { id: "dueAt", nombre: "Vencimiento", tipo: "fecha", grupo: "Fechas", valor: (f) => f.dueAt },
    { id: "paidAt", nombre: "Pagada el", tipo: "fecha", soloLectura: true, ocultoDeSerie: true, grupo: "Fechas", valor: (f) => f.paidAt ?? null },
  ]
}

export const vistasDemoFacturas = (campos: DefCampo<DemoInvoice>[]): VistaBase[] => [
  vistaNueva("Todas las facturas", campos, { id: "facturas-todas" }),
  vistaNueva("Por estado", campos, { id: "facturas-estado", tipo: "kanban", apilar: "status" }),
  vistaNueva("Vencimientos", campos, { id: "facturas-vencimientos", tipo: "calendario", fecha: "dueAt" }),
]

/** Una factura con su estado o su vencimiento cambiados; pagarla le pone la fecha de hoy de la demo. */
export function escribirEnFactura(f: DemoInvoice, campo: DefCampo<DemoInvoice>, valor: ValorCampo): DemoInvoice {
  if (campo.soloLectura) return f
  if (campo.id === "status") return esEstadoFactura(valor) ? { ...f, status: valor, paidAt: valor === "pagada" ? "2026-09-15" : f.paidAt } : f
  if (campo.id === "dueAt") return textoLimpio(valor) ? { ...f, dueAt: textoLimpio(valor) ?? f.dueAt } : f
  return f
}

export function camposDemoCobros(): DefCampo<DemoPayment>[] {
  return [
    { id: "code", nombre: "Cobro", tipo: "texto", principal: true, soloLectura: true, grupo: "Datos", valor: (p) => p.code },
    { id: "recordName", nombre: "Registro", tipo: "texto", soloLectura: true, grupo: "Datos", valor: (p) => p.recordName },
    { id: "invoiceCode", nombre: "Factura", tipo: "texto", soloLectura: true, grupo: "Datos", valor: (p) => p.invoiceCode },
    { id: "amount", nombre: "Importe", tipo: "moneda", soloLectura: true, grupo: "Dinero", valor: (p) => p.amount },
    { id: "paidAt", nombre: "Fecha", tipo: "fecha", soloLectura: true, grupo: "Fechas", valor: (p) => p.paidAt },
    { id: "method", nombre: "Método", tipo: "select", soloLectura: true, opciones: Object.entries(paymentMethods).map(([id, m]) => ({ id, label: m.label })), grupo: "Datos", valor: (p) => p.method },
    { id: "reconciled", nombre: "Conciliado", tipo: "casilla", grupo: "Estado", valor: (p) => p.reconciled },
  ]
}

export const vistasDemoCobros = (campos: DefCampo<DemoPayment>[]): VistaBase[] => [
  vistaNueva("Todos los cobros", campos, { id: "cobros-todos" }),
  { ...vistaNueva("Sin conciliar", campos, { id: "cobros-sin-conciliar" }), filtro: { union: "y", condiciones: [{ campo: "reconciled", op: "falso" }] } },
  vistaNueva("Calendario", campos, { id: "cobros-calendario", tipo: "calendario", fecha: "paidAt" }),
]

export const escribirEnCobro = (p: DemoPayment, campo: DefCampo<DemoPayment>, valor: ValorCampo): DemoPayment => (campo.id === "reconciled" ? { ...p, reconciled: valor === true } : p)
