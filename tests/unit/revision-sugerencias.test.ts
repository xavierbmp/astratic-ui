import { describe, expect, it } from "vitest"
import { aplicarCambio, aplicarCambios, citaDe, sincronizarSugerencias, textoAParrafos, tipoDeCambio, tramosDeCambio, ubicarCita, type CambioTexto } from "@/lib/revision-sugerencias"

const GUION = "Gancho (0–3 s)\nLa frase que para el scroll.\nDesarrollo\nLos pasos, uno por plano."

/** Los cambios de un texto a otro, como sugerencias ancladas al original. */
const cambiosDe = (original: string, nuevo: string): CambioTexto[] => tramosDeCambio(original, nuevo).map((t) => ({ ...citaDe(original, t.desde, t.hasta), poner: t.poner }))

describe("tramosDeCambio", () => {
  it("cambiar una palabra es un solo reemplazo", () => {
    const [t, ...resto] = tramosDeCambio(GUION, GUION.replace("para el", "frena el"))
    expect(resto).toEqual([])
    expect(t).toMatchObject({ quitar: "para", poner: "frena" })
    expect(GUION.slice(t.desde, t.hasta)).toBe("para")
  })

  it("borrar una frase y escribir otra es un solo cambio, aunque tenga espacios", () => {
    const nuevo = GUION.replace("La frase que para el scroll.", "Una pregunta que engancha.")
    const tramos = tramosDeCambio(GUION, nuevo)
    expect(tramos).toHaveLength(1)
    expect(tramos[0].quitar).toBe("La frase que para el scroll")
    expect(tramos[0].poner).toBe("Una pregunta que engancha")
  })

  it("añadir y quitar sueltos", () => {
    const [anadido] = tramosDeCambio("Hola mundo", "Hola gran mundo")
    expect(tipoDeCambio({ cita: anadido.quitar, poner: anadido.poner })).toBe("anadir")
    expect(anadido.poner.trim()).toBe("gran")
    const [quitado] = tramosDeCambio("Hola gran mundo", "Hola mundo")
    expect(tipoDeCambio({ cita: quitado.quitar, poner: quitado.poner })).toBe("quitar")
    expect(quitado.quitar.trim()).toBe("gran")
  })

  it("dos cambios separados por texto igual son dos sugerencias, en orden", () => {
    const nuevo = GUION.replace("Gancho", "Arranque").replace("uno por plano", "uno por toma")
    expect(tramosDeCambio(GUION, nuevo).map((t) => [t.quitar, t.poner])).toEqual([
      ["Gancho", "Arranque"],
      ["plano", "toma"],
    ])
  })

  it("sin cambios, o solo de espacios, no hay nada", () => {
    expect(tramosDeCambio(GUION, GUION)).toEqual([])
    expect(tramosDeCambio("Hola mundo", "Hola  mundo")).toEqual([])
  })

  it("un hashtag o una mención van enteros", () => {
    const [t] = tramosDeCambio("Con #publi y @lumea", "Con #ad y @lumea")
    expect(t).toMatchObject({ quitar: "#publi", poner: "#ad" })
  })

  it("aplicar todos los cambios al original da lo que escribió", () => {
    const nuevo = "Gancho (0–3 s)\nUna pregunta que engancha.\nDesarrollo y cierre\nLos pasos uno a uno, por plano."
    expect(aplicarCambios(GUION, cambiosDe(GUION, nuevo))).toEqual({ texto: nuevo, sinSitio: [] })
  })

  it("un párrafo nuevo va al final del de antes, no al principio del siguiente", () => {
    const original = "Desarrollo\nLos pasos.\nLlamada"
    const nuevo = "Desarrollo\nLos pasos.\nCierro con el resultado.\nLlamada"
    const [t] = tramosDeCambio(original, nuevo)
    expect(t).toMatchObject({ quitar: "", poner: "\nCierro con el resultado." })
    expect(original.slice(0, t.desde)).toBe("Desarrollo\nLos pasos.")
    expect(nuevo.slice(t.enNuevo, t.enNuevo + t.poner.length)).toBe(t.poner)
    expect(aplicarCambios(original, cambiosDe(original, nuevo)).texto).toBe(nuevo)
  })

  it("también con otro cambio antes, que hace dudar dónde casa el punto", () => {
    const original = "Esto es mi piel.\nDos gotas, hacia fuera.\nMensajes"
    const nuevo = "Esto es tu piel.\nDos gotas, hacia fuera.\nCierro con el resultado.\nMensajes"
    const tramos = tramosDeCambio(original, nuevo)
    expect(tramos.map((t) => [t.quitar, t.poner])).toEqual([
      ["mi", "tu"],
      ["", "\nCierro con el resultado."],
    ])
    expect(nuevo.slice(tramos[1].enNuevo, tramos[1].enNuevo + tramos[1].poner.length)).toBe(tramos[1].poner)
    expect(aplicarCambios(original, cambiosDe(original, nuevo)).texto).toBe(nuevo)
  })

  it("quitar un párrafo entero se queda con el bloque de antes", () => {
    const original = "Gancho\nUna frase.\nDesarrollo"
    const [t] = tramosDeCambio(original, "Gancho\nDesarrollo")
    expect(t.quitar).toBe("\nUna frase.")
    expect(aplicarCambios(original, cambiosDe(original, "Gancho\nDesarrollo")).texto).toBe("Gancho\nDesarrollo")
  })

  it("dice dónde empieza lo puesto en el texto nuevo", () => {
    const nuevo = "Hola gran mundo"
    const [t] = tramosDeCambio("Hola mundo", nuevo)
    expect(nuevo.slice(t.enNuevo, t.enNuevo + t.poner.length)).toBe(t.poner)
  })
})

describe("ubicarCita", () => {
  it("una cita repetida se encuentra por lo que la rodea", () => {
    const texto = "Primero el sol. Después el sol de la tarde."
    const segunda = texto.lastIndexOf("el sol")
    const cita = citaDe(texto, segunda, segunda + "el sol".length)
    expect(ubicarCita(texto, cita)).toEqual({ desde: segunda, hasta: segunda + 6 })
  })

  it("lo que solo se añade se encuentra por su contexto", () => {
    const texto = "Hola mundo"
    expect(ubicarCita(texto, { cita: "", antes: "Hola ", despues: "mundo" })).toEqual({ desde: 5, hasta: 5 })
  })

  it("sigue encontrando su sitio aunque el texto de alrededor haya cambiado algo", () => {
    const cita = citaDe(GUION, GUION.indexOf("scroll"), GUION.indexOf("scroll") + 6)
    expect(ubicarCita(GUION.replace("La frase", "Esa frase"), cita)).not.toBeNull()
  })

  it("si el trozo ya no está, no hay sitio", () => {
    expect(ubicarCita("Otro texto", { cita: "scroll" })).toBeNull()
    expect(aplicarCambio("Otro texto", { cita: "scroll", poner: "x" })).toBeNull()
  })

  it("en un texto vacío, lo añadido va al principio", () => {
    expect(aplicarCambio("", { cita: "", poner: "Hola" })).toBe("Hola")
  })
})

describe("aplicarCambios", () => {
  it("aplica los que encuentran su sitio y devuelve los que no", () => {
    const bueno: CambioTexto = { cita: "mundo", antes: "Hola ", poner: "planeta" }
    const perdido: CambioTexto = { cita: "adiós", poner: "chao" }
    expect(aplicarCambios("Hola mundo", [bueno, perdido])).toEqual({ texto: "Hola planeta", sinSitio: [perdido] })
  })
})

describe("sincronizarSugerencias", () => {
  const original = "La frase que para el scroll. Los pasos, uno por plano."
  const primera = cambiosDe(original, original.replace("para", "frena"))[0]

  it("un cambio nuevo se crea", () => {
    const nuevo = original.replace("para", "frena")
    expect(sincronizarSugerencias(original, tramosDeCambio(original, nuevo), [])).toEqual({ crear: [primera], cambiar: [], retirar: [] })
  })

  it("lo que ya está guardado igual no se toca", () => {
    const nuevo = original.replace("para", "frena")
    expect(sincronizarSugerencias(original, tramosDeCambio(original, nuevo), [{ id: "s1", cambio: primera }])).toEqual({ crear: [], cambiar: [], retirar: [] })
  })

  it("seguir escribiendo en una sugerencia la cambia", () => {
    const nuevo = original.replace("para", "frena en seco")
    const { crear, cambiar, retirar } = sincronizarSugerencias(original, tramosDeCambio(original, nuevo), [{ id: "s1", cambio: primera }])
    expect(crear).toEqual([])
    expect(retirar).toEqual([])
    expect(cambiar).toEqual([{ id: "s1", cambio: expect.objectContaining({ cita: "para", poner: "frena en seco" }) }])
  })

  it("deshacer un cambio retira su sugerencia y otro cambio aparte se crea", () => {
    const nuevo = original.replace("plano", "toma")
    const r = sincronizarSugerencias(original, tramosDeCambio(original, nuevo), [{ id: "s1", cambio: primera }])
    expect(r.retirar).toEqual(["s1"])
    expect(r.crear).toEqual([expect.objectContaining({ cita: "plano", poner: "toma" })])
  })
})

describe("textoAParrafos", () => {
  it("un párrafo por línea, también las vacías, y sin HTML suelto", () => {
    expect(textoAParrafos("Hola <b>\n\n#publi")).toBe("<p>Hola &lt;b&gt;</p><p></p><p>#publi</p>")
  })
})
