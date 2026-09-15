import type { StatusTone } from "@/lib/status"

export type Stage = "nuevo" | "contacto" | "propuesta" | "negociando" | "ganado"

export const stages: { id: Stage; label: string; tone: StatusTone }[] = [
  { id: "nuevo", label: "Nuevo", tone: "neutral" },
  { id: "contacto", label: "En contacto", tone: "info" },
  { id: "propuesta", label: "Propuesta enviada", tone: "warning" },
  { id: "negociando", label: "Negociando", tone: "info" },
  { id: "ganado", label: "Ganado", tone: "success" },
]

export type RecordStatus = "activo" | "pendiente" | "vencido" | "borrador" | "cerrado"

export const recordStatus: Record<RecordStatus, { label: string; tone: StatusTone }> = {
  activo: { label: "Activo", tone: "success" },
  pendiente: { label: "Pendiente", tone: "warning" },
  vencido: { label: "Vencido", tone: "danger" },
  borrador: { label: "Borrador", tone: "neutral" },
  cerrado: { label: "Cerrado", tone: "info" },
}

export type DemoRecord = {
  id: string
  name: string
  code: string
  category: string
  owner: string
  stage: Stage
  columnId: Stage
  status: RecordStatus
  value: number
  progress: number
  updatedAt: string
  dueAt: string
  contacts: string[]
  tags: string[]
}

const owners = ["Usuario 1", "Usuario 2", "Usuario 3", "Usuario 4"]
const categories = ["Categoría A", "Categoría B", "Categoría C", "Categoría D"]
const statusKeys = Object.keys(recordStatus) as RecordStatus[]
const stageKeys = stages.map((s) => s.id)

function seeded(n: number) {
  let s = n * 9301 + 49297
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export const demoRecords: DemoRecord[] = Array.from({ length: 24 }, (_, i) => {
  const r = seeded(i + 1)
  const n = i + 1
  const stage = stageKeys[Math.floor(r() * stageKeys.length)]
  const day = 1 + Math.floor(r() * 28)
  return {
    id: `rec-${n}`,
    name: `Registro ${n}`,
    code: `REG-${String(n).padStart(4, "0")}`,
    category: categories[Math.floor(r() * categories.length)],
    owner: owners[Math.floor(r() * owners.length)],
    stage,
    columnId: stage,
    status: statusKeys[Math.floor(r() * statusKeys.length)],
    value: Math.round((4 + r() * 60) * 1000),
    progress: Math.round(r() * 100),
    updatedAt: `2026-09-${String(day).padStart(2, "0")}`,
    dueAt: `2026-10-${String(1 + Math.floor(r() * 28)).padStart(2, "0")}`,
    contacts: [`Contacto ${n}`, ...(r() > 0.5 ? [`Contacto ${n + 24}`] : [])],
    tags: r() > 0.5 ? ["Etiqueta 1"] : ["Etiqueta 2", "Etiqueta 3"],
  }
})

export const demoActivity = Array.from({ length: 8 }, (_, i) => ({
  id: `act-${i + 1}`,
  who: owners[i % owners.length],
  what: ["cambió el estado", "añadió una nota", "adjuntó un archivo", "creó el registro"][i % 4],
  target: `Registro ${(i * 3) % 24 + 1}`,
  when: `hace ${i + 1} h`,
}))

export const demoTasks = Array.from({ length: 6 }, (_, i) => ({
  id: `task-${i + 1}`,
  title: `Tarea ${i + 1}`,
  record: `Registro ${(i * 5) % 24 + 1}`,
  due: i < 2 ? "Hoy" : i < 4 ? "Mañana" : `${20 + i} sep`,
  tone: (i < 2 ? "warning" : "neutral") as StatusTone,
  owner: owners[i % owners.length],
}))

export const demoSeries = Array.from({ length: 12 }, (_, i) => {
  const r = seeded(i + 100)
  return {
    month: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"][i],
    valor: Math.round(120 + r() * 90),
    objetivo: Math.round(150 + i * 4),
  }
})

export type DemoActivity = (typeof demoActivity)[number]
export type DemoTask = (typeof demoTasks)[number]
export type DemoPoint = (typeof demoSeries)[number]
