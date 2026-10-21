// La base de facturación al estilo Airtable (Xavier, 2026-10-17, reporte cmvcq26o: «Cobros» del menú pasa a ser la
// facturación general): una fila por factura apuntada, con sus importes (base, IVA, retención y lo que llega al banco),
// sus fechas y el trimestre al que va. Las filas son las líneas de cobro que tienen factura (`lineasDeCobro`), así la
// ficha es la misma que en Cobros. Es de lectura salvo el estado, que la página mueve con las acciones de la factura.

import { opcionesDeEstados, type DefCampo } from "@/lib/base/campos"
import { vistaNueva, type VistaBase } from "@/lib/base/vistas"
import { ESTADOS_LINEA_COBRO, trimestreDe, type LineaCobro } from "@/lib/influencer/cobros"
import { calcularFactura } from "@/lib/influencer/facturacion"
import { opcionesDeMarcas } from "@/lib/influencer/base-contactos"
import type { Marca } from "@/lib/influencer/modelo"

/** «2026 · T4»: el trimestre en que se emitió, para agrupar lo que va a la gestoría. */
export const trimestreDeFactura = (l: LineaCobro) => {
  if (!l.factura) return null
  const t = trimestreDe(l.factura.emitidaEl)
  return `${t.ano} · T${t.numero}`
}

export function camposBaseFacturas({ marcas }: { marcas: Marca[] }): DefCampo<LineaCobro>[] {
  const calculo = (l: LineaCobro) => (l.factura ? calcularFactura(l.factura) : null)
  return [
    { id: "numero", nombre: "Factura", tipo: "texto", principal: true, soloLectura: true, grupo: "Factura", valor: (l) => l.factura?.numero ?? null },
    { id: "estado", nombre: "Estado", tipo: "select", obligatorio: true, opciones: opcionesDeEstados(ESTADOS_LINEA_COBRO.filter((e) => e.id !== "por-facturar")), grupo: "Estado", descripcion: "Cambia con las acciones de la factura. «Vencida» se asigna automáticamente según la fecha.", valor: (l) => l.estado },
    { id: "marca", nombre: "Marca", tipo: "vinculo", vinculo: { objeto: "marca" }, soloLectura: true, opciones: opcionesDeMarcas(marcas), grupo: "Datos", valor: (l) => l.collab.marcaId },
    { id: "collab", nombre: "Collab", tipo: "texto", soloLectura: true, grupo: "Datos", valor: (l) => l.collab.campana },
    { id: "concepto", nombre: "Concepto", tipo: "texto", soloLectura: true, ocultoDeSerie: true, grupo: "Factura", valor: (l) => l.factura?.concepto ?? null },
    { id: "destinatario", nombre: "Se factura a", tipo: "select", soloLectura: true, opciones: [{ id: "marca", label: "La marca" }, { id: "astratic", label: "Astratic" }], grupo: "Datos", valor: (l) => l.factura?.destinatario ?? null },
    { id: "base", nombre: "Base", tipo: "moneda", soloLectura: true, grupo: "Dinero", valor: (l) => l.base },
    { id: "iva", nombre: "IVA", tipo: "moneda", soloLectura: true, grupo: "Dinero", valor: (l) => calculo(l)?.iva ?? null },
    { id: "irpf", nombre: "Retención", tipo: "moneda", soloLectura: true, grupo: "Dinero", valor: (l) => calculo(l)?.irpf ?? null },
    { id: "total", nombre: "Llega al banco", tipo: "moneda", soloLectura: true, grupo: "Dinero", valor: (l) => l.total },
    { id: "emitida", nombre: "Emitida", tipo: "fecha", soloLectura: true, grupo: "Fechas", valor: (l) => l.factura?.emitidaEl ?? null },
    { id: "vencimiento", nombre: "Vence", tipo: "fecha", soloLectura: true, grupo: "Fechas", valor: (l) => l.factura?.vencimiento ?? null },
    { id: "cobrada", nombre: "Cobrada", tipo: "fecha", soloLectura: true, grupo: "Fechas", valor: (l) => l.factura?.cobradaEl ?? null },
    { id: "trimestre", nombre: "Trimestre", tipo: "texto", soloLectura: true, grupo: "Fechas", valor: trimestreDeFactura },
    { id: "diasVencida", nombre: "Días vencida", tipo: "numero", soloLectura: true, ocultoDeSerie: true, grupo: "Estado", valor: (l) => l.diasVencida || null },
    { id: "conPdf", nombre: "Con el PDF", tipo: "casilla", soloLectura: true, ocultoDeSerie: true, grupo: "Factura", valor: (l) => !!l.factura?.pdf },
  ]
}

/** Todas en cuadrícula, por trimestre (lo que va a la gestoría), el tablero por estado y el calendario de vencimientos. */
export const vistasDeSerieFacturas = (campos: DefCampo<LineaCobro>[]): VistaBase[] => [
  { ...vistaNueva("Todas las facturas", campos, { id: "facturas-todas" }), orden: [{ campo: "emitida", dir: "desc" }] },
  { ...vistaNueva("Por trimestre", campos, { id: "facturas-trimestre" }), grupos: [{ campo: "trimestre", ordenGrupos: "desc" }], orden: [{ campo: "emitida", dir: "desc" }] },
  vistaNueva("Por estado", campos, { id: "facturas-estado", tipo: "kanban", apilar: "estado" }),
  vistaNueva("Vencimientos", campos, { id: "facturas-vencimientos", tipo: "calendario", fecha: "vencimiento" }),
]
