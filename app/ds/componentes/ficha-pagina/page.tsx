import { DocPage, DocSection, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { FichaPaginaDemo } from "@/components/docs/examples/ficha-pagina-demo"

export const metadata = { title: "Ficha de página" }

const ejemplo = `<PaginaRegistro
  clave="marca"                         // con la que la base guarda su lista
  id={m.id}
  ruta={(id) => \`/marcas/\${id}\`}
  volver="/marcas"                      // sin lista no hay flechas: sale «Volver»
  etiqueta="marca"
  acciones={<BotonFicha><MailIcon strokeWidth={1.8} /> Escribir</BotonFicha>}
>
  <FichaCabecera
    nombre={m.nombre}
    foto={m.logo}
    descripcion={m.sector}
    sobrePortada={<BotonEstadoFicha valor={m.fase} opciones={fases} onCambiar={cambiarFase} />}
  >
    <FichaColumnas>
      <FichaColumna icono={<SocialIcon network="instagram" />} titulo="@marca" cifra="1,2K" detalle="seguidores" pie={…} />
    </FichaColumnas>
    <FichaMetricas>
      <FichaMetrica etiqueta="Último contacto">Hace 2 días</FichaMetrica>
    </FichaMetricas>
  </FichaCabecera>

  <FichaColumnasBloques>
    <FichaBloque className="flex-[1_1_360px]">…</FichaBloque>
    <FichaBloque className="flex-[1.4_1_460px]">…</FichaBloque>
  </FichaColumnasBloques>

  <FichaBloque>
    <FichaBloqueTitulo titulo="Datos" />
    <FichaCeldas>
      <CeldasDeCampos campos={campos} fila={m} onGuardar={guardar} />
    </FichaCeldas>
  </FichaBloque>
</PaginaRegistro>`

export default function FichaPaginaPage() {
  return (
    <DocPage title="Ficha de página" lead="La página de un registro: cabecera con portada, una columna por red o dato principal, banda de cifras y bloques con rayas finas. Todo se edita donde se lee.">
      <DocSection id="ejemplo" title="Ejemplo">
        <Example code={ejemplo} lang="tsx">
          <FichaPaginaDemo />
        </Example>
      </DocSection>
      <DocSection id="cuando" title="Cuándo se usa">
        <Prose>
          <p>Todo registro con entidad propia abre su página: la celda de inicio de su base lleva allí y guarda antes la lista tal como se ve, de donde salen «12 de 148 en «Moda BCN»» y las flechas. El `DetailSheet` queda para lo que se mira un momento y no es un registro de verdad: una invitación, un aviso, una etiqueta.</p>
        </Prose>
      </DocSection>
      <DocSection id="piezas" title="Piezas">
        <SpecTable
          columns={["Pieza", "Para qué"]}
          rows={[
            ["PaginaRegistro", "El marco entero: fondo, barra fija con el recorrido o «Volver», acciones a la derecha y la columna de bloques."],
            ["BotonFicha, BotonFichaIcono", "Botones en relieve de 40 px. `tamano=\"sm\"` para los de dentro de un bloque."],
            ["BotonFavorita, BotonSemilla", "Conmutadores de la barra, con su tinte al encenderse."],
            ["BotonEstadoFicha", "La etapa encima de la portada, con su punto. Sin `onCambiar`, solo se lee."],
            ["MasFicha, MenuFichaOpcion", "El «…» y las opciones de los desplegables, con radio 20 y sombra amplia."],
            ["FichaCabecera", "Portada, foto sobre su borde, nombre, una línea y un dato a la derecha. `compacta` cuando comparte página con el trabajo."],
            ["FichaColumnas, FichaColumna", "Una columna por red o dato principal: su cuenta, su cifra grande y dos datos al pie."],
            ["FichaMetricas, FichaMetrica", "La banda gris de cifras al pie de la cabecera."],
            ["FichaBloque, FichaBloqueTitulo", "Un bloque: superficie clara, radio 28, sombra suave y sin borde."],
            ["FichaRenglon", "Una fila de una lista dentro de un bloque: foto o icono, nombre, una línea, pastillas y lo suyo a la derecha. Con href u onClick, la fila entera se pulsa."],
            ["CeldaEditable", "Una celda con su etiqueta y su InlineField, sin el aire de las fichas laterales."],
            ["EstadoFicha", "Un estado: la píldora con el punto de su tono, lo que StatusBadge en el resto del kit."],
            ["EntradaFicha, AreaFicha", "Donde se escribe lo nuevo de un bloque, sin caja. Con unidad, «€» o «%» al final."],
            ["BurbujasFicha, ResponderFicha", "Los mensajes de una conversación y la caja para contestar."],
            ["VacioBloque", "Lo que aún no tiene datos, debajo del título de un bloque: una línea, sin caja."],
            ["FichaCeldas, FichaCelda, FichaDato", "Filas de celdas separadas por rayas finas, que se recolocan solas según su `base`."],
            ["FichaFila", "«Etiqueta · valor» en un bloque estrecho, con 92 px para la etiqueta."],
            ["CeldasDeCampos, ValorDeCampo", "Las celdas de los campos de una base, editables con su tipo y sus opciones."],
            ["Marcador", "Las barras de encaje: enciende según la nota y reparte el color de violeta a verde."],
            ["SegmentadoFicha", "El conmutador en píldora: Real o Estimado."],
            ["CeldaPanel, CifraPanel, FilaBarra, BarrasSerie, MarcaEstimado", "Las celdas del panel de cifras. Lo estimado, rayado y con su marca a trazos."],
            ["PastillaFicha, PastillaEnlace, KeywordFicha", "Píldora de dato, enlace de la bio y keyword del color de su temática."],
            ["NotaFicha, PasosFicha, EscalaTarifa, VacioFicha", "Una nota con su inicial, los pasos de una secuencia, la escala de una tarifa y lo vacío."],
            ["FichaEsqueleto", "Lo que se ve mientras carga la página."],
          ]}
        />
      </DocSection>
      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            "Lo que el registro no tiene no se enseña ni se inventa: se quita la pieza o se deja su «—».",
            "Todo dato editable se edita donde se lee, con `InlineField`. No hay botón «Editar».",
            "Los colores salen de los tokens `ficha-*`; los de las temáticas, de `ficha-tema-*`, con su tinta y su tono suave.",
            "Las acciones del registro van en la barra; la etapa, encima de la portada.",
            "En móvil todo se apila solo: las columnas y las celdas van con `flex-wrap`.",
          ]}
        />
      </DocSection>
      <NextLinks
        links={[
          { href: "/ds/componentes/detail-sheet", label: "Sheet de detalle" },
          { href: "/ds/componentes/base-de-datos", label: "Base de datos" },
        ]}
      />
    </DocPage>
  )
}
