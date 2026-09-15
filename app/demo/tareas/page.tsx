import { TareasView, type Task, type TaskState } from "./tareas-view"

export const metadata = { title: "Tareas" }

const owners = ["Usuario 1", "Usuario 2", "Usuario 3"]
const states: TaskState[] = ["pendiente", "pendiente", "en-curso", "hecha"]

const tasks: Task[] = Array.from({ length: 12 }, (_, i) => ({
  id: `t-${i + 1}`,
  columnId: states[i % states.length],
  title: `Tarea ${i + 1}`,
  record: `Registro ${(i * 5) % 24 + 1}`,
  owner: owners[i % owners.length],
  due: i < 3 ? "Hoy" : i < 6 ? "Mañana" : `${16 + i} sep`,
  dueTone: i < 3 ? "warning" : "neutral",
}))

export default function TareasPage() {
  return <TareasView initialTasks={tasks} />
}
