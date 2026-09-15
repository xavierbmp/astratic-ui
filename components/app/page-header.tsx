import { cn } from "cn"

export function PageHeader({
  title,
  description,
  actions,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div
      data-slot="page-header"
      className={cn("flex flex-wrap items-end justify-between gap-x-6 gap-y-3", className)}
      {...props}
    >
      <div className="min-w-0">
        <h1 className="text-[27px] leading-tight font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && (
        <div className="flex flex-none items-center gap-2.5 whitespace-nowrap">{actions}</div>
      )}
    </div>
  )
}

export function PageBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="page-body"
      className={cn("flex min-h-0 flex-1 flex-col gap-4 px-[34px] pt-[26px] pb-10", className)}
      {...props}
    />
  )
}
