import { describe, expect, it } from "vitest"
import { cifraCompacta, LISTA_TIPOS_CAMPO, type DefCampo } from "@/lib/base/campos"
import { dominioDe, enlaceInstagram, enlaceWeb, enlaces } from "@/lib/base/inicio"
import { vecinosEnLista } from "@/lib/base/lista-abierta"
import { normalizarConfig, vistaDesdeBase, vistaNueva, type VistaBase } from "@/lib/base/vistas"

type Fila = { id: string; nombre: string; usuario: string; estado: string }
const campos: DefCampo<Fila>[] = [
  { id: "nombre", nombre: "Nombre", tipo: "inicio", principal: true, inicio: (f) => ({ nombre: f.nombre }), valor: (f) => f.nombre },
  { id: "usuario", nombre: "Usuario", tipo: "texto", enInicio: true, valor: (f) => f.usuario },
  { id: "estado", nombre: "Estado", tipo: "select", opciones: [{ id: "a", label: "A" }], valor: (f) => f.estado },
]

describe("cifraCompacta", () => {
  it("corta las cifras como en la celda de inicio", () => {
    expect(cifraCompacta(828)).toBe("828")
    expect(cifraCompacta(86_400)).toBe("86,4K")
    expect(cifraCompacta(342_900)).toBe("343K")
    expect(cifraCompacta(1_300_000)).toBe("1,3M")
  })
})

describe("enlaces de la celda de inicio", () => {
  it("se queda con los que hay y quita la arroba", () => {
    expect(enlaces(enlaceInstagram("@lucia", 10), enlaceWeb(""), enlaceWeb("lumea.es"))).toEqual([
      { red: "instagram", href: "https://www.instagram.com/lucia/", cifra: 10 },
      { red: "web", href: "https://lumea.es", titulo: "Web" },
    ])
  })
  it("saca el dominio de una web", () => {
    expect(dominioDe("https://www.lumea.es/tienda")).toBe("lumea.es")
    expect(dominioDe(null)).toBeNull()
  })
})

describe("campos de la base", () => {
  it("la celda de inicio no se ofrece al crear un campo", () => {
    expect(LISTA_TIPOS_CAMPO).not.toContain("inicio")
  })
  it("lo que va dentro de la celda de inicio no sale como columna en una vista nueva", () => {
    const vista = vistaNueva("Todas", campos)
    expect(vista.campos.find((c) => c.id === "usuario")?.visible).toBe(false)
    expect(vista.campos.find((c) => c.id === "estado")?.visible).toBe(true)
  })
  it("una tarjeta con celda de inicio sale limpia", () => {
    const vista = vistaNueva("Tablero", campos, { tipo: "kanban" })
    expect(vista.campos.filter((c) => c.visible).map((c) => c.id)).toEqual(["nombre"])
  })
})

describe("vistas", () => {
  it("una vista nueva nace como la de base y va por su cuenta", () => {
    const base: VistaBase = { ...vistaNueva("Base", campos), filtro: { union: "y", condiciones: [{ campo: "estado", op: "es", valor: "a" }] }, icono: "estrella" }
    const nueva = vistaDesdeBase(base, "v2", "Vista 2")
    expect(nueva.filtro).toEqual(base.filtro)
    expect(nueva.campos).toEqual(base.campos)
    expect(nueva.id).toBe("v2")
    expect(nueva.nombre).toBe("Vista 2")
    expect(nueva.icono).toBeUndefined()
  })
  it("las vistas guardadas con la tabla de antes se ponen al día una vez, con sus filtros", () => {
    const vieja: VistaBase = {
      ...vistaNueva("Base", campos),
      altura: "media",
      filtro: { union: "y", condiciones: [{ campo: "estado", op: "es", valor: "a" }] },
      campos: [
        { id: "nombre", visible: true, ancho: 400 },
        { id: "usuario", visible: true },
        { id: "estado", visible: true },
      ],
    }
    const config = normalizarConfig({ vistas: [vieja] }, campos, [])
    const vista = config.vistas[0]
    expect(config.diseno).toBe(2)
    expect(vista.altura).toBe("corta")
    expect(vista.filtro).toEqual(vieja.filtro)
    expect(vista.campos.find((c) => c.id === "nombre")?.ancho).toBeUndefined()
    expect(vista.campos.find((c) => c.id === "usuario")?.visible).toBe(false)
    // Ya al día, lo que encienda cada persona se respeta.
    const encendida = { ...vista, campos: vista.campos.map((c) => (c.id === "usuario" ? { ...c, visible: true } : c)) }
    expect(normalizarConfig({ ...config, vistas: [encendida] }, campos, []).vistas[0].campos.find((c) => c.id === "usuario")?.visible).toBe(true)
  })
})

describe("recorrido de la página de un registro", () => {
  it("da la posición y los vecinos", () => {
    expect(vecinosEnLista({ vista: "Moda BCN", ids: ["a", "b", "c"] }, "b")).toEqual({ posicion: 2, total: 3, vista: "Moda BCN", anterior: "a", siguiente: "c" })
  })
  it("sin lista o fuera de ella, nada", () => {
    expect(vecinosEnLista(null, "b")).toBeNull()
    expect(vecinosEnLista({ vista: "x", ids: ["a"] }, "b")).toBeNull()
  })
})
