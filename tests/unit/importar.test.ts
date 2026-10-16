import { describe, expect, it } from "vitest"
import { CAMPO_NUEVO, camposNuevosDelMapeo, filasParaImportar, leerCsv, nombreLibre, registrosDeFilas, sugerirMapeo, tipoSugerido } from "@/lib/base/importar"
import type { DefCampo } from "@/lib/base/campos"

type Fila = { id: string }
const campos: DefCampo<Fila>[] = [
  { id: "nombre", nombre: "Nombre", tipo: "texto", valor: () => null },
  { id: "email", nombre: "Email", tipo: "email", valor: () => null },
  { id: "telefono", nombre: "Teléfono", tipo: "telefono", valor: () => null },
  { id: "estado", nombre: "Estado", tipo: "select", opciones: [{ id: "nueva", label: "Nueva" }, { id: "ganada", label: "Ganada" }], valor: () => null },
  { id: "importe", nombre: "Importe", tipo: "moneda", valor: () => null },
  { id: "creada", nombre: "Creada", tipo: "fecha", soloLectura: true, valor: () => null },
]

describe("importar un CSV", () => {
  it("detecta el separador y respeta comillas, comas y saltos de línea dentro", () => {
    expect(leerCsv('﻿Nombre;Notas\r\nAna;"Hola; qué tal"\r\n"Luis ""el bueno""";"dos\nlíneas"\r\n\r\n')).toEqual([
      ["Nombre", "Notas"],
      ["Ana", "Hola; qué tal"],
      ['Luis "el bueno"', "dos\nlíneas"],
    ])
    expect(leerCsv("a,b\n1,2")).toEqual([
      ["a", "b"],
      ["1", "2"],
    ])
    expect(leerCsv("a\tb\n1\t2")[1]).toEqual(["1", "2"])
  })

  it("sugiere el campo de cada columna por su nombre o sus sinónimos, sin repetir y sin los de solo lectura", () => {
    expect(sugerirMapeo(["NOMBRE", "Correo electrónico", "Móvil", "Creada", "Otra cosa", "nombre"], campos)).toEqual(["nombre", "email", "telefono", null, null, null])
  })

  it("lee cada celda según su campo y avisa de lo que no puede leer", () => {
    const tabla = [
      ["Nombre", "Estado", "Importe"],
      ["Ana", "ganada", "1.200,50 €"],
      ["Luis", "perdida", "300"],
      ["", "", ""],
    ]
    const { filas, avisos } = filasParaImportar(tabla, ["nombre", "estado", "importe"], campos, true)
    expect(filas).toEqual([{ nombre: "Ana", estado: "ganada", importe: 1200.5 }, { nombre: "Luis", importe: 300 }])
    expect(avisos).toEqual([{ fila: 3, campo: "Estado", error: "«perdida» no es una de sus opciones" }])
  })
})

describe("registros de las filas", () => {
  it("parte del vacío de la página y escribe cada valor con sus reglas", () => {
    let n = 0
    const r = registrosDeFilas<{ id: string; nombre: string; email?: string }>(
      [{ nombre: "Ana", email: "ana@x.com" }, { nombre: "Luis", otro: "x" }],
      [campos[0], campos[1]] as unknown as DefCampo<{ id: string; nombre: string; email?: string }>[],
      () => ({ id: `n${++n}`, nombre: "" }),
      (fila, campo, valor) => ({ ...fila, [campo.id]: valor }),
    )
    expect(r).toEqual([{ id: "n1", nombre: "Ana", email: "ana@x.com" }, { id: "n2", nombre: "Luis" }])
  })
})

describe("columnas que crean su campo", () => {
  it("el tipo sale de lo que llevan todas sus celdas", () => {
    expect(tipoSugerido(["ana@marca.com", " luis@otra.es ", ""])).toBe("email")
    expect(tipoSugerido(["https://marca.com", "www.otra.es"])).toBe("url")
    expect(tipoSugerido(["Sí", "no", "x"])).toBe("casilla")
    expect(tipoSugerido(["12/03/2026", "2026-04-01"])).toBe("fecha")
    expect(tipoSugerido(["+34 600 000 000", "(91) 123 45 67"])).toBe("telefono")
    expect(tipoSugerido(["1.200", "350,5"])).toBe("numero")
    expect(tipoSugerido(["Skincare", "ana@marca.com"])).toBe("texto")
    expect(tipoSugerido(["Hicimos un reel y tres stories con código de descuento; repitieron en verano con un pack más grande"])).toBe("texto_largo")
    expect(tipoSugerido([])).toBe("texto")
  })

  it("el nombre no repite uno que ya existe", () => {
    expect(nombreLibre("Notas", ["Nombre", "notas"])).toBe("Notas 2")
    expect(nombreLibre("  ", [])).toBe("Campo nuevo")
  })

  it("crea un campo por columna marcada y sus valores se importan con él", () => {
    const tabla = [
      ["Nombre", "Código", "Última campaña"],
      ["Ana", "ANA10", "12/03/2026"],
      ["Luis", "", "01/04/2026"],
    ]
    const { nuevos, mapeo, campos: todos } = camposNuevosDelMapeo(tabla, ["nombre", CAMPO_NUEVO, CAMPO_NUEVO], campos, true)
    expect(nuevos.map((c) => [c.nombre, c.tipo])).toEqual([
      ["Código", "texto"],
      ["Última campaña", "fecha"],
    ])
    expect(mapeo[1]).toBe(nuevos[0].id)
    const { filas } = filasParaImportar(tabla, mapeo, todos, true)
    expect(filas).toEqual([
      { nombre: "Ana", [nuevos[0].id]: "ANA10", [nuevos[1].id]: "2026-03-12" },
      { nombre: "Luis", [nuevos[1].id]: "2026-04-01" },
    ])
  })
})
