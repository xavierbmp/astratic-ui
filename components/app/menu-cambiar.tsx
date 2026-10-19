"use client"

import Link from "next/link"
import { ArrowUpRightIcon, CheckIcon, Undo2Icon } from "lucide-react"
import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/app/status-badge"

/** Un portal de la casa en el menú: el actual lleva la marca; uno que aún no existe, «Pronto». */
export type PortalDestino = { id: string; nombre: string; descripcion: string; href: string; monograma: string; disponible?: boolean; actual?: boolean }

/** Una cuenta a la que un administrador puede pasar (las suyas de administrador o las de prueba). */
export type UsuarioCambiable = { id: string; nombre: string; email: string; actual?: boolean }

function Monograma({ texto }: { texto: string }) {
  return <span className="grid size-6 flex-none place-items-center rounded-md bg-muted text-[11px] font-semibold">{texto}</span>
}

/**
 * «Cambiar de portal» en el menú del usuario de la sidebar (Xavier, 2026-10-17, reporte cmvcohbs: «igual en todos los
 * portales»): la misma lista en cada portal, con el actual marcado. Lo de la misma app va con `Link`; lo de otra, con
 * un enlace normal.
 */
export function CambiarPortal({ portales, titulo = "Cambiar de portal" }: { portales: PortalDestino[]; titulo?: string }) {
  return (
    <>
      <DropdownMenuLabel className="text-xs text-muted-foreground">{titulo}</DropdownMenuLabel>
      <DropdownMenuGroup>
        {portales.map((p) => {
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
              <DropdownMenuItem key={p.id} disabled={p.disponible === false} className={p.actual ? "bg-muted/60" : undefined}>
                {contenido}
              </DropdownMenuItem>
            )
          return (
            <DropdownMenuItem key={p.id} asChild>
              {p.href.startsWith("/") ? <Link href={p.href}>{contenido}</Link> : <a href={p.href}>{contenido}</a>}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuGroup>
    </>
  )
}

/**
 * «Cambiar de usuario»: las cuentas a las que pasa un administrador en este portal, con la actual marcada; mientras usa
 * otra, «Volver a …» la devuelve a la suya. Cada portal decide qué cuentas salen y cómo se cambia.
 */
export function CambiarUsuario({ usuarios, onCambiar, volver }: { usuarios: UsuarioCambiable[]; onCambiar: (id: string) => void; volver?: { nombre: string; onVolver: () => void } }) {
  return (
    <>
      <DropdownMenuLabel className="text-xs text-muted-foreground">Cambiar de usuario</DropdownMenuLabel>
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
