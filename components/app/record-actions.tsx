"use client"

import * as React from "react"
import { Loader2Icon, PencilIcon, PlusIcon, Trash2Icon, XIcon, ZapIcon } from "lucide-react"
import { toast } from "sonner"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfigButton } from "@/components/app/config-button"
import { ConfirmDialog } from "@/components/app/confirm-dialog"
import { useLocalStorage } from "@/hooks/use-local-storage"

/**
 * Botones de acción propios en la cabecera de una ficha. Cada persona se crea los suyos
 * («Contactar», «Descartar por tamaño») y cada botón hace una o varias cosas seguidas con un clic:
 * poner un campo a un valor, añadir una etiqueta, meter el registro en una campaña… Qué se puede
 * hacer lo declara la página (`operaciones`) y es ella quien lo ejecuta (`onEjecutar`); aquí viven
 * los botones, su engranaje y el editor. Se guardan en el navegador de cada uno, por tipo de registro.
 */
export type OpcionAccion = { value: string; label: string }

export type OperacionBoton = {
  id: string
  /** Agrupa en el selector «Qué hace»: «Cambiar un campo», «Añadir». */
  grupo: string
  /** Cómo se lee en el selector y en el resumen del botón: «Relación», «Añadir a campaña». */
  label: string
  /** Valores posibles; si vienen de la base (campañas), una función que los trae al abrir el editor. */
  opciones: OpcionAccion[] | (() => Promise<OpcionAccion[]>)
  /** Se puede dejar vacío (quitar el responsable, borrar un campo). */
  vaciable?: boolean
}

/** `etiqueta` guarda cómo se llamaba el valor al crearlo, para leer el botón sin volver a cargar nada. */
export type AccionBoton = { operacion: string; valor: string | null; etiqueta?: string }
export type BotonAccion = { id: string; nombre: string; acciones: AccionBoton[] }

// Una acción a medio escribir en el editor: `valor` undefined es que aún no se ha elegido.
type AccionBorrador = { operacion: string; valor?: string | null; etiqueta?: string }

const VACIO = "__vacio__"

function resumen(b: BotonAccion, operaciones: OperacionBoton[]) {
  return b.acciones
    .map((a) => `${operaciones.find((o) => o.id === a.operacion)?.label ?? "Acción"}: ${a.valor === null ? "vacío" : (a.etiqueta ?? a.valor)}`)
    .join(" · ")
}

export function RecordActions({
  clave,
  operaciones,
  onEjecutar,
}: {
  /** Tipo de registro: cada uno tiene sus botones («empresa», «contacto»). */
  clave: string
  operaciones: OperacionBoton[]
  /** Hace lo que dice el botón sobre el registro abierto. Los avisos del resultado los da la página. */
  onEjecutar: (boton: BotonAccion) => Promise<void>
}) {
  const [botones, setBotones] = useLocalStorage<BotonAccion[]>(`botones:${clave}`, [])
  const [gestor, setGestor] = React.useState(false)
  const [enMarcha, setEnMarcha] = React.useState<string | null>(null)

  const ejecutar = async (b: BotonAccion) => {
    setEnMarcha(b.id)
    try {
      await onEjecutar(b)
    } catch (e) {
      console.error("[botones] ejecutar:", e)
      toast.error(`«${b.nombre}» no se ha podido completar.`)
    } finally {
      setEnMarcha(null)
    }
  }

  return (
    <>
      {botones.map((b) => (
        <Button key={b.id} variant="outline" size="sm" disabled={enMarcha !== null} title={resumen(b, operaciones)} onClick={() => ejecutar(b)}>
          {enMarcha === b.id ? <Loader2Icon className="animate-spin" /> : <ZapIcon />} {b.nombre}
        </Button>
      ))}
      <ConfigButton label="Botones de acción" onClick={() => setGestor(true)} />
      <GestorBotones open={gestor} onOpenChange={setGestor} botones={botones} setBotones={setBotones} operaciones={operaciones} />
    </>
  )
}

/** Lista de botones con su lápiz y su papelera; crear o cambiar uno se hace en el mismo diálogo. */
function GestorBotones({
  open,
  onOpenChange,
  botones,
  setBotones,
  operaciones,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  botones: BotonAccion[]
  setBotones: (next: (prev: BotonAccion[]) => BotonAccion[]) => void
  operaciones: OperacionBoton[]
}) {
  const [editando, setEditando] = React.useState<BotonAccion | null>(null)
  const [borrando, setBorrando] = React.useState<BotonAccion | null>(null)

  const guardar = (b: BotonAccion) => {
    setBotones((prev) => (prev.some((x) => x.id === b.id) ? prev.map((x) => (x.id === b.id ? b : x)) : [...prev, b]))
    setEditando(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setEditando(null)
        onOpenChange(o)
      }}
    >
      <DialogContent className={cn("sm:max-w-[480px]", editando && "sm:max-w-[600px]")}>
        {editando ? (
          <EditorBoton key={editando.id} boton={editando} operaciones={operaciones} onCancel={() => setEditando(null)} onGuardar={guardar} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Botones de acción</DialogTitle>
              <DialogDescription>
                Tus botones para esta ficha: cada uno hace una o varias cosas de un clic. Solo los ves tú, en este navegador.
              </DialogDescription>
            </DialogHeader>
            {botones.length === 0 ? (
              <p className="rounded-md border border-dashed px-4 py-6 text-center text-xs text-muted-foreground">
                Todavía no tienes botones. Por ejemplo, «Contactar» puede poner el estado del lead en Normalizado y meterlo en una
                campaña con un solo clic.
              </p>
            ) : (
              <ul className="flex max-h-72 flex-col overflow-y-auto">
                {botones.map((b) => (
                  <li key={b.id} className="flex items-center gap-2 rounded-md px-1 py-1.5 hover:bg-muted/60">
                    <ZapIcon className="size-3.5 flex-none text-muted-foreground" aria-hidden />
                    <span className="grid min-w-0 flex-1 leading-tight">
                      <span className="truncate text-sm">{b.nombre}</span>
                      <span className="truncate text-xs text-muted-foreground">{resumen(b, operaciones)}</span>
                    </span>
                    <Button variant="ghost" size="icon-sm" aria-label={`Editar ${b.nombre}`} className="text-muted-foreground" onClick={() => setEditando(b)}>
                      <PencilIcon />
                    </Button>
                    <Button variant="ghost" size="icon-sm" aria-label={`Borrar ${b.nombre}`} className="text-muted-foreground hover:text-danger" onClick={() => setBorrando(b)}>
                      <Trash2Icon />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setEditando({ id: `boton:${Date.now().toString(36)}`, nombre: "", acciones: [] })}>
              <PlusIcon /> Nuevo botón
            </Button>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Listo</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
      <ConfirmDialog
        open={borrando !== null}
        onOpenChange={(o) => !o && setBorrando(null)}
        title={`¿Borrar el botón «${borrando?.nombre ?? ""}»?`}
        description="Desaparece de la ficha. Lo que ya hizo en los registros no cambia."
        confirmLabel="Borrar botón"
        destructive
        onConfirm={() => {
          if (borrando) setBotones((prev) => prev.filter((x) => x.id !== borrando.id))
          setBorrando(null)
        }}
      />
    </Dialog>
  )
}

function EditorBoton({
  boton,
  operaciones,
  onCancel,
  onGuardar,
}: {
  boton: BotonAccion
  operaciones: OperacionBoton[]
  onCancel: () => void
  onGuardar: (b: BotonAccion) => void
}) {
  const [nombre, setNombre] = React.useState(boton.nombre)
  const [acciones, setAcciones] = React.useState<AccionBorrador[]>(boton.acciones.length ? boton.acciones : [{ operacion: "" }])
  const completa = (a: AccionBorrador) => operaciones.some((o) => o.id === a.operacion) && a.valor !== undefined
  const valido = nombre.trim() !== "" && acciones.length > 0 && acciones.every(completa)

  const guardar = () => {
    if (!valido) return
    onGuardar({ id: boton.id, nombre: nombre.trim(), acciones: acciones.map((a) => ({ operacion: a.operacion, valor: a.valor ?? null, ...(a.etiqueta ? { etiqueta: a.etiqueta } : {}) })) })
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{boton.nombre ? "Editar botón" : "Nuevo botón"}</DialogTitle>
        <DialogDescription>Ponle un nombre corto y elige qué hace, en orden. Todo se aplica al registro abierto.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="boton-nombre">Nombre</Label>
        <Input id="boton-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Contactar" onKeyDown={(e) => e.key === "Enter" && guardar()} autoFocus />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Al pulsarlo</Label>
        <div className="flex flex-col gap-1.5 rounded-md border p-2">
          {acciones.map((a, i) => (
            <FilaAccion
              key={i}
              accion={a}
              operaciones={operaciones}
              onChange={(nueva) => setAcciones((as) => as.map((x, j) => (j === i ? nueva : x)))}
              onRemove={acciones.length > 1 ? () => setAcciones((as) => as.filter((_, j) => j !== i)) : undefined}
            />
          ))}
        </div>
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setAcciones((as) => [...as, { operacion: "" }])}>
          <PlusIcon /> Añadir acción
        </Button>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button onClick={guardar} disabled={!valido}>Guardar botón</Button>
      </DialogFooter>
    </>
  )
}

/** Valores de una operación; los que se cargan de la base llegan al elegirla (null mientras tanto). */
function useOpciones(op: OperacionBoton | undefined): OpcionAccion[] | null {
  const [cargadas, setCargadas] = React.useState<{ id: string; opciones: OpcionAccion[] } | null>(null)
  React.useEffect(() => {
    if (!op || Array.isArray(op.opciones)) return
    let vivo = true
    op.opciones().then(
      (opciones) => vivo && setCargadas({ id: op.id, opciones }),
      (e) => {
        console.error("[botones] opciones:", e)
        if (vivo) toast.error(`No se han podido cargar las opciones de «${op.label}».`)
      },
    )
    return () => {
      vivo = false
    }
  }, [op])
  if (!op) return null
  if (Array.isArray(op.opciones)) return op.opciones
  return cargadas?.id === op.id ? cargadas.opciones : null
}

function FilaAccion({
  accion,
  operaciones,
  onChange,
  onRemove,
}: {
  accion: AccionBorrador
  operaciones: OperacionBoton[]
  onChange: (a: AccionBorrador) => void
  onRemove?: () => void
}) {
  const op = operaciones.find((o) => o.id === accion.operacion)
  const opciones = useOpciones(op)
  const grupos = [...new Set(operaciones.map((o) => o.grupo))]
  // Un valor guardado que ya no está entre las opciones (una campaña cerrada) se enseña igual.
  const perdida = accion.valor && opciones && !opciones.some((o) => o.value === accion.valor) ? accion.valor : null

  return (
    <div className="flex items-center gap-2">
      <Select value={accion.operacion || undefined} onValueChange={(operacion) => onChange({ operacion })}>
        <SelectTrigger size="sm" className="w-52 flex-none" aria-label="Qué hace">
          <SelectValue placeholder="Qué hace…" />
        </SelectTrigger>
        <SelectContent>
          {grupos.map((g) => (
            <SelectGroup key={g}>
              <SelectLabel>{g}</SelectLabel>
              {operaciones
                .filter((o) => o.grupo === g)
                .map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>
                ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      <Select
        disabled={!op}
        value={accion.valor === undefined ? undefined : (accion.valor ?? VACIO)}
        onValueChange={(v) => onChange({ operacion: accion.operacion, valor: v === VACIO ? null : v, etiqueta: v === VACIO ? undefined : opciones?.find((o) => o.value === v)?.label })}
      >
        <SelectTrigger size="sm" className="min-w-0 flex-1" aria-label="Valor">
          <SelectValue placeholder={!op ? "Valor" : opciones === null ? "Cargando…" : "Elegir…"}>
            {accion.valor === null ? "Sin valor" : accion.valor !== undefined ? (accion.etiqueta ?? accion.valor) : undefined}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {op?.vaciable && <SelectItem value={VACIO} className="text-muted-foreground">Sin valor</SelectItem>}
          {opciones?.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
          {perdida && <SelectItem value={perdida}>{accion.etiqueta ?? perdida} (ya no está)</SelectItem>}
          {opciones?.length === 0 && !op?.vaciable && <p className="px-2 py-1.5 text-xs text-muted-foreground">No hay opciones</p>}
        </SelectContent>
      </Select>
      {onRemove ? (
        <Button variant="ghost" size="icon-sm" aria-label="Quitar acción" className="flex-none text-muted-foreground" onClick={onRemove}>
          <XIcon />
        </Button>
      ) : (
        <span className="size-7 flex-none" aria-hidden />
      )}
    </div>
  )
}
