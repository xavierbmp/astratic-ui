"use client"

import * as React from "react"
import { ArrowDownAZIcon, CheckIcon, ChevronDownIcon, PlusIcon, XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  DECIMALES_MAX,
  ESTRELLAS_MAX,
  ESTRELLAS_POR_DEFECTO,
  LISTA_TIPOS_CAMPO,
  TIPOS_CAMPO,
  TIPOS_CON_OPCIONES,
  colorPorDefecto,
  type CampoPropio,
  type FormatoCampo,
  type OpcionCampo,
  type TipoCampoPropio,
} from "@/lib/base/campos"
import { idBase } from "@/lib/base/vistas"
import { ICONO_TIPO, IconoCampo } from "@/components/app/base/apariencia"
import { ListaOrdenable } from "@/components/app/base/menu-comun"
import { SelectorColor } from "@/components/app/base/menu-color"

/** Los tipos entre los que se puede cambiar un campo ya creado sin tocar sus valores. */
const FAMILIAS: TipoCampoPropio[][] = [
  ["texto", "texto_largo", "email", "url", "telefono"],
  ["numero", "moneda", "porcentaje", "calificacion"],
]
const tiposPosibles = (tipo: TipoCampoPropio) => FAMILIAS.find((f) => f.includes(tipo)) ?? [tipo]

/**
 * Crear o editar un campo propio, como el de Airtable: nombre (opcional), tipo con buscador, su
 * explicación y lo que tiene ese tipo (opciones con color que se ordenan arrastrando, decimales,
 * estrellas), y una descripción. Un campo creado solo cambia a tipos que no tocan sus valores.
 */
export function EditorCampo({
  campo,
  nombresUsados,
  onGuardar,
  onCancelar,
}: {
  /** El campo que se edita; sin él, se crea uno. */
  campo?: CampoPropio
  nombresUsados: string[]
  onGuardar: (campo: CampoPropio) => void
  onCancelar: () => void
}) {
  const [nombre, setNombre] = React.useState(campo?.nombre ?? "")
  const [tipo, setTipo] = React.useState<TipoCampoPropio>(campo?.tipo ?? "texto")
  const [opciones, setOpciones] = React.useState<OpcionCampo[]>(campo?.opciones ?? [])
  const [formato, setFormato] = React.useState<FormatoCampo>(campo?.formato ?? {})
  const [descripcion, setDescripcion] = React.useState(campo?.descripcion ?? "")
  const [conDescripcion, setConDescripcion] = React.useState(!!campo?.descripcion)
  const [error, setError] = React.useState<string | null>(null)
  const conOpciones = TIPOS_CON_OPCIONES.includes(tipo)

  const guardar = (e: React.FormEvent) => {
    e.preventDefault()
    const usados = new Set(nombresUsados.map((n) => n.toLowerCase()))
    let limpio = nombre.trim()
    if (!limpio) {
      let n = 1
      while (usados.has(`campo ${n}`)) n += 1
      limpio = `Campo ${n}`
    }
    if (usados.has(limpio.toLowerCase())) return setError("Ya hay un campo con ese nombre")
    const validas = opciones.map((o) => ({ ...o, label: o.label.trim() })).filter((o) => o.label)
    if (conOpciones && validas.length === 0) return setError("Añade al menos una opción")
    onGuardar({
      id: campo?.id ?? idBase("f"),
      nombre: limpio,
      tipo,
      opciones: conOpciones ? validas : undefined,
      formato: Object.keys(formato).length ? formato : undefined,
      descripcion: descripcion.trim() || undefined,
    })
  }

  const anadirOpcion = () => setOpciones((os) => [...os, { id: idBase("o"), label: "", color: colorPorDefecto(os.length) }])

  return (
    <form onSubmit={guardar} noValidate className="flex w-[min(92vw,380px)] flex-col gap-3 p-3 text-[13px]">
      <Input autoFocus placeholder="Nombre del campo (opcional)" value={nombre} onChange={(e) => { setNombre(e.target.value); setError(null) }} aria-invalid={!!error} className="h-8 text-[13px]" />
      <SelectorTipo value={tipo} posibles={campo ? tiposPosibles(campo.tipo) : LISTA_TIPOS_CAMPO} onChange={(t) => { setTipo(t); setFormato({}); setError(null) }} />
      <p className="text-muted-foreground">{TIPOS_CAMPO[tipo].ayuda}{campo && " Un campo ya creado solo cambia a tipos que guardan lo mismo."}</p>

      {conOpciones && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-medium">Opciones</span>
            <button type="button" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground" onClick={() => setOpciones((os) => [...os].sort((a, b) => a.label.localeCompare(b.label, "es")))}>
              <ArrowDownAZIcon className="size-3.5" /> Ordenar A → Z
            </button>
          </div>
          <ListaOrdenable items={opciones} clave={(o) => o.id} onReordenar={setOpciones} className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            {(o, asa) => (
              <div className="flex items-center gap-1">
                {asa}
                <SelectorColor value={o.color ?? "gris"} onChange={(color) => setOpciones((os) => os.map((x) => (x.id === o.id ? { ...x, color } : x)))} />
                <Input
                  aria-label="Nombre de la opción"
                  autoFocus={!o.label}
                  value={o.label}
                  className="h-8 text-[13px]"
                  onChange={(e) => setOpciones((os) => os.map((x) => (x.id === o.id ? { ...x, label: e.target.value } : x)))}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return
                    e.preventDefault()
                    if (o.label.trim()) anadirOpcion()
                  }}
                />
                <Button type="button" variant="ghost" size="icon-sm" aria-label={`Quitar ${o.label || "la opción"}`} onClick={() => setOpciones((os) => os.filter((x) => x.id !== o.id))}>
                  <XIcon />
                </Button>
              </div>
            )}
          </ListaOrdenable>
          <button type="button" className="inline-flex items-center gap-1 self-start text-muted-foreground hover:text-foreground" onClick={anadirOpcion}>
            <PlusIcon className="size-3.5" /> Añadir opción
          </button>
        </div>
      )}

      {(tipo === "numero" || tipo === "moneda" || tipo === "porcentaje") && (
        <div className="flex items-center justify-between gap-2">
          <span>Decimales</span>
          <Select value={String(formato.decimales ?? (tipo === "moneda" ? 2 : 0))} onValueChange={(v) => setFormato({ decimales: Number(v) })}>
            <SelectTrigger size="sm" className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: DECIMALES_MAX + 1 }, (_, i) => (
                <SelectItem key={i} value={String(i)}>{i === 0 ? "Sin decimales" : `${i} (${(1).toFixed(i).replace(".", ",")})`}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {tipo === "calificacion" && (
        <div className="flex items-center justify-between gap-2">
          <span>Estrellas</span>
          <Select value={String(formato.maximo ?? ESTRELLAS_POR_DEFECTO)} onValueChange={(v) => setFormato({ maximo: Number(v) })}>
            <SelectTrigger size="sm" className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: ESTRELLAS_MAX }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {conDescripcion ? (
        <Textarea placeholder="Para qué sirve este campo" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} className="text-[13px]" />
      ) : (
        <button type="button" className="inline-flex items-center gap-1 self-start text-muted-foreground hover:text-foreground" onClick={() => setConDescripcion(true)}>
          <PlusIcon className="size-3.5" /> Añadir descripción
        </button>
      )}

      {error && <p className="text-danger">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancelar}>Cancelar</Button>
        <Button type="submit" size="sm">{campo ? "Guardar" : "Crear campo"}</Button>
      </div>
    </form>
  )
}

function SelectorTipo({ value, posibles, onChange }: { value: TipoCampoPropio; posibles: TipoCampoPropio[]; onChange: (t: TipoCampoPropio) => void }) {
  const [abierto, setAbierto] = React.useState(false)
  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <button type="button" disabled={posibles.length < 2} className={cn("flex h-8 items-center gap-2 rounded-md border bg-background px-2 text-left hover:bg-muted/60 disabled:opacity-70")}>
          <IconoCampo icono={ICONO_TIPO[value]} />
          <span className="flex-1">{TIPOS_CAMPO[value].label}</span>
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Encuentra un tipo de campo" autoFocus />
          <CommandList className="max-h-72">
            <CommandEmpty>Ningún tipo se llama así</CommandEmpty>
            <CommandGroup heading="Campos estándar">
              {posibles.map((t) => (
                <CommandItem
                  key={t}
                  value={TIPOS_CAMPO[t].label}
                  onSelect={() => {
                    onChange(t)
                    setAbierto(false)
                  }}
                >
                  <IconoCampo icono={ICONO_TIPO[t]} />
                  <span className="flex-1">{TIPOS_CAMPO[t].label}</span>
                  {t === value && <CheckIcon className="size-3.5" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
