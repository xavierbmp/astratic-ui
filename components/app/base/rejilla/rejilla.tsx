"use client"

import * as React from "react"
import { useVirtualizer } from "@tanstack/react-virtual"
import { toast } from "sonner"
import { CopyIcon, CopyPlusIcon, Maximize2Icon, Trash2Icon } from "lucide-react"
import { cn } from "cn"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "@/components/ui/context-menu"
import { esValorVacio, textoParaCopiar, valorDeTexto, type ColorOpcion, type DefCampo, type OpcionCampo, type ValorCampo } from "@/lib/base/campos"
import { aHtml, aTsv, deTsv, repartirPegado } from "@/lib/base/portapapeles"
import { ajustarRango, caja, celdasDeRelleno, enCaja, esMultiple, moverSeleccion, tabular, unaCelda, type Celda, type Direccion, type Rango } from "@/lib/base/seleccion"
import { ALTO_CABECERA, ALTO_GRUPO, ALTURAS_FILA, type LineaRejilla, type VistaBase } from "@/lib/base/vistas"
import { Cabecera } from "@/components/app/base/rejilla/cabecera"
import { CeldaIzquierda, FONDO, LineaGrupo, anchoDeFijas } from "@/components/app/base/rejilla/lineas"
import { EditorCelda, type Salida } from "@/components/app/base/rejilla/editor-celda"
import { ValorCelda } from "@/components/app/base/rejilla/valor-celda"
import { Pie } from "@/components/app/base/rejilla/pie"
import type { AccionesCampo } from "@/components/app/base/rejilla/menu-campo"
import { ALTO_PIE, ALTO_SUBGRUPO, anchoTotal, colocarColumnas, type Columna } from "@/components/app/base/rejilla/medidas"

export type CambioCelda<T> = { fila: T; campo: DefCampo<T>; valor: ValorCampo }

const ALTO_CABECERA_AJUSTADA = 52
const MAX_DESHACER = 50
const FLECHAS: Record<string, Direccion> = { ArrowUp: "arriba", ArrowDown: "abajo", ArrowLeft: "izquierda", ArrowRight: "derecha" }

/** ¿Se escribe en la celda con un editor? Las casillas y las estrellas se cambian con un clic. */
const conEditor = <T,>(campo: DefCampo<T>) => campo.tipo !== "casilla" && campo.tipo !== "calificacion"

export type PropsRejilla<T> = {
  lineas: LineaRejilla<T>[]
  /** Los registros que se ven, en orden: las filas de la selección. */
  registros: T[]
  columnas: { campo: DefCampo<T>; ancho: number }[]
  vista: VistaBase
  getId: (fila: T) => string
  colorDe: (fila: T) => ColorOpcion | undefined
  /** Cómo se pinta en reposo un campo de serie a medida (la marca con su logo). */
  celdas?: Partial<Record<string, (fila: T) => React.ReactNode>>
  objeto: { singular: string; plural: string }
  marcadas: Set<string>
  onMarcar: (ids: Set<string>) => void
  abiertoId?: string | null
  onAbrir: (id: string) => void
  onEscribir?: (cambios: CambioCelda<T>[]) => void
  onNuevo?: () => void
  onCambiarVista: (parcial: Partial<VistaBase>) => void
  accionesCampo: (campo: DefCampo<T>) => AccionesCampo
  onAnadirCampo?: (ancla: HTMLElement) => void
  onEditarCampo?: (id: string, ancla: HTMLElement) => void
  onCrearOpcion?: (campoId: string, label: string) => OpcionCampo | null
  onDuplicar?: (id: string) => void
  onBorrar?: (ids: string[]) => void
  vacio?: React.ReactNode
}

/**
 * La rejilla de la base, como la de Airtable: cabecera y columnas fijas que se quedan quietas,
 * filas virtuales (miles sin que se note), selección de celdas como en una hoja de cálculo
 * (clic, Mayús, arrastrar, flechas, Tab, ⌘ + flecha, ⌘A), editar escribiendo o con doble clic,
 * copiar y pegar con Excel, el tirador para rellenar, borrar, deshacer (⌘Z), grupos plegables,
 * el color de cada fila y los totales del pie.
 */
export function Rejilla<T>(p: PropsRejilla<T>) {
  const { columnas: columnasVista, vista, registros, getId } = p
  const contenedor = React.useRef<HTMLDivElement>(null)
  const [anchoVivo, setAnchoVivo] = React.useState<{ id: string; ancho: number } | null>(null)
  const [rangoGuardado, setRango] = React.useState<Rango | null>(null)
  const [editando, setEditando] = React.useState<{ celda: Celda; inicial?: string } | null>(null)
  const [rellenoHasta, setRellenoHasta] = React.useState<number | null>(null)
  const [objetivo, setObjetivo] = React.useState<number | null>(null)
  const [altoVisible, setAltoVisible] = React.useState(600)
  const arrastre = React.useRef<"seleccion" | "relleno" | null>(null)
  /** Se guarda lo que se escribía porque se pulsó otra celda: la selección va a la nueva, no se queda en la editada. */
  const saliendoPorClic = React.useRef(false)
  const deshacer = React.useRef<CambioCelda<T>[][]>([])
  const seguir = React.useRef<{ id: string; col: number } | null>(null)

  const columnas = React.useMemo(
    () => colocarColumnas(columnasVista.map((c) => (anchoVivo && c.campo.id === anchoVivo.id ? { ...c, ancho: anchoVivo.ancho } : c)), Math.min(vista.congelar, columnasVista.length)),
    [columnasVista, vista.congelar, anchoVivo],
  )
  const congelar = Math.min(p.vista.congelar, columnas.length)
  const total = anchoTotal(columnas)
  const finFijas = anchoDeFijas(columnas, congelar)
  const alto = ALTURAS_FILA[p.vista.altura].px
  const altoCabecera = p.vista.ajustarCabeceras ? ALTO_CABECERA_AJUSTADA : ALTO_CABECERA
  const limites = { filas: p.registros.length, cols: columnas.length }
  const rango = rangoGuardado ? ajustarRango(rangoGuardado, limites) : null
  const sel = rango ? caja(rango) : null

  // Dónde está cada registro entre las líneas (las cabeceras de grupo también son líneas).
  const lineaDeRegistro = React.useMemo(() => {
    const out: number[] = []
    p.lineas.forEach((l, i) => l.tipo === "registro" && out.push(i))
    return out
  }, [p.lineas])
  const registroDeLinea = React.useMemo(() => new Map(lineaDeRegistro.map((linea, r) => [linea, r])), [lineaDeRegistro])
  const porId = React.useMemo(() => new Map(registros.map((f, i) => [getId(f), i])), [registros, getId])

  const virtual = useVirtualizer({
    count: p.lineas.length,
    getScrollElement: () => contenedor.current,
    estimateSize: (i) => {
      const l = p.lineas[i]
      if (l?.tipo === "grupo") return l.nodo.nivel === 0 ? ALTO_GRUPO : ALTO_SUBGRUPO
      return alto
    },
    overscan: 10,
    scrollMargin: altoCabecera,
    scrollPaddingStart: altoCabecera,
    scrollPaddingEnd: ALTO_PIE,
  })
  React.useEffect(() => virtual.measure(), [virtual, alto, p.lineas])

  React.useEffect(() => {
    const el = contenedor.current
    if (!el) return
    const medir = () => setAltoVisible(el.clientHeight)
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(el)
    return () => observador.disconnect()
  }, [])

  // Tras guardar, la celda activa sigue al registro aunque el orden lo cambie de sitio.
  React.useLayoutEffect(() => {
    const s = seguir.current
    if (!s) return
    seguir.current = null
    const fila = porId.get(s.id)
    if (fila !== undefined) setRango(unaCelda({ fila, col: s.col }))
  }, [porId])

  const enfocar = () => contenedor.current?.focus({ preventScroll: true })

  const verCelda = React.useCallback(
    (c: Celda) => {
      const linea = lineaDeRegistro[c.fila]
      if (linea !== undefined) virtual.scrollToIndex(linea, { align: "auto" })
      const el = contenedor.current
      const col = columnas[c.col]
      if (!el || !col || col.fija) return
      if (col.x < el.scrollLeft + finFijas) el.scrollLeft = col.x - finFijas
      else if (col.x + col.ancho > el.scrollLeft + el.clientWidth) el.scrollLeft = col.x + col.ancho - el.clientWidth
    },
    [columnas, finFijas, lineaDeRegistro, virtual],
  )

  const seleccionar = (r: Rango) => {
    setRango(r)
    verCelda(r.foco)
  }

  // ---------- Escribir, con deshacer ----------

  const escribir = (pedidos: CambioCelda<T>[], registrar = true) => {
    if (!p.onEscribir) return
    // Cada cambio, sobre la versión actual de su fila (los de deshacer guardan la de antes).
    const cambios = pedidos.map((c) => {
      const i = porId.get(getId(c.fila))
      return i === undefined ? c : { ...c, fila: registros[i] }
    })
    const validos = cambios.filter((c) => !c.campo.soloLectura)
    const sinObligatorio = validos.filter((c) => !(c.campo.obligatorio && esValorVacio(c.valor)))
    if (sinObligatorio.length < validos.length) toast.error("Hay campos que no pueden quedarse vacíos")
    const reales = sinObligatorio.filter((c) => JSON.stringify(c.campo.valor(c.fila) ?? null) !== JSON.stringify(c.valor ?? null))
    if (!reales.length) return
    if (registrar) deshacer.current = [reales.map((c) => ({ ...c, valor: c.campo.valor(c.fila) })), ...deshacer.current].slice(0, MAX_DESHACER)
    p.onEscribir(reales)
  }

  const celdaEditable = (c: Celda) => {
    const campo = columnas[c.col]?.campo
    return !!campo && !campo.soloLectura && !!p.onEscribir
  }

  const empezarEdicion = (c: Celda, inicial?: string) => {
    const campo = columnas[c.col]?.campo
    if (!campo || !celdaEditable(c)) return
    if (!conEditor(campo)) return alternarClic(c)
    verCelda(c)
    setEditando({ celda: c, inicial })
  }

  /** La casilla con Espacio o Enter; las estrellas no tienen atajo. */
  const alternarClic = (c: Celda) => {
    const campo = columnas[c.col]?.campo
    const fila = p.registros[c.fila]
    if (campo?.tipo === "casilla" && fila && celdaEditable(c)) escribir([{ fila, campo, valor: campo.valor(fila) !== true }])
  }

  const terminarEdicion = (valor: ValorCampo, salida: Salida) => {
    if (!editando) return
    const { celda } = editando
    const fila = p.registros[celda.fila]
    const campo = columnas[celda.col]?.campo
    setEditando(null)
    enfocar()
    if (!fila || !campo) return
    escribir([{ fila, campo, valor }])
    if (saliendoPorClic.current) return
    if (salida === "quedarse") {
      seguir.current = { id: p.getId(fila), col: celda.col }
      return
    }
    const destino = salida === "abajo" ? moverSeleccion(unaCelda(celda), "abajo", limites).foco : tabular(celda, salida === "izquierda", limites)
    seleccionar(unaCelda(destino))
  }

  const borrarRango = () => {
    if (!sel) return
    const cambios: CambioCelda<T>[] = []
    for (let f = sel.f0; f <= sel.f1; f += 1)
      for (let c = sel.c0; c <= sel.c1; c += 1) {
        const campo = columnas[c].campo
        const lectura = valorDeTexto(campo, "")
        if (lectura.ok && !campo.soloLectura) cambios.push({ fila: p.registros[f], campo, valor: lectura.valor })
      }
    escribir(cambios)
  }

  // ---------- Copiar y pegar ----------

  const matrizSeleccion = (): string[][] => {
    if (!sel) return []
    const m: string[][] = []
    for (let f = sel.f0; f <= sel.f1; f += 1) {
      const fila = p.registros[f]
      const linea: string[] = []
      for (let c = sel.c0; c <= sel.c1; c += 1) linea.push(textoParaCopiar(columnas[c].campo, columnas[c].campo.valor(fila)))
      m.push(linea)
    }
    return m
  }

  const alCopiar = (e: React.ClipboardEvent) => {
    if (e.target !== contenedor.current || editando || !sel) return
    const m = matrizSeleccion()
    e.clipboardData.setData("text/plain", aTsv(m))
    e.clipboardData.setData("text/html", aHtml(m))
    e.preventDefault()
  }

  const alCortar = (e: React.ClipboardEvent) => {
    alCopiar(e)
    if (e.defaultPrevented) borrarRango()
  }

  const alPegar = (e: React.ClipboardEvent) => {
    if (e.target !== contenedor.current || editando || !sel) return
    const texto = e.clipboardData.getData("text/plain")
    if (!texto) return
    e.preventDefault()
    const pegado = deTsv(texto)
    const celdas = repartirPegado(pegado, sel, limites)
    const cambios: CambioCelda<T>[] = []
    const errores: string[] = []
    let soloLectura = 0
    for (const c of celdas) {
      const campo = columnas[c.col].campo
      if (campo.soloLectura) {
        soloLectura += 1
        continue
      }
      const lectura = valorDeTexto(campo, c.texto)
      if (lectura.ok) cambios.push({ fila: p.registros[c.fila], campo, valor: lectura.valor })
      else errores.push(lectura.error)
    }
    escribir(cambios)
    if (errores.length) toast.error(errores.length === 1 ? `Una celda no se ha pegado: ${errores[0]}` : `${errores.length} celdas no se han pegado. Por ejemplo: ${errores[0]}`)
    else if (soloLectura) toast.message("Los campos calculados no se pegan")
    const ultima = celdas.at(-1)
    if (celdas[0] && ultima) setRango({ ancla: { fila: celdas[0].fila, col: celdas[0].col }, foco: { fila: ultima.fila, col: ultima.col } })
  }

  // ---------- Teclado ----------

  const alTeclear = (e: React.KeyboardEvent) => {
    if (e.target !== contenedor.current || editando) return
    const meta = e.metaKey || e.ctrlKey
    if (meta && e.key.toLowerCase() === "z") {
      e.preventDefault()
      const anterior = deshacer.current.shift()
      if (anterior) escribir(anterior, false)
      return
    }
    if (meta && e.key.toLowerCase() === "a") {
      e.preventDefault()
      if (limites.filas && limites.cols) setRango({ ancla: { fila: 0, col: 0 }, foco: { fila: limites.filas - 1, col: limites.cols - 1 } })
      return
    }
    if (!rango) return
    const dir = FLECHAS[e.key]
    if (dir) {
      e.preventDefault()
      return seleccionar(moverSeleccion(rango, dir, limites, { extender: e.shiftKey, hastaElBorde: meta }))
    }
    const fila = p.registros[rango.foco.fila]
    switch (e.key) {
      case "Tab":
        e.preventDefault()
        return seleccionar(unaCelda(tabular(rango.foco, e.shiftKey, limites)))
      case "Enter":
      case "F2":
        e.preventDefault()
        return empezarEdicion(rango.foco)
      case " ":
        e.preventDefault()
        if (e.shiftKey && fila) return p.onAbrir(p.getId(fila))
        return alternarClic(rango.foco)
      case "Escape":
        return esMultiple(rango) ? setRango(unaCelda(rango.foco)) : setRango(null)
      case "Delete":
      case "Backspace":
        e.preventDefault()
        return borrarRango()
    }
    // Escribir sobre la celda empieza a editarla con esa letra, como en una hoja de cálculo.
    if (e.key.length === 1 && !meta && !e.altKey) {
      const campo = columnas[rango.foco.col]?.campo
      if (campo && conEditor(campo) && campo.tipo !== "fecha" && celdaEditable(rango.foco)) {
        e.preventDefault()
        empezarEdicion(rango.foco, e.key)
      }
    }
  }

  // ---------- Ratón (delegado en el contenedor) ----------

  const celdaDe = (el: EventTarget | null): Celda | null => {
    const nodo = (el as HTMLElement | null)?.closest<HTMLElement>("[data-celda]")
    if (!nodo) return null
    return { fila: Number(nodo.dataset.fila), col: Number(nodo.dataset.col) }
  }
  /** El registro bajo el ratón, también en la columna de la izquierda (para el clic derecho). */
  const filaDe = (el: EventTarget | null): number | null => {
    const nodo = (el as HTMLElement | null)?.closest<HTMLElement>("[data-fila]")
    return nodo ? Number(nodo.dataset.fila) : null
  }

  const alPulsar = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    const destino = e.target as HTMLElement
    if (destino.closest("[data-relleno]")) {
      e.preventDefault()
      arrastre.current = "relleno"
      setRellenoHasta(sel?.f1 ?? null)
      return
    }
    const c = celdaDe(e.target)
    if (!c || destino.closest("input, textarea")) return
    if (editando) {
      // Como en Airtable: lo escrito se guarda al salir del campo y se selecciona la celda pulsada.
      saliendoPorClic.current = true
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
      saliendoPorClic.current = false
      setEditando(null)
    }
    if (!destino.closest("button, a")) e.preventDefault()
    enfocar()
    arrastre.current = "seleccion"
    setRango(e.shiftKey && rango ? { ancla: rango.ancla, foco: c } : unaCelda(c))
  }

  const alPasar = (e: React.MouseEvent) => {
    if (!arrastre.current) return
    const c = celdaDe(e.target)
    if (!c) return
    if (arrastre.current === "seleccion" && rango && (rango.foco.fila !== c.fila || rango.foco.col !== c.col)) setRango({ ancla: rango.ancla, foco: c })
    if (arrastre.current === "relleno") setRellenoHasta(c.fila)
  }

  React.useEffect(() => {
    const soltar = () => {
      if (arrastre.current === "relleno" && sel && rellenoHasta !== null) {
        const cambios: CambioCelda<T>[] = []
        for (const { fila, origen } of celdasDeRelleno(sel, rellenoHasta))
          for (let c = sel.c0; c <= sel.c1; c += 1) cambios.push({ fila: p.registros[fila], campo: columnas[c].campo, valor: columnas[c].campo.valor(p.registros[origen]) })
        escribir(cambios)
        setRango({ ancla: { fila: Math.min(sel.f0, rellenoHasta), col: sel.c0 }, foco: { fila: Math.max(sel.f1, rellenoHasta), col: sel.c1 } })
      }
      arrastre.current = null
      setRellenoHasta(null)
    }
    window.addEventListener("mouseup", soltar)
    return () => window.removeEventListener("mouseup", soltar)
  })

  // ---------- Cabecera ----------

  const elegirColumna = (i: number, extender: boolean) => {
    if (!limites.filas) return
    enfocar()
    const ancla = extender && rango ? rango.ancla.col : i
    setRango({ ancla: { fila: 0, col: ancla }, foco: { fila: limites.filas - 1, col: i } })
  }
  const columnasElegidas = new Set<number>()
  if (sel && sel.f0 === 0 && sel.f1 === limites.filas - 1 && limites.filas > 0) for (let c = sel.c0; c <= sel.c1; c += 1) columnasElegidas.add(c)

  /** Mueve una columna al hueco `destino` entre las visibles; las ocultas se quedan donde estaban. */
  const moverColumna = (id: string, destino: number) => {
    const visibles = columnas.map((c) => c.campo.id)
    const desde = visibles.indexOf(id)
    const movida = p.vista.campos.find((c) => c.id === id)
    if (desde === -1 || !movida || destino === desde || destino === desde + 1) return
    const lista = p.vista.campos.filter((c) => c.id !== id)
    const antesDe = visibles[destino]
    const posicion = antesDe ? lista.findIndex((c) => c.id === antesDe) : lista.findIndex((c) => c.id === visibles[visibles.length - 1]) + 1
    lista.splice(posicion, 0, movida)
    p.onCambiarVista({ campos: lista })
  }

  const cambiarAncho = (id: string, ancho: number, final: boolean) => {
    if (!final) return setAnchoVivo({ id, ancho })
    setAnchoVivo(null)
    p.onCambiarVista({ campos: p.vista.campos.map((c) => (c.id === id ? { ...c, ancho } : c)) })
  }

  const tintes = React.useMemo(() => tintesDeColumnas(vista), [vista])
  const ids = p.registros.map(p.getId)
  const marcadasTodas = ids.length > 0 && ids.every((id) => p.marcadas.has(id)) ? true : ids.some((id) => p.marcadas.has(id)) ? "indeterminate" : false
  const plegados = new Set(p.vista.plegados)
  const filaObjetivo = objetivo !== null ? p.registros[objetivo] : undefined
  const idsObjetivo = filaObjetivo ? (p.marcadas.has(p.getId(filaObjetivo)) ? [...p.marcadas] : [p.getId(filaObjetivo)]) : []

  return (
    <div
      ref={contenedor}
      tabIndex={0}
      role="grid"
      aria-rowcount={p.registros.length}
      aria-colcount={columnas.length}
      className="relative min-h-0 flex-1 overflow-auto bg-background outline-none"
      onKeyDown={alTeclear}
      onCopy={alCopiar}
      onCut={alCortar}
      onPaste={alPegar}
    >
      <div className="flex min-h-full flex-col" style={{ width: total }}>
        <Cabecera
          columnas={columnas}
          alto={altoCabecera}
          ajustar={!!p.vista.ajustarCabeceras}
          congelar={congelar}
          marcadas={marcadasTodas}
          onMarcarTodas={(m) => p.onMarcar(m ? new Set(ids) : new Set())}
          columnasElegidas={columnasElegidas}
          onElegirColumna={elegirColumna}
          acciones={(c) => p.accionesCampo(c.campo)}
          onAncho={cambiarAncho}
          onMover={moverColumna}
          onAnadirCampo={p.onAnadirCampo}
          onEditarCampo={p.onEditarCampo}
        />
        <AsaFijas finFijas={finFijas} alto={altoVisible} columnas={columnas} onCongelar={(n) => p.onCambiarVista({ congelar: n })} />

        <ContextMenu onOpenChange={(abierto) => !abierto && setObjetivo(null)}>
          <ContextMenuTrigger asChild>
            <div
              className="relative flex-none"
              style={{ height: virtual.getTotalSize() }}
              onMouseDown={alPulsar}
              onMouseOver={alPasar}
              onDoubleClick={(e) => {
                const c = celdaDe(e.target)
                if (c && !(e.target as HTMLElement).closest("button, a")) empezarEdicion(c)
              }}
              onContextMenu={(e) => {
                const fila = filaDe(e.target)
                if (fila === null) return e.preventDefault()
                setObjetivo(fila)
                const c = celdaDe(e.target)
                if (c && (!sel || !enCaja(sel, c))) setRango(unaCelda(c))
              }}
            >
              {virtual.getVirtualItems().map((item) => {
                const linea = p.lineas[item.index]
                const estilo: React.CSSProperties = { position: "absolute", top: 0, left: 0, transform: `translateY(${item.start - altoCabecera}px)`, height: item.size, width: total }
                if (linea.tipo === "grupo")
                  return (
                    <div key={`g-${linea.nodo.clave}`} style={estilo}>
                      <LineaGrupo
                        nodo={linea.nodo}
                        campo={p.columnas.find((c) => c.campo.id === linea.nodo.campo)?.campo}
                        alto={item.size}
                        anchoFijas={finFijas}
                        total={total}
                        plegado={plegados.has(linea.nodo.clave)}
                        onPlegar={() => p.onCambiarVista({ plegados: plegados.has(linea.nodo.clave) ? p.vista.plegados.filter((x) => x !== linea.nodo.clave) : [...p.vista.plegados, linea.nodo.clave] })}
                      />
                    </div>
                  )
                const f = registroDeLinea.get(item.index) ?? 0
                const id = p.getId(linea.fila)
                return (
                  <FilaRegistro
                    key={id}
                    estilo={estilo}
                    fila={linea.fila}
                    indice={f}
                    numero={linea.numero}
                    columnas={columnas}
                    congelar={congelar}
                    altura={p.vista.altura}
                    color={p.colorDe(linea.fila)}
                    marcada={p.marcadas.has(id)}
                    abierta={p.abiertoId === id}
                    sel={sel}
                    cursor={rango?.foco ?? null}
                    rellenoHasta={rellenoHasta}
                    editando={editando?.celda.fila === f ? editando : null}
                    celdas={p.celdas}
                    tintes={tintes}
                    editable={!!p.onEscribir}
                    onMarcar={(m) => {
                      const s = new Set(p.marcadas)
                      if (m) s.add(id)
                      else s.delete(id)
                      p.onMarcar(s)
                    }}
                    onExpandir={() => p.onAbrir(id)}
                    onCambiar={(campo, valor) => escribir([{ fila: linea.fila, campo, valor }])}
                    onGuardar={terminarEdicion}
                    onCancelar={() => {
                      setEditando(null)
                      enfocar()
                    }}
                    onCrearOpcion={p.onCrearOpcion}
                  />
                )
              })}
              {p.registros.length === 0 && p.vacio && (
                <div className="absolute inset-x-0 top-10 flex justify-center" style={{ width: Math.min(total, contenedor.current?.clientWidth ?? total) }}>
                  {p.vacio}
                </div>
              )}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-60">
            {filaObjetivo && (
              <>
                <ContextMenuItem onSelect={() => p.onAbrir(p.getId(filaObjetivo))}>
                  <Maximize2Icon /> Expandir el registro <ContextMenuShortcut>⇧␣</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => void navigator.clipboard.writeText(aTsv(matrizSeleccion())).then(() => toast.success("Copiado"))}>
                  <CopyIcon /> Copiar las celdas <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                </ContextMenuItem>
                {p.onDuplicar && (
                  <ContextMenuItem onSelect={() => p.onDuplicar?.(p.getId(filaObjetivo))}>
                    <CopyPlusIcon /> Duplicar el registro
                  </ContextMenuItem>
                )}
                {p.onBorrar && (
                  <>
                    <ContextMenuSeparator />
                    <ContextMenuItem variant="destructive" onSelect={() => p.onBorrar?.(idsObjetivo)}>
                      <Trash2Icon /> {idsObjetivo.length > 1 ? `Eliminar ${idsObjetivo.length} registros` : "Eliminar el registro"}
                    </ContextMenuItem>
                  </>
                )}
              </>
            )}
          </ContextMenuContent>
        </ContextMenu>

        <div className="flex-1" />
        <Pie columnas={columnas} filas={p.registros} calculos={p.vista.calculos} objeto={p.objeto} onNuevo={p.onNuevo} onCalculo={(id, calculo) => p.onCambiarVista({ calculos: calculo ? { ...p.vista.calculos, [id]: calculo } : Object.fromEntries(Object.entries(p.vista.calculos).filter(([k]) => k !== id)) })} />
      </div>
    </div>
  )
}

/**
 * Como en Airtable, las columnas por las que se filtra se tiñen de verde y las que ordenan, de
 * naranja: se ve de un vistazo qué está mandando en la vista.
 */
function tintesDeColumnas(vista: VistaBase): Map<string, string> {
  const tintes = new Map<string, string>()
  const recorrer = (g: VistaBase["filtro"]) => {
    g.condiciones.forEach((c) => tintes.set(c.campo, "bg-opcion-verde opacity-50"))
    g.grupos?.forEach(recorrer)
  }
  vista.orden.forEach((o) => tintes.set(o.campo, "bg-opcion-naranja opacity-50"))
  recorrer(vista.filtro)
  return tintes
}

/**
 * La línea gruesa tras las columnas fijas, de arriba abajo: se arrastra para fijar más o menos
 * columnas, como en Airtable. Va pegada a la izquierda (`sticky`), así que no se mueve con el scroll.
 */
function AsaFijas<T>({ finFijas, alto, columnas, onCongelar }: { finFijas: number; alto: number; columnas: Columna<T>[]; onCongelar: (n: number) => void }) {
  const [x, setX] = React.useState<number | null>(null)
  if (columnas.length < 2) return null
  // Las columnas fijas acaban en el borde derecho de alguna columna: el más cercano a donde se suelta.
  const huecoDe = (destino: number) =>
    columnas.reduce((mejor, c, i) => (Math.abs(c.x + c.ancho - destino) < Math.abs(columnas[mejor - 1].x + columnas[mejor - 1].ancho - destino) ? i + 1 : mejor), 1)
  return (
    <div className="pointer-events-none sticky top-0 left-0 z-30 h-0" style={{ width: finFijas }}>
      <span
        role="separator"
        aria-label="Arrastra para fijar más o menos columnas"
        title="Arrastra para fijar más o menos columnas"
        className="group/asa pointer-events-auto absolute top-0 flex w-2 cursor-grab justify-center active:cursor-grabbing"
        style={{ left: (x ?? finFijas) - 4, height: alto }}
        onPointerDown={(e) => {
          e.preventDefault()
          const x0 = e.clientX
          const mover = (ev: PointerEvent) => setX(finFijas + ev.clientX - x0)
          const soltar = (ev: PointerEvent) => {
            window.removeEventListener("pointermove", mover)
            setX(null)
            onCongelar(huecoDe(finFijas + ev.clientX - x0))
          }
          window.addEventListener("pointermove", mover)
          window.addEventListener("pointerup", soltar, { once: true })
        }}
      >
        <span className={cn("h-full w-0.5 group-hover/asa:bg-brand", x !== null && "bg-brand")} />
      </span>
    </div>
  )
}

type PropsFila<T> = {
  estilo: React.CSSProperties
  fila: T
  indice: number
  numero: number
  columnas: Columna<T>[]
  congelar: number
  altura: VistaBase["altura"]
  color?: ColorOpcion
  marcada: boolean
  abierta: boolean
  sel: ReturnType<typeof caja> | null
  cursor: Celda | null
  rellenoHasta: number | null
  editando: { celda: Celda; inicial?: string } | null
  celdas?: Partial<Record<string, (fila: T) => React.ReactNode>>
  tintes: Map<string, string>
  editable: boolean
  onMarcar: (m: boolean) => void
  onExpandir: () => void
  onCambiar: (campo: DefCampo<T>, valor: ValorCampo) => void
  onGuardar: (valor: ValorCampo, salida: Salida) => void
  onCancelar: () => void
  onCrearOpcion?: (campoId: string, label: string) => OpcionCampo | null
}

/** Un registro: la columna de la izquierda y una celda por campo, con su selección y su editor. */
function FilaRegistro<T>(f: PropsFila<T>) {
  const alta = f.altura !== "corta"
  return (
    <div style={f.estilo} className="group/fila flex">
      <CeldaIzquierda indice={f.indice} numero={f.numero} color={f.color} alta={alta} marcada={f.marcada} abierta={f.abierta} onMarcar={f.onMarcar} onExpandir={f.onExpandir} />
      {f.columnas.map((c, ci) => (
        <CeldaRegistro key={c.campo.id} {...f} columna={c} col={ci} alta={alta} />
      ))}
    </div>
  )
}

function CeldaRegistro<T>({ columna: c, col, alta, ...f }: PropsFila<T> & { columna: Columna<T>; col: number; alta: boolean }) {
  const celda = { fila: f.indice, col }
  const enSeleccion = !!f.sel && enCaja(f.sel, celda)
  const activa = f.cursor?.fila === f.indice && f.cursor.col === col
  const esquina = !!f.sel && f.sel.f1 === f.indice && f.sel.c1 === col && f.rellenoHasta === null
  const enRelleno = f.rellenoHasta !== null && !!f.sel && col >= f.sel.c0 && col <= f.sel.c1 && ((f.indice > f.sel.f1 && f.indice <= f.rellenoHasta) || (f.indice < f.sel.f0 && f.indice >= f.rellenoHasta))
  const editandoAqui = f.editando?.celda.col === col
  const valor = c.campo.valor(f.fila)
  const aMedida = f.celdas?.[c.campo.id]
  const ultimaFija = c.fija && col === f.congelar - 1
  return (
    <div
      data-celda
      data-fila={f.indice}
      data-col={col}
      role="gridcell"
      aria-selected={enSeleccion}
      className={cn(
        "relative flex flex-none overflow-hidden border-r border-b px-1.5 text-[13px] leading-[18px]",
        alta ? "items-start py-1.5" : "items-center",
        f.marcada || f.abierta ? FONDO.marcada : FONDO.normal,
        c.fija && "sticky z-[5]",
        ultimaFija && "border-r-2 border-r-control",
        (activa || editandoAqui) && "z-[7] overflow-visible",
      )}
      style={{ width: c.ancho, left: c.fija ? c.x : undefined }}
    >
      {f.tintes.has(c.campo.id) && <span aria-hidden className={cn("pointer-events-none absolute inset-0", f.tintes.get(c.campo.id))} />}
      {(enSeleccion || enRelleno) && <span aria-hidden className={cn("pointer-events-none absolute inset-0 bg-brand-soft", enRelleno && "border border-dashed border-brand")} />}
      {activa && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[2px] ring-2 ring-brand ring-inset" />}
      {editandoAqui && f.editando ? (
        <>
          <span className="relative min-w-0 flex-1 opacity-0">{aMedida ? aMedida(f.fila) : <ValorCelda campo={c.campo} valor={valor} altura={f.altura} editable={false} onCambiar={() => undefined} />}</span>
          <EditorCelda
            campo={c.campo}
            valor={valor}
            inicial={f.editando.inicial}
            onGuardar={f.onGuardar}
            onAplicar={(v) => f.onCambiar(c.campo, v)}
            onCancelar={f.onCancelar}
            onCrearOpcion={c.campo.propio && f.onCrearOpcion ? (label) => f.onCrearOpcion?.(c.campo.id, label) ?? null : undefined}
            error={(m) => toast.error(m)}
          />
        </>
      ) : (
        <span className="relative flex min-w-0 flex-1">{aMedida ? aMedida(f.fila) : <ValorCelda campo={c.campo} valor={valor} altura={f.altura} editable={f.editable && !c.campo.soloLectura} onCambiar={(v) => f.onCambiar(c.campo, v)} />}</span>
      )}
      {esquina && f.editable && !f.editando && <span data-relleno aria-label="Arrastra para rellenar" className="absolute -right-[3px] -bottom-[3px] z-10 size-[7px] cursor-crosshair rounded-[1px] border border-card bg-brand" />}
    </div>
  )
}
