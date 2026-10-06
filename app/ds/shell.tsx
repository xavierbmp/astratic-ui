"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboardIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DemoReportButton } from "@/components/docs/examples/report-demo"
import { dsBrand, dsNav, dsUser, influencerBrand, influencerNav } from "./nav"

/** Los design systems documentados en /ds: el original y sus hijos. La ruta decide cuál está abierto. */
const DESIGN_SYSTEMS = [
  { id: "astratic-ui", label: "Astratic UI", href: "/ds", demo: "/demo", brand: dsBrand, nav: dsNav },
  { id: "influencer", label: "Influencer Workspace", href: "/ds/influencer", demo: null, brand: influencerBrand, nav: influencerNav },
] as const

export function DsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const current =
    DESIGN_SYSTEMS.filter((d) => pathname === d.href || pathname.startsWith(d.href + "/")).sort((a, b) => b.href.length - a.href.length)[0] ??
    DESIGN_SYSTEMS[0]

  return (
    <AppShell
      brand={current.brand}
      user={dsUser}
      nav={current.nav}
      report={<DemoReportButton />}
      headerEnd={
        <>
          <Select value={current.id} onValueChange={(id) => router.push(DESIGN_SYSTEMS.find((d) => d.id === id)?.href ?? "/ds")}>
            <SelectTrigger size="sm" className="ml-1 w-44" aria-label="Design system">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {DESIGN_SYSTEMS.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {current.demo && (
            <Button variant="outline" size="sm" asChild className="hidden lg:inline-flex">
              <Link href={current.demo}>
                <LayoutDashboardIcon /> Abrir la demo
              </Link>
            </Button>
          )}
        </>
      }
    >
      {children}
    </AppShell>
  )
}
