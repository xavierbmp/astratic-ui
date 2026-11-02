"use client"

import * as React from "react"
import { ArrowUpRightIcon } from "lucide-react"
import { cn } from "cn"
import { initials } from "@/lib/format"

/** La imagen de portada de serie, para los registros que no tienen una propia. */
export const PORTADA_FICHA = "/ficha/portada-nubes.jpg"

/** Una imagen que viene de un dato: solo enlaces http(s) o rutas de la propia app. */
const imagenSegura = (url: string | null | undefined) => (url && (/^https?:\/\//i.test(url) || /^\/[^/]/.test(url)) ? url : null)

/**
 * La cabecera de un registro, con la portada, la foto encima de su borde, el nombre, una línea sobre quién es y un dato
 * a la derecha (el marcador de encaje, por ejemplo). Debajo van la fila de redes o de datos (`FichaColumnas`) y la banda
 * de cifras (`FichaMetricas`), como hijos.
 */
export function FichaCabecera({
  portada,
  sobrePortada,
  foto,
  nombre,
  iniciales,
  titulo,
  insignias,
  descripcion,
  derecha,
  compacta,
  className,
  children,
}: {
  /** La imagen de la portada. Sin ella, o si no es un enlace válido, la de serie. */
  portada?: string | null
  /** Lo que va encima de la portada, arriba a la derecha: el botón de la etapa. */
  sobrePortada?: React.ReactNode
  foto?: string | null
  /** Para las iniciales de la foto y su texto alternativo. */
  nombre: string
  iniciales?: string
  /** El título: el nombre o `InlineTitle` para editarlo. Sin él, `nombre`. */
  titulo?: React.ReactNode
  /** Lo que va al lado del título: «Archivada · Rendimiento bajo». */
  insignias?: React.ReactNode
  descripcion?: React.ReactNode
  derecha?: React.ReactNode
  /** Con la portada más baja y la foto más pequeña, para cuando la cabecera comparte página con el trabajo (la cola de revisión). */
  compacta?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <section data-slot="ficha-cabecera" className={cn("relative rounded-ficha-cabecera bg-ficha-superficie shadow-ficha", className)}>
      <div className="px-2 pt-2">
        <div className={cn("relative rounded-ficha-portada bg-ficha-portada", compacta ? "h-[60px]" : "h-[92px]")}>
          {/* eslint-disable-next-line @next/next/no-img-element -- enlace firmado o externo: no pasa por el optimizador */}
          <img src={imagenSegura(portada) ?? PORTADA_FICHA} alt="" className="absolute inset-0 size-full rounded-ficha-portada object-cover object-[center_58%] dark:brightness-75" />
          {sobrePortada && <div className="absolute top-2.5 right-2.5">{sobrePortada}</div>}
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-x-[22px] gap-y-2 px-[26px]">
        <FotoFicha foto={foto} nombre={nombre} iniciales={iniciales} compacta={compacta} />
        <div className={cn("min-w-0 flex-[1_1_300px]", compacta ? "pt-2" : "pt-3")}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <h1 className={cn("m-0 min-w-0 leading-[1.15] font-medium tracking-[-0.02em]", compacta ? "text-[22px]" : "text-[26px]")}>{titulo ?? nombre}</h1>
            {insignias}
          </div>
          {descripcion && <div className="mt-[3px] text-[14.5px] leading-normal text-pretty text-ficha-tinta-2">{descripcion}</div>}
        </div>
        {derecha && <div className={cn("flex items-center gap-3", compacta ? "pt-3" : "pt-[18px]")}>{derecha}</div>}
      </div>
      {children ?? <div className="h-[22px]" />}
    </section>
  )
}

function FotoFicha({ foto, nombre, iniciales, compacta }: { foto?: string | null; nombre: string; iniciales?: string; compacta?: boolean }) {
  return (
    <div className={cn("relative z-[1] box-border flex-none rounded-full bg-ficha-superficie p-[5px]", compacta ? "-mt-8 size-[72px]" : "-mt-[50px] size-[100px]")}>
      <div className={cn("grid size-full place-items-center overflow-hidden rounded-full bg-ficha-relleno-2 font-medium", compacta ? "text-xl" : "text-[28px]", " tracking-[-0.01em] text-ficha-tinta-2 shadow-[inset_0_2px_6px_rgb(0_0_0_/_0.08)]")}>
        {imagenSegura(foto) ? (
          // eslint-disable-next-line @next/next/no-img-element -- enlace firmado o externo: no pasa por el optimizador
          <img src={imagenSegura(foto) ?? undefined} alt={nombre} className="size-full object-cover" />
        ) : (
          (iniciales ?? initials(nombre.replace(/^@/, "")))
        )}
      </div>
    </div>
  )
}

/** La fila de columnas de la cabecera, separadas por rayas finas: una por red o una por dato principal. */
export function FichaColumnas({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("mt-4 overflow-hidden", className)}>
      <div className="-ml-px flex flex-wrap" {...props} />
    </div>
  )
}

/** Una columna de la fila: arriba su cuenta y su cifra grande (enlace si tiene `href`), abajo sus dos datos. */
export function FichaColumna({
  icono,
  titulo,
  insignia,
  cifra,
  detalle,
  href,
  pie,
  base = 280,
}: {
  icono?: React.ReactNode
  titulo: React.ReactNode
  /** «Principal». */
  insignia?: React.ReactNode
  cifra: React.ReactNode
  detalle?: React.ReactNode
  /** A dónde lleva la flecha de arriba a la derecha. */
  href?: string
  pie?: React.ReactNode
  base?: number
}) {
  return (
    <div className="box-border flex min-w-0 flex-col border-t border-l border-ficha-raya" style={{ flex: `1 1 ${base}px` }}>
      <div className="px-[22px] pt-3.5 pb-3">
        <div className="flex min-w-0 items-center gap-[9px]">
          {icono && <span className="flex size-[18px] flex-none items-center justify-center [&_svg]:size-[18px]">{icono}</span>}
          <span className="min-w-0 truncate text-[14.5px] font-medium">{titulo}</span>
          {insignia}
          <span className="flex-1" />
          {href && (
            <a href={href} target="_blank" rel="noreferrer" aria-label="Abrir en otra pestaña" className="flex-none rounded-md text-ficha-tinta-2 outline-none hover:text-ficha-tinta focus-visible:ring-2 focus-visible:ring-ring/50">
              <ArrowUpRightIcon className="size-[15px]" strokeWidth={1.8} aria-hidden />
            </a>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[26px] leading-[1.15] font-medium tracking-[-0.02em] tabular-nums">{cifra}</span>
          {detalle && <span className="text-[13.5px] text-ficha-tinta-2">{detalle}</span>}
        </div>
      </div>
      {pie && <div className="mt-auto flex border-t border-ficha-raya">{pie}</div>}
    </div>
  )
}

/** Uno de los dos datos del pie de una columna. El primero sangra con el resto de la columna (`primero`). */
export function FichaColumnaDato({ etiqueta, primero, children }: { etiqueta: React.ReactNode; primero?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("box-border flex min-w-0 flex-[1_1_0px] flex-col gap-px pt-[9px] pr-4 pb-2.5", primero ? "pl-[22px]" : "border-l border-ficha-raya pl-4")}>
      <span className="truncate text-[13px] text-ficha-tinta-2">{etiqueta}</span>
      <span className="min-w-0 text-[15px] font-medium tabular-nums">{children}</span>
    </div>
  )
}

/** La insignia blanca de «Principal». */
export function InsigniaFicha({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("inline-flex h-[21px] flex-none items-center rounded-full bg-ficha-superficie px-2 text-[11.5px] font-medium shadow-ficha-chip", className)} {...props} />
}

/** La banda gris de cifras al pie de la cabecera. */
export function FichaMetricas({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("overflow-hidden rounded-b-ficha-cabecera bg-ficha-fondo", className)}>
      <div className="-ml-px flex flex-wrap" {...props} />
    </div>
  )
}

export function FichaMetrica({ etiqueta, title, children }: { etiqueta: React.ReactNode; title?: string; children: React.ReactNode }) {
  return (
    <div title={title} className="box-border flex min-w-0 flex-[1_1_110px] flex-col items-center gap-px border-t border-l border-t-ficha-raya border-l-ficha-raya-banda px-2.5 pt-2.5 pb-[11px] text-center">
      <span className="max-w-full truncate text-[15px] font-medium whitespace-nowrap tabular-nums">{children}</span>
      <span className="text-[12.5px] text-ficha-tinta-2">{etiqueta}</span>
    </div>
  )
}
