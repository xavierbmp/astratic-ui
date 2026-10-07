"use client"

import * as React from "react"
import { ChevronRightIcon, Settings2Icon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DetailField, DetailFields } from "@/components/app/detail-sheet"
import { useLocalStorage } from "@/hooks/use-local-storage"

export type CampoInfo = {
  id: string
  label: string
  /** Sin valor: no ocupa fila, sale como «+ Campo» al pie (como en `DetailFields`). */
  empty?: boolean
  /** Pulsar el nombre del campo abre su configuración (`DetailField onConfig`). */
  onConfig?: () => void
  /** El valor, editable en el sitio (`InlineField`). */
  children: React.ReactNode
}

/** Lo que cada persona decide de este bloque, por tipo de ficha y en su navegador. */
type ConfigInfo = { siempreAbierto?: boolean; resumen?: string[]; ocultos?: string[] }

/**
 * El bloque «Información» de una ficha: plegado enseña solo lo esencial (el resumen) y desplegado
 * todos los campos, editables donde se leen. Su engranaje deja a cada persona elegir qué campos se
 * ven, cuáles van en el resumen y si el bloque se abre siempre desplegado. Se recuerda por tipo de
 * ficha (`storageKey`: `propuesta.info`) en su navegador.
 */
export function DetailInfo({
  fields,
  resumen,
  storageKey,
  title = "Información",
  columns = 2,
  className,
}: {
  /** Todos los campos, en su orden. */
  fields: CampoInfo[]
  /** Los ids que se ven con el bloque plegado, de serie. */
  resumen: string[]
  storageKey: string
  title?: string
  columns?: 1 | 2
  className?: string
}) {
  const [config, setConfig] = useLocalStorage<ConfigInfo>(`ficha-info:${storageKey}`, {})
  const [abiertoGuardado, setAbierto] = useLocalStorage(`ficha-info-abierto:${storageKey}`, false)
  const ocultos = new Set(config.ocultos ?? [])
  const enResumen = new Set(config.resumen ?? resumen)
  const abierto = config.siempreAbierto || abiertoGuardado
  const visibles = fields.filter((f) => !ocultos.has(f.id))
  const delResumen = visibles.filter((f) => enResumen.has(f.id))
  // Plegado y sin nada en el resumen, se enseña todo: un bloque vacío no dice nada.
  const aPintar = abierto || delResumen.length === 0 ? visibles : delResumen
  const restantes = visibles.length - aPintar.length

  const alternar = (lista: "resumen" | "ocultos", id: string, activo: boolean) =>
    setConfig((c) => {
      const actual = new Set(lista === "resumen" ? (c.resumen ?? resumen) : (c.ocultos ?? []))
      if (activo) actual.add(id)
      else actual.delete(id)
      return { ...c, [lista]: [...actual] }
    })

  return (
    <section data-slot="detail-info" className={cn("border-b px-4 py-3", className)}>
      <div className="flex min-h-6 items-center gap-2">
        <h3 className="flex min-w-0 flex-1 text-[13px] font-semibold">
          <button
            type="button"
            aria-expanded={abierto}
            disabled={config.siempreAbierto}
            onClick={() => setAbierto(!abierto)}
            className="-mx-1 flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 text-left outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50 disabled:hover:bg-transparent"
          >
            {!config.siempreAbierto && <ChevronRightIcon className={cn("size-3.5 flex-none text-muted-foreground transition-transform", abierto && "rotate-90")} aria-hidden />}
            <span className="flex-none">{title}</span>
          </button>
        </h3>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-xs" aria-label={`Configurar «${title}»`} title={`Configurar «${title}»`} className="text-muted-foreground hover:text-foreground">
              <Settings2Icon />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-72 p-0">
            <label className="flex items-center justify-between gap-3 border-b px-3 py-2.5 text-sm">
              Siempre desplegado
              <Switch checked={!!config.siempreAbierto} onCheckedChange={(v) => setConfig((c) => ({ ...c, siempreAbierto: v }))} />
            </label>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-1 px-3 py-2 text-sm">
              <span className="text-xs text-muted-foreground">Campo</span>
              <span className="text-xs text-muted-foreground">Resumen</span>
              <span className="text-xs text-muted-foreground">Se ve</span>
              {fields.map((f) => {
                const visible = !ocultos.has(f.id)
                return (
                  <React.Fragment key={f.id}>
                    <span className={cn("truncate", !visible && "text-muted-foreground")}>{f.label}</span>
                    <Checkbox
                      aria-label={`«${f.label}» en el resumen`}
                      checked={visible && enResumen.has(f.id)}
                      disabled={!visible}
                      onCheckedChange={(v) => alternar("resumen", f.id, v === true)}
                      className="justify-self-center"
                    />
                    <Switch aria-label={`Ver «${f.label}»`} checked={visible} onCheckedChange={(v) => alternar("ocultos", f.id, !v)} className="justify-self-center" />
                  </React.Fragment>
                )
              })}
            </div>
            <div className="border-t px-3 py-1.5">
              <button type="button" className="text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline" onClick={() => setConfig({})}>
                Volver a lo de serie
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="mt-2 grid gap-1.5">
        <DetailFields columns={columns}>
          {aPintar.map((f) => (
            <DetailField key={f.id} label={f.label} empty={f.empty} onConfig={f.onConfig}>
              {f.children}
            </DetailField>
          ))}
        </DetailFields>
        {!abierto && restantes > 0 && (
          <button type="button" onClick={() => setAbierto(true)} className="justify-self-start text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">
            Ver {restantes} {restantes === 1 ? "campo más" : "campos más"}
          </button>
        )}
      </div>
    </section>
  )
}
