"use client"

import Link from "next/link"
import { BookOpenIcon } from "lucide-react"
import { AppShell } from "@/components/app/app-shell"
import { Button } from "@/components/ui/button"
import { DemoReportButton } from "@/components/docs/examples/report-demo"
import { demoBrand, demoNav, demoUser } from "./nav"

export function DemoShell({ children }: { children: React.ReactNode }) {
  return (
    <AppShell
      brand={demoBrand}
      user={demoUser}
      nav={demoNav}
      report={<DemoReportButton />}
      headerEnd={
        <Button variant="outline" size="sm" asChild className="ml-1 hidden lg:inline-flex">
          <Link href="/ds">
            <BookOpenIcon /> Design system
          </Link>
        </Button>
      }
    >
      {children}
    </AppShell>
  )
}
