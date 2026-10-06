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
