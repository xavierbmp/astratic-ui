// Perfil y tarifas: a qué CPM sale cada tarifa con sus visualizaciones medias, cómo han cambiado sus
// cifras entre auditorías, cuántas mejoras lleva hechas y los cambios de tarifa que esperan a Astratic.
import { FORMATOS, type CambioTarifa, type CifrasRed, type CuentaRed, type Formato, type Mejora, type Tarifa } from "@/lib/influencer/modelo"

/**
 * Los formatos que se miden por visualizaciones de vídeo: su CPM sale de las visualizaciones medias
 * de su red. Stories y posts se miden por alcance, y el UGC no se publica.
 */
export const FORMATOS_CON_CPM: Formato[] = ["reel", "tiktok", "youtube"]

/** El CPM de referencia de la auditoría es el de vídeo corto: solo con estos se compara. */
export const FORMATOS_CON_REFERENCIA: Formato[] = ["reel", "tiktok"]

/** La cuenta en la que se publica un formato (el reel, en Instagram). El UGC no se publica: no tiene. */
export function cuentaDeFormato(formato: Formato, cuentas: CuentaRed[]) {
  const red = FORMATOS[formato].red
  return red ? (cuentas.find((c) => c.red === red) ?? null) : null
}

/** Euros por cada mil visualizaciones; nada si no hay visualizaciones con las que medirlo. */
export function cpmDe(precio: number, visualizaciones: number | undefined) {
  if (!visualizaciones) return null
  return Math.round((precio / visualizaciones) * 1000 * 10) / 10
}

/** El CPM al que sale una tarifa con las visualizaciones medias de su red. */
export function cpmDeTarifa(t: Pick<Tarifa, "formato" | "precio">, cuentas: CuentaRed[]) {
  if (!FORMATOS_CON_CPM.includes(t.formato)) return null
  return cpmDe(t.precio, cuentaDeFormato(t.formato, cuentas)?.visualizacionesMedias)
}

/** Cuánto se separa el CPM de una tarifa del de referencia, en %; nada si no se comparan. */
export function frenteAReferencia(t: Pick<Tarifa, "formato" | "precio">, cuentas: CuentaRed[], referencia: number | undefined) {
  const cpm = cpmDeTarifa(t, cuentas)
  return cpm !== null && FORMATOS_CON_REFERENCIA.includes(t.formato) ? variacion(cpm, referencia) : null
}

/** Cuánto ha cambiado una cifra, en porcentaje con un decimal; nada si no hay con qué comparar. */
export function variacion(actual: number, anterior: number | undefined) {
  if (!anterior) return null
  return Math.round(((actual - anterior) / anterior) * 1000) / 10
}

/** Las cifras de cada red frente a las de la auditoría anterior. La interacción cambia en puntos, no en %. */
export function compararCifras(actuales: CifrasRed[], anteriores: CifrasRed[] = []) {
  return actuales.map((c) => {
    const antes = anteriores.find((a) => a.red === c.red)
    return {
      ...c,
      cambio: {
        seguidores: variacion(c.seguidores, antes?.seguidores),
        visualizaciones: variacion(c.visualizacionesMedias, antes?.visualizacionesMedias),
        interaccion: antes ? Math.round((c.interaccion - antes.interaccion) * 10) / 10 : null,
      },
    }
  })
}

export function progresoMejoras(mejoras: Mejora[]) {
  const hechas = mejoras.filter((m) => m.hechaEl).length
  return { hechas, total: mejoras.length, pct: mejoras.length ? Math.round((hechas / mejoras.length) * 100) : 0 }
}

export const totalSeguidores = (cuentas: Pick<CuentaRed, "seguidores">[]) => cuentas.reduce((a, c) => a + c.seguidores, 0)

/** El cambio de tarifa que espera a Astratic para un formato, si lo hay. */
export function cambioPendiente(formato: Formato, cambios: CambioTarifa[]) {
  return cambios.find((c) => c.formato === formato && c.estado === "pendiente")
}

export type PropuestaTarifa = { precio: number; minimo: number; motivo?: string }

/** Lo que falla en una propuesta de tarifa, o nada si se puede mandar. */
export function errorDePropuesta(tarifa: Tarifa, p: PropuestaTarifa) {
  if (!(p.precio > 0) || !(p.minimo > 0)) return "El precio y el mínimo tienen que ser mayores que 0"
  if (p.minimo > p.precio) return "El mínimo no puede pasar del precio de salida"
  if (p.precio === tarifa.precio && p.minimo === tarifa.minimo) return "Es la tarifa que ya tienes"
  return null
}

/** Un cambio de tarifa nuevo, pendiente de Astratic. Sustituye al que hubiera pendiente para ese formato. */
export function proponerCambio({ tarifa, propuesta, cambios, hoy, id }: { tarifa: Tarifa; propuesta: PropuestaTarifa; cambios: CambioTarifa[]; hoy: string; id: string }): CambioTarifa[] {
  const nuevo: CambioTarifa = { id, formato: tarifa.formato, precio: propuesta.precio, minimo: propuesta.minimo, antes: { precio: tarifa.precio, minimo: tarifa.minimo }, motivo: propuesta.motivo?.trim() || undefined, estado: "pendiente", propuestoEl: hoy }
  return [nuevo, ...cambios.filter((c) => !(c.formato === tarifa.formato && c.estado === "pendiente"))]
}
