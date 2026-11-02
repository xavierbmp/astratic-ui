"use client"

import * as React from "react"
import type { DefCampo } from "@/lib/base/campos"
import { camposApilables, camposDeFecha, idBase, normalizarConfig, normalizarVista, vistaDesdeBase, vistaNueva, camposDeFormulario, type AjusteCampo, type CampoFormulario, type ConfigBase, type TipoVista, type VistaBase, type VistaDeSerie } from "@/lib/base/vistas"

/** Tiempo que se espera antes de guardar: ensanchar una columna no manda un guardado por píxel. */
const ESPERA_GUARDADO = 500

/**
 * Las vistas y el formulario de una base, de cada persona: se crean, se renombran, se duplican, se
 * ordenan y se borran, y cada cambio de la vista abierta (filtro, orden, grupos, campos, color,
 * altura) se aplica y se guarda al momento, como en Airtable. Dónde se guarda lo decide la página
 * (`guardar`): en la base de datos en el portal, en el navegador en la documentación.
 *
 * `campos` y `deSerie` tienen que ser estables (constantes o `useMemo`).
 */
export function useBase<T>({
  campos,
  deSerie,
  inicial,
  guardar,
}: {
  campos: DefCampo<T>[]
  deSerie: VistaDeSerie[]
  inicial?: ConfigBase | null
  guardar?: (config: ConfigBase) => void
}) {
  const [config, setConfig] = React.useState<ConfigBase>(() => normalizarConfig(inicial, campos, deSerie))
  const actual = React.useRef(config)
  const camposRef = React.useRef(campos)
  const deSerieRef = React.useRef(deSerie)
  const guardarRef = React.useRef(guardar)
  const temporizador = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendiente = React.useRef<ConfigBase | null>(null)

  React.useEffect(() => {
    camposRef.current = campos
    deSerieRef.current = deSerie
    guardarRef.current = guardar
  }, [campos, deSerie, guardar])

  const guardarYa = React.useCallback(() => {
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = null
    if (pendiente.current) guardarRef.current?.(pendiente.current)
    pendiente.current = null
  }, [])

  // Lo que quedaba por guardar sale al salir de la página.
  React.useEffect(() => guardarYa, [guardarYa])

  const actualizar = React.useCallback(
    (cambio: (c: ConfigBase) => ConfigBase) => {
      const siguiente = cambio(normalizarConfig(actual.current, camposRef.current, deSerieRef.current))
      actual.current = siguiente
      setConfig(siguiente)
      pendiente.current = siguiente
      if (temporizador.current) clearTimeout(temporizador.current)
      temporizador.current = setTimeout(guardarYa, ESPERA_GUARDADO)
    },
    [guardarYa],
  )

  const normal = React.useMemo(() => normalizarConfig(config, campos, deSerie), [config, campos, deSerie])
  const vista = normal.vistas.find((v) => v.id === normal.activa) ?? normal.vistas[0]

  /** Cambia la vista abierta. Con una función, a partir de cómo está ahora. */
  const cambiar = React.useCallback(
    (parcial: Partial<VistaBase> | ((v: VistaBase) => Partial<VistaBase>)) =>
      actualizar((c) => ({
        ...c,
        vistas: c.vistas.map((v) => (v.id === (c.activa ?? c.vistas[0]?.id) ? { ...v, ...(typeof parcial === "function" ? parcial(v) : parcial) } : v)),
      })),
    [actualizar],
  )

  const activar = React.useCallback((id: string) => actualizar((c) => ({ ...c, activa: id })), [actualizar])

  /**
   * Crea una vista y la abre. Devuelve su id. Sin tipo, o con el de la base, nace como la de base (la primera, la
   * plantilla de las demás): con sus filtros, sus campos y su orden. Con otro tipo, una vista nueva de ese tipo.
   */
  const crear = React.useCallback(
    (tipo?: TipoVista) => {
      const id = idBase("v")
      actualizar((c) => {
        const usados = new Set(c.vistas.map((v) => v.nombre))
        let n = c.vistas.length + 1
        while (usados.has(`Vista ${n}`)) n += 1
        const nombre = `Vista ${n}`
        const plantilla = c.vistas[0]
        const nueva = plantilla && (!tipo || tipo === (plantilla.tipo ?? "cuadricula")) ? vistaDesdeBase(plantilla, id, nombre) : vistaNueva(nombre, camposRef.current, { id, tipo: tipo ?? "cuadricula" })
        return { ...c, vistas: [...c.vistas, nueva], activa: id }
      })
      return id
    },
    [actualizar],
  )

  /** Cambia el tipo de la vista abierta (cuadrícula, kanban, galería o calendario) sin perder su filtro ni su orden. */
  const cambiarTipo = React.useCallback(
    (tipo: TipoVista) =>
      actualizar((c) => ({
        ...c,
        vistas: c.vistas.map((v) =>
          v.id === (c.activa ?? c.vistas[0]?.id)
            ? { ...v, tipo: tipo === "cuadricula" ? undefined : tipo, apilar: tipo === "kanban" ? (v.apilar ?? camposApilables(camposRef.current)[0]?.id) : v.apilar, fecha: tipo === "calendario" ? (v.fecha ?? camposDeFecha(camposRef.current)[0]?.id) : v.fecha }
            : v,
        ),
      })),
    [actualizar],
  )

  const duplicar = React.useCallback(
    (id: string) =>
      actualizar((c) => {
        const original = c.vistas.find((v) => v.id === id)
        if (!original) return c
        const copia = { ...original, id: idBase("v"), nombre: `${original.nombre} (copia)`, icono: original.icono }
        const i = c.vistas.indexOf(original)
        return { ...c, vistas: [...c.vistas.slice(0, i + 1), copia, ...c.vistas.slice(i + 1)], activa: copia.id }
      }),
    [actualizar],
  )

  const renombrar = React.useCallback(
    (id: string, nombre: string) => {
      const limpio = nombre.trim()
      if (limpio) actualizar((c) => ({ ...c, vistas: c.vistas.map((v) => (v.id === id ? { ...v, nombre: limpio } : v)) }))
    },
    [actualizar],
  )

  /** Cambia el nombre o el icono de una vista desde su pestaña o desde la barra. Un nombre vacío no se guarda. */
  const editar = React.useCallback(
    (id: string, cambio: { nombre?: string; icono?: string }) => {
      const nombre = cambio.nombre?.trim()
      if (cambio.nombre !== undefined && !nombre) return
      actualizar((c) => ({ ...c, vistas: c.vistas.map((v) => (v.id === id ? { ...v, ...(nombre ? { nombre } : {}), ...(cambio.icono ? { icono: cambio.icono } : {}) } : v)) }))
    },
    [actualizar],
  )

  /** Borra una vista. La de base, la primera, no se borra: es la plantilla de las demás. */
  const borrar = React.useCallback(
    (id: string) =>
      actualizar((c) => {
        if (c.vistas.length <= 1 || c.vistas[0]?.id === id) return c
        const vistas = c.vistas.filter((v) => v.id !== id)
        return { ...c, vistas, activa: c.activa === id ? vistas[0]?.id : c.activa }
      }),
    [actualizar],
  )

  /** Vuelve a poner una vista borrada (el «Deshacer» del aviso). */
  const restaurar = React.useCallback(
    (vista: VistaBase, posicion: number) =>
      actualizar((c) => ({ ...c, vistas: [...c.vistas.slice(0, posicion), normalizarVista(vista, camposRef.current), ...c.vistas.slice(posicion)], activa: vista.id })),
    [actualizar],
  )

  /** Ordena las vistas. La de base sigue la primera: es la plantilla y la pestaña que no se mueve. */
  const reordenar = React.useCallback(
    (ids: string[]) =>
      actualizar((c) => {
        const porId = new Map(c.vistas.map((v) => [v.id, v]))
        const baseId = c.vistas[0]?.id
        return { ...c, vistas: [baseId, ...ids.filter((id) => id !== baseId)].map((id) => (id ? porId.get(id) : undefined)).filter((v): v is VistaBase => v !== undefined) }
      }),
    [actualizar],
  )

  const formulario = React.useMemo(() => camposDeFormulario(normal.formulario, campos), [normal.formulario, campos])
  /** Si la persona ya eligió qué campos salen en el formulario de alta (si no, la página puede poner los suyos). */
  const formularioConfigurado = Boolean(normal.formulario?.length)
  const cambiarFormulario = React.useCallback((lista: CampoFormulario[]) => actualizar((c) => ({ ...c, formulario: lista })), [actualizar])

  const ajustes = React.useMemo(() => normal.ajustes ?? {}, [normal.ajustes])
  /** El orden y los colores propios de las opciones de un campo de serie; sin ajuste, vuelve a los de serie. */
  const ajustarCampo = React.useCallback(
    (id: string, ajuste: AjusteCampo | undefined) =>
      actualizar((c) => {
        const resto = Object.fromEntries(Object.entries(c.ajustes ?? {}).filter(([clave]) => clave !== id))
        const siguientes = ajuste ? { ...resto, [id]: ajuste } : resto
        return { ...c, ajustes: Object.keys(siguientes).length ? siguientes : undefined }
      }),
    [actualizar],
  )

  return { vistas: normal.vistas, vista, activar, cambiar, cambiarTipo, crear, duplicar, renombrar, editar, borrar, restaurar, reordenar, formulario, formularioConfigurado, cambiarFormulario, ajustes, ajustarCampo }
}

export type BaseApi<T> = ReturnType<typeof useBase<T>>
