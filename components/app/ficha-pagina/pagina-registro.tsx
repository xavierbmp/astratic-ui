"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, ChevronDownIcon, EllipsisIcon } from "lucide-react"
import { cn } from "cn"
import { leerListaAbierta, vecinosEnLista, type ListaAbierta } from "@/lib/base/lista-abierta"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BotonFicha, BotonFichaIcono, FichaBarra, FichaContenido, FichaPagina, FichaRecorrido } from "./marco"
import { MenuFichaContenido, MenuFichaOpcion, MenuFichaTitulo } from "./menu"

/** La lista la deja la base antes de navegar: mientras se está en la página no cambia. */
const sinAvisos = () => () => undefined

/**
 * El recorrido que dejó la base al abrir un registro: su posición y sus vecinos en la vista de la que se viene. Vive en
 * el navegador, así que hasta montarse no hay lista: la página se pinta igual en el servidor, sin flechas.
 */
export function useListaAbierta(clave: string, id: string) {
  const crudo = React.useSyncExternalStore(sinAvisos, () => JSON.stringify(leerListaAbierta(clave)), () => "null")
  // Es lo que acaba de serializar la línea de arriba: siempre una lista o nada.
  return React.useMemo(() => vecinosEnLista(JSON.parse(crudo) as ListaAbierta | null, id), [crudo, id])
}

/**
 * El marco entero de la página de un registro: la barra con el recorrido (o «Volver», si se llega sin lista), sus
 * acciones a la derecha y debajo sus bloques.
 */
export function PaginaRegistro({ clave, id, ruta, volver, etiqueta, acciones, children }: { /** La clave con la que la base guarda su lista: «marca». */ clave: string; id: string; /** La página de otro registro del mismo tipo. */ ruta: (id: string) => string; /** Adónde lleva «Volver»: la base. */ volver: string; /** «marca»: para el nombre accesible de las flechas. */ etiqueta: string; acciones?: React.ReactNode; children: React.ReactNode }) {
  const router = useRouter()
  const recorrido = useListaAbierta(clave, id)
  return (
    <FichaPagina>
      <FichaBarra
        inicio={
          recorrido ? (
            <FichaRecorrido posicion={recorrido.posicion} total={recorrido.total} vista={recorrido.vista} etiqueta={etiqueta} onAnterior={recorrido.anterior ? () => router.push(ruta(recorrido.anterior ?? "")) : undefined} onSiguiente={recorrido.siguiente ? () => router.push(ruta(recorrido.siguiente ?? "")) : undefined} />
          ) : (
            <BotonFicha asChild>
              <Link href={volver}>
                <ArrowLeftIcon strokeWidth={1.8} aria-hidden /> Volver
              </Link>
            </BotonFicha>
          )
        }
      >
        {acciones && <div className="flex flex-wrap items-center gap-1.5">{acciones}</div>}
      </FichaBarra>
      <FichaContenido>{children}</FichaContenido>
    </FichaPagina>
  )
}

/** El botón de la portada: el estado del registro con su punto y, al pulsarlo, los demás. */
export function BotonEstadoFicha<T extends string>({ valor, opciones, onCambiar, titulo = "Estado", className }: { valor: T; opciones: { id: T; label: string; punto: string; disabled?: boolean }[]; onCambiar?: (v: T) => void; titulo?: string; className?: string }) {
  const actual = opciones.find((o) => o.id === valor) ?? opciones[0]
  const contenido = (
    <>
      <span className={cn("size-2 flex-none rounded-full", actual?.punto)} aria-hidden />
      <span>{actual?.label}</span>
    </>
  )
  if (!onCambiar) {
    return <span className={cn("inline-flex h-10 items-center gap-[9px] rounded-full bg-(image:--ficha-boton) px-4 text-[14.5px] font-medium whitespace-nowrap text-ficha-tinta shadow-ficha-boton", className)}>{contenido}</span>
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BotonFicha title={`Cambiar: ${titulo.toLowerCase()}`} className={cn("gap-[9px] pr-3.5 pl-4 text-[14.5px]", className)}>
          {contenido}
          <ChevronDownIcon className="size-4" strokeWidth={1.8} aria-hidden />
        </BotonFicha>
      </DropdownMenuTrigger>
      <MenuFichaContenido>
        <MenuFichaTitulo>{titulo}</MenuFichaTitulo>
        {opciones.map((o) => (
          <MenuFichaOpcion key={o.id} punto={o.punto} actual={o.id === valor} disabled={o.disabled} onSelect={() => o.id !== valor && onCambiar(o.id)}>
            {o.label}
          </MenuFichaOpcion>
        ))}
      </MenuFichaContenido>
    </DropdownMenu>
  )
}

/** El «…» de la barra. */
export function MasFicha({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <BotonFichaIcono aria-label="Más acciones">
          <EllipsisIcon strokeWidth={1.8} aria-hidden />
        </BotonFichaIcono>
      </DropdownMenuTrigger>
      <MenuFichaContenido className={cn("min-w-[250px]", className)}>{children}</MenuFichaContenido>
    </DropdownMenu>
  )
}

/** Lo que se ve mientras carga la página de un registro: su marco, con la cabecera y tres bloques vacíos. */
export function FichaEsqueleto() {
  return (
    <FichaPagina aria-busy>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 pt-[60px] pb-24 md:px-7">
        <div className="h-[320px] animate-pulse rounded-ficha-cabecera bg-ficha-superficie shadow-ficha" />
        <div className="flex flex-wrap gap-4">
          <div className="h-[420px] min-w-0 flex-[1_1_360px] animate-pulse rounded-ficha bg-ficha-superficie shadow-ficha" />
          <div className="h-[420px] min-w-0 flex-[1.4_1_460px] animate-pulse rounded-ficha bg-ficha-superficie shadow-ficha" />
          <div className="h-[420px] min-w-0 flex-[1_1_320px] animate-pulse rounded-ficha bg-ficha-superficie shadow-ficha" />
        </div>
      </div>
    </FichaPagina>
  )
}
