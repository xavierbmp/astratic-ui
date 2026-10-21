import { describe, expect, it } from "vitest"
import { leerFecha, leerNumero, textoDeValor, valorDeTexto, type DefCampo } from "@/lib/base/campos"
import { aHtml, aTsv, deTsv, repartirPegado } from "@/lib/base/portapapeles"
import { caja, celdasDeRelleno, moverSeleccion, tabular, unaCelda } from "@/lib/base/seleccion"
import {
  agruparEnNiveles,
  aplicarAjustes,
  camposDeFormulario,
  colorAlDia,
  colorDeFila,
  coloresDeRegistro,
  columnasDeVista,
  lineasDeRejilla,
  mover,
  normalizarConfig,
  normalizarVista,
  reglasDeCampo,
  textoFiltro,
  vistaNueva,
} from "@/lib/base/vistas"
import { aFiltrable } from "@/lib/base/campos"
import { nombreMes, semanasDelMes, sumarMeses } from "@/lib/base/calendario"

type Fila = { id: string; nombre: string; marca: string; plataformas: string[]; importe: number | null; alta: string }
const filas: Fila[] = [
  { id: "a", nombre: "Ana", marca: "lumea", plataformas: ["ig", "tt"], importe: 1200, alta: "2026-10-01" },
  { id: "b", nombre: "Bea", marca: "nuura", plataformas: ["ig"], importe: null, alta: "2026-10-03" },
  { id: "c", nombre: "Carla", marca: "lumea", plataformas: ["ig"], importe: 300, alta: "2026-10-05" },
]
const campos: DefCampo<Fila>[] = [
  { id: "nombre", nombre: "Nombre", tipo: "texto", principal: true, valor: (f) => f.nombre },
  { id: "marca", nombre: "Marca", tipo: "select", opciones: [{ id: "lumea", label: "Lumea", color: "verde" }, { id: "nuura", label: "Nuura", color: "rosa" }], valor: (f) => f.marca },
  { id: "plataformas", nombre: "Plataformas", tipo: "multiselect", opciones: [{ id: "ig", label: "Instagram" }, { id: "tt", label: "TikTok" }], valor: (f) => f.plataformas },
  { id: "importe", nombre: "Importe", tipo: "moneda", valor: (f) => f.importe },
  { id: "alta", nombre: "Alta", tipo: "fecha", soloLectura: true, valor: (f) => f.alta },
  { id: "notas", nombre: "Notas", tipo: "texto_largo", ocultoDeSerie: true, valor: () => null },
]
const ref = { hoy: "2026-10-06" }

describe("valores de los campos", () => {
  it("se leen como en la celda", () => {
    expect(textoDeValor(campos[3], 1234.5)).toBe("1.234,50 €")
    expect(textoDeValor(campos[2], ["ig", "tt"])).toBe("Instagram, TikTok")
    expect(textoDeValor({ tipo: "porcentaje" }, 32)).toBe("32 %")
  })
  it("lo pegado se entiende como en una hoja de cálculo", () => {
    expect(leerNumero("1.234,5")).toBe(1234.5)
    expect(leerNumero("1,234.5")).toBe(1234.5)
    expect(leerNumero("1.200 €")).toBe(1200)
    expect(leerFecha("13/10/2026")).toBe("2026-10-13")
    expect(leerFecha("13 oct 2026")).toBe("2026-10-13")
    expect(leerFecha("31/02/2026")).toBeNull()
    expect(valorDeTexto(campos[1], "lumea")).toEqual({ ok: true, valor: "lumea" })
    expect(valorDeTexto(campos[1], "LUMEA")).toEqual({ ok: true, valor: "lumea" })
    expect(valorDeTexto(campos[2], "Instagram, TikTok")).toEqual({ ok: true, valor: ["ig", "tt"] })
    expect(valorDeTexto(campos[2], "Instagram, Twitch").ok).toBe(false)
    expect(valorDeTexto({ tipo: "email" }, "no-es-email").ok).toBe(false)
    expect(valorDeTexto({ tipo: "casilla" }, "checked")).toEqual({ ok: true, valor: true })
    expect(valorDeTexto({ tipo: "calificacion", formato: { maximo: 5 } }, "★★★")).toEqual({ ok: true, valor: 3 })
    expect(valorDeTexto({ tipo: "progreso" }, "40 %")).toEqual({ ok: true, valor: 40 })
    expect(valorDeTexto({ tipo: "progreso", formato: { maximo: 3 } }, "2 de 3")).toEqual({ ok: true, valor: 2 })
    expect(valorDeTexto({ tipo: "progreso" }, "1/4")).toEqual({ ok: true, valor: 25 })
    expect(valorDeTexto({ tipo: "progreso", formato: { maximo: 3 } }, "9")).toEqual({ ok: true, valor: 3 })
    expect(textoDeValor({ tipo: "progreso", formato: { maximo: 3 } }, 1)).toBe("1 de 3")
    expect(textoDeValor({ tipo: "progreso" }, 40)).toBe("40 %")
  })
})

describe("vistas", () => {
  it("una vista nueva enseña todo menos lo que nace oculto, con la principal primero", () => {
    const v = vistaNueva("Todos", campos, { id: "v1" })
    expect(columnasDeVista(v, campos).map((c) => c.campo.id)).toEqual(["nombre", "marca", "plataformas", "importe", "alta"])
  })
  it("se pone al día con los campos: quita los que no existen y añade los nuevos", () => {
    const v = { ...vistaNueva("Todos", campos, { id: "v1" }), campos: [{ id: "marca", visible: true }, { id: "borrado", visible: true }] }
    const n = normalizarVista(v, campos)
    expect(n.campos.map((c) => c.id)).toEqual(["nombre", "marca", "plataformas", "importe", "alta", "notas"])
    expect(n.campos.find((c) => c.id === "notas")?.visible).toBe(false)
  })
  it("sin configuración guardada, las de serie; y la activa siempre existe", () => {
    const config = normalizarConfig({ vistas: [], activa: "no" }, campos, [vistaNueva("Todos", campos, { id: "serie" })])
    expect(config.vistas.map((v) => v.id)).toEqual(["serie"])
    expect(config.activa).toBe("serie")
  })
  it("una vista de serie nueva llega una vez a quien ya tenía las suyas y, si la borra, no vuelve", () => {
    const deSerie = [vistaNueva("Todos", campos, { id: "serie" }), vistaNueva("Borrada", campos, { id: "vieja" }), { ...vistaNueva("Nueva", campos, { id: "nueva" }), nueva: true }]
    const suya = vistaNueva("Mía", campos, { id: "mia" })
    // Lo guardado antes de que hubiera «ofrecidas»: la vieja ya la conocía (y la borró); la nueva, no.
    const antes = normalizarConfig({ vistas: [suya] }, campos, deSerie)
    expect(antes.vistas.map((v) => v.id)).toEqual(["mia", "nueva"])
    expect(antes.vistas.some((v) => "nueva" in v && v.nueva)).toBe(false)
    expect(antes.ofrecidas).toEqual(["serie", "vieja", "nueva"])
    const sinLaNueva = normalizarConfig({ ...antes, vistas: [suya] }, campos, deSerie)
    expect(sinLaNueva.vistas.map((v) => v.id)).toEqual(["mia"])
  })
  it("el texto del botón de filtro", () => {
    expect(textoFiltro({ union: "y", condiciones: [{ campo: "marca", op: "es", valor: "lumea" }] }, campos)).toBe("Filtrado por Marca")
    expect(textoFiltro({ union: "y", condiciones: [{ campo: "marca", op: "es", valor: "lumea" }], grupos: [{ union: "o", condiciones: [{ campo: "importe", op: "vacio" }] }] }, campos)).toBe("Filtrado por 2 campos")
  })
})

describe("grupos de varios niveles", () => {
  const filtrables = campos.map(aFiltrable)
  it("reparte en dos niveles y solo salen los grupos con filas", () => {
    const nodos = agruparEnNiveles(filas, [{ campo: "marca" }, { campo: "plataformas", ordenGrupos: "asc" }], filtrables, ref)
    expect(nodos.map((n) => [n.label, n.filas.length])).toEqual([["Lumea", 2], ["Nuura", 1]])
    expect(nodos[0].hijos.map((n) => n.label)).toEqual(["Instagram", "Instagram, TikTok"])
  })
  it("las líneas: cabeceras y registros numerados; lo plegado no se ve pero cuenta", () => {
    const nodos = agruparEnNiveles(filas, [{ campo: "marca" }], filtrables, ref)
    const lineas = lineasDeRejilla(filas, nodos, new Set([nodos[0].clave]))
    expect(lineas.map((l) => (l.tipo === "grupo" ? l.nodo.label : `${l.numero}:${l.fila.id}`))).toEqual(["Lumea", "Nuura", "3:b"])
  })
})

describe("color de filas y celdas", () => {
  const vacioImporte = { id: "r1", color: "rojo" as const, filtro: { union: "y" as const, condiciones: [{ campo: "importe", op: "vacio" as const }] } }
  const contieneAna = { id: "r2", color: "amarillo" as const, alcance: "celda" as const, filtro: { union: "y" as const, condiciones: [{ campo: "nombre", op: "contiene" as const, valor: "an" }] } }
  const filtrables = campos.map(aFiltrable)

  it("la marca, por el color de su opción o por la primera regla de fila que cumple", () => {
    expect(colorDeFila(filas[1], { campo: "marca" }, campos, ref)).toBe("rosa")
    expect(colorDeFila(filas[1], { campo: "marca", reglas: [vacioImporte] }, campos, ref)).toBe("rojo")
    expect(colorDeFila(filas[0], { reglas: [vacioImporte] }, campos, ref)).toBeUndefined()
  })
  it("una regla de fila pinta la fila entera; una de celda, solo la celda de su campo", () => {
    const color = { campo: "marca", reglas: [vacioImporte, contieneAna] }
    expect(coloresDeRegistro(filas[1], color, campos, filtrables, ref)).toEqual({ marca: "rojo", fondo: "rojo", celdas: new Map() })
    const ana = coloresDeRegistro(filas[0], color, campos, filtrables, ref)
    expect(ana.marca).toBe("verde")
    expect(ana.fondo).toBeUndefined()
    expect([...ana.celdas]).toEqual([["nombre", "amarillo"]])
  })
  it("el color guardado antes (por modo) se pasa a la forma de ahora y se queda sin lo que ya no existe", () => {
    const existe = (id: string) => campos.some((c) => c.id === id)
    expect(colorAlDia({ modo: "campo", campo: "marca" }, existe)).toEqual({ campo: "marca" })
    expect(colorAlDia({ modo: "condiciones", reglas: [vacioImporte] }, existe)).toEqual({ reglas: [vacioImporte] })
    expect(colorAlDia({ campo: "borrado" }, existe)).toBeUndefined()
    expect(colorAlDia({ campo: "marca", reglas: [] }, existe)).toEqual({ campo: "marca" })
  })
  it("las reglas de un campo son las que solo lo miran a él", () => {
    const deVarios = { id: "r3", color: "azul" as const, filtro: { union: "y" as const, condiciones: [{ campo: "nombre", op: "no_vacio" as const }, { campo: "importe", op: "vacio" as const }] } }
    expect(reglasDeCampo({ reglas: [vacioImporte, contieneAna, deVarios] }, "nombre").map((r) => r.id)).toEqual(["r2"])
  })
})

describe("ajustes de los campos de serie", () => {
  it("cada persona ordena y colorea las opciones; las que faltan en el ajuste van al final y los estados conservan su color", () => {
    const conEstado: DefCampo<Fila>[] = [
      ...campos,
      { id: "estado", nombre: "Estado", tipo: "select", opciones: [{ id: "abierta", label: "Abierta", tono: "info", color: "azul" }, { id: "cerrada", label: "Cerrada", tono: "success", color: "verde" }], valor: () => null },
    ]
    const ajustados = aplicarAjustes(conEstado, { marca: { opciones: [{ id: "nuura" }, { id: "lumea", color: "naranja" }] }, estado: { opciones: [{ id: "cerrada", color: "rojo" }] } })
    expect(ajustados[1].opciones?.map((o) => [o.id, o.color])).toEqual([["nuura", "rosa"], ["lumea", "naranja"]])
    expect(ajustados[6].opciones?.map((o) => [o.id, o.color])).toEqual([["cerrada", "verde"], ["abierta", "azul"]])
    expect(aplicarAjustes(campos, undefined)).toBe(campos)
  })
})

describe("formulario de alta", () => {
  it("de serie salen los que se escriben; los propios nuevos, apagados; los obligatorios, siempre", () => {
    const conPropio: DefCampo<Fila>[] = [...campos, { id: "p1", nombre: "Mío", tipo: "texto", propio: true, valor: () => null }]
    const f = camposDeFormulario([{ id: "nombre", visible: false }, { id: "marca", visible: false }], conPropio)
    expect(f.map((x) => `${x.campo.id}:${x.visible}`)).toEqual(["nombre:true", "marca:false", "plataformas:true", "importe:true", "notas:false", "p1:false"])
  })
})

describe("selección de celdas", () => {
  const l = { filas: 3, cols: 4 }
  it("flechas, Mayús para extender y ⌘ hasta el borde", () => {
    const r = moverSeleccion(unaCelda({ fila: 0, col: 0 }), "abajo", l, { extender: true })
    expect(caja(r)).toEqual({ f0: 0, f1: 1, c0: 0, c1: 0 })
    expect(moverSeleccion(r, "derecha", l, { hastaElBorde: true }).foco).toEqual({ fila: 1, col: 3 })
    expect(tabular({ fila: 0, col: 3 }, false, l)).toEqual({ fila: 1, col: 0 })
  })
  it("el tirador repite lo seleccionado hacia abajo", () => {
    expect(celdasDeRelleno({ f0: 0, f1: 1, c0: 0, c1: 0 }, 4)).toEqual([{ fila: 2, origen: 0 }, { fila: 3, origen: 1 }, { fila: 4, origen: 0 }])
  })
  it("mover un elemento de sitio", () => {
    expect(mover(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"])
  })
})

describe("portapapeles", () => {
  it("ida y vuelta con tabuladores, saltos dentro de celda y comillas", () => {
    const m = [["Ana", "dice \"hola\""], ["Bea", "dos\nlíneas"]]
    expect(deTsv(aTsv(m))).toEqual(m)
    expect(deTsv("a\tb\r\nc\td\r\n")).toEqual([["a", "b"], ["c", "d"]])
    expect(aHtml([["<b>"]])).toBe("<table><tr><td>&lt;b&gt;</td></tr></table>")
  })
  it("una celda pegada sobre un rango se repite; un bloque se pega desde arriba a la izquierda", () => {
    expect(repartirPegado([["x"]], { f0: 0, f1: 1, c0: 0, c1: 0 }, { filas: 5, cols: 5 })).toEqual([{ fila: 0, col: 0, texto: "x" }, { fila: 1, col: 0, texto: "x" }])
    expect(repartirPegado([["a", "b"], ["c", "d"]], { f0: 4, f1: 4, c0: 4, c1: 4 }, { filas: 5, cols: 5 })).toEqual([{ fila: 4, col: 4, texto: "a" }])
  })
})

describe("calendario de la base", () => {
  it("las semanas van de lunes a domingo y completan el mes", () => {
    const semanas = semanasDelMes("2026-10")
    expect(semanas[0][0]).toBe("2026-09-28")
    expect(semanas.at(-1)?.at(-1)).toBe("2026-11-01")
    expect(semanas.every((s) => s.length === 7)).toBe(true)
  })

  it("pasa de mes cruzando el año", () => {
    expect(sumarMeses("2026-12", 1)).toBe("2027-01")
    expect(sumarMeses("2026-01", -1)).toBe("2025-12")
    expect(nombreMes("2026-10")).toBe("octubre de 2026")
  })
})

describe("tipos de vista", () => {
  it("un kanban nuevo se apila por la primera selección o vínculo y enseña pocos campos en la tarjeta", () => {
    const v = vistaNueva("Kanban", campos, { id: "k", tipo: "kanban" })
    expect(v.tipo).toBe("kanban")
    expect(v.apilar).toBe("marca")
    expect(v.campos.find((c) => c.id === "marca")?.visible).toBe(false)
  })

  it("si el campo del kanban desaparece, toma otro que sirva", () => {
    const v = { ...vistaNueva("Kanban", campos, { id: "k", tipo: "kanban" }), apilar: "borrado" }
    expect(normalizarVista(v, campos).apilar).toBe("marca")
  })
})
