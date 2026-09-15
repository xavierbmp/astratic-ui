import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "cn"

export function Markdown({ source, className }: { source: string; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-3xl text-sm leading-relaxed",
        "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:scroll-mt-16",
        "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-semibold",
        "[&_p]:mb-3 [&_strong]:font-semibold [&_a]:text-brand [&_a]:underline-offset-2 [&_a:hover]:underline",
        "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1",
        "[&_ul.contains-task-list]:list-none [&_ul.contains-task-list]:pl-0 [&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:size-3.5 [&_input[type=checkbox]]:align-[-2px] [&_input[type=checkbox]]:accent-foreground",
        "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px]",
        "[&_pre]:mb-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-muted/30 [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_table]:mb-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border-b [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:text-xs [&_th]:font-medium [&_th]:text-muted-foreground [&_td]:border-b [&_td]:px-3 [&_td]:py-2 [&_td]:align-top",
        "[&_blockquote]:mb-3 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
        "[&_hr]:my-8",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{source}</ReactMarkdown>
    </div>
  )
}
