"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { cn } from "cn"

/**
 * HTML que no escribe el portal (el cuerpo de un email, una firma pegada, un documento importado),
 * pintado en un marco aislado: sin scripts y con sus propios estilos, como en un cliente de correo.
 * Así ese HTML no puede cambiar los estilos de la página ni ejecutar nada. El marco crece con su
 * contenido (nunca lleva scroll propio) y toma el color de texto del tema. Los enlaces se abren en
 * otra pestaña, salvo con `interceptarEnlaces`, que manda el clic a `onClick` (en un contenido
 * editable, pulsar es editar).
 */
export function HtmlFrame({
  html,
  onClick,
  interceptarEnlaces = false,
  className,
  title = "Contenido",
}: {
  html: string
  onClick?: () => void
  /** Los enlaces no navegan: el clic va a `onClick` (el email se está revisando para editarlo). */
  interceptarEnlaces?: boolean
  className?: string
  title?: string
}) {
  const ref = React.useRef<HTMLIFrameElement>(null)
  const [alto, setAlto] = React.useState(80)
  const [color, setColor] = React.useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const onClickRef = React.useRef(onClick)
  const interceptarRef = React.useRef(interceptarEnlaces)
  const observador = React.useRef<ResizeObserver | null>(null)
  React.useEffect(() => {
    onClickRef.current = onClick
    interceptarRef.current = interceptarEnlaces
  }, [onClick, interceptarEnlaces])
  React.useEffect(() => () => observador.current?.disconnect(), [])

  // El texto toma el color del tema del portal (el marco no hereda estilos).
  React.useEffect(() => {
    const el = ref.current?.parentElement
    if (el) setColor(getComputedStyle(el).color)
  }, [resolvedTheme])

  const doc = React.useMemo(
    () =>
      `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>` +
      // El marco mide lo que su contenido: nunca lleva barra de scroll propia. Con el mismo color-scheme que
      // la página el fondo queda transparente; si no, en oscuro el navegador pinta el marco de blanco.
      `html{color-scheme:light dark}html,body{margin:0;padding:0;background:transparent;overflow:hidden}` +
      `body{color:${color ?? "inherit"};font:14px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;overflow-wrap:anywhere;padding:12px}` +
      `p{margin:0 0 8px}a{color:inherit;text-decoration:underline}ul,ol{margin:0 0 8px;padding-left:20px}ul{list-style:disc}ol{list-style:decimal}img{max-width:100%;height:auto}` +
      `</style></head><body>${html}</body></html>`,
    [html, color],
  )

  const medir = React.useCallback(() => {
    const d = ref.current?.contentDocument
    if (d?.documentElement) setAlto(Math.max(40, d.documentElement.scrollHeight))
  }, [])

  const alCargar = () => {
    const d = ref.current?.contentDocument
    if (!d) return
    medir()
    // Las imágenes de la firma llegan después y el ancho cambia al estrechar: se vuelve a medir.
    observador.current?.disconnect()
    observador.current = new ResizeObserver(medir)
    observador.current.observe(d.body)
    d.addEventListener("click", (e) => {
      const a = (e.target as Element | null)?.closest?.("a")
      if (a && interceptarRef.current) e.preventDefault()
      onClickRef.current?.()
    })
  }

  return (
    <iframe
      ref={ref}
      title={title}
      // Sin allow-scripts: el HTML del email nunca ejecuta nada. allow-same-origin deja medir su alto.
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      srcDoc={color ? doc : undefined}
      onLoad={alCargar}
      style={{ height: alto }}
      className={cn("block w-full border-0 bg-transparent", className)}
    />
  )
}
