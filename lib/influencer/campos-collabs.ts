// Los campos por los que se filtra la lista de collabs (constructor «Filtros» y filtros rápidos).
// Incluyen los calculados (piezas pendientes, esperando a la marca, siguiente hito).
import type { CampoFiltrable } from "@/lib/filtros/core"
import { ESTADOS_COBRO, ESTADOS_COLLAB, TIPOS_COLLAB, type Collab, type FormularioMarca, type Marca, type TipoCollab } from "@/lib/influencer/modelo"
import { siguienteHito } from "@/lib/influencer/collabs"
import { soloFecha } from "@/lib/influencer/fechas"

export function camposCollab({ marcas, formularios }: { marcas: Marca[]; formularios: FormularioMarca[] }): CampoFiltrable<Collab>[] {
  const briefPendiente = (c: Collab) => formularios.some((f) => f.collabId === c.id && f.alcance === "brief" && !f.respondidoEl)
  return [
    { id: "marca", label: "Marca", tipo: "select", grupo: "Datos", opciones: marcas.map((m) => ({ value: m.id, label: m.nombre })), valor: (c) => c.marcaId },
    { id: "campana", label: "Campaña", tipo: "texto", grupo: "Datos", valor: (c) => c.campana },
    { id: "estado", label: "Estado", tipo: "select", grupo: "Estado", opciones: ESTADOS_COLLAB.map((e) => ({ value: e.id, label: e.label })), valor: (c) => c.estado },
    { id: "tipo", label: "Tipo", tipo: "select", grupo: "Datos", opciones: (Object.keys(TIPOS_COLLAB) as TipoCollab[]).map((t) => ({ value: t, label: TIPOS_COLLAB[t].label })), valor: (c) => c.tipo },
    { id: "cobro", label: "Cobro", tipo: "select", grupo: "Dinero", opciones: ESTADOS_COBRO.map((e) => ({ value: e.id, label: e.label })), valor: (c) => c.cobro.estado },
    { id: "importe", label: "Importe", tipo: "numero", grupo: "Dinero", valor: (c) => c.importe },
    { id: "piezasPendientes", label: "Piezas sin publicar", tipo: "numero", grupo: "Contenidos", valor: (c) => c.piezas.filter((p) => !p.publicada).length },
    { id: "esperandoMarca", label: "Esperando a la marca", tipo: "booleano", grupo: "Contenidos", valor: (c) => c.piezas.some((p) => [...p.guion, ...p.media].some((v) => v.estado === "en-revision")) },
    { id: "cambiosPedidos", label: "Con cambios pedidos", tipo: "booleano", grupo: "Contenidos", valor: (c) => c.piezas.some((p) => p.estado === "cambios") },
    { id: "briefPendiente", label: "Brief pedido a la marca", tipo: "booleano", grupo: "Contenidos", valor: briefPendiente },
    { id: "siguienteHito", label: "Fecha del siguiente hito", tipo: "fecha", grupo: "Fechas", valor: (c) => siguienteHito(c)?.fecha ?? null },
    { id: "desde", label: "Publicar desde", tipo: "fecha", grupo: "Fechas", valor: (c) => c.desde },
    { id: "hasta", label: "Publicar hasta", tipo: "fecha", grupo: "Fechas", valor: (c) => c.hasta },
    { id: "creadaEl", label: "Creada", tipo: "fecha", grupo: "Fechas", valor: (c) => soloFecha(c.creadaEl) },
  ]
}
