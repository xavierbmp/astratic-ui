"use client"

import * as React from "react"
import { LockIcon, StarIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ESTRELLAS_POR_DEFECTO, esValorVacio, valorDeTexto, type DefCampo, type ValorCampo } from "@/lib/base/campos"
import type { CampoFormulario } from "@/lib/base/vistas"
import { ConfigButton } from "@/components/app/config-button"
import { ICONO_TIPO, IconoCampo } from "@/components/app/base/apariencia"
import { ListaOrdenable } from "@/components/app/base/menu-comun"
import { ElegirOpcion, ElegirOpciones } from "@/components/app/base/selector-opciones"

export type ValoresFormulario = Record<string, ValorCampo>

/**
 * El formulario para crear un registro de la base, configurable por cada persona: con el engranaje
 * elige qué campos salen (los de serie también, salvo los obligatorios) y los ordena arrastrando,
 * como en un formulario de Airtable. Cada campo se pide con el control de su tipo.
 */
export function FormularioBase<T>({
  open,
  onOpenChange,
  titulo,
  descripcion,
  campos,
  onConfigurar,
  iniciales,
  onCrear,
  textoCrear = "Crear",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  titulo: string
  descripcion?: string
  /** Los campos que se pueden escribir, en el orden del formulario y con si salen. */
  campos: { campo: DefCampo<T>; visible: boolean }[]
  onConfigurar: (lista: CampoFormulario[]) => void
  /** Lo que llega rellenado (lo que fija el filtro de la vista abierta, por ejemplo). */
  iniciales?: ValoresFormulario
  /** Crea el registro; si devuelve un texto, es el error y el formulario sigue abierto. */
  onCrear: (valores: ValoresFormulario) => string | void
  textoCrear?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-[520px]">
        {/* Se monta al abrir: arranca vacío (o con lo inicial), sin efectos que lo rellenen. */}
        {open && <Cuerpo titulo={titulo} descripcion={descripcion} campos={campos} onConfigurar={onConfigurar} iniciales={iniciales} onCrear={onCrear} textoCrear={textoCrear} onCerrar={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function Cuerpo<T>({
  titulo,
  descripcion,
  campos,
  onConfigurar,
  iniciales,
  onCrear,
  textoCrear,
  onCerrar,
}: {
  titulo: string
  descripcion?: string
  campos: { campo: DefCampo<T>; visible: boolean }[]
  onConfigurar: (lista: CampoFormulario[]) => void
  iniciales?: ValoresFormulario
  onCrear: (valores: ValoresFormulario) => string | void
  textoCrear: string
  onCerrar: () => void
}) {
  const [configurando, setConfigurando] = React.useState(false)
  const [valores, setValores] = React.useState<ValoresFormulario>(iniciales ?? {})
  const [textos, setTextos] = React.useState<Record<string, string>>({})
  const [errores, setErrores] = React.useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = React.useState<string | null>(null)
  const visibles = campos.filter((c) => c.visible)

  const crear = (e: React.FormEvent) => {
    e.preventDefault()
    const nuevos: Record<string, string> = {}
    const finales: ValoresFormulario = { ...valores }
    for (const { campo } of visibles) {
      if (campo.id in textos) {
        const lectura = valorDeTexto(campo, textos[campo.id])
        if (!lectura.ok) nuevos[campo.id] = lectura.error
        else finales[campo.id] = lectura.valor
      }
      if (campo.obligatorio && esValorVacio(finales[campo.id]) && !nuevos[campo.id]) nuevos[campo.id] = "Este campo no puede quedarse vacío"
    }
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return
    const error = onCrear(finales)
    if (error) return setErrorGeneral(error)
    onCerrar()
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-start justify-between gap-2 pr-6">
          <DialogTitle>{configurando ? "Campos del formulario" : titulo}</DialogTitle>
          {!configurando && <ConfigButton label="Configurar el formulario" onClick={() => setConfigurando(true)} />}
        </div>
        <DialogDescription>{configurando ? "Elige qué campos salen al crear y en qué orden. Los obligatorios salen siempre." : descripcion}</DialogDescription>
      </DialogHeader>

      {configurando ? (
        <>
          <ListaOrdenable items={campos} clave={(c) => c.campo.id} onReordenar={(lista) => onConfigurar(lista.map((c) => ({ id: c.campo.id, visible: c.visible })))} className="flex flex-col gap-0.5">
            {({ campo, visible }, asa) => {
              const fijo = !!campo.obligatorio || !!campo.principal
              return (
                <div className="flex h-9 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted/60">
                  {fijo ? (
                    <LockIcon className="size-3.5 text-muted-foreground" aria-label="Sale siempre" />
                  ) : (
                    <Switch size="sm" checked={visible} aria-label={`Pedir ${campo.nombre}`} onCheckedChange={(v) => onConfigurar(campos.map((c) => ({ id: c.campo.id, visible: c.campo.id === campo.id ? v : c.visible })))} />
                  )}
                  <IconoCampo icono={ICONO_TIPO[campo.tipo]} />
                  <span className="flex-1 truncate">{campo.nombre}</span>
                  {fijo && <span className="text-xs text-muted-foreground">Obligatorio</span>}
                  {asa}
                </div>
              )
            }}
          </ListaOrdenable>
          <DialogFooter>
            <Button onClick={() => setConfigurando(false)}>Listo</Button>
          </DialogFooter>
        </>
      ) : (
        <form onSubmit={crear} noValidate className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {visibles.map(({ campo }, i) => (
              <Field key={campo.id} data-invalid={!!errores[campo.id] || undefined} className={cn((campo.tipo === "texto_largo" || campo.tipo === "multiselect") && "sm:col-span-2")}>
                {campo.tipo !== "casilla" && (
                  <FieldLabel htmlFor={`fb-${campo.id}`}>
                    {campo.nombre}
                    {campo.obligatorio && <span className="text-muted-foreground"> *</span>}
                  </FieldLabel>
                )}
                <Control
                  campo={campo}
                  autoFocus={i === 0}
                  valor={valores[campo.id] ?? null}
                  texto={textos[campo.id]}
                  onValor={(v) => {
                    setValores((x) => ({ ...x, [campo.id]: v }))
                    setErrores((x) => ({ ...x, [campo.id]: "" }))
                  }}
                  onTexto={(t) => {
                    setTextos((x) => ({ ...x, [campo.id]: t }))
                    setErrores((x) => ({ ...x, [campo.id]: "" }))
                  }}
                />
                <FieldError errors={errores[campo.id] ? [{ message: errores[campo.id] }] : []} />
              </Field>
            ))}
          </div>
          {errorGeneral && <p className="text-sm text-danger">{errorGeneral}</p>}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onCerrar}>Cancelar</Button>
            <Button type="submit">{textoCrear}</Button>
          </DialogFooter>
        </form>
      )}
    </>
  )
}

/** El control de un campo según su tipo. Lo que se escribe a mano se lee al crear (`valorDeTexto`), como en la rejilla. */
function Control<T>({ campo, autoFocus, valor, texto, onValor, onTexto }: { campo: DefCampo<T>; autoFocus: boolean; valor: ValorCampo; texto: string | undefined; onValor: (v: ValorCampo) => void; onTexto: (t: string) => void }) {
  const id = `fb-${campo.id}`
  const opciones = (campo.opciones ?? []).map((o) => ({ value: o.id, label: o.label, color: o.color }))
  switch (campo.tipo) {
    case "casilla":
      return (
        <label className="flex items-center gap-2 pt-6 text-sm">
          <Checkbox id={id} checked={valor === true} onCheckedChange={(c) => onValor(c === true)} />
          {campo.nombre}
        </label>
      )
    case "select":
    case "vinculo":
      return <ElegirOpcion opciones={opciones} valor={typeof valor === "string" ? valor : undefined} onChange={(v) => onValor(v ?? null)} vinculo={campo.vinculo?.objeto} className="h-9 w-full rounded-md border border-input bg-background" />
    case "multiselect":
      return <ElegirOpciones opciones={opciones} valores={Array.isArray(valor) ? valor : []} onChange={onValor} className="rounded-md border border-input bg-background" />
    case "calificacion": {
      const maximo = campo.formato?.maximo ?? ESTRELLAS_POR_DEFECTO
      const n = typeof valor === "number" ? valor : 0
      return (
        <span className="flex h-9 items-center">
          {Array.from({ length: maximo }, (_, i) => (
            <button key={i} type="button" aria-label={`${i + 1} de ${maximo}`} onClick={() => onValor(n === i + 1 ? 0 : i + 1)} className={cn("p-0.5", i < n ? "text-opcion-amarillo-fuerte" : "text-muted-foreground/30 hover:text-muted-foreground/60")}>
              <StarIcon className="size-5" fill="currentColor" strokeWidth={0} />
            </button>
          ))}
        </span>
      )
    }
    case "fecha":
      return <Input id={id} type="date" autoFocus={autoFocus} value={typeof valor === "string" ? valor : ""} onChange={(e) => onValor(e.target.value || null)} />
    case "texto_largo":
      return <Textarea id={id} autoFocus={autoFocus} rows={3} value={texto ?? (typeof valor === "string" ? valor : "")} onChange={(e) => onTexto(e.target.value)} />
    default: {
      const numero = campo.tipo === "numero" || campo.tipo === "moneda" || campo.tipo === "porcentaje"
      return (
        <Input
          id={id}
          autoFocus={autoFocus}
          type={campo.tipo === "email" ? "email" : campo.tipo === "url" ? "url" : campo.tipo === "telefono" ? "tel" : "text"}
          inputMode={numero ? "decimal" : undefined}
          value={texto ?? (valor === null || valor === undefined ? "" : String(valor))}
          onChange={(e) => onTexto(e.target.value)}
        />
      )
    }
  }
}
