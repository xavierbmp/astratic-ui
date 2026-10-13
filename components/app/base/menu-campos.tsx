"use client"

import * as React from "react"
import { SearchIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { DefCampo } from "@/lib/base/campos"
import type { CampoVista, VistaBase } from "@/lib/base/vistas"
import { ICONO_TIPO, IconoCampo } from "@/components/app/base/apariencia"
import { CabeceraMenu, ListaOrdenable } from "@/components/app/base/menu-comun"

const sinAcentos = (s: string) => s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "")

/**
 * «Ocultar campos», como en Airtable: buscador, un interruptor por campo con su icono, el asa para
 * ordenar arrastrando y «Ocultar todos» / «Mostrar todo». El campo principal no sale: siempre se ve.
 */
export function MenuCampos<T>({ vista, campos, onCambiar }: { vista: VistaBase; campos: DefCampo<T>[]; onCambiar: (lista: CampoVista[]) => void }) {
  const [busqueda, setBusqueda] = React.useState("")
  const porId = new Map(campos.map((c) => [c.id, c]))
  const principal = vista.campos.find((c) => porId.get(c.id)?.principal)
  const resto = vista.campos.filter((c) => c !== principal && porId.has(c.id))
  const filtro = sinAcentos(busqueda.trim())
  const visibles = filtro ? resto.filter((c) => sinAcentos(porId.get(c.id)?.nombre ?? "").includes(filtro)) : resto

  const conPrincipal = (lista: CampoVista[]) => (principal ? [principal, ...lista] : lista)
  const alternar = (id: string, visible: boolean) => onCambiar(vista.campos.map((c) => (c.id === id ? { ...c, visible } : c)))
  const todos = (visible: boolean) => onCambiar(vista.campos.map((c) => (c === principal ? c : { ...c, visible })))

  return (
    <div className="flex w-80 flex-col text-[13px]">
      <CabeceraMenu titulo="Campos de la vista" ayuda="Los campos ocultos siguen en la base: solo dejan de verse en esta vista. Arrastra para cambiar su orden." />
      <label className="mx-4 flex items-center gap-2 border-b pb-2">
        <SearchIcon className="size-3.5 text-muted-foreground" />
        <input className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground" placeholder="Encuentra un campo" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} autoFocus />
      </label>
      <div className="max-h-80 overflow-y-auto px-2 py-1">
        {filtro ? (
          visibles.map((c) => <FilaCampo key={c.id} campo={porId.get(c.id)} visible={c.visible} onAlternar={(v) => alternar(c.id, v)} />)
        ) : (
          <ListaOrdenable items={resto} clave={(c) => c.id} onReordenar={(lista) => onCambiar(conPrincipal(lista))}>
            {(c, asa) => <FilaCampo campo={porId.get(c.id)} visible={c.visible} onAlternar={(v) => alternar(c.id, v)} asa={asa} />}
          </ListaOrdenable>
        )}
        {filtro && visibles.length === 0 && <p className="px-2 py-3 text-muted-foreground">Ningún campo se llama así</p>}
      </div>
      <div className="grid grid-cols-2 gap-2 border-t px-4 py-2">
        <button type="button" className="rounded-md bg-muted py-1 hover:bg-muted/70" onClick={() => todos(false)}>Ocultar todos</button>
        <button type="button" className="rounded-md bg-muted py-1 hover:bg-muted/70" onClick={() => todos(true)}>Mostrar todo</button>
      </div>
    </div>
  )
}

function FilaCampo<T>({ campo, visible, onAlternar, asa }: { campo: DefCampo<T> | undefined; visible: boolean; onAlternar: (v: boolean) => void; asa?: React.ReactNode }) {
  if (!campo) return null
  return (
    <div className="flex h-8 items-center gap-2 rounded-sm px-2 hover:bg-muted/60">
      <Switch size="sm" checked={visible} onCheckedChange={onAlternar} aria-label={`Ver ${campo.nombre}`} />
      <IconoCampo icono={ICONO_TIPO[campo.tipo]} />
      <span className="flex-1 truncate">{campo.nombre}</span>
      {asa}
    </div>
  )
}
