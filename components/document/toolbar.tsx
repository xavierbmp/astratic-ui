"use client"

import Link from "next/link"
import { ArrowLeftIcon, PrinterIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Barra de pantalla del visor: volver, título del documento y exportar a PDF. No se imprime. */
export function DocToolbar({ title, meta, backHref = "/" }: { title: React.ReactNode; meta?: React.ReactNode; backHref?: string }) {
  return (
    <div className="sticky top-0 z-10 flex h-12 w-full items-center gap-3 border-b bg-background/90 px-4 backdrop-blur print:hidden">
      <Button variant="ghost" size="icon-sm" asChild>
        <Link href={backHref} aria-label="Volver">
          <ArrowLeftIcon />
        </Link>
      </Button>
      <div className="flex min-w-0 items-baseline gap-2">
        <span className="truncate text-sm font-semibold">{title}</span>
        {meta && <span className="hidden truncate text-xs text-muted-foreground sm:inline">{meta}</span>}
      </div>
      <Button className="ml-auto" onClick={() => window.print()}>
        <PrinterIcon />
        Exportar PDF
      </Button>
    </div>
  )
}
