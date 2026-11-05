"use client"

import { BracesIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export type VariableMenu = { clave: string; label: string }
export type GrupoVariables = { titulo: string; variables: VariableMenu[] }

/**
 * El botón «Variable» de cualquier texto con variables (plantillas, emails, contratos): las variables por grupos, con
 * su nombre y su `{{clave}}`. `onInsert` recibe la clave sin llaves; con `EditorTexto`, se inserta como su ficha
 * (`insertContent({ type: "variable", attrs: { clave } })`), y en un campo de una línea, como `{{clave}}`.
 */
export function MenuVariables({ grupos, onInsert, size = "sm", align = "end" }: { grupos: GrupoVariables[]; onInsert: (clave: string) => void; size?: "sm" | "xs"; align?: "start" | "end" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="outline" size={size === "xs" ? "icon-xs" : "sm"} aria-label="Insertar variable">
          <BracesIcon /> {size === "sm" && "Variable"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="max-h-96 w-72 overflow-y-auto" onCloseAutoFocus={(e) => e.preventDefault()}>
        {grupos
          .filter((g) => g.variables.length)
          .map((g, i) => (
            <DropdownMenuGroup key={g.titulo}>
              {i > 0 && <DropdownMenuSeparator />}
              <DropdownMenuLabel className="text-xs text-muted-foreground">{g.titulo}</DropdownMenuLabel>
              {g.variables.map((v) => (
                <DropdownMenuItem key={v.clave} onSelect={() => onInsert(v.clave)}>
                  <span className="flex-1">{v.label}</span>
                  <code className="font-mono text-[10px] text-muted-foreground">{`{{${v.clave}}}`}</code>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
