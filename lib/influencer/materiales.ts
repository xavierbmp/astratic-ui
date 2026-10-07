// Qué es un archivo que se sube (a los materiales de una collab o a una idea), por su tipo MIME.
import type { TipoMaterial } from "@/lib/influencer/modelo"

/** Imagen, vídeo, PDF, comprimido o, si no es nada de eso, documento. */
export function tipoDeArchivo(mime: string): TipoMaterial {
  if (mime.startsWith("image/")) return "imagen"
  if (mime.startsWith("video/")) return "video"
  if (mime === "application/pdf") return "pdf"
  if (mime.includes("zip")) return "zip"
  return "documento"
}
