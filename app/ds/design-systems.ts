/** Los design systems documentados en /ds: el madre y sus hijos. Dar de alta uno nuevo aquí y en `nav.ts`. */
export type DesignSystemId = "astratic-ui" | "influencer"

export type DesignSystem = {
  id: DesignSystemId
  label: string
  /** Nombre corto para las pestañas de la cabecera. */
  short: string
  kind: "Madre" | "Hijo"
  monogram: string
  href: string
  demo: string | null
  description: string
}

export const DESIGN_SYSTEMS: DesignSystem[] = [
  {
    id: "astratic-ui",
    label: "Astratic UI",
    short: "Astratic UI",
    kind: "Madre",
    monogram: "A",
    href: "/ds",
    demo: "/demo",
    description: "La base de los portales operativos: tokens, kit de aplicación, patrones de página y convenciones fijas.",
  },
  {
    id: "influencer",
    label: "Influencer Workspace",
    short: "Influencer",
    kind: "Hijo",
    monogram: "IW",
    href: "/ds/influencer",
    demo: null,
    description: "El workspace de las influencers de la red: hereda Astratic UI y lo hace más visual, con aire, imágenes y color.",
  },
]

/** El design system abierto según la ruta: gana el prefijo más largo. */
export function designSystemFor(pathname: string): DesignSystem {
  return (
    DESIGN_SYSTEMS.filter((d) => pathname === d.href || pathname.startsWith(d.href + "/")).sort((a, b) => b.href.length - a.href.length)[0] ??
    DESIGN_SYSTEMS[0]
  )
}
