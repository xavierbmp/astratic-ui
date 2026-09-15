import { cn } from "cn"

export function WorkGrid({
  aside,
  asideWidth = 320,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { aside?: React.ReactNode; asideWidth?: number }) {
  return (
    <div
      data-slot="work-grid"
      style={{ "--aside-w": `${asideWidth}px` } as React.CSSProperties}
      className={cn(
        "grid min-h-0 flex-1 gap-4",
        aside ? "grid-cols-1 xl:grid-cols-[minmax(0,1fr)_var(--aside-w)] xl:grid-rows-[minmax(0,1fr)]" : "grid-cols-1",
        className
      )}
      {...props}
    >
      <div className="flex min-h-0 min-w-0 flex-col">{children}</div>
      {aside && (
        <div className="relative min-h-80 min-w-0 xl:min-h-0">
          <div className="flex min-h-0 flex-col xl:absolute xl:inset-0">{aside}</div>
        </div>
      )}
    </div>
  )
}
