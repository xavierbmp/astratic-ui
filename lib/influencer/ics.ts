// El calendario del workspace en formato iCalendar (.ics): las fechas de publicación, entregas y
// cobros como eventos de día entero, para abrirlos en Google Calendar, Apple o Outlook.
import type { Evento } from "@/lib/influencer/agenda"
import { TIPOS_EVENTO } from "@/lib/influencer/agenda"
import { soloFecha, sumarDias } from "@/lib/influencer/fechas"

/** Lo que el formato obliga a escapar en un texto: barras, comas, puntos y coma y saltos de línea. */
const escapar = (texto: string) => texto.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n")

/** Las líneas no pueden pasar de 75 caracteres: las largas siguen en la siguiente con un espacio delante. */
function plegar(linea: string) {
  const trozos: string[] = []
  for (let i = 0; i < linea.length; i += 74) trozos.push(linea.slice(i, i + 74))
  return trozos.join("\r\n ")
}

const fecha = (dia: string) => soloFecha(dia).replace(/-/g, "")

/** El calendario con un evento de día entero por cada fecha. `ahora` es la marca de tiempo del archivo. */
export function calendarioIcs({ eventos, ahora, nombre, origen }: { eventos: Evento[]; ahora: string; nombre: string; origen: string }) {
  const sello = `${ahora.replace(/[-:]/g, "").slice(0, 15)}Z`
  const lineas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Astratic//Influencer Workspace//ES",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapar(nombre)}`,
    ...eventos.flatMap((e) => [
      "BEGIN:VEVENT",
      `UID:${e.id}@workspace.astratic`,
      `DTSTAMP:${sello}`,
      `DTSTART;VALUE=DATE:${fecha(e.fecha)}`,
      `DTEND;VALUE=DATE:${fecha(sumarDias(soloFecha(e.fecha), 1))}`,
      `SUMMARY:${escapar(e.contexto ? `${e.titulo} · ${e.contexto}` : e.titulo)}`,
      `DESCRIPTION:${escapar(`${TIPOS_EVENTO[e.tipo]}. Ábrelo en el workspace: ${origen}${e.href}`)}`,
      `URL:${origen}${e.href}`,
      "END:VEVENT",
    ]),
    "END:VCALENDAR",
  ]
  return `${lineas.map(plegar).join("\r\n")}\r\n`
}
