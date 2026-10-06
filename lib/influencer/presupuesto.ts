// El presupuesto de una propuesta: líneas por formato a sus tarifas, extras que suben el fee y el
// aviso cuando lo que ofrece la marca queda por debajo de su mínimo pactado.
import { EXTRAS, type ExtraId, type LineaPresupuesto, type PiezaPedida, type Presupuesto, type Tarifa } from "@/lib/influencer/modelo"
import { PARTE_RED } from "@/lib/influencer/collabs"

export function tarifaDe(formato: LineaPresupuesto["formato"], tarifas: Tarifa[]) {
  return tarifas.find((t) => t.formato === formato)
}

/** Las líneas de salida: cada pieza pedida a su precio de tarifa. */
export function lineasDesdePiezas(piezas: PiezaPedida[], tarifas: Tarifa[]): LineaPresupuesto[] {
  return piezas.map((p) => ({ formato: p.formato, cantidad: p.cantidad, precio: tarifaDe(p.formato, tarifas)?.precio ?? 0 }))
}

export type Calculo = {
  subtotal: number
  recargos: { id: ExtraId; label: string; importe: number }[]
  total: number
  /** Suma de los mínimos pactados de las piezas. */
  minimo: number
  bajoMinimo: boolean
}

export function calcularPresupuesto({ lineas, extras }: Pick<Presupuesto, "lineas" | "extras">, tarifas: Tarifa[]): Calculo {
  const subtotal = lineas.reduce((a, l) => a + l.cantidad * l.precio, 0)
  const recargos = EXTRAS.filter((e) => extras.includes(e.id)).map((e) => ({ id: e.id, label: e.label, importe: Math.round(subtotal * e.recargo) }))
  const total = subtotal + recargos.reduce((a, r) => a + r.importe, 0)
  const minimo = minimoDe(lineas, tarifas)
  return { subtotal, recargos, total, minimo, bajoMinimo: total < minimo }
}

/** Lo mínimo que puede cobrar por esas piezas, según lo pactado con Astratic. */
export function minimoDe(lineas: PiezaPedida[], tarifas: Tarifa[]) {
  return lineas.reduce((a, l) => a + l.cantidad * (tarifaDe(l.formato, tarifas)?.minimo ?? 0), 0)
}

export function totalPresupuesto(p: Presupuesto, tarifas: Tarifa[]) {
  return calcularPresupuesto(p, tarifas).total
}

/** Lo que se lleva ella si la collab es de la red. */
export function importeNeto(importe: number) {
  return Math.round(importe * PARTE_RED)
}
