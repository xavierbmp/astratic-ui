// Los avisos: del más nuevo al más viejo, agrupados por cuándo llegaron (hoy, ayer, esta semana y
// antes), y cuántos quedan sin leer de cada tipo.
import type { Aviso, TipoAviso } from "@/lib/influencer/modelo"
import { diasEntre, soloFecha } from "@/lib/influencer/fechas"

export type GrupoAvisos = { id: "hoy" | "ayer" | "semana" | "antes"; label: string; avisos: Aviso[] }

const GRUPOS: Omit<GrupoAvisos, "avisos">[] = [
  { id: "hoy", label: "Hoy" },
  { id: "ayer", label: "Ayer" },
  { id: "semana", label: "Esta semana" },
  { id: "antes", label: "Antes" },
]

function grupoDe(el: string, hoy: string): GrupoAvisos["id"] {
  const dias = diasEntre(soloFecha(el), soloFecha(hoy))
  if (dias <= 0) return "hoy"
  if (dias === 1) return "ayer"
  return dias < 7 ? "semana" : "antes"
}

/** Los avisos ordenados del más nuevo al más viejo y agrupados; los grupos vacíos no salen. */
export function agruparAvisos(avisos: Aviso[], hoy: string): GrupoAvisos[] {
  const ordenados = [...avisos].sort((a, b) => b.el.localeCompare(a.el))
  return GRUPOS.map((g) => ({ ...g, avisos: ordenados.filter((a) => grupoDe(a.el, hoy) === g.id) })).filter((g) => g.avisos.length > 0)
}

/** Cuántos hay y cuántos sin leer de cada tipo; los tipos sin avisos no salen. */
export function cuentaPorTipo(avisos: Aviso[]) {
  const cuenta: Partial<Record<TipoAviso, { total: number; sinLeer: number }>> = {}
  for (const a of avisos) {
    const actual = cuenta[a.tipo] ?? { total: 0, sinLeer: 0 }
    cuenta[a.tipo] = { total: actual.total + 1, sinLeer: actual.sinLeer + (a.leido ? 0 : 1) }
  }
  return cuenta
}
