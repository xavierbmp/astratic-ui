"use client"

import { HandCoinsIcon, ReceiptTextIcon } from "lucide-react"
import { PageTabs } from "@/components/app/page-tabs"
import type { PageTab } from "@/lib/nav"

// Las de la demo de Facturación. Viven en un componente cliente porque llevan iconos de lucide.
const facturacionTabs: PageTab[] = [
  { href: "/demo/facturacion", label: "Facturas", icon: ReceiptTextIcon, count: 3 },
  { href: "/demo/facturacion/cobros", label: "Cobros", icon: HandCoinsIcon },
]

/** Las pestañas de subpágina de Facturación, para enseñarlas en la documentación. */
export function FacturacionTabsDemo({ current }: { current?: string }) {
  return <PageTabs items={facturacionTabs} current={current} />
}
