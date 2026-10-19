"use client"

import * as React from "react"
import { toast } from "sonner"
import type { LucideIcon } from "lucide-react"
import { FolderPlusIcon, FolderTreeIcon } from "lucide-react"
import { cn } from "cn"
import { hijasDe, type CarpetaArbol, type DestinoCarpeta } from "@/lib/carpetas"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Section, SectionHeader } from "@/components/app/section"
import { ResizeHandle, useAnchoGuardado } from "@/components/app/resize-handle"
import { ControlesLateral, type ControlLateral } from "@/components/app/controles-lateral"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { ArbolCarpetas, type ColorCarpeta } from "@/components/app/arbol-carpetas"

/** El lateral de las carpetas en la base: de 14 a 26 rem, como el de las vistas. */
const ANCHO_LATERAL = { min: 224, porDefecto: 264, max: 416 }

/** Un atajo encima del árbol que no es una carpeta («Todo», «Favoritas», «Sin carpeta»), con su id propio. */
export type AtajoCarpetas = {
  id: string
  label: string
  icon: LucideIcon
  /** Si sale también en la fila de atajos del móvil (de serie, sí). */
  enFila?: boolean
}

export type PropsCarpetas<C extends CarpetaArbol> = {
  carpetas: C[]
  actual: string
  /** Cuánto lleva dentro cada carpeta y cada atajo, por id. */
  cuentas: Record<string, number>
  color?: ColorCarpeta<C>
  atajos?: AtajoCarpetas[]
  /** Dónde se recuerdan, por persona, las plegadas y el ancho del lateral. */
  claves: { plegadas: string; ancho: string }
  /** Lo que llevan dentro, en plural, para el aviso de borrar («apuntes», «archivos»). */
  contenido?: string
  /** Adónde se va al borrar la carpeta que se mira y no tenía madre (un atajo, como «Todo»). */
  alBorrarIrA: string
  onElegir: (id: string) => void
  onCrear: (nombre: string, padreId?: string) => C
  onRenombrar: (id: string, nombre: string) => void
  onMover: (id: string, destino: DestinoCarpeta) => boolean
  onBorrar: (id: string) => void
}

/** Los atajos encima del árbol. */
function Atajos({ atajos, actual, cuentas, onElegir }: { atajos: AtajoCarpetas[]; actual: string; cuentas: Record<string, number>; onElegir: (id: string) => void }) {
  return (
    <ul className="grid grid-cols-1 gap-0.5">
      {atajos.map((e) => (
        <li key={e.id}>
          <button
            type="button"
            onClick={() => onElegir(e.id)}
            aria-current={actual === e.id ? "true" : undefined}
            className={cn("flex w-full min-w-0 items-center gap-2 rounded-lg border-l-2 py-1.5 pr-8 pl-2 text-left text-sm transition-colors", actual === e.id ? "border-brand bg-brand-soft font-medium" : "border-transparent hover:bg-muted")}
          >
            <e.icon className="size-4 flex-none text-muted-foreground" aria-hidden />
            <span className="truncate">{e.label}</span>
            <span className="ml-auto flex-none text-xs text-muted-foreground tabular-nums">{cuentas[e.id] ?? 0}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/** Los atajos y el árbol, con lo que hace falta para crear, plegar y borrar. Lo usan el bloque y la hoja del móvil. */
function Directorio<C extends CarpetaArbol>({ props, creando, onCreando }: { props: PropsCarpetas<C>; creando: { padreId?: string } | null; onCreando: (c: { padreId?: string } | null) => void }) {
  const { carpetas, actual, cuentas, color, atajos = [], claves, contenido = "elementos", alBorrarIrA, onElegir, onCrear, onRenombrar, onMover, onBorrar } = props
  const [plegadas, setPlegadas] = useLocalStorage<string[]>(claves.plegadas, [])
  const [borrando, setBorrando] = React.useState<C | null>(null)
  const madre = borrando?.padreId ? carpetas.find((c) => c.id === borrando.padreId) : undefined
  const subcarpetas = borrando ? hijasDe(carpetas, borrando.id).length : 0
  return (
    <div className="grid grid-cols-1 gap-1.5 p-2">
      {atajos.length > 0 && (
        <>
          <Atajos atajos={atajos} actual={actual} cuentas={cuentas} onElegir={onElegir} />
          <div aria-hidden className="mx-2 border-t" />
        </>
      )}
      <ArbolCarpetas carpetas={carpetas} actual={actual} cuentas={cuentas} color={color} plegadas={plegadas} onPlegadas={setPlegadas} creando={creando} onCreando={onCreando} onElegir={onElegir} onCrear={onCrear} onRenombrar={onRenombrar} onMover={onMover} onBorrar={setBorrando} />
      <ConfirmDialog
        open={borrando !== null}
        onOpenChange={(o) => !o && setBorrando(null)}
        title={`¿Eliminar la carpeta «${borrando?.nombre ?? ""}»?`}
        description={`No se borra nada de lo que tiene dentro (${cuentas[borrando?.id ?? ""] ?? 0} ${contenido}${subcarpetas ? ` y ${subcarpetas} ${subcarpetas === 1 ? "subcarpeta" : "subcarpetas"}` : ""}): pasa a ${madre ? `«${madre.nombre}»` : "quedarse sin carpeta"}.`}
        confirmLabel="Eliminar carpeta"
        destructive
        onConfirm={() => {
          if (!borrando) return
          if (actual === borrando.id) onElegir(borrando.padreId ?? alBorrarIrA)
          onBorrar(borrando.id)
          toast.success(`Carpeta «${borrando.nombre}» eliminada`)
          setBorrando(null)
        }}
      />
    </div>
  )
}

/**
 * Un directorio de carpetas: los atajos (todo, favoritas, sin carpeta…) y las carpetas en árbol (con
 * subcarpetas), cada una con cuánto lleva contando lo de dentro. Se crean, se renombran, se mueven
 * (arrastrando o con «Mover a») y se borran aquí mismo. Tres formas: un bloque, el lateral de una
 * base (en el sitio de sus vistas, ensanchable) y, en el móvil, una fila de atajos con el árbol entero
 * en una hoja que sube desde abajo.
 */
export function CarpetasBloque<C extends CarpetaArbol>({
  variante = "bloque",
  control,
  ...props
}: PropsCarpetas<C> & {
  /** `lateral`: en el sitio del lateral de vistas de la base, con su borde para ensancharlo. */
  variante?: "bloque" | "chips" | "lateral"
  /** Pasarlo al otro lado y plegarlo (en el lateral, el que da la base). */
  control?: ControlLateral
}) {
  const { carpetas, actual, cuentas, color, atajos = [], claves, onElegir } = props
  const [creando, setCreando] = React.useState<{ padreId?: string } | null>(null)
  const [hoja, setHoja] = React.useState(false)
  const ancho = useAnchoGuardado(claves.ancho, ANCHO_LATERAL)

  if (variante === "lateral")
    return (
      <aside className={cn("relative flex w-[var(--lateral-w)] flex-none flex-col bg-card text-[13px]", control?.lado === "derecha" ? "border-l" : "border-r")} style={{ "--lateral-w": `${ancho.ancho}px` } as React.CSSProperties}>
        <ResizeHandle ancho={ancho.ancho} onAncho={ancho.setAncho} limites={ANCHO_LATERAL} lado={control?.lado === "derecha" ? "izquierda" : "derecha"} destino={(borde) => borde.parentElement} variable="--lateral-w" label="Ancho de las carpetas" />
        <div className="flex items-center gap-1 border-b p-2">
          <button type="button" className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 hover:bg-muted" onClick={() => setCreando({})}>
            <FolderPlusIcon className="size-4" /> Nueva carpeta
          </button>
          {control && <ControlesLateral {...control} nombre="las carpetas" />}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Directorio props={props} creando={creando} onCreando={setCreando} />
        </div>
      </aside>
    )

  if (variante === "chips") {
    const real = carpetas.find((c) => c.id === actual)
    const chip = (id: string, nombre: string, punto?: string) => (
      <button key={id} type="button" onClick={() => onElegir(id)} className={cn("inline-flex h-8 flex-none items-center gap-1.5 rounded-full border px-3 text-xs font-medium", actual === id ? "border-foreground bg-foreground text-background" : "bg-card text-foreground/80")}>
        {punto && <span className={cn("size-2 rounded-full", punto)} aria-hidden />}
        {nombre}
        <span className="tabular-nums opacity-60">{cuentas[id] ?? 0}</span>
      </button>
    )
    return (
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <button type="button" onClick={() => setHoja(true)} className="inline-flex h-8 flex-none items-center gap-1.5 rounded-full border bg-card px-3 text-xs font-medium">
          <FolderTreeIcon className="size-3.5" /> Carpetas
        </button>
        {atajos.filter((a) => a.enFila !== false).map((a) => chip(a.id, a.label))}
        {real && chip(real.id, real.nombre, color?.(real))}
        {hijasDe(carpetas)
          .filter((c) => c.id !== real?.id)
          .map((c) => chip(c.id, c.nombre, color?.(c)))}
        <Sheet open={hoja} onOpenChange={setHoja}>
          <SheetContent side="bottom" className="max-h-[85vh] gap-0 overflow-y-auto rounded-t-2xl pb-6">
            <SheetHeader>
              <SheetTitle>Carpetas</SheetTitle>
              <SheetDescription>Elige dónde mirar. Desde el «…» de cada una, crea subcarpetas o muévelas.</SheetDescription>
            </SheetHeader>
            <Directorio
              props={{
                ...props,
                onElegir: (id) => {
                  onElegir(id)
                  setHoja(false)
                },
              }}
              creando={creando}
              onCreando={setCreando}
            />
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <Section className="min-h-[320px] lg:sticky lg:top-4">
      <SectionHeader title="Carpetas" count={carpetas.length}>
        <div className="ml-auto flex items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" aria-label="Nueva carpeta" title="Nueva carpeta" onClick={() => setCreando({})}>
            <FolderPlusIcon />
          </Button>
          {control && <ControlesLateral {...control} nombre="las carpetas" />}
        </div>
      </SectionHeader>
      <Directorio props={props} creando={creando} onCreando={setCreando} />
    </Section>
  )
}
