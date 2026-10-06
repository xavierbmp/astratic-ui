import { CheckIcon, ClockIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import type { Contrato, Firma } from "@/lib/influencer/modelo"

/** Quién ha firmado y quién falta: ella y la marca, con fecha y hora. */
export function Firmas({ contrato, suNombre, marca }: { contrato: Contrato; suNombre: string; marca: string }) {
  const fila = (lado: Firma["lado"], quien: string) => {
    const f = contrato.firmas.find((x) => x.lado === lado)
    return (
      <li className="flex items-center gap-2.5 text-sm">
        <span className={cn("grid size-6 flex-none place-items-center rounded-full", f ? "bg-success-soft text-success" : "bg-muted text-muted-foreground")}>{f ? <CheckIcon className="size-3.5" /> : <ClockIcon className="size-3.5" />}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{f?.nombre ?? quien}</span>
          <span className="block text-xs text-muted-foreground">{f ? `Firmó el ${fmt.date(f.el)} a las ${fmt.time(f.el)}` : lado === "marca" && contrato.estado === "enviado" ? "Tiene el enlace para firmar" : "Pendiente"}</span>
        </span>
      </li>
    )
  }
  return (
    <ul className="flex flex-col gap-2.5">
      {fila("influencer", suNombre)}
      {fila("marca", marca)}
    </ul>
  )
}
