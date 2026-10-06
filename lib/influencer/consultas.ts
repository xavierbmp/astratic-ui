// Acceso a los datos del workspace. Las páginas (servidor) llaman aquí y pasan el resultado por
// props; las vistas no saben de dónde sale. En el Portal Astratic este archivo lee de Prisma
// (lib/db) con las mismas funciones; aquí devuelve los datos de ejemplo.
import {
  COBRADO_ESTE_ANO,
  HOY,
  demoActividad,
  demoAvisoDestacado,
  demoAvisos,
  demoCollabs,
  demoEnlaces,
  demoMarcas,
  demoMateriales,
  demoPerfil,
  demoPropuestas,
  demoTareas,
} from "@/lib/influencer/demo-data"
import { COLLABS_ACTIVAS, ESTADOS_ABIERTOS, type TipoVersion } from "@/lib/influencer/modelo"
import { marcaDe } from "@/lib/influencer/collabs"
import { importeNeto } from "@/lib/influencer/presupuesto"

export const hoy = () => HOY

export const obtenerPerfil = () => demoPerfil
export const listarMarcas = () => demoMarcas
export const obtenerMarca = (id: string) => demoMarcas.find((m) => m.id === id) ?? null

export const listarPropuestas = () => demoPropuestas
export const obtenerPropuesta = (id: string) => demoPropuestas.find((p) => p.id === id) ?? null

export const listarCollabs = () => demoCollabs
export const listarCollabsActivas = () => demoCollabs.filter((c) => COLLABS_ACTIVAS.includes(c.estado))
export const obtenerCollab = (id: string) => demoCollabs.find((c) => c.id === id) ?? null

export function obtenerPieza(collabId: string, piezaId: string) {
  const collab = obtenerCollab(collabId)
  const pieza = collab?.piezas.find((p) => p.id === piezaId) ?? null
  return collab && pieza ? { collab, pieza } : null
}

export const listarMateriales = (collabId: string) => demoMateriales.filter((m) => m.collabId === collabId)
export const listarTareas = () => demoTareas
export const listarAvisos = () => ({ destacado: demoAvisoDestacado, avisos: demoAvisos })
export const listarEnlaces = () => demoEnlaces

export const listarActividad = (filtro: { collabId?: string; propuestaId?: string }) =>
  demoActividad.filter((a) => (filtro.collabId ? a.collabId === filtro.collabId : filtro.propuestaId ? a.propuestaId === filtro.propuestaId : true))

/** Lo que ve la marca al abrir un enlace de revisión: la pieza con esa versión, o nada si el enlace no existe. */
export function obtenerRevision(token: string) {
  for (const collab of demoCollabs) {
    for (const pieza of collab.piezas) {
      for (const tipo of ["guion", "video"] as TipoVersion[]) {
        const version = pieza[tipo].find((v) => v.enlace?.token === token)
        if (version) return { collab, pieza, version, tipo, marca: marcaDe(collab, demoMarcas) }
      }
    }
  }
  return null
}

/** Las cifras del Inicio. En el portal se calculan en la base de datos. */
export function resumenInicio() {
  const activas = listarCollabsActivas()
  const pendiente = activas
    .filter((c) => c.cobro.estado !== "cobrado")
    .reduce((a, c) => a + (c.importeNeto ?? (c.tipo === "red" ? importeNeto(c.importe) : c.importe)), 0)
  return {
    pendienteDeCobro: pendiente,
    cobradoEsteAno: COBRADO_ESTE_ANO,
    collabsEnCurso: activas.filter((c) => c.estado === "en-curso" || c.estado === "por-empezar").length,
    propuestasAbiertas: demoPropuestas.filter((p) => ESTADOS_ABIERTOS.includes(p.estado)).length,
  }
}
