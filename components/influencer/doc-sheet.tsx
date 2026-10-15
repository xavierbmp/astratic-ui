import { cn } from "cn"
import { DocLogo, DocPageNumber, sheetBase } from "@/components/document/sheet"
import { ASTRATIC_URL } from "@/lib/influencer/astratic"

/**
 * Hoja A4 de los documentos de la influencer (media kit, presupuesto): su nombre arriba a la izquierda
 * y el logotipo de Astratic a la derecha, y al pie su web junto al número de hoja. Mismos márgenes y
 * pie que la propuesta simple del madre.
 */
export function DocInfluencerSheet({ nombre, handle, footer, className, children }: { nombre: string; handle: string; footer?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section data-slot="doc-sheet" className={cn(sheetBase, "px-[58px] pt-11 pb-[70px] text-[12px] leading-[1.65]", className)}>
      <header className="flex items-baseline justify-between gap-4">
        <span className="text-[15px] font-semibold tracking-[-0.01em]">
          {nombre} <span className="font-normal text-muted-foreground">{handle}</span>
        </span>
        <DocLogo devs={false} className="text-[12px]" />
      </header>
      {children}
      <footer data-slot="doc-footer" className="absolute inset-x-[58px] bottom-[30px] flex justify-between gap-4 border-t pt-[9px] text-[10px] text-muted-foreground">
        <span className="truncate">{footer}</span>
        <span className="flex flex-none items-baseline gap-3">
          <a href={ASTRATIC_URL} className="hover:text-foreground">
            astraticnetwork.com
          </a>
          <DocPageNumber plain className="font-mono" />
        </span>
      </footer>
    </section>
  )
}
