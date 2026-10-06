import { describe, expect, it } from "vitest"
import { faltaParaFacturar, formatearIban, retencionSugerida, validarDocumento, validarIban } from "@/lib/influencer/ajustes"

describe("ajustes", () => {
  it("comprueba la letra del DNI y del NIE", () => {
    expect(validarDocumento("12345678Z")).toEqual({ ok: true, tipo: "DNI" })
    expect(validarDocumento("12345678A").ok).toBe(false)
    expect(validarDocumento("x1234567l")).toEqual({ ok: true, tipo: "NIE" })
  })
  it("comprueba el control del CIF, con dígito o con letra", () => {
    expect(validarDocumento("B12345674")).toEqual({ ok: true, tipo: "CIF" })
    expect(validarDocumento("B12345675").ok).toBe(false)
    expect(validarDocumento("hola").ok).toBe(false)
  })
  it("comprueba el IBAN con el módulo 97", () => {
    expect(validarIban("ES91 2100 0418 4502 0005 1332")).toBeNull()
    expect(validarIban("ES91 2100 0418 4502 0005 1333")).toMatch(/no es correcto/)
    expect(validarIban("ES91 2100")).toMatch(/IBAN entero|24/)
    expect(formatearIban("es9121000418450200051332")).toBe("ES91 2100 0418 4502 0005 1332")
  })
  it("la retención según cómo factura", () => {
    expect(retencionSugerida("autonoma")).toBe(15)
    expect(retencionSugerida("autonoma", true)).toBe(7)
    expect(retencionSugerida("sociedad")).toBe(0)
  })
  it("dice qué falta para facturar", () => {
    expect(faltaParaFacturar({ nombre: "A", nif: "1", direccion: "x", iban: "", forma: "sin-alta", ivaPct: 21, irpfPct: 0 })).toEqual(["darte de alta como autónoma o con una sociedad", "el IBAN para que te paguen"])
  })
})
