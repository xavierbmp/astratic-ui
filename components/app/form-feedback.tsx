import { CircleCheckIcon, TriangleAlertIcon } from "lucide-react"
import { cn } from "cn"

export function FormError({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p role="alert" className={cn("flex items-start gap-2 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger", className)}>
      <TriangleAlertIcon className="mt-0.5 size-4 flex-none" aria-hidden />
      <span>{children}</span>
    </p>
  )
}

export function FormOk({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p role="status" className={cn("flex items-start gap-2 rounded-md bg-success-soft px-3 py-2 text-sm text-success", className)}>
      <CircleCheckIcon className="mt-0.5 size-4 flex-none" aria-hidden />
      <span>{children}</span>
    </p>
  )
}

/** Error de un campo concreto, debajo del input. */
export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return <p className="text-xs text-danger">{children}</p>
}
