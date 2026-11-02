// El recorrido de «anterior / siguiente» de la página de un registro. La base deja aquí, al abrir un registro,
// los ids tal como se ven en la vista abierta (con su filtro y su orden) y la página los lee: «12 de 148 en «Moda BCN»».
// Vive en sessionStorage: por pestaña, y sin él la página funciona igual, sin flechas.

export type ListaAbierta = { vista: string; ids: string[] }

const llave = (clave: string) => `astratic:lista-abierta:${clave}`

export function guardarListaAbierta(clave: string, lista: ListaAbierta) {
  try {
    sessionStorage.setItem(llave(clave), JSON.stringify(lista))
  } catch {
    // Sin almacenamiento la página se abre igual, sin flechas.
  }
}

export function leerListaAbierta(clave: string): ListaAbierta | null {
  try {
    const crudo = sessionStorage.getItem(llave(clave))
    return crudo ? (JSON.parse(crudo) as ListaAbierta) : null
  } catch {
    return null
  }
}

/** El anterior y el siguiente de un registro en la lista, y su posición («12 de 148»). */
export function vecinosEnLista(lista: ListaAbierta | null, id: string) {
  const i = lista ? lista.ids.indexOf(id) : -1
  if (!lista || i < 0) return null
  return { posicion: i + 1, total: lista.ids.length, vista: lista.vista, anterior: lista.ids[i - 1] ?? null, siguiente: lista.ids[i + 1] ?? null }
}
