// Las vistas de serie del directorio de ideas y documentos. Cada persona las cambia, las ordena,
// crea las suyas o las borra; esto es solo con lo que empieza.
import { GRUPO_VACIO } from "@/lib/filtros/core"
import type { DisenoVista, Vista } from "@/lib/vistas/core"

/** Los diseños que tiene el directorio. */
export const DISENOS_APUNTES: DisenoVista[] = ["galeria", "tablero", "lista", "tabla"]

const RECIENTES = [{ campo: "actualizadoEl", dir: "desc" as const }]
const sinDescartadas = { union: "y" as const, condiciones: [{ campo: "estado", op: "ninguno" as const, valor: ["descartada"] }] }

export const VISTAS_APUNTES: Vista[] = [
  { id: "a-galeria", nombre: "Galería", diseno: "galeria", filtro: GRUPO_VACIO, orden: RECIENTES, propiedades: ["pilar", "formato", "estado"], ajustes: { tamanoTarjeta: "mediana" } },
  { id: "a-tablero", nombre: "Por estado", diseno: "tablero", filtro: { union: "y", condiciones: [{ campo: "tipo", op: "alguno", valor: ["idea"] }] }, orden: RECIENTES, agrupar: { campo: "estado" }, propiedades: ["pilar", "formato"], ajustes: {} },
  { id: "a-pilares", nombre: "Por pilar", diseno: "lista", filtro: sinDescartadas, orden: RECIENTES, agrupar: { campo: "pilar", ocultarVacios: true }, propiedades: ["formato", "estado", "redes"], ajustes: {} },
  { id: "a-tabla", nombre: "Tabla", diseno: "tabla", filtro: GRUPO_VACIO, orden: RECIENTES, propiedades: ["tipo", "estado", "pilar", "formato", "redes", "carpeta", "caducaEl", "actualizadoEl"], ajustes: {} },
]

export function vistaNuevaDeApuntes(diseno: DisenoVista): Omit<Vista, "id"> {
  const nombres: Record<DisenoVista, string> = { lista: "Lista", tabla: "Tabla", tablero: "Tablero", galeria: "Galería", calendario: "Calendario", cronograma: "Cronograma" }
  return {
    nombre: nombres[diseno],
    diseno,
    filtro: GRUPO_VACIO,
    orden: RECIENTES,
    agrupar: diseno === "tablero" ? { campo: "estado" } : undefined,
    propiedades: ["pilar", "formato", "estado"],
    ajustes: diseno === "galeria" ? { tamanoTarjeta: "mediana" } : {},
  }
}
