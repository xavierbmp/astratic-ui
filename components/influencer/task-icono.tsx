"use client"

import * as React from "react"
import {
  AlarmClockIcon,
  CameraIcon,
  ChartLineIcon,
  CircleDotIcon,
  ClapperboardIcon,
  FilePenLineIcon,
  FileSearchIcon,
  FileTextIcon,
  HandCoinsIcon,
  KanbanSquareIcon,
  LightbulbIcon,
  MailIcon,
  MessageSquareTextIcon,
  PackageIcon,
  PhoneIcon,
  PlaneIcon,
  ReceiptEuroIcon,
  ReceiptIcon,
  RotateCcwIcon,
  SendIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StarIcon,
  UsersIcon,
  VideoIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import { ICONOS_TAREA, type IconoTarea, type Tarea, type TipoTarea } from "@/lib/influencer/modelo"
import { iconoDeSerie, iconoDeTarea } from "@/lib/influencer/tareas"
import { tintClass, type Tint } from "@/lib/influencer/tints"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

/** Cada icono que puede llevar una tarea, con su nombre para el selector y el lector de pantalla. */
export const ICONOS_TAREA_INFO: Record<IconoTarea, { icono: LucideIcon; label: string }> = {
  general: { icono: CircleDotIcon, label: "General" },
  crm: { icono: KanbanSquareIcon, label: "CRM" },
  collabs: { icono: SparklesIcon, label: "Collabs" },
  contenido: { icono: ClapperboardIcon, label: "Contenido" },
  cobros: { icono: ReceiptEuroIcon, label: "Cobros" },
  email: { icono: MailIcon, label: "Email" },
  llamada: { icono: PhoneIcon, label: "Llamada" },
  reunion: { icono: UsersIcon, label: "Reunión" },
  brief: { icono: FileSearchIcon, label: "Brief" },
  guion: { icono: FileTextIcon, label: "Guion" },
  grabar: { icono: VideoIcon, label: "Grabar" },
  foto: { icono: CameraIcon, label: "Fotos" },
  publicar: { icono: SendIcon, label: "Publicar" },
  feedback: { icono: MessageSquareTextIcon, label: "Feedback" },
  contrato: { icono: FilePenLineIcon, label: "Contrato" },
  factura: { icono: ReceiptIcon, label: "Factura" },
  dinero: { icono: HandCoinsIcon, label: "Negociar" },
  resultados: { icono: ChartLineIcon, label: "Resultados" },
  idea: { icono: LightbulbIcon, label: "Idea" },
  envio: { icono: PackageIcon, label: "Envío" },
  compras: { icono: ShoppingBagIcon, label: "Compras" },
  viaje: { icono: PlaneIcon, label: "Viaje" },
  estrella: { icono: StarIcon, label: "Importante" },
  alarma: { icono: AlarmClockIcon, label: "Recordatorio" },
}

/** El tinte de cada página, para reconocer de un vistazo de dónde es una tarea (por tipo de cosa, nunca por estado). */
export const TINTE_DE_TIPO: Record<TipoTarea, Tint | null> = { "sin-tipo": null, crm: "lavender", collabs: "rose", contenidos: "peach", cobros: "mint" }

/** El icono de una tarea en su cuadradito, del tinte de su página. */
export function IconoDeTarea({ tarea, className }: { tarea: Pick<Tarea, "donde" | "clave" | "icono">; className?: string }) {
  const { icono: Icono, label } = ICONOS_TAREA_INFO[iconoDeTarea(tarea)]
  const tinte = TINTE_DE_TIPO[tarea.donde.tipo]
  return (
    <span aria-label={label} role="img" className={cn("grid size-7 flex-none place-items-center rounded-lg [&_svg]:size-3.5", tinte ? tintClass[tinte] : "bg-muted text-muted-foreground", className)}>
      <Icono aria-hidden />
    </span>
  )
}

/**
 * El icono de la tarea, que se pulsa para elegir otro de la lista (Xavier, 2026-10-16). «Volver al de
 * serie» lo devuelve al de su automatización o su tipo.
 */
export function SelectorIconoTarea({ tarea, onCambiar, className }: { tarea: Pick<Tarea, "donde" | "clave" | "icono" | "titulo">; onCambiar: (icono: IconoTarea | undefined) => void; className?: string }) {
  const [abierto, setAbierto] = React.useState(false)
  const actual = iconoDeTarea(tarea)
  const elegir = (icono: IconoTarea | undefined) => {
    onCambiar(icono === iconoDeSerie(tarea) ? undefined : icono)
    setAbierto(false)
  }
  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={`Cambiar el icono de «${tarea.titulo}»`} className={cn("flex-none rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring/50", className)}>
          <IconoDeTarea tarea={tarea} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Icono de la tarea</p>
        <div className="grid grid-cols-6 gap-1">
          {ICONOS_TAREA.map((id) => {
            const { icono: Icono, label } = ICONOS_TAREA_INFO[id]
            return (
              <button
                key={id}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={id === actual}
                onClick={() => elegir(id)}
                className={cn("grid size-9 place-items-center rounded-lg text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:size-4", id === actual && "bg-brand-soft text-brand")}
              >
                <Icono aria-hidden />
              </button>
            )
          })}
        </div>
        {tarea.icono && (
          <Button variant="ghost" size="sm" className="mt-2 h-7 w-full text-xs" onClick={() => elegir(undefined)}>
            <RotateCcwIcon /> Volver al de serie
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
