import { EquipoView, type Person } from "./equipo-view"

export const metadata = { title: "Equipo" }

const areas = ["Dirección", "Operación", "Administración", "Comunicación"]
const roles = ["Responsable", "Especialista", "Analista", "Coordinación"]
const statuses: Person["status"][] = ["activo", "activo", "activo", "ausente", "onboarding"]

const people: Person[] = Array.from({ length: 14 }, (_, i) => ({
  id: `p-${i + 1}`,
  name: `Persona ${i + 1}`,
  role: roles[i % roles.length],
  area: areas[i % areas.length],
  email: `persona${i + 1}@empresa.com`,
  status: statuses[i % statuses.length],
  since: `20${18 + (i % 8)}-0${1 + (i % 9)}-15`,
}))

export default function EquipoPage() {
  return <EquipoView people={people} />
}
