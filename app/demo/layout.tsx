import { DemoShell } from "./shell"

export const metadata = { title: { default: "Demo", template: "%s · Demo · Astratic UI" } }

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <DemoShell>{children}</DemoShell>
}
