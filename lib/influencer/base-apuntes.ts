// La base de ideas y notas al estilo Airtable (Contenidos › Ideas y notas). Las carpetas no son un
// campo más: van en el lateral de la base, en su árbol. El texto es un documento (HTML del editor)
// y no se escribe en la celda. Puro: lo usan la página y las pruebas.

import { SIN_VALOR } from "@/lib/vistas/core"
import { opcionesDeEstados, textoLimpio, type DefCampo, type ValorCampo } from "@/lib/base/campos"
import { vistaNueva, type VistaBase } from "@/lib/base/vistas"
import { socialLabel, type SocialNetwork } from "@/components/app/social-icons"
import { ESTADOS_IDEA, FORMATOS, TIPOS_APUNTE, type Apunte, type Carpeta, type Contenido, type FechaClave, type Marca, type Pilar } from "@/lib/influencer/modelo"
import { asignarCampoApunte, caducaPronto, estadoDeIdea } from "@/lib/influencer/apuntes"
import { FORMATOS_PROPIOS } from "@/lib/influencer/planificacion"
import { opcionesDeCarpetas } from "@/lib/carpetas"
import { soloFecha } from "@/lib/influencer/fechas"
import { textoPlano } from "@/lib/influencer/guion"
import { COLOR_DE_TINTE, opcionesDeMarcas } from "@/lib/influencer/base-contactos"

const REDES: SocialNetwork[] = ["instagram", "tiktok", "youtube"]

export type ContextoBaseApuntes = { contenidos: Contenido[]; pilares: Pilar[]; carpetas: Carpeta[]; marcas: Marca[]; fechasClave: FechaClave[]; hoy: string }

export function camposBaseApuntes({ contenidos, pilares, carpetas, marcas, fechasClave, hoy }: ContextoBaseApuntes): DefCampo<Apunte>[] {
  return [
    { id: "titulo", nombre: "Título", tipo: "texto", principal: true, obligatorio: true, grupo: "Datos", valor: (a) => a.titulo },
    { id: "tipo", nombre: "Tipo", tipo: "select", obligatorio: true, opciones: Object.entries(TIPOS_APUNTE).map(([id, label], i) => ({ id, label, color: i === 0 ? "amarillo" : "gris" })), grupo: "Datos", valor: (a) => a.tipo },
    { id: "estado", nombre: "Estado", tipo: "select", opciones: opcionesDeEstados(ESTADOS_IDEA), grupo: "Datos", descripcion: "«Planificada» y «Publicada» se asignan automáticamente desde el contenido.", valor: (a) => estadoDeIdea(a, contenidos) },
    { id: "pilar", nombre: "Pilar", tipo: "select", opciones: pilares.map((p) => ({ id: p.id, label: p.nombre, color: COLOR_DE_TINTE[p.tint] })), grupo: "Contenido", valor: (a) => a.pilarId ?? null },
    { id: "formato", nombre: "Formato", tipo: "select", opciones: FORMATOS_PROPIOS.map((f) => ({ id: f, label: FORMATOS[f].label })), grupo: "Contenido", valor: (a) => a.formato ?? null },
    { id: "redes", nombre: "Redes", tipo: "multiselect", opciones: REDES.map((r) => ({ id: r, label: socialLabel[r] })), grupo: "Contenido", valor: (a) => a.redes },
    { id: "marca", nombre: "Para la marca", tipo: "vinculo", vinculo: { objeto: "marca" }, opciones: opcionesDeMarcas(marcas), grupo: "Contenido", valor: (a) => a.marcaId ?? null },
    { id: "favorito", nombre: "Favorita", tipo: "casilla", grupo: "Datos", valor: (a) => a.favorito },
    { id: "caducaEl", nombre: "Caduca", tipo: "fecha", grupo: "Fechas", valor: (a) => a.caducaEl ?? null },
    { id: "carpeta", nombre: "Carpeta", tipo: "select", ocultoDeSerie: true, opciones: opcionesDeCarpetas(carpetas).map((o) => ({ id: o.value, label: o.label })), grupo: "Datos", valor: (a) => a.carpetaId ?? null },
    { id: "fechaClave", nombre: "Fecha clave", tipo: "select", ocultoDeSerie: true, opciones: fechasClave.map((f) => ({ id: f.id, label: f.nombre })), grupo: "Contenido", valor: (a) => a.fechaClaveId ?? null },
    { id: "caducaPronto", nombre: "Caduca pronto", tipo: "casilla", soloLectura: true, ocultoDeSerie: true, grupo: "Fechas", valor: (a) => caducaPronto(a, hoy) },
    { id: "texto", nombre: "Texto", tipo: "texto_largo", soloLectura: true, ocultoDeSerie: true, grupo: "Datos", descripcion: "Se edita en la ficha de la idea o en la página de la nota.", valor: (a) => textoPlano(a.texto) || null },
    { id: "referencias", nombre: "Referencias", tipo: "numero", soloLectura: true, ocultoDeSerie: true, grupo: "Datos", valor: (a) => a.referencias.length },
    { id: "actualizadoEl", nombre: "Editado", tipo: "fecha", soloLectura: true, grupo: "Fechas", valor: (a) => soloFecha(a.actualizadoEl) },
    { id: "creadoEl", nombre: "Creado", tipo: "fecha", soloLectura: true, ocultoDeSerie: true, grupo: "Fechas", valor: (a) => soloFecha(a.creadoEl) },
  ]
}

const filtroTipo = (tipo: "idea" | "nota") => ({ union: "y" as const, condiciones: [{ campo: "tipo", op: "es" as const, valor: tipo }] })

/** Las ideas en tarjetas (la de siempre), las notas, el tablero por estado, por pilar y todo en cuadrícula. */
export const vistasDeSerieApuntes = (campos: DefCampo<Apunte>[]): VistaBase[] => [
  { ...vistaNueva("Ideas", campos, { id: "apuntes-ideas", tipo: "galeria" }), filtro: filtroTipo("idea") },
  { ...vistaNueva("Notas", campos, { id: "apuntes-notas" }), filtro: filtroTipo("nota"), orden: [{ campo: "actualizadoEl", dir: "desc" }] },
  { ...vistaNueva("Por estado", campos, { id: "apuntes-estado", tipo: "kanban", apilar: "estado" }), filtro: filtroTipo("idea") },
  { ...vistaNueva("Por pilar", campos, { id: "apuntes-pilar" }), grupos: [{ campo: "pilar", ordenGrupos: "asc" }] },
  vistaNueva("Todo", campos, { id: "apuntes-todo" }),
]

/**
 * Un apunte con el valor de un campo cambiado. Lo que no se pone a mano (una idea planificada o
 * publicada) no cambia: lo marca su contenido.
 */
export function escribirEnApunte(a: Apunte, campo: DefCampo<Apunte>, valor: ValorCampo): Apunte {
  if (campo.soloLectura) return a
  switch (campo.id) {
    case "titulo":
      return textoLimpio(valor) ? { ...a, titulo: textoLimpio(valor) ?? a.titulo } : a
    case "caducaEl":
      return { ...a, caducaEl: textoLimpio(valor) }
    case "redes":
      return { ...a, redes: Array.isArray(valor) ? REDES.filter((r) => valor.includes(r)) : [] }
    case "favorito":
      return { ...a, favorito: valor === true }
    default:
      return asignarCampoApunte(a, campo.id, typeof valor === "string" && valor ? valor : SIN_VALOR) ?? a
  }
}
