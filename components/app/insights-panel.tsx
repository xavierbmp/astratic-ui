"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { ChevronDownIcon, ChevronUpIcon, SlidersHorizontalIcon } from "lucide-react"
import { cn } from "cn"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Section, SectionBody, SectionHeader } from "@/components/app/section"
import { PanelFichaSwitch, type PanelFicha } from "@/components/app/detail-panel"

export type InsightBlock = {
  id: string
  title: string
  icon?: LucideIcon
  defaultVisible?: boolean
  action?: React.ReactNode
  render: () => React.ReactNode
}

type Prefs = { order: string[]; hidden: string[] }

export function InsightsPanel({
  storageKey,
  blocks,
  title = "Información",
  ficha,
  className,
}: {
  storageKey: string
  blocks: InsightBlock[]
  title?: string
  /** Si se pasa, los ajustes del panel ofrecen enseñar aquí la ficha del registro abierto. */
  ficha?: PanelFicha
  className?: string
}) {
  const defaults: Prefs = {
    order: blocks.map((b) => b.id),
    hidden: blocks.filter((b) => b.defaultVisible === false).map((b) => b.id),
  }
  const [prefs, setPrefs] = useLocalStorage<Prefs>(`insights:${storageKey}`, defaults)

  const order = [...prefs.order.filter((id) => blocks.some((b) => b.id === id)), ...blocks.map((b) => b.id).filter((id) => !prefs.order.includes(id))]
  const visible = order.filter((id) => !prefs.hidden.includes(id))

  const move = (id: string, dir: -1 | 1) => {
    const i = order.indexOf(id)
    const j = i + dir
    if (j < 0 || j >= order.length) return
    const next = [...order]
    ;[next[i], next[j]] = [next[j], next[i]]
    setPrefs({ ...prefs, order: next })
  }
  const toggle = (id: string, on: boolean) =>
    setPrefs({ ...prefs, order, hidden: on ? prefs.hidden.filter((h) => h !== id) : [...prefs.hidden, id] })

  return (
    <Section className={cn("h-full", className)} data-slot="insights-panel">
      <SectionHeader
        title={title}
        action={
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Personalizar panel">
                <SlidersHorizontalIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className={cn("p-2", ficha ? "w-72" : "w-64")}>
              {ficha && (
                <div className="mb-1 border-b pb-1">
                  <PanelFichaSwitch ficha={ficha} />
                </div>
              )}
              <p className="px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground">Bloques del panel</p>
              <ul className="flex flex-col">
                {order.map((id, i) => {
                  const b = blocks.find((x) => x.id === id)!
                  const on = !prefs.hidden.includes(id)
                  return (
                    <li key={id} className="flex h-8 items-center gap-2 rounded-md px-2 hover:bg-muted">
                      <Checkbox id={`ins-${id}`} checked={on} onCheckedChange={(c) => toggle(id, c === true)} />
                      <label htmlFor={`ins-${id}`} className="flex-1 truncate text-sm">
                        {b.title}
                      </label>
                      <Button variant="ghost" size="icon-xs" aria-label="Subir" disabled={i === 0} onClick={() => move(id, -1)}>
                        <ChevronUpIcon />
                      </Button>
                      <Button variant="ghost" size="icon-xs" aria-label="Bajar" disabled={i === order.length - 1} onClick={() => move(id, 1)}>
                        <ChevronDownIcon />
                      </Button>
                    </li>
                  )
                })}
              </ul>
              <div className="mt-1 border-t px-2 pt-2">
                <Button variant="ghost" size="sm" className="h-7 w-full justify-start text-muted-foreground" onClick={() => setPrefs(defaults)}>
                  Restablecer
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        }
      />
      <SectionBody className="divide-y">
        {visible.length === 0 && (
          <p className="px-4 py-8 text-center text-xs text-muted-foreground">
            Ningún bloque activo. Usa el ajuste del panel para elegir qué ver.
          </p>
        )}
        {visible.map((id) => {
          const b = blocks.find((x) => x.id === id)!
          return (
            <div key={id} className="px-4 py-3">
              <div className="mb-2 flex items-center gap-1.5">
                {b.icon && <b.icon className="size-3.5 text-muted-foreground" aria-hidden />}
                <h3 className="text-[13px] font-semibold">{b.title}</h3>
                {b.action && <div className="ml-auto text-xs text-muted-foreground">{b.action}</div>}
              </div>
              {b.render()}
            </div>
          )
        })}
      </SectionBody>
    </Section>
  )
}

export function InsightList({
  items,
}: {
  items: { key: string; leading?: React.ReactNode; title: React.ReactNode; subtitle?: React.ReactNode; trailing?: React.ReactNode }[]
}) {
  return (
    <ul className="-mx-1 flex flex-col">
      {items.map((it) => (
        <li key={it.key} className="flex items-center gap-2.5 rounded-md px-1 py-1.5">
          {it.leading}
          <div className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate text-[13px] font-medium">{it.title}</span>
            {it.subtitle && <span className="truncate text-xs text-muted-foreground">{it.subtitle}</span>}
          </div>
          {it.trailing && <span className="flex-none text-xs tabular-nums">{it.trailing}</span>}
        </li>
      ))}
    </ul>
  )
}

export function InsightStat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right">
        <span className="text-sm font-semibold tabular-nums">{value}</span>
        {sub && <span className="ml-1.5 text-xs text-muted-foreground">{sub}</span>}
      </span>
    </div>
  )
}
