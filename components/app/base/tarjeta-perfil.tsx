"use client"

import * as React from "react"
import Image from "next/image"
import { cn } from "cn"
import { EnlaceRegistro, FotoRegistro } from "@/components/app/base/celda-inicio"
import type { InicioRegistro } from "@/lib/base/campos"

/**
 * La tarjeta de perfil de un registro, en el kanban y la galería: arriba la imagen grande (las capturas de una
 * influencer), su foto encima y en el centro, su nombre, su frase, sus tres cifras en una caja y sus logos reales al pie.
 * Sale de la misma declaración que la celda de inicio. `children` va debajo de las cifras: los campos que la vista enciende.
 */
export function TarjetaPerfil({ inicio, children, className }: { inicio: InicioRegistro; children?: React.ReactNode; className?: string }) {
  const enlaces = inicio.enlaces ?? []
  const cifras = inicio.cifras ?? []
  return (
    <div data-slot="tarjeta-perfil" className={cn("flex min-w-0 flex-col p-1.5", className)}>
      <div className="relative h-[88px] overflow-hidden rounded-[14px] bg-portada">
        {inicio.portada && <Image src={inicio.portada} alt="" fill sizes="280px" unoptimized className="object-cover object-top" />}
      </div>
      <div className="relative z-[1] -mt-8 flex justify-center">
        <FotoRegistro inicio={inicio} px={62} className="ring-[3px] ring-card" />
      </div>
      <div className="px-2 pt-1.5 text-center">
        <p className="truncate text-[15px] leading-5 font-medium tracking-[-0.01em] text-foreground">{inicio.nombre || "Sin nombre"}</p>
        {inicio.secundario && <p className="truncate text-xs leading-4 text-muted-foreground">{inicio.secundario}</p>}
        {inicio.descripcion && <p className="mt-1 line-clamp-2 text-xs leading-[17px] text-muted-foreground">{inicio.descripcion}</p>}
      </div>
      {cifras.length > 0 && (
        <dl className="mt-2.5 grid auto-cols-fr grid-flow-col rounded-[14px] bg-superficie-hundida px-1 py-2 text-center shadow-[inset_0_0_0_1px_var(--border)]">
          {cifras.map((c) => (
            <div key={c.label} className="min-w-0 px-0.5">
              <dd className="truncate text-[13px] leading-[18px] font-medium tracking-[-0.01em] text-foreground tabular-nums">{c.valor}</dd>
              <dt className="truncate text-[11px] leading-[14px] text-muted-foreground">{c.label}</dt>
            </div>
          ))}
        </dl>
      )}
      {children && <div className="mt-2 flex flex-col gap-1.5 px-1.5">{children}</div>}
      {enlaces.length > 0 && (
        <div className="flex items-center justify-center gap-3.5 pt-2.5 pb-1">
          {enlaces.map((e) => (
            <EnlaceRegistro key={`${e.red}-${e.href}`} enlace={e} sinCifra className="text-foreground/80" logoClassName="size-4" />
          ))}
        </div>
      )}
    </div>
  )
}
