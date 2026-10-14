/*
 * Exporta una guía (components/document/guide) a PDF con el Chrome instalado, vía playwright-core:
 * Chrome pagina el contenido corrido y pone el pie (el texto de `data-footer` y el número). Con `--paginas <json>` hace dos
 * pasadas: busca en el texto del primer PDF los marcadores ⟦cap:id⟧ de cada capítulo (con pdftotext),
 * escribe en el JSON en qué página empieza cada uno y vuelve a exportar para que el índice salga numerado.
 *
 *   node scripts/exportar-pdf.ts http://localhost:3020/documentos/guia salida.pdf [--paginas content/paginas.json]
 */
import { execFileSync } from "node:child_process"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { chromium } from "playwright-core"

const MARCADOR = /⟦cap:([^⟧]+)⟧/g
/** Pie de cada página: el texto de `data-footer` del lienzo a la izquierda y el número a la derecha. */
function pie(texto: string) {
  return `<div style="width:100%;padding:0 18mm;display:flex;justify-content:space-between;font-family:-apple-system,Helvetica,Arial,sans-serif;font-size:8.5px;color:#737373"><span>${texto}</span><span class="pageNumber"></span></div>`
}

async function exportar(url: string, archivo: string) {
  const navegador = await chromium.launch({ channel: "chrome" })
  try {
    const pagina = await navegador.newPage()
    await pagina.goto(url, { waitUntil: "networkidle" })
    await pagina.emulateMedia({ media: "print" })
    await pagina.evaluate(() => document.fonts.ready)
    const texto = await pagina.evaluate(() => document.querySelector("[data-slot='guide-book']")?.getAttribute("data-footer") ?? "")
    await pagina.pdf({
      path: archivo,
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: pie(texto),
    })
  } finally {
    await navegador.close()
  }
}

/** Página en la que aparece por primera vez cada marcador de capítulo. */
function paginasPorCapitulo(archivo: string): Record<string, number> {
  const texto = execFileSync("pdftotext", ["-layout", archivo, "-"], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
  const paginas: Record<string, number> = {}
  texto.split("\f").forEach((contenido, i) => {
    for (const coincidencia of contenido.matchAll(MARCADOR)) {
      const id = coincidencia[1]
      if (!(id in paginas)) paginas[id] = i + 1
    }
  })
  return paginas
}

async function main() {
  const [url, salida, ...resto] = process.argv.slice(2)
  if (!url || !salida) {
    console.error("Uso: node scripts/exportar-pdf.ts <url> <salida.pdf> [--paginas <archivo.json>]")
    process.exit(1)
  }
  const indice = resto.indexOf("--paginas")
  const archivoPaginas = indice >= 0 ? resto[indice + 1] : undefined

  if (archivoPaginas) {
    const borrador = join(mkdtempSync(join(tmpdir(), "guia-")), "borrador.pdf")
    await exportar(url, borrador)
    const paginas = paginasPorCapitulo(borrador)
    writeFileSync(archivoPaginas, JSON.stringify(paginas, null, 2) + "\n")
    console.log(`Índice: ${Object.keys(paginas).length} capítulos localizados → ${archivoPaginas}`)
  }
  await exportar(url, salida)
  console.log(`PDF: ${salida}`)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
