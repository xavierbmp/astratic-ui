// Solo en este repo: guarda en el navegador lo que en el portal guardan las server actions (el
// media kit editado, una propuesta recién preparada), para que el documento A4 que se abre en otra
// pestaña enseñe lo mismo que se acaba de hacer. En el portal este archivo desaparece.
const PREFIJO = "ws-borrador:"

/** Devuelve `false` si el navegador no deja guardar (modo privado, almacenamiento lleno). */
export function guardarBorrador(clave: string, valor: unknown): boolean {
  try {
    window.localStorage.setItem(PREFIJO + clave, JSON.stringify(valor))
    window.dispatchEvent(new StorageEvent("storage", { key: PREFIJO + clave }))
    return true
  } catch {
    return false
  }
}

/** El borrador tal cual se guardó (texto JSON), o `null` si no hay o no se puede leer. */
export function leerBorrador(clave: string): string | null {
  try {
    return window.localStorage.getItem(PREFIJO + clave)
  } catch {
    // Sin acceso al almacenamiento el documento sale con los datos de la página: es lo esperado.
    return null
  }
}
