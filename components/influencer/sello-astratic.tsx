import { ArrowUpRightIcon } from "lucide-react"
import { cn } from "cn"
import { DocLogo } from "@/components/document/sheet"
import { ASTRATIC_DEVS_URL, ASTRATIC_URL } from "@/lib/influencer/astratic"

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

/**
 * La invitación de Astratic Network Devs en lo que ve la marca (al compartir o descargar): un recuadro
 * discreto que lleva a su web. Pasa sus props al enlace, así que sirve de `DropdownMenuItem asChild`
 * (con `className="flex-col items-stretch gap-0 rounded-xl p-3"` en el item, que si no lo pone en fila).
 */
export function InvitacionDevs({ className, ...props }: React.ComponentProps<"a">) {
  return (
    <a
      href={ASTRATIC_DEVS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("group flex flex-col items-stretch rounded-xl bg-muted/60 p-3 text-left transition-colors outline-none hover:bg-muted focus-visible:bg-muted", className)}
      {...props}
    >
      <DocLogo devs={false} className="self-start text-[11px]" />
      <span className="mt-3 block text-sm font-medium text-foreground">Este flujo, en vuestra empresa</span>
      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
        En Astratic Network Devs hacemos portales a medida como este, con vuestra marca y vuestra forma de trabajar con los clientes.
      </span>
      <span className="mt-2 inline-flex items-center gap-1 self-start text-xs font-medium text-foreground">
        Ver cómo trabajamos
        <ArrowUpRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
      </span>
    </a>
  )
}
