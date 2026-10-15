"use client"

import { MiniCalendario as MiniCalendarioBase } from "@/components/app/agenda"
import { eventoDeCalendario, type Evento } from "@/lib/influencer/agenda"

/** El mini calendario del madre con los hitos, cobros y tareas en el tinte de su collab. */
export function MiniCalendario({ eventos, ...props }: { eventos: Evento[]; hoy: string; hrefDia?: (dia: string) => string; className?: string }) {
  return <MiniCalendarioBase eventos={eventos.map(eventoDeCalendario)} {...props} />
}
