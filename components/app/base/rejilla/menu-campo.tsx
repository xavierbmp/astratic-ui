"use client"

import * as React from "react"
import { ArrowDownIcon, ArrowLeftToLineIcon, ArrowRightToLineIcon, ArrowUpIcon, EyeOffIcon, LayoutListIcon, ListFilterIcon, PencilIcon, Trash2Icon } from "lucide-react"
import { ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import type { TipoFiltro } from "@/lib/filtros/core"
import { sentidos } from "@/components/app/base/menu-orden"

export type AccionesCampo = {
  tipo: TipoFiltro
  editar?: () => void
  insertarIzquierda?: () => void
  insertarDerecha?: () => void
  ordenar: (dir: "asc" | "desc") => void
  filtrar: () => void
  agrupar: () => void
  ocultar?: () => void
  borrar?: () => void
}

/**
 * Lo que ofrece la cabecera de un campo, como en Airtable: editarlo, insertar uno al lado, ordenar,
 * filtrar y agrupar por él, ocultarlo y eliminarlo (solo los propios). Sale igual en su flecha y
 * con el clic derecho.
 */
export function ItemsCampo({ acciones: a, contexto }: { acciones: AccionesCampo; contexto?: boolean }) {
  const Item = contexto ? ContextMenuItem : DropdownMenuItem
  const Separador = contexto ? ContextMenuSeparator : DropdownMenuSeparator
  const nombres = sentidos(a.tipo)
  return (
    <>
      {a.editar && (
        <Item onSelect={a.editar}>
          <PencilIcon /> Editar el campo
        </Item>
      )}
      {(a.insertarIzquierda || a.insertarDerecha) && (
        <>
          {a.insertarIzquierda && (
            <Item onSelect={a.insertarIzquierda}>
              <ArrowLeftToLineIcon /> Insertar a la izquierda
            </Item>
          )}
          {a.insertarDerecha && (
            <Item onSelect={a.insertarDerecha}>
              <ArrowRightToLineIcon /> Insertar a la derecha
            </Item>
          )}
          <Separador />
        </>
      )}
      <Item onSelect={() => a.ordenar("asc")}>
        <ArrowDownIcon /> Ordenar {nombres.asc}
      </Item>
      <Item onSelect={() => a.ordenar("desc")}>
        <ArrowUpIcon /> Ordenar {nombres.desc}
      </Item>
      <Separador />
      <Item onSelect={a.filtrar}>
        <ListFilterIcon /> Filtrar por este campo
      </Item>
      <Item onSelect={a.agrupar}>
        <LayoutListIcon /> Agrupar por este campo
      </Item>
      {a.ocultar && (
        <>
          <Separador />
          <Item onSelect={a.ocultar}>
            <EyeOffIcon /> Ocultar el campo
          </Item>
        </>
      )}
      {a.borrar && (
        <Item variant="destructive" onSelect={a.borrar}>
          <Trash2Icon /> Eliminar el campo
        </Item>
      )}
    </>
  )
}
