"use client"

import * as React from "react"

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
