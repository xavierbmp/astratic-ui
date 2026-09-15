import { codeToHtml } from "shiki"
import { cn } from "cn"
import { CopyButton } from "@/components/docs/copy-button"

export async function CodeBlock({
  code,
  lang = "tsx",
  title,
  className,
}: {
  code: string
  lang?: string
  title?: string
  className?: string
}) {
  const trimmed = code.replace(/^\n+|\n+$/g, "")
  const html = await codeToHtml(trimmed, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  })
  return (
    <div className={cn("group/code relative overflow-hidden rounded-lg border bg-muted/30", className)}>
      {title && (
        <div className="flex h-8 items-center border-b px-3 font-mono text-[11px] text-muted-foreground">{title}</div>
      )}
      <div
        className="overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed [&_pre]:bg-transparent! [&_code]:font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CopyButton text={trimmed} className={cn("absolute right-2", title ? "top-9" : "top-2")} />
    </div>
  )
}
