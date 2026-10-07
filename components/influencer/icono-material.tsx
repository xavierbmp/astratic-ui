import { FileArchiveIcon, FileIcon, FileTextIcon, FileVideoIcon, ImageIcon, LinkIcon, type LucideIcon } from "lucide-react"
import type { TipoMaterial } from "@/lib/influencer/modelo"

/** El icono de cada tipo de archivo o enlace: en los materiales de una collab y en lo que se adjunta a una idea. */
export const ICONOS_MATERIAL: Record<TipoMaterial, LucideIcon> = { imagen: ImageIcon, video: FileVideoIcon, pdf: FileTextIcon, documento: FileIcon, enlace: LinkIcon, zip: FileArchiveIcon }
