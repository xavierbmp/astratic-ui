// Los enlaces de la celda de inicio de un registro, a partir de lo que guarda cada base: el @ de una red, una web, un
// email. Cada función devuelve el enlace o nada; `enlaces` se queda con los que hay, en el orden en que se pasan.

import type { EnlaceInicio } from "@/lib/base/campos"

const sinArroba = (usuario: string) => usuario.trim().replace(/^@/, "")
const conEsquema = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`)

export const enlaceInstagram = (usuario?: string | null, cifra?: number | null): EnlaceInicio | null => (usuario?.trim() ? { red: "instagram", href: `https://www.instagram.com/${sinArroba(usuario)}/`, cifra } : null)
export const enlaceTiktok = (usuario?: string | null, cifra?: number | null): EnlaceInicio | null => (usuario?.trim() ? { red: "tiktok", href: `https://www.tiktok.com/@${sinArroba(usuario)}`, cifra } : null)
export const enlaceYoutube = (usuario?: string | null, cifra?: number | null): EnlaceInicio | null => (usuario?.trim() ? { red: "youtube", href: `https://www.youtube.com/@${sinArroba(usuario)}`, cifra } : null)
export const enlaceWeb = (url?: string | null): EnlaceInicio | null => (url?.trim() ? { red: "web", href: conEsquema(url.trim()), titulo: "Web" } : null)
export const enlaceLinkedin = (url?: string | null): EnlaceInicio | null => (url?.trim() ? { red: "linkedin", href: conEsquema(url.trim()) } : null)
export const enlaceEmail = (email?: string | null): EnlaceInicio | null => (email?.trim() ? { red: "email", href: `mailto:${email.trim()}`, titulo: email.trim() } : null)
export const enlaceTelefono = (telefono?: string | null): EnlaceInicio | null => (telefono?.trim() ? { red: "telefono", href: `tel:${telefono.replace(/\s/g, "")}`, titulo: telefono.trim() } : null)

export const enlaces = (...lista: (EnlaceInicio | null)[]): EnlaceInicio[] => lista.filter((e): e is EnlaceInicio => e !== null)

/** El dominio de una web, para enseñarlo: «lumea.es». */
export const dominioDe = (url?: string | null): string | null => (url?.trim() ? url.trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/.*$/, "") : null)
