// La base de cobros al estilo Airtable: una línea por plazo de cada collab que se cobra, con su
// factura si ya la hizo (`lineasDeCobro`). Es de lectura salvo el estado, que la página mueve con
// las acciones de la factura (celda, kanban, ficha o selección). Puro: lo usan la página y las pruebas.

import { opcionesDeEstados, type DefCampo } from "@/lib/base/campos"
import { vistaNueva, type VistaBase } from "@/lib/base/vistas"
import { ESTADOS_LINEA_COBRO, type LineaCobro } from "@/lib/influencer/cobros"
import { opcionesDeMarcas } from "@/lib/influencer/base-contactos"
import { TIPOS_COLLAB, type Marca } from "@/lib/influencer/modelo"

/** Cómo se llama cada línea: su campaña y, si la collab se cobra por partes, el plazo. */
export const nombreDeLinea = (l: LineaCobro) => (l.plazo && l.plazo.porcentaje < 100 ? `${l.collab.campana} · ${l.plazo.concepto}` : l.collab.campana)

export function camposBaseCobros({ marcas }: { marcas: Marca[] }): DefCampo<LineaCobro>[] {
  return [
    { id: "cobro", nombre: "Cobro", tipo: "texto", principal: true, soloLectura: true, grupo: "Datos", valor: nombreDeLinea },
    { id: "estado", nombre: "Estado", tipo: "select", obligatorio: true, opciones: opcionesDeEstados(ESTADOS_LINEA_COBRO), grupo: "Estado", descripcion: "Cambia con las acciones de la factura. «Vencida» se asigna automáticamente según la fecha.", valor: (l) => l.estado },
    { id: "marca", nombre: "Marca", tipo: "vinculo", vinculo: { objeto: "marca" }, soloLectura: true, opciones: opcionesDeMarcas(marcas), grupo: "Datos", valor: (l) => l.collab.marcaId },
    { id: "base", nombre: "Base", tipo: "moneda", soloLectura: true, grupo: "Dinero", valor: (l) => l.base },
    { id: "previsto", nombre: "Cobro previsto", tipo: "fecha", soloLectura: true, grupo: "Fechas", valor: (l) => l.previsto },
    { id: "numero", nombre: "Factura", tipo: "texto", soloLectura: true, grupo: "Factura", valor: (l) => l.factura?.numero ?? null },
    { id: "total", nombre: "Llega al banco", tipo: "moneda", soloLectura: true, grupo: "Dinero", valor: (l) => l.total },
    { id: "destinatario", nombre: "Se factura a", tipo: "select", soloLectura: true, opciones: [{ id: "marca", label: "La marca" }, { id: "astratic", label: "Astratic" }], grupo: "Datos", valor: (l) => (l.collab.tipo === "red" ? "astratic" : "marca") },
    { id: "tocaFacturar", nombre: "Toca facturar", tipo: "casilla", soloLectura: true, grupo: "Estado", valor: (l) => l.tocaFacturar },
    { id: "diasVencida", nombre: "Días vencida", tipo: "numero", soloLectura: true, ocultoDeSerie: true, grupo: "Estado", valor: (l) => l.diasVencida || null },
    { id: "reclamada", nombre: "Reclamada", tipo: "casilla", soloLectura: true, ocultoDeSerie: true, grupo: "Estado", valor: (l) => !!l.factura?.reclamaciones?.length },
    { id: "tipo", nombre: "Tipo de collab", tipo: "select", soloLectura: true, ocultoDeSerie: true, opciones: Object.entries(TIPOS_COLLAB).map(([id, t]) => ({ id, label: t.label })), grupo: "Datos", valor: (l) => l.collab.tipo },
    { id: "conPdf", nombre: "Con el PDF", tipo: "casilla", soloLectura: true, ocultoDeSerie: true, grupo: "Factura", valor: (l) => !!l.factura?.pdf },
    { id: "emitida", nombre: "Emitida", tipo: "fecha", soloLectura: true, ocultoDeSerie: true, grupo: "Fechas", valor: (l) => l.factura?.emitidaEl ?? null },
    { id: "cobrada", nombre: "Cobrada", tipo: "fecha", soloLectura: true, ocultoDeSerie: true, grupo: "Fechas", valor: (l) => l.factura?.cobradaEl ?? null },
  ]
}

/** Todos en cuadrícula (la de siempre), el tablero por estado y el calendario de lo que entra. */
export const vistasDeSerieCobros = (campos: DefCampo<LineaCobro>[]): VistaBase[] => [
  vistaNueva("Todos los cobros", campos, { id: "cobros-todos" }),
  vistaNueva("Por estado", campos, { id: "cobros-estado", tipo: "kanban", apilar: "estado" }),
  vistaNueva("Previsión", campos, { id: "cobros-prevision", tipo: "calendario", fecha: "previsto" }),
]
