"use client"

import { XIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

export function BulkBar({
  count,
  onClear,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { count: number; onClear: () => void }) {
  if (count === 0) return null
  return (
    <div
      role="toolbar"
      aria-label={`${count} seleccionados`}
      data-slot="bulk-bar"
      className={cn(
        "fixed bottom-6 left-1/2 z-40 flex max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-1.5 overflow-x-auto rounded-full border bg-background/95 py-1.5 pr-1.5 pl-3 whitespace-nowrap shadow-pop backdrop-blur-sm",
        "animate-in fade-in-0 slide-in-from-bottom-2 duration-200",
        className
      )}
      {...props}
    >
      <span className="inline-grid size-6 place-items-center rounded-full bg-foreground text-xs font-semibold tabular-nums text-background">
        {count}
      </span>
      <span className="mr-1 text-sm">seleccionados</span>
      <div className="flex items-center gap-1">{children}</div>
      <Button variant="ghost" size="icon-sm" aria-label="Deseleccionar" onClick={onClear}>
        <XIcon />
      </Button>
    </div>
  )
}
