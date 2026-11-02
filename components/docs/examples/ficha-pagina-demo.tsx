"use client"

import * as React from "react"
import { ArchiveIcon, ListPlusIcon, MailIcon, PlusIcon } from "lucide-react"
import { InlineField } from "@/components/app/inline-field"
import { SocialIcon } from "@/components/app/social-icons"
import { FichaBloque, FichaBloqueTitulo, FichaCelda, FichaCeldas, FichaColumnasBloques, FichaDato, FichaEtiqueta, FichaFila, FichaLinea } from "@/components/app/ficha-pagina/bloque"
import { FichaCabecera, FichaColumna, FichaColumnaDato, FichaColumnas, FichaMetrica, FichaMetricas, InsigniaFicha } from "@/components/app/ficha-pagina/cabecera"
import { eurosFicha } from "@/components/app/ficha-pagina/formato"
import { BotonFavorita, BotonFicha, BotonFichaIcono, BotonSemilla, FichaBarra, FichaContenido, FichaGrupo, FichaPagina, FichaRecorrido } from "@/components/app/ficha-pagina/marco"
import { BotonEstadoFicha } from "@/components/app/ficha-pagina/pagina-registro"
import { BarrasSerie, BarraReparto, CeldaPanel, CifraPanel, EscalaTarifa, FilaBarra, KeywordFicha, LeyendaTarifa, Marcador, NotaFicha, PasosFicha, PastillaEnlace, PastillaFicha, SegmentadoFicha } from "@/components/app/ficha-pagina/piezas"

const ETAPAS = [
  { id: "revisar", label: "Por revisar", punto: "bg-ficha-violeta" },
  { id: "revisada", label: "Revisada", punto: "bg-ficha-rosa" },
  { id: "contactada", label: "En outreach", punto: "bg-ficha-naranja" },
  { id: "dentro", label: "En la red", punto: "bg-ficha-ok" },
] as const

/** La página de un registro de ejemplo, con los datos inventados de una creadora. */
export function FichaPaginaDemo() {
  const [favorita, setFavorita] = React.useState(false)
  const [semilla, setSemilla] = React.useState(true)
  const [etapa, setEtapa] = React.useState<(typeof ETAPAS)[number]["id"]>("contactada")
  const [modo, setModo] = React.useState<"real" | "estimado">("real")
  const [ciudad, setCiudad] = React.useState<string | null>("Barcelona")
  return (
    <FichaPagina className="rounded-2xl">
      <FichaBarra className="static rounded-t-2xl" inicio={<FichaRecorrido posicion={12} total={148} vista="Moda BCN" etiqueta="influencer" onAnterior={() => undefined} onSiguiente={() => undefined} />}>
        <FichaGrupo>
          <BotonFavorita activa={favorita} onClick={() => setFavorita(!favorita)} />
          <BotonSemilla activa={semilla} onClick={() => setSemilla(!semilla)} />
        </FichaGrupo>
        <FichaGrupo>
          <BotonFicha>
            <ArchiveIcon strokeWidth={1.8} aria-hidden /> Archivar
          </BotonFicha>
          <BotonFicha>
            <ListPlusIcon strokeWidth={1.8} aria-hidden /> Añadir tarea
          </BotonFicha>
          <BotonFichaIcono aria-label="Más acciones">
            <PlusIcon strokeWidth={1.8} aria-hidden />
          </BotonFichaIcono>
        </FichaGrupo>
      </FichaBarra>
      <FichaContenido className="pb-7">
        <FichaCabecera
          nombre="Lucía Navarro"
          descripcion="Moda consciente, recetas sencillas y planes por Barcelona."
          sobrePortada={<BotonEstadoFicha titulo="Etapa" valor={etapa} onCambiar={setEtapa} opciones={ETAPAS.map((e) => ({ ...e }))} />}
          derecha={
            <>
              <span className="text-[15px] text-ficha-tinta-2">encaje</span>
              <Marcador valor={8.4} barras={26} />
              <span className="text-[15px] font-medium tabular-nums">8,4</span>
            </>
          }
        >
          <FichaColumnas>
            <FichaColumna
              icono={<SocialIcon network="instagram" />}
              titulo="@lucianavarro"
              insignia={<InsigniaFicha>Principal</InsigniaFicha>}
              href="https://example.com"
              cifra="86,4K"
              detalle="seguidores · Medio"
              pie={
                <>
                  <FichaColumnaDato etiqueta="Media de views" primero>
                    36,3K
                  </FichaColumnaDato>
                  <FichaColumnaDato etiqueta="Fee Reel">{eurosFicha(1100)}</FichaColumnaDato>
                </>
              }
            />
            <FichaColumna
              icono={<SocialIcon network="tiktok" />}
              titulo="@lucianavarro"
              cifra="41,2K"
              detalle="seguidores · Micro"
              pie={
                <>
                  <FichaColumnaDato etiqueta="Media de views" primero>
                    18,6K
                  </FichaColumnaDato>
                  <FichaColumnaDato etiqueta="Fee TikTok">{eurosFicha(600)}</FichaColumnaDato>
                </>
              }
            />
          </FichaColumnas>
          <FichaMetricas>
            <FichaMetrica etiqueta="Rendimiento">42 %</FichaMetrica>
            <FichaMetrica etiqueta="Interacción">3,8 %</FichaMetrica>
            <FichaMetrica etiqueta="Reels al mes">9</FichaMetrica>
            <FichaMetrica etiqueta="Ciudad">
              <InlineField value={ciudad} onSave={async (v) => setCiudad(v ? String(v) : null)} className="-mx-1 min-h-0 w-[calc(100%+0.5rem)] justify-center px-1 text-center text-[15px] font-medium [&>span]:flex-none [&_svg]:hidden" />
            </FichaMetrica>
          </FichaMetricas>
        </FichaCabecera>

        <FichaColumnasBloques>
          <FichaBloque className="flex-[1_1_320px]">
            <FichaBloqueTitulo compacto titulo="Segmentación" />
            <div className="px-[22px] pb-5">
              <BarraReparto
                tramos={[
                  { id: "moda", peso: 5, clase: "bg-ficha-tema-rose" },
                  { id: "cocina", peso: 3, clase: "bg-ficha-tema-peach-suave" },
                  { id: "viajes", peso: 2, clase: "bg-ficha-tema-mint-suave" },
                ]}
              />
              <div className="mt-3 flex flex-wrap gap-x-2.5 gap-y-1.5">
                <KeywordFicha className="text-ficha-tema-rose" onQuitar={() => undefined}>
                  outfit
                </KeywordFicha>
                <KeywordFicha className="text-ficha-tema-peach" onQuitar={() => undefined}>
                  receta
                </KeywordFicha>
                <KeywordFicha pendiente className="text-ficha-tema-mint" onQuitar={() => undefined}>
                  escapada
                </KeywordFicha>
              </div>
            </div>
          </FichaBloque>
          <FichaBloque className="flex flex-[1.4_1_440px] flex-col">
            <div className="flex flex-wrap items-start justify-between gap-3 px-[22px] pt-[18px] pb-3.5">
              <div className="text-[17px] font-medium tracking-[-0.01em]">Audiencia</div>
              <SegmentadoFicha
                label="Origen de las cifras"
                valor={modo}
                onCambiar={setModo}
                opciones={[
                  { id: "real", label: "Real" },
                  { id: "estimado", label: "Estimado" },
                ]}
              />
            </div>
            <FichaCeldas className="flex-1">
              <CeldaPanel titulo="Views" extra="Últimos 28 días">
                <CifraPanel cifra="1,30M" nota="de visualizaciones" />
                <BarrasSerie className="mt-3" estimado={modo === "estimado"} valores={[28, 31, 26, 35, 40, 33, 29, 38, 44, 52, 47, 36, 31, 30, 42, 58, 96, 71, 49, 40]} />
              </CeldaPanel>
              <CeldaPanel titulo="Países" extra="% de la audiencia">
                <div className="mt-3 flex flex-col gap-2.5">
                  <FilaBarra nombre="España" porcentaje={71} destacada />
                  <FilaBarra nombre="México" porcentaje={6} destacada />
                  <FilaBarra nombre="Otros" porcentaje={23} tenue />
                </div>
              </CeldaPanel>
            </FichaCeldas>
          </FichaBloque>
          <FichaBloque className="flex-[1_1_320px]">
            <FichaBloqueTitulo compacto titulo="Contacto" />
            <FichaFila etiqueta="Email">hola@example.com</FichaFila>
            <FichaFila etiqueta="Agencia">Sin agencia</FichaFila>
            <div className="flex gap-2 border-t border-ficha-raya px-[22px] pt-3 pb-3.5">
              <BotonFicha className="flex-1">
                <MailIcon strokeWidth={1.8} aria-hidden /> Escribir
              </BotonFicha>
            </div>
            <div className="border-t border-ficha-raya px-[22px] pt-2.5 pb-[18px]">
              <FichaEtiqueta className="text-[13px]">Enlaces de la bio</FichaEtiqueta>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <PastillaEnlace href="https://example.com">example.com/lucia</PastillaEnlace>
              </div>
            </div>
          </FichaBloque>
        </FichaColumnasBloques>

        <FichaBloque>
          <FichaBloqueTitulo titulo="Notas y seguimiento" />
          <FichaCeldas>
            <FichaCelda base={420}>
              <FichaEtiqueta className="mb-1.5">Notas</FichaEtiqueta>
              <NotaFicha inicial="A" quien="Astratic" cuando="30 oct">
                Prefiere que le escribamos por email.
              </NotaFicha>
            </FichaCelda>
            <FichaCelda base={420}>
              <div className="flex items-center justify-between gap-2">
                <FichaEtiqueta>Inscripción en outreach</FichaEtiqueta>
                <PastillaFicha punto="bg-ficha-ok">Activa</PastillaFicha>
              </div>
              <PasosFicha
                pasos={[
                  { id: "1", nombre: "Email 1", detalle: "22 oct", estado: "hecho" },
                  { id: "2", nombre: "Follow-up 1", detalle: "5 nov", estado: "ahora" },
                  { id: "3", nombre: "Follow-up 2", detalle: "12 nov", estado: "luego" },
                ]}
              />
            </FichaCelda>
          </FichaCeldas>
        </FichaBloque>

        <FichaBloque>
          <FichaBloqueTitulo titulo="Tarifas" />
          <FichaCeldas>
            <FichaCelda base={400} className="pb-3.5">
              <FichaEtiqueta className="mb-2">Fees</FichaEtiqueta>
              <FichaLinea className="flex justify-between">
                <span>Reel</span>
                <span className="font-medium tabular-nums">{eurosFicha(1100)}</span>
              </FichaLinea>
              <FichaLinea className="flex justify-between">
                <span>Story</span>
                <span className="font-medium tabular-nums">{eurosFicha(250)}</span>
              </FichaLinea>
            </FichaCelda>
            <FichaCelda base={400}>
              <FichaDato etiqueta="Tarifa de reel">
                <span className="text-[28px] font-medium tracking-[-0.02em] tabular-nums">{eurosFicha(950)}</span>
              </FichaDato>
              <EscalaTarifa
                desde={400}
                hasta={1400}
                tramo={{ desde: 650, hasta: 1000 }}
                formato={eurosFicha}
                marcas={[
                  { id: "pactada", valor: 950 },
                  { id: "pide", valor: 1100, relleno: true },
                ]}
              />
              <div className="mt-3.5 flex flex-wrap gap-x-[18px] gap-y-2 text-[13px] text-ficha-tinta-2">
                <LeyendaTarifa forma="tramo">Mercado: 650–1.000 €</LeyendaTarifa>
                <LeyendaTarifa forma="abierta">Pactada: 950 €</LeyendaTarifa>
                <LeyendaTarifa forma="llena">Pide: 1.100 €</LeyendaTarifa>
              </div>
            </FichaCelda>
          </FichaCeldas>
        </FichaBloque>
      </FichaContenido>
    </FichaPagina>
  )
}
