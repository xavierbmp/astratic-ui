import type { LucideIcon } from "lucide-react"
import {
  BarChart3Icon,
  BookOpenIcon,
  CheckIcon,
  LightbulbIcon,
  MessageSquareQuoteIcon,
  ScaleIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { cn } from "cn"
import { DocBackdrop, DocLogo } from "@/components/document/sheet"
import { DocEyebrow, DocNumber } from "@/components/document/content"

/**
 * Guía: documento largo de contenido corrido (manuales, guías, informes extensos). No se compone hoja a hoja
 * como las propuestas: el contenido fluye y Chrome lo pagina al exportar con `scripts/exportar-pdf.ts`, que
 * pone el pie con la numeración y, en una segunda pasada, las páginas del índice. En pantalla es una columna A4 continua.
 * Fuerza el tema claro.
 */
export function GuideBook({
  toolbar,
  footer,
  className,
  children,
  ...props
}: React.ComponentProps<"main"> & {
  /** Barra superior de pantalla (`DocToolbar`); no se imprime. */
  toolbar?: React.ReactNode
  /** Texto del pie de cada página del PDF («La guía · 2026»); lo pinta el script de exportación junto al número. */
  footer?: string
}) {
  return (
    <main
      data-slot="guide-book"
      data-footer={footer}
      className={cn(
        "theme-light flex min-h-screen flex-col items-center bg-muted text-foreground print:block print:min-h-0 print:bg-transparent",
        className
      )}
      {...props}
    >
      {toolbar}
      <article
        data-slot="guide-pages"
        className="my-10 w-[210mm] bg-background px-[18mm] py-[20mm] text-[12.5px] leading-[1.6] shadow-pop max-[860px]:[zoom:0.62] max-[540px]:[zoom:0.44] print:m-0 print:w-auto print:p-0 print:shadow-none print:[zoom:1]"
      >
        {children}
      </article>
    </main>
  )
}

/** Clases de una página a sangre (portada y portadillas): en pantalla sale del margen de la columna. */
const fullPage =
  "relative -mx-[18mm] flex h-[297mm] w-[210mm] flex-col overflow-hidden print:mx-0"

/** Portada de la guía: logo, etiqueta, título grande, entradilla, figura opcional y pie. */
export function GuideCover({
  eyebrow = "Guía",
  meta,
  title,
  lead,
  figure,
  footer,
}: {
  eyebrow?: React.ReactNode
  /** Texto junto a la etiqueta («Edición 2026»). */
  meta?: React.ReactNode
  title: React.ReactNode
  lead?: React.ReactNode
  figure?: React.ReactNode
  footer?: [React.ReactNode, React.ReactNode]
}) {
  return (
    <section data-slot="guide-cover" className={cn(fullPage, "-mt-[20mm] px-14 pt-11 pb-10 print:mt-0")}>
      <DocBackdrop />
      <div className="relative flex h-11 items-center">
        <DocLogo className="text-[17px]" devs={false} />
      </div>
      <div className="relative mt-16">
        <span className="inline-flex h-8 items-center gap-2 rounded-full border bg-background pr-3.5 pl-1.5 text-[12.5px] shadow-xs">
          <DocEyebrow>{eyebrow}</DocEyebrow>
          {meta}
        </span>
        <h1 className="mt-6 text-[54px] leading-[1.02] font-semibold tracking-[-0.035em]">{title}</h1>
        {lead && <p className="mt-5 max-w-[460px] text-[14.5px] leading-[1.65] text-foreground/75">{lead}</p>}
      </div>
      {figure && <div className="relative mt-10">{figure}</div>}
      {footer && (
        <div className="relative mt-auto flex justify-between border-t pt-3.5 text-[10.5px] text-muted-foreground">
          <span>{footer[0]}</span>
          <span>{footer[1]}</span>
        </div>
      )}
    </section>
  )
}

/** Portadilla de parte: página negra con el número, el título y sus capítulos. */
export function GuidePart({
  id,
  number,
  title,
  lead,
  chapters,
}: {
  id?: string
  number: React.ReactNode
  title: React.ReactNode
  lead?: React.ReactNode
  chapters?: { number: React.ReactNode; title: React.ReactNode }[]
}) {
  return (
    <section id={id} data-slot="guide-part" className={cn(fullPage, "bg-primary px-14 py-14 text-primary-foreground")}>
      <div className="text-[11px] font-semibold tracking-[0.16em] text-primary-foreground/50 uppercase">Parte</div>
      <div className="mt-3 text-[150px] leading-none font-semibold tracking-[-0.05em] text-primary-foreground tabular-nums">
        {number}
      </div>
      <h2 className="mt-10 max-w-[520px] text-[40px] leading-[1.05] font-semibold tracking-[-0.03em]">{title}</h2>
      {lead && <p className="mt-5 max-w-[460px] text-[14.5px] leading-[1.65] text-primary-foreground/65">{lead}</p>}
      {chapters && chapters.length > 0 && (
        <ol className="mt-auto flex flex-col gap-2.5 border-t border-primary-foreground/15 pt-6">
          {chapters.map((c, i) => (
            <li key={i} className="flex items-baseline gap-3 text-[13px]">
              <span className="w-8 flex-none font-semibold text-primary-foreground/55 tabular-nums">{c.number}</span>
              <span className="text-primary-foreground/85">{c.title}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

/**
 * Capítulo: empieza en página nueva. Lleva un marcador invisible (`⟦cap:id⟧`) que el script de exportación
 * busca en el texto del PDF para saber en qué página cae y escribirlo en el índice.
 */
export function GuideChapter({
  id,
  number,
  title,
  lead,
  minutes,
  className,
  children,
}: {
  id: string
  number: React.ReactNode
  title: React.ReactNode
  lead?: React.ReactNode
  /** Minutos de lectura, en la cabecera. */
  minutes?: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} data-slot="guide-chapter" className={cn("relative", className)}>
      <span aria-hidden className="absolute text-[1px] text-transparent select-none">{`⟦cap:${id}⟧`}</span>
      <header className="mb-7 flex flex-col gap-3 border-b pb-6">
        <div className="flex items-center gap-2.5">
          <DocNumber size="lg">{number}</DocNumber>
          {minutes !== undefined && <span className="text-[11.5px] text-muted-foreground">{minutes} min de lectura</span>}
        </div>
        <h2 className="text-[30px] leading-[1.1] font-semibold tracking-[-0.025em]">{title}</h2>
        {lead && <p className="max-w-[560px] text-[14px] leading-[1.65] text-foreground/75">{lead}</p>}
      </header>
      {children}
    </section>
  )
}

/** Títulos dentro de un capítulo. `h2` apartado, `h3` subapartado. */
export function GuideH2({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="guide-h2"
      className={cn("mt-8 mb-3 text-[18px] leading-[1.25] font-semibold tracking-[-0.015em] first:mt-0", className)}
      {...props}
    />
  )
}

export function GuideH3({ className, ...props }: React.ComponentProps<"h4">) {
  return <h4 data-slot="guide-h3" className={cn("mt-6 mb-2 text-[14px] font-semibold", className)} {...props} />
}

/** Texto corrido: párrafos, listas, tablas y énfasis con la tipografía de la guía. */
export function GuideProse({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="guide-prose"
      className={cn(
        "flex flex-col gap-3.5 text-[12.5px] leading-[1.65] text-foreground/85",
        "[&_strong]:font-semibold [&_strong]:text-foreground [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2",
        "[&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-5 [&_ul>li]:list-disc [&_ul>li]:marker:text-brand",
        "[&_ol]:flex [&_ol]:flex-col [&_ol]:gap-1.5 [&_ol]:pl-5 [&_ol>li]:list-decimal [&_ol>li]:marker:font-semibold [&_ol>li]:marker:text-brand",
        "[&_li>p]:inline",
        className
      )}
      {...props}
    />
  )
}

const calloutKinds = {
  consejo: { label: "Consejo", icon: LightbulbIcon, tone: "soft" },
  ojo: { label: "Ojo", icon: TriangleAlertIcon, tone: "warn" },
  ley: { label: "Lo que dice la norma", icon: ScaleIcon, tone: "dark" },
  dato: { label: "Dato", icon: BarChart3Icon, tone: "soft" },
  ejemplo: { label: "Ejemplo", icon: MessageSquareQuoteIcon, tone: "muted" },
  resumen: { label: "En un minuto", icon: BookOpenIcon, tone: "dark" },
} as const satisfies Record<string, { label: string; icon: LucideIcon; tone: "soft" | "warn" | "dark" | "muted" }>

export type GuideCalloutKind = keyof typeof calloutKinds

export function esTipoDeCaja(kind: string): kind is GuideCalloutKind {
  return kind in calloutKinds
}

/** Caja de un capítulo: consejo, ojo (aviso), ley, dato, ejemplo o resumen («En un minuto»). */
export function GuideCallout({
  kind,
  title,
  className,
  children,
}: {
  kind: GuideCalloutKind
  /** Sustituye a la etiqueta por defecto del tipo. */
  title?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const { label, icon: Icon, tone } = calloutKinds[kind]
  return (
    <aside
      data-slot="guide-callout"
      data-kind={kind}
      className={cn(
        "my-2 flex gap-4 rounded-xl px-5 py-4",
        tone === "soft" && "bg-brand-soft text-foreground",
        tone === "warn" && "border border-warning/40 bg-warning/10 text-foreground",
        tone === "dark" && "bg-primary text-primary-foreground",
        tone === "muted" && "border bg-muted/50 text-foreground",
        className
      )}
    >
      <Icon
        className={cn("mt-0.5 size-4 flex-none", tone === "dark" ? "text-primary-foreground/70" : "text-brand")}
        aria-hidden
      />
      <div className="flex min-w-0 flex-col gap-1.5">
        <div
          className={cn(
            "text-[10px] font-semibold tracking-[0.12em] uppercase",
            tone === "dark" ? "text-primary-foreground/60" : "text-brand"
          )}
        >
          {title ?? label}
        </div>
        <div
          className={cn(
            "flex flex-col gap-2 text-[12.5px] leading-[1.6] [&_strong]:font-semibold",
            tone === "dark"
              ? "text-primary-foreground/80 [&_strong]:text-primary-foreground [&_a]:text-primary-foreground"
              : "text-foreground/80 [&_strong]:text-foreground [&_a]:text-brand",
            "[&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1 [&_ul]:pl-4 [&_ul>li]:list-disc [&_ol]:flex [&_ol]:flex-col [&_ol]:gap-1 [&_ol]:pl-4 [&_ol>li]:list-decimal"
          )}
        >
          {children}
        </div>
      </div>
    </aside>
  )
}

/** Lista de comprobación: casillas vacías para que la lectora la use. */
export function GuideChecklist({
  title,
  items,
  className,
}: {
  title?: React.ReactNode
  items: React.ReactNode[]
  className?: string
}) {
  return (
    <div data-slot="guide-checklist" className={cn("my-2 overflow-hidden rounded-xl border bg-card shadow-xs", className)}>
      {title && (
        <div className="flex h-8 items-center border-b bg-muted/50 px-5 text-[10px] font-semibold tracking-[0.12em] text-brand uppercase">
          {title}
        </div>
      )}
      <ul className="divide-y">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 px-5 py-2.5 text-[12.5px] leading-[1.5]">
            <span className="mt-[3px] grid size-3.5 flex-none place-items-center rounded-[4px] border border-foreground/30" aria-hidden>
              <CheckIcon className="size-2.5 text-transparent" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Cifras destacadas en fila (tres o cuatro), con su fuente debajo. */
export function GuideStats({
  items,
  source,
  className,
}: {
  items: { value: React.ReactNode; label: React.ReactNode }[]
  source?: React.ReactNode
  className?: string
}) {
  return (
    <div data-slot="guide-stats" className={cn("my-2 flex flex-col gap-2", className)}>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border bg-card px-4 py-3.5 shadow-xs">
            <div className="text-[26px] leading-none font-semibold tracking-[-0.03em] tabular-nums">{item.value}</div>
            <div className="mt-1.5 text-[11.5px] leading-[1.4] text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>
      {source && <div className="text-[10.5px] text-muted-foreground">{source}</div>}
    </div>
  )
}

/** Figura de la guía: la pieza va dentro del marco; `caption` debajo. Sin romperse entre páginas. */
export function GuideFigure({
  caption,
  zoom = 1,
  frame = true,
  className,
  children,
}: {
  caption?: React.ReactNode
  zoom?: number
  frame?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <figure data-slot="guide-figure" className={cn("my-3 flex flex-col gap-2", className)}>
      <div className={cn(frame && "overflow-hidden rounded-xl border bg-background shadow-xs")}>
        <div style={zoom === 1 ? undefined : { zoom }}>{children}</div>
      </div>
      {caption && <figcaption className="text-[11px] leading-[1.5] text-muted-foreground">{caption}</figcaption>}
    </figure>
  )
}

export type GuideTocChapter = { id: string; number: React.ReactNode; title: React.ReactNode }
export type GuideTocPart = { number: React.ReactNode; title: React.ReactNode; chapters: GuideTocChapter[] }

/**
 * Índice por partes. Las páginas vienen de `pages` (lo escribe el script de exportación por el id del capítulo);
 * sin ellas, el índice sale sin numerar. Cada capítulo enlaza a su ancla.
 */
export function GuideToc({
  parts,
  pages,
  className,
}: {
  parts: GuideTocPart[]
  pages?: Record<string, number>
  className?: string
}) {
  return (
    <nav data-slot="guide-toc" className={cn("flex flex-col gap-5", className)}>
      {parts.map((part, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3 border-b pb-1.5">
            <span className="text-[11px] font-semibold text-brand tabular-nums">{part.number}</span>
            <span className="text-[13.5px] font-semibold">{part.title}</span>
          </div>
          <ol className="flex flex-col">
            {part.chapters.map((c) => {
              const page = pages?.[c.id]
              return (
                <li key={c.id}>
                  <a href={`#${c.id}`} className="flex h-[26px] items-center gap-3 text-[12.5px]">
                    <span className="w-9 flex-none text-muted-foreground tabular-nums">{c.number}</span>
                    <span className="min-w-0 flex-1 truncate">{c.title}</span>
                    <span className="flex-1 border-b border-dotted border-foreground/25" aria-hidden />
                    <span className="w-7 flex-none text-right font-semibold tabular-nums">{page ?? ""}</span>
                  </a>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </nav>
  )
}

/** Anexo de fuentes: lista numerada con nombre, quién lo publica y enlace. */
export function GuideSources({
  items,
  className,
}: {
  items: { title: React.ReactNode; by?: React.ReactNode; url?: string; note?: React.ReactNode }[]
  className?: string
}) {
  return (
    <ol data-slot="guide-sources" className={cn("flex flex-col divide-y rounded-xl border bg-card shadow-xs", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex gap-4 px-5 py-2.5 text-[11.5px] leading-[1.5]">
          <span className="w-6 flex-none font-semibold text-brand tabular-nums">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <span className="font-medium text-foreground">{item.title}</span>
            {item.by && <span className="text-muted-foreground"> · {item.by}</span>}
            {item.note && <span className="text-muted-foreground">. {item.note}</span>}
            {item.url && (
              <a href={item.url} className="block truncate text-brand">
                {item.url}
              </a>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}
