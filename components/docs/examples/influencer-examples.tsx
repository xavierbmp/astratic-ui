"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Block, BlockHeader } from "@/components/influencer/block"
import { TaskCard } from "@/components/influencer/task-card"
import { LinkGrid, type QuickLink } from "@/components/influencer/link-grid"
import { TaskTable } from "@/components/influencer/task-table"
import { HOY, demoEnlaces, demoMarcas, demoPropuestas, demoTareas } from "@/lib/influencer/demo-data"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { contextoDeTarea, grupoDeTarea, hrefDeTarea, type GrupoTarea } from "@/lib/influencer/tareas"
import { soloFecha } from "@/lib/influencer/fechas"
import type { Tarea } from "@/lib/influencer/modelo"

const hoy = soloFecha(HOY)
const contexto = { collabs: demoCollabs, propuestas: demoPropuestas, marcas: demoMarcas }

type Pestana = Extract<GrupoTarea, "hoy" | "semana" | "vencidas">

/** Bloque de tareas con pestañas y marcado, como en el Inicio (registro de mostrar). */
export function TaskBlockExample() {
  const [tareas, setTareas] = React.useState(demoTareas)
  const [pestana, setPestana] = React.useState<Pestana>("hoy")
  const pendientes = (g: GrupoTarea) => tareas.filter((t) => grupoDeTarea(t, hoy) === g).length
  return (
    <Block className="max-w-xl">
      <BlockHeader title="Tareas" count={tareas.filter((t) => !t.hecha).length} href="#" hrefLabel="Ver todo">
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
          .filter((t) => grupoDeTarea(t, hoy) === pestana)
          .map((t) => (
            <li key={t.id}>
              <TaskCard
                title={t.titulo}
                context={contextoDeTarea(t, contexto)}
                dueAt={t.fechaLimite ?? hoy}
                tone={pestana === "vencidas" ? "vencida" : pestana === "hoy" ? "hoy" : "normal"}
                done={t.hecha}
                onToggle={() => setTareas((ts) => ts.map((x) => (x.id === t.id ? { ...x, hecha: !x.hecha } : x)))}
              />
            </li>
          ))}
      </ul>
    </Block>
  )
}

/** La lista de tareas de operar: agrupada, editable en el sitio y con alta rápida. */
export function TaskTableExample() {
  const [tareas, setTareas] = React.useState<Tarea[]>(demoTareas.filter((t) => t.relacion?.id === "lumea"))
  return (
    <Block className="max-w-2xl">
      <BlockHeader title="Tareas de la collab" count={tareas.filter((t) => !t.hecha).length} />
      <TaskTable
        tareas={tareas}
        hoy={hoy}
        relacionFija={{ tipo: "collab", id: "lumea", label: "Lumea Skin · Rutina de noche" }}
        hrefDe={hrefDeTarea}
        onToggle={(id) => setTareas((ts) => ts.map((t) => (t.id === id ? { ...t, hecha: !t.hecha } : t)))}
        onUpdate={(t) => setTareas((ts) => ts.map((x) => (x.id === t.id ? t : x)))}
        onCreate={(t) => setTareas((ts) => [...ts, t])}
        onDelete={(ids) => setTareas((ts) => ts.filter((t) => !ids.includes(t.id)))}
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
