import { DsShell } from "./shell"

export const metadata = { title: { default: "Design system", template: "%s · Astratic UI" } }

export default function DsLayout({ children }: { children: React.ReactNode }) {
  return <DsShell>{children}</DsShell>
}
