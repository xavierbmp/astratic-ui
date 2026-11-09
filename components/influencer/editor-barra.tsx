"use client"

import * as React from "react"
import { useEditorState, type Editor } from "@tiptap/react"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  BoldIcon,
  ChevronDownIcon,
  HighlighterIcon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  QuoteIcon,
  Redo2Icon,
  RemoveFormattingIcon,
  StrikethroughIcon,
  UnderlineIcon,
  Undo2Icon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MenuVariables, type GrupoVariables } from "@/components/app/menu-variables"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const BLOQUES = [
  { id: "p", label: "Texto", activo: (e: Editor) => e.isActive("paragraph"), aplicar: (e: Editor) => e.chain().focus().setParagraph().run() },
  { id: "h2", label: "Título", activo: (e: Editor) => e.isActive("heading", { level: 2 }), aplicar: (e: Editor) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { id: "h3", label: "Apartado", activo: (e: Editor) => e.isActive("heading", { level: 3 }), aplicar: (e: Editor) => e.chain().focus().toggleHeading({ level: 3 }).run() },
] as const

function Boton({ icon: Icon, label, atajo, activo, disabled, onClick }: { icon: LucideIcon; label: string; atajo?: string; activo?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label={label} aria-pressed={activo} disabled={disabled} onClick={onClick} className={cn("size-7", activo ? "bg-muted text-foreground" : "text-muted-foreground")}>
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {atajo && <span className="ml-1.5 text-muted-foreground">{atajo}</span>}
      </TooltipContent>
    </Tooltip>
  )
}

/**
 * Pide la dirección de un enlace en un popover (nunca `window.prompt`). Vacío lo quita. Con `variables`, el botón
 * «Variable» pone una (`{{alta}}`) donde está el cursor de la dirección.
 */
function BotonEnlace({ editor, activo, variables }: { editor: Editor; activo: boolean; variables?: GrupoVariables[] }) {
  const [abierto, setAbierto] = React.useState(false)
  const [url, setUrl] = React.useState("")
  const campo = React.useRef<HTMLInputElement>(null)
  const ponerVariable = (clave: string) => {
    const el = campo.current
    const ini = el?.selectionStart ?? url.length
    const fin = el?.selectionEnd ?? ini
    const texto = `{{${clave}}}`
    setUrl((u) => u.slice(0, ini) + texto + u.slice(fin))
    requestAnimationFrame(() => {
      el?.focus()
      el?.setSelectionRange(ini + texto.length, ini + texto.length)
    })
  }
  const aplicar = () => {
    const limpia = url.trim()
    if (!limpia) editor.chain().focus().extendMarkRange("link").unsetLink().run()
    // Una variable (`{{alta}}`) va tal cual: se rellena al usar la plantilla con el enlace de cada persona.
    else editor.chain().focus().extendMarkRange("link").setLink({ href: /^(https?:\/\/|mailto:|tel:|\{\{)/.test(limpia) ? limpia : `https://${limpia}` }).run()
    setAbierto(false)
  }
  return (
    <Popover
      open={abierto}
      onOpenChange={(o) => {
        setAbierto(o)
        if (o) setUrl(String(editor.getAttributes("link").href ?? ""))
      }}
    >
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Enlace" aria-pressed={activo} className={cn("size-7", activo ? "bg-muted text-foreground" : "text-muted-foreground")}>
          <LinkIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault()
            aplicar()
          }}
        >
          <Input ref={campo} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… o {{variable}}" aria-label="Dirección del enlace" autoFocus className="h-8" />
          {variables && variables.length > 0 && <MenuVariables grupos={variables} onInsert={ponerVariable} size="xs" />}
          <Button type="submit" size="sm">
            {url.trim() ? "Poner" : "Quitar"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Barra del editor: deshacer, tipo de bloque, formato, listas, cita, alineación, enlace y limpiar. A
 * la derecha, lo propio de cada página (plantillas, variables, cláusulas).
 */
export function EditorBarra({ editor, extra, variablesEnlace, className }: { editor: Editor; extra?: React.ReactNode; /** Las que se pueden poner en la dirección de un enlace. */ variablesEnlace?: GrupoVariables[]; className?: string }) {
  const estado = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bloque: BLOQUES.find((b) => b.activo(e))?.label ?? "Texto",
      negrita: e.isActive("bold"),
      cursiva: e.isActive("italic"),
      subrayado: e.isActive("underline"),
      tachado: e.isActive("strike"),
      resaltado: e.isActive("highlight"),
      lista: e.isActive("bulletList"),
      numerada: e.isActive("orderedList"),
      cita: e.isActive("blockquote"),
      centro: e.isActive({ textAlign: "center" }),
      enlace: e.isActive("link"),
      puedeDeshacer: e.can().undo(),
      puedeRehacer: e.can().redo(),
    }),
  })
  const c = () => editor.chain().focus()

  return (
    <div data-slot="ws-editor-barra" role="toolbar" aria-label="Formato" className={cn("flex flex-wrap items-center gap-0.5 border-b px-2 py-1.5", className)}>
      <Boton icon={Undo2Icon} label="Deshacer" atajo="⌘Z" disabled={!estado.puedeDeshacer} onClick={() => c().undo().run()} />
      <Boton icon={Redo2Icon} label="Rehacer" atajo="⇧⌘Z" disabled={!estado.puedeRehacer} onClick={() => c().redo().run()} />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="h-7 w-[104px] justify-between px-2 font-normal">
            {estado.bloque} <ChevronDownIcon className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {BLOQUES.map((b) => (
            <DropdownMenuItem key={b.id} onSelect={() => b.aplicar(editor)} className={cn(b.id === "h2" && "text-base font-semibold", b.id === "h3" && "text-xs font-semibold tracking-wider uppercase")}>
              {b.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Boton icon={BoldIcon} label="Negrita" atajo="⌘B" activo={estado.negrita} onClick={() => c().toggleBold().run()} />
      <Boton icon={ItalicIcon} label="Cursiva" atajo="⌘I" activo={estado.cursiva} onClick={() => c().toggleItalic().run()} />
      <Boton icon={UnderlineIcon} label="Subrayado" atajo="⌘U" activo={estado.subrayado} onClick={() => c().toggleUnderline().run()} />
      <Boton icon={StrikethroughIcon} label="Tachado" activo={estado.tachado} onClick={() => c().toggleStrike().run()} />
      <Boton icon={HighlighterIcon} label="Resaltar" activo={estado.resaltado} onClick={() => c().toggleHighlight().run()} />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <Boton icon={ListIcon} label="Lista" activo={estado.lista} onClick={() => c().toggleBulletList().run()} />
      <Boton icon={ListOrderedIcon} label="Lista numerada" activo={estado.numerada} onClick={() => c().toggleOrderedList().run()} />
      <Boton icon={QuoteIcon} label="Cita" activo={estado.cita} onClick={() => c().toggleBlockquote().run()} />
      <Boton icon={estado.centro ? AlignLeftIcon : AlignCenterIcon} label={estado.centro ? "Alinear a la izquierda" : "Centrar"} onClick={() => c().setTextAlign(estado.centro ? "left" : "center").run()} />
      <BotonEnlace editor={editor} activo={estado.enlace} variables={variablesEnlace} />
      <Boton icon={RemoveFormattingIcon} label="Quitar formato" onClick={() => c().unsetAllMarks().clearNodes().run()} />
      {extra && <div className="ml-auto flex items-center gap-1.5 pl-2">{extra}</div>}
    </div>
  )
}
