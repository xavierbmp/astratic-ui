// Completar el perfil: la lista que lleva siempre a mano en la sidebar (`CompletarPerfil`) hasta acabarla, sin poder
// quitarla (Xavier, 2026-10-16: «así incitamos a que lo complete»). Cada paso sabe si está hecho mirando los datos,
// sin que nadie lo marque a mano, y lleva a donde se hace: la mayoría, a su paso de la bienvenida.
import type { Acuerdo, CapituloBiblia, DatosFiscales, DatosPersonales, LecturasBiblia, Perfil } from "@/lib/influencer/modelo"

export type PasoAlta = { id: string; label: string; descripcion: string; hecho: boolean; href: string }

export type DatosPrimerosPasos = {
  perfil: Perfil
  acuerdo: Acuerdo
  fiscales: DatosFiscales
  envio: DatosPersonales["envio"]
  capitulos: CapituloBiblia[]
  lecturas: LecturasBiblia
  /** Lo que el modelo no guarda y sabe la app: si fijó alguna tarifa suya, cuántas marcas suyas tiene, etc. */
  tieneTarifas: boolean
  marcasPropias: number
  instagramConectado: boolean
  trabajoContado: boolean
}

const lleno = (...textos: (string | undefined)[]) => textos.every((t) => !!t?.trim())

/** Su perfil está completo: foto, bio, nicho, ciudad, email para las marcas y al menos una red. */
export const perfilCompleto = (p: Perfil) => lleno(p.bio, p.nicho, p.ciudad, p.email, p.fotoUrl) && p.cuentas.length > 0

/** Tiene lo que hace falta para cobrar y para que le manden producto. */
export const datosDeCobroCompletos = (f: DatosFiscales, envio: DatosPersonales["envio"]) => lleno(f.nombre, f.nif, f.direccion, f.iban) && lleno(envio.direccion, envio.cp, envio.ciudad)

const bienvenida = (paso: string) => `/bienvenida?paso=${paso}`

/** Los pasos, en el orden en que conviene hacerlos. */
export function primerosPasos(d: DatosPrimerosPasos): PasoAlta[] {
  return [
    { id: "perfil", label: "Completa tu perfil", descripcion: "Foto, bio, nicho y redes de tu perfil.", hecho: perfilCompleto(d.perfil), href: bienvenida("perfil") },
    { id: "trabajo", label: "Cuéntanos cómo trabajas", descripcion: "Tipos de collab y sectores excluidos.", hecho: d.trabajoContado, href: bienvenida("trabajo") },
    { id: "tarifas", label: "Pon tus tarifas", descripcion: "Tarifas por formato y referencia de mercado.", hecho: d.tieneTarifas, href: bienvenida("tarifas") },
    { id: "marcas", label: "Añade tus marcas", descripcion: "Marcas con las que has trabajado.", hecho: d.marcasPropias > 0, href: bienvenida("marcas") },
    { id: "cobros", label: "Datos de cobro", descripcion: "Datos fiscales, IBAN y dirección de envío.", hecho: datosDeCobroCompletos(d.fiscales, d.envio), href: bienvenida("cobros") },
    { id: "instagram", label: "Conecta tu Instagram", descripcion: "Cifras y audiencia actualizadas automáticamente.", hecho: d.instagramConectado, href: bienvenida("conexiones") },
    { id: "biblia", label: "Lee lo esencial de la Academia", descripcion: "Forma de trabajo, negociación e identificación de la publicidad.", hecho: d.capitulos.filter((c) => c.esencial).every((c) => d.lecturas[c.id]), href: "/workspace/academia" },
    { id: "autocontrol", label: "Aprueba el curso de Autocontrol", descripcion: "El sello se muestra en tu perfil y en tu media kit.", hecho: !!d.perfil.autocontrol, href: "/workspace/academia/autocontrol" },
    { id: "bio", label: "Añade la mención de Astratic en tu bio", descripcion: "Astratic la verifica y marca el paso como completado.", hecho: !!d.acuerdo.mencionComprobadaEl, href: "/workspace/ajustes/plan" },
  ]
}

/** El primero que falta, o null si ya está todo. */
export const siguientePaso = (pasos: PasoAlta[]) => pasos.find((p) => !p.hecho) ?? null
