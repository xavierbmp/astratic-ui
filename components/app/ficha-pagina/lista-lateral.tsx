"use client"

import * as React from "react"
import { cn } from "cn"
import type { InicioRegistro } from "@/lib/base/campos"
import { CeldaInicio } from "@/components/app/base/celda-inicio"

/**
 * El bloque de trabajo de una lista con su registro al lado, como una base: arriba, su encabezado a todo el ancho
 * (`BarraBloque`, `BarraFiltros` o `FichaBarra`); debajo, la lista a la izquierda y el registro abierto a la derecha, cada
 * uno con su scroll desde el escritorio. Lo usan la cola de revisión y la página de un registro abierta desde su base.
 */
export function BloqueLista({ barra, lista, className, children }: { barra: React.ReactNode; /** La lista; sin ella, el registro ocupa todo el bloque. */ lista?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div data-slot="bloque-lista" className={cn("flex min-h-0 flex-1 flex-col rounded-2xl bg-card shadow-superficie xl:overflow-hidden", className)}>
      <div className="sticky top-0 z-30 overflow-hidden rounded-t-2xl xl:static">{barra}</div>
      <div className="flex min-h-0 flex-1 flex-col xl:flex-row">
        {lista && <aside className="flex h-[40dvh] min-h-[280px] flex-none flex-col border-b xl:h-auto xl:w-[300px] xl:border-r xl:border-b-0">{lista}</aside>}
        <div data-slot="bloque-lista-registro" className="min-h-0 min-w-0 flex-1 rounded-b-2xl bg-ficha-fondo font-ficha text-[15px] leading-[1.45] text-ficha-tinta xl:overflow-y-auto xl:rounded-bl-none">
          {children}
        </div>
      </div>
    </div>
  )
}

/** La lista del lateral: sus filas, con su propio scroll, y al pie cuántas hay. La abierta se queda siempre a la vista. */
export function ListaLateral({ etiqueta, pie, abiertaId, vacio, className, children }: { /** Su nombre accesible: «Influencers por revisar». */ etiqueta: string; pie?: React.ReactNode; abiertaId?: string | null; vacio?: React.ReactNode; className?: string; children?: React.ReactNode }) {
  const lista = React.useRef<HTMLElement>(null)
  React.useEffect(() => {
    lista.current?.querySelector("[data-activa]")?.scrollIntoView({ block: "nearest" })
  }, [abiertaId])
  const hay = React.Children.count(children) > 0
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <nav ref={lista} aria-label={etiqueta} className="min-h-0 flex-1 overflow-y-auto p-2">
        {hay ? <ul className="m-0 flex list-none flex-col gap-0.5 p-0">{children}</ul> : <p className="m-0 px-2 py-3 text-[13px] text-muted-foreground">{vacio}</p>}
      </nav>
      {pie && <div className="flex-none border-t px-4 py-2 text-[12.5px] text-muted-foreground tabular-nums">{pie}</div>}
    </div>
  )
}

/**
 * Un registro de la lista: la misma celda de inicio que en su base, lo que la página quiera debajo y, a la derecha, un dato
 * corto (su rendimiento, sus avisos). La abierta va en `bg-brand-soft` con su filo `brand`.
 */
export function FilaLista({ inicio, activa, onAbrir, lado, children }: { inicio: InicioRegistro; activa: boolean; onAbrir: () => void; lado?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onAbrir}
        onKeyDown={(e) => {
          // Con el foco en un logo de la celda, la tecla abre ese enlace y no la fila.
          if (e.target !== e.currentTarget || (e.key !== "Enter" && e.key !== " ")) return
          e.preventDefault()
          onAbrir()
        }}
        aria-current={activa || undefined}
        data-activa={activa || undefined}
        className={cn("box-border flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-l-2 border-l-transparent px-2.5 py-2 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50", activa && "border-l-brand bg-brand-soft hover:bg-brand-soft")}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <CeldaInicio inicio={inicio} />
          {children}
        </span>
        {lado && <span className="flex flex-none flex-col items-end gap-1">{lado}</span>}
      </div>
    </li>
  )
}
