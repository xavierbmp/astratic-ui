// Los campos por los que se filtra la biblioteca de contenidos (constructor «Filtros» y filtros
// rápidos), con los calculados: a quién le toca, días esperando a la marca y si va tarde.
import type { CampoFiltrable } from "@/lib/filtros/core"
import { ESTADOS_PIEZA, LISTA_TIPOS_PIEZA, TIPOS_PIEZA, type Marca } from "@/lib/influencer/modelo"
import { redDePieza } from "@/lib/influencer/collabs"
import { TURNOS_PIEZA, type FilaPieza, type TurnoPieza } from "@/lib/influencer/biblioteca"

/** Las redes en las que publica; la lógica no importa nada de los componentes. */
const REDES = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
]

export function camposBiblioteca({ marcas }: { marcas: Marca[] }): CampoFiltrable<FilaPieza>[] {
  return [
    { id: "estado", label: "Estado", tipo: "select", grupo: "Estado", opciones: ESTADOS_PIEZA.map((e) => ({ value: e.id, label: e.label })), valor: (f) => f.pieza.estado },
    { id: "turno", label: "A quién le toca", tipo: "select", grupo: "Estado", opciones: (Object.keys(TURNOS_PIEZA) as TurnoPieza[]).map((t) => ({ value: t, label: TURNOS_PIEZA[t] })), valor: (f) => f.turno },
    { id: "marca", label: "Marca", tipo: "select", grupo: "Datos", opciones: marcas.map((m) => ({ value: m.id, label: m.nombre })), valor: (f) => f.collab.marcaId },
    { id: "campana", label: "Campaña", tipo: "texto", grupo: "Datos", valor: (f) => f.collab.campana },
    { id: "tipo", label: "Tipo", tipo: "select", grupo: "Datos", opciones: LISTA_TIPOS_PIEZA.map((t) => ({ value: t, label: TIPOS_PIEZA[t].label })), valor: (f) => f.pieza.tipo },
    { id: "red", label: "Red", tipo: "select", grupo: "Datos", opciones: REDES, valor: (f) => redDePieza(f.pieza) ?? null },
    { id: "tarde", label: "Va tarde", tipo: "booleano", grupo: "Estado", valor: (f) => f.tarde },
    { id: "esperando", label: "Días esperando a la marca", tipo: "numero", grupo: "Estado", valor: (f) => f.esperando },
    { id: "ronda", label: "Ronda", tipo: "numero", grupo: "Estado", valor: (f) => f.pieza.rondaActual },
    { id: "fecha", label: "Publicación", tipo: "fecha", grupo: "Fechas", valor: (f) => f.fecha },
  ]
}
