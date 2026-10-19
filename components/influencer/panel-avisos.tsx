"use client"

import * as React from "react"
import Link from "next/link"
import { BanknoteIcon, BellRingIcon, CircleCheckIcon, MessageSquareWarningIcon, SettingsIcon, SparklesIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { TIPOS_AVISO, type Aviso, type TipoAviso } from "@/lib/influencer/modelo"
import { tintClass } from "@/lib/influencer/tints"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const ICONOS_AVISO: Record<TipoAviso, LucideIcon> = { oportunidad: SparklesIcon, cambios: MessageSquareWarningIcon, aprobado: CircleCheckIcon, cobro: BanknoteIcon, astratic: BellRingIcon }

type Pestana = "sin-leer" | "todos"

/** El tipo en singular, para la línea de debajo de cada aviso. */
const TIPO: Record<TipoAviso, string> = { oportunidad: "Oportunidad", cambios: "Cambios pedidos", aprobado: "Aprobado", cobro: "Cobro", astratic: "Astratic" }

/**
 * Los avisos en el desplegable de la campana (Xavier, 2026-10-17, reporte cmvcpow5, a partir de una referencia; sustituye
 * a la página de Avisos): título y «Marcar todo como leído», pestañas «Sin leer» y «Todos» con su número, el engranaje que
 * lleva a elegir los avisos, y la lista: icono del tipo en su tinte, título, lo que dice y hace cuánto, con el punto a la
 * derecha si no está leído (pulsarlo lo marca). Pulsar un aviso lo abre. Abre en «Sin leer» si hay alguno.
 */
export function PanelAvisos({
  avisos,
  cargando,
  ajustesHref,
  onAbrir,
  onMarcar,
  onLeerTodos,
}: {
  /** `null` mientras se cargan (se piden al abrir la campana). */
  avisos: Aviso[] | null
  cargando?: boolean
  ajustesHref: string
  onAbrir: (aviso: Aviso) => void
  onMarcar: (id: string, leido: boolean) => void
  onLeerTodos: () => void
}) {
  const sinLeer = avisos?.filter((a) => !a.leido).length ?? 0
  const [pestana, setPestana] = React.useState<Pestana | null>(null)
  // Hasta que elige, abre en «Sin leer» si queda alguno.
  const actual: Pestana = pestana ?? (sinLeer > 0 ? "sin-leer" : "todos")
  const lista = (avisos ?? []).filter((a) => actual === "todos" || !a.leido)

  return (
    <div data-slot="ws-panel-avisos" className="flex max-h-[min(560px,calc(100dvh-6rem))] flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pt-3.5">
        <p className="text-sm font-semibold">Avisos</p>
        {sinLeer > 0 && (
          <button type="button" onClick={onLeerTodos} className="text-xs text-muted-foreground hover:text-foreground">
            Marcar todo como leído
          </button>
        )}
      </div>
      <div className="flex items-center gap-1 border-b px-2">
        <Tabs value={actual} onValueChange={(v) => setPestana(v === "todos" ? "todos" : "sin-leer")} className="min-w-0 flex-1">
          <TabsList variant="line" compact aria-label="Qué avisos ver">
            <TabsTrigger value="sin-leer">
              Sin leer {sinLeer > 0 && <span className="ml-1 grid h-4 min-w-4 place-items-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background tabular-nums">{sinLeer}</span>}
            </TabsTrigger>
            <TabsTrigger value="todos">
              Todos {avisos && avisos.length > 0 && <span className="ml-1 grid h-4 min-w-4 place-items-center rounded-full bg-muted px-1 text-[10px] font-medium text-muted-foreground tabular-nums">{avisos.length}</span>}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={ajustesHref} aria-label="Elegir mis avisos" title="Elegir mis avisos">
            <SettingsIcon />
          </Link>
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {avisos === null || cargando ? (
          <div className="grid gap-3 p-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="grid flex-1 gap-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : lista.length === 0 ? (
          <div className="grid place-items-center gap-1 px-6 py-10 text-center">
            <BellRingIcon className="size-5 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">{actual === "sin-leer" ? "Lo tienes todo leído" : "Ningún aviso por aquí"}</p>
            <p className="text-xs text-muted-foreground">Cuando una marca pida cambios o apruebe, te paguen o la red te traiga algo, aparece aquí.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {lista.map((a) => (
              <FilaAviso key={a.id} aviso={a} onAbrir={() => onAbrir(a)} onMarcar={() => onMarcar(a.id, !a.leido)} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function FilaAviso({ aviso: a, onAbrir, onMarcar }: { aviso: Aviso; onAbrir: () => void; onMarcar: () => void }) {
  const Icono = ICONOS_AVISO[a.tipo]
  return (
    <li className={cn("group flex items-start gap-1 transition-colors hover:bg-muted", !a.leido && "bg-brand-soft/40")}>
      <button type="button" onClick={onAbrir} className="flex min-w-0 flex-1 items-start gap-3 py-3 pl-4 text-left outline-none focus-visible:bg-muted">
        <span className={cn("grid size-9 flex-none place-items-center rounded-full", tintClass[TIPOS_AVISO[a.tipo].tint])}>
          <Icono className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("line-clamp-2 text-sm", a.leido ? "font-medium" : "font-semibold")}>{a.titulo}</span>
          {a.descripcion && <span className="block truncate text-xs text-muted-foreground">{a.descripcion}</span>}
          <span className="mt-0.5 block text-[11px] text-muted-foreground">
            {fmt.relative(a.el)} · {TIPO[a.tipo]}
          </span>
        </span>
      </button>
      <button
        type="button"
        onClick={onMarcar}
        aria-label={a.leido ? "Marcar como no leído" : "Marcar como leído"}
        title={a.leido ? "Marcar como no leído" : "Marcar como leído"}
        className="grid size-8 flex-none place-items-center self-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <span className={cn("size-2 rounded-full transition-colors", a.leido ? "bg-transparent ring-1 ring-muted-foreground/40 opacity-0 group-hover:opacity-100" : "bg-brand")} />
      </button>
    </li>
  )
}
