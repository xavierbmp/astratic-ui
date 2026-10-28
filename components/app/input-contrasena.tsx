"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { cn } from "cn"
import { Input } from "@/components/ui/input"

/** Un campo de contraseña con el ojo para verla mientras se escribe. Lo demás, como `Input`. */
export function InputContrasena({ className, ...props }: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [ver, setVer] = React.useState(false)
  return (
    <div className="relative">
      <Input type={ver ? "text" : "password"} className={cn("pr-9", className)} {...props} />
      <button
        type="button"
        onClick={() => setVer((v) => !v)}
        aria-label={ver ? "Ocultar la contraseña" : "Mostrar la contraseña"}
        aria-pressed={ver}
        className="absolute inset-y-0 right-0 grid w-9 place-items-center rounded-r-md text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground"
      >
        {ver ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
    </div>
  )
}
