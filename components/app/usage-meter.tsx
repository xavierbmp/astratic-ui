"use client"

import { cn } from "cn"
import { Progress } from "@/components/ui/progress"

const TONO = {
  ok: "[&>[data-slot=progress-indicator]]:bg-primary",
  aviso: "[&>[data-slot=progress-indicator]]:bg-warning",
  critico: "[&>[data-slot=progress-indicator]]:bg-danger",
  lleno: "[&>[data-slot=progress-indicator]]:bg-danger",
} as const

/** Barra de consumo (almacenamiento, cuotas): cifra usada sobre el límite y color según el nivel. */
export function UsageMeter({ label, used, limit, percent, level, hint, className }: { label: React.ReactNode; used: string; limit: string; percent: number; level: keyof typeof TONO; hint?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          <span className={cn("font-semibold text-foreground", level === "aviso" && "text-warning", (level === "critico" || level === "lleno") && "text-danger")}>{used}</span> de {limit} · {percent.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %
        </span>
      </div>
      <Progress value={Math.min(100, percent)} className={cn("h-2", TONO[level])} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
