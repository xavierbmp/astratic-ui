import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { statusDotClass, statusToneClass, type StatusTone } from "@/lib/status"

export function StatusBadge({
  tone = "neutral",
  dot = false,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Badge> & { tone?: StatusTone; dot?: boolean }) {
  return (
    <Badge
      variant="secondary"
      data-tone={tone}
      className={cn("border-transparent", statusToneClass[tone], className)}
      {...props}
    >
      {dot && <span aria-hidden className={cn("size-1.5 rounded-full", statusDotClass[tone])} />}
      {children}
    </Badge>
  )
}
