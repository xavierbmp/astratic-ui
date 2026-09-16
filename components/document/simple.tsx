import type { LucideIcon } from "lucide-react"
import { TriangleAlertIcon } from "lucide-react"
import { cn } from "cn"
import { DocLogo, DocPageNumber, sheetBase } from "@/components/document/sheet"

/*
 * Propuesta simple: servicios, webs, SEO, mensualidades y presupuestos cortos. Una o dos hojas sin portada,
 * texto a 12 px, tablas con línea negra bajo la cabecera y sin más color que los badges de estado.
 */

/** Hoja A4 de la propuesta simple: logo arriba en cada hoja, márgenes de 58 px y pie con título y «1 / 2». */
export function DocSimpleSheet({
  id,
  footer,
  className,
  children,
}: {
  id?: string
  /** Texto izquierdo del pie («Visibilidad en Google · Cliente y Astratic Network Devs»). */
  footer?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      data-slot="doc-sheet"
      className={cn(sheetBase, "px-[58px] pt-11 pb-[70px] text-[12px] leading-[1.65]", className)}
    >
      <header>
        <DocLogo className="text-[17px]" />
      </header>
      {children}
      <footer
        data-slot="doc-footer"
        className="absolute inset-x-[58px] bottom-[30px] flex justify-between gap-4 border-t pt-[9px] text-[10px] text-muted-foreground"
      >
        <span className="truncate">{footer}</span>
        <DocPageNumber plain className="font-mono" />
      </footer>
    </section>
  )
}

/** Título de la propuesta y entradilla, bajo el logo de la primera hoja. */
export function DocSimpleTitle({ title, children }: { title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div data-slot="doc-simple-title" className="mt-[38px]">
      <h1 className="text-[28px] leading-[1.15] font-semibold tracking-[-0.02em]">{title}</h1>
      {children && <p className="mt-2 max-w-[560px] text-[13.5px] leading-[1.6] text-muted-foreground">{children}</p>}
    </div>
  )
}

/** Cifras clave en una fila (cuota, alcance, plazo). De 2 a 4. */
export function DocKeyFacts({ items, className }: { items: { label: React.ReactNode; value: React.ReactNode }[]; className?: string }) {
  return (
    <dl data-slot="doc-key-facts" className={cn("mt-[18px] flex border-y", className)}>
      {items.map((item, i) => (
        <div key={i} className="mr-[26px] border-r py-[11px] pr-[26px] last:mr-0 last:border-r-0">
          <dt className="text-[11px] text-muted-foreground">{item.label}</dt>
          <dd className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em] tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Apartado con título; dentro van párrafos (`DocText`), tablas o listas. */
export function DocSimpleSection({
  title,
  className,
  children,
}: {
  title: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section data-slot="doc-simple-section" className={cn("mt-[26px]", className)}>
      <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
      {children}
    </section>
  )
}

export function DocText({ muted = false, className, ...props }: React.ComponentProps<"p"> & { muted?: boolean }) {
  return (
    <p
      className={cn("mt-[7px] max-w-[620px] text-[12px] leading-[1.65]", muted && "text-muted-foreground", className)}
      {...props}
    />
  )
}

export type DocTableColumn = { label: React.ReactNode; className?: string }

/** Tabla de lectura: cabecera gris con línea negra y filas con filo gris. `className` de columna se aplica a sus celdas. */
export function DocTable({ columns, rows, className }: { columns: DocTableColumn[]; rows: React.ReactNode[][]; className?: string }) {
  return (
    <table data-slot="doc-table" className={cn("mt-2.5 w-full border-collapse", className)}>
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th
              key={i}
              className={cn(
                "border-b border-foreground pr-3 pb-1.5 text-left text-[11px] font-medium text-muted-foreground",
                col.className
              )}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className={cn("border-b py-2 pr-3 align-top text-[11.5px] leading-[1.55]", columns[j]?.className)}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Primera celda de un plan: momento en negrita y badge de fase debajo. */
export function DocCellTitle({ badge, children }: { badge?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-semibold whitespace-nowrap">{children}</div>
      {badge && <div className="mt-1">{badge}</div>}
    </div>
  )
}

/** Celda con varias líneas que empiezan en negrita («**Web.** Mejorar…»). */
export function DocCellLines({ items }: { items: { lead: React.ReactNode; text: React.ReactNode }[] }) {
  return (
    <div className="flex flex-col gap-[5px]">
      {items.map((item, i) => (
        <div key={i}>
          <b className="font-semibold">{item.lead}.</b> {item.text}
        </div>
      ))}
    </div>
  )
}

/** Condiciones en pares etiqueta y valor. */
export function DocTerms({ items, className }: { items: { label: React.ReactNode; value: React.ReactNode }[]; className?: string }) {
  return (
    <dl data-slot="doc-terms" className={cn("mt-2.5 grid grid-cols-[120px_1fr] border-t border-foreground", className)}>
      {items.map((item, i) => (
        <div key={i} className="col-span-2 grid grid-cols-subgrid">
          <dt className="border-b py-2 text-[11.5px] leading-[1.55] text-muted-foreground">{item.label}</dt>
          <dd className="border-b py-2 text-[11.5px] leading-[1.55] font-medium">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** Aviso con icono en una caja con borde (lo que no se puede garantizar, dependencias del plazo). */
export function DocNotice({
  icon: Icon = TriangleAlertIcon,
  tone = "warning",
  className,
  children,
}: {
  icon?: LucideIcon
  tone?: "warning" | "info" | "success"
  className?: string
  children: React.ReactNode
}) {
  return (
    <div data-slot="doc-notice" className={cn("mt-3.5 flex gap-2.5 rounded-[10px] border px-3.5 py-[11px]", className)}>
      <Icon
        aria-hidden
        className={cn(
          "mt-px size-4 flex-none",
          tone === "warning" && "text-warning",
          tone === "info" && "text-info",
          tone === "success" && "text-success"
        )}
      />
      <p className="text-[12px] leading-[1.65]">{children}</p>
    </div>
  )
}

/** Lista de filas con un estado opcional a la derecha («Qué necesito»). */
export function DocList({ items, className }: { items: { label: React.ReactNode; status?: React.ReactNode }[]; className?: string }) {
  return (
    <ul data-slot="doc-list" className={cn("mt-2.5 border-t border-foreground", className)}>
      {items.map((item, i) => (
        <li key={i} className="flex items-center justify-between gap-4 border-b py-2 text-[11.5px] leading-[1.55]">
          <span>{item.label}</span>
          {item.status}
        </li>
      ))}
    </ul>
  )
}

/** Conformidad: una columna por parte con caja de firma, nombre y fecha. `signer` rellena el nombre. */
export function DocSignOff({
  parties,
  className,
}: {
  parties: { name: React.ReactNode; detail?: React.ReactNode; signer?: React.ReactNode }[]
  className?: string
}) {
  return (
    <div data-slot="doc-sign-off" className={cn("mt-3.5 grid grid-cols-2 gap-10", className)}>
      {parties.map((party, i) => (
        <div key={i}>
          <div className="text-[12px] font-semibold">
            {party.name}
            {party.detail && <small className="mt-px block text-[11px] font-normal text-muted-foreground">{party.detail}</small>}
          </div>
          <div className="h-16 border-b border-foreground" />
          <div className="mt-[5px] text-[10.5px] text-muted-foreground">Firma</div>
          <SignField label="Nombre" value={party.signer} />
          <SignField label="Fecha" />
        </div>
      ))}
    </div>
  )
}

function SignField({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="mt-3.5 flex items-end gap-2 text-[10.5px] text-muted-foreground">
      {label}
      {value ? (
        <span className="flex-1 border-b pb-px text-[11.5px] text-foreground">{value}</span>
      ) : (
        <span className="h-3.5 flex-1 border-b" />
      )}
    </div>
  )
}
