import Image from "next/image"
import { cn } from "cn"
import { initials } from "@/lib/format"
import { tintClass, type Tint } from "@/lib/influencer/tints"

const tamanos = {
  xs: "size-6 rounded-md text-[10px]",
  sm: "size-8 rounded-lg text-[11px]",
  md: "size-10 rounded-xl text-xs",
  lg: "size-14 rounded-2xl text-base",
}

/** La marca de un vistazo: su logo o sus iniciales sobre su tinte. Tintes por marca, nunca por estado. */
export function BrandMark({ name, tint, logoUrl, size = "md", className }: { name: string; tint: Tint; logoUrl?: string; size?: keyof typeof tamanos; className?: string }) {
  return (
    <span data-slot="ws-brand-mark" className={cn("relative grid flex-none place-items-center overflow-hidden font-semibold tracking-wide uppercase", tamanos[size], tintClass[tint], className)}>
      {logoUrl ? <Image src={logoUrl} alt={name} fill sizes="56px" className="object-cover" /> : initials(name)}
    </span>
  )
}
