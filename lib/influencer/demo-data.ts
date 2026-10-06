// Datos de ejemplo del workspace de una influencer: una creadora inventada de beauty en el tramo
// 50K–100K, con marcas y campañas inventadas. Las fotos son de Unsplash (uso libre). Nada de aquí
// es real: el repo es público.
import type { Tint } from "@/lib/influencer/tints"
import type { SocialNetwork } from "@/components/app/social-icons"

const UNSPLASH = "https://images.unsplash.com"
const foto = (id: string, w = 800) => `${UNSPLASH}/photo-${id}?w=${w}&q=80&fit=crop`

export type InfluencerProfile = {
  name: string
  firstName: string
  handle: string
  photoUrl: string
  niche: string
  tier: string
  city: string
  accounts: InfluencerAccount[]
}

export type InfluencerAccount = {
  network: SocialNetwork
  handle: string
  url: string
  followers: number
  /** Visualizaciones medias de las últimas publicaciones (reels, vídeos). */
  avgViews: number
}

export const demoProfile: InfluencerProfile = {
  name: "Marta Albiol",
  firstName: "Marta",
  handle: "@martaalbiol.beauty",
  photoUrl: foto("1531746020798-e6953c6e8e04", 400),
  niche: "Skincare y maquillaje",
  tier: "50K–100K",
  city: "Valencia",
  accounts: [
    { network: "instagram", handle: "@martaalbiol.beauty", url: "https://instagram.com", followers: 68_400, avgViews: 24_100 },
    { network: "tiktok", handle: "@martaalbiol", url: "https://tiktok.com", followers: 41_200, avgViews: 38_300 },
    { network: "youtube", handle: "Marta Albiol", url: "https://youtube.com", followers: 8_900, avgViews: 6_200 },
  ],
}

export type Collab = {
  id: string
  brand: string
  campaign: string
  /** Qué piezas lleva, tal como se cuentan en el brief. */
  deliverables: string
  amount: number
  /** Lo que cobra ella si la collab es de la red (80 %); vacío si la trae ella. */
  netAmount?: number
  done: number
  total: number
  nextLabel: string
  nextDate: string
  tint: Tint
  coverUrl?: string
}

export const demoCollabs: Collab[] = [
  {
    id: "lumea",
    brand: "Lumea Skin",
    campaign: "Rutina de noche",
    deliverables: "1 reel + 3 stories",
    amount: 1290,
    done: 2,
    total: 4,
    nextLabel: "Entregar la V1 del reel",
    nextDate: "2026-10-09",
    tint: "rose",
    coverUrl: foto("1570172619644-dfd03ed5d881"),
  },
  {
    id: "botanica",
    brand: "Botánica Lab",
    campaign: "Sérum de vitamina C",
    deliverables: "2 reels",
    amount: 1900,
    done: 0,
    total: 2,
    nextLabel: "Enviar el guion",
    nextDate: "2026-10-06",
    tint: "mint",
    coverUrl: foto("1596462502278-27bfdc403348"),
  },
  {
    id: "vero",
    brand: "Maison Vero",
    campaign: "Colección otoño",
    deliverables: "1 reel + 1 TikTok",
    amount: 1650,
    done: 3,
    total: 3,
    nextLabel: "Publicar el reel",
    nextDate: "2026-10-15",
    tint: "peach",
    coverUrl: foto("1583241800698-e8ab01830a07"),
  },
  {
    id: "glow",
    brand: "Glow Studio",
    campaign: "Lanzamiento SPF",
    deliverables: "1 reel",
    amount: 980,
    netAmount: 784,
    done: 1,
    total: 1,
    nextLabel: "Grabar el reel",
    nextDate: "2026-10-12",
    tint: "lavender",
    coverUrl: foto("1487412947147-5cebf100ffc2"),
  },
]

export type TaskBucket = "vencidas" | "hoy" | "semana"

export type Task = {
  id: string
  title: string
  /** La collab o propuesta a la que pertenece. */
  context: string
  dueAt: string
  bucket: TaskBucket
  done: boolean
}

export const demoTasks: Task[] = [
  { id: "t1", title: "Subir la V2 del reel", context: "Maison Vero · Colección otoño", dueAt: "2026-10-05", bucket: "vencidas", done: false },
  { id: "t2", title: "Enviar el guion a la marca", context: "Botánica Lab · Sérum de vitamina C", dueAt: "2026-10-06", bucket: "hoy", done: false },
  { id: "t3", title: "Grabar el reel de la rutina de noche", context: "Lumea Skin · Rutina de noche", dueAt: "2026-10-06", bucket: "hoy", done: false },
  { id: "t4", title: "Recoger el paquete en Correos", context: "Lumea Skin · Rutina de noche", dueAt: "2026-10-06", bucket: "hoy", done: true },
  { id: "t5", title: "Subir la factura a Astratic", context: "Glow Studio · Lanzamiento SPF", dueAt: "2026-10-08", bucket: "semana", done: false },
  { id: "t6", title: "Responder a la propuesta de Nuura", context: "Propuestas", dueAt: "2026-10-09", bucket: "semana", done: false },
  { id: "t7", title: "Grabar las 3 stories", context: "Lumea Skin · Rutina de noche", dueAt: "2026-10-10", bucket: "semana", done: false },
]

export type NoticeKind = "oportunidad" | "cambios" | "aprobado" | "cobro" | "astratic"

export type Notice = {
  id: string
  kind: NoticeKind
  title: string
  description?: string
  at: string
  unread: boolean
}

export const demoHighlight: Notice = {
  id: "n0",
  kind: "oportunidad",
  title: "Nueva oportunidad de la red: Nuura",
  description: "1 reel + 3 stories · 1.100 € (880 € para ti) · del 20 al 31 de octubre",
  at: "2026-10-06T09:40:00",
  unread: true,
}

export const demoNotices: Notice[] = [
  { id: "n1", kind: "cambios", title: "Maison Vero ha pedido cambios en el reel", description: "2 notas en la V1", at: "2026-10-06T10:15:00", unread: true },
  { id: "n2", kind: "aprobado", title: "Lumea Skin ha aprobado el guion", at: "2026-10-05T18:20:00", unread: true },
  { id: "n3", kind: "cobro", title: "Cobro vencido: Botánica Lab", description: "Factura 2026-014 · 950 €", at: "2026-10-03T09:00:00", unread: false },
  { id: "n4", kind: "astratic", title: "Tu auditoría de octubre está lista", at: "2026-10-01T12:00:00", unread: false },
]

export type QuickLink = {
  id: string
  label: string
  url: string
}

export const demoLinks: QuickLink[] = [
  { id: "l1", label: "Linktree", url: "https://linktr.ee" },
  { id: "l2", label: "Drive · Collabs", url: "https://drive.google.com" },
  { id: "l3", label: "Canva · Plantillas", url: "https://www.canva.com" },
  { id: "l4", label: "CapCut", url: "https://www.capcut.com" },
  { id: "l5", label: "Notion · Ideas", url: "https://www.notion.so" },
  { id: "l6", label: "Metricool", url: "https://metricool.com" },
  { id: "l7", label: "Gestoría", url: "https://www.holded.com" },
  { id: "l8", label: "Google Calendar", url: "https://calendar.google.com" },
]

export const demoStats = {
  pendingAmount: 3240,
  collectedThisYear: 18_650,
  activeCollabs: demoCollabs.length,
  openProposals: 3,
}
