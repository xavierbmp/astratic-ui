// Copiar y pegar celdas con Excel, Google Sheets y la propia base: texto separado por tabuladores
// (lo que entienden todas las hojas de cálculo) y una tabla HTML para pegar con formato.

/** Un valor entre comillas si lleva tabulador, salto de línea o comillas, como hace Excel. */
function celdaTsv(valor: string): string {
  return /[\t\n\r"]/.test(valor) ? `"${valor.replace(/"/g, '""')}"` : valor
}

export function aTsv(matriz: string[][]): string {
  return matriz.map((fila) => fila.map(celdaTsv).join("\t")).join("\n")
}

/**
 * Lee lo copiado de una hoja de cálculo: filas por salto de línea y celdas por tabulador, con las
 * celdas entre comillas que llevan saltos dentro. Quita la última línea vacía que deja Excel.
 */
export function deTsv(texto: string): string[][] {
  const filas: string[][] = []
  let fila: string[] = []
  let celda = ""
  let entreComillas = false
  let empiezaCelda = true
  const t = texto.replace(/\r\n?/g, "\n")
  for (let i = 0; i < t.length; i += 1) {
    const ch = t[i]
    if (entreComillas) {
      if (ch === '"' && t[i + 1] === '"') {
        celda += '"'
        i += 1
      } else if (ch === '"') entreComillas = false
      else celda += ch
      continue
    }
    if (ch === '"' && empiezaCelda) {
      entreComillas = true
      empiezaCelda = false
      continue
    }
    if (ch === "\t") {
      fila.push(celda)
      celda = ""
      empiezaCelda = true
      continue
    }
    if (ch === "\n") {
      fila.push(celda)
      filas.push(fila)
      fila = []
      celda = ""
      empiezaCelda = true
      continue
    }
    celda += ch
    empiezaCelda = false
  }
  if (celda !== "" || fila.length) {
    fila.push(celda)
    filas.push(fila)
  }
  return filas
}

const escaparHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

/** La misma selección como tabla HTML: al pegarla en un documento o un email sale como tabla. */
export function aHtml(matriz: string[][]): string {
  const filas = matriz.map((fila) => `<tr>${fila.map((c) => `<td>${escaparHtml(c).replace(/\n/g, "<br>")}</td>`).join("")}</tr>`).join("")
  return `<table>${filas}</table>`
}

/**
 * Lo pegado repartido sobre la selección, como en una hoja de cálculo: si se pega una sola celda
 * sobre un rango, se repite en todas; si no, se pega desde la celda de arriba a la izquierda.
 */
export function repartirPegado(pegado: string[][], destino: { f0: number; f1: number; c0: number; c1: number }, limites: { filas: number; cols: number }): { fila: number; col: number; texto: string }[] {
  if (pegado.length === 0) return []
  const unaSola = pegado.length === 1 && pegado[0].length === 1
  const alto = unaSola ? destino.f1 - destino.f0 + 1 : pegado.length
  const ancho = unaSola ? destino.c1 - destino.c0 + 1 : Math.max(...pegado.map((f) => f.length))
  const celdas: { fila: number; col: number; texto: string }[] = []
  for (let i = 0; i < alto; i += 1) {
    for (let j = 0; j < ancho; j += 1) {
      const fila = destino.f0 + i
      const col = destino.c0 + j
      if (fila >= limites.filas || col >= limites.cols) continue
      const texto = unaSola ? pegado[0][0] : pegado[i]?.[j]
      if (texto !== undefined) celdas.push({ fila, col, texto })
    }
  }
  return celdas
}
