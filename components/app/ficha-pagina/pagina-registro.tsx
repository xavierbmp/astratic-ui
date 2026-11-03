"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, ChevronDownIcon, EllipsisIcon } from "lucide-react"
import { cn } from "cn"
import { leerListaAbierta, vecinosEnLista, type ListaAbierta } from "@/lib/base/lista-abierta"
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { InicioRegistro } from "@/lib/base/campos"
import { BotonFicha, BotonFichaIcono, FichaBarra, FichaContenido, FichaPagina, FichaRecorrido } from "./marco"
import { BloqueLista, FilaLista, ListaLateral } from "./lista-lateral"
import { MenuFichaContenido, MenuFichaOpcion, MenuFichaTitulo } from "./menu"

/** La lista la deja la base antes de navegar: mientras se está en la página no cambia. */
const sinAvisos = () => () => undefined

/**
 * El recorrido que dejó la base al abrir un registro: su posición, sus vecinos y la lista entera de la vista de la que se
 * viene. Vive en el navegador, así que hasta montarse no hay lista: la página se pinta igual en el servidor, sin flechas.
 */
export function useListaAbierta(clave: string, id: string) {
  const crudo = React.useSyncExternalStore(sinAvisos, () => JSON.stringify(leerListaAbierta(clave)), () => "null")
  // Es lo que acaba de serializar la línea de arriba: siempre una lista o nada.
  return React.useMemo(() => {
    const lista = JSON.parse(crudo) as ListaAbierta | null
    const vecinos = vecinosEnLista(lista, id)
    return vecinos && lista ? { ...vecinos, ids: lista.ids } : null
  }, [crudo, id])
}

/**
 * El marco entero de la página de un registro, con el mismo bloque que una base: arriba su encabezado (`FichaBarra`), con
 * el recorrido (o «Volver», si se llega sin lista) y sus acciones a la derecha; debajo, sus bloques. Si se llega desde la
 * base y la página sabe pintar sus filas (`inicioDe`), a la izquierda queda la lista de la que se viene para ir pasando.
 */
export function PaginaRegistro({
  clave,
  id,
  ruta,
  volver,
  etiqueta,
  acciones,
  inicioDe,
  children,
}: {
  /** La clave con la que la base guarda su lista: «marca». */
  clave: string
  id: string
  /** La página de otro registro del mismo tipo. */
  ruta: (id: string) => string
  /** Adónde lleva «Volver»: la base. */
  volver: string
  /** «marca»: para el nombre accesible de las flechas y de la lista. */
  etiqueta: string
  acciones?: React.ReactNode
  /** La celda de inicio de cada registro de la lista, como en su base. Sin ella, o sin lista, no hay lateral. */
  inicioDe?: (id: string) => InicioRegistro | null
  children: React.ReactNode
}) {
  const router = useRouter()
  const recorrido = useListaAbierta(clave, id)
  const ir = (otro: string | null) => (otro ? () => router.push(ruta(otro)) : undefined)
  const filas = recorrido && inicioDe ? recorrido.ids.flatMap((i) => {
    const inicio = inicioDe(i)
    return inicio ? [{ id: i, inicio }] : []
  }) : []
  return (
    <FichaPagina className="flex flex-col px-3 pt-3 pb-4 md:px-4 xl:h-[calc(100dvh-3rem)] xl:min-h-0 xl:flex-none">
      <BloqueLista
        barra={
          <FichaBarra
            inicio={
              recorrido ? (
                <FichaRecorrido posicion={recorrido.posicion} total={recorrido.total} vista={recorrido.vista} etiqueta={etiqueta} onAnterior={ir(recorrido.anterior)} onSiguiente={ir(recorrido.siguiente)} />
              ) : (
                <BotonFicha asChild>
                  <Link href={volver}>
                    <ArrowLeftIcon aria-hidden /> Volver
                  </Link>
                </BotonFicha>
              )
            }
          >
            {acciones}
          </FichaBarra>
        }
        lista={
          filas.length > 0 ? (
            <ListaLateral etiqueta={`Lista: ${recorrido?.vista ?? etiqueta}`} abiertaId={id} pie={`${filas.length} en «${recorrido?.vista}»`}>
              {filas.map((f) => (
                <FilaLista key={f.id} inicio={f.inicio} activa={f.id === id} onAbrir={() => f.id !== id && router.push(ruta(f.id))} />
              ))}
            </ListaLateral>
          ) : undefined
        }
      >
        <FichaContenido className="max-w-none px-4 pt-4 md:px-5">{children}</FichaContenido>
      </BloqueLista>
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
        <BotonFicha title={`Cambiar: ${titulo.toLowerCase()}`} className={cn("bg-card font-sans", className)}>
          {contenido}
          <ChevronDownIcon className="text-muted-foreground" aria-hidden />
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
    <FichaPagina aria-busy className="flex flex-col px-3 pt-3 pb-4 md:px-4 xl:h-[calc(100dvh-3rem)] xl:min-h-0 xl:flex-none">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl bg-card shadow-superficie">
        <div className="h-12 flex-none border-b" />
        <div className="flex flex-col gap-4 bg-ficha-fondo p-4 md:p-5">
          <div className="h-[320px] animate-pulse rounded-ficha-cabecera bg-ficha-superficie shadow-ficha" />
          <div className="flex flex-wrap gap-4">
            <div className="h-[420px] min-w-0 flex-[1_1_360px] animate-pulse rounded-ficha bg-ficha-superficie shadow-ficha" />
            <div className="h-[420px] min-w-0 flex-[1.4_1_460px] animate-pulse rounded-ficha bg-ficha-superficie shadow-ficha" />
            <div className="h-[420px] min-w-0 flex-[1_1_320px] animate-pulse rounded-ficha bg-ficha-superficie shadow-ficha" />
          </div>
        </div>
      </div>
    </FichaPagina>
  )
}
