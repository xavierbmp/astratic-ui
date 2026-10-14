"use client"

import { PageTabs } from "@/components/app/page-tabs"
import { facturacionTabs } from "@/app/demo/nav"

/** Las pestañas de Facturación de la demo. Viven en un componente cliente porque llevan iconos de lucide. */
export function FacturacionTabsDemo({ current }: { current?: string }) {
  return <PageTabs items={facturacionTabs} current={current} />
}
