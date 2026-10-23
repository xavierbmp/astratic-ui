// Lo que viaja solo con cada reporte (`ReportButton`): la página, la pantalla, el tema, los errores
// recientes y, si se señala, el elemento con sus contenedores del kit.

import { fmt } from "@/lib/format"

export type ReportElement = {
  /** Ruta CSS hasta el elemento. */
  selector: string
  /** Contenedores del kit por los que pasa, con su título: `sheet-content «Ana Ruiz» › detail-section «Contacto» › button`. */
  path: string
  tag: string
  /** Texto visible, recortado. */
  text: string
  /** `outerHTML` recortado a 2.000 caracteres. */
  html: string
  rect: { x: number; y: number; width: number; height: number }
}

export type ReportContext = {
  /** Ruta con la query: `/crm/contactos?registro=…`. */
  url: string
  title: string
  viewport: string
  theme: "light" | "dark"
  userAgent: string
  /** Últimos errores de la página (JS, promesas y `console.error`), el más reciente al final. */
  errors: string[]
}

// ---------- Errores recientes de la página ----------
// Se empiezan a guardar al montar el botón (una vez por pestaña) y viajan con el reporte.

const MAX_ERRORS = 10
const recentErrors: string[] = []
let capturing = false

function toText(v: unknown): string {
  if (v instanceof Error) return `${v.name}: ${v.message}`
  if (typeof v === "string") return v
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

function noteError(message: string) {
  const line = `${fmt.time(new Date())} ${clean(message, 400)}`
  if (recentErrors.at(-1) === line) return
  recentErrors.push(line)
  if (recentErrors.length > MAX_ERRORS) recentErrors.shift()
}

export function captureErrors() {
  if (capturing || typeof window === "undefined") return
  capturing = true
  window.addEventListener("error", (e) => noteError(e.message || toText(e.error)))
  window.addEventListener("unhandledrejection", (e) => noteError(`Promesa rechazada: ${toText(e.reason)}`))
  const original = console.error
  console.error = (...args: unknown[]) => {
    noteError(args.map(toText).join(" "))
    original.apply(console, args)
  }
}

export const recentErrorCount = () => recentErrors.length

export function readContext(): ReportContext {
  return {
    url: location.pathname + location.search,
    title: document.title,
    viewport: `${window.innerWidth} × ${window.innerHeight}`,
    theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
    userAgent: navigator.userAgent,
    errors: [...recentErrors],
  }
}

// ---------- Describir un elemento de la página ----------

export function clean(s: string | null | undefined, max: number) {
  return (s ?? "").replace(/\s+/g, " ").trim().slice(0, max)
}

/** Ruta CSS corta: se para en el primer id estable y prefiere `data-slot` a las clases de Tailwind. */
function cssPath(el: Element): string {
  const parts: string[] = []
  for (let node: Element | null = el; node && node !== el.ownerDocument.body && parts.length < 6; node = node.parentElement) {
    const n = node
    if (n.id && !/^(radix-|_r_)|[:«»]/.test(n.id)) {
      parts.unshift(`#${CSS.escape(n.id)}`)
      break
    }
    let sel = n.tagName.toLowerCase()
    const slot = n.getAttribute("data-slot")
    if (slot) sel += `[data-slot="${slot}"]`
    else {
      const cls = Array.from(n.classList).filter((c) => /^[a-z][\w-]*$/i.test(c)).slice(0, 2)
      if (cls.length) sel += `.${cls.join(".")}`
    }
    const same = n.parentElement ? Array.from(n.parentElement.children).filter((c) => c.tagName === n.tagName) : []
    if (same.length > 1) sel += `:nth-of-type(${same.indexOf(n) + 1})`
    parts.unshift(sel)
  }
  return parts.join(" > ")
}

/** Contenedores cuyo primer título es el suyo (en `tabs-content` sería el del primer bloque). */
const TITLED_SLOT = /^(sheet-content|dialog-content|popover-content|section|detail-section|card|insights-panel|kanban-column)$/

/** Los contenedores del kit (`data-slot`) por los que pasa, con el título de los que lo tienen. */
function kitPath(el: Element): string {
  const parts: string[] = []
  for (let n: Element | null = el; n && n !== el.ownerDocument.body && parts.length < 8; n = n.parentElement) {
    const slot = n.getAttribute("data-slot")
    if (!slot) {
      if (n === el) parts.unshift(n.tagName.toLowerCase())
      continue
    }
    let part = slot
    if (n !== el && TITLED_SLOT.test(slot)) {
      const title = clean(n.querySelector('[data-slot$="title"], h1, h2, h3')?.textContent, 40)
      if (title) part += ` «${title}»`
    }
    parts.unshift(part)
  }
  return parts.join(" › ")
}

const visibleText = (el: Element) =>
  ("innerText" in el ? (el as HTMLElement).innerText : "") || el.textContent || el.getAttribute("aria-label") || el.getAttribute("placeholder")

export function describeElement(el: Element): ReportElement {
  const r = el.getBoundingClientRect()
  const html = el.outerHTML
  return {
    selector: cssPath(el),
    path: kitPath(el),
    tag: el.tagName.toLowerCase(),
    text: clean(visibleText(el), 160),
    html: html.length > 2000 ? `${html.slice(0, 2000)}…` : html,
    rect: { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) },
  }
}

/** Nombre corto para la etiqueta que acompaña al elemento: `button · Nueva propuesta`. */
export function elementLabel(el: Element) {
  const name = el.getAttribute("data-slot") ?? el.tagName.toLowerCase()
  const text = clean(visibleText(el), 32)
  return text ? `${name} · ${text}` : name
}
