"use client"

import * as React from "react"
import { toast } from "sonner"
import { ArrowLeftIcon, ArrowRightIcon, FileSpreadsheetIcon, PlusIcon, TriangleAlertIcon } from "lucide-react"
import { TIPOS_CAMPO, type CampoPropio, type DefCampo, type ValorCampo } from "@/lib/base/campos"
import { CAMPO_NUEVO, MAXIMO_FILAS_IMPORTAR, camposImportables, camposNuevosDelMapeo, filasParaImportar, leerCsv, limpiarTabla, sugerirMapeo, type Tabla } from "@/lib/base/importar"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { CampoFormulario, Formulario, FormularioCabecera, FormularioCuerpo, FormularioDialog, FormularioPie } from "@/components/app/formulario/formulario-dialog"
import { SelectorBuscable } from "@/components/app/formulario/selector-buscable"
import { ICONO_TIPO } from "@/components/app/base/apariencia"
import { ZonaSubida } from "@/components/app/zona-subida"

const EXTENSIONES_EXCEL = /\.(xlsx|xlsm)$/i
const ACEPTA = ".csv,.tsv,.txt,.xlsx,.xlsm,text/csv,text/tab-separated-values,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
/** Las filas que se enseñan de ejemplo en cada columna. */
const EJEMPLOS = 2

/** Una celda de Excel en texto: las fechas como día, los números con su punto, el resto tal cual. */
function textoDeCelda(valor: unknown): string {
  if (valor === null || valor === undefined) return ""
  if (valor instanceof Date) return valor.toISOString().slice(0, 10)
  return String(valor)
}

/** El archivo como tabla: el Excel con su librería (se descarga solo al usarla), el resto como CSV. */
async function leerArchivo(archivo: File): Promise<Tabla> {
  if (EXTENSIONES_EXCEL.test(archivo.name)) {
    const { readSheet } = await import("read-excel-file/browser")
    const filas = await readSheet(archivo)
    return limpiarTabla(filas.map((fila) => fila.map(textoDeCelda)))
  }
  return leerCsv(await archivo.text())
}

/**
 * Importar registros a una base desde un CSV o un Excel (o lo copiado de una hoja de cálculo): el archivo, después qué
 * columna va a qué campo (sugerido por su nombre) con un ejemplo de cada una, y cuántos registros salen. Cada celda se
 * lee como al pegarla en la cuadrícula; lo que no se puede leer se queda vacío y se avisa. Crear los registros es cosa
 * de la página (`onImportar`). Con `crearCampos`, una columna que no va a ningún campo puede crear el suyo (con su
 * nombre y el tipo que mejor lee lo que lleva): la página recibe esos campos nuevos para darlos de alta antes.
 */
export function ImportarDialog<T>({
  open,
  onOpenChange,
  campos,
  objeto,
  onImportar,
  crearCampos,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  campos: DefCampo<T>[]
  objeto: { singular: string; plural: string }
  /** Crea un registro por fila con los valores de sus campos (por id), y antes los campos nuevos si los hay. */
  onImportar: (filas: Record<string, ValorCampo>[], nuevos: CampoPropio[]) => void
  /** Deja que una columna cree su propio campo. */
  crearCampos?: boolean
}) {
  const [tabla, setTabla] = React.useState<Tabla | null>(null)
  const [archivo, setArchivo] = React.useState("")
  const [conCabecera, setConCabecera] = React.useState(true)
  const [mapeo, setMapeo] = React.useState<(string | null)[]>([])
  const [pegado, setPegado] = React.useState("")
  const [leyendo, setLeyendo] = React.useState(false)
  const importables = React.useMemo(() => camposImportables(campos), [campos])

  const cerrar = (o: boolean) => {
    onOpenChange(o)
    if (!o) {
      setTabla(null)
      setArchivo("")
      setPegado("")
      setConCabecera(true)
    }
  }

  const empezar = (t: Tabla, nombre: string) => {
    if (t.length === 0) return toast.error("No hay datos que importar en lo que has subido")
    setTabla(t)
    setArchivo(nombre)
    setConCabecera(true)
    setMapeo(sugerirMapeo(t[0], importables))
  }
  const abrirArchivo = async (f: File | undefined) => {
    if (!f) return
    setLeyendo(true)
    try {
      empezar(await leerArchivo(f), f.name)
    } catch {
      toast.error("No se ha podido leer el archivo. Prueba a guardarlo como CSV o como Excel (.xlsx).")
    } finally {
      setLeyendo(false)
    }
  }

  const cabeceras = tabla ? (conCabecera ? tabla[0] : tabla[0].map((_, i) => `Columna ${i + 1}`)) : []
  const datos = tabla ? (conCabecera ? tabla.slice(1) : tabla) : []
  const conNuevos = tabla ? camposNuevosDelMapeo(tabla, mapeo, importables, conCabecera) : null
  const resultado = tabla && conNuevos ? filasParaImportar(tabla, conNuevos.mapeo, conNuevos.campos, conCabecera) : null
  const n = resultado?.filas.length ?? 0
  const recortado = datos.length > MAXIMO_FILAS_IMPORTAR

  const importar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!resultado || !conNuevos || !n) return
    onImportar(resultado.filas, conNuevos.nuevos)
    const creados = conNuevos.nuevos.length
    const avisos = [creados ? `${creados} ${creados === 1 ? "campo nuevo" : "campos nuevos"}.` : "", resultado.avisos.length ? `${resultado.avisos.length} celdas se han quedado vacías porque no se podían leer.` : ""].filter(Boolean).join(" ")
    toast.success(`Se ${n === 1 ? "ha" : "han"} importado ${n} ${n === 1 ? objeto.singular : objeto.plural}`, { description: avisos || undefined })
    cerrar(false)
  }

  const opciones = [{ value: "", label: "No importar" }, ...importables.map((c) => {
    const Icono = ICONO_TIPO[c.tipo]
    return { value: c.id, label: c.nombre, icono: <Icono className="size-3.5 text-muted-foreground" /> }
  })]

  return (
    <FormularioDialog open={open} onOpenChange={cerrar} ancho="lg">
      <FormularioCabecera
        icono={FileSpreadsheetIcon}
        titulo={`Importar ${objeto.plural}`}
        descripcion={tabla ? `${archivo} · ${datos.length} ${datos.length === 1 ? "fila" : "filas"}. Elige a qué campo va cada columna.` : "Sube un Excel o un CSV, o pega lo copiado de una hoja de cálculo."}
      />
      <Formulario onSubmit={importar}>
        <FormularioCuerpo>
          {!tabla ? (
            <>
              <ZonaSubida
                onArchivos={([archivo]) => void abrirArchivo(archivo)}
                accept={ACEPTA}
                multiple={false}
                desactivada={leyendo}
                titulo={leyendo ? "Leyendo…" : "Arrastra aquí el archivo o pulsa para elegirlo"}
                ayuda={`Excel (.xlsx) o CSV, con una fila por ${objeto.singular}. Hasta ${MAXIMO_FILAS_IMPORTAR.toLocaleString("es-ES")} filas.`}
                className="col-span-6 py-10"
              />
              <CampoFormulario etiqueta="O pégalo" htmlFor="imp-pegado" ayuda="Copia las celdas en Excel, Numbers o Google Sheets (con la fila de los nombres) y pégalas aquí.">
                <Textarea id="imp-pegado" rows={4} value={pegado} onChange={(e) => setPegado(e.target.value)} placeholder={"Nombre\tEmail\tTeléfono\nAna Ruiz\tana@marca.com\t600 000 000"} className="font-mono text-xs" />
                {pegado.trim() && (
                  <Button type="button" variant="outline" size="sm" className="mt-2 w-fit" onClick={() => empezar(leerCsv(pegado), "Lo pegado")}>
                    Usar lo pegado <ArrowRightIcon />
                  </Button>
                )}
              </CampoFormulario>
            </>
          ) : (
            <>
              <label className="col-span-6 flex items-center justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                La primera fila son los nombres de las columnas
                <Switch
                  checked={conCabecera}
                  onCheckedChange={(v) => {
                    setConCabecera(v)
                    if (!v) setMapeo(mapeo.map(() => null))
                    else if (tabla) setMapeo(sugerirMapeo(tabla[0], importables))
                  }}
                />
              </label>
              <div className="col-span-6 overflow-hidden rounded-lg border">
                <div className="grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-3 border-b bg-muted/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                  <span>Columna del archivo</span>
                  <span />
                  <span>Campo</span>
                </div>
                <ul className="max-h-[46vh] divide-y overflow-y-auto">
                  {cabeceras.map((cabecera, i) => {
                    const ejemplos = datos.map((f) => f[i]).filter(Boolean).slice(0, EJEMPLOS)
                    return (
                      <li key={i} className="grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1fr)] items-center gap-3 px-3 py-2">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{cabecera || `Columna ${i + 1}`}</span>
                          <span className="block truncate text-xs text-muted-foreground">{ejemplos.length ? ejemplos.join(" · ") : "Vacía"}</span>
                        </span>
                        <ArrowRightIcon className="size-4 text-muted-foreground" />
                        <span className="min-w-0">
                          <SelectorBuscable
                            tamano="sm"
                            aria-label={`Campo de la columna ${cabecera || i + 1}`}
                            opciones={[
                              ...opciones.filter((o) => !o.value || o.value === mapeo[i] || !mapeo.includes(o.value)),
                              ...(crearCampos ? [{ value: CAMPO_NUEVO, label: `Campo nuevo «${cabecera || `Columna ${i + 1}`}»`, icono: <PlusIcon className="size-3.5 text-muted-foreground" /> }] : []),
                            ]}
                            valor={mapeo[i] ?? ""}
                            onChange={(v) => setMapeo((m) => m.map((x, j) => (j === i ? v || null : x)))}
                            placeholder="No importar"
                          />
                          {mapeo[i] === CAMPO_NUEVO && conNuevos && (
                            <span className="mt-1 block truncate text-xs text-muted-foreground">
                              Se crea como {TIPOS_CAMPO[conNuevos.nuevos.find((c) => c.id === conNuevos.mapeo[i])?.tipo ?? "texto"].label.toLowerCase()}
                            </span>
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="col-span-6 flex flex-col gap-1.5 text-sm">
                <p>
                  Se {n === 1 ? "importará" : "importarán"} <span className="font-semibold tabular-nums">{n}</span> {n === 1 ? objeto.singular : objeto.plural}
                  {recortado && <span className="text-muted-foreground"> (las primeras {MAXIMO_FILAS_IMPORTAR.toLocaleString("es-ES")} filas)</span>}.
                  {!mapeo.some(Boolean) && <span className="text-muted-foreground"> Elige el campo de alguna columna.</span>}
                </p>
                {!!resultado?.avisos.length && (
                  <details className="rounded-lg bg-warning-soft px-3 py-2 text-xs">
                    <summary className="flex cursor-pointer items-center gap-1.5 font-medium text-warning">
                      <TriangleAlertIcon className="size-3.5" /> {resultado.avisos.length} {resultado.avisos.length === 1 ? "celda se queda vacía" : "celdas se quedan vacías"} porque no se pueden leer
                    </summary>
                    <ul className="mt-1.5 flex flex-col gap-0.5 text-muted-foreground">
                      {resultado.avisos.slice(0, 8).map((a, i) => (
                        <li key={i}>
                          Fila {a.fila}, {a.campo}: {a.error}
                        </li>
                      ))}
                      {resultado.avisos.length > 8 && <li>Y {resultado.avisos.length - 8} más.</li>}
                    </ul>
                  </details>
                )}
              </div>
            </>
          )}
        </FormularioCuerpo>
        <FormularioPie
          izquierda={
            tabla ? (
              <Button type="button" variant="ghost" onClick={() => setTabla(null)}>
                <ArrowLeftIcon /> Otro archivo
              </Button>
            ) : undefined
          }
        >
          <Button type="button" variant="outline" size="lg" onClick={() => cerrar(false)}>
            Cancelar
          </Button>
          <Button type="submit" size="lg" disabled={!n}>
            Importar {n || ""} {n === 1 ? objeto.singular : objeto.plural}
          </Button>
        </FormularioPie>
      </Formulario>
    </FormularioDialog>
  )
}
