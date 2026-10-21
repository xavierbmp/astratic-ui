"use client"

import Image from "next/image"
import { cn } from "cn"
import type { Perfil } from "@/lib/influencer/modelo"
import { ThemeToggle } from "@/components/app/theme-toggle"
import { ThemeBody } from "@/components/influencer/theme-body"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { LogoAstratic, SelloAstratic } from "@/components/influencer/sello-astratic"

/**
 * Lo que ve la marca sin cuenta (revisar, rellenar el brief, firmar, ver resultados): cabecera con el
 * logotipo de Astratic, lo que es y para quién, y la influencer a la derecha; pie con la privacidad
 * del enlace y la firma de Astratic con su web. Limpia y pensada para el móvil. Al imprimir, la
 * cabecera y el pie se quedan (sin los botones): el PDF también lleva la marca.
 */
export function PaginaMarca({
  seccion,
  marca,
  perfil,
  pie,
  acciones,
  ancho = "normal",
  children,
}: {
  seccion: string
  marca: string
  /** Quién se la manda: la influencer o, en lo que manda Astratic (una propuesta de perfiles), Astratic. */
  perfil: Pick<Perfil, "nombre" | "fotoUrl">
  pie?: React.ReactNode
  /** Botones de la cabecera junto al tema (la bombilla de sugerencias, solo para la gente de Astratic). */
  acciones?: React.ReactNode
  ancho?: "normal" | "ancho"
  children: React.ReactNode
}) {
  return (
    <div className="theme-influencer min-h-screen bg-background text-foreground print:bg-transparent">
      <ThemeBody />
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur md:px-8 print:static print:bg-transparent print:px-0 print:backdrop-blur-none">
        <LogoAstratic className="text-[13px] sm:text-[15px]" />
        <span className="h-5 w-px flex-none bg-border" aria-hidden />
        <span className="min-w-0 truncate text-sm">
          <span className="font-semibold">{seccion}</span>
          <span className="hidden text-muted-foreground sm:inline"> · para {marca}</span>
        </span>
        <span className="ml-auto flex flex-none items-center gap-2 text-sm">
          {perfil.fotoUrl ? (
            <span className="relative size-7 overflow-hidden rounded-full bg-muted">
              <Image src={perfil.fotoUrl} alt="" fill sizes="28px" className="object-cover" />
            </span>
          ) : (
            <AvatarInitials name={perfil.nombre} size="sm" className="size-7 rounded-full" />
          )}
          <span className="hidden sm:inline">{perfil.nombre}</span>
          <span className="flex items-center gap-1 print:hidden">
            {acciones}
            <ThemeToggle />
          </span>
        </span>
      </header>
      <main className={cn("mx-auto flex flex-col gap-6 px-4 py-6 md:px-8 md:py-8 print:px-0", ancho === "ancho" ? "max-w-[1440px]" : "max-w-[1100px]")}>{children}</main>
      <footer className="flex flex-col items-center gap-2 px-4 pb-8 text-center text-xs text-muted-foreground">
        <p>{pie ?? `Enlace privado para ${marca}.`}</p>
        <SelloAstratic />
      </footer>
    </div>
  )
}
