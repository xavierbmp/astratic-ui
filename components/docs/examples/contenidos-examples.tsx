"use client"

import * as React from "react"
import { DndContext } from "@dnd-kit/core"
import { demoApuntes, demoCarpetas, demoContenidos, demoFechasClave, demoPilares } from "@/lib/influencer/demo-contenidos"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { HOY, demoMarcas } from "@/lib/influencer/demo-data"
import { estadoDeIdea } from "@/lib/influencer/apuntes"
import { antesDePublicar, entradasDeContenidos, entradasDeFechasClave, entradasDePiezas } from "@/lib/influencer/planificacion"
import type { Contenido } from "@/lib/influencer/modelo"
import { ApunteCard, COLUMNAS_GALERIA } from "@/components/influencer/apunte-card"
import { CapturaIdea } from "@/components/influencer/captura-idea"
import { CalendarioContenidos } from "@/components/influencer/calendario-contenidos"
import { AgendaContenidos } from "@/components/influencer/agenda-contenidos"
import { EditorCaption } from "@/components/influencer/editor-caption"
import { AntesDePublicar } from "@/components/influencer/antes-de-publicar"

const HOY_DIA = HOY.slice(0, 10)
const entradas = [...entradasDeContenidos(demoContenidos, demoPilares), ...entradasDePiezas(demoCollabs, demoMarcas), ...entradasDeFechasClave(demoFechasClave)]

/** Tres ideas de la galería: con captura, con enlace y un documento. */
export function GaleriaIdeasExample() {
  const ids = ["a-dupes-serums", "a-audio-grwm", "a-ganchos"]
  return (
    <div className={`grid w-full gap-3 ${COLUMNAS_GALERIA.mediana}`}>
      {demoApuntes
        .filter((a) => ids.includes(a.id))
        .map((a) => (
          <ApunteCard
            key={a.id}
            apunte={a}
            estado={estadoDeIdea(a, demoContenidos)}
            pilar={demoPilares.find((p) => p.id === a.pilarId)}
            carpeta={demoCarpetas.find((c) => c.id === a.carpetaId)}
            hoy={HOY_DIA}
            propiedades={["estado", "pilar", "formato"]}
            onAbrir={() => undefined}
            onFavorito={() => undefined}
          />
        ))}
    </div>
  )
}

export function CapturaIdeaExample() {
  const [ultima, setUltima] = React.useState<string | null>(null)
  return (
    <div className="grid w-full gap-2">
      <CapturaIdea onApuntar={setUltima} onDocumento={() => undefined} destino="Tendencias" />
      {ultima && <p className="text-xs text-muted-foreground">Apuntada: «{ultima}»</p>}
    </div>
  )
}

/** La semana del calendario; en la página, el `DndContext` lo pone la vista para poder soltar ideas. */
export function CalendarioContenidosExample() {
  return (
    <DndContext>
      <div className="w-full">
        <CalendarioContenidos entradas={entradas} hoy={HOY_DIA} ancla={HOY_DIA} modo="semana" onAbrir={() => undefined} onNuevo={() => undefined} />
      </div>
    </DndContext>
  )
}

export function AgendaContenidosExample() {
  return (
    <div className="w-full max-w-md">
      <AgendaContenidos entradas={entradas} hoy={HOY_DIA} desde={HOY_DIA} dias={5} onAbrir={() => undefined} onNuevo={() => undefined} />
    </div>
  )
}

export function CaptionExample() {
  const [contenido, setContenido] = React.useState<Contenido>(() => {
    const base = demoContenidos.find((c) => c.id === "c-rutina-noche") ?? demoContenidos[0]
    return { ...base, caption: `${base.caption} #rutina #noche` }
  })
  return (
    <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <EditorCaption valor={contenido} onCambiar={(cambio) => setContenido((c) => ({ ...c, ...cambio }))} />
      <AntesDePublicar pasos={antesDePublicar(contenido)} />
    </div>
  )
}
