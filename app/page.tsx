import Link from "next/link"
import { ArrowRightIcon, BookOpenIcon, LayoutDashboardIcon, PackageIcon, RocketIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/app/theme-toggle"

const cards = [
  {
    href: "/ds",
    icon: BookOpenIcon,
    title: "Design system",
    text: "Fundamentos, componentes, patrones de página y convenciones fijas de todos los portales.",
  },
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
        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <Link href="/ds">
              Ver el design system <ArrowRightIcon />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/demo">Abrir la demo</Link>
          </Button>
        </div>
      </section>
      <section className="mt-16 grid gap-4 sm:grid-cols-2">
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
