"use client"

import * as React from "react"
import { cn } from "cn"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export function DetailSheet({
  open,
  onOpenChange,
  width = 440,
  children,
  className,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  width?: number
  children: React.ReactNode
  className?: string
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        style={{ "--detail-w": `${width}px` } as React.CSSProperties}
        className={cn("w-full gap-0 p-0 sm:max-w-(--detail-w)", className)}
      >
        {children}
      </SheetContent>
    </Sheet>
  )
}

export function DetailHeader({
  leading,
  title,
  subtitle,
  status,
  actions,
  className,
}: {
  leading?: React.ReactNode
  title: React.ReactNode
  subtitle?: React.ReactNode
  status?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <SheetHeader className={cn("flex-none gap-3 border-b p-4 pr-12", className)}>
      <div className="flex items-start gap-3">
        {leading}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SheetTitle className="text-[15px] leading-tight font-semibold">{title}</SheetTitle>
            {status}
          </div>
          {subtitle ? (
            <SheetDescription className="mt-0.5 truncate text-xs">{subtitle}</SheetDescription>
          ) : (
            <SheetDescription className="sr-only">Detalle</SheetDescription>
          )}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </SheetHeader>
  )
}

export function DetailBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("min-h-0 flex-1 overflow-y-auto", className)} {...props} />
}

export function DetailSection({
  title,
  action,
  className,
  children,
}: {
  title: React.ReactNode
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn("border-b px-4 py-3 last:border-b-0", className)}>
      <div className="mb-2 flex items-center">
        <h3 className="text-[13px] font-semibold">{title}</h3>
        {action && <div className="ml-auto text-xs">{action}</div>}
      </div>
      {children}
    </section>
  )
}

export function DetailFields({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">{children}</dl>
}

export function DetailField({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-xs leading-6 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 leading-6">{children}</dd>
    </>
  )
}

export function DetailFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-none items-center justify-end gap-2 border-t bg-background p-3", className)}
      {...props}
    />
  )
}
