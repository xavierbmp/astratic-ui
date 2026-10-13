"use client"

import * as React from "react"
import { Columns3Icon } from "lucide-react"
import { Kanban, type KanbanColumn } from "@/components/app/kanban"
import { EmptyState } from "@/components/app/states"
import type { DefCampo, ValorCampo } from "@/lib/base/campos"
import { CLASE_FUERTE } from "@/components/app/base/apariencia"
import { TarjetaRegistro, type PropsTarjetas } from "@/components/app/base/tarjeta"

/** La columna de los que no tienen valor: va la primera, como en Airtable. */
const SIN = "__sin__"

type Item<T> = { id: string; columnId: string; fila: T }

/**
 * El kanban de la base: el `Kanban` del design system con una columna por opción del campo que
 * apila (una selección, o un vínculo con un registro de la otra base por columna) y la de «Sin …»
 * delante. Arrastrar una tarjeta a otra columna le cambia el valor (las columnas no cambian: una que
 * se queda vacía sigue ahí para volver); pulsarla abre su ficha.
 */
export function KanbanBase<T>({
  campo,
  registros,
  getId,
  abiertoId,
  onAbrir,
  onEscribir,
  clave,
  resumen,
  plegadas,
  ...tarjeta
}: PropsTarjetas<T> & {
  /** El campo que reparte las columnas. Sin él, se explica cómo elegir uno. */
  campo: DefCampo<T> | undefined
  registros: T[]
  getId: (fila: T) => string
  abiertoId?: string | null
  onAbrir: (id: string) => void
  onEscribir?: (fila: T, campo: DefCampo<T>, valor: ValorCampo) => void
  /** Para recordar las columnas plegadas. */
  clave: string
  /** Lo que se dice de cada columna bajo su título (el importe que suma). */
  resumen?: (filas: T[]) => React.ReactNode
  /** Las columnas que empiezan plegadas (las de los extremos: ganadas, perdidas). */
  plegadas?: string[]
}) {
  const derivados = React.useMemo<Item<T>[]>(
    () =>
      campo
        ? registros.map((fila) => {
            const v = campo.valor(fila)
            return { id: getId(fila), columnId: typeof v === "string" && v ? v : SIN, fila }
          })
        : [],
    [campo, registros, getId],
  )
  // Mientras se arrastra, la tarjeta cambia de columna aquí; al soltar se guarda una sola vez.
  const [arrastrando, setArrastrando] = React.useState<Item<T>[] | null>(null)
  const items = arrastrando ?? derivados

  const columnas = React.useMemo<KanbanColumn[]>(() => {
    if (!campo) return []
    // Un campo obligatorio no tiene registros sin valor: sin columna «Sin …».
    const sin = campo.obligatorio ? [] : [{ id: SIN, title: `Sin ${campo.vinculo?.objeto ?? campo.nombre.toLowerCase()}` }]
    return [...sin, ...(campo.opciones ?? []).map((o) => ({ id: o.id, title: o.label, dotClassName: CLASE_FUERTE[o.color ?? "gris"] }))].map((c) => ({
      ...c,
      meta: resumen?.(derivados.filter((i) => i.columnId === c.id).map((i) => i.fila)),
    }))
  }, [campo, derivados, resumen])

  if (!campo)
    return (
      <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-background pt-10">
        <EmptyState icon={Columns3Icon} title="Elige cómo repartir las tarjetas" description="El kanban necesita un campo de selección única o un vínculo: cada opción es una columna." />
      </div>
    )

  const editable = !!onEscribir && !campo.soloLectura
  return (
    <div className="min-h-0 flex-1 bg-background">
      <Kanban
        columns={columnas}
        items={items}
        onChange={(next) => editable && setArrastrando(next)}
        onMove={(id, columna) => {
          setArrastrando(null)
          const item = derivados.find((i) => i.id === id)
          if (item && editable && item.columnId !== columna) onEscribir?.(item.fila, campo, columna === SIN ? null : columna)
        }}
        renderCard={(item) => <TarjetaRegistro fila={item.fila} {...tarjeta} />}
        onCardClick={(item) => onAbrir(item.id)}
        openId={abiertoId}
        storageKey={clave}
        defaultCollapsed={plegadas}
        density="compact"
      />
    </div>
  )
}
