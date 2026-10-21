"use client"

import * as React from "react"
import { ChevronDownIcon, GripVerticalIcon } from "lucide-react"
import { cn } from "cn"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ConfigButton } from "@/components/app/config-button"
import { ArrastreFilas, GrupoArrastrable, useFilaArrastrable } from "@/components/app/arrastre-filas"
import type { DatoBloque } from "@/lib/bloques"

/** Un bloque en la lista de ajustes: su nombre, una línea de qué lleva y, al desplegarlo, lo que se ajusta de él. */
export type BloqueEnLista = {
  id: string
  label: string
  descripcion?: string
  visible: boolean
  /** Lo que se ajusta dentro del bloque (sus datos con `DatosBloque`, una imagen, sus textos). Sin él, no se despliega. */
  contenido?: React.ReactNode
}

type PropsLista = {
  bloques: BloqueEnLista[]
  /** Mover `desde` al sitio de `hasta` (con `moverBloque` de `lib/bloques.ts`). */
  onMover: (desde: string, hasta: string) => void
  onVisible: (id: string, visible: boolean) => void
  className?: string
}

const GRUPO = "bloques"

/**
 * Los bloques de una página o un documento para ajustarlos: arrastrar el asa para ordenarlos, el
 * interruptor para enseñarlos o esconderlos y, al desplegar uno, lo que se ajusta dentro (qué datos
 * enseña). La lógica, pura, en `lib/bloques.ts`; quien la usa guarda los ajustes por persona.
 */
export function ListaBloques({ bloques, onMover, onVisible, className }: PropsLista) {
  const [abierto, setAbierto] = React.useState<string | null>(null)
  const ultimo = bloques.at(-1)?.id
  return (
    <ArrastreFilas onSoltar={(s) => (s.sobre ?? ultimo) && onMover(s.id, s.sobre ?? ultimo ?? s.id)}>
      <GrupoArrastrable grupoId={GRUPO} ids={bloques.map((b) => b.id)}>
        <div data-slot="lista-bloques" className={cn("flex flex-col", className)}>
          {bloques.map((b) => (
            <FilaBloque key={b.id} bloque={b} abierto={abierto === b.id} onAbrir={() => setAbierto(abierto === b.id ? null : b.id)} onVisible={(v) => onVisible(b.id, v)} />
          ))}
        </div>
      </GrupoArrastrable>
    </ArrastreFilas>
  )
}

function FilaBloque({ bloque, abierto, onAbrir, onVisible }: { bloque: BloqueEnLista; abierto: boolean; onAbrir: () => void; onVisible: (v: boolean) => void }) {
  const { ref, style, asa, arrastrando } = useFilaArrastrable(bloque.id, GRUPO)
  const desplegable = bloque.contenido !== undefined
  const titulo = (
    <span className="min-w-0 flex-1">
      <span className={cn("block truncate text-sm font-medium", !bloque.visible && "text-muted-foreground line-through")}>{bloque.label}</span>
      {bloque.descripcion && <span className="block truncate text-xs text-muted-foreground">{bloque.descripcion}</span>}
    </span>
  )
  return (
    <div ref={ref} style={style} className={cn("rounded-lg", arrastrando && "bg-card shadow-pop", abierto && "bg-muted/50")}>
      <div className="flex items-center gap-2 px-1 py-1.5">
        <button type="button" aria-label={`Mover ${bloque.label}`} className="grid size-7 flex-none cursor-grab place-items-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing" {...asa}>
          <GripVerticalIcon className="size-4" />
        </button>
        {desplegable ? (
          <button type="button" onClick={onAbrir} aria-expanded={abierto} className="flex min-w-0 flex-1 items-center gap-1 text-left">
            {titulo}
            <ChevronDownIcon className={cn("size-4 flex-none text-muted-foreground transition-transform", abierto && "rotate-180")} />
          </button>
        ) : (
          titulo
        )}
        <Switch checked={bloque.visible} onCheckedChange={onVisible} aria-label={`Enseñar ${bloque.label}`} />
      </div>
      {abierto && desplegable && <div className="px-3 pt-1 pb-3">{bloque.contenido}</div>}
    </div>
  )
}

/** Qué se enseña de un bloque: un interruptor por dato (cada red, cada marca, cada campo…). */
export function DatosBloque({ datos, visible, onCambiar, vacio = "Sin opciones. Se muestra a partir de tus datos." }: { datos: DatoBloque[]; visible: (clave: string) => boolean; onCambiar: (clave: string, ver: boolean) => void; vacio?: string }) {
  if (!datos.length) return <p className="text-xs text-muted-foreground">{vacio}</p>
  return (
    <ul className="grid gap-1">
      {datos.map((d) => (
        <li key={d.clave}>
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-muted">
            <span className={cn("min-w-0 truncate", !visible(d.clave) && "text-muted-foreground line-through")}>{d.label}</span>
            <Switch size="sm" checked={visible(d.clave)} onCheckedChange={(v) => onCambiar(d.clave, v)} aria-label={`Enseñar ${d.label}`} />
          </label>
        </li>
      ))}
    </ul>
  )
}

/**
 * Los ajustes de bloques en la cabecera de lo que los tiene (configuración in situ): el engranaje
 * abre la lista en un desplegable. Para una página de bloques o un panel; un editor que los ajusta
 * todo el rato (un documento) pinta `ListaBloques` a la vista.
 */
export function AjustesBloquesBoton({ label = "Ajustar los bloques", titulo = "Bloques", ...lista }: PropsLista & { label?: string; titulo?: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <ConfigButton label={label} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        <p className="px-2 pt-1 pb-2 text-xs font-medium text-muted-foreground">{titulo}</p>
        <ListaBloques {...lista} />
      </PopoverContent>
    </Popover>
  )
}
