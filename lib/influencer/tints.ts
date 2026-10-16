// Paleta de tintes pastel del design system hijo «Influencer Workspace». Cada tinte es un fondo
// claro con su texto oscuro del mismo tono (tokens `tint-*` de `globals.css`), para colorear
// tarjetas de collab, etiquetas y los iconos de las cifras sin salirse del sistema.

export const TINTS = ["lime", "mint", "rose", "lavender", "sky", "peach"] as const
export type Tint = (typeof TINTS)[number]

export const tintClass: Record<Tint, string> = {
  lime: "bg-tint-lime text-tint-lime-foreground",
  mint: "bg-tint-mint text-tint-mint-foreground",
  rose: "bg-tint-rose text-tint-rose-foreground",
  lavender: "bg-tint-lavender text-tint-lavender-foreground",
  sky: "bg-tint-sky text-tint-sky-foreground",
  peach: "bg-tint-peach text-tint-peach-foreground",
}

/** El tinte de fondo, más suave, para una tarjeta entera (las de cada red del perfil): un leve color, no un bloque pintado. */
export const tintSoftClass: Record<Tint, string> = {
  lime: "bg-linear-to-b from-tint-lime/80 to-tint-lime/30 hover:from-tint-lime hover:to-tint-lime/50",
  mint: "bg-linear-to-b from-tint-mint/80 to-tint-mint/30 hover:from-tint-mint hover:to-tint-mint/50",
  rose: "bg-linear-to-b from-tint-rose/80 to-tint-rose/30 hover:from-tint-rose hover:to-tint-rose/50",
  lavender: "bg-linear-to-b from-tint-lavender/80 to-tint-lavender/30 hover:from-tint-lavender hover:to-tint-lavender/50",
  sky: "bg-linear-to-b from-tint-sky/80 to-tint-sky/30 hover:from-tint-sky hover:to-tint-sky/50",
  peach: "bg-linear-to-b from-tint-peach/80 to-tint-peach/30 hover:from-tint-peach hover:to-tint-peach/50",
}

/** Solo el color del texto de un tinte: para trazos y gráficos sobre su fondo suave. */
export const tintTextClass: Record<Tint, string> = {
  lime: "text-tint-lime-foreground",
  mint: "text-tint-mint-foreground",
  rose: "text-tint-rose-foreground",
  lavender: "text-tint-lavender-foreground",
  sky: "text-tint-sky-foreground",
  peach: "text-tint-peach-foreground",
}

export const tintLabel: Record<Tint, string> = {
  lime: "Lima",
  mint: "Menta",
  rose: "Rosa",
  lavender: "Lavanda",
  sky: "Cielo",
  peach: "Melocotón",
}

/** Tinte estable para un nombre (una marca, una etiqueta): el mismo texto da siempre el mismo color. */
export function tintFor(key: string): Tint {
  let hash = 0
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return TINTS[hash % TINTS.length]
}
