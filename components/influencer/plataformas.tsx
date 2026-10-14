"use client"

import * as React from "react"
import { ChevronDownIcon, GlobeIcon, MailIcon, MicIcon, NewspaperIcon, PlusIcon } from "lucide-react"
import { cn } from "cn"
import { PLATAFORMAS, nombrePlataforma } from "@/lib/influencer/modelo"
import { SocialIcon, socialLabel, type RedConIcono } from "@/components/app/social-icons"
import { SelectorBuscable } from "@/components/app/formulario/selector-buscable"

const OTROS_ICONOS: Record<string, typeof GlobeIcon> = { podcast: MicIcon, blog: NewspaperIcon, newsletter: MailIcon }

const tieneIcono = (plataforma: string): plataforma is RedConIcono => Object.hasOwn(socialLabel, plataforma)

/** El icono de una plataforma: el de la red, uno genérico para podcast, blog o newsletter y un globo para las que escribió ella. */
export function IconoPlataforma({ plataforma, className }: { plataforma: string; className?: string }) {
  if (tieneIcono(plataforma)) return <SocialIcon network={plataforma} className={cn("size-4", className)} />
  const Icono = OTROS_ICONOS[plataforma] ?? GlobeIcon
  return <Icono className={cn("size-4", className)} />
}

/**
 * Dónde se publica la campaña: Instagram, TikTok y YouTube a la vista; «Más» despliega el resto de
 * las del marketing de influencers y, al final, «Otra» para escribir la que falte. Se eligen varias.
 */
export function PlataformasEditor({ value, onChange, className }: { value: string[]; onChange: (plataformas: string[]) => void; className?: string }) {
  const [mas, setMas] = React.useState(() => value.some((v) => !PLATAFORMAS.find((p) => p.id === v)?.principal))
  const [otra, setOtra] = React.useState<string | null>(null)
  const alternar = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
  const propias = value.filter((v) => !PLATAFORMAS.some((p) => p.id === v))
  const visibles = [...PLATAFORMAS.filter((p) => mas || p.principal).map((p) => p.id), ...propias]
  const anadirOtra = () => {
    const nombre = otra?.trim()
    if (nombre && !value.some((v) => nombrePlataforma(v).toLowerCase() === nombre.toLowerCase())) onChange([...value, nombre])
    setOtra(null)
  }

  return (
    <div data-slot="ws-plataformas" role="group" aria-label="Plataformas" className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {visibles.map((id) => {
        const elegida = value.includes(id)
        return (
          <button
            key={id}
            type="button"
            aria-pressed={elegida}
            onClick={() => alternar(id)}
            className={cn("inline-flex h-9 items-center gap-2 rounded-full border border-input pr-3.5 pl-3 text-[13px] transition-colors hover:bg-muted", elegida && "border-brand bg-brand-soft hover:bg-brand-soft")}
          >
            <IconoPlataforma plataforma={id} className={elegida ? "text-brand" : "text-muted-foreground"} />
            {nombrePlataforma(id)}
          </button>
        )
      })}
      {mas &&
        (otra === null ? (
          <button type="button" onClick={() => setOtra("")} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-dashed border-input pr-3.5 pl-3 text-[13px] text-brand hover:bg-brand-soft">
            <PlusIcon className="size-4" /> Otra
          </button>
        ) : (
          <input
            autoFocus
            value={otra}
            onChange={(e) => setOtra(e.target.value)}
            onBlur={anadirOtra}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                anadirOtra()
              } else if (e.key === "Escape") {
                e.stopPropagation()
                setOtra(null)
              }
            }}
            placeholder="Escribe la plataforma"
            aria-label="Otra plataforma"
            className="h-9 w-48 rounded-full border border-brand px-3.5 text-[13px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        ))}
      <button type="button" onClick={() => setMas((m) => !m)} aria-expanded={mas} className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground">
        {mas ? "Menos" : "Más plataformas"} <ChevronDownIcon className={cn("size-4 transition-transform", mas && "rotate-180")} />
      </button>
    </div>
  )
}

const TODAS = "todas"

/**
 * Elegir la plataforma de un formato: las de la lista, «Cualquier plataforma» (el UGC) o, escribiéndola,
 * una que falte.
 */
export function SelectorPlataforma({ value, onChange, tamano = "md", className, "aria-label": ariaLabel }: { value: string | undefined; onChange: (plataforma: string | undefined) => void; tamano?: "md" | "sm"; className?: string; "aria-label"?: string }) {
  const propia = value && !PLATAFORMAS.some((p) => p.id === value) ? [{ value, label: value, icono: <IconoPlataforma plataforma={value} className="text-muted-foreground" /> }] : []
  const opciones = [
    { value: TODAS, label: "Cualquier plataforma", detalle: "Se entrega, no se publica en una concreta", icono: <GlobeIcon className="size-4 text-muted-foreground" /> },
    ...PLATAFORMAS.map((p) => ({ value: p.id, label: p.nombre, icono: <IconoPlataforma plataforma={p.id} className="text-muted-foreground" /> })),
    ...propia,
  ]
  return <SelectorBuscable aria-label={ariaLabel ?? "Plataforma"} tamano={tamano} opciones={opciones} valor={value ?? TODAS} onChange={(v) => onChange(v === TODAS ? undefined : v)} onCrear={(texto) => onChange(texto)} placeholder="Escribe o elige" className={className} />
}
