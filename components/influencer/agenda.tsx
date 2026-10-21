"use client"

import { Agenda as AgendaBase } from "@/components/app/agenda"
import { eventoDeCalendario, type Evento } from "@/lib/influencer/agenda"

/**
 * La agenda del madre con los hitos de cada pieza, los cobros y las tareas con fecha, en el tinte de
 * su collab. Con `onSelect` el evento abre su ficha en vez de navegar.
 */
export function Agenda({ eventos, hoy, onSelect, className }: { eventos: Evento[]; hoy: string; onSelect?: (evento: Evento) => void; className?: string }) {
  const elegir = (id: string) => {
    const evento = eventos.find((e) => e.id === id)
    if (evento) onSelect?.(evento)
  }
  return <AgendaBase eventos={eventos.map(eventoDeCalendario)} hoy={hoy} onSelect={onSelect && elegir} vacio={{ title: "Nada este mes", description: "Los hitos se calculan a partir de las fechas de publicación." }} className={className} />
}
