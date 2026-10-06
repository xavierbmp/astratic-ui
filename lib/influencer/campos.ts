// Los campos por los que se filtra cada lista del CRM (constructor «Filtros» y filtros rápidos).
// Incluyen los calculados (importe, relación, contactos…): por eso se filtra sobre las filas.
import type { CampoFiltrable } from "@/lib/filtros/core"
import { soloFecha } from "@/lib/influencer/fechas"
import {
  CANALES_PLANTILLA,
  ESTADOS_PROPUESTA,
  FORMATOS,
  LISTA_FORMATOS,
  ORIGENES,
  RELACIONES_MARCA,
  USOS_PLANTILLA,
  type Contacto,
  type Interaccion,
  type Marca,
  type OrigenPropuesta,
  type Plantilla,
  type Propuesta,
  type Tarifa,
} from "@/lib/influencer/modelo"
import { importeDe, ultimoContactoDe, type ResumenMarca } from "@/lib/influencer/crm"

const opcionesDe = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "es")).map((x) => ({ value: x, label: x }))

export function camposPropuesta({ marcas, tarifas }: { marcas: Marca[]; tarifas: Tarifa[] }): CampoFiltrable<Propuesta>[] {
  const marca = (p: Propuesta) => marcas.find((m) => m.id === p.marcaId)
  return [
    { id: "marca", label: "Marca", tipo: "select", grupo: "Datos", opciones: marcas.map((m) => ({ value: m.id, label: m.nombre })), valor: (p) => p.marcaId },
    { id: "campana", label: "Campaña", tipo: "texto", grupo: "Datos", valor: (p) => p.campana },
    { id: "estado", label: "Estado", tipo: "select", grupo: "Estado", opciones: ESTADOS_PROPUESTA.map((e) => ({ value: e.id, label: e.label })), valor: (p) => p.estado },
    { id: "origen", label: "Origen", tipo: "select", grupo: "Estado", opciones: (Object.keys(ORIGENES) as OrigenPropuesta[]).map((o) => ({ value: o, label: ORIGENES[o] })), valor: (p) => p.origen },
    { id: "atribucion", label: "Atribución", tipo: "select", grupo: "Estado", opciones: [{ value: "propia", label: "Marca tuya" }, { value: "red", label: "Marca de la red" }], valor: (p) => marca(p)?.atribucion ?? null },
    { id: "formatos", label: "Formatos", tipo: "multiselect", grupo: "Datos", opciones: LISTA_FORMATOS.map((f) => ({ value: f, label: FORMATOS[f].label })), valor: (p) => p.piezas.map((x) => x.formato) },
    { id: "importe", label: "Importe", tipo: "numero", grupo: "Dinero", valor: (p) => importeDe(p, tarifas) },
    { id: "ofrecen", label: "Lo que ofrecen", tipo: "numero", grupo: "Dinero", valor: (p) => p.ofrecen ?? null },
    { id: "presupuesto", label: "Con presupuesto", tipo: "booleano", grupo: "Dinero", valor: (p) => !!p.presupuesto },
    { id: "siguienteFecha", label: "Fecha del siguiente paso", tipo: "fecha", grupo: "Seguimiento", valor: (p) => p.siguienteFecha ?? null },
    { id: "ultimoContacto", label: "Último contacto", tipo: "fecha", grupo: "Seguimiento", valor: (p) => soloFecha(p.ultimoContacto) },
    { id: "desde", label: "Publicar desde", tipo: "fecha", grupo: "Fechas", valor: (p) => p.desde ?? null },
    { id: "creadaEl", label: "Creada", tipo: "fecha", grupo: "Fechas", valor: (p) => soloFecha(p.creadaEl) },
  ]
}

export function camposMarca({ marcas, resumenes }: { marcas: Marca[]; resumenes: Map<string, ResumenMarca> }): CampoFiltrable<Marca>[] {
  const r = (m: Marca) => resumenes.get(m.id)
  return [
    { id: "nombre", label: "Nombre", tipo: "texto", grupo: "Datos", valor: (m) => m.nombre },
    { id: "sector", label: "Sector", tipo: "select", grupo: "Datos", opciones: opcionesDe(marcas.map((m) => m.sector)), valor: (m) => m.sector },
    { id: "relacion", label: "Relación", tipo: "select", grupo: "Relación", opciones: RELACIONES_MARCA.map((e) => ({ value: e.id, label: e.label })), valor: (m) => r(m)?.relacion ?? null },
    { id: "atribucion", label: "Atribución", tipo: "select", grupo: "Relación", opciones: [{ value: "propia", label: "Marca tuya" }, { value: "red", label: "Marca de la red" }], valor: (m) => m.atribucion },
    { id: "atribucionHasta", label: "Tuya hasta", tipo: "fecha", grupo: "Relación", valor: (m) => m.atribucionHasta ?? null },
    { id: "contactos", label: "Contactos", tipo: "numero", grupo: "Relación", valor: (m) => r(m)?.contactos ?? 0 },
    { id: "propuestasAbiertas", label: "Propuestas abiertas", tipo: "numero", grupo: "Dinero", valor: (m) => r(m)?.propuestasAbiertas ?? 0 },
    { id: "valorAbierto", label: "Valor abierto", tipo: "numero", grupo: "Dinero", valor: (m) => r(m)?.valorAbierto ?? 0 },
    { id: "collabs", label: "Collabs", tipo: "numero", grupo: "Dinero", valor: (m) => r(m)?.collabs ?? 0 },
    { id: "facturado", label: "Facturado", tipo: "numero", grupo: "Dinero", valor: (m) => r(m)?.facturado ?? 0 },
    { id: "ultimoContacto", label: "Último contacto", tipo: "fecha", grupo: "Seguimiento", valor: (m) => (r(m)?.ultimoContacto ? soloFecha(r(m)?.ultimoContacto ?? "") : null) },
    { id: "web", label: "Web", tipo: "texto", grupo: "Datos", valor: (m) => m.web ?? null },
    { id: "instagram", label: "Instagram", tipo: "texto", grupo: "Datos", valor: (m) => m.instagram ?? null },
    { id: "creadaEl", label: "Añadida", tipo: "fecha", grupo: "Datos", valor: (m) => soloFecha(m.creadaEl) },
  ]
}

export function camposContacto({ marcas, interacciones }: { marcas: Marca[]; interacciones: Interaccion[] }): CampoFiltrable<Contacto>[] {
  return [
    { id: "nombre", label: "Nombre", tipo: "texto", grupo: "Datos", valor: (c) => c.nombre },
    { id: "marca", label: "Marca", tipo: "select", grupo: "Datos", opciones: marcas.map((m) => ({ value: m.id, label: m.nombre })), valor: (c) => c.marcaId },
    { id: "cargo", label: "Cargo", tipo: "texto", grupo: "Datos", valor: (c) => c.cargo ?? null },
    { id: "email", label: "Email", tipo: "texto", grupo: "Cómo escribirle", valor: (c) => c.email ?? null },
    { id: "telefono", label: "Teléfono", tipo: "texto", grupo: "Cómo escribirle", valor: (c) => c.telefono ?? null },
    { id: "instagram", label: "Instagram", tipo: "texto", grupo: "Cómo escribirle", valor: (c) => c.instagram ?? null },
    { id: "principal", label: "Contacto principal", tipo: "booleano", grupo: "Datos", valor: (c) => !!c.principal },
    { id: "ultimoContacto", label: "Último contacto", tipo: "fecha", grupo: "Seguimiento", valor: (c) => { const u = ultimoContactoDe(c.id, interacciones); return u ? soloFecha(u) : null } },
    { id: "creadoEl", label: "Añadido", tipo: "fecha", grupo: "Datos", valor: (c) => soloFecha(c.creadoEl) },
  ]
}

export function camposPlantilla(): CampoFiltrable<Plantilla>[] {
  return [
    { id: "nombre", label: "Nombre", tipo: "texto", grupo: "Datos", valor: (p) => p.nombre },
    { id: "uso", label: "Para qué", tipo: "select", grupo: "Datos", opciones: Object.entries(USOS_PLANTILLA).map(([value, label]) => ({ value, label })), valor: (p) => p.uso },
    { id: "canal", label: "Canal", tipo: "select", grupo: "Datos", opciones: Object.entries(CANALES_PLANTILLA).map(([value, label]) => ({ value, label })), valor: (p) => p.canal },
    { id: "favorita", label: "Favorita", tipo: "booleano", grupo: "Datos", valor: (p) => p.favorita },
    { id: "texto", label: "Texto", tipo: "texto", grupo: "Contenido", valor: (p) => `${p.asunto ?? ""} ${p.cuerpo}` },
    { id: "usos", label: "Veces usada", tipo: "numero", grupo: "Uso", valor: (p) => p.usos },
    { id: "ultimoUso", label: "Último uso", tipo: "fecha", grupo: "Uso", valor: (p) => (p.ultimoUso ? soloFecha(p.ultimoUso) : null) },
    { id: "actualizadaEl", label: "Editada", tipo: "fecha", grupo: "Uso", valor: (p) => soloFecha(p.actualizadaEl) },
  ]
}
