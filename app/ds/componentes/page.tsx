import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { DocPage, DocSection, NextLinks, Prose } from "@/components/docs/doc"
import { componentPages } from "@/app/ds/nav"

export const metadata = { title: "Catálogo de componentes" }

export default function ComponentesPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Catálogo"
      lead="Las piezas con las que se monta cualquier página de un portal. Cada una con su ejemplo en vivo, sus props y el comando para instalarla."
    >
      <DocSection id="capas" title="Dos capas">
        <Prose>
          <p>
            Los <strong>componentes base</strong> (botón, input, diálogo, tabla, menú, tabs…) son los de shadcn/ui con el
            preset Nova. Viven en <code>components/ui</code> y no se documentan aquí: su referencia es{" "}
            <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">
              ui.shadcn.com
            </a>
            . Lo único que cambia respecto a la documentación oficial es el tema.
          </p>
          <p>
            El <strong>kit de aplicación</strong> vive en <code>components/app</code> y es lo que documenta este catálogo:
            shell, cabecera de página, cifras, toolbar, tabla de datos, kanban, panel de información, sheet de detalle.
            Son composiciones de los componentes base con las convenciones del sistema ya aplicadas, para que una página
            nueva se monte encajando piezas y no decidiendo medidas.
          </p>
          <p>
            Cada página trae el ejemplo en vivo, la tabla de props y el comando de instalación desde el registry:{" "}
            <code>npx shadcn@latest add https://ui.astraticnetwork.com/r/{"<item>"}.json</code>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="catalogo" title="Componentes del kit">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {componentPages.map((c) => (
            <Link
              key={c.slug}
              href={`/ds/componentes/${c.slug}`}
              className="group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-muted/40"
            >
              <span className="flex items-center gap-2">
                <c.icon className="size-4 flex-none text-muted-foreground" aria-hidden />
                <span className="flex-1 text-sm font-medium">{c.label}</span>
                <ArrowRightIcon className="size-4 flex-none text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">{c.summary}</span>
            </Link>
          ))}
        </div>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/anatomia", label: "Anatomía de página", text: "Dónde encaja cada componente." },
            { href: "/ds/registry", label: "Registry", text: "Cómo se instalan y se publican." },
            { href: "/ds/nuevo-proyecto", label: "Nuevo proyecto", text: "Arrancar un portal con el kit completo." },
            { href: "/demo/registros", label: "Ver en la demo", text: "Todos los componentes juntos en una página real." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
