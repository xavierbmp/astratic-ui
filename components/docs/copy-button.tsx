"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [done, setDone] = React.useState(false)
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label="Copiar"
      className={cn("bg-background/80 opacity-0 transition-opacity group-hover/code:opacity-100 focus-visible:opacity-100", done && "opacity-100", className)}
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setDone(true)
        setTimeout(() => setDone(false), 1500)
      }}
    >
      {done ? <CheckIcon className="text-success" /> : <CopyIcon />}
    </Button>
  )
}
