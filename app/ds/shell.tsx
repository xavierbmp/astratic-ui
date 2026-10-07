"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboardIcon } from "lucide-react"
import { cn } from "cn"
import { AppShell } from "@/components/app/app-shell"
import { Button } from "@/components/ui/button"
import { DemoReportButton } from "@/components/docs/examples/report-demo"
import { DESIGN_SYSTEMS, designSystemFor, type DesignSystemId } from "./design-systems"
import { dsBrand, dsNav, dsUser, influencerBrand, influencerNav } from "./nav"

/** Marca y navegación de cada design system (con iconos, por eso viven en el cliente). */
const SHELLS: Record<DesignSystemId, { brand: typeof dsBrand; nav: typeof dsNav }> = {
  "astratic-ui": { brand: dsBrand, nav: dsNav },
  influencer: { brand: influencerBrand, nav: influencerNav },
}

export function DsShell({ children }: { children: React.ReactNode }) {
  const current = designSystemFor(usePathname())

  return (
    <AppShell
      brand={SHELLS[current.id].brand}
      user={dsUser}
      nav={SHELLS[current.id].nav}
      report={<DemoReportButton />}
      headerEnd={
        <>
          <nav aria-label="Design system" className="ml-1 flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
            {DESIGN_SYSTEMS.map((d) => (
              <Link
                key={d.id}
                href={d.href}
                aria-current={d.id === current.id ? "page" : undefined}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground",
                  d.id === current.id && "bg-background text-foreground shadow-xs",
                )}
              >
                {d.short}
              </Link>
            ))}
          </nav>
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
