// Datos de ejemplo de lo que acompaña a las collabs: contratos y sus plantillas, facturas, informes de
// resultados, formularios para la marca y plantillas de guion. Todo inventado: el repo es público
// (NIF, IBAN y razones sociales son de relleno).
import type { Clausula, Contrato, DatosFacturacion, DatosFiscales, Factura, FormularioMarca, Informe, PlantillaContrato, PlantillaGuion } from "@/lib/influencer/modelo"
import { historialFacturas } from "@/lib/influencer/demo-historial"

/** Sus datos fiscales: en el portal, los de Ajustes. */
export const demoDatosFiscales: DatosFiscales = {
  nombre: "Marta Albiol",
  nif: "00000000T",
  direccion: "Calle Ejemplo 3, 46002 Valencia",
  iban: "ES00 0000 0000 0000 0000 0000",
  forma: "autonoma",
  ivaPct: 21,
  irpfPct: 15,
}

/** A quién factura en las collabs de la red. */
export const demoAstratic: DatosFacturacion = {
  razonSocial: "Astratic Network S.L.",
  nif: "B00000000",
  direccion: "Barcelona",
  email: "facturas@example.com",
}

export const demoFacturas: Factura[] = [
  { id: "fa-vero-1", collabId: "vero", numero: "2026-017", destinatario: "marca", concepto: "Campaña «Colección otoño»: 1 reel + 1 TikTok (al aprobar el guion)", base: 825, ivaPct: 21, irpfPct: 15, emitidaEl: "2026-09-30", vencimiento: "2026-10-30", enviadaEl: "2026-09-30", plazoId: "vero-p1", pdf: { nombre: "Factura 2026-017.pdf", tamano: 84_000 } },
  { id: "fa-botanica-verano", collabId: "botanica-verano", numero: "2026-014", destinatario: "astratic", concepto: "Campaña «Sérum de verano»: 1 reel (80 % de la red)", base: 760, ivaPct: 21, irpfPct: 15, emitidaEl: "2026-08-31", vencimiento: "2026-09-30", enviadaEl: "2026-08-31", plazoId: "botanica-verano-p1", pdf: { nombre: "Factura 2026-014.pdf", tamano: 79_000 } },
  { id: "fa-lumea-verano", collabId: "lumea-verano", numero: "2026-009", destinatario: "marca", concepto: "Campaña «Protección solar facial»: 1 reel + 2 stories", base: 1150, ivaPct: 21, irpfPct: 15, emitidaEl: "2026-06-15", vencimiento: "2026-07-15", enviadaEl: "2026-06-15", cobradaEl: "2026-07-14", plazoId: "lumea-verano-p1", pdf: { nombre: "Factura 2026-009.pdf", tamano: 81_000 } },
  { id: "fa-vero-primavera", collabId: "vero-primavera", numero: "2026-006", destinatario: "marca", concepto: "Campaña «Colección primavera»: 1 reel", base: 1400, ivaPct: 21, irpfPct: 15, emitidaEl: "2026-04-14", vencimiento: "2026-05-14", enviadaEl: "2026-04-14", cobradaEl: "2026-05-12", plazoId: "vero-primavera-p1" },
  ...historialFacturas,
]

const v = (clave: string) => `<span data-variable="${clave}">{{${clave}}}</span>`

const CONTRATO_PUBLICACION = [
  `<h2>Contrato de colaboración publicitaria</h2>`,
  `<p>Fecha: ${v("hoy")}</p>`,
  `<h3>Reunidos</h3>`,
  `<p>De una parte, ${v("marca.razon_social")} («la Marca»), con NIF ${v("marca.nif")} y domicilio en ${v("marca.direccion")}, en cuyo nombre actúa ${v("marca.contacto")}.</p>`,
  `<p>De otra parte, ${v("influencer.nombre")} («la Creadora»), con NIF ${v("influencer.nif")} y domicilio en ${v("influencer.direccion")}, titular de la cuenta ${v("influencer.cuenta")}.</p>`,
  `<h3>1. Objeto</h3>`,
  `<p>La Creadora producirá y publicará para la campaña «${v("collab.campana")}» de ${v("marca.nombre")} estos contenidos: ${v("collab.entregables")}, entre el ${v("collab.desde")} y el ${v("collab.hasta")}.</p>`,
  `<h3>2. Revisión y aprobación</h3>`,
  `<p>La Marca revisará cada contenido por el enlace que le facilite la Creadora. Se incluyen ${v("brief.rondas")}; las rondas adicionales se presupuestarán aparte. Si la Marca no responde en 3 días hábiles, el contenido se entenderá aprobado.</p>`,
  `<h3>3. Publicidad</h3>`,
  `<p>Todos los contenidos irán identificados como publicidad («#publi» o «publicidad»), conforme al Código de Conducta sobre el uso de influencers en la publicidad.</p>`,
  `<h3>4. Derechos de uso</h3>`,
  `<p>La Creadora cede a la Marca el uso de los contenidos en sus canales: ${v("brief.derechos")}. Pasado ese plazo, cualquier uso requerirá un nuevo acuerdo.</p>`,
  `<h3>5. Exclusividad</h3>`,
  `<p>${v("brief.exclusividad")}: durante ese periodo la Creadora no publicará contenido patrocinado de marcas competidoras en esa categoría.</p>`,
  `<h3>6. Precio y pago</h3>`,
  `<p>La Marca abonará ${v("collab.importe")}. Pago: ${v("collab.pago")}, por transferencia y contra factura.</p>`,
  `<h3>7. Cancelación</h3>`,
  `<p>Si la Marca cancela la campaña después de aprobar el guion, abonará el 50 % del precio; si la cancela después de recibir el contenido, el 100 %.</p>`,
  `<h3>8. Confidencialidad y datos</h3>`,
  `<p>Las partes mantendrán la confidencialidad de estas condiciones y tratarán los datos personales conforme al RGPD.</p>`,
  `<p>Las partes aceptan este contrato electrónicamente, con registro de nombre, fecha y hora.</p>`,
].join("")

const CONTRATO_UGC = [
  `<h2>Contrato de creación de contenido (UGC)</h2>`,
  `<p>Fecha: ${v("hoy")}</p>`,
  `<p>Entre ${v("marca.razon_social")}, con NIF ${v("marca.nif")} («la Marca»), y ${v("influencer.nombre")}, con NIF ${v("influencer.nif")} («la Creadora»).</p>`,
  `<h3>1. Objeto</h3>`,
  `<p>La Creadora producirá para la campaña «${v("collab.campana")}» estos contenidos, que entregará en archivo y no publicará en sus cuentas: ${v("collab.entregables")}.</p>`,
  `<h3>2. Entrega y revisión</h3>`,
  `<p>Los archivos se entregarán por enlace antes del ${v("collab.hasta")}. Se incluyen ${v("brief.rondas")}.</p>`,
  `<h3>3. Cesión de derechos</h3>`,
  `<p>Una vez pagado el precio, la Creadora cede a la Marca el uso de los contenidos: ${v("brief.derechos")}.</p>`,
  `<h3>4. Precio y pago</h3>`,
  `<p>La Marca abonará ${v("collab.importe")}. Pago: ${v("collab.pago")}.</p>`,
].join("")

const CONTRATO_REGALO = [
  `<h2>Acuerdo de envío de producto</h2>`,
  `<p>Fecha: ${v("hoy")}</p>`,
  `<p>${v("marca.nombre")} envía producto a ${v("influencer.nombre")} (${v("influencer.cuenta")}) sin contraprestación económica para la campaña «${v("collab.campana")}».</p>`,
  `<h3>1. Sin obligación de publicar</h3>`,
  `<p>La Creadora decide si publica y cómo. Si publica, lo hará con su opinión sincera.</p>`,
  `<h3>2. Publicidad</h3>`,
  `<p>Si publica sobre el producto, lo marcará como publicidad, porque recibir un regalo también es una contraprestación según el Código de Conducta.</p>`,
].join("")

export const demoPlantillasContrato: PlantillaContrato[] = [
  { id: "pc-publicacion", nombre: "Colaboración con publicación", descripcion: "Reels, stories y posts en sus cuentas, con revisión, derechos y exclusividad", texto: CONTRATO_PUBLICACION, actualizadaEl: "2026-09-10T10:00:00" },
  { id: "pc-ugc", nombre: "Contenido UGC", descripcion: "Entrega de archivos sin publicar, con cesión de derechos", texto: CONTRATO_UGC, actualizadaEl: "2026-08-02T10:00:00" },
  { id: "pc-regalo", nombre: "Regalo de producto", descripcion: "Envío sin fee y sin obligación de publicar", texto: CONTRATO_REGALO, actualizadaEl: "2026-07-15T10:00:00" },
]

export const demoClausulas: Clausula[] = [
  { id: "cl-rondas", titulo: "Rondas de cambios", texto: `<p>Se incluyen ${v("brief.rondas")}. Cada ronda adicional se facturará aparte al 15 % del precio de la pieza.</p>` },
  { id: "cl-tacita", titulo: "Aprobación tácita", texto: `<p>Si la Marca no responde en 3 días hábiles desde el envío del contenido, se entenderá aprobado.</p>` },
  { id: "cl-derechos", titulo: "Derechos de uso y paid", texto: `<p>Cesión de uso: ${v("brief.derechos")}. El uso en anuncios pagados (paid o whitelisting) requiere acuerdo por escrito y se factura aparte.</p>` },
  { id: "cl-exclusividad", titulo: "Exclusividad", texto: `<p>${v("brief.exclusividad")}. Una exclusividad más larga o más amplia se negociará aparte.</p>` },
  { id: "cl-publicidad", titulo: "Publicidad marcada", texto: `<p>Todos los contenidos irán identificados como publicidad («#publi» o «publicidad»), también si se comparten en otra red.</p>` },
  { id: "cl-pago", titulo: "Pago y morosidad", texto: `<p>Pago: ${v("collab.pago")}. Los retrasos devengarán el interés de demora de la Ley 3/2004 de lucha contra la morosidad.</p>` },
  { id: "cl-cancelacion", titulo: "Cancelación", texto: `<p>Si la Marca cancela después de aprobar el guion, abonará el 50 % del precio; si cancela después de recibir el contenido, el 100 %.</p>` },
  { id: "cl-permanencia", titulo: "El contenido se queda en su perfil", texto: `<p>Acabada la campaña, la Creadora podrá mantener los contenidos publicados en su perfil.</p>` },
]

export const demoContratos: Contrato[] = [
  {
    id: "ct-lumea",
    collabId: "lumea",
    titulo: "Contrato de colaboración · Rutina de noche",
    texto: CONTRATO_PUBLICACION,
    plantillaId: "pc-publicacion",
    estado: "firmado",
    enlace: { token: "ct-lumea", caduca: "2026-10-22" },
    firmas: [
      { lado: "influencer", nombre: "Marta Albiol", el: "2026-09-22T16:40:00" },
      { lado: "marca", nombre: "Clara Benet", el: "2026-09-22T17:05:00" },
    ],
    actualizadoEl: "2026-09-22T16:30:00",
  },
  {
    id: "ct-vero",
    collabId: "vero",
    titulo: "Contrato de Maison Vero",
    texto: "",
    estado: "firmado",
    firmas: [
      { lado: "influencer", nombre: "Marta Albiol", el: "2026-09-17T10:00:00" },
      { lado: "marca", nombre: "Inés Roldán", el: "2026-09-16T18:20:00" },
    ],
    externo: { nombre: "Contrato Maison Vero · Colección otoño.pdf", tamano: 290_000 },
    actualizadoEl: "2026-09-17T10:00:00",
  },
  {
    id: "ct-mirra",
    collabId: "mirra",
    titulo: "Contrato de colaboración · Perfume de invierno",
    texto: CONTRATO_PUBLICACION,
    plantillaId: "pc-publicacion",
    estado: "borrador",
    firmas: [],
    actualizadoEl: "2026-10-04T10:20:00",
  },
]

export const demoInformes: Informe[] = [
  {
    collabId: "vero",
    resultados: [
      {
        id: "res-vero-tiktok",
        piezaId: "vero-tiktok",
        medidoEl: "2026-10-05T10:00:00",
        metricas: { visualizaciones: 52_300, alcance: 41_800, meGusta: 3_900, comentarios: 214, guardados: 860, compartidos: 312, clics: 640 },
        capturas: [
          { id: "cap-vero-1", nombre: "Estadísticas del TikTok.png", url: "/influencer/captura-estadisticas.svg" },
          { id: "cap-vero-2", nombre: "Audiencia del TikTok.png", url: "/influencer/captura-audiencia.svg" },
        ],
        nota: "Medido a los 3 días; vuelvo a medir el 9 de octubre.",
      },
    ],
    conclusiones: "",
  },
  {
    collabId: "botanica-verano",
    resultados: [
      { id: "res-botanica-verano", piezaId: "botanica-verano-reel", medidoEl: "2026-07-25T10:00:00", metricas: { visualizaciones: 38_200, alcance: 30_100, meGusta: 2_400, comentarios: 96, guardados: 610, compartidos: 140, clics: 420 }, capturas: [{ id: "cap-bv-1", nombre: "Estadísticas del reel.png", url: "/influencer/captura-estadisticas.svg" }] },
    ],
    conclusiones: "<p>El reel quedó por encima de mi media de verano: los guardados indican que la rutina se usó como referencia. Para la próxima, publicaría a primera hora de la tarde.</p>",
    enlace: { token: "inf-botanica-verano", caduca: "2026-08-25" },
    enviadoEl: "2026-07-26T10:00:00",
  },
  {
    collabId: "lumea-verano",
    resultados: [
      { id: "res-lv-reel", piezaId: "lumea-verano-reel", medidoEl: "2026-06-22T10:00:00", metricas: { visualizaciones: 46_900, alcance: 37_200, meGusta: 3_100, comentarios: 142, guardados: 990, compartidos: 260, clics: 510, ventas: 64 }, capturas: [] },
      { id: "res-lv-stories", piezaId: "lumea-verano-stories", medidoEl: "2026-06-20T10:00:00", metricas: { visualizaciones: 18_400, alcance: 16_900, clics: 380, ventas: 41 }, capturas: [] },
    ],
    conclusiones: "<p>El código se usó 105 veces en dos semanas. Las stories con el enlace llevaron más clics que el reel.</p>",
    enlace: { token: "inf-lumea-verano", caduca: "2026-07-22" },
    enviadoEl: "2026-06-23T09:30:00",
  },
]

export const demoFormularios: FormularioMarca[] = [
  { id: "fm-mirra", token: "fm-mirra", collabId: "mirra", alcance: "brief", para: { nombre: "Teo Valls", email: "teo@example.com" }, mensaje: "Hola Teo: aquí puedes contarme la campaña y las piezas que necesitáis. Así lo tengo todo en un sitio.", creadoEl: "2026-10-04T10:05:00", caduca: "2026-11-03" },
  { id: "fm-botanica-materiales", token: "fm-botanica-materiales", collabId: "botanica", alcance: "materiales", para: { nombre: "Pau Ribes", email: "pau@example.com" }, mensaje: "¿Me subes aquí el packshot nuevo y el logo en vectorial para el reel 2?", creadoEl: "2026-10-05T11:00:00", caduca: "2026-11-04" },
  { id: "fm-lumea", token: "fm-lumea", collabId: "lumea", alcance: "brief", para: { nombre: "Clara Benet", email: "clara@example.com" }, creadoEl: "2026-09-18T10:00:00", caduca: "2026-10-18", respondidoEl: "2026-09-18T12:30:00" },
]

const apartados = (lista: [string, string][]) => lista.map(([titulo, ayuda]) => `<h3>${titulo}</h3><p>${ayuda}</p>`).join("")

export const demoPlantillasGuion: PlantillaGuion[] = [
  {
    id: "pg-rutina",
    nombre: "Reel de rutina",
    descripcion: "Gancho, pasos, mensajes de la marca y llamada a la acción",
    texto: apartados([
      ["Gancho (0–3 s)", "La frase que para el scroll."],
      ["Desarrollo", "Los pasos, uno por plano."],
      ["Mensajes de la marca", "Lo que pide el brief, con sus palabras."],
      ["Llamada a la acción", "Qué tiene que hacer quien lo ve: código, enlace o guardar."],
      ["Texto en pantalla", "Los rótulos, en orden."],
      ["Copy del post", "El texto de la publicación con #publi, menciones y hashtags."],
      ["Notas de rodaje", "Luz, planos y lo que hay que enseñar sí o sí."],
    ]),
  },
  {
    id: "pg-unboxing",
    nombre: "Unboxing",
    descripcion: "Abrir el paquete, primera impresión y por qué lo probarías",
    texto: apartados([
      ["Gancho (0–3 s)", "«Me ha llegado esto y no esperaba…»"],
      ["Abro el paquete", "Qué trae y cómo viene presentado."],
      ["Primera impresión", "Textura, olor, tamaño: lo que se nota al momento."],
      ["Mensajes de la marca", "Lo que pide el brief."],
      ["Llamada a la acción", "Código, enlace o «os cuento en una semana»."],
      ["Copy del post", "Con #publi y la mención a la marca."],
    ]),
  },
  {
    id: "pg-antes-despues",
    nombre: "Antes y después",
    descripcion: "Mismo encuadre, mismo plano y el resultado al final",
    texto: apartados([
      ["Gancho (0–3 s)", "El después primero, para enganchar."],
      ["Antes", "Cómo estaba, con la misma luz y el mismo encuadre."],
      ["El proceso", "Qué he usado y cuánto tiempo."],
      ["Después", "El resultado, sin filtros."],
      ["Mensajes de la marca", "Solo los claims permitidos en el brief."],
      ["Copy del post", "Con #publi y la mención a la marca."],
    ]),
  },
  {
    id: "pg-stories",
    nombre: "Stories en 3 pasos",
    descripcion: "Presentación, uso y enlace, una story cada uno",
    texto: apartados([
      ["Story 1", "Presento el producto y por qué lo he elegido."],
      ["Story 2", "Cómo lo uso, con el sticker de enlace."],
      ["Story 3", "El resultado y el código en grande. #publi"],
    ]),
  },
  {
    id: "pg-tutorial",
    nombre: "Tutorial en 30 segundos",
    descripcion: "Un look o una técnica explicados rápido y paso a paso",
    texto: apartados([
      ["Gancho (0–3 s)", "El resultado final en un plano."],
      ["Paso 1", "…"],
      ["Paso 2", "…"],
      ["Paso 3", "…"],
      ["Llamada a la acción", "Todo en el enlace de la bio."],
      ["Copy del post", "Con #publi y la mención a la marca."],
    ]),
  },
]
