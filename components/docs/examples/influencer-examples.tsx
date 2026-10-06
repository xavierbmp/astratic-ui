"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Block, BlockHeader } from "@/components/influencer/block"
import { TaskCard } from "@/components/influencer/task-card"
import { LinkGrid, type QuickLink } from "@/components/influencer/link-grid"
import { TaskTable } from "@/components/influencer/task-table"
import { HOY, demoContactos, demoEnlaces, demoEtiquetasTarea, demoMarcas, demoPropuestas, demoTareas } from "@/lib/influencer/demo-data"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { cuandoDe, textoDonde, type CuandoTarea } from "@/lib/influencer/tareas"
import { alternarHecha, borrarTareas, crearTareas, conSubtareas, guardarTarea } from "@/lib/influencer/tareas-cambios"
import { soloFecha } from "@/lib/influencer/fechas"
import type { DondeTarea, Tarea } from "@/lib/influencer/modelo"

const hoy = soloFecha(HOY)
const ctx = { collabs: demoCollabs, propuestas: demoPropuestas, marcas: demoMarcas, contactos: demoContactos }
const reloj = { hoy, ahora: HOY, id: (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}` }

type Pestana = Extract<CuandoTarea, "hoy" | "semana" | "vencidas">

/** Bloque de tareas con pestañas y marcado, como en el Inicio (registro de mostrar). */
export function TaskBlockExample() {
  const [tareas, setTareas] = React.useState(demoTareas.filter((t) => !t.padreId))
  const [pestana, setPestana] = React.useState<Pestana>("hoy")
  const pendientes = (g: CuandoTarea) => tareas.filter((t) => cuandoDe(t, hoy) === g).length
  return (
    <Block className="max-w-xl">
      <BlockHeader title="Tareas" count={tareas.filter((t) => t.estado !== "hecha").length} href="#" hrefLabel="Ver todo">
        <Tabs value={pestana} onValueChange={(v) => setPestana(v as Pestana)} className="sm:ml-2">
          <TabsList variant="line" className="flex-wrap">
            <TabsTrigger value="hoy">Hoy <span className="ml-1 text-[11px] text-muted-foreground">{pendientes("hoy")}</span></TabsTrigger>
            <TabsTrigger value="semana">Esta semana <span className="ml-1 text-[11px] text-muted-foreground">{pendientes("semana")}</span></TabsTrigger>
            <TabsTrigger value="vencidas">Vencidas <span className="ml-1 text-[11px] text-muted-foreground">{pendientes("vencidas")}</span></TabsTrigger>
          </TabsList>
        </Tabs>
      </BlockHeader>
      <ul className="flex flex-col gap-2">
        {tareas
          .filter((t) => cuandoDe(t, hoy) === pestana)
          .map((t) => (
            <li key={t.id}>
              <TaskCard
                title={t.titulo}
                context={textoDonde(t.donde, ctx)}
                dueAt={t.fecha ?? t.fechaLimite ?? hoy}
                tone={pestana === "vencidas" ? "vencida" : pestana === "hoy" ? "hoy" : "normal"}
                done={t.estado === "hecha"}
                onToggle={() => setTareas((ts) => alternarHecha(ts, t.id, ctx, reloj).tareas)}
              />
            </li>
          ))}
      </ul>
    </Block>
  )
}

const DONDE_LUMEA: DondeTarea = { pagina: "campanas", tipo: "contenidos", collabId: "lumea" }

/** La lista de tareas de un sitio (aquí, los contenidos de una campaña): agrupada por cuándo tocan y con alta rápida. */
export function TaskTableExample() {
  const [tareas, setTareas] = React.useState<Tarea[]>(demoTareas)
  const deLumea = tareas.filter((t) => t.donde.pagina === "campanas" && t.donde.collabId === "lumea" && t.donde.tipo === "contenidos")
  return (
    <Block className="max-w-2xl">
      <BlockHeader title="Tareas de los contenidos" count={deLumea.filter((t) => t.estado !== "hecha" && !t.padreId).length} />
      <TaskTable
        tareas={deLumea}
        todas={tareas}
        hoy={hoy}
        ctx={ctx}
        etiquetas={demoEtiquetasTarea}
        donde={DONDE_LUMEA}
        acciones={{
          onAbrir: () => {},
          onToggle: (t) => setTareas((ts) => alternarHecha(ts, t.id, ctx, reloj).tareas),
          onCrear: (t, subtareas) => setTareas((ts) => crearTareas(ts, conSubtareas(t, subtareas, reloj))),
          onGuardarVarias: (cambiadas) => setTareas((ts) => cambiadas.reduce((acc, t) => guardarTarea(acc, t, ctx, reloj).tareas, ts)),
          onBorrarVarias: (ids) => setTareas((ts) => borrarTareas(ts, ids).tareas),
        }}
      />
    </Block>
  )
}

/** Directorio de enlaces con su modo de edición. */
export function LinkGridExample() {
  const [links, setLinks] = React.useState<QuickLink[]>(demoEnlaces.map((e) => ({ id: e.id, label: e.etiqueta, url: e.url })))
  const [editing, setEditing] = React.useState(false)
  return (
    <Block className="max-w-sm">
      <BlockHeader
        title="Mis enlaces"
        action={
          <Button variant={editing ? "default" : "ghost"} size="sm" onClick={() => setEditing((e) => !e)}>
            {editing ? "Listo" : "Editar"}
          </Button>
        }
      />
      <LinkGrid links={links} onChange={setLinks} editing={editing} />
    </Block>
  )
}
