// Plantillas con variables: «Hola {{contacto.nombre}}» se rellena con los datos de la marca, la
// persona y la propuesta a la que se escribe. Lo que no tiene valor se queda entre llaves para que
// se vea antes de copiar.
import { fmt } from "@/lib/format"
import { describirPiezas, type Contacto, type Marca, type Perfil, type Propuesta, type Tarifa } from "@/lib/influencer/modelo"
import { minimoDe } from "@/lib/influencer/presupuesto"
import { importeDe, nombreDePila } from "@/lib/influencer/crm"

export type GrupoVariable = "Tú" | "Marca" | "Contacto" | "Propuesta"

export type VariablePlantilla = { clave: string; label: string; grupo: GrupoVariable }

export const VARIABLES: VariablePlantilla[] = [
  { clave: "yo.nombre", label: "Tu nombre", grupo: "Tú" },
  { clave: "yo.nombrePila", label: "Tu nombre de pila", grupo: "Tú" },
  { clave: "yo.handle", label: "Tu usuario", grupo: "Tú" },
  { clave: "yo.nicho", label: "Tu nicho", grupo: "Tú" },
  { clave: "yo.ciudad", label: "Tu ciudad", grupo: "Tú" },
  { clave: "yo.seguidores", label: "Tus seguidores", grupo: "Tú" },
  { clave: "mediakit.enlace", label: "Enlace a tu media kit", grupo: "Tú" },
  { clave: "marca.nombre", label: "Nombre de la marca", grupo: "Marca" },
  { clave: "contacto.nombre", label: "Nombre de pila", grupo: "Contacto" },
  { clave: "contacto.nombreCompleto", label: "Nombre completo", grupo: "Contacto" },
  { clave: "contacto.cargo", label: "Cargo", grupo: "Contacto" },
  { clave: "propuesta.campana", label: "Campaña", grupo: "Propuesta" },
  { clave: "propuesta.piezas", label: "Piezas", grupo: "Propuesta" },
  { clave: "propuesta.total", label: "Total", grupo: "Propuesta" },
  { clave: "propuesta.minimo", label: "Tu mínimo", grupo: "Propuesta" },
  { clave: "propuesta.validez", label: "Validez", grupo: "Propuesta" },
  { clave: "propuesta.enlace", label: "Enlace a la propuesta", grupo: "Propuesta" },
]

export const GRUPOS_VARIABLE: GrupoVariable[] = ["Tú", "Marca", "Contacto", "Propuesta"]

const PATRON = /\{\{\s*([\w.]+)\s*\}\}/g

export type ContextoPlantilla = Record<string, string>

/**
 * Los valores de las variables para escribir a una marca. `origen` es la dirección del portal
 * (`https://…`) para que los enlaces salgan completos al copiarlos.
 */
export function contextoPlantilla({
  perfil,
  marca,
  contacto,
  propuesta,
  tarifas,
  origen,
}: {
  perfil: Perfil
  marca?: Marca | null
  contacto?: Contacto | null
  propuesta?: Propuesta | null
  tarifas: Tarifa[]
  origen: string
}): ContextoPlantilla {
  const ctx: ContextoPlantilla = {
    "yo.nombre": perfil.nombre,
    "yo.nombrePila": perfil.nombrePila,
    "yo.handle": perfil.handle,
    "yo.nicho": perfil.nicho.toLowerCase(),
    "yo.ciudad": perfil.ciudad,
    "yo.seguidores": fmt.compact(perfil.cuentas.reduce((a, c) => a + c.seguidores, 0)),
    "mediakit.enlace": `${origen}/media-kit`,
  }
  if (marca) ctx["marca.nombre"] = marca.nombre
  if (contacto) {
    ctx["contacto.nombre"] = nombreDePila(contacto.nombre)
    ctx["contacto.nombreCompleto"] = contacto.nombre
    if (contacto.cargo) ctx["contacto.cargo"] = contacto.cargo
  }
  if (propuesta) {
    ctx["propuesta.campana"] = propuesta.campana
    ctx["propuesta.piezas"] = describirPiezas(propuesta.presupuesto?.lineas ?? propuesta.piezas)
    ctx["propuesta.minimo"] = fmt.eur(minimoDe(propuesta.piezas, tarifas))
    const total = importeDe(propuesta, tarifas)
    if (total > 0) ctx["propuesta.total"] = fmt.eur(total)
    if (propuesta.presupuesto) {
      ctx["propuesta.validez"] = `${propuesta.presupuesto.validez} días`
      ctx["propuesta.enlace"] = `${origen}/propuesta/${propuesta.id}`
    }
  }
  return ctx
}

/** El texto con cada variable sustituida; las que no tienen valor se quedan como están. */
export function rellenar(texto: string, ctx: ContextoPlantilla) {
  return texto.replace(PATRON, (entera, clave: string) => ctx[clave] ?? entera)
}

/** Las variables que usa un texto, sin repetir. */
export function variablesDe(texto: string) {
  return Array.from(new Set(Array.from(texto.matchAll(PATRON), (m) => m[1])))
}

/** Las variables del texto que se quedarían sin rellenar con este contexto. */
export function variablesSinValor(texto: string, ctx: ContextoPlantilla) {
  return variablesDe(texto).filter((v) => ctx[v] === undefined)
}

export function etiquetaVariable(clave: string) {
  return VARIABLES.find((v) => v.clave === clave)?.label ?? clave
}

/** Partes del texto para pintarlo con las variables resaltadas. */
export function trozos(texto: string): { texto: string; variable?: string }[] {
  const out: { texto: string; variable?: string }[] = []
  let ultimo = 0
  for (const m of texto.matchAll(PATRON)) {
    const i = m.index ?? 0
    if (i > ultimo) out.push({ texto: texto.slice(ultimo, i) })
    out.push({ texto: m[0], variable: m[1] })
    ultimo = i + m[0].length
  }
  if (ultimo < texto.length) out.push({ texto: texto.slice(ultimo) })
  return out
}
