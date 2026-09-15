import { DocPage, DocSection, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import registry from "@/registry.json"

export const metadata = { title: "Registry" }

export default function RegistryPage() {
  const base = process.env.NEXT_PUBLIC_REGISTRY_URL ?? "https://ui.astraticnetwork.com"
  return (
    <DocPage
      eyebrow="Guía"
      title="Registry"
      lead="Cada componente del kit se publica como ítem de un registry de shadcn. Así se instala en cualquier proyecto con un comando, con sus dependencias y sus componentes base."
    >
      <DocSection id="instalar" title="Instalar un componente">
        <CodeBlock lang="bash" code={`npx shadcn@latest add ${base}/r/data-table.json`} />
        <Prose>
          <p>
            El comando copia el archivo a <code>components/app/</code>, instala las dependencias de npm que falten y
            añade los componentes de shadcn/ui de los que depende (por ejemplo <code>table</code> y{" "}
            <code>checkbox</code> para la tabla). El proyecto destino necesita tener shadcn inicializado con Tailwind v4.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="tokens" title="Antes del primer componente: los tokens">
        <Prose>
          <p>
            Los componentes usan tokens que no existen en un shadcn recién instalado (<code>brand</code>,{" "}
            <code>success</code>, <code>warning</code>…). Instala primero el tema:
          </p>
        </Prose>
        <CodeBlock lang="bash" code={`npx shadcn@latest add ${base}/r/theme.json`} />
        <Prose>
          <p>Añade las variables a <code>app/globals.css</code> y las utilidades <code>lib/status.ts</code> y <code>lib/format.ts</code>.</p>
        </Prose>
      </DocSection>

      <DocSection id="catalogo" title="Ítems disponibles">
        <SpecTable
          columns={["Ítem", "Tipo", "Descripción", "Comando"]}
          rows={registry.items.map((it) => [
            it.name,
            <code key={`${it.name}-t`}>{it.type.replace("registry:", "")}</code>,
            it.description,
            <code key={`${it.name}-c`} className="text-[11px]">npx shadcn@latest add {base}/r/{it.name}.json</code>,
          ])}
        />
      </DocSection>

      <DocSection id="publicar" title="Publicar cambios">
        <Rules
          items={[
            <>Los ítems se definen en <code>registry.json</code> en la raíz. Cada uno lista sus archivos, sus dependencias de npm y sus <code>registryDependencies</code> de shadcn.</>,
            <><code>npm run registry:build</code> genera <code>public/r/*.json</code>. Se ejecuta en el build de Vercel, así que publicar es hacer merge en <code>main</code>.</>,
            <>Versiona en el <code>description</code> cuando un cambio rompa la API de un componente. Los proyectos que ya lo tienen instalado no se actualizan solos: se vuelve a ejecutar el <code>add</code> con <code>--overwrite</code>.</>,
            <>Un componente nuevo se crea aquí, se documenta en el catálogo y se añade al registry. Luego se instala en el proyecto que lo necesitaba. Nunca al revés.</>,
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
