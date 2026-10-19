// La base de contratos al estilo Airtable (Xavier, 2026-10-17, reporte cmvcq0lc: «Contratos, BBDD de todos los
// contratos»): una fila por collab con su contrato o sin él todavía, para verlos todos juntos. Es de lectura: el
// contrato se redacta, se manda y se firma en su página (la de la collab o la de Collabs › Contratos). Puro.

import { opcionesDeEstados, type DefCampo } from "@/lib/base/campos"
import { vistaNueva, type VistaBase } from "@/lib/base/vistas"
import { opcionesDeMarcas } from "@/lib/influencer/base-contactos"
import { ESTADOS_CONTRATO, type Collab, type Contrato, type Estado, type Marca } from "@/lib/influencer/modelo"

/** Una fila: la collab y su contrato, si lo tiene. El id es el de la collab (un contrato por collab). */
export type FilaContrato = { id: string; collab: Collab; contrato: Contrato | null }

export type EstadoFilaContrato = "sin-contrato" | Contrato["estado"]

export const ESTADOS_FILA_CONTRATO: Estado<EstadoFilaContrato>[] = [{ id: "sin-contrato", label: "Sin contrato", tone: "warning" }, ...ESTADOS_CONTRATO]

export const estadoDeFila = (f: FilaContrato): EstadoFilaContrato => f.contrato?.estado ?? "sin-contrato"

/** Las collabs que llevan contrato: todas menos las canceladas, de la que antes publica a la última. */
export function filasDeContratos(collabs: Collab[], contratos: Contrato[]): FilaContrato[] {
  return collabs
    .filter((c) => c.estado !== "cancelada")
    .map((collab) => ({ id: collab.id, collab, contrato: contratos.find((x) => x.collabId === collab.id) ?? null }))
    .sort((a, b) => a.collab.desde.localeCompare(b.collab.desde))
}

const firmo = (f: FilaContrato, lado: "influencer" | "marca") => !!f.contrato?.firmas.some((x) => x.lado === lado)

export function camposBaseContratos({ marcas }: { marcas: Marca[] }): DefCampo<FilaContrato>[] {
  return [
    { id: "contrato", nombre: "Contrato", tipo: "texto", principal: true, soloLectura: true, grupo: "Datos", valor: (f) => f.contrato?.titulo ?? f.collab.campana },
    { id: "estado", nombre: "Estado", tipo: "select", soloLectura: true, opciones: opcionesDeEstados(ESTADOS_FILA_CONTRATO), grupo: "Estado", valor: estadoDeFila },
    { id: "marca", nombre: "Marca", tipo: "vinculo", vinculo: { objeto: "marca" }, soloLectura: true, opciones: opcionesDeMarcas(marcas), grupo: "Datos", valor: (f) => f.collab.marcaId },
    { id: "collab", nombre: "Collab", tipo: "texto", soloLectura: true, grupo: "Datos", valor: (f) => f.collab.campana },
    { id: "deQuien", nombre: "Contrato de", tipo: "select", soloLectura: true, opciones: [{ id: "propio", label: "El tuyo" }, { id: "marca", label: "La marca" }], grupo: "Datos", valor: (f) => (f.contrato ? (f.contrato.externo ? "marca" : "propio") : null) },
    { id: "firmaElla", nombre: "Firmado por ti", tipo: "casilla", soloLectura: true, grupo: "Firmas", valor: (f) => firmo(f, "influencer") },
    { id: "firmaMarca", nombre: "Firmado por la marca", tipo: "casilla", soloLectura: true, grupo: "Firmas", valor: (f) => firmo(f, "marca") },
    { id: "importe", nombre: "Importe", tipo: "moneda", formato: { decimales: 0 }, soloLectura: true, grupo: "Collab", valor: (f) => f.collab.importeNeto ?? f.collab.importe },
    { id: "desde", nombre: "Empieza", tipo: "fecha", soloLectura: true, grupo: "Collab", valor: (f) => f.collab.desde },
    { id: "actualizado", nombre: "Último cambio", tipo: "fecha", soloLectura: true, ocultoDeSerie: true, grupo: "Estado", valor: (f) => f.contrato?.actualizadoEl ?? null },
  ]
}

/** Todos en cuadrícula, el tablero por estado y el calendario por cuándo empieza la collab. */
export const vistasDeSerieContratos = (campos: DefCampo<FilaContrato>[]): VistaBase[] => [
  vistaNueva("Todos los contratos", campos, { id: "contratos-todos" }),
  vistaNueva("Por estado", campos, { id: "contratos-estado", tipo: "kanban", apilar: "estado" }),
  vistaNueva("Calendario", campos, { id: "contratos-calendario", tipo: "calendario", fecha: "desde" }),
]
