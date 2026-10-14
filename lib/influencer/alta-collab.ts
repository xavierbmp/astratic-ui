// El alta de una collab a mano: de lo que se ha rellenado (nada es obligatorio) sale la collab con
// sus piezas, el enlace para la marca si se le pide algo y los materiales que se adjuntaron. Lo que
// falta se completa con su valor de serie.
import type { CampoBrief, Collab, Condicion, Contacto, FormularioMarca, Marca, Material } from "@/lib/influencer/modelo"
import { caducidad, piezaDeFormulario, tokenNuevo, type PiezaPedidaForm } from "@/lib/influencer/formularios"
import { camposEnOrden } from "@/lib/influencer/ajustes-collabs"
import { tipoDeArchivo } from "@/lib/influencer/materiales"
import { textoAHtml } from "@/lib/influencer/guion"
import { soloFecha } from "@/lib/influencer/fechas"
import { idNuevo } from "@/lib/influencer/tareas"

/** Un archivo ya subido desde el alta (su enlace firmado para verlo). */
export type ArchivoAdjunto = { nombre: string; tamano: number; tipo: string; url: string }

export type ValoresAlta = {
  modo: "yo" | "marca"
  campana: string
  /** Dónde se publica la campaña. */
  plataformas: string[]
  /** El brief escrito tal cual (texto plano). */
  brief: string
  /** El brief en un archivo (un PDF): pasa a los materiales. */
  briefAdjunto: ArchivoAdjunto | null
  coverUrl: string
  /** NaN si se dejó vacío. */
  importe: number
  desde: string
  hasta: string
  piezas: PiezaPedidaForm[]
  condiciones: Condicion[]
  adjuntos: ArchivoAdjunto[]
  para: { nombre: string; email: string }
  campos: CampoBrief[]
  mensaje: string
}

export type Alta = { collab: Collab; formulario?: FormularioMarca; materiales: Material[] }

/** El nombre de la campaña si se dejó vacío. */
export const campanaPorDefecto = (marca: Marca) => `Collab con ${marca.nombre}`

/** El mensaje de serie para la marca: si solo se le piden materiales, lo dice; si no, la campaña y lo demás. */
export function mensajeParaLaMarca(nombre: string, campos: CampoBrief[]) {
  const hola = `Hola${nombre ? ` ${nombre.split(" ")[0]}` : ""}`
  return campos.every((c) => c === "contacto" || c === "materiales")
    ? `${hola}: ¿me subes aquí los materiales de la campaña (logos, fotos del producto, guía de claims)?`
    : `${hola}: aquí puedes contarme la campaña y lo que necesitáis. Así lo tengo todo en un sitio.`
}

/**
 * La collab, su enlace para la marca (si se le pide el brief) y sus materiales (el brief en archivo
 * y los adjuntos). Sin campaña, «Collab con …»; sin fechas, de hoy a su última publicación; sin
 * importe, 0; sin apartados para la marca, sus datos.
 */
export function collabDeAlta(v: ValoresAlta, { marca, principal, hoy }: { marca: Marca; principal?: Contacto; hoy: string }): Alta {
  const id = idNuevo("c")
  const piezas = v.modo === "yo" ? v.piezas : []
  const ultima = piezas.map((p) => p.publicacion).filter(Boolean).sort().at(-1)
  const desde = v.desde || soloFecha(hoy)
  const hasta = v.hasta || (ultima && ultima > desde ? ultima : desde)
  const contacto = v.modo === "marca" ? v.para : { nombre: principal?.nombre ?? "", email: principal?.email ?? "" }
  const collab: Collab = {
    id,
    marcaId: marca.id,
    campana: v.campana.trim() || campanaPorDefecto(marca),
    tipo: "directa",
    estado: "por-empezar",
    importe: Number.isFinite(v.importe) && v.importe > 0 ? v.importe : 0,
    tint: marca.tint,
    coverUrl: v.coverUrl || undefined,
    desde,
    hasta,
    brief: {
      texto: v.brief.trim() ? textoAHtml(v.brief) : "",
      menciones: [],
      hashtags: [],
      rondasIncluidas: 2,
      contacto,
      condiciones: v.condiciones.length ? v.condiciones : undefined,
      plataformas: v.plataformas.length ? v.plataformas : undefined,
      condicionesPago: "30 días tras publicar",
    },
    piezas: piezas.map((p) => piezaDeFormulario(p, id, hasta)),
    cobro: { estado: "por-facturar" },
    plazos: [{ id: idNuevo("pl"), concepto: "A 30 días tras publicar", porcentaje: 100 }],
    creadaEl: hoy,
  }
  const formulario: FormularioMarca | undefined =
    v.modo === "marca" ? { id: idNuevo("fm"), token: tokenNuevo("fm"), collabId: id, campos: camposEnOrden(v.campos.length ? v.campos : ["contacto"]), para: v.para, mensaje: v.mensaje.trim() || undefined, creadoEl: hoy, caduca: caducidad(hoy) } : undefined
  const material = (a: ArchivoAdjunto, descripcion?: string): Material => ({ id: idNuevo("m"), collabId: id, nombre: a.nombre, tipo: tipoDeArchivo(a.tipo), origen: "mia", tamano: a.tamano, url: a.url, previewUrl: a.tipo.startsWith("image/") ? a.url : undefined, subidoEl: hoy, descripcion })
  const materiales = [...(v.briefAdjunto ? [material(v.briefAdjunto, "El brief de la campaña")] : []), ...v.adjuntos.map((a) => material(a))]
  return { collab, formulario, materiales }
}
