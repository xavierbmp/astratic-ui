"use client"

import Image from "next/image"
import { FlagIcon, LockIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"
import { entradasPorDia, type EntradaCalendario } from "@/lib/influencer/planificacion"
import { diaLargo, sumarDias } from "@/lib/influencer/fechas"
import { tintClass } from "@/lib/influencer/tints"
import { StatusBadge } from "@/components/app/status-badge"
import { SocialIcon } from "@/components/app/social-icons"

/** Una cosa del calendario en una fila: su portada o su tinte, el título, la hora y su estado. */
export function EntradaFila({ entrada, activa, onAbrir, className }: { entrada: EntradaCalendario; activa?: boolean; onAbrir: () => void; className?: string }) {
  const contenido = entrada.clase === "contenido"
  return (
    <button
      type="button"
      onClick={onAbrir}
      className={cn("flex w-full min-w-0 items-center gap-3 rounded-xl bg-background/70 p-2 text-left transition-colors hover:bg-muted", activa && "bg-brand-soft", entrada.hecha && "opacity-70", className)}
    >
      <span className={cn("relative grid h-12 w-10 flex-none place-items-center overflow-hidden rounded-lg", entrada.tint ? tintClass[entrada.tint] : "bg-muted text-muted-foreground")}>
        {contenido && entrada.portadaUrl ? <Image src={entrada.portadaUrl} alt="" fill sizes="40px" unoptimized={!entrada.portadaUrl.startsWith("https://")} className="object-cover" /> : entrada.red ? <SocialIcon network={entrada.red} className="size-4" /> : null}
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className={cn("truncate text-[13px] font-semibold", entrada.clase === "tarea" && entrada.hecha && "line-through")}>{entrada.titulo}</span>
        <span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
          {entrada.red && <SocialIcon network={entrada.red} className="size-3 flex-none" />}
          {entrada.hora && <span className="flex-none tabular-nums">{entrada.hora}</span>}
          {entrada.contexto && <span className="truncate">{entrada.contexto}</span>}
          {contenido && entrada.fija && (
            <span className="inline-flex flex-none items-center gap-0.5">
              <LockIcon className="size-3" /> pactada
            </span>
          )}
        </span>
      </span>
      {entrada.estado && (
        <StatusBadge tone={entrada.estado.tone} className="flex-none">
          {entrada.estado.label}
        </StatusBadge>
      )}
    </button>
  )
}

/**
 * La planificación en lista, día a día desde `desde`: lo de cada día y, en los días sin nada que
 * publicar, el hueco libre para planificar ahí. Es la vista del móvil.
 */
export function AgendaContenidos({
  entradas,
  hoy,
  desde,
  dias = 14,
  activaId,
  onAbrir,
  onNuevo,
}: {
  entradas: EntradaCalendario[]
  hoy: string
  desde: string
  dias?: number
  activaId?: string | null
  onAbrir: (e: EntradaCalendario) => void
  onNuevo?: (dia: string) => void
}) {
  const porDia = entradasPorDia(entradas)
  const manana = sumarDias(hoy, 1)
  return (
    <ol className="flex flex-col gap-5">
      {Array.from({ length: dias }, (_, i) => sumarDias(desde, i)).map((dia) => {
        const lista = porDia.get(dia) ?? []
        const fechas = lista.filter((e) => e.clase === "fecha-clave")
        const cosas = lista.filter((e) => e.clase !== "fecha-clave")
        const publica = cosas.some((e) => e.clase === "contenido")
        return (
          <li key={dia} className="grid gap-1.5">
            <h3 className={cn("flex items-baseline gap-2 text-xs font-semibold", dia === hoy ? "text-foreground" : "text-muted-foreground")}>
              {(dia === hoy || dia === manana) && <span className="rounded-full bg-foreground px-2 py-px text-[10px] text-background">{dia === hoy ? "Hoy" : "Mañana"}</span>}
              <span className="first-letter:uppercase">{diaLargo(dia)}</span>
            </h3>
            {fechas.map((f) => (
              <span key={f.id} className="flex items-center gap-1.5 rounded-xl bg-info-soft px-3 py-1.5 text-xs font-medium text-info">
                <FlagIcon className="size-3.5 flex-none" /> {f.titulo}
                {f.contexto && <span className="truncate font-normal opacity-80">· {f.contexto}</span>}
              </span>
            ))}
            {cosas.map((e) => (
              <EntradaFila key={e.id} entrada={e} activa={activaId === e.id} onAbrir={() => onAbrir(e)} />
            ))}
            {!publica && onNuevo && (
              <button type="button" onClick={() => onNuevo(dia)} className="flex items-center gap-2 rounded-xl border border-dashed px-3 py-2.5 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <PlusIcon className="size-3.5" /> Hueco libre · planificar algo
              </button>
            )}
          </li>
        )
      })}
    </ol>
  )
}
