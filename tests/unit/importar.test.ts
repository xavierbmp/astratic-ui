import { describe, expect, it } from "vitest"
import { filasParaImportar, leerCsv, registrosDeFilas, sugerirMapeo } from "@/lib/base/importar"
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
