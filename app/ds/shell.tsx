"use client"

import Link from "next/link"
import { LayoutDashboardIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { Button } from "@/components/ui/button"
import { DemoReportButton } from "@/components/docs/examples/report-demo"
import { dsBrand, dsNav, dsUser } from "./nav"

export function DsShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      brand={dsBrand}
      user={dsUser}
      nav={dsNav}
      report={<DemoReportButton />}
      headerEnd={
        <Button variant="outline" size="sm" asChild className="ml-1 hidden lg:inline-flex">
          <Link href="/demo">
            <LayoutDashboardIcon /> Abrir la demo
          </Link>
        </Button>
      }
    >
      {children}
    </AppShell>
  )
}
