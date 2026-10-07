// Los campos por los que se filtra el calendario de Planificación (buscador aparte): la red, la
// etapa, el pilar, qué es cada cosa y si ya está hecha.
import type { CampoFiltrable } from "@/lib/filtros/core"
import { socialLabel, type SocialNetwork } from "@/components/app/social-icons"
import type { Pilar } from "@/lib/influencer/modelo"
import { ETAPAS_PRODUCCION, type ClaseEntrada, type EntradaCalendario } from "@/lib/influencer/planificacion"

const REDES: SocialNetwork[] = ["instagram", "tiktok", "youtube"]

export const CLASES_ENTRADA: Record<ClaseEntrada, string> = { contenido: "Publicación", hito: "Hito de collab", tarea: "Tarea", cobro: "Cobro", "fecha-clave": "Fecha clave" }

export function camposEntrada({ pilares }: { pilares: Pilar[] }): CampoFiltrable<EntradaCalendario>[] {
  return [
    { id: "titulo", label: "Título", tipo: "texto", grupo: "Datos", valor: (e) => e.titulo },
    { id: "red", label: "Red", tipo: "select", grupo: "Contenido", opciones: REDES.map((r) => ({ value: r, label: socialLabel[r] })), valor: (e) => e.red ?? null },
    { id: "etapa", label: "Etapa", tipo: "select", grupo: "Contenido", opciones: ETAPAS_PRODUCCION.map((e) => ({ value: e.id, label: e.label })), valor: (e) => e.etapa ?? null },
    { id: "pilar", label: "Pilar", tipo: "select", grupo: "Contenido", opciones: pilares.map((p) => ({ value: p.id, label: p.nombre })), valor: (e) => e.pilarId ?? null },
    { id: "clase", label: "Qué es", tipo: "select", grupo: "Datos", opciones: (Object.keys(CLASES_ENTRADA) as ClaseEntrada[]).map((c) => ({ value: c, label: CLASES_ENTRADA[c] })), valor: (e) => e.clase },
    { id: "contexto", label: "Campaña o pilar", tipo: "texto", grupo: "Datos", valor: (e) => e.contexto ?? null },
    { id: "fija", label: "Fecha pactada con la marca", tipo: "booleano", grupo: "Datos", valor: (e) => e.fija && e.clase === "contenido" },
    { id: "hecha", label: "Publicado o hecho", tipo: "booleano", grupo: "Datos", valor: (e) => e.hecha },
    { id: "dia", label: "Día", tipo: "fecha", grupo: "Fechas", valor: (e) => e.dia || null },
  ]
}
