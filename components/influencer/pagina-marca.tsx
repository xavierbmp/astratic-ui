"use client"

import Image from "next/image"
import { cn } from "cn"
import type { Perfil } from "@/lib/influencer/modelo"
import { ThemeToggle } from "@/components/app/theme-toggle"
import { ThemeBody } from "@/components/influencer/theme-body"

/**
 * Lo que ve la marca sin cuenta (revisar, rellenar el brief, firmar, ver resultados): cabecera con
 * lo que es y para quién, la influencer delante y Astratic discreto, y un pie con la privacidad del
 * enlace. Limpia y pensada para el móvil.
 */
export function PaginaMarca({ seccion, marca, perfil, pie, ancho = "normal", children }: { seccion: string; marca: string; perfil: Perfil; pie?: React.ReactNode; ancho?: "normal" | "ancho"; children: React.ReactNode }) {
  return (
    <div className="theme-influencer min-h-screen bg-background text-foreground print:bg-transparent">
      <ThemeBody />
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur md:px-8 print:hidden">
        <span className="grid size-7 flex-none place-items-center rounded-lg bg-foreground text-xs font-semibold text-background" aria-hidden>
          A
        </span>
        <span className="min-w-0 truncate text-sm">
          <span className="font-semibold">{seccion}</span>
          <span className="hidden text-muted-foreground sm:inline"> · para {marca}</span>
        </span>
        <span className="ml-auto flex flex-none items-center gap-2 text-sm">
          <span className="relative size-7 overflow-hidden rounded-full bg-muted">
            <Image src={perfil.fotoUrl} alt="" fill sizes="28px" className="object-cover" />
          </span>
          <span className="hidden sm:inline">{perfil.nombre}</span>
          <ThemeToggle />
        </span>
      </header>
      <main className={cn("mx-auto flex flex-col gap-6 px-4 py-6 md:px-8 md:py-8", ancho === "ancho" ? "max-w-[1440px]" : "max-w-[1100px]")}>{children}</main>
      <footer className="px-4 pb-8 text-center text-xs text-muted-foreground print:hidden">{pie ?? `Enlace privado para ${marca}, sin cuenta. Gestionado con Astratic Network.`}</footer>
    </div>
  )
}
