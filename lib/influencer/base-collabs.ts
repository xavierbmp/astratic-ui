// La base de collabs al estilo Airtable: sus campos de serie (los que llevan dinero, piezas o cobro
// se ven pero se cambian en la página de la collab), los propios y sus vistas de serie. Puro: lo
// usan la página del directorio y las pruebas.

import { campoDePropio, conValorPropio, opcionesDeEstados, textoLimpio, type CampoPropio, type DefCampo, type ValorCampo } from "@/lib/base/campos"
import { vistaNueva, type VistaBase } from "@/lib/base/vistas"
import { soloFecha } from "@/lib/influencer/fechas"
import { describirEntregables, siguienteHito, unidadesHechas, unidadesTotales } from "@/lib/influencer/collabs"
import { opcionesDeMarcas } from "@/lib/influencer/base-contactos"
import { ESTADOS_COBRO, ESTADOS_COLLAB, TIPOS_COLLAB, type Collab, type EstadoCollab, type FormularioMarca, type Marca } from "@/lib/influencer/modelo"

const esEstadoCollab = (v: ValorCampo): v is EstadoCollab => ESTADOS_COLLAB.some((e) => e.id === v)

/** ¿Le ha pedido el brief a la marca y aún no lo ha mandado? */
export const esperaBrief = (c: Collab, formularios: FormularioMarca[]) => formularios.some((f) => f.collabId === c.id && f.alcance === "brief" && !f.respondidoEl)

export function camposBaseCollabs({ marcas, formularios, propios }: { marcas: Marca[]; formularios: FormularioMarca[]; propios: CampoPropio[] }): DefCampo<Collab>[] {
  return [
    { id: "campana", nombre: "Campaña", tipo: "texto", principal: true, obligatorio: true, grupo: "Datos", valor: (c) => c.campana },
    { id: "marca", nombre: "Marca", tipo: "vinculo", vinculo: { objeto: "marca" }, obligatorio: true, opciones: opcionesDeMarcas(marcas), grupo: "Datos", valor: (c) => c.marcaId },
    { id: "estado", nombre: "Estado", tipo: "select", obligatorio: true, opciones: opcionesDeEstados(ESTADOS_COLLAB), grupo: "Estado", valor: (c) => c.estado },
    { id: "siguienteHito", nombre: "Siguiente hito", tipo: "texto", soloLectura: true, grupo: "Contenidos", valor: (c) => (esperaBrief(c, formularios) ? "Esperando el brief de la marca" : (siguienteHito(c)?.label ?? "Todo entregado")) },
    { id: "fechaHito", nombre: "Fecha del hito", tipo: "fecha", soloLectura: true, grupo: "Contenidos", valor: (c) => siguienteHito(c)?.fecha ?? null },
    { id: "importe", nombre: "Importe", tipo: "moneda", formato: { decimales: 0 }, soloLectura: true, grupo: "Dinero", descripcion: "Lo que cobras tú (en las de la red, tu 80 %). Se cambia en el brief.", valor: (c) => c.importeNeto ?? c.importe },
    { id: "piezas", nombre: "Piezas", tipo: "texto", soloLectura: true, grupo: "Contenidos", valor: (c) => (c.piezas.length ? `${unidadesHechas(c)} de ${unidadesTotales(c)} · ${describirEntregables(c)}` : null) },
    { id: "cobro", nombre: "Cobro", tipo: "select", soloLectura: true, opciones: opcionesDeEstados(ESTADOS_COBRO), grupo: "Dinero", descripcion: "Lo ponen al día sus facturas.", valor: (c) => c.cobro.estado },
    { id: "tipo", nombre: "Tipo", tipo: "select", soloLectura: true, opciones: Object.entries(TIPOS_COLLAB).map(([id, t]) => ({ id, label: t.label })), grupo: "Datos", valor: (c) => c.tipo },
    { id: "desde", nombre: "Publicar desde", tipo: "fecha", grupo: "Fechas", valor: (c) => c.desde },
    { id: "hasta", nombre: "Publicar hasta", tipo: "fecha", grupo: "Fechas", valor: (c) => c.hasta },
    { id: "piezasPendientes", nombre: "Piezas sin publicar", tipo: "numero", soloLectura: true, ocultoDeSerie: true, grupo: "Contenidos", valor: (c) => c.piezas.filter((p) => !p.publicada).length },
    { id: "esperandoMarca", nombre: "Esperando a la marca", tipo: "casilla", soloLectura: true, ocultoDeSerie: true, grupo: "Contenidos", valor: (c) => c.piezas.some((p) => [...p.guion, ...p.media].some((v) => v.estado === "en-revision")) },
    { id: "cambiosPedidos", nombre: "Con cambios pedidos", tipo: "casilla", soloLectura: true, ocultoDeSerie: true, grupo: "Contenidos", valor: (c) => c.piezas.some((p) => p.estado === "cambios") },
    { id: "briefPendiente", nombre: "Brief pedido a la marca", tipo: "casilla", soloLectura: true, ocultoDeSerie: true, grupo: "Contenidos", valor: (c) => esperaBrief(c, formularios) },
    { id: "creadaEl", nombre: "Creada", tipo: "fecha", soloLectura: true, ocultoDeSerie: true, grupo: "Fechas", valor: (c) => soloFecha(c.creadaEl) },
    ...propios.map((p) => campoDePropio<Collab>(p, (c) => c.valores)),
  ]
}

/** Las tarjetas con la imagen de cada campaña (la de siempre), la cuadrícula, por estado y las fechas de los hitos. */
export const vistasDeSerieCollabs = (campos: DefCampo<Collab>[]): VistaBase[] => [
  vistaNueva("Tarjetas", campos, { id: "collabs-tarjetas", tipo: "galeria" }),
  vistaNueva("Todas las collabs", campos, { id: "collabs-todas" }),
  vistaNueva("Por estado", campos, { id: "collabs-estado", tipo: "kanban", apilar: "estado" }),
  vistaNueva("Hitos", campos, { id: "collabs-hitos", tipo: "calendario", fecha: "fechaHito" }),
]

/** Una collab con el valor de un campo cambiado. Dinero, piezas y cobro se cambian en su página. */
export function escribirEnCollab(c: Collab, campo: DefCampo<Collab>, valor: ValorCampo): Collab {
  if (campo.soloLectura) return c
  if (campo.propio) return conValorPropio(c, campo.id, valor)
  switch (campo.id) {
    case "campana":
      return textoLimpio(valor) ? { ...c, campana: textoLimpio(valor) ?? c.campana } : c
    case "marca":
      return typeof valor === "string" && valor ? { ...c, marcaId: valor } : c
    case "estado":
      return esEstadoCollab(valor) ? { ...c, estado: valor } : c
    case "desde":
    case "hasta":
      return textoLimpio(valor) ? { ...c, [campo.id]: textoLimpio(valor) } : c
    default:
      return c
  }
}
