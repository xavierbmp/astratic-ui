"use client"

import * as React from "react"
import { CopyIcon, EllipsisIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { cn } from "cn"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ResizeHandle, useAnchoGuardado } from "@/components/app/resize-handle"
import { LISTA_TIPOS_VISTA, TIPOS_VISTA, type TipoVista, type VistaBase } from "@/lib/base/vistas"
import { ICONO_VISTA } from "@/components/app/base/apariencia"
import { ListaOrdenable } from "@/components/app/base/menu-comun"
import { ControlesLateral, type ControlLateral } from "@/components/app/controles-lateral"

const ANCHO_LATERAL = { min: 200, porDefecto: 256, max: 440 }

const sinAcentos = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")

/**
 * El lateral de las vistas, con la colocación de Airtable: «Crear vista» (cuadrícula, kanban,
 * galería o calendario), «Encontrar una vista» y la lista, que se ordena arrastrando. Doble clic en
 * una vista para cambiarle el nombre; su «…» la duplica o la borra. Su borde se arrastra para
 * ensancharlo, y cada persona lo encuentra como lo dejó; junto a «Crear vista», pasarlo al otro lado y
 * plegarlo.
 */
export function LateralVistas({
  clave,
  vistas,
  activa,
  onActivar,
  onCrear,
  onRenombrar,
  onDuplicar,
  onBorrar,
  onReordenar,
  ...control
}: ControlLateral & {
  /** Para recordar su ancho en este navegador. */
  clave: string
  vistas: VistaBase[]
  activa: string
  onActivar: (id: string) => void
  onCrear: (tipo: TipoVista) => string
  onRenombrar: (id: string, nombre: string) => void
  onDuplicar: (id: string) => void
  onBorrar: (id: string) => void
  onReordenar: (ids: string[]) => void
}) {
  const { ancho, setAncho } = useAnchoGuardado(`base-lateral:${clave}`, ANCHO_LATERAL)
  const [busqueda, setBusqueda] = React.useState("")
  const [editando, setEditando] = React.useState<string | null>(null)
  const filtro = sinAcentos(busqueda.trim())
  const visibles = filtro ? vistas.filter((v) => sinAcentos(v.nombre).includes(filtro)) : vistas

  const fila = (v: VistaBase, asa?: React.ReactNode) => (
    <FilaVista
      vista={v}
      activa={v.id === activa}
      editando={editando === v.id}
      onEditar={(si) => setEditando(si ? v.id : null)}
      onActivar={() => onActivar(v.id)}
      onRenombrar={(n) => onRenombrar(v.id, n)}
      onDuplicar={() => onDuplicar(v.id)}
      onBorrar={vistas.length > 1 ? () => onBorrar(v.id) : undefined}
      asa={asa}
    />
  )

  return (
    <aside className={cn("relative flex w-[var(--lateral-w)] flex-none flex-col bg-card text-[13px]", control.lado === "izquierda" ? "border-r" : "border-l")} style={{ "--lateral-w": `${ancho}px` } as React.CSSProperties}>
      <ResizeHandle ancho={ancho} onAncho={setAncho} limites={ANCHO_LATERAL} lado={control.lado === "izquierda" ? "derecha" : "izquierda"} destino={(borde) => borde.parentElement} variable="--lateral-w" label="Ancho de las vistas" />
      <div className="flex flex-col gap-0.5 border-b p-2">
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 hover:bg-muted aria-expanded:bg-muted">
                <PlusIcon className="size-4" /> Crear vista
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Tipo de vista</DropdownMenuLabel>
              {LISTA_TIPOS_VISTA.map((tipo) => {
                const Icono = ICONO_VISTA[tipo]
                return (
                  <DropdownMenuItem key={tipo} className="items-start" onSelect={() => setEditando(onCrear(tipo))}>
                    <Icono className="mt-0.5 text-brand" />
                    <span className="grid gap-0.5">
                      <span>{TIPOS_VISTA[tipo].label}</span>
                      <span className="text-xs text-muted-foreground">{TIPOS_VISTA[tipo].ayuda}</span>
                    </span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          <ControlesLateral {...control} nombre="las vistas" />
        </div>
        <label className="flex h-8 items-center gap-2 rounded-md px-2 text-muted-foreground focus-within:bg-muted/60">
          <SearchIcon className="size-4" />
          <input className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground" placeholder="Encontrar una vista" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {filtro ? (
          visibles.map((v) => <React.Fragment key={v.id}>{fila(v)}</React.Fragment>)
        ) : (
          <ListaOrdenable items={vistas} clave={(v) => v.id} onReordenar={(vs) => onReordenar(vs.map((v) => v.id))} className="flex flex-col gap-0.5">
            {(v, asa) => fila(v, asa)}
          </ListaOrdenable>
        )}
        {filtro && visibles.length === 0 && <p className="px-2 py-2 text-muted-foreground">Ninguna vista se llama así</p>}
      </div>
    </aside>
  )
}

function FilaVista({
  vista,
  activa,
  editando,
  onEditar,
  onActivar,
  onRenombrar,
  onDuplicar,
  onBorrar,
  asa,
}: {
  vista: VistaBase
  activa: boolean
  editando: boolean
  onEditar: (si: boolean) => void
  onActivar: () => void
  onRenombrar: (nombre: string) => void
  onDuplicar: () => void
  onBorrar?: () => void
  asa?: React.ReactNode
}) {
  const [nombre, setNombre] = React.useState(vista.nombre)
  const Icono = ICONO_VISTA[vista.tipo ?? "cuadricula"]
  if (editando)
    return (
      <form
        className="flex h-8 items-center gap-2 rounded-md bg-muted px-2"
        onSubmit={(e) => {
          e.preventDefault()
          onRenombrar(nombre)
          onEditar(false)
        }}
      >
        <Icono className="size-4 flex-none text-brand" />
        <input
          autoFocus
          aria-label="Nombre de la vista"
          className="min-w-0 flex-1 bg-transparent outline-none"
          value={nombre}
          onFocus={(e) => e.target.select()}
          onChange={(e) => setNombre(e.target.value)}
          onBlur={() => {
            onRenombrar(nombre)
            onEditar(false)
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onEditar(false)
          }}
        />
      </form>
    )
  return (
    <div className={cn("group/vista flex h-8 items-center gap-1 rounded-md pl-2 hover:bg-muted", activa && "bg-muted font-medium")}>
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
        onClick={onActivar}
        onDoubleClick={() => {
          setNombre(vista.nombre)
          onEditar(true)
        }}
      >
        <Icono className="size-4 flex-none text-brand" />
        <span className="truncate">{vista.nombre}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" aria-label={`Opciones de ${vista.nombre}`} className="flex size-6 flex-none items-center justify-center rounded-sm text-muted-foreground opacity-0 group-hover/vista:opacity-100 hover:bg-background aria-expanded:opacity-100">
            <EllipsisIcon className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onSelect={() => {
              setNombre(vista.nombre)
              onEditar(true)
            }}
          >
            <PencilIcon /> Cambiar el nombre
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={onDuplicar}>
            <CopyIcon /> Duplicar la vista
          </DropdownMenuItem>
          {onBorrar && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={onBorrar}>
                <Trash2Icon /> Eliminar la vista
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <span className="opacity-0 group-hover/vista:opacity-100">{asa}</span>
    </div>
  )
}
