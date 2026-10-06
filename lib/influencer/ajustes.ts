// Ajustes de su cuenta: comprobar el NIF, NIE o CIF y el IBAN antes de guardarlos (salen en cada
// factura), la retención que toca según cómo factura y qué datos le faltan para poder facturar.
import type { DatosFiscales, FormaFiscal } from "@/lib/influencer/modelo"

const LETRAS_DNI = "TRWAGMYFPDXBNJZSQVHLCKE"
const LETRAS_CONTROL_CIF = "JABCDEFGHI"

export type Documento = { ok: true; tipo: "DNI" | "NIE" | "CIF" } | { ok: false; error: string }

const limpiar = (texto: string) => texto.replace(/[\s.-]/g, "").toUpperCase()

/** Comprueba un DNI, NIE o CIF español con su letra o dígito de control. */
export function validarDocumento(texto: string): Documento {
  const v = limpiar(texto)
  if (/^\d{8}[A-Z]$/.test(v)) return LETRAS_DNI[Number(v.slice(0, 8)) % 23] === v[8] ? { ok: true, tipo: "DNI" } : { ok: false, error: "La letra del DNI no cuadra" }
  if (/^[XYZ]\d{7}[A-Z]$/.test(v)) {
    const numero = Number(`${"XYZ".indexOf(v[0])}${v.slice(1, 8)}`)
    return LETRAS_DNI[numero % 23] === v[8] ? { ok: true, tipo: "NIE" } : { ok: false, error: "La letra del NIE no cuadra" }
  }
  if (/^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/.test(v)) {
    const digitos = v.slice(1, 8).split("").map(Number)
    const suma = digitos.reduce((a, d, i) => a + (i % 2 === 0 ? Math.floor((d * 2) / 10) + ((d * 2) % 10) : d), 0)
    const control = (10 - (suma % 10)) % 10
    const ok = v[8] === String(control) || v[8] === LETRAS_CONTROL_CIF[control]
    return ok ? { ok: true, tipo: "CIF" } : { ok: false, error: "El dígito de control del CIF no cuadra" }
  }
  return { ok: false, error: "Escribe un DNI (12345678Z), un NIE (X1234567L) o un CIF (B12345678)" }
}

/** Comprueba un IBAN con su código de control (módulo 97). Los españoles tienen 24 caracteres. */
export function validarIban(texto: string): string | null {
  const v = limpiar(texto)
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(v)) return "Escribe el IBAN entero, empezando por el país (ES…)"
  if (v.startsWith("ES") && v.length !== 24) return "Un IBAN español tiene 24 caracteres"
  const reordenado = `${v.slice(4)}${v.slice(0, 4)}`.replace(/[A-Z]/g, (l) => String(l.charCodeAt(0) - 55))
  let resto = 0
  for (const digito of reordenado) resto = (resto * 10 + Number(digito)) % 97
  return resto === 1 ? null : "El IBAN no es correcto: revisa los números"
}

/** «ES12 3456 7890 1234 5678 9012». */
export const formatearIban = (texto: string) => limpiar(texto).replace(/(.{4})/g, "$1 ").trim()

/** La retención de IRPF que toca: 15 % como autónoma (7 % los tres primeros años) y nada con sociedad o sin alta. */
export function retencionSugerida(forma: FormaFiscal, primerosAnos = false) {
  if (forma !== "autonoma") return 0
  return primerosAnos ? 7 : 15
}

/** Lo que le falta para poder hacer una factura: vacío si está todo. */
export function faltaParaFacturar(d: DatosFiscales) {
  const faltan: string[] = []
  if (d.forma === "sin-alta") faltan.push("darte de alta como autónoma o con una sociedad")
  if (!d.nombre.trim()) faltan.push("el nombre o la razón social")
  if (!d.nif.trim()) faltan.push("el NIF")
  if (!d.direccion.trim()) faltan.push("la dirección fiscal")
  if (!d.iban.trim()) faltan.push("el IBAN para que te paguen")
  return faltan
}
