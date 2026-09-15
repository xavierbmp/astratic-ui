import { readFile } from "node:fs/promises"
import path from "node:path"
import { DocPage } from "@/components/docs/doc"
import { Markdown } from "@/components/docs/markdown"

export const metadata = { title: "Nuevo proyecto" }

export default async function NuevoProyectoPage() {
  const source = await readFile(path.join(process.cwd(), "content/nuevo-proyecto.md"), "utf8")
  return (
    <DocPage
      eyebrow="Guía"
      title="Nuevo proyecto"
      lead="La lista de pasos para arrancar un portal para un cliente sobre esta base. Vive en content/nuevo-proyecto.md y se copia a cada proyecto nuevo."
    >
      <Markdown source={source} />
    </DocPage>
  )
}
