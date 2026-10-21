"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Tabs as TabsPrimitive } from "radix-ui"

/**
 * Pestañas de navegación (Xavier, 2026-10-14, sacadas de una captura de referencia): icono y texto, 44 px de alto,
 * 16 px de aire a cada lado y 20 px entre pestañas; la activa en `foreground` con un subrayado de 2 px que pisa la
 * línea gris de abajo, que cruza todo el ancho. Una sola definición para `PageTabs` y la variante `line`, así la
 * subnavegación de una página, de una ficha, de un diálogo o de un bloque se ve igual en todas partes.
 */
export const navTabsListClass =
  "relative flex h-11 w-full max-w-full flex-none items-stretch justify-start gap-5 overflow-x-auto bg-transparent shadow-[inset_0_-1px_0_var(--border)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"

/** Una pestaña de navegación. La activa lleva `data-active` (Radix lo pone solo; `PageTabs`, a mano). */
export const navTabClass =
  "relative inline-flex flex-none items-center justify-center gap-2 rounded-t-md px-4 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-inset disabled:pointer-events-none disabled:opacity-50 data-active:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground after:opacity-0 after:transition-opacity data-active:after:opacity-100"

/** La caja gris del control segmentado. */
export const segmentedListClass = "inline-flex w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground"

/** Control segmentado: para elegir un valor o filtrar dentro de un bloque (Mes · Trimestre · Año, Email · Llamadas). */
export const segmentedTabClass =
  "relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 data-active:bg-background data-active:text-foreground data-active:shadow-sm dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva("group/tabs-list", {
  variants: {
    variant: {
      default: cn(segmentedListClass, "group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col"),
      // Navegación: cambia de página dentro de una ficha, un diálogo o un bloque. Igual que PageTabs.
      line: navTabsListClass,
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

type TabsVariant = NonNullable<VariantProps<typeof tabsListVariants>["variant"]>

/** Cada pestaña se pinta según la variante de su lista. */
const TabsVariantContext = React.createContext<{ variant: TabsVariant; compact: boolean }>({
  variant: "default",
  compact: false,
})

function TabsList({
  className,
  variant = "default",
  compact = false,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants> & {
    /** Navegación en una ficha o un diálogo estrecho: las pestañas juntas y con 12 px de aire, para que quepan. */
    compact?: boolean
  }) {
  const variante = variant ?? "default"
  const contexto = React.useMemo(() => ({ variant: variante, compact }), [variante, compact])
  return (
    <TabsVariantContext.Provider value={contexto}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variante}
        className={cn(tabsListVariants({ variant: variante }), variante === "line" && compact && "gap-0", className)}
        {...props}
      />
    </TabsVariantContext.Provider>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { variant, compact } = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(variant === "line" ? cn(navTabClass, compact && "px-3") : segmentedTabClass, className)}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
