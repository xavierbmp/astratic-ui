// La base de la revisión de contenido al estilo Airtable: una fila por pieza de cada collab
// (`filasDePiezas`). Todo es de lectura: cada pieza se trabaja en su página, dentro de su collab.
// Puro: lo usan la página y las pruebas.

import { opcionesDeEstados, type DefCampo } from "@/lib/base/campos"
import { vistaNueva, type VistaBase } from "@/lib/base/vistas"
import { etiquetaDePieza, redDePieza, siguientePasoDePieza } from "@/lib/influencer/collabs"
import { GRUPOS_BIBLIOTECA, TURNOS_PIEZA, type FilaPieza } from "@/lib/influencer/biblioteca"
import { opcionesDeMarcas } from "@/lib/influencer/base-contactos"
import { ESTADOS_PIEZA, type Marca } from "@/lib/influencer/modelo"

const REDES = [
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
]

/** En el orden del trabajo, con el tono de lo que toca: preparar, esperar a la marca, publicar, hecho. */
const MOMENTOS = GRUPOS_BIBLIOTECA.map((g, i) => ({ id: g.id, label: g.label, tono: (["warning", "info", "success", "neutral"] as const)[i] }))

export function camposBasePiezas({ marcas }: { marcas: Marca[] }): DefCampo<FilaPieza>[] {
  return [
    { id: "titulo", nombre: "Pieza", tipo: "texto", principal: true, soloLectura: true, grupo: "Datos", valor: (f) => f.pieza.titulo },
    { id: "momento", nombre: "Momento", tipo: "select", soloLectura: true, obligatorio: true, opciones: opcionesDeEstados(MOMENTOS.map((m) => ({ id: m.id, label: m.label, tone: m.tono }))), grupo: "Estado", valor: (f) => f.grupo },
    { id: "estado", nombre: "Estado", tipo: "select", soloLectura: true, opciones: opcionesDeEstados(ESTADOS_PIEZA), grupo: "Estado", valor: (f) => f.pieza.estado },
    { id: "marca", nombre: "Marca", tipo: "vinculo", vinculo: { objeto: "marca" }, soloLectura: true, opciones: opcionesDeMarcas(marcas), grupo: "Datos", valor: (f) => f.collab.marcaId },
    { id: "campana", nombre: "Collab", tipo: "texto", soloLectura: true, grupo: "Datos", valor: (f) => f.collab.campana },
    { id: "siguiente", nombre: "Qué toca", tipo: "texto", soloLectura: true, grupo: "Estado", valor: (f) => siguientePasoDePieza(f.pieza) || null },
    { id: "fecha", nombre: "Publicación", tipo: "fecha", soloLectura: true, grupo: "Fechas", valor: (f) => f.fecha },
    { id: "turno", nombre: "A quién le toca", tipo: "select", soloLectura: true, opciones: Object.entries(TURNOS_PIEZA).map(([id, label]) => ({ id, label })), grupo: "Estado", valor: (f) => f.turno },
    { id: "tipo", nombre: "Tipo", tipo: "texto", soloLectura: true, grupo: "Datos", valor: (f) => etiquetaDePieza(f.pieza) },
    { id: "red", nombre: "Red", tipo: "select", soloLectura: true, opciones: REDES, grupo: "Datos", valor: (f) => redDePieza(f.pieza) ?? null },
    { id: "esperando", nombre: "Días esperando a la marca", tipo: "numero", soloLectura: true, ocultoDeSerie: true, grupo: "Estado", valor: (f) => f.esperando },
    { id: "tarde", nombre: "Va tarde", tipo: "casilla", soloLectura: true, ocultoDeSerie: true, grupo: "Estado", valor: (f) => f.tarde },
    { id: "ronda", nombre: "Ronda", tipo: "numero", soloLectura: true, ocultoDeSerie: true, grupo: "Estado", valor: (f) => f.pieza.rondaActual },
  ]
}

/** Por momento del trabajo (la de siempre), las miniaturas, todas en cuadrícula y el calendario de publicaciones. */
export const vistasDeSeriePiezas = (campos: DefCampo<FilaPieza>[]): VistaBase[] => [
  vistaNueva("Por momento", campos, { id: "piezas-momento", tipo: "kanban", apilar: "momento" }),
  vistaNueva("Miniaturas", campos, { id: "piezas-miniaturas", tipo: "galeria" }),
  vistaNueva("Todas las piezas", campos, { id: "piezas-todas" }),
  vistaNueva("Publicaciones", campos, { id: "piezas-publicaciones", tipo: "calendario", fecha: "fecha" }),
]
