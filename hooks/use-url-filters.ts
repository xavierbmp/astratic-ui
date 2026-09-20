"use client"

import * as React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

/**
 * Filtros de listado en la URL. Cada cambio hace `router.replace` en una transición: la página
 * (servidor) vuelve a cargar los datos filtrados y `pending` sirve para atenuar la tabla mientras.
 */
export function useUrlFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = React.useTransition()

  const get = React.useCallback((key: string): string[] => {
    const v = params.get(key)
    return v ? v.split(",").filter(Boolean) : []
  }, [params])

  const getText = React.useCallback((key: string) => params.get(key) ?? "", [params])

  const replace = React.useCallback(
    (mutate: (sp: URLSearchParams) => void) => {
      const sp = new URLSearchParams(params.toString())
      mutate(sp)
      sp.delete("registro")
      const qs = sp.toString()
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }))
    },
    [params, pathname, router],
  )

  const set = React.useCallback((key: string, values: string[]) => replace((sp) => (values.length ? sp.set(key, values.join(",")) : sp.delete(key))), [replace])
  const setText = React.useCallback((key: string, value: string) => replace((sp) => (value.trim() ? sp.set(key, value.trim()) : sp.delete(key))), [replace])
  const clear = React.useCallback((keys: string[]) => replace((sp) => keys.forEach((k) => sp.delete(k))), [replace])

  return { get, getText, set, setText, clear, pending }
}

/** Valor local con retardo: escribe al momento, aplica a los 300 ms. */
export function useDebouncedText(initial: string, onCommit: (v: string) => void, delay = 300) {
  const [value, setValue] = React.useState(initial)
  const committed = React.useRef(initial)
  React.useEffect(() => {
    if (value === committed.current) return
    const t = setTimeout(() => {
      committed.current = value
      onCommit(value)
    }, delay)
    return () => clearTimeout(t)
  }, [value, delay, onCommit])
  return [value, setValue] as const
}
