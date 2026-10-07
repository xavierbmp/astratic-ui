"use client"

import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"
import { fmt } from "@/lib/format"
import { ESTADOS_COBRO, ESTADOS_COLLAB, ESTADOS_PIEZA, ESTADOS_PROPUESTA, TIPOS_COLLAB, estadoDe, type Tarea } from "@/lib/influencer/modelo"
import { collabDe, hrefDonde, type ContextoTareas } from "@/lib/influencer/tareas"
import { importeDePlazo } from "@/lib/influencer/facturacion"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/app/status-badge"

/** El texto del enlace a donde se trabaja la tarea. */
function irA(d: Tarea["donde"]): string {
  switch (d.tipo) {
    case "collabs":
      return d.piezaId ? "Ir a la pieza" : d.collabId ? "Ir a la campaña" : "Ir a Collabs"
    case "cobros":
      return d.collabId ? "Ir a la facturación" : "Ir a Cobros"
    case "crm":
      return d.registro ? { propuesta: "Ir a la propuesta", marca: "Ir a la marca", contacto: "Ir al contacto" }[d.registro.tipo] : "Ir al CRM"
    default:
      return "Ir"
  }
}

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm">{children}</dd>
    </>
  )
}

function Datos({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1.5">{children}</dl>
}

/** Lo que hay que tener delante para hacer la tarea, según de qué es. */
function Contenido({ tarea, ctx }: { tarea: Tarea; ctx: ContextoTareas }) {
  const d = tarea.donde
  const collab = collabDe(d, ctx)
  if (collab) {
    const marca = ctx.marcas.find((m) => m.id === collab.marcaId)
    // De una pieza: la pieza; de Cobros: el cobro; si no, la campaña.
    const vista = d.tipo === "cobros" ? "cobros" : d.tipo === "collabs" && d.piezaId ? "pieza" : "campana"
    switch (vista) {
      case "pieza": {
        const piezas = collab.piezas.filter((p) => p.id === (d.tipo === "collabs" ? d.piezaId : undefined))
        return (
          <ul className="grid gap-2">
            {piezas.map((p) => {
              const e = estadoDe(ESTADOS_PIEZA, p.estado)
              return (
                <li key={p.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2">
                  <span className="grid min-w-0">
                    <span className="truncate text-sm font-medium">{p.titulo}</span>
                    <span className="text-xs text-muted-foreground">
                      Publicación {fmt.date(p.publicacion)} · ronda {p.rondaActual}
                    </span>
                  </span>
                  <StatusBadge tone={e.tone}>{e.label}</StatusBadge>
                </li>
              )
            })}
          </ul>
        )
      }
      case "cobros": {
        const cobro = estadoDe(ESTADOS_COBRO, collab.cobro.estado)
        return (
          <Datos>
            <Dato label="Cobro">
              <StatusBadge tone={cobro.tone}>{cobro.label}</StatusBadge>
            </Dato>
            <Dato label="Importe">
              {fmt.eur(collab.importe)}
              {collab.importeNeto !== undefined && <span className="text-muted-foreground"> · {fmt.eur(collab.importeNeto)} para ti</span>}
            </Dato>
            {collab.cobro.vencimiento && <Dato label="Vence">{fmt.date(collab.cobro.vencimiento)}</Dato>}
            {collab.plazos.map((p) => (
              <Dato key={p.id} label={`${p.porcentaje} %`}>
                {p.concepto} · {fmt.eur(importeDePlazo(collab, p))}
              </Dato>
            ))}
          </Datos>
        )
      }
      default: {
        const estado = estadoDe(ESTADOS_COLLAB, collab.estado)
        return (
          <Datos>
            <Dato label="Campaña">
              {marca?.nombre} · {collab.campana}
            </Dato>
            <Dato label="Estado">
              <StatusBadge tone={estado.tone}>{estado.label}</StatusBadge>
            </Dato>
            <Dato label="Tipo">{TIPOS_COLLAB[collab.tipo].label}</Dato>
            <Dato label="Importe">{fmt.eur(collab.importe)}</Dato>
            <Dato label="Publicación">
              {fmt.date(collab.desde)} – {fmt.date(collab.hasta)}
            </Dato>
            <Dato label="Piezas">
              {collab.piezas.length} · {collab.piezas.filter((p) => p.publicada).length} publicadas
            </Dato>
          </Datos>
        )
      }
    }
  }
  if (d.tipo === "crm" && d.registro) {
    const { tipo, id } = d.registro
    if (tipo === "propuesta") {
      const p = ctx.propuestas.find((x) => x.id === id)
      if (!p) return null
      const e = estadoDe(ESTADOS_PROPUESTA, p.estado)
      const contacto = ctx.contactos.find((c) => c.id === p.contactoId) ?? ctx.contactos.find((c) => c.marcaId === p.marcaId && c.principal)
      return (
        <Datos>
          <Dato label="Estado">
            <StatusBadge tone={e.tone}>{e.label}</StatusBadge>
          </Dato>
          <Dato label="Campaña">{p.campana}</Dato>
          {p.ofrecen !== undefined && <Dato label="Ofrecen">{fmt.eur(p.ofrecen)}</Dato>}
          {p.siguientePaso && (
            <Dato label="Siguiente paso">
              {p.siguientePaso}
              {p.siguienteFecha && <span className="text-muted-foreground"> · {fmt.date(p.siguienteFecha)}</span>}
            </Dato>
          )}
          {contacto && (
            <Dato label="Contacto">
              {contacto.nombre}
              {contacto.email && (
                <a href={`mailto:${contacto.email}`} className="ml-1 text-brand hover:underline">
                  {contacto.email}
                </a>
              )}
            </Dato>
          )}
        </Datos>
      )
    }
    if (tipo === "marca") {
      const m = ctx.marcas.find((x) => x.id === id)
      if (!m) return null
      const principal = ctx.contactos.find((c) => c.marcaId === m.id && c.principal)
      return (
        <Datos>
          <Dato label="Sector">{m.sector}</Dato>
          <Dato label="Contacto">{principal ? `${principal.nombre}${principal.email ? ` · ${principal.email}` : ""}` : <span className="text-warning">Sin contacto</span>}</Dato>
          {m.notas && <Dato label="Notas">{m.notas}</Dato>}
        </Datos>
      )
    }
    if (tipo === "contacto") {
      const c = ctx.contactos.find((x) => x.id === id)
      if (!c) return null
      return (
        <Datos>
          <Dato label="Marca">{ctx.marcas.find((m) => m.id === c.marcaId)?.nombre}</Dato>
          {c.cargo && <Dato label="Cargo">{c.cargo}</Dato>}
          {c.email && (
            <Dato label="Email">
              <a href={`mailto:${c.email}`} className="text-brand hover:underline">
                {c.email}
              </a>
            </Dato>
          )}
          {c.telefono && <Dato label="Teléfono">{c.telefono}</Dato>}
        </Datos>
      )
    }
  }
  return null
}

/** Si una tarea tiene algo que enseñar en «Para hacerla»: su campaña o su ficha del CRM. */
export const tieneContexto = (t: Tarea) => (t.donde.tipo === "collabs" || t.donde.tipo === "cobros" ? !!t.donde.collabId : t.donde.tipo === "crm" && !!t.donde.registro)

/**
 * El bloque de la derecha de una tarea (o de abajo, en la ficha estrecha): lo que hace falta
 * para hacerla según de qué es. De una campaña, su resumen, la pieza con su revisión o el cobro; del
 * CRM, la propuesta, la marca o el contacto. De consulta, con un enlace a donde se trabaja. Las que
 * no son de ninguna campaña ni ficha no tienen.
 */
export function TareaContexto({ tarea, ctx, className }: { tarea: Tarea; ctx: ContextoTareas; className?: string }) {
  const href = hrefDonde(tarea.donde)
  if (!tieneContexto(tarea)) return null
  return (
    <div className={className}>
      <div className="grid gap-3">
        <Contenido tarea={tarea} ctx={ctx} />
        {href && (
          <Button variant="outline" size="sm" asChild className="justify-self-start">
            <Link href={href}>
              {irA(tarea.donde)} <ArrowRightIcon />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
