import { cn } from "cn"
import { DocLogo } from "@/components/document/sheet"
import { ASTRATIC_URL } from "@/lib/influencer/astratic"

/**
 * El logotipo de Astratic como enlace a su web, para las cabeceras de lo que ve la marca. Sin referrer:
 * la dirección de esas páginas lleva el token del enlace.
 */
export function LogoAstratic({ className }: { className?: string }) {
  return (
    <a href={ASTRATIC_URL} target="_blank" rel="noopener noreferrer" aria-label="Astratic Network" className="flex-none rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <DocLogo devs={false} className={cn("text-[15px]", className)} />
    </a>
  )
}

/** La firma al pie de lo que ve la marca: «Gestionado con» y el logotipo, que lleva a la web de Astratic. */
export function SelloAstratic({ className }: { className?: string }) {
  return (
    <a
      href={ASTRATIC_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex items-center gap-1.5 rounded-md text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50", className)}
    >
      Gestionado con <DocLogo devs={false} className="text-[12px]" />
    </a>
  )
}
