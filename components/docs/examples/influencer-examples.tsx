"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Block, BlockHeader } from "@/components/influencer/block"
import { TaskCard } from "@/components/influencer/task-card"
import { LinkGrid } from "@/components/influencer/link-grid"
import { demoLinks, demoTasks, type TaskBucket } from "@/lib/influencer/demo-data"

/** Bloque de tareas con pestañas y marcado, como en el Inicio. */
export function TaskBlockExample() {
  const [tasks, setTasks] = React.useState(demoTasks)
  const [bucket, setBucket] = React.useState<TaskBucket>("hoy")
  const pending = (b: TaskBucket) => tasks.filter((t) => t.bucket === b && !t.done).length
  return (
    <Block className="max-w-xl">
      <BlockHeader title="Tareas" count={tasks.filter((t) => !t.done).length} href="#" hrefLabel="Ver todo">
        <Tabs value={bucket} onValueChange={(v) => setBucket(v as TaskBucket)} className="sm:ml-2">
          <TabsList variant="line" className="flex-wrap">
            <TabsTrigger value="hoy">Hoy <span className="ml-1 text-[11px] text-muted-foreground">{pending("hoy")}</span></TabsTrigger>
            <TabsTrigger value="semana">Esta semana <span className="ml-1 text-[11px] text-muted-foreground">{pending("semana")}</span></TabsTrigger>
            <TabsTrigger value="vencidas">Vencidas <span className="ml-1 text-[11px] text-muted-foreground">{pending("vencidas")}</span></TabsTrigger>
          </TabsList>
        </Tabs>
      </BlockHeader>
      <ul className="flex flex-col gap-2">
        {tasks
          .filter((t) => t.bucket === bucket)
          .map((t) => (
            <li key={t.id}>
              <TaskCard
                title={t.title}
                context={t.context}
                dueAt={t.dueAt}
                tone={t.bucket === "vencidas" ? "vencida" : t.bucket === "hoy" ? "hoy" : "normal"}
                done={t.done}
                onToggle={() => setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
              />
            </li>
          ))}
      </ul>
    </Block>
  )
}

/** Directorio de enlaces con su modo de edición. */
export function LinkGridExample() {
  const [links, setLinks] = React.useState(demoLinks)
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
