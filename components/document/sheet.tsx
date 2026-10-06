import { Plus_Jakarta_Sans } from "next/font/google"
import { ArrowDownIcon, ArrowRightIcon } from "lucide-react"
import { cn } from "cn"

/* El logotipo usa la tipografía de la web de Astratic; el resto del documento, Geist. */
const logoFont = Plus_Jakarta_Sans({ subsets: ["latin"] })

/**
 * Lienzo de un documento A4 (propuestas, presupuestos, informes). En pantalla muestra las hojas sobre
 * fondo gris; al imprimir o exportar a PDF deja solo las hojas, una por página, sin márgenes.
 * Fuerza el tema claro: un PDF nunca sale en oscuro.
 */
export function DocViewer({
  pages,
  toolbar,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"main"> & {
  /** Total de hojas para el pie («04 / 13» o «1 / 2»). Sin él, el pie muestra solo la hoja actual. */
  pages?: number
  /** Barra superior de pantalla (`DocToolbar`); no se imprime. */
  toolbar?: React.ReactNode
}) {
  const vars = pages ? { "--doc-pages": `"${String(pages).padStart(2, "0")}"`, "--doc-pages-plain": `"${pages}"` } : {}
  return (
    <main
      data-slot="doc-viewer"
      style={{ ...vars, ...style } as React.CSSProperties}
      className={cn(
        "theme-light flex min-h-screen flex-col items-center bg-muted text-foreground print:block print:min-h-0 print:bg-transparent",
        className
      )}
      {...props}
    >
      {toolbar}
      <div className="flex flex-col items-center gap-8 px-4 py-10 print:block print:p-0">{children}</div>
    </main>
  )
}

/** Clases comunes de una hoja A4: tamaño, recorte, escala en móvil y salto de página al imprimir. */
export const sheetBase =
  "relative flex h-[297mm] w-[210mm] flex-none flex-col overflow-hidden bg-background shadow-pop *:flex-none max-[860px]:[zoom:0.62] max-[540px]:[zoom:0.44] print:break-after-page print:[zoom:1]"

/** Hoja A4 de la propuesta elaborada. Márgenes de 56 px y pie con logo, título, sección y numeración. */
export function DocSheet({
  id,
  title,
  section,
  footer = true,
  className,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  /** Texto izquierdo del pie, normalmente «Propuesta X · Mes año». */
  title?: React.ReactNode
  /** Sección a la que pertenece la hoja, a la derecha del pie. */
  section?: React.ReactNode
  footer?: boolean
}) {
  return (
    <section
      id={id}
      data-slot="doc-sheet"
      className={cn(sheetBase, "px-14 pt-14 text-[13px] leading-normal", footer && "pb-[92px]", className)}
      {...props}
    >
      {children}
      {footer && <DocFooter title={title} section={section} />}
    </section>
  )
}

export function DocFooter({ title, section }: { title?: React.ReactNode; section?: React.ReactNode }) {
  return (
    <footer
      data-slot="doc-footer"
      className="absolute inset-x-14 bottom-9 flex items-center justify-between gap-4 border-t pt-3.5 text-[10.5px] text-muted-foreground"
    >
      <div className="flex min-w-0 items-center gap-2">
        <DocLogo className="text-[9px]" devs={false} />
        {title && (
          <>
            <span aria-hidden>·</span>
            <span className="truncate">{title}</span>
          </>
        )}
      </div>
      <div className="flex flex-none items-center gap-2">
        {section && (
          <>
            <span>{section}</span>
            <span aria-hidden>·</span>
          </>
        )}
        <DocPageNumber className="font-medium text-foreground" />
      </div>
    </footer>
  )
}

/** Numeración automática de la hoja («04 / 14»; `plain`: «1 / 2»). Necesita `pages` en `DocViewer`. */
export function DocPageNumber({ plain = false, className }: { plain?: boolean; className?: string }) {
  return (
    <span
      data-slot="doc-page-number"
      data-format={plain ? "plain" : undefined}
      className={cn("tabular-nums", className)}
    />
  )
}

/** Logotipo de Astratic Network. El tamaño se controla con el `font-size` (`text-[15px]`). */
export function DocLogo({ devs = true, className }: { devs?: boolean; className?: string }) {
  return (
    <span
      data-slot="doc-logo"
      aria-label="Astratic Network Devs"
      className={cn(logoFont.className, "inline-flex w-fit flex-none flex-col leading-none text-foreground", className)}
    >
      <span className="flex items-center gap-[0.28em]">
        <span className="font-extrabold tracking-[-0.03em]">Astratic</span>
        <span className="inline-block -skew-x-14 rounded-[0.65em] bg-foreground px-[0.47em] pt-[0.12em] pb-[0.18em]">
          <span className="inline-block skew-x-14 text-[0.91em] font-extrabold tracking-[-0.02em] text-background">
            Network
          </span>
        </span>
      </span>
      {devs && (
        <span className="mt-[0.24em] self-end pr-[0.12em] text-[0.44em] font-bold tracking-[0.46em] text-foreground/50 uppercase">
          Devs
        </span>
      )}
    </span>
  )
}

/** Banda a sangre dentro de una hoja: fondo gris para mockups y figuras. */
export function DocBand({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="doc-band"
      className={cn("-mx-14 border-y bg-muted/60 px-14 py-7", className)}
      {...props}
    />
  )
}

/**
 * Marco de figura: captura o mockup compuesto con el kit, escalado con `zoom`.
 * `inset` añade el marco blanco con filo de la portada.
 */
export function DocFigure({
  zoom = 0.62,
  frame = "default",
  caption,
  className,
  children,
  ...props
}: React.ComponentProps<"figure"> & { zoom?: number; frame?: "default" | "inset"; caption?: React.ReactNode }) {
  return (
    <figure data-slot="doc-figure" className={cn("flex flex-col gap-2", className)} {...props}>
      {frame === "inset" ? (
        <div className="rounded-[14px] border bg-background p-[5px] shadow-pop">
          <div className="overflow-hidden rounded-[9px] border">
            <div style={{ zoom }}>{children}</div>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-background shadow-pop">
          <div style={{ zoom }}>{children}</div>
        </div>
      )}
      {caption && <figcaption className="text-[11px] text-muted-foreground">{caption}</figcaption>}
    </figure>
  )
}

/** Retícula tenue de fondo, desvanecida alrededor del titular (portadas). */
export function DocBackdrop({ className }: { className?: string }) {
  const mask = "radial-gradient(ellipse 80% 42% at 60% 22%, black 30%, transparent 80%)"
  return (
    <div
      aria-hidden
      data-slot="doc-backdrop"
      className={cn("pointer-events-none absolute inset-x-0 top-0 h-[760px] opacity-80", className)}
      style={{
        backgroundImage:
          "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        backgroundPosition: "-1px -1px",
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    />
  )
}

/* ─── Portada de la propuesta elaborada ────────────────────────────────── */

/** Enlace de portada. `primary` es la pastilla negra con flecha; `secondary`, texto en acento. */
export function DocAction({
  href,
  variant = "primary",
  children,
}: {
  href: string
  variant?: "primary" | "secondary"
  children: React.ReactNode
}) {
  if (variant === "secondary") {
    return (
      <a href={href} className="inline-flex h-10 items-center gap-1.5 px-2 text-[14px] font-medium text-brand">
        {children}
        <ArrowDownIcon className="size-4" aria-hidden />
      </a>
    )
  }
  return (
    <a
      href={href}
      className="inline-flex h-10 items-center gap-3 rounded-full bg-primary pr-1.5 pl-5 text-[14px] font-medium text-primary-foreground"
    >
      {children}
      <span className="grid size-7 place-items-center rounded-full bg-primary-foreground text-primary">
        <ArrowRightIcon className="size-3.5" aria-hidden />
      </span>
    </a>
  )
}

/**
 * Portada: cliente y logo arriba, etiqueta, título en una línea, entradilla, enlaces, mockup a todo el ancho,
 * bloques del documento y pie. Toma la maqueta de la propuesta Twic.
 */
export function DocCover({
  id = "portada",
  client,
  eyebrow = "Propuesta",
  meta,
  title,
  lead,
  actions,
  figure,
  footer,
  children,
}: {
  id?: string
  /** Marca del cliente arriba a la izquierda. */
  client: React.ReactNode
  eyebrow?: React.ReactNode
  /** Texto de la pastilla junto a la etiqueta («Portal a medida · Septiembre 2026»). */
  meta?: React.ReactNode
  title: React.ReactNode
  lead?: React.ReactNode
  actions?: React.ReactNode
  /** Mockup principal; se pinta con `DocFigure frame="inset"`. */
  figure?: React.ReactNode
  /** Pie: izquierda y derecha. */
  footer?: [React.ReactNode, React.ReactNode]
  /** Contenido al pie de la portada, normalmente `DocBlockChips`. */
  children?: React.ReactNode
}) {
  return (
    <section id={id} data-slot="doc-sheet" className={cn(sheetBase, "px-14 pt-11 pb-10 text-[13px] leading-normal")}>
      <DocBackdrop />
      <div className="relative flex h-11 items-center justify-between">
        {client}
        <DocLogo className="text-[17px]" />
      </div>

      <div className="relative mt-12">
        {meta !== undefined && (
          <span className="inline-flex h-8 items-center gap-2 rounded-full border bg-background pr-3.5 pl-1.5 text-[12.5px] shadow-xs">
            <span className="inline-flex h-5 items-center rounded-full bg-brand-soft px-2.5 text-[10px] font-semibold tracking-[0.12em] text-brand uppercase">
              {eyebrow}
            </span>
            {meta}
          </span>
        )}
        <h1 className="mt-5 text-[50px] leading-[1.05] font-semibold tracking-[-0.035em] whitespace-nowrap">{title}</h1>
        {lead && <p className="mt-4 max-w-[440px] text-[14px] leading-[1.65] text-foreground/75">{lead}</p>}
        {actions && <div className="mt-6 flex items-center gap-3">{actions}</div>}
      </div>

      {figure && (
        <div className="relative mt-10">
          <div
            aria-hidden
            className="absolute inset-x-[12%] -bottom-8 h-24 rounded-full bg-brand-soft blur-2xl print:hidden"
          />
          <div className="relative">{figure}</div>
        </div>
      )}

      {children && <div className="relative mt-auto pt-8">{children}</div>}

      {footer && (
        <div
          className={cn(
            "relative flex justify-between border-t pt-3.5 text-[10.5px] text-muted-foreground",
            children ? "mt-8" : "mt-auto"
          )}
        >
          <span>{footer[0]}</span>
          <span>{footer[1]}</span>
        </div>
      )}
    </section>
  )
}

/** Fila de bloques de la portada: número, nombre y dato (precio), con enlace a su hoja. */
export function DocBlockChips({
  label,
  items,
  className,
}: {
  label?: React.ReactNode
  items: { number: React.ReactNode; title: React.ReactNode; meta?: React.ReactNode; href?: string }[]
  className?: string
}) {
  return (
    <div data-slot="doc-block-chips" className={className}>
      {label && <div className="mb-2.5 text-[10px] font-semibold tracking-[0.14em] text-brand uppercase">{label}</div>}
      <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item, i) => {
          const body = (
            <>
              <span className="grid size-7 flex-none place-items-center rounded-md bg-brand-soft text-[12px] font-semibold text-brand tabular-nums">
                {item.number}
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] leading-tight font-semibold">{item.title}</span>
                {item.meta && <span className="mt-0.5 block text-[12px] text-muted-foreground tabular-nums">{item.meta}</span>}
              </span>
            </>
          )
          const cls = "flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5 shadow-xs"
          return item.href ? (
            <a key={i} href={item.href} className={cls}>
              {body}
            </a>
          ) : (
            <div key={i} className={cls}>
              {body}
            </div>
          )
        })}
      </div>
    </div>
  )
}
