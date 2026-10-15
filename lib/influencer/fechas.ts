// Fechas del workspace: todo se compara por día (AAAA-MM-DD), sin horas ni zonas.

// Las de comparar por día son las mismas que usan filtros y vistas (`lib/filtros/fechas`), y las de
// pintar calendarios, las del kit (`lib/base/calendario`).
export { diasEntre, lunesDe, soloFecha, sumarDias } from "@/lib/filtros/fechas"
export { casillasDelMes, diaLargo, mismoMes, moverPeriodo, nombreMes, periodoCalendario } from "@/lib/base/calendario"

/** El día 1 del mes `meses` meses más allá (o más acá) del de la fecha. */
export function sumarMeses(fecha: string, meses: number) {
  const d = new Date(`${fecha.slice(0, 7)}-01T12:00:00`)
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().slice(0, 10)
}
