"use client"

import { useCallback, useSyncExternalStore } from "react"

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  window.addEventListener("storage", cb)
  return () => {
    listeners.delete(cb)
    window.removeEventListener("storage", cb)
  }
}

export function useLocalStorage<T>(key: string, initial: T) {
  const read = () => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw === null ? initial : (JSON.parse(raw) as T)
    } catch {
      return initial
    }
  }
  const snapshot = useSyncExternalStore(subscribe, () => JSON.stringify(read()), () => JSON.stringify(initial))
  const value = JSON.parse(snapshot) as T

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = read()
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved))
      } catch {}
      emit()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  )

  return [value, set] as const
}
