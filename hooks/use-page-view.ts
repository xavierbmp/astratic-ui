"use client"

import { useLocalStorage } from "@/hooks/use-local-storage"
import { useIsMobile } from "@/hooks/use-mobile"
import type { ViewKind } from "@/components/app/toolbar"

export function usePageView<V extends ViewKind>(pageKey: string, views: V[], defaultView: V = views[0]) {
  const [stored, setView] = useLocalStorage<V>(`view:${pageKey}`, defaultView)
  const isMobile = useIsMobile()
  const available = isMobile && views.length > 1 ? views.filter((v) => v !== "table") : views
  const view = available.includes(stored) ? stored : available[0]
  return { view, setView, views: available }
}
