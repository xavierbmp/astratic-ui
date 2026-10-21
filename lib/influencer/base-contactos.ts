// La base de contactos del CRM al estilo Airtable: sus campos de serie (se ocultan, no se borran),
// sus campos propios, su vista de serie y cómo se escribe un valor en un contacto. Puro: lo usan
// la página y las pruebas.

import { campoDePropio, conValorPropio, textoLimpio, type CampoPropio, type ColorOpcion, type DefCampo, type ValorCampo } from "@/lib/base/campos"
import { vistaNueva, type VistaBase } from "@/lib/base/vistas"
import { soloFecha } from "@/lib/influencer/fechas"
import { ultimoContactoDe } from "@/lib/influencer/crm"
import type { Contacto, Interaccion, Marca } from "@/lib/influencer/modelo"
import type { Tint } from "@/lib/influencer/tints"

/** El nombre de la base para guardar sus campos propios y la configuración de cada una. */
export const BASE_CONTACTOS = "contactos"

/** Cada marca sale con el color de su tinte. */
export const COLOR_DE_TINTE: Record<Tint, ColorOpcion> = { lime: "verde", mint: "cian", rose: "rosa", lavender: "morado", sky: "azul", peach: "naranja" }

/** Las marcas como registros de un campo vínculo, por orden alfabético y con el color de su tinte. */
export const opcionesDeMarcas = (marcas: Marca[]) => [...marcas].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map((m) => ({ id: m.id, label: m.nombre, color: COLOR_DE_TINTE[m.tint] }))

const texto = (v: string | undefined) => v ?? null

export function camposBaseContactos({ marcas, interacciones, propios }: { marcas: Marca[]; interacciones: Interaccion[]; propios: CampoPropio[] }): DefCampo<Contacto>[] {
  const opcionesMarca = opcionesDeMarcas(marcas)
  return [
    { id: "nombre", nombre: "Nombre", tipo: "texto", principal: true, obligatorio: true, grupo: "Datos", valor: (c) => c.nombre },
    { id: "marca", nombre: "Marca", tipo: "vinculo", vinculo: { objeto: "marca" }, opciones: opcionesMarca, grupo: "Datos", valor: (c) => c.marcaId ?? null },
    { id: "cargo", nombre: "Cargo", tipo: "texto", grupo: "Datos", valor: (c) => texto(c.cargo) },
    { id: "email", nombre: "Email", tipo: "email", grupo: "Cómo escribirle", valor: (c) => texto(c.email) },
    { id: "telefono", nombre: "Teléfono", tipo: "telefono", grupo: "Cómo escribirle", valor: (c) => texto(c.telefono) },
    { id: "instagram", nombre: "Instagram", tipo: "texto", grupo: "Cómo escribirle", valor: (c) => texto(c.instagram) },
    { id: "principal", nombre: "Contacto principal", tipo: "casilla", grupo: "Datos", descripcion: "Contacto principal de la marca (uno por marca).", valor: (c) => !!c.principal },
    { id: "notas", nombre: "Notas", tipo: "texto_largo", grupo: "Datos", ocultoDeSerie: true, valor: (c) => texto(c.notas) },
    {
      id: "ultimoContacto",
      nombre: "Último contacto",
      tipo: "fecha",
      soloLectura: true,
      grupo: "Seguimiento",
      descripcion: "Fecha del último email, mensaje o llamada registrado en el seguimiento.",
      valor: (c) => {
        const u = ultimoContactoDe(c.id, interacciones)
        return u ? soloFecha(u) : null
      },
    },
    { id: "creadoEl", nombre: "Añadido", tipo: "fecha", soloLectura: true, grupo: "Datos", valor: (c) => soloFecha(c.creadoEl) },
    ...propios.map((p) => campoDePropio<Contacto>(p, (c) => c.valores)),
  ]
}

/** La vista con la que empieza cada una, como la «Cuadrícula» de una base nueva de Airtable. */
export const vistasDeSerieContactos = (campos: DefCampo<Contacto>[]): VistaBase[] => [vistaNueva("Todos los contactos", campos, { id: "contactos-todos" })]

/**
 * Un contacto con el valor de un campo cambiado. Los de serie van a su sitio (la marca, a `marcaId`;
 * el Instagram, sin «@»); los propios, a `valores`. Lo calculado no se escribe.
 */
export function escribirEnContacto(contacto: Contacto, campo: DefCampo<Contacto>, valor: ValorCampo): Contacto {
  if (campo.soloLectura) return contacto
  if (campo.propio) return conValorPropio(contacto, campo.id, valor)
  switch (campo.id) {
    case "nombre":
      return textoLimpio(valor) ? { ...contacto, nombre: textoLimpio(valor) ?? contacto.nombre } : contacto
    case "marca":
      // Sin marca deja de ser el principal de ninguna.
      return typeof valor === "string" && valor ? { ...contacto, marcaId: valor } : { ...contacto, marcaId: undefined, principal: false }
    case "principal":
      return { ...contacto, principal: valor === true }
    case "instagram":
      return { ...contacto, instagram: textoLimpio(valor)?.replace(/^@/, "") }
    case "cargo":
    case "email":
    case "telefono":
    case "notas":
      return { ...contacto, [campo.id]: textoLimpio(valor) }
    default:
      return contacto
  }
}

/**
 * Aplica unos cambios a la lista de contactos. Si alguno pasa a ser el principal de su marca, el
 * que lo era deja de serlo: hay uno por marca.
 */
export function aplicarCambiosContactos(contactos: Contacto[], cambios: { id: string; campo: DefCampo<Contacto>; valor: ValorCampo }[]): Contacto[] {
  const porId = new Map(contactos.map((c) => [c.id, c]))
  for (const { id, campo, valor } of cambios) {
    const actual = porId.get(id)
    if (actual) porId.set(id, escribirEnContacto(actual, campo, valor))
  }
  const nuevosPrincipales = cambios.filter((c) => c.campo.id === "principal" && c.valor === true).map((c) => porId.get(c.id)).filter((c): c is Contacto => !!c)
  return contactos.map((c) => {
    const nuevo = porId.get(c.id) ?? c
    const quitar = nuevosPrincipales.some((p) => !!p.marcaId && p.marcaId === nuevo.marcaId && p.id !== nuevo.id)
    return quitar && nuevo.principal ? { ...nuevo, principal: false } : nuevo
  })
}

/**
 * Un contacto nuevo con lo que se rellenó en el formulario. Nada es obligatorio: sin nombre, «Contacto
 * sin nombre». La marca es opcional; el primero de una marca es su principal.
 */
export function contactoDeFormulario(valores: Record<string, ValorCampo>, campos: DefCampo<Contacto>[], datos: { id: string; hoy: string; contactos: Contacto[] }): Contacto {
  const nombre = textoLimpio(valores.nombre ?? null) || "Contacto sin nombre"
  const marcaId = typeof valores.marca === "string" ? valores.marca : undefined
  let contacto: Contacto = { id: datos.id, nombre, ...(marcaId ? { marcaId } : {}), creadoEl: datos.hoy }
  for (const campo of campos) {
    if (campo.id === "nombre" || campo.id === "marca" || !(campo.id in valores)) continue
    contacto = escribirEnContacto(contacto, campo, valores[campo.id] ?? null)
  }
  if (marcaId && !datos.contactos.some((c) => c.marcaId === marcaId)) contacto = { ...contacto, principal: true }
  return contacto
}

/** Añade un contacto a la lista. Si es el principal de su marca, el que lo era deja de serlo. */
export function anadirContacto(contactos: Contacto[], nuevo: Contacto): Contacto[] {
  const resto = nuevo.principal && nuevo.marcaId ? contactos.map((c) => (c.marcaId === nuevo.marcaId && c.principal ? { ...c, principal: false } : c)) : contactos
  return [...resto, nuevo]
}
