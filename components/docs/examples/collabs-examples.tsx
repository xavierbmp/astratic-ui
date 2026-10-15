"use client"

import * as React from "react"
import { HOY } from "@/lib/influencer/demo-data"
import { demoCollabs } from "@/lib/influencer/demo-collabs"
import { PIEZA_VACIA, type PiezaPedidaForm } from "@/lib/influencer/formularios"
import { fasesDePieza, moverPieza } from "@/lib/influencer/cronograma"
import { etiquetaDePieza } from "@/lib/influencer/collabs"
import { Gantt } from "@/components/influencer/gantt"
import { CheckIcon, XIcon } from "lucide-react"
import { EditorTexto, type EstadoSugerencia } from "@/components/influencer/editor-texto"
import { aplicarCambiosHtml } from "@/components/influencer/editor-aplicar"
import { sincronizarSugerencias, tipoDeCambio, type CambioTexto, type Tramo } from "@/lib/revision-sugerencias"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReproductorNotas, type NotaEnVideo } from "@/components/app/reproductor-notas"
import { Conversacion } from "@/components/influencer/conversacion"
import { VisorMedia } from "@/components/influencer/visor-media"
import { PiezasEditor } from "@/components/influencer/piezas-editor"
import { PlataformasEditor } from "@/components/influencer/plataformas"
import { CONDICIONES_DE_SERIE } from "@/lib/influencer/ajustes-collabs"

const [lumea, , vero, glow] = demoCollabs

/** El cronograma de Lumea Skin: arrastra una fila para mover sus fechas. */
export function GanttExample() {
  const [piezas, setPiezas] = React.useState(lumea.piezas)
  return (
    <Gantt
      className="w-full"
      hoy={HOY}
      filas={piezas.map((p) => ({ id: p.id, titulo: p.titulo, subtitulo: etiquetaDePieza(p), fases: fasesDePieza(p), publicacion: p.publicacion, publicada: !!p.publicada }))}
      onMover={(id, dias) => setPiezas((ps) => ps.map((p) => (p.id === id ? moverPieza(p, dias) : p)))}
    />
  )
}

/** El guion del reel de Lumea con la nota de la marca marcada en el texto. */
export function EditorGuionExample() {
  const v = lumea.piezas[0].guion[0]
  const [texto, setTexto] = React.useState(v.texto ?? "")
  const [nota, setNota] = React.useState<string | null>(null)
  const marcas = v.notas.flatMap((n, i) => (n.ancla?.tipo === "texto" ? [{ id: n.id, numero: i + 1, cita: n.ancla.cita, resuelta: n.resuelta }] : []))
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-2xl bg-card shadow-card">
      <EditorTexto value={texto} onChange={setTexto} notas={marcas} notaSeleccionada={nota} onSeleccionarNota={setNota} className="h-full" contenidoClassName="px-6 py-5" />
    </div>
  )
}

type SugerenciaDemo = { id: string; cambio: CambioTexto; estado: EstadoSugerencia }

/** Las sugerencias tras escribir: se crean, se cambian o se retiran las que siguen abiertas. */
function conCambios(lista: SugerenciaDemo[], { original, tramos }: { original: string; tramos: Tramo[] }, nuevoId: () => string): SugerenciaDemo[] {
  const r = sincronizarSugerencias(original, tramos, lista.filter((s) => s.estado === "pendiente"))
  if (!r.crear.length && !r.cambiar.length && !r.retirar.length) return lista
  const cambiadas = lista.filter((s) => !r.retirar.includes(s.id)).map((s) => ({ ...s, cambio: r.cambiar.find((c) => c.id === s.id)?.cambio ?? s.cambio }))
  return [...cambiadas, ...r.crear.map((cambio): SugerenciaDemo => ({ id: nuevoId(), cambio, estado: "pendiente" }))]
}

/** El guion de Lumea revisado como en Google Docs: la marca escribe sugiriendo y la creadora acepta o rechaza cada cambio. */
export function SugerenciasGuionExample() {
  const original = lumea.piezas[0].guion[0].texto ?? ""
  const [modo, setModo] = React.useState<"sugerir" | "ver">("sugerir")
  const [sugerencias, setSugerencias] = React.useState<SugerenciaDemo[]>([])
  const [seleccionada, setSeleccionada] = React.useState<string | null>(null)
  const [siguiente, setSiguiente] = React.useState<string | null>(null)
  const contador = React.useRef(0)
  const decidir = (s: SugerenciaDemo, estado: EstadoSugerencia) => {
    setSugerencias((ss) => ss.map((x) => (x.id === s.id ? { ...x, estado } : x)))
    if (estado === "aceptada") setSiguiente((html) => aplicarCambiosHtml(html ?? original, [s.cambio]).html)
  }
  const marcas = sugerencias.map((s, i) => ({ id: s.id, numero: i + 1, cambio: s.cambio, estado: s.estado }))
  return (
    <div className="grid w-full gap-3 lg:grid-cols-[minmax(0,1fr)_260px]">
      <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl bg-card shadow-card">
        <Tabs value={modo} onValueChange={(v) => setModo(v === "ver" ? "ver" : "sugerir")} className="border-b px-3 py-2">
          <TabsList>
            <TabsTrigger value="sugerir">Sugerir cambios</TabsTrigger>
            <TabsTrigger value="ver">Ver sugerencias</TabsTrigger>
          </TabsList>
        </Tabs>
        <EditorTexto
          key={modo}
          value={original}
          editable={modo === "sugerir"}
          sugerir={modo === "sugerir" ? { pendientes: sugerencias.filter((s) => s.estado === "pendiente").map((s) => s.cambio), onCambios: (c) => setSugerencias((ss) => conCambios(ss, c, () => `sg-${++contador.current}`)) } : undefined}
          sugerencias={modo === "ver" ? marcas : undefined}
          notaSeleccionada={seleccionada}
          onSeleccionarNota={setSeleccionada}
          className="min-h-0 flex-1"
          contenidoClassName="px-6 py-5"
        />
      </div>
      <ol className="flex flex-col gap-2 text-sm">
        {sugerencias.length === 0 && <li className="rounded-xl border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">Borra o escribe en el guion: cada cambio sale aquí como sugerencia.</li>}
        {sugerencias.map((s, i) => (
          <li key={s.id} className="rounded-xl border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              {i + 1} · {tipoDeCambio(s.cambio) === "anadir" ? "Añadir" : tipoDeCambio(s.cambio) === "quitar" ? "Quitar" : "Reemplazar"} · {s.estado}
            </p>
            <p className="mt-1">
              {s.cambio.cita && <del className="rounded-sm bg-danger-soft text-danger">{s.cambio.cita}</del>} {s.cambio.poner && <ins className="rounded-sm bg-success-soft text-success no-underline">{s.cambio.poner}</ins>}
            </p>
            {s.estado === "pendiente" && modo === "ver" && (
              <div className="mt-2 flex gap-1.5">
                <Button size="sm" variant="outline" onClick={() => decidir(s, "aceptada")}>
                  <CheckIcon /> Aceptar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => decidir(s, "rechazada")}>
                  <XIcon /> Rechazar
                </Button>
              </div>
            )}
          </li>
        ))}
        {siguiente && (
          <li className="overflow-hidden rounded-xl border bg-card">
            <p className="border-b px-3 py-2 text-xs font-medium">La v2, con lo aceptado</p>
            <EditorTexto value={siguiente} editable={false} className="max-h-48" contenidoClassName="px-3 py-2 text-xs" />
          </li>
        )}
      </ol>
    </div>
  )
}

/** El vídeo de Maison Vero como lo revisa la marca: pulsar en el vídeo deja una nota en ese segundo y ese punto. */
export function ReproductorNotasExample({ videoUrl }: { videoUrl?: string }) {
  const v = vero.piezas[0].media[0]
  const iniciales = v.notas.flatMap((n, i): NotaEnVideo[] => (n.ancla?.tipo === "segundo" ? [{ id: n.id, numero: i + 1, segundo: n.ancla.segundo, autor: n.autor, texto: n.texto, resuelta: n.resuelta }] : []))
  const [notas, setNotas] = React.useState(iniciales)
  const [nota, setNota] = React.useState<string | null>(null)
  return (
    <div className="flex w-full flex-wrap items-start justify-center gap-6 rounded-2xl bg-card p-6 shadow-card">
      <ReproductorNotas
        videoUrl={videoUrl}
        portadaUrl={v.archivos?.[0]?.url}
        duracion={v.archivos?.[0]?.duracion}
        ancho={280}
        notas={notas}
        seleccionada={nota}
        onSeleccionar={setNota}
        onAnotar={({ segundo, x, y, texto }) => setNotas((ns) => [...ns, { id: `nv-${ns.length + 1}`, numero: ns.length + 1, segundo, x, y, autor: "Marca", texto, resuelta: false }])}
      />
      <ol className="flex w-64 flex-col gap-2 text-sm">
        {notas.map((n) => (
          <li key={n.id}>
            <button type="button" onClick={() => setNota(n.id)} className={`w-full rounded-xl border p-2.5 text-left ${nota === n.id ? "border-brand ring-1 ring-brand" : "hover:border-input"}`}>
              <span className="font-mono text-xs text-muted-foreground">
                {n.numero} · {Math.floor(n.segundo / 60)}:{String(Math.floor(n.segundo % 60)).padStart(2, "0")}
              </span>
              <span className="block">{n.texto}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** El vídeo de Maison Vero con las dos notas de la marca y su conversación. */
export function RevisionExample() {
  const v = vero.piezas[0].media[0]
  const [nota, setNota] = React.useState<string | null>(null)
  return (
    <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="overflow-hidden rounded-2xl bg-card shadow-card">
        <VisorMedia version={v} medio="video" notas={v.notas} seleccionada={nota} onSeleccionar={setNota} tint={vero.tint} className="h-[520px]" />
      </div>
      <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl bg-card shadow-card">
        <Conversacion notas={v.notas} mensajes={v.mensajes} lado="influencer" seleccionada={nota} onSeleccionar={setNota} className="flex-1" />
      </div>
    </div>
  )
}

/** Las fotos del carrusel de Glow Studio con la nota clavada en la segunda. */
export function FotosExample() {
  const v = glow.piezas[1].media[0]
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-card shadow-card">
      <VisorMedia version={v} medio="imagen" notas={v.notas} zoom={75} tint={glow.tint} className="h-[420px]" />
    </div>
  )
}

/** «Añadir pieza», como lo ve la marca en su formulario. */
export function PiezasEditorExample() {
  const [piezas, setPiezas] = React.useState<PiezaPedidaForm[]>([
    { ...PIEZA_VACIA, titulo: "Reel de la rutina de noche", publicacion: "2026-10-15" },
    { ...PIEZA_VACIA, formato: "carrusel", tipo: "carrusel", titulo: "Carrusel con los tres pasos", publicacion: "2026-10-18", requiereGuion: false },
  ])
  const [plataformas, setPlataformas] = React.useState(["instagram"])
  return (
    <div className="flex w-full flex-col gap-4">
      <PlataformasEditor value={plataformas} onChange={setPlataformas} />
      <PiezasEditor value={piezas} onChange={setPiezas} plataformas={plataformas} condiciones={CONDICIONES_DE_SERIE} hoy="2026-10-06" campana="Rutina de noche" />
    </div>
  )
}
