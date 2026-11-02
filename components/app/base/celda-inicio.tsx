"use client"

import * as React from "react"
import Image from "next/image"
import { GlobeIcon, MailIcon, PhoneIcon } from "lucide-react"
import { cn } from "cn"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { SocialIcon, socialLabel, type RedConIcono } from "@/components/app/social-icons"
import { cifraCompacta, type EnlaceInicio, type InicioRegistro, type RedInicio } from "@/lib/base/campos"

const OTROS: Partial<Record<RedInicio, { icono: React.ComponentType<{ className?: string }>; label: string }>> = {
  web: { icono: GlobeIcon, label: "Web" },
  email: { icono: MailIcon, label: "Email" },
  telefono: { icono: PhoneIcon, label: "Teléfono" },
}

/** El logo real de una red, o el icono de la web, el email o el teléfono. */
export function LogoEnlace({ red, className }: { red: RedInicio; className?: string }) {
  const otro = OTROS[red]
  if (otro) return <otro.icono className={cn("size-3 flex-none", className)} />
  return <SocialIcon network={red as RedConIcono} className={cn("size-3 flex-none", className)} />
}

const nombreDeRed = (red: RedInicio) => OTROS[red]?.label ?? socialLabel[red as RedConIcono]

/** Un enlace de un registro: su logo y su cifra. Se abre fuera, sin abrir el registro. */
export function EnlaceRegistro({ enlace, className, logoClassName, sinCifra }: { enlace: EnlaceInicio; className?: string; logoClassName?: string; sinCifra?: boolean }) {
  const cifra = !sinCifra && enlace.cifra != null ? cifraCompacta(enlace.cifra) : null
  const nombre = enlace.titulo ?? nombreDeRed(enlace.red)
  return (
    <a
      href={enlace.href}
      target={enlace.href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      title={cifra ? `${nombre}: ${cifra}` : nombre}
      aria-label={cifra ? `${nombre}: ${cifra}` : nombre}
      data-enlace-registro
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className={cn("inline-flex flex-none items-center gap-1 rounded-sm text-muted-foreground tabular-nums outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50", className)}
    >
      <LogoEnlace red={enlace.red} className={logoClassName} />
      {cifra}
    </a>
  )
}

/** La foto o el logo de un registro; sin imagen, sus iniciales. Una persona en círculo, una entidad en cuadrado. */
export function FotoRegistro({ inicio, px = 30, className }: { inicio: Pick<InicioRegistro, "nombre" | "imagen" | "forma">; px?: number; className?: string }) {
  const redonda = inicio.forma !== "entidad"
  const forma = redonda ? "rounded-full" : "rounded-[28%]"
  if (inicio.imagen)
    return (
      <span className={cn("relative block flex-none overflow-hidden bg-muted", forma, className)} style={{ width: px, height: px }}>
        <Image src={inicio.imagen} alt="" fill sizes={`${px}px`} unoptimized className="object-cover" />
      </span>
    )
  return <AvatarInitials name={inicio.nombre || "?"} variant={redonda ? "person" : "entity"} className={cn(forma, className)} style={{ width: px, height: px, fontSize: Math.max(10, Math.round(px * 0.36)) }} />
}

/**
 * La celda de inicio de un registro, la primera de su base y casi del alto de una celda normal. Arriba, su nombre y lo
 * que le sigue («@usuario»); debajo, sus logos reales con sus cifras. Pulsarla abre la página del registro; pulsar un logo
 * abre ese enlace. No se edita aquí: todo lo que enseña se cambia en la página del registro.
 */
export function CeldaInicio({ inicio, onAbrir, foto = true }: { inicio: InicioRegistro; onAbrir?: () => void; foto?: boolean }) {
  const enlaces = inicio.enlaces ?? []
  return (
    <div
      data-abre-registro
      role={onAbrir ? "link" : undefined}
      tabIndex={onAbrir ? -1 : undefined}
      onClick={onAbrir}
      className={cn("group/inicio flex min-w-0 flex-1 items-center gap-2.5", onAbrir && "cursor-pointer")}
    >
      {foto && <FotoRegistro inicio={inicio} />}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex min-w-0 items-baseline gap-1.5 leading-4">
          <span className={cn("min-w-0 truncate text-[13px] font-medium text-foreground", onAbrir && "group-hover/inicio:underline group-hover/inicio:underline-offset-2")}>{inicio.nombre || "Sin nombre"}</span>
          {inicio.secundario && <span className="min-w-0 flex-[0_100_auto] truncate text-xs text-muted-foreground">{inicio.secundario}</span>}
        </span>
        {enlaces.length > 0 ? (
          <span className="flex min-w-0 items-center gap-2 overflow-hidden text-[11px] leading-[14px]">
            {enlaces.map((e) => (
              <EnlaceRegistro key={`${e.red}-${e.href}`} enlace={e} />
            ))}
          </span>
        ) : (
          inicio.detalle && <span className="truncate text-[11px] leading-[14px] text-muted-foreground">{inicio.detalle}</span>
        )}
      </span>
    </div>
  )
}
