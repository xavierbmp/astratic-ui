import type { LucideIcon } from "lucide-react"
import {
  AlertTriangleIcon,
  BoxIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ColumnsIcon,
  FileTextIcon,
  LayoutGridIcon,
  ListFilterIcon,
  PackageCheckIcon,
  PlusIcon,
  ReceiptIcon,
  RouteIcon,
  SearchIcon,
  Table2Icon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react"
import { cn } from "cn"
import { AvatarInitials } from "@/components/app/avatar-initials"
import { KpiCard, KpiRow } from "@/components/app/kpi"
import { Section, SectionHeader } from "@/components/app/section"
import { StatusBadge } from "@/components/app/status-badge"
import type { StatusTone } from "@/lib/status"

/*
 * Mockups de la propuesta demo, compuestos con el kit real (KpiCard, Section, StatusBadge, AvatarInitials).
 * Son estáticos: se escalan con `DocFigure zoom` y se imprimen como parte del PDF.
 */

const nav: { label: string; items: { label: string; icon: LucideIcon; id: string; badge?: number }[] }[] = [
  {
    label: "Operaciones",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutGridIcon },
      { id: "pedidos", label: "Pedidos", icon: BoxIcon, badge: 12 },
      { id: "rutas", label: "Rutas y flota", icon: RouteIcon },
      { id: "incidencias", label: "Incidencias", icon: AlertTriangleIcon, badge: 7 },
    ],
  },
  {
    label: "Clientes",
    items: [
      { id: "crm", label: "CRM", icon: UsersIcon },
      { id: "portal", label: "Portal del cliente", icon: PackageCheckIcon },
    ],
  },
  {
    label: "Administración",
    items: [
      { id: "facturacion", label: "Facturación", icon: ReceiptIcon },
      { id: "gastos", label: "Proveedores y gastos", icon: WalletIcon },
    ],
  },
]

function MockShell({ active, crumb, children }: { active: string; crumb: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[700px] w-[1100px] bg-background text-[13.5px] text-foreground">
      <aside className="flex w-[220px] flex-none flex-col border-r bg-sidebar px-3 py-3">
        <div className="flex items-center gap-2.5 px-1.5 pb-4">
          <AvatarInitials name="Rumbo Logística" variant="entity" size="sm" />
          <div className="leading-tight">
            <div className="text-[13px] font-semibold">Rumbo</div>
            <div className="text-[11px] text-muted-foreground">Logística</div>
          </div>
        </div>
        {nav.map((group) => (
          <div key={group.label} className="mb-3">
            <div className="px-2 pb-1 text-[11px] text-muted-foreground">{group.label}</div>
            {group.items.map(({ id, label, icon: Icon, badge }) => (
              <div
                key={id}
                className={cn(
                  "flex h-8 items-center gap-2 rounded-md px-2 text-[13px]",
                  id === active && "bg-sidebar-accent font-medium"
                )}
              >
                <Icon className="size-4 text-muted-foreground" />
                <span className="flex-1">{label}</span>
                {badge && <span className="text-[11px] text-warning tabular-nums">{badge}</span>}
              </div>
            ))}
          </div>
        ))}
        <div className="mt-auto flex items-center gap-2.5 border-t px-1.5 pt-3">
          <AvatarInitials name="Laura Méndez" size="sm" />
          <div className="leading-tight">
            <div className="text-[12.5px] font-medium">Laura Méndez</div>
            <div className="text-[11px] text-muted-foreground">Jefa de tráfico</div>
          </div>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-12 flex-none items-center gap-2 border-b px-5 text-[12.5px] text-muted-foreground">
          <span>Operaciones</span>
          <span>›</span>
          <span className="font-medium text-foreground">{crumb}</span>
          <span className="ml-auto flex h-7 w-56 items-center gap-2 rounded-md border px-2.5 text-[12px]">
            <SearchIcon className="size-3.5" />
            Buscar en el portal…
          </span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-4 px-[30px] pt-6">{children}</div>
      </div>
    </div>
  )
}

function MockHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div>
        <h1 className="text-[27px] leading-tight font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  )
}

const deliveries = [118, 131, 124, 142, 150, 96, 0, 128, 139, 147, 151, 163, 102, 0, 137, 152, 149, 171, 184]

const routes: { name: string; driver: string; done: number; total: number; tone: StatusTone; status: string }[] = [
  { name: "Ruta Norte", driver: "Diego Ruiz", done: 21, total: 24, tone: "info", status: "En ruta" },
  { name: "Ruta Centro", driver: "Marta Gil", done: 30, total: 30, tone: "success", status: "Completada" },
  { name: "Ruta Puerto", driver: "Iván Soler", done: 9, total: 22, tone: "warning", status: "Retraso 25 min" },
  { name: "Ruta Sur", driver: "Nerea Campos", done: 17, total: 26, tone: "info", status: "En ruta" },
  { name: "Ruta Polígono", driver: "Pablo Vidal", done: 4, total: 19, tone: "danger", status: "Avería" },
]

export function MockDashboard() {
  const max = Math.max(...deliveries)
  return (
    <MockShell active="dashboard" crumb="Dashboard">
      <MockHeader title="Buenos días, Laura" description="Toda la operación de hoy en una pantalla · actualizado hace 2 min" />
      <KpiRow>
        <KpiCard icon={BoxIcon} label="Pedidos de hoy" value="184" delta={{ value: 6.2, label: "vs lunes pasado" }} />
        <KpiCard icon={PackageCheckIcon} label="Entregados" value="142" hint="77 %" delta={{ value: 3.1, label: "tasa a esta hora" }} />
        <KpiCard icon={TruckIcon} label="Furgonetas en ruta" value="23" hint="de 26" alert="1 en taller" />
        <KpiCard icon={AlertTriangleIcon} label="Incidencias abiertas" value="7" alert="2 con más de 24 h" />
      </KpiRow>
      <div className="grid flex-1 grid-cols-[1fr_340px] gap-4 pb-6">
        <Section>
          <SectionHeader icon={CalendarDaysIcon} title="Entregas por día" count={19} meta="últimos días laborables" />
          <div className="flex flex-1 items-end gap-2.5 px-5 pt-6 pb-3">
            {deliveries.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn("w-full rounded-t-[4px]", i === deliveries.length - 1 ? "bg-chart-1" : "bg-chart-3")}
                  style={{ height: v ? `${(v / max) * 170}px` : "2px" }}
                />
                <span className="text-[10px] text-muted-foreground tabular-nums">{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 border-t text-[12px]">
            {[
              ["Entregas del mes", "2.604"],
              ["A la primera", "94 %"],
              ["Coste medio por parada", "3,18 €"],
            ].map(([label, value]) => (
              <div key={label} className="border-r px-5 py-3 last:border-0">
                <div className="text-muted-foreground">{label}</div>
                <div className="mt-0.5 text-lg font-semibold tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        </Section>
        <Section>
          <SectionHeader icon={RouteIcon} title="Rutas de hoy" count={routes.length} />
          <div className="divide-y">
            {routes.map((r) => (
              <div key={r.name} className="flex items-center gap-3 px-4 py-3">
                <AvatarInitials name={r.driver} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[13px] font-medium">{r.name}</span>
                    <span className="text-[11.5px] text-muted-foreground tabular-nums">
                      {r.done}/{r.total}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${(r.done / r.total) * 100}%` }} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[11.5px] text-muted-foreground">{r.driver}</span>
                    <StatusBadge tone={r.tone}>{r.status}</StatusBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </MockShell>
  )
}

const orders: { id: string; client: string; address: string; route: string; eta: string; tone: StatusTone; status: string; checked?: boolean }[] = [
  { id: "RL-20931", client: "Mercado Verde", address: "C/ Aragón 214, Barcelona", route: "Norte", eta: "10:40", tone: "success", status: "Entregado" },
  { id: "RL-20932", client: "Farmacia Lumen", address: "Av. Diagonal 88, Barcelona", route: "Centro", eta: "11:15", tone: "info", status: "En ruta", checked: true },
  { id: "RL-20933", client: "Cafés Tostado", address: "C/ Mallorca 402, Barcelona", route: "Centro", eta: "11:30", tone: "info", status: "En ruta", checked: true },
  { id: "RL-20934", client: "Óptica Prisma", address: "Rbla. Poblenou 51, Barcelona", route: "Puerto", eta: "12:05", tone: "warning", status: "Retrasado" },
  { id: "RL-20935", client: "Librería Faro", address: "C/ Sants 17, Barcelona", route: "Sur", eta: "12:20", tone: "neutral", status: "Pendiente" },
  { id: "RL-20936", client: "Mercado Verde", address: "C/ Balmes 130, Barcelona", route: "Norte", eta: "12:45", tone: "info", status: "En ruta" },
  { id: "RL-20937", client: "Taller Onda", address: "Pol. Zona Franca 12", route: "Polígono", eta: "—", tone: "danger", status: "Incidencia" },
]

function MockCheckbox({ checked }: { checked?: boolean }) {
  return (
    <span
      className={cn(
        "grid size-4 place-items-center rounded-[4px] border",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background"
      )}
    >
      {checked && <span className="text-[10px] leading-none">✓</span>}
    </span>
  )
}

export function MockOrders() {
  return (
    <MockShell active="pedidos" crumb="Pedidos">
      <MockHeader
        title="Pedidos"
        description="Todos los pedidos, desde que entran hasta que se entregan"
      />
      <KpiRow>
        <KpiCard icon={BoxIcon} label="Entrados hoy" value="184" delta={{ value: 6.2, label: "vs lunes pasado" }} />
        <KpiCard icon={FileTextIcon} label="Desde el portal" value="61" hint="33 %" />
        <KpiCard icon={CalendarDaysIcon} label="Pendientes de asignar" value="12" alert="5 para mañana a primera hora" />
        <KpiCard icon={AlertTriangleIcon} label="Retrasados" value="4" delta={{ value: -1.8, label: "vs semana pasada", invert: true }} />
      </KpiRow>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-64 items-center gap-2 rounded-lg border px-2.5 text-[13px] text-muted-foreground">
          <SearchIcon className="size-4" />
          Buscar pedido o cliente…
        </span>
        {["Estado", "Ruta", "Cliente"].map((f) => (
          <span key={f} className="flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[13px]">
            <ListFilterIcon className="size-3.5 text-muted-foreground" />
            {f}
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          </span>
        ))}
        <span className="ml-auto flex h-8 items-center rounded-lg bg-muted p-0.5">
          <span className="grid h-7 w-8 place-items-center rounded-md bg-background shadow-xs">
            <Table2Icon className="size-4" />
          </span>
          <span className="grid h-7 w-8 place-items-center text-muted-foreground">
            <ColumnsIcon className="size-4" />
          </span>
          <span className="grid h-7 w-8 place-items-center text-muted-foreground">
            <CalendarDaysIcon className="size-4" />
          </span>
        </span>
        <span className="flex h-8 flex-none items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium whitespace-nowrap text-primary-foreground">
          <PlusIcon className="size-4" />
          Nuevo pedido
        </span>
      </div>
      <Section className="mb-6 flex-none">
        <SectionHeader icon={BoxIcon} title="Pedidos de hoy" count={184} meta="2 seleccionados" />
        <div className="grid h-9 grid-cols-[28px_120px_1fr_1.2fr_90px_70px_120px] items-center gap-3 border-b px-4 text-[12px] text-muted-foreground">
          <MockCheckbox />
          <span>Pedido</span>
          <span>Cliente</span>
          <span>Dirección</span>
          <span>Ruta</span>
          <span className="text-right">Entrega</span>
          <span>Estado</span>
        </div>
        {orders.map((o) => (
          <div
            key={o.id}
            className={cn(
              "grid h-10 grid-cols-[28px_120px_1fr_1.2fr_90px_70px_120px] items-center gap-3 border-b px-4 last:border-0",
              o.checked && "bg-muted/60"
            )}
          >
            <MockCheckbox checked={o.checked} />
            <span className="font-medium tabular-nums">{o.id}</span>
            <span className="flex items-center gap-2 whitespace-nowrap">
              <AvatarInitials name={o.client} variant="entity" size="xs" />
              {o.client}
            </span>
            <span className="truncate text-muted-foreground">{o.address}</span>
            <span>{o.route}</span>
            <span className="text-right tabular-nums">{o.eta}</span>
            <span>
              <StatusBadge tone={o.tone} dot>
                {o.status}
              </StatusBadge>
            </span>
          </div>
        ))}
      </Section>
    </MockShell>
  )
}
