// Los campos por los que se filtra la lista de cobros (constructor «Filtros» y filtros rápidos),
// con los calculados: si toca facturar, los días vencida o si ya se reclamó.
import type { CampoFiltrable } from "@/lib/filtros/core"
import { TIPOS_COLLAB, type Marca, type TipoCollab } from "@/lib/influencer/modelo"
import { ESTADOS_LINEA_COBRO, type LineaCobro } from "@/lib/influencer/cobros"

export function camposCobro({ marcas }: { marcas: Marca[] }): CampoFiltrable<LineaCobro>[] {
  return [
    { id: "estado", label: "Estado", tipo: "select", grupo: "Estado", opciones: ESTADOS_LINEA_COBRO.map((e) => ({ value: e.id, label: e.label })), valor: (l) => l.estado },
    { id: "marca", label: "Marca", tipo: "select", grupo: "Datos", opciones: marcas.map((m) => ({ value: m.id, label: m.nombre })), valor: (l) => l.collab.marcaId },
    { id: "campana", label: "Campaña", tipo: "texto", grupo: "Datos", valor: (l) => l.collab.campana },
    { id: "tipo", label: "Tipo de collab", tipo: "select", grupo: "Datos", opciones: (Object.keys(TIPOS_COLLAB) as TipoCollab[]).map((t) => ({ value: t, label: TIPOS_COLLAB[t].label })), valor: (l) => l.collab.tipo },
    { id: "destinatario", label: "Se factura a", tipo: "select", grupo: "Datos", opciones: [{ value: "marca", label: "La marca" }, { value: "astratic", label: "Astratic" }], valor: (l) => (l.collab.tipo === "red" ? "astratic" : "marca") },
    { id: "numero", label: "Número de factura", tipo: "texto", grupo: "Factura", valor: (l) => l.factura?.numero ?? null },
    { id: "tocaFacturar", label: "Toca facturar", tipo: "booleano", grupo: "Estado", valor: (l) => l.tocaFacturar },
    { id: "reclamada", label: "Reclamada", tipo: "booleano", grupo: "Estado", valor: (l) => !!l.factura?.reclamaciones?.length },
    { id: "conPdf", label: "Con el PDF", tipo: "booleano", grupo: "Factura", valor: (l) => !!l.factura?.pdf },
    { id: "diasVencida", label: "Días vencida", tipo: "numero", grupo: "Estado", valor: (l) => l.diasVencida },
    { id: "base", label: "Base", tipo: "numero", grupo: "Dinero", valor: (l) => l.base },
    { id: "total", label: "Total", tipo: "numero", grupo: "Dinero", valor: (l) => l.total },
    { id: "previsto", label: "Cobro previsto", tipo: "fecha", grupo: "Fechas", valor: (l) => l.previsto },
    { id: "emitida", label: "Emitida", tipo: "fecha", grupo: "Fechas", valor: (l) => l.factura?.emitidaEl ?? null },
    { id: "cobrada", label: "Cobrada", tipo: "fecha", grupo: "Fechas", valor: (l) => l.factura?.cobradaEl ?? null },
  ]
}
