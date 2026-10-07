// Acceso a los datos del workspace. Las páginas (servidor) llaman aquí y pasan el resultado por
// props; las vistas no saben de dónde sale. En el Portal Astratic este archivo lee de Prisma
// (lib/db) con las mismas funciones; aquí devuelve los datos de ejemplo.
import {
  HOY,
  demoActividad,
  demoAuditorias,
  demoAvisoDestacado,
  demoAvisos,
  demoCambiosTarifa,
  demoContactos,
  demoEnlaces,
  demoEtiquetasTarea,
  demoInteracciones,
  demoMarcas,
  demoMediaKit,
  demoPerfil,
  demoPlantillas,
  demoPlantillasTarea,
  demoCamposTarea,
  demoPropuestas,
  demoTareas,
} from "@/lib/influencer/demo-data"
import { demoCollabs, demoMateriales } from "@/lib/influencer/demo-collabs"
import { demoAntesDePublicar, demoCapitulosBiblia, demoLecturasBiblia } from "@/lib/influencer/demo-biblia"
import {
  demoAcuerdo,
  demoAstratic,
  demoClausulas,
  demoContratos,
  demoDatosFiscales,
  demoDatosPersonales,
  demoFacturas,
  demoFormularios,
  demoInformes,
  demoPlantillasContrato,
  demoPlantillasGuion,
  demoPreferencias,
  demoSesiones,
} from "@/lib/influencer/demo-documentos"
import { COLLABS_ACTIVAS, ESTADOS_ABIERTOS, type Collab, type Informe, type TipoVersion } from "@/lib/influencer/modelo"
import { marcaDe } from "@/lib/influencer/collabs"
import { importeNeto } from "@/lib/influencer/presupuesto"
import { cifrasCobros, lineasDeCobro } from "@/lib/influencer/cobros"

export const hoy = () => HOY

export const obtenerPerfil = () => demoPerfil
export const listarTarifas = () => demoPerfil.tarifas
/** Sus auditorías de Astratic, la más nueva primero. */
export const listarAuditorias = () => [...demoAuditorias].sort((a, b) => b.fecha.localeCompare(a.fecha))
export const listarCambiosTarifa = () => demoCambiosTarifa
export const listarMarcas = () => demoMarcas
export const obtenerMarca = (id: string) => demoMarcas.find((m) => m.id === id) ?? null

export const listarContactos = () => demoContactos
export const obtenerContacto = (id: string) => demoContactos.find((c) => c.id === id) ?? null
/** El contacto principal de una marca, o el primero que haya. */
export const contactoPrincipal = (marcaId: string) => {
  const deLaMarca = demoContactos.filter((c) => c.marcaId === marcaId)
  return deLaMarca.find((c) => c.principal) ?? deLaMarca[0] ?? null
}

export const listarInteracciones = () => demoInteracciones
export const listarPlantillas = () => demoPlantillas
export const obtenerPlantilla = (id: string) => demoPlantillas.find((p) => p.id === id) ?? null
export const obtenerMediaKit = () => demoMediaKit

/** Las marcas con las que ya ha hecho alguna collab, para el media kit. */
export const marcasTrabajadas = () =>
  Array.from(new Set(demoCollabs.map((c) => c.marcaId)))
    .map((id) => demoMarcas.find((m) => m.id === id)?.nombre)
    .filter((n): n is string => !!n)

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
export const listarEtiquetasTarea = () => demoEtiquetasTarea
export const listarPlantillasTarea = () => demoPlantillasTarea
export const listarCamposTarea = () => demoCamposTarea
/** Lo que hace falta para decir de qué es cada tarea: campañas, propuestas, marcas y contactos. */
export const contextoTareas = () => ({ collabs: demoCollabs, propuestas: demoPropuestas, marcas: demoMarcas, contactos: demoContactos })
export const listarAvisos = () => ({ destacado: demoAvisoDestacado, avisos: demoAvisos })
export const listarEnlaces = () => demoEnlaces

export const listarActividad = (filtro: { collabId?: string; propuestaId?: string }) =>
  demoActividad.filter((a) => (filtro.collabId ? a.collabId === filtro.collabId : filtro.propuestaId ? a.propuestaId === filtro.propuestaId : true))

const PARTES: TipoVersion[] = ["guion", "media"]

/** Lo que ve la marca al abrir un enlace de revisión: la pieza con esa versión, o nada si el enlace no existe. */
export function obtenerRevision(token: string) {
  for (const collab of demoCollabs) {
    for (const pieza of collab.piezas) {
      for (const tipo of PARTES) {
        const version = pieza[tipo].find((v) => v.enlace?.token === token)
        if (version) return { collab, pieza, version, tipo, marca: marcaDe(collab, demoMarcas) }
      }
    }
  }
  return null
}

/** Lo que la marca tiene pendiente de revisar en una collab: una entrada por versión en revisión. */
export function revisionesPendientes(collabId: string) {
  const collab = obtenerCollab(collabId)
  if (!collab) return []
  return collab.piezas.flatMap((pieza) =>
    PARTES.flatMap((tipo) =>
      pieza[tipo]
        .filter((v) => v.estado === "en-revision" && v.enlace)
        .map((v) => ({ token: v.enlace?.token ?? "", titulo: pieza.titulo, tipo, portadaUrl: pieza.portadaUrl })),
    ),
  )
}

export const obtenerDatosFiscales = () => demoDatosFiscales
export const obtenerDatosPersonales = () => demoDatosPersonales
export const obtenerAcuerdo = () => demoAcuerdo
export const obtenerPreferencias = () => demoPreferencias
export const listarSesiones = () => demoSesiones

export const listarCapitulosBiblia = () => demoCapitulosBiblia
export const obtenerCapituloBiblia = (id: string) => demoCapitulosBiblia.find((c) => c.id === id) ?? null
export const obtenerLecturasBiblia = () => demoLecturasBiblia
export const listarAntesDePublicar = () => demoAntesDePublicar
/** A quién se factura en las collabs de la red. */
export const datosAstratic = () => demoAstratic

export const listarFacturas = (collabId?: string) => (collabId ? demoFacturas.filter((f) => f.collabId === collabId) : demoFacturas)

export const obtenerContrato = (collabId: string) => demoContratos.find((c) => c.collabId === collabId) ?? null
export const listarPlantillasContrato = () => demoPlantillasContrato
export const listarClausulas = () => demoClausulas
export const listarPlantillasGuion = () => demoPlantillasGuion

/** El informe de resultados de una collab; si aún no hay, uno vacío. */
export const obtenerInforme = (collabId: string): Informe => demoInformes.find((i) => i.collabId === collabId) ?? { collabId, resultados: [], conclusiones: "" }

export const listarFormularios = (collabId?: string) => (collabId ? demoFormularios.filter((f) => f.collabId === collabId) : demoFormularios)

/** Busca la collab de un enlace para la marca y la devuelve con su marca, o nada si el enlace no existe. */
function conCollab<T extends { collabId: string }>(registro: T | undefined): { registro: T; collab: Collab; marca: ReturnType<typeof marcaDe> } | null {
  const collab = registro ? obtenerCollab(registro.collabId) : null
  return registro && collab ? { registro, collab, marca: marcaDe(collab, demoMarcas) } : null
}

/** El contrato que firma la marca por enlace. En el portal el token se comprueba y caduca. */
export const obtenerContratoPorToken = (token: string) => conCollab(demoContratos.find((c) => c.enlace?.token === token))
/** El informe de resultados que ve la marca por enlace. */
export const obtenerInformePorToken = (token: string) => conCollab(demoInformes.find((i) => i.enlace?.token === token))
/** El formulario que rellena la marca por enlace. */
export const obtenerFormulario = (token: string) => conCollab(demoFormularios.find((f) => f.token === token))

/** Las cifras del Inicio. En el portal se calculan en la base de datos. */
export function resumenInicio() {
  const activas = listarCollabsActivas()
  const pendiente = activas
    .filter((c) => c.cobro.estado !== "cobrado")
    .reduce((a, c) => a + (c.importeNeto ?? (c.tipo === "red" ? importeNeto(c.importe) : c.importe)), 0)
  return {
    pendienteDeCobro: pendiente,
    cobradoEsteAno: cifrasCobros(lineasDeCobro({ collabs: demoCollabs, facturas: demoFacturas, hoy: HOY, impuestos: demoDatosFiscales }), HOY).cobradoAno,
    collabsEnCurso: activas.filter((c) => c.estado === "en-curso" || c.estado === "por-empezar").length,
    propuestasAbiertas: demoPropuestas.filter((p) => ESTADOS_ABIERTOS.includes(p.estado)).length,
  }
}
