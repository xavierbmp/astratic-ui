// El media kit: sus cifras, qué bloques se enseñan y cómo se reparten en hojas A4.
import { BLOQUES_MEDIA_KIT, FORMATOS, nombrePlataforma, type BloqueMediaKit, type Formato, type MediaKit, type Perfil } from "@/lib/influencer/modelo"
import { bloquesVisibles as visibles, type DatoBloque } from "@/lib/bloques"

/** Lo que cabe en una hoja entre la cabecera y el pie (medido en la hoja de verdad, 2026-10-16). */
const ALTO_HOJA = 975

/** Lo que hace falta para medir cada bloque: cuántas marcas, tarifas y líneas de presupuesto enseña. */
export type ContextoHojas = { perfil: Perfil; kit: MediaKit; marcasTrabajadas: string[] }

/**
 * Alto de cada bloque en la hoja (px a tamaño real, con su título y su margen), medido en la hoja de verdad y según lo
 * que enseña: las marcas van de cuatro en cuatro y cada tarifa o línea del presupuesto es una fila. Con unas alturas
 * fijas, un media kit con muchas marcas se salía por el pie de la hoja (reporte cmvazxev).
 */
export function altoDelBloque(bloque: BloqueMediaKit, { perfil, kit, marcasTrabajadas }: ContextoHojas): number {
  const ve = (clave: string) => !kit.ocultos?.includes(clave)
  switch (bloque) {
    case "portada":
      return ve("portada.imagen") ? 320 : 200
    case "cifras":
      return 110
    case "redes":
      return 275
    case "audiencia":
      return 125
    case "destacados":
      return 375
    case "marcas":
      return 74 + Math.ceil(marcasTrabajadas.filter((m) => ve(`marcas.${m}`)).length / 4) * 38
    case "tarifas":
      return 130 + perfil.tarifas.filter((t) => ve(`tarifas.${t.formato}`)).length * 32
    case "presupuesto": {
      const { lineas, pack, descuento } = presupuestoDelKit(kit, perfil)
      return 130 + lineas.length * 32 + (pack ? 63 : 0) + (descuento ? 30 : 0)
    }
    case "contacto":
      return 160
  }
}

/**
 * El media kit con todos los bloques: los que se han añadido después de guardarlo (el presupuesto, 2026-10-16) entran al
 * final y escondidos, para que se puedan enseñar y ordenar como los demás.
 */
export function conTodosLosBloques(kit: MediaKit): MediaKit {
  const faltan = (Object.keys(BLOQUES_MEDIA_KIT) as BloqueMediaKit[]).filter((id) => !kit.bloques.some((b) => b.id === id))
  return faltan.length ? { ...kit, bloques: [...kit.bloques, ...faltan.map((id) => ({ id, visible: false }))] } : kit
}

/** Una línea del presupuesto: el formato, su precio de tarifa, el que se ofrece y, con descuento, el que queda. */
export type LineaPresupuestoKit = { formato: Formato; tarifa: number; precio: number; final: number }

const conDescuento = (precio: number, descuento = 0) => Math.round(precio * (1 - Math.min(Math.max(descuento, 0), 100) / 100) * 100) / 100

/**
 * Lo que enseña el bloque de presupuesto: cada tarifa con su precio (el cambiado o el de salida) que no se ha escondido y,
 * si lo hay, el pack; con descuento, el precio que queda de cada uno. Con «solo el pack», sin líneas sueltas.
 */
export function presupuestoDelKit(kit: MediaKit, perfil: Perfil) {
  const p = kit.presupuesto ?? {}
  const lineas: LineaPresupuestoKit[] =
    p.soloPack && p.pack
      ? []
      : perfil.tarifas
          .filter((t) => !kit.ocultos?.includes(`presupuesto.${t.formato}`))
          .map((t) => {
            const precio = p.precios?.[t.formato] ?? t.precio
            return { formato: t.formato, tarifa: t.precio, precio, final: conDescuento(precio, p.descuento) }
          })
  const pack = p.pack && p.pack.precio > 0 ? { nombre: p.pack.nombre.trim() || "Pack", precio: p.pack.precio, final: conDescuento(p.pack.precio, p.descuento) } : undefined
  return { lineas, pack, descuento: p.descuento && p.descuento > 0 ? p.descuento : undefined }
}

/** Los bloques visibles en su orden; sin tarifas ni presupuesto si la propuesta va sin precios. */
export function bloquesVisibles(kit: MediaKit, opciones?: { conPrecios?: boolean }) {
  return visibles(kit).filter((b) => !((b === "tarifas" || b === "presupuesto") && opciones?.conPrecios === false))
}

/** Los bloques repartidos en hojas, en orden y sin partir ninguno: si uno no cabe en lo que queda, pasa entero a la siguiente. */
export function hojasDelMediaKit(bloques: BloqueMediaKit[], ctx: ContextoHojas): BloqueMediaKit[][] {
  const hojas: BloqueMediaKit[][] = [[]]
  let ocupado = 0
  for (const b of bloques) {
    const alto = altoDelBloque(b, ctx)
    if (ocupado + alto > ALTO_HOJA && hojas[hojas.length - 1].length > 0) {
      hojas.push([])
      ocupado = 0
    }
    hojas[hojas.length - 1].push(b)
    ocupado += alto
  }
  return hojas
}

/** Las cifras de todas sus redes juntas. */
export function cifrasDelPerfil(perfil: Perfil) {
  const n = perfil.cuentas.length || 1
  return {
    seguidores: perfil.cuentas.reduce((a, c) => a + c.seguidores, 0),
    visualizaciones: perfil.cuentas.reduce((a, c) => a + c.visualizacionesMedias, 0),
    interaccion: Math.round((perfil.cuentas.reduce((a, c) => a + c.interaccion, 0) / n) * 10) / 10,
  }
}

/**
 * Lo que se puede esconder dentro de cada bloque (Xavier, 2026-10-14: «cada bloque ocultable y dentro de cada bloque,
 * info específica»): los datos fijos y, en redes, destacados, marcas y tarifas, cada elemento suyo.
 */
export function datosDelBloque(bloque: BloqueMediaKit, perfil: Perfil, kit: MediaKit, marcasTrabajadas: string[]): DatoBloque[] {
  switch (bloque) {
    case "portada":
      return [
        { clave: "portada.imagen", label: "Imagen de portada" },
        { clave: "portada.foto", label: "Foto de perfil" },
        { clave: "portada.usuario", label: "Usuario" },
        { clave: "portada.nicho", label: "Nicho" },
        { clave: "portada.ciudad", label: "Ciudad" },
        { clave: "portada.titular", label: "Titular" },
        { clave: "portada.bio", label: "Bio" },
      ]
    case "cifras":
      return [
        { clave: "cifras.seguidores", label: "Seguidores" },
        { clave: "cifras.visualizaciones", label: "Visualizaciones medias" },
        { clave: "cifras.interaccion", label: "Interacción media" },
        { clave: "cifras.espana", label: "Audiencia en España" },
      ]
    case "redes":
      return [
        ...perfil.cuentas.map((c) => ({ clave: `redes.${c.red}`, label: nombrePlataforma(c.red) })),
        { clave: "redes.visualizaciones", label: "Visualizaciones medias de cada red" },
        { clave: "redes.interaccion", label: "Interacción de cada red" },
      ]
    case "audiencia":
      return [
        { clave: "audiencia.mujeres", label: "Mujeres" },
        { clave: "audiencia.espana", label: "En España" },
        { clave: "audiencia.edades", label: "Edad principal" },
      ]
    case "destacados":
      return kit.destacados.slice(0, 3).map((d) => ({ clave: `destacados.${d.id}`, label: d.titulo }))
    case "marcas":
      return marcasTrabajadas.map((m) => ({ clave: `marcas.${m}`, label: m }))
    case "tarifas":
      return [...perfil.tarifas.map((t) => ({ clave: `tarifas.${t.formato}`, label: FORMATOS[t.formato].label })), { clave: "tarifas.nota", label: "Nota del IVA y los extras" }]
    case "presupuesto":
      return [...perfil.tarifas.map((t) => ({ clave: `presupuesto.${t.formato}`, label: FORMATOS[t.formato].label })), { clave: "presupuesto.nota", label: "Nota del IVA" }]
    case "contacto":
      return [
        { clave: "contacto.email", label: "Email" },
        { clave: "contacto.sello", label: "Sello de Astratic" },
      ]
  }
}
