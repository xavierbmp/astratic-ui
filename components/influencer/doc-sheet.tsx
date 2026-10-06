import { cn } from "cn"
import { DocPageNumber, sheetBase } from "@/components/document/sheet"

/**
 * Hoja A4 de los documentos de la influencer (media kit, presupuesto): su nombre arriba en vez del
 * logo de Astratic, que va como sello al pie. Mismos márgenes y pie que la propuesta simple del madre.
 */
export function DocInfluencerSheet({ nombre, handle, footer, className, children }: { nombre: string; handle: string; footer?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section data-slot="doc-sheet" className={cn(sheetBase, "px-[58px] pt-11 pb-[70px] text-[12px] leading-[1.65]", className)}>
      <header className="flex items-baseline justify-between gap-4">
        <span className="text-[15px] font-semibold tracking-[-0.01em]">
          {nombre} <span className="font-normal text-muted-foreground">{handle}</span>
        </span>
        <span className="rounded-md border px-1.5 py-px text-[10px] font-medium tracking-wide text-muted-foreground uppercase">Red Astratic</span>
      </header>
      {children}
      <footer data-slot="doc-footer" className="absolute inset-x-[58px] bottom-[30px] flex justify-between gap-4 border-t pt-[9px] text-[10px] text-muted-foreground">
        <span className="truncate">{footer}</span>
        <DocPageNumber plain className="font-mono" />
      </footer>
    </section>
  )
}
