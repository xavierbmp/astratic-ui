// Primeros pasos: la lista de alta que sale arriba del Inicio hasta completarla (o hasta que ella la
// oculta). Cada paso sabe si está hecho mirando los datos, sin que nadie lo marque a mano.
import type { Acuerdo, CapituloBiblia, DatosFiscales, LecturasBiblia, Perfil } from "@/lib/influencer/modelo"
import { faltaParaFacturar } from "@/lib/influencer/ajustes"

export type PasoAlta = { id: string; label: string; hecho: boolean; href: string }

export function primerosPasos({ perfil, acuerdo, fiscales, capitulos, lecturas }: { perfil: Perfil; acuerdo: Acuerdo; fiscales: DatosFiscales; capitulos: CapituloBiblia[]; lecturas: LecturasBiblia }): PasoAlta[] {
  const perfilCompleto = [perfil.bio, perfil.nicho, perfil.ciudad, perfil.email, perfil.fotoUrl].every((v) => v.trim()) && perfil.cuentas.length > 0
  return [
    { id: "perfil", label: "Completa tu perfil y tus redes", hecho: perfilCompleto, href: "/workspace/perfil" },
    { id: "bio", label: "Pon la mención de la red en tu bio", hecho: !!acuerdo.mencionComprobadaEl, href: "/workspace/ajustes/plan" },
    { id: "fiscales", label: "Rellena tus datos fiscales", hecho: faltaParaFacturar(fiscales).length === 0, href: "/workspace/ajustes/fiscales" },
    { id: "biblia", label: "Lee los capítulos esenciales de la Academia", hecho: capitulos.filter((c) => c.esencial).every((c) => lecturas[c.id]), href: "/workspace/academia" },
    { id: "autocontrol", label: "Aprueba el curso de Autocontrol", hecho: !!perfil.autocontrol, href: "/workspace/academia/publicidad" },
  ]
}
