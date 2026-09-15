import { demoActivity, demoRecords, demoSeries, demoTasks } from "@/lib/demo-data"
import { DashboardView } from "./dashboard-view"

export const metadata = { title: { absolute: "Dashboard · Demo · Astratic UI" } }

export default function DashboardPage() {
  return <DashboardView records={demoRecords} tasks={demoTasks} activity={demoActivity} series={demoSeries} />
}
