import type { LucideIcon } from "lucide-react"
import { CheckIcon, Clock3Icon } from "lucide-react"
import { cn } from "cn"

/* ─── Titulares ─────────────────────────────────────────────────────────── */

/** Etiqueta de capítulo sobre el título («Introducción», «Bloque 1»). */
export function DocEyebrow({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="doc-eyebrow"
      className={cn(
        "inline-flex h-5 w-fit items-center rounded-full bg-brand-soft px-2.5 text-[10px] font-semibold tracking-[0.12em] text-brand uppercase",
        className
      )}
      {...props}
    />
  )
}

/** Parte destacada de un título, en el color de acento. */
export function DocMark({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("text-brand", className)} {...props} />
}

export function DocTitle({
  size = "page",
  className,
  ...props
}: React.ComponentProps<"h1"> & { size?: "cover" | "page" }) {
  return (
    <h1
      data-slot="doc-title"
      className={cn(
        "font-semibold text-foreground",
        size === "cover" ? "text-[50px] leading-[1.02] tracking-[-0.035em]" : "text-[31px] leading-[1.1] tracking-[-0.025em]",
        className
      )}
      {...props}
    />
  )
}

export function DocLead({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="doc-lead"
      className={cn("text-[14px] leading-[1.65] text-foreground/75", className)}
      {...props}
    />
  )
}

/** Cabecera de capítulo: etiqueta, título y entradilla. */
export function DocHeading({
  eyebrow,
  title,
  lead,
  className,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  lead?: React.ReactNode
  className?: string
}) {
  return (
    <header data-slot="doc-heading" className={cn("mb-7 flex flex-col gap-3", className)}>
      {eyebrow && <DocEyebrow>{eyebrow}</DocEyebrow>}
      <DocTitle>{title}</DocTitle>
      {lead && <DocLead>{lead}</DocLead>}
    </header>
  )
}

/** Ficha numerada (0, 1, 2, A, 1.2…) para índice, apartados y listas. */
export function DocNumber({
  size = "md",
  className,
  ...props
}: React.ComponentProps<"span"> & { size?: "sm" | "md" | "lg" }) {
  return (
    <span
      data-slot="doc-number"
      className={cn(
        "inline-grid flex-none place-items-center rounded-md bg-brand-soft font-semibold text-brand tabular-nums",
        size === "sm" && "h-5 min-w-5 px-1 text-[10.5px]",
        size === "md" && "h-6 min-w-6 px-1.5 text-[11.5px]",
        size === "lg" && "h-8 min-w-10 rounded-lg px-2 text-[14px]",
        className
      )}
      {...props}
    />
  )
}

/* ─── Datos de un apartado: precio, días y complejidad ─────────────────── */

export function DocPill({
  tone = "outline",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: "outline" | "solid" | "brand" | "soft" }) {
  return (
    <span
      data-slot="doc-pill"
      className={cn(
        "inline-flex h-7 flex-none items-center gap-1.5 rounded-full px-3 text-[12px] font-medium whitespace-nowrap tabular-nums [&_svg]:size-3.5",
        tone === "outline" && "border bg-background text-foreground",
        tone === "solid" && "bg-primary text-primary-foreground",
        tone === "brand" && "bg-brand text-brand-foreground",
        tone === "soft" && "bg-brand-soft text-brand",
        className
      )}
      {...props}
    />
  )
}

export function DocComplexity({ value, max = 5, className }: { value: number; max?: number; className?: string }) {
  return (
    <DocPill className={className}>
      <span className="text-muted-foreground">Complejidad</span>
      <span className="flex items-center gap-[3px]" aria-hidden>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={cn("size-[7px] rounded-full", i < value ? "bg-brand" : "bg-border")} />
        ))}
      </span>
      <span>
        {value}/{max}
      </span>
    </DocPill>
  )
}

export function DocDays({ days, className }: { days: number; className?: string }) {
  return (
    <DocPill className={className}>
      <Clock3Icon className="text-muted-foreground" aria-hidden />
      {days} días
    </DocPill>
  )
}

/** Cabecera de un apartado con número, título, precio, días y complejidad. */
export function DocItemHeader({
  id,
  number,
  title,
  price,
  badge,
  days,
  complexity,
  children,
  className,
}: {
  id?: string
  number: React.ReactNode
  title: React.ReactNode
  price?: React.ReactNode
  /** Pastilla libre en lugar del precio («Incluido», «Se presupuesta aparte»). */
  badge?: React.ReactNode
  days?: number
  complexity?: number
  children?: React.ReactNode
  className?: string
}) {
  return (
    <header id={id} data-slot="doc-item-header" className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex items-center gap-3">
        <DocNumber size="lg">{number}</DocNumber>
        <h2 className="min-w-0 flex-1 text-[22px] leading-tight font-semibold tracking-[-0.02em]">{title}</h2>
        <div className="flex items-center gap-1.5">
          {badge}
          {price && <DocPill tone="solid">{price}</DocPill>}
          {days !== undefined && <DocDays days={days} />}
          {complexity !== undefined && <DocComplexity value={complexity} />}
        </div>
      </div>
      {children && <p className="text-[13.5px] leading-[1.65] text-foreground/75">{children}</p>}
    </header>
  )
}

/* ─── Bloques de información ───────────────────────────────────────────── */

/** Filas con icono y texto dentro de una tarjeta («Tecnología», «Forma de trabajo», «Precio»). */
export function DocFacts({
  items,
  className,
}: {
  items: { icon: LucideIcon; title: React.ReactNode; text: React.ReactNode }[]
  className?: string
}) {
  return (
    <div data-slot="doc-facts" className={cn("divide-y rounded-xl border bg-card shadow-xs", className)}>
      {items.map(({ icon: Icon, title, text }, i) => (
        <div key={i} className="flex items-start gap-3.5 px-5 py-3.5">
          <span className="grid size-8 flex-none place-items-center rounded-lg bg-muted text-foreground/70">
            <Icon className="size-4" aria-hidden />
          </span>
          <p className="self-center text-[12.5px] leading-[1.6] text-foreground/75">
            <strong className="font-semibold text-foreground">{title}:</strong> {text}
          </p>
        </div>
      ))}
    </div>
  )
}

/** Mensaje destacado a todo el ancho. `dark` en negro (lo que hay que leer sí o sí), `soft` en acento suave. */
export function DocCallout({
  label,
  tone = "dark",
  className,
  children,
}: {
  label?: React.ReactNode
  tone?: "dark" | "soft"
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="doc-callout"
      className={cn(
        "flex items-center gap-5 rounded-xl px-6 py-4",
        tone === "dark" ? "bg-primary text-primary-foreground" : "bg-brand-soft text-foreground",
        className
      )}
    >
      {label && (
        <span
          className={cn(
            "inline-flex h-6 flex-none items-center rounded-full px-2.5 text-[10px] font-semibold tracking-[0.12em] uppercase",
            tone === "dark" ? "bg-primary-foreground/12 text-primary-foreground" : "bg-brand text-brand-foreground"
          )}
        >
          {label}
        </span>
      )}
      <p
        className={cn(
          "text-[13px] leading-[1.6] [&_strong]:font-semibold",
          tone === "dark" ? "text-primary-foreground/70 [&_strong]:text-primary-foreground" : "text-foreground/80 [&_strong]:text-foreground"
        )}
      >
        {children}
      </p>
    </div>
  )
}

/** Nota en una línea con icono («Integraciones: …»). */
export function DocNote({
  icon: Icon,
  title,
  className,
  children,
}: {
  icon?: LucideIcon
  title?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      data-slot="doc-note"
      className={cn("flex items-start gap-3 rounded-xl border bg-muted/50 px-5 py-3 text-[12.5px] leading-[1.6]", className)}
    >
      {Icon && <Icon className="mt-[3px] size-3.5 flex-none text-brand" aria-hidden />}
      <p className="text-foreground/75">
        {title && <strong className="font-semibold text-foreground">{title}: </strong>}
        {children}
      </p>
    </div>
  )
}

/* ─── Índice ────────────────────────────────────────────────────────────── */

export type DocIndexItem = { token: React.ReactNode; title: React.ReactNode; meta?: React.ReactNode; page: number; href?: string }

/** Índice con ficha, título, dato a la derecha y página. Cada fila enlaza a su hoja (los enlaces se conservan en el PDF). */
export function DocIndex({ items, className }: { items: DocIndexItem[]; className?: string }) {
  return (
    <nav data-slot="doc-index" className={cn("overflow-hidden rounded-xl border bg-card shadow-xs", className)}>
      <div className="flex h-9 items-center justify-between border-b bg-muted/50 px-5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
        <span>Contenido</span>
        <span>Página</span>
      </div>
      <ol className="divide-y">
        {items.map((item, i) => {
          const row = (
            <>
              <DocNumber>{item.token}</DocNumber>
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-foreground">{item.title}</span>
              {item.meta && <span className="text-[12px] text-muted-foreground tabular-nums">{item.meta}</span>}
              <span className="w-7 text-right text-[13px] font-semibold tabular-nums">
                {String(item.page).padStart(2, "0")}
              </span>
            </>
          )
          return (
            <li key={i}>
              {item.href ? (
                <a href={item.href} className="flex h-[38px] items-center gap-3 px-5 hover:bg-muted/50">
                  {row}
                </a>
              ) : (
                <div className="flex h-[38px] items-center gap-3 px-5">{row}</div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/* ─── Apartados y funcionalidades ──────────────────────────────────────── */

/**
 * Apertura de bloque: precio total y páginas con su precio a la izquierda, descripción a la derecha.
 */
export function DocBlockIntro({
  price,
  priceNote,
  items,
  note,
  className,
  children,
}: {
  price: React.ReactNode
  priceNote?: React.ReactNode
  items: { number: React.ReactNode; label: React.ReactNode; value: React.ReactNode }[]
  /** Frase con check bajo la descripción («Incluye kickoff…»). */
  note?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div data-slot="doc-block-intro" className={cn("grid grid-cols-[250px_1fr] gap-10", className)}>
      <div>
        <div className="text-[40px] leading-none font-semibold tracking-[-0.035em] tabular-nums">{price}</div>
        {priceNote && <div className="mt-1.5 text-[11.5px] text-muted-foreground">{priceNote}</div>}
        <ul className="mt-4 border-t">
          {items.map((item, i) => (
            <li key={i} className="flex h-[30px] items-center gap-3 border-b border-dashed text-[12.5px]">
              <span className="w-7 font-medium text-brand tabular-nums">{item.number}</span>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              <span className="text-muted-foreground tabular-nums">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3 text-[13.5px] leading-[1.7] text-foreground/75">
        {children}
        {note && <DocCheckLine>{note}</DocCheckLine>}
      </div>
    </div>
  )
}

export function DocCheck({ tone = "brand", className }: { tone?: "brand" | "inverse" | "off"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-4 flex-none place-items-center rounded-full",
        tone === "brand" && "bg-brand text-brand-foreground",
        tone === "inverse" && "bg-primary-foreground text-primary",
        tone === "off" && "border border-current opacity-40",
        className
      )}
    >
      {tone === "off" ? <span className="h-px w-2 bg-current" /> : <CheckIcon className="size-2.5" strokeWidth={3.5} />}
    </span>
  )
}

export function DocCheckLine({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn("flex items-center gap-2.5 text-[12.5px] font-medium text-foreground", className)}>
      <DocCheck />
      {children}
    </p>
  )
}

/** Rejilla de funcionalidades numeradas con separadores interiores. */
export function DocFeatureGrid({
  cols = 3,
  className,
  ...props
}: React.ComponentProps<"div"> & { cols?: 2 | 3 }) {
  return (
    <div
      data-slot="doc-feature-grid"
      className={cn(
        "grid gap-px overflow-hidden rounded-xl border bg-border shadow-xs",
        cols === 2 ? "grid-cols-2" : "grid-cols-3",
        className
      )}
      {...props}
    />
  )
}

export function DocFeature({
  number,
  title,
  span,
  className,
  children,
}: {
  number?: React.ReactNode
  title: React.ReactNode
  /** Columnas que ocupa, para cerrar la última fila sin huecos. */
  span?: 2 | 3
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="doc-feature"
      className={cn("bg-card px-5 py-4", span === 2 && "col-span-2", span === 3 && "col-span-3", className)}
    >
      <h3 className="text-[13.5px] leading-snug font-semibold">
        {number && <span className="mr-2 text-[12px] font-medium text-brand tabular-nums">{number}</span>}
        {title}
      </h3>
      {children && <p className="mt-1 text-[12.5px] leading-[1.6] text-foreground/70">{children}</p>}
    </div>
  )
}

/** Tarjetas de resumen con icono (bloques de la portada, «Incluido siempre»). */
export function DocCards({
  cols = 3,
  items,
  className,
}: {
  cols?: 2 | 3 | 4
  items: { icon: LucideIcon; title: React.ReactNode; text?: React.ReactNode; href?: string; link?: React.ReactNode }[]
  className?: string
}) {
  return (
    <div
      data-slot="doc-cards"
      className={cn("grid gap-3", cols === 2 && "grid-cols-2", cols === 3 && "grid-cols-3", cols === 4 && "grid-cols-4", className)}
    >
      {items.map(({ icon: Icon, title, text, href, link }, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-xs">
          <span className="grid size-8 place-items-center rounded-lg bg-muted text-foreground/70">
            <Icon className="size-4" aria-hidden />
          </span>
          <h3 className="mt-1 text-[13.5px] font-semibold">{title}</h3>
          {text && <p className="text-[12px] leading-[1.55] text-muted-foreground">{text}</p>}
          {href && link && (
            <a href={href} className="mt-auto pt-1 text-[12px] font-medium text-brand">
              {link} →
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

/** Lista de iconos con texto en columnas, sin tarjeta por elemento («Incluido siempre»). */
export function DocIconList({
  cols = 4,
  items,
  className,
}: {
  cols?: 2 | 3 | 4
  items: { icon: LucideIcon; text: React.ReactNode }[]
  className?: string
}) {
  return (
    <div
      data-slot="doc-icon-list"
      className={cn("grid gap-4", cols === 2 && "grid-cols-2", cols === 3 && "grid-cols-3", cols === 4 && "grid-cols-4", className)}
    >
      {items.map(({ icon: Icon, text }, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <span className="grid size-8 flex-none place-items-center rounded-lg bg-muted text-foreground/70">
            <Icon className="size-4" aria-hidden />
          </span>
          <p className="text-[12px] leading-[1.5] text-foreground/80">{text}</p>
        </div>
      ))}
    </div>
  )
}
