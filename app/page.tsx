import Link from "next/link"
import { ArrowRightIcon, BookOpenIcon, LayoutDashboardIcon, PackageIcon, RocketIcon } from "lucide-react"
import { ThemeToggle } from "@/components/app/theme-toggle"
import { DESIGN_SYSTEMS } from "@/app/ds/design-systems"

const cards = [
  {
    href: "/demo",
    icon: LayoutDashboardIcon,
    title: "Demo",
    text: "Un mini-portal con datos genéricos: dashboard, registros con tabla, lista y kanban, tareas y equipo.",
  },
  {
    href: "/ds/nuevo-proyecto",
    icon: RocketIcon,
    title: "Nuevo proyecto",
    text: "La lista de pasos para arrancar un portal nuevo sobre esta base: repo, Vercel, Neon, dominio y primer bloque.",
  },
  {
    href: "/ds/registry",
    icon: PackageIcon,
    title: "Registry",
    text: "Instala cualquier componente del kit en un proyecto existente con un comando de shadcn.",
  },
]

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10 md:py-16">
      <header className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-sm font-semibold">
          <span className="grid size-7 place-items-center rounded-lg bg-foreground text-xs text-background">A</span>
          Astratic UI
        </span>
        <ThemeToggle />
      </header>
      <section className="mt-16 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">La base de todos los portales de Astratic Devs.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Un design system con código real sobre Next.js, Tailwind v4 y shadcn/ui. Se clona para empezar un proyecto o
          se instala por piezas en uno existente.
        </p>
      </section>
      <section className="mt-12">
        <h2 className="text-sm font-semibold text-muted-foreground">Elige un design system</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {DESIGN_SYSTEMS.map((d) => (
            <Link
              key={d.id}
              href={d.href}
              className="group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs transition-colors hover:border-brand hover:bg-brand-soft/40"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-foreground text-xs font-semibold text-background">
                  {d.monogram}
                </span>
                <span className="flex flex-col">
                  <span className="text-base font-semibold">{d.label}</span>
                  <span className="text-xs text-muted-foreground">Design system {d.kind.toLowerCase()}</span>
                </span>
              </span>
              <span className="text-sm text-muted-foreground">{d.description}</span>
              <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand">
                <BookOpenIcon className="size-3.5" /> Ver la documentación
                <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-xs transition-colors hover:bg-muted/40"
          >
            <c.icon className="size-5 text-muted-foreground" />
            <span className="text-base font-semibold">{c.title}</span>
            <span className="text-sm text-muted-foreground">{c.text}</span>
            <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand">
              Abrir <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>
    </main>
  )
}
