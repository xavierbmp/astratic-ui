"use client"

import Link from "next/link"
import { ArrowUpRightIcon, CheckIcon, LayoutGridIcon, Undo2Icon } from "lucide-react"
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/app/status-badge"

/** Un portal de la casa o una página de este portal en el menú: el actual lleva la marca; uno que aún no existe, «Pronto». */
export type PortalDestino = { id: string; nombre: string; descripcion: string; href: string; monograma: string; disponible?: boolean; actual?: boolean }

/** Una cuenta a la que un administrador puede pasar (las suyas de administrador o las de prueba). */
export type UsuarioCambiable = { id: string; nombre: string; email: string; actual?: boolean }

function Monograma({ texto }: { texto: string }) {
  return <span className="grid size-6 flex-none place-items-center rounded-md bg-muted text-[11px] font-semibold">{texto}</span>
}

/** Una fila de portal o de página: lo de la misma app va con `Link`; lo de otra, con un enlace normal. */
function ItemDestino({ p }: { p: PortalDestino }) {
  const contenido = (
    <>
      <Monograma texto={p.monograma} />
      <span className="grid min-w-0 flex-1 leading-tight">
        <span className="truncate">{p.nombre}</span>
        <span className="truncate text-xs text-muted-foreground">{p.descripcion}</span>
      </span>
      {p.actual ? <CheckIcon className="text-brand" /> : p.disponible === false ? <StatusBadge tone="neutral">Pronto</StatusBadge> : <ArrowUpRightIcon className="text-muted-foreground" />}
    </>
  )
  if (p.actual || p.disponible === false)
    return (
      <DropdownMenuItem disabled={p.disponible === false} className={p.actual ? "bg-muted/60" : undefined}>
        {contenido}
      </DropdownMenuItem>
    )
  return (
    <DropdownMenuItem asChild>
      {p.href.startsWith("/") ? <Link href={p.href}>{contenido}</Link> : <a href={p.href}>{contenido}</a>}
    </DropdownMenuItem>
  )
}

/**
 * Menú del usuario de la sidebar, igual en todos los portales y en este orden (Xavier, 2026-10-21, reporte cmvfcoa1):
 * **«Este portal»** (sus páginas: en el workspace, el workspace, el admin de la red y lo que ve la marca), **«Usuarios
 * demo»** (`CambiarUsuario`) y **«Otros portales»** plegado (`OtrosPortales`). Un portal sin más páginas o sin usuarios
 * para cambiar no enseña ese bloque; «Otros portales» va siempre. `CambiarPortal` pinta un bloque de destinos con su título.
 */
export function CambiarPortal({ portales, titulo = "Este portal" }: { portales: PortalDestino[]; titulo?: string }) {
  if (!portales.length) return null
  return (
    <>
      <DropdownMenuLabel className="text-xs text-muted-foreground">{titulo}</DropdownMenuLabel>
      <DropdownMenuGroup>
        {portales.map((p) => (
          <ItemDestino key={p.id} p={p} />
        ))}
      </DropdownMenuGroup>
    </>
  )
}

/** «Otros portales», plegado: al pulsarlo (o pasar por encima) se abre la lista para elegir a cuál ir. Sin el actual. */
export function OtrosPortales({ portales }: { portales: PortalDestino[] }) {
  const otros = portales.filter((p) => !p.actual)
  if (!otros.length) return null
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <LayoutGridIcon /> Otros portales
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent className="w-72">
        {otros.map((p) => (
          <ItemDestino key={p.id} p={p} />
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}

/**
 * «Usuarios demo»: las cuentas a las que pasa un administrador en este portal, con la actual marcada; mientras usa
 * otra, «Volver a …» la devuelve a la suya. Cada portal decide qué cuentas salen y cómo se cambia.
 */
export function CambiarUsuario({ usuarios, onCambiar, volver }: { usuarios: UsuarioCambiable[]; onCambiar: (id: string) => void; volver?: { nombre: string; onVolver: () => void } }) {
  return (
    <>
      <DropdownMenuLabel className="text-xs text-muted-foreground">Usuarios demo</DropdownMenuLabel>
      <DropdownMenuGroup>
        {usuarios.map((u) => (
          <DropdownMenuItem key={u.id} onSelect={() => !u.actual && onCambiar(u.id)} className={u.actual ? "bg-muted/60" : undefined}>
            <span className="grid min-w-0 flex-1 leading-tight">
              <span className="truncate">{u.nombre}</span>
              <span className="truncate text-xs text-muted-foreground">{u.email}</span>
            </span>
            {u.actual && <CheckIcon className="text-brand" />}
          </DropdownMenuItem>
        ))}
        {volver && (
          <DropdownMenuItem onSelect={volver.onVolver}>
            <Undo2Icon /> Volver a {volver.nombre}
          </DropdownMenuItem>
        )}
      </DropdownMenuGroup>
    </>
  )
}
