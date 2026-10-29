"use client"

import * as React from "react"
import {
  ArchiveIcon,
  BadgeEuroIcon,
  BellIcon,
  BookmarkIcon,
  Building2Icon,
  CalendarDaysIcon,
  CameraIcon,
  CircleCheckIcon,
  CircleDotIcon,
  ClockIcon,
  CrownIcon,
  EyeIcon,
  FlagIcon,
  FlameIcon,
  GemIcon,
  GlobeIcon,
  HashIcon,
  HeartIcon,
  InboxIcon,
  LayersIcon,
  MailIcon,
  MapPinIcon,
  MegaphoneIcon,
  PhoneIcon,
  SparklesIcon,
  StarIcon,
  TagIcon,
  TargetIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  UserIcon,
  UsersIcon,
  VideoIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { TipoVista } from "@/lib/base/vistas"
import { ICONO_VISTA } from "@/components/app/base/apariencia"

/**
 * Los iconos que se pueden poner a una vista para reconocerla en sus pestañas laterales (reportes cmvsixcu y cmvtrp16
 * del workspace). Se guarda su clave; una que ya no esté vuelve al icono de su tipo.
 */
export const ICONOS_VISTA_ELEGIBLES: Record<string, { icono: LucideIcon; label: string }> = {
  estrella: { icono: StarIcon, label: "Estrella" },
  llama: { icono: FlameIcon, label: "Llama" },
  corazon: { icono: HeartIcon, label: "Corazón" },
  marcador: { icono: BookmarkIcon, label: "Marcador" },
  bandera: { icono: FlagIcon, label: "Bandera" },
  diana: { icono: TargetIcon, label: "Diana" },
  rayo: { icono: ZapIcon, label: "Rayo" },
  brillo: { icono: SparklesIcon, label: "Brillo" },
  corona: { icono: CrownIcon, label: "Corona" },
  gema: { icono: GemIcon, label: "Gema" },
  ojo: { icono: EyeIcon, label: "Ojo" },
  aviso: { icono: TriangleAlertIcon, label: "Aviso" },
  hecho: { icono: CircleCheckIcon, label: "Hecho" },
  punto: { icono: CircleDotIcon, label: "Punto" },
  reloj: { icono: ClockIcon, label: "Reloj" },
  calendario: { icono: CalendarDaysIcon, label: "Calendario" },
  campana: { icono: BellIcon, label: "Campana" },
  bandeja: { icono: InboxIcon, label: "Bandeja" },
  archivo: { icono: ArchiveIcon, label: "Archivo" },
  capas: { icono: LayersIcon, label: "Capas" },
  persona: { icono: UserIcon, label: "Persona" },
  personas: { icono: UsersIcon, label: "Personas" },
  empresa: { icono: Building2Icon, label: "Empresa" },
  etiqueta: { icono: TagIcon, label: "Etiqueta" },
  almohadilla: { icono: HashIcon, label: "Almohadilla" },
  email: { icono: MailIcon, label: "Email" },
  telefono: { icono: PhoneIcon, label: "Teléfono" },
  megafono: { icono: MegaphoneIcon, label: "Megáfono" },
  camara: { icono: CameraIcon, label: "Cámara" },
  video: { icono: VideoIcon, label: "Vídeo" },
  sube: { icono: TrendingUpIcon, label: "Sube" },
  dinero: { icono: BadgeEuroIcon, label: "Dinero" },
  lugar: { icono: MapPinIcon, label: "Lugar" },
  mundo: { icono: GlobeIcon, label: "Mundo" },
}

/** El icono de una vista: el que se le eligió o, sin él, el de su tipo (cuadrícula, kanban…). */
export function iconoDeVista(vista: { icono?: string; tipo?: TipoVista }): LucideIcon {
  return (vista.icono && ICONOS_VISTA_ELEGIBLES[vista.icono]?.icono) || ICONO_VISTA[vista.tipo ?? "cuadricula"]
}

/** El icono de una vista, pintado. */
export function IconoVista({ vista, className }: { vista: { icono?: string; tipo?: TipoVista }; className?: string }) {
  return React.createElement(iconoDeVista(vista), { className })
}

/** La rejilla para elegir el icono de una vista, dentro de un popover o de un formulario. */
export function RejillaIconosVista({ valor, onElegir }: { valor?: string; onElegir: (icono: string) => void }) {
  return (
    <div role="listbox" aria-label="Icono de la vista" className="grid grid-cols-6 gap-1">
      {Object.entries(ICONOS_VISTA_ELEGIBLES).map(([clave, { icono: Icono, label }]) => (
        <button
          key={clave}
          type="button"
          role="option"
          aria-selected={clave === valor}
          title={label}
          aria-label={label}
          onClick={() => onElegir(clave)}
          className={cn("flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground", clave === valor && "bg-brand-soft text-brand hover:bg-brand-soft")}
        >
          <Icono className="size-4" />
        </button>
      ))}
    </div>
  )
}

/** Un botón con el icono de la vista que, al pulsarlo, abre la rejilla para cambiarlo. */
export function SelectorIconoVista({ vista, onElegir, className }: { vista: { icono?: string; tipo?: TipoVista }; onElegir: (icono: string) => void; className?: string }) {
  const [abierto, setAbierto] = React.useState(false)
  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <button type="button" aria-label="Cambiar el icono" title="Cambiar el icono" className={cn("flex size-8 flex-none items-center justify-center rounded-md border bg-background text-brand hover:bg-muted", className)}>
          {React.createElement(iconoDeVista(vista), { className: "size-4" })}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-2">
        <RejillaIconosVista
          valor={vista.icono}
          onElegir={(icono) => {
            onElegir(icono)
            setAbierto(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
