import type { LucideIcon } from "lucide-react"
import { CheckIcon, MailIcon, PhoneIcon } from "lucide-react"
import { cn } from "cn"
import { DocCheck, DocNumber } from "@/components/document/content"
import { DocLogo } from "@/components/document/sheet"

/* ─── Paquetes ─────────────────────────────────────────────────────────── */

export type DocPlanLine = { number?: React.ReactNode; label: React.ReactNode; value?: React.ReactNode; included?: boolean }

/** Tarjeta de paquete. `featured` va en negro: el paquete recomendado o el más completo. */
export function DocPlanCard({
  name,
  tag,
  price,
  priceNote,
  description,
  lines,
  highlight,
  stats,
  featured = false,
  className,
}: {
  name: React.ReactNode
  tag?: React.ReactNode
  price: React.ReactNode
  priceNote?: React.ReactNode
  description?: React.ReactNode
  lines: DocPlanLine[]
  /** Línea destacada bajo la lista («Dashboards: los 3»). */
  highlight?: React.ReactNode
  stats?: { label: React.ReactNode; value: React.ReactNode; hint?: React.ReactNode }[]
  featured?: boolean
  className?: string
}) {
  const soft = featured ? "text-primary-foreground/60" : "text-muted-foreground"
  const rule = featured ? "border-primary-foreground/15" : "border-border"
  return (
    <div
      data-slot="doc-plan-card"
      data-featured={featured || undefined}
      className={cn(
        "flex flex-col rounded-2xl p-6",
        featured ? "bg-primary text-primary-foreground" : "border bg-card shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-[14px] font-semibold">{name}</span>
        {tag && (
          <span
            className={cn(
              "inline-flex h-5 items-center rounded-full px-2.5 text-[10px] font-semibold tracking-[0.12em] uppercase",
              featured ? "bg-primary-foreground/12" : "bg-brand-soft text-brand"
            )}
          >
            {tag}
          </span>
        )}
      </div>
      <div className="mt-4 text-[42px] leading-none font-semibold tracking-[-0.035em] tabular-nums">{price}</div>
      {priceNote && <div className={cn("mt-2 text-[12px]", soft)}>{priceNote}</div>}
      {description && <p className={cn("mt-3 min-h-[60px] text-[12.5px] leading-[1.6]", soft)}>{description}</p>}

      <ul className={cn("mt-4 border-t pt-3", rule)}>
        {lines.map((line, i) => {
          const on = line.included !== false
          return (
            <li
              key={i}
              className={cn("grid h-[23px] grid-cols-[16px_30px_1fr_auto] items-center gap-2 text-[12.5px]", !on && soft)}
            >
              <DocCheck tone={on ? (featured ? "inverse" : "brand") : "off"} />
              <span className={cn("text-[11.5px] tabular-nums", on && !featured && "text-brand", on && featured && "text-primary-foreground/60")}>
                {line.number}
              </span>
              <span className="truncate">{line.label}</span>
              <span className="tabular-nums">{on ? line.value : "—"}</span>
            </li>
          )
        })}
      </ul>

      {highlight && (
        <div
          className={cn(
            "mt-3 flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12.5px] font-medium",
            featured ? "bg-primary-foreground/8" : "bg-brand-soft/60"
          )}
        >
          <DocCheck tone={featured ? "inverse" : "brand"} />
          {highlight}
        </div>
      )}

      {stats && (
        <div className="mt-auto pt-5">
          <div className={cn("grid grid-cols-2 gap-4 border-t pt-4", rule)}>
            {stats.map((s, i) => (
              <div key={i}>
                <div className={cn("text-[10px] font-semibold tracking-[0.12em] uppercase", soft)}>{s.label}</div>
                <div className="mt-1 text-[14px] font-semibold">{s.value}</div>
                {s.hint && <div className={cn("text-[11px]", soft)}>{s.hint}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/** Oferta o condición especial a todo el ancho, con importe a la derecha. */
export function DocOffer({
  icon: Icon,
  title,
  price,
  priceNote,
  className,
  children,
}: {
  icon: LucideIcon
  title: React.ReactNode
  price?: React.ReactNode
  priceNote?: React.ReactNode
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="doc-offer"
      className={cn("flex items-center gap-4 rounded-xl border border-brand/35 bg-brand-soft/50 px-5 py-3.5", className)}
    >
      <span className="grid size-9 flex-none place-items-center rounded-lg bg-brand text-brand-foreground">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-semibold">{title}</div>
        {children && <p className="mt-0.5 text-[12.5px] leading-[1.55] text-foreground/75">{children}</p>}
      </div>
      {price && (
        <div className="flex-none text-right">
          <div className="text-[26px] leading-none font-semibold tracking-[-0.03em] text-brand tabular-nums">{price}</div>
          {priceNote && <div className="mt-1 text-[11px] text-muted-foreground">{priceNote}</div>}
        </div>
      )}
    </div>
  )
}

/* ─── Tablas de importes ───────────────────────────────────────────────── */

export type DocPriceRow = {
  number?: React.ReactNode
  label: React.ReactNode
  detail?: React.ReactNode
  cells: React.ReactNode[]
  muted?: boolean
}

/**
 * Tabla de conceptos con columnas numéricas a la derecha y resumen (subtotal, IVA, total) al pie.
 * Sirve para presupuestos, resúmenes económicos y costes recurrentes.
 */
export function DocPriceTable({
  title,
  columns,
  rows,
  summary,
  className,
}: {
  title?: React.ReactNode
  /** Primera columna = concepto; el resto se alinean a la derecha. */
  columns: React.ReactNode[]
  rows: DocPriceRow[]
  summary?: { label: React.ReactNode; value: React.ReactNode; strong?: boolean }[]
  className?: string
}) {
  const numeric = columns.length - 1
  const template = `1fr ${Array.from({ length: numeric }, () => "96px").join(" ")}`
  return (
    <div data-slot="doc-price-table" className={cn("overflow-hidden rounded-xl border bg-card shadow-xs", className)}>
      {title && <div className="border-b px-5 py-2.5 text-[13px] font-semibold">{title}</div>}
      <div
        className="grid h-9 items-center gap-4 border-b bg-muted/50 px-5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase"
        style={{ gridTemplateColumns: template }}
      >
        {columns.map((c, i) => (
          <span key={i} className={cn(i > 0 && "text-right")}>
            {c}
          </span>
        ))}
      </div>
      <div className="divide-y">
        {rows.map((row, i) => (
          <div
            key={i}
            className={cn("grid min-h-[34px] items-center gap-4 px-5 py-1.5", row.muted && "text-muted-foreground")}
            style={{ gridTemplateColumns: template }}
          >
            <div className="flex min-w-0 items-center gap-3">
              {row.number !== undefined && <DocNumber size="sm">{row.number}</DocNumber>}
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium">{row.label}</div>
                {row.detail && <div className="truncate text-[11.5px] text-muted-foreground">{row.detail}</div>}
              </div>
            </div>
            {row.cells.map((cell, j) => (
              <span key={j} className="text-right text-[13px] tabular-nums">
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
      {summary && (
        <div className="flex justify-end border-t bg-muted/30 px-5 py-3">
          <dl className="grid w-[280px] grid-cols-[1fr_auto] gap-x-6 gap-y-1.5">
            {summary.map((s, i) => (
              <div
                key={i}
                className={cn(
                  "col-span-2 grid grid-cols-subgrid items-baseline text-[12.5px]",
                  s.strong && "mt-1 border-t pt-2.5"
                )}
              >
                <dt className={cn(s.strong ? "font-semibold" : "text-muted-foreground")}>{s.label}</dt>
                <dd className={cn("text-right tabular-nums", s.strong && "text-[20px] font-semibold tracking-[-0.02em]")}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}

/* ─── Plazos ───────────────────────────────────────────────────────────── */

type DocTimelineTask = {
  label: React.ReactNode
  /** Semana de inicio y fin en la escala del eje (0 = arranque). Admite decimales. */
  from: number
  to: number
  days?: number
  weeks?: React.ReactNode
  tone?: "brand" | "dark"
}
type DocTimelineMilestone = { milestone: true; label: React.ReactNode; value: React.ReactNode; hint?: React.ReactNode; tone?: "brand" | "dark" }

/** Diagrama de Gantt por semanas con hitos (fin de cada paquete o fase). */
export function DocTimeline({
  weeks,
  ticks,
  rows,
  markers = [],
  legend,
  className,
}: {
  weeks: number
  ticks: number[]
  rows: (DocTimelineTask | DocTimelineMilestone)[]
  markers?: { week: number; label: React.ReactNode; tone?: "brand" | "dark" }[]
  legend?: { label: React.ReactNode; tone: "brand" | "dark" }[]
  className?: string
}) {
  const cols = "grid-cols-[26px_170px_1fr_44px_64px]"
  const pct = (w: number) => `${(w / weeks) * 100}%`
  const markerLines = (
    <>
      {markers.map((m, i) => (
        <span
          key={i}
          aria-hidden
          className={cn("absolute inset-y-0 w-0 border-l border-dashed", m.tone === "dark" ? "border-foreground/70" : "border-brand")}
          style={{ left: pct(m.week) }}
        />
      ))}
    </>
  )
  const taskNumbers = rows.map((_, i) => rows.slice(0, i + 1).filter((r) => !("milestone" in r)).length)

  return (
    <div data-slot="doc-timeline" className={className}>
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <div className={cn("grid h-14 items-end gap-3 border-b bg-muted/50 px-5 pb-2.5", cols)}>
          <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">N.º</span>
          <span className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Página</span>
          <div className="relative h-full">
            {markers.map((m, i) => (
              <span
                key={i}
                className={cn(
                  "absolute top-2 inline-flex h-[18px] -translate-x-1/2 items-center rounded-full px-2 text-[9px] font-semibold tracking-[0.1em] uppercase",
                  m.tone === "dark" ? "bg-primary text-primary-foreground" : "bg-brand text-brand-foreground"
                )}
                style={{ left: pct(m.week) }}
              >
                {m.label}
              </span>
            ))}
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute bottom-0 -translate-x-1/2 text-[10.5px] text-muted-foreground tabular-nums"
                style={{ left: pct(t) }}
              >
                {t}
              </span>
            ))}
          </div>
          <span className="text-right text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Días</span>
          <span className="text-right text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">Semanas</span>
        </div>

        {rows.map((row, i) => {
          if ("milestone" in row) {
            const dark = row.tone === "dark"
            return (
              <div
                key={i}
                className={cn(
                  "grid h-[46px] items-center gap-3 px-5",
                  cols,
                  dark ? "bg-primary text-primary-foreground" : "bg-brand-soft/60 text-brand"
                )}
              >
                <span />
                <span className="text-[12.5px] font-semibold">{row.label}</span>
                <div className="relative h-full">{markerLines}</div>
                <div className="col-span-2 text-right whitespace-nowrap">
                  <div className="text-[12.5px] font-semibold">{row.value}</div>
                  {row.hint && (
                    <div className={cn("text-[10px]", dark ? "text-primary-foreground/60" : "text-muted-foreground")}>{row.hint}</div>
                  )}
                </div>
              </div>
            )
          }
          return (
            <div key={i} className={cn("grid h-[36px] items-center gap-3 border-b border-border/60 px-5 last:border-0", cols)}>
              <span className="text-[11px] text-muted-foreground tabular-nums">{taskNumbers[i]}</span>
              <span className="truncate text-[12.5px] font-medium">{row.label}</span>
              <div
                className="relative h-full"
                style={{
                  backgroundImage: `repeating-linear-gradient(to right, var(--border) 0 1px, transparent 1px ${100 / weeks}%)`,
                }}
              >
                {markerLines}
                <span
                  className={cn(
                    "absolute top-1/2 h-3 -translate-y-1/2 rounded-full",
                    row.tone === "dark" ? "bg-primary" : "bg-brand"
                  )}
                  style={{ left: pct(row.from), width: `max(6px, ${((row.to - row.from) / weeks) * 100}%)` }}
                />
              </div>
              <span className="text-right text-[12.5px] tabular-nums">{row.days}</span>
              <span className="text-right text-[12.5px] tabular-nums">{row.weeks}</span>
            </div>
          )
        })}
      </div>
      {legend && (
        <div className="mt-3 flex items-center gap-5 text-[11.5px] text-muted-foreground">
          {legend.map((l, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span className={cn("h-2.5 w-5 rounded-full", l.tone === "dark" ? "bg-primary" : "bg-brand")} />
              {l.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Pasos, paneles y contacto ────────────────────────────────────────── */

export function DocSteps({ items, className }: { items: { title: React.ReactNode; text?: React.ReactNode }[]; className?: string }) {
  return (
    <ol data-slot="doc-steps" className={cn("divide-y rounded-xl border bg-card shadow-xs", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-4 px-5 py-3.5">
          <span className="grid size-6 flex-none place-items-center rounded-full bg-primary text-[11.5px] font-semibold text-primary-foreground tabular-nums">
            {i + 1}
          </span>
          <div className="min-w-0 pt-0.5">
            <div className="text-[13.5px] font-semibold">{item.title}</div>
            {item.text && <p className="mt-0.5 text-[12.5px] leading-[1.6] text-foreground/70">{item.text}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function DocPanel({
  tone = "default",
  label,
  className,
  children,
}: {
  tone?: "default" | "dark"
  label?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="doc-panel"
      data-tone={tone}
      className={cn(
        "group/panel flex flex-col rounded-2xl p-6",
        tone === "dark" ? "bg-primary text-primary-foreground" : "border bg-card shadow-xs",
        className
      )}
    >
      {label && (
        <div
          className={cn(
            "mb-4 text-[10px] font-semibold tracking-[0.12em] uppercase",
            tone === "dark" ? "text-primary-foreground/60" : "text-brand"
          )}
        >
          {label}
        </div>
      )}
      {children}
    </div>
  )
}

export function DocStat({ value, label, className }: { value: React.ReactNode; label: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="text-[36px] leading-none font-semibold tracking-[-0.035em] tabular-nums">{value}</div>
      <div className="mt-1.5 text-[12.5px] opacity-70">{label}</div>
    </div>
  )
}

export function DocContact({ email, phone, className }: { email: string; phone?: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <DocLogo className="text-[20px]" />
      <div className="flex flex-col gap-1.5 text-[13px] font-medium">
        <a href={`mailto:${email}`} className="inline-flex items-center gap-2.5">
          <MailIcon className="size-3.5 text-brand" aria-hidden />
          {email}
        </a>
        {phone && (
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2.5">
            <PhoneIcon className="size-3.5 text-brand" aria-hidden />
            {phone}
          </a>
        )}
      </div>
    </div>
  )
}

/* ─── Aceptación ───────────────────────────────────────────────────────── */

/** Casilla para marcar a mano o en un lector de PDF. */
export function DocCheckbox({ checked = false, className }: { checked?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-4 flex-none place-items-center rounded-[4px] border",
        checked ? "border-brand bg-brand text-brand-foreground" : "border-foreground/30 bg-background",
        className
      )}
    >
      {checked && <CheckIcon className="size-3" strokeWidth={3} />}
    </span>
  )
}

export function DocChoices({
  items,
  className,
}: {
  items: { label: React.ReactNode; value?: React.ReactNode; checked?: boolean }[]
  className?: string
}) {
  return (
    <div data-slot="doc-choices" className={cn("grid grid-cols-2 gap-2.5", className)}>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-2.5">
          <DocCheckbox checked={item.checked} />
          <span className="min-w-0 flex-1 text-[13px] leading-snug font-medium">{item.label}</span>
          {item.value && <span className="text-[13px] font-semibold tabular-nums">{item.value}</span>}
        </div>
      ))}
    </div>
  )
}

export type DocChecklistItem = {
  label: React.ReactNode
  value?: React.ReactNode
  checked?: boolean
  muted?: boolean
  children?: React.ReactNode[]
}

/** Grupo de casillas con cabecera (bloque) y sub-casillas en tres columnas (funcionalidades). */
export function DocChecklist({ title, items, className }: { title: React.ReactNode; items: DocChecklistItem[]; className?: string }) {
  return (
    <div data-slot="doc-checklist" className={cn("overflow-hidden rounded-xl border bg-card shadow-xs", className)}>
      <div className="flex h-8 items-center border-b bg-muted/50 px-5 text-[10px] font-semibold tracking-[0.12em] text-brand uppercase">
        {title}
      </div>
      <div className="divide-y">
        {items.map((item, i) => (
          <div key={i} className="px-5 py-2">
            <div className={cn("flex items-center gap-3", item.muted && "text-muted-foreground")}>
              <DocCheckbox checked={item.checked} />
              <span className={cn("min-w-0 flex-1", item.muted ? "text-[12px]" : "text-[13px] font-medium")}>{item.label}</span>
              {item.value && (
                <span className={cn("tabular-nums", item.muted ? "text-[11.5px]" : "text-[13px] font-semibold")}>{item.value}</span>
              )}
            </div>
            {item.children && item.children.length > 0 && (
              <div className="mt-1.5 grid grid-cols-3 gap-x-4 gap-y-1 pl-7">
                {item.children.map((child, j) => (
                  <span key={j} className="flex items-center gap-2 text-[11.5px] text-foreground/70">
                    <DocCheckbox className="size-3.5 rounded-[3px]" />
                    <span className="truncate">{child}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Cajas de firma de las dos partes. */
export function DocSignatures({ parties, className }: { parties: React.ReactNode[]; className?: string }) {
  return (
    <div data-slot="doc-signatures" className={cn("grid grid-cols-2 gap-4", className)}>
      {parties.map((party, i) => (
        <div key={i} className="rounded-xl border bg-card px-5 pt-3.5 pb-4 shadow-xs">
          <div className="text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{party}</div>
          <div className="mt-10 border-b border-dashed" />
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>Nombre y firma</span>
            <span>Fecha</span>
          </div>
        </div>
      ))}
    </div>
  )
}
