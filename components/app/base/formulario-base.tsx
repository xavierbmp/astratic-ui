"use client"

import * as React from "react"
import { ChevronDownIcon, LockIcon, SlidersHorizontalIcon, SquarePlusIcon, StarIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ESTRELLAS_POR_DEFECTO, valorDeTexto, type DefCampo, type OpcionCampo, type ValorCampo } from "@/lib/base/campos"
import type { CampoFormulario as CampoDelFormulario } from "@/lib/base/vistas"
import { ConfigButton } from "@/components/app/config-button"
import { ICONO_TIPO, IconoCampo } from "@/components/app/base/apariencia"
import { useVistasEnPestanas } from "@/components/app/base/vistas-en-pestanas"
import { ListaOrdenable } from "@/components/app/base/menu-comun"
import { ElegirOpciones } from "@/components/app/base/selector-opciones"
import { CampoFormulario, Formulario, FormularioCabecera, FormularioCuerpo, FormularioDialog, FormularioPie } from "@/components/app/formulario/formulario-dialog"
import { SelectorBuscable } from "@/components/app/formulario/selector-buscable"
import { CampoFecha } from "@/components/app/formulario/campo-fecha"

export type ValoresFormulario = Record<string, ValorCampo>

/** Lo que va a fila entera; el resto, de dos en dos. */
const ANCHO_COMPLETO: DefCampo<unknown>["tipo"][] = ["texto_largo", "multiselect"]

/**
 * El formulario para crear un registro de la base, con el kit de los formularios de alta: cabecera
 * con su icono, cada campo con el control de su tipo (elegir es escribir, la fecha con su calendario,
 * el importe con su unidad) y ninguno obligatorio: lo que falta lo completa quien crea el registro
 * con su valor de serie. El engranaje abre encima, sin perder lo escrito, qué campos salen y en qué
 * orden (los de serie también, salvo el principal), como en un formulario de Airtable. Los que no salen se pueden
 * rellenar igual: van plegados debajo, en «Ver N campos más» (reporte cmvtm2y5 del workspace). `extra` va arriba del
 * todo, para lo propio de la página que no es un campo (segmentar una influencer al darla de alta).
 */
export function FormularioBase<T>({
  open,
  onOpenChange,
  titulo,
  descripcion,
  icono = SquarePlusIcon,
  hoy,
  campos,
  onConfigurar,
  iniciales,
  onCrear,
  onCrearOpcion,
  textoCrear = "Crear",
  extra,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  titulo: string
  descripcion?: string
  /** El del objeto que se crea (la persona de un contacto). */
  icono?: LucideIcon
  /** «2026-10-14»: para el calendario de las fechas. */
  hoy?: string
  /** Los campos que se pueden escribir, en el orden del formulario y con si salen. */
  campos: { campo: DefCampo<T>; visible: boolean }[]
  onConfigurar: (lista: CampoDelFormulario[]) => void
  /** Lo que llega rellenado (lo que fija el filtro de la vista abierta, por ejemplo). */
  iniciales?: ValoresFormulario
  /** Crea el registro; si devuelve un texto, es el error y el formulario sigue abierto. */
  onCrear: (valores: ValoresFormulario) => string | void
  /** Crear una opción escribiéndola en el desplegable de un campo propio, como en la rejilla. */
  onCrearOpcion?: (campoId: string, label: string) => OpcionCampo | null
  textoCrear?: string
  extra?: React.ReactNode
}) {
  const [configurando, setConfigurando] = React.useState(false)
  const cerrar = (o: boolean) => {
    if (!o) setConfigurando(false)
    onOpenChange(o)
  }
  const configuracion = configurando ? <ConfigurarCampos titulo={titulo} campos={campos} onConfigurar={onConfigurar} onListo={() => setConfigurando(false)} /> : null

  return (
    <FormularioDialog open={open} onOpenChange={cerrar} sub={configuracion} onVolver={() => setConfigurando(false)}>
      <FormularioCabecera icono={icono} titulo={titulo} descripcion={descripcion} accion={<ConfigButton label="Configurar el formulario" onClick={() => setConfigurando(true)} className="size-8" />} />
      {/* Se monta al abrir: arranca vacío (o con lo inicial), sin efectos que lo rellenen. */}
      {open && <Cuerpo hoy={hoy} campos={campos} iniciales={iniciales} onCrear={onCrear} onCrearOpcion={onCrearOpcion} textoCrear={textoCrear} extra={extra} onCerrar={() => cerrar(false)} />}
    </FormularioDialog>
  )
}

/** Qué campos salen al crear y en qué orden: una pantalla encima del formulario. */
function ConfigurarCampos<T>({ titulo, campos, onConfigurar, onListo }: { titulo: string; campos: { campo: DefCampo<T>; visible: boolean }[]; onConfigurar: (lista: CampoDelFormulario[]) => void; onListo: () => void }) {
  return (
    <>
      <FormularioCabecera icono={SlidersHorizontalIcon} titulo="Campos del formulario" descripcion="Elige qué campos salen al crear y arrástralos para ordenarlos." migas={titulo} onVolver={onListo} />
      <FormularioCuerpo>
        <ListaOrdenable items={campos} clave={(c) => c.campo.id} onReordenar={(lista) => onConfigurar(lista.map((c) => ({ id: c.campo.id, visible: c.visible })))} className="col-span-6 flex flex-col gap-0.5">
          {({ campo, visible }, asa) => {
            const fijo = !!campo.obligatorio || !!campo.principal
            return (
              <div className="flex h-10 items-center gap-2 rounded-md px-2 text-sm hover:bg-muted/60">
                {fijo ? (
                  <LockIcon className="size-3.5 text-muted-foreground" aria-label="Sale siempre" />
                ) : (
                  <Switch size="sm" checked={visible} aria-label={`Pedir ${campo.nombre}`} onCheckedChange={(v) => onConfigurar(campos.map((c) => ({ id: c.campo.id, visible: c.campo.id === campo.id ? v : c.visible })))} />
                )}
                <IconoCampo icono={ICONO_TIPO[campo.tipo]} />
                <span className="flex-1 truncate">{campo.nombre}</span>
                {fijo && <span className="text-xs text-muted-foreground">Sale siempre</span>}
                {asa}
              </div>
            )
          }}
        </ListaOrdenable>
      </FormularioCuerpo>
      <FormularioPie>
        <Button type="button" size="lg" onClick={onListo}>
          Listo
        </Button>
      </FormularioPie>
    </>
  )
}

function Cuerpo<T>({
  hoy,
  campos,
  iniciales,
  onCrear,
  onCrearOpcion,
  textoCrear,
  extra,
  onCerrar,
}: {
  extra?: React.ReactNode
  hoy?: string
  campos: { campo: DefCampo<T>; visible: boolean }[]
  iniciales?: ValoresFormulario
  onCrear: (valores: ValoresFormulario) => string | void
  onCrearOpcion?: (campoId: string, label: string) => OpcionCampo | null
  textoCrear: string
  onCerrar: () => void
}) {
  const [valores, setValores] = React.useState<ValoresFormulario>(iniciales ?? {})
  const [textos, setTextos] = React.useState<Record<string, string>>({})
  const [errores, setErrores] = React.useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = React.useState<string | null>(null)
  const [todos, setTodos] = React.useState(false)
  const conPlegados = useVistasEnPestanas()
  const ocultos = conPlegados ? campos.filter((c) => !c.visible) : []
  const visibles = campos.filter((c) => c.visible || todos)

  // Nada es obligatorio: solo se avisa de lo escrito que no vale (un email mal puesto, letras en un número).
  const crear = (e: React.FormEvent) => {
    e.preventDefault()
    const nuevos: Record<string, string> = {}
    const finales: ValoresFormulario = { ...valores }
    // También lo escrito en un campo plegado después de abrirlo.
    for (const { campo } of campos) {
      if (!(campo.id in textos)) continue
      const lectura = valorDeTexto(campo, textos[campo.id])
      if (!lectura.ok) nuevos[campo.id] = lectura.error
      else finales[campo.id] = lectura.valor
    }
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return
    const error = onCrear(finales)
    if (error) return setErrorGeneral(error)
    onCerrar()
  }

  return (
    <Formulario onSubmit={crear}>
      <FormularioCuerpo>
        {extra && <div className="col-span-6">{extra}</div>}
        {visibles.map(({ campo }) => (
          <CampoFormulario key={campo.id} etiqueta={campo.nombre} htmlFor={`fb-${campo.id}`} ancho={ANCHO_COMPLETO.includes(campo.tipo) ? "completo" : "mitad"} error={errores[campo.id] || undefined} ayuda={campo.descripcion}>
            <Control
              campo={campo}
              hoy={hoy}
              valor={valores[campo.id] ?? null}
              texto={textos[campo.id]}
              invalido={!!errores[campo.id]}
              onCrearOpcion={campo.propio && onCrearOpcion ? (label) => onCrearOpcion(campo.id, label)?.id ?? null : undefined}
              onValor={(v) => {
                setValores((x) => ({ ...x, [campo.id]: v }))
                setErrores((x) => ({ ...x, [campo.id]: "" }))
              }}
              onTexto={(t) => {
                setTextos((x) => ({ ...x, [campo.id]: t }))
                setErrores((x) => ({ ...x, [campo.id]: "" }))
              }}
            />
          </CampoFormulario>
        ))}
        {ocultos.length > 0 && (
          <button type="button" onClick={() => setTodos(!todos)} className="col-span-6 inline-flex items-center gap-1 justify-self-start text-sm text-muted-foreground hover:text-foreground">
            <ChevronDownIcon className={cn("size-4 transition-transform", todos && "rotate-180")} />
            {todos ? "Ver menos campos" : `Ver ${ocultos.length} ${ocultos.length === 1 ? "campo más" : "campos más"}`}
          </button>
        )}
      </FormularioCuerpo>
      <FormularioPie izquierda={errorGeneral ? <span className="text-danger">{errorGeneral}</span> : undefined}>
        <Button type="button" variant="outline" size="lg" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button type="submit" size="lg">
          {textoCrear}
        </Button>
      </FormularioPie>
    </Formulario>
  )
}

/** El control de un campo según su tipo. Lo que se escribe a mano se lee al crear (`valorDeTexto`), como en la rejilla. */
function Control<T>({
  campo,
  hoy,
  valor,
  texto,
  invalido,
  onCrearOpcion,
  onValor,
  onTexto,
}: {
  campo: DefCampo<T>
  hoy?: string
  valor: ValorCampo
  texto: string | undefined
  invalido: boolean
  onCrearOpcion?: (label: string) => string | null
  onValor: (v: ValorCampo) => void
  onTexto: (t: string) => void
}) {
  const id = `fb-${campo.id}`
  const opciones = (campo.opciones ?? []).map((o) => ({ value: o.id, label: o.label, color: o.color }))
  const textoActual = texto ?? (valor === null || valor === undefined ? "" : String(valor))
  switch (campo.tipo) {
    case "casilla":
      return (
        <label className="flex h-10 w-fit items-center gap-2.5 text-sm">
          <Switch id={id} checked={valor === true} onCheckedChange={(c) => onValor(c === true)} />
          {valor === true ? "Sí" : "No"}
        </label>
      )
    case "select":
    case "vinculo":
      return (
        <SelectorBuscable
          id={id}
          opciones={opciones}
          valor={typeof valor === "string" ? valor : undefined}
          onChange={(v) => onValor(v || null)}
          vaciable
          placeholder="Escribe o elige"
          onCrear={
            onCrearOpcion
              ? (label) => {
                  const nueva = onCrearOpcion(label)
                  if (nueva) onValor(nueva)
                }
              : undefined
          }
        />
      )
    case "multiselect":
      return <ElegirOpciones opciones={opciones} valores={Array.isArray(valor) ? valor : []} onChange={onValor} onCrear={onCrearOpcion} className="min-h-10 rounded-md border border-input bg-background px-2" />
    case "calificacion": {
      const maximo = campo.formato?.maximo ?? ESTRELLAS_POR_DEFECTO
      const n = typeof valor === "number" ? valor : 0
      return (
        <span className="flex h-10 items-center">
          {Array.from({ length: maximo }, (_, i) => (
            <button key={i} type="button" aria-label={`${i + 1} de ${maximo}`} onClick={() => onValor(n === i + 1 ? 0 : i + 1)} className={cn("p-0.5", i < n ? "text-opcion-amarillo-fuerte" : "text-muted-foreground/30 hover:text-muted-foreground/60")}>
              <StarIcon className="size-5" fill="currentColor" strokeWidth={0} />
            </button>
          ))}
        </span>
      )
    }
    case "fecha":
      return <CampoFecha id={id} valor={typeof valor === "string" ? valor : ""} onChange={(d) => onValor(d || null)} hoy={hoy} vaciar={{ texto: "Sin fecha", onVaciar: () => onValor(null) }} />
    case "texto_largo":
      return <Textarea id={id} rows={3} value={textoActual} onChange={(e) => onTexto(e.target.value)} aria-invalid={invalido} />
    case "moneda":
    case "porcentaje":
      return (
        <InputGroup>
          <InputGroupInput id={id} inputMode="decimal" placeholder="0" value={textoActual} onChange={(e) => onTexto(e.target.value)} aria-invalid={invalido} />
          <InputGroupAddon align="inline-end">
            <InputGroupText>{campo.tipo === "moneda" ? "€" : "%"}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      )
    default:
      return (
        <Input
          id={id}
          type={campo.tipo === "email" ? "email" : campo.tipo === "url" ? "url" : campo.tipo === "telefono" ? "tel" : "text"}
          inputMode={campo.tipo === "numero" || campo.tipo === "progreso" ? "decimal" : undefined}
          placeholder={campo.tipo === "url" ? "https://" : undefined}
          value={textoActual}
          onChange={(e) => onTexto(e.target.value)}
          aria-invalid={invalido}
        />
      )
  }
}
