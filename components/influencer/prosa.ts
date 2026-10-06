/**
 * Cómo se lee un texto con formato del workspace (guion, brief, contrato, conclusiones): títulos,
 * listas, citas, resaltado y enlaces. El mismo estilo en el editor y donde solo se lee, para que lo
 * que se escribe sea lo que ve la marca.
 */
export const PROSA = [
  "text-[14px] leading-relaxed text-foreground",
  "[&_h1]:mt-6 [&_h1]:mb-2 [&_h1]:text-xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1:first-child]:mt-0",
  "[&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2:first-child]:mt-0",
  "[&_h3]:mt-5 [&_h3]:mb-1 [&_h3]:text-[11px] [&_h3]:font-semibold [&_h3]:tracking-wider [&_h3]:text-muted-foreground [&_h3]:uppercase [&_h3:first-child]:mt-0",
  "[&_p]:my-1.5 [&_p:first-child]:mt-0",
  "[&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-0.5 [&_li>p]:my-0",
  "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-brand [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
  "[&_mark]:rounded-sm [&_mark]:bg-warning-soft [&_mark]:px-0.5 [&_mark]:text-foreground",
  "[&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2",
  "[&_hr]:my-4 [&_hr]:border-border",
  "[&_s]:text-muted-foreground",
].join(" ")
