import Link from "next/link"
import { ArrowRightIcon, CheckIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { CodeBlock } from "@/components/docs/code-block"
import { DocToc } from "@/components/docs/doc-toc"

export function DocPage({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string
  title: string
  lead?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-12 px-[34px] pt-[26px] pb-24">
      <article className="min-w-0 max-w-4xl flex-1">
        <header className="mb-10">
          {eyebrow && <p className="mb-2 text-xs font-medium text-muted-foreground">{eyebrow}</p>}
          <h1 className="text-[27px] leading-tight font-semibold tracking-tight">{title}</h1>
          {lead && <p className="mt-3 max-w-2xl text-base text-muted-foreground">{lead}</p>}
        </header>
        <div className="flex flex-col gap-12">{children}</div>
      </article>
      <aside className="hidden w-48 flex-none pt-20 xl:block">
        <DocToc />
      </aside>
    </div>
  )
}

export function DocSection({
  id,
  title,
  lead,
  children,
}: {
  id: string
  title: string
  lead?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-16">
      <h2 className="text-lg font-semibold tracking-tight">
        <a href={`#${id}`} className="hover:underline">
          {title}
        </a>
      </h2>
      {lead && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{lead}</p>}
      {children && <div className="mt-5 flex flex-col gap-5">{children}</div>}
    </section>
  )
}

export function Prose({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "max-w-2xl text-sm leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_a]:text-brand [&_a]:underline-offset-2 [&_a:hover]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1",
        className
      )}
      {...props}
    />
  )
}

export function Example({
  title,
  description,
  code,
  lang,
  children,
  className,
  padded = true,
}: {
  title?: string
  description?: React.ReactNode
  code?: string
  lang?: string
  children: React.ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <figure className="flex flex-col gap-2">
      {(title || description) && (
        <figcaption>
          {title && <p className="text-sm font-medium">{title}</p>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </figcaption>
      )}
      <div className={cn("overflow-hidden rounded-lg border bg-background", padded && "p-6", className)}>{children}</div>
      {code && <CodeBlock code={code} lang={lang} />}
    </figure>
  )
}

export function Rules({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex max-w-2xl flex-col gap-2 text-sm">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-1.5 size-1.5 flex-none rounded-full bg-foreground/70" />
          <span className="leading-relaxed">{it}</span>
        </li>
      ))}
    </ul>
  )
}

export function DoDont({ dos, donts }: { dos: React.ReactNode[]; donts: React.ReactNode[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border p-4">
        <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-success">
          <CheckIcon className="size-3.5" /> Sí
        </p>
        <ul className="flex flex-col gap-1.5 text-sm">
          {dos.map((d, i) => (
            <li key={i} className="leading-relaxed">{d}</li>
          ))}
        </ul>
      </div>
      <div className="rounded-lg border p-4">
        <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-danger">
          <XIcon className="size-3.5" /> No
        </p>
        <ul className="flex flex-col gap-1.5 text-sm">
          {donts.map((d, i) => (
            <li key={i} className="leading-relaxed">{d}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function SpecTable({
  columns,
  rows,
}: {
  columns: string[]
  rows: React.ReactNode[][]
}) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
          <tr>
            {columns.map((c) => (
              <th key={c} className="px-3 py-2 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td key={j} className={cn("px-3 py-2 align-top", j === 0 && "font-medium whitespace-nowrap")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Swatch({ name, token, note }: { name: string; token: string; note?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-2.5">
      <span className="size-9 flex-none rounded-md border" style={{ background: `var(${token})` }} />
      <div className="grid min-w-0 leading-tight">
        <span className="truncate text-sm font-medium">{name}</span>
        <span className="truncate font-mono text-[11px] text-muted-foreground">{token}</span>
        {note && <span className="truncate text-xs text-muted-foreground">{note}</span>}
      </div>
    </div>
  )
}

export function NextLinks({ links }: { links: { href: string; label: string; text?: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="group flex items-center justify-between gap-3 rounded-lg border p-3.5 transition-colors hover:bg-muted/40">
          <span className="grid leading-tight">
            <span className="text-sm font-medium">{l.label}</span>
            {l.text && <span className="text-xs text-muted-foreground">{l.text}</span>}
          </span>
          <ArrowRightIcon className="size-4 flex-none text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  )
}
