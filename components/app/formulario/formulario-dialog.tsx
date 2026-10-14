"use client"

import * as React from "react"
import { ArrowLeftIcon, ChevronRightIcon, XIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"

const ANCHOS = { sm: "sm:max-w-[480px]", md: "sm:max-w-[560px]", lg: "sm:max-w-[680px]" }

/**
 * Las esquinas de lo de dentro del formulario, con la escala de Astratic UI (radio base 10 px) aunque
 * el tema la tenga más redonda (el de influencers, 16 px): el marco del diálogo y sus botones siguen
 * al tema y los campos, las tarjetas y los desplegables quedan más rectos, para que no todo tenga la
 * misma forma. La llevan el cuerpo y los desplegables que se abren desde él (van en un portal).
 */
export const ESQUINAS_FORMULARIO = "[--radius:0.625rem]"

const CAMPOS_ENFOCABLES = "[data-slot=formulario-cuerpo] :is(input:not([type=hidden]), textarea, [data-slot=selector-buscable], [data-slot=campo-fecha]):not(:disabled)"

/** Si la pantalla es la que se ve: la oculta (debajo de un subformulario) no da título al diálogo. */
const PantallaActiva = React.createContext(true)

/**
 * El diálogo de alta de un registro: cabecera con su icono, cuerpo en rejilla y pie fijo. Un
 * formulario puede abrir otro encima sin salir (`sub`: «Nueva marca» desde el campo Marca): el de
 * debajo se queda montado con lo escrito, el nuevo entra deslizándose y, al guardarlo o volver
 * (flecha, Escape), se regresa al primero tal cual estaba.
 */
export function FormularioDialog({
  open,
  onOpenChange,
  ancho = "md",
  sub,
  onVolver,
  className,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  ancho?: keyof typeof ANCHOS
  /** El formulario que se trabaja encima del principal; `null` para volver. */
  sub?: React.ReactNode
  /** Volver del subformulario al principal (Escape hace lo mismo). */
  onVolver?: () => void
  className?: string
  children: React.ReactNode
}) {
  const conSub = !!sub
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn("flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0", ANCHOS[ancho], className)}
        onOpenAutoFocus={(e) => {
          // El foco va al primer campo, no a la cruz de la cabecera (lo primero que encontraría el diálogo).
          const campo = (e.currentTarget as HTMLElement | null)?.querySelector<HTMLElement>(CAMPOS_ENFOCABLES)
          if (!campo) return
          e.preventDefault()
          campo.focus()
        }}
        onEscapeKeyDown={(e) => {
          if (!conSub) return
          e.preventDefault()
          onVolver?.()
        }}
      >
        <PantallaActiva.Provider value={!conSub}>
          <div data-slot="formulario-pantalla" className={cn("flex min-h-0 flex-1 flex-col", conSub && "hidden")}>
            {children}
          </div>
        </PantallaActiva.Provider>
        {conSub && (
          <div data-slot="formulario-pantalla" className="flex min-h-0 flex-1 flex-col duration-200 animate-in fade-in-0 slide-in-from-right-6">
            {sub}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Cabecera de un formulario: el icono del objeto en su recuadro, el título, una frase debajo y la
 * cruz. En un subformulario lleva la flecha de volver y la miga del formulario de debajo
 * («Nueva collab › Nueva marca»). `accion` va junto a la cruz (el engranaje de configurarlo).
 */
export function FormularioCabecera({ icono: Icono, titulo, descripcion, migas, onVolver, accion }: { icono: LucideIcon; titulo: string; descripcion?: React.ReactNode; migas?: string; onVolver?: () => void; accion?: React.ReactNode }) {
  const activa = React.useContext(PantallaActiva)
  const Titulo = activa ? DialogTitle : "h2"
  const Descripcion = activa ? DialogDescription : "p"
  return (
    <div data-slot="formulario-cabecera" className="relative flex flex-none items-start gap-3 overflow-hidden border-b px-6 pt-5 pb-4">
      {/* La rejilla de fondo se desvanece hacia abajo: da profundidad a la cabecera sin competir con el título. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:28px_28px] opacity-70" />
      {onVolver && (
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Volver" onClick={onVolver} className="relative mt-1.5 -ml-2">
          <ArrowLeftIcon />
        </Button>
      )}
      <span className="relative grid size-10 flex-none place-items-center rounded-xl border bg-card text-brand shadow-xs">
        <Icono className="size-5" />
      </span>
      <div className="relative min-w-0 flex-1">
        {migas && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            {migas} <ChevronRightIcon className="size-3" />
          </p>
        )}
        <Titulo className={cn("text-base leading-snug font-semibold", !migas && "mt-0.5")}>{titulo}</Titulo>
        {descripcion && <Descripcion className="mt-0.5 text-[13px] text-muted-foreground">{descripcion}</Descripcion>}
      </div>
      <div className="relative -mr-2 flex flex-none items-center gap-1">
        {accion}
        <DialogClose asChild>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Cerrar">
            <XIcon />
          </Button>
        </DialogClose>
      </div>
    </div>
  )
}

/** El `form` de una pantalla: deja que el cuerpo se desplace y el pie se quede abajo. */
export function Formulario({ className, ...props }: React.ComponentProps<"form">) {
  return <form noValidate data-slot="formulario" className={cn("flex min-h-0 flex-1 flex-col", className)} {...props} />
}

/**
 * El cuerpo: una rejilla de seis columnas. Cada campo ocupa la fila entera, la mitad o un tercio
 * (`CampoFormulario ancho`); en el móvil, todos la fila entera.
 */
export function FormularioCuerpo({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="formulario-cuerpo" className={cn("min-h-0 flex-1 overflow-y-auto px-6 py-5", ESQUINAS_FORMULARIO)}>
      <div className={cn("grid grid-cols-6 gap-x-4 gap-y-5", className)} {...props} />
    </div>
  )
}

/**
 * El pie: a la izquierda lo secundario («Quitar de la lista», un aviso) y a la derecha «Cancelar» y la acción
 * principal. Siempre a la vista aunque el cuerpo se desplace.
 */
export function FormularioPie({ izquierda, className, children }: { izquierda?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div data-slot="formulario-pie" className={cn("flex flex-none flex-wrap items-center gap-2 border-t bg-muted/30 px-6 py-3.5", className)}>
      {izquierda && <div className="min-w-0 text-xs text-muted-foreground">{izquierda}</div>}
      <div className="ml-auto flex items-center gap-2">{children}</div>
    </div>
  )
}

const ANCHO_CAMPO = { completo: "col-span-6", mitad: "col-span-6 sm:col-span-3", tercio: "col-span-6 sm:col-span-2" }

/**
 * Un campo del formulario: la etiqueta encima (a la derecha, `accion`: un contador, un engranaje), el
 * control, la ayuda y el error debajo. Ningún campo es obligatorio (Xavier, 2026-10-14): lo que falta
 * se completa con su valor por defecto al guardar, y el error solo sale cuando lo escrito no vale
 * (un email mal puesto). Con error, solo la etiqueta y el borde en rojo. Los `Input` y `Textarea` que
 * lleva dentro toman el alto (40 px) y el radio de los controles del formulario: menos redondos que
 * los bloques que los contienen.
 */
export function CampoFormulario({
  etiqueta,
  htmlFor,
  ayuda,
  error,
  accion,
  ancho = "completo",
  className,
  children,
}: {
  etiqueta: React.ReactNode
  htmlFor?: string
  ayuda?: React.ReactNode
  error?: string
  accion?: React.ReactNode
  ancho?: keyof typeof ANCHO_CAMPO
  className?: string
  children: React.ReactNode
}) {
  return (
    <Field data-invalid={!!error || undefined} className={cn("gap-2 data-[invalid=true]:text-foreground *:data-[slot=input]:h-10 *:data-[slot=input]:rounded-md *:data-[slot=input-group]:h-10 *:data-[slot=input-group]:rounded-md *:data-[slot=textarea]:rounded-md", ANCHO_CAMPO[ancho], className)}>
      <div className="flex min-h-5 items-center justify-between gap-2">
        <FieldLabel htmlFor={htmlFor} className="text-[13px] font-medium group-data-[invalid=true]/field:text-destructive">
          {etiqueta}
        </FieldLabel>
        {accion}
      </div>
      {children}
      {ayuda && !error && <FieldDescription className="text-xs">{ayuda}</FieldDescription>}
      <FieldError errors={error ? [{ message: error }] : []} />
    </Field>
  )
}
