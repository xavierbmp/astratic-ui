import { toast } from "sonner"

/**
 * Copia un texto al portapapeles y lo dice con su aviso (los mismos argumentos que `toast.success`).
 * Si el navegador no deja copiar (sin permiso, en una web sin https, en el navegador de una app), lo
 * dice también: nunca falla en silencio. Devuelve si se copió, para no seguir como si nada.
 */
export async function copiarTexto(texto: string, ...aviso: Parameters<typeof toast.success>): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto)
  } catch {
    toast.error("Tu navegador no ha dejado copiar", { description: "Selecciona el texto y cópialo a mano." })
    return false
  }
  toast.success(...aviso)
  return true
}
