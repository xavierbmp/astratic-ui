"use client"

import * as React from "react"
import { cn } from "cn"

type Entry = { id: string; title: string }

export function DocToc() {
  const [entries, setEntries] = React.useState<Entry[]>([])
  const [active, setActive] = React.useState<string | null>(null)

  React.useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("article section[id]"))
    const found = sections
      .map((s) => ({ id: s.id, title: s.querySelector("h2")?.textContent?.trim() ?? "" }))
      .filter((e) => e.title)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- las secciones solo existen en el DOM tras montar
    setEntries(found)

    const observer = new IntersectionObserver(
      (items) => {
        const visible = items.filter((i) => i.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-64px 0px -60% 0px" }
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  if (entries.length < 3) return null

  return (
    <nav aria-label="En esta página" className="sticky top-6 hidden max-h-[calc(100vh-6rem)] overflow-y-auto xl:block">
      <p className="mb-2 text-xs font-medium text-muted-foreground">En esta página</p>
      <ul className="flex flex-col border-l">
        {entries.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              className={cn(
                "-ml-px block border-l py-1 pl-3 text-[13px] leading-snug text-muted-foreground transition-colors hover:text-foreground",
                active === e.id ? "border-foreground font-medium text-foreground" : "border-transparent"
              )}
            >
              {e.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
