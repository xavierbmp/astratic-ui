import { cn } from "cn"
import { initials } from "@/lib/format"

const sizes = {
  xs: "size-5 text-[9px] rounded-md",
  sm: "size-6 text-[10px] rounded-md",
  md: "size-8 text-xs rounded-lg",
  lg: "size-12 text-sm rounded-xl",
  xl: "size-16 text-lg rounded-2xl",
}

const variants = {
  person: "bg-foreground/[0.07] text-foreground/85",
  entity: "bg-muted text-foreground/80 data-[size=md]:text-[11px]",
}

export type AvatarVariant = keyof typeof variants

export function AvatarInitials({
  name,
  size = "md",
  variant = "person",
  className,
  ...props
}: React.ComponentProps<"span"> & { name: string; size?: keyof typeof sizes; variant?: AvatarVariant }) {
  return (
    <span
      data-slot="avatar-initials"
      data-size={size}
      data-variant={variant}
      aria-label={name}
      title={name}
      className={cn(
        "inline-grid shrink-0 place-items-center font-semibold tracking-wide select-none",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    >
      {initials(name)}
    </span>
  )
}

export function AvatarStack({
  names,
  max = 3,
  size = "sm",
}: {
  names: string[]
  max?: number
  size?: keyof typeof sizes
}) {
  const shown = names.slice(0, max)
  const rest = names.length - shown.length
  return (
    <span className="inline-flex items-center -space-x-1.5">
      {shown.map((n) => (
        <AvatarInitials key={n} name={n} size={size} className="ring-2 ring-background" />
      ))}
      {rest > 0 && (
        <span
          className={cn(
            "inline-grid place-items-center bg-secondary font-medium text-muted-foreground ring-2 ring-background",
            sizes[size]
          )}
        >
          +{rest}
        </span>
      )}
    </span>
  )
}
