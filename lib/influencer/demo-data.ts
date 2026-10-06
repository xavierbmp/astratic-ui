// Datos de ejemplo del workspace de una influencer: una creadora inventada de beauty en el tramo
// 50K–100K, con marcas y campañas inventadas. Las fotos son de Unsplash (uso libre). Nada de aquí
// es real: el repo es público. Las fechas viven alrededor del 6 de octubre de 2026 (`HOY`).
import type {
  Actividad,
  Auditoria,
  Aviso,
  CambioTarifa,
  Contacto,
  Enlace,
  EtiquetaTarea,
  Interaccion,
  Marca,
  MediaKit,
  Perfil,
  Plantilla,
  PlantillaTarea,
  Propuesta,
  Tarea,
} from "@/lib/influencer/modelo"

const UNSPLASH = "https://images.unsplash.com"
const foto = (id: string, w = 800) => `${UNSPLASH}/photo-${id}?w=${w}&q=80&fit=crop`

/** El «hoy» de los datos de ejemplo: la demo se mira desde este día para que las fechas cuadren. */
export const HOY = "2026-10-06T11:30:00"

export const demoPerfil: Perfil = {
  nombre: "Marta Albiol",
  nombrePila: "Marta",
  handle: "@martaalbiol.beauty",
  fotoUrl: foto("1531746020798-e6953c6e8e04", 400),
  nicho: "Skincare y maquillaje",
  tramo: "50K–100K",
  ciudad: "Valencia",
  bio: "Rutinas de skincare reales y maquillaje para el día a día. Pruebo todo antes de recomendarlo.",
  cuentas: [
    { red: "instagram", handle: "@martaalbiol.beauty", url: "https://instagram.com", seguidores: 68_400, visualizacionesMedias: 24_100, interaccion: 4.8, actualizadaEl: "2026-09-15" },
    { red: "tiktok", handle: "@martaalbiol", url: "https://tiktok.com", seguidores: 41_200, visualizacionesMedias: 38_300, interaccion: 6.1, actualizadaEl: "2026-09-15" },
    { red: "youtube", handle: "Marta Albiol", url: "https://youtube.com", seguidores: 8_900, visualizacionesMedias: 6_200, interaccion: 3.2, actualizadaEl: "2026-09-15" },
  ],
  audiencia: { espana: 78, mujeres: 86, edades: "25–34 años (46 %)" },
  tarifas: [
    { formato: "reel", precio: 690, minimo: 550 },
    { formato: "story", precio: 130, minimo: 100 },
    { formato: "post", precio: 420, minimo: 340 },
    { formato: "tiktok", precio: 590, minimo: 470 },
    { formato: "youtube", precio: 950, minimo: 760 },
    { formato: "ugc", precio: 260, minimo: 200 },
  ],
  email: "hola@example.com",
}

/** Sus auditorías de Astratic, de la más nueva a la más vieja. Cifras y recomendaciones inventadas. */
export const demoAuditorias: Auditoria[] = [
  {
    id: "au-2026-09",
    fecha: "2026-09-15",
    tramo: "50K–100K",
    cpm: 22,
    resumen: "Perfil sólido en skincare, con una comunidad muy de aquí y que comenta. Los reels de rutina tiran por encima de lo que toca a tu tamaño; los posts fijos se han quedado atrás y YouTube crece despacio.",
    cifras: [
      { red: "instagram", seguidores: 68_400, visualizacionesMedias: 24_100, interaccion: 4.8 },
      { red: "tiktok", seguidores: 41_200, visualizacionesMedias: 38_300, interaccion: 6.1 },
      { red: "youtube", seguidores: 8_900, visualizacionesMedias: 6_200, interaccion: 3.2 },
    ],
    audiencia: { espana: 78, mujeres: 86, edades: "25–34 años (46 %)" },
    fuertes: [
      "El 78 % de tu audiencia está en España, que es lo que buscan las marcas de aquí.",
      "Los reels de rutina pasan de 24.000 visualizaciones de media sin promocionar.",
      "En TikTok has crecido un 22 % desde junio con el formato de reseña rápida.",
      "Las marcas de skincare repiten contigo: tres de cada cuatro han vuelto.",
    ],
    mejoras: [
      { id: "m1", area: "perfil", texto: "Di en la primera línea de la bio a qué te dedicas y añade el email de contacto.", hechaEl: "2026-09-18" },
      { id: "m2", area: "perfil", texto: "Deja tres historias destacadas: Rutinas, Colaboraciones y Reseñas." },
      { id: "m3", area: "contenido", texto: "Abre los reels con el resultado: los tres primeros segundos deciden si se quedan." },
      { id: "m4", area: "contenido", texto: "Más luz en los vídeos de maquillaje: las texturas se ven planas.", hechaEl: "2026-09-25" },
      { id: "m5", area: "frecuencia", texto: "Vuelve a tres reels por semana; en agosto bajaste a uno." },
      { id: "m6", area: "audiencia", texto: "Contesta los comentarios en la primera hora después de publicar." },
      { id: "m7", area: "marcas", texto: "Pide siempre el brief por escrito antes de dar precio." },
    ],
  },
  {
    id: "au-2026-06",
    fecha: "2026-06-10",
    tramo: "50K–100K",
    cpm: 20,
    resumen: "Entrada en la red. Buena base en Instagram y un TikTok que empieza a despegar. Hay que ordenar el perfil para que una marca entienda en dos segundos qué haces.",
    cifras: [
      { red: "instagram", seguidores: 61_200, visualizacionesMedias: 19_800, interaccion: 4.5 },
      { red: "tiktok", seguidores: 33_800, visualizacionesMedias: 29_500, interaccion: 5.7 },
      { red: "youtube", seguidores: 7_600, visualizacionesMedias: 5_100, interaccion: 3 },
    ],
    audiencia: { espana: 76, mujeres: 85, edades: "25–34 años (44 %)" },
    fuertes: ["Comunidad fiel y muy femenina en el nicho de skincare.", "TikTok con margen para crecer."],
    mejoras: [
      { id: "m0a", area: "perfil", texto: "Cambia la foto de perfil por una con la cara de cerca y luz natural.", hechaEl: "2026-06-14" },
      { id: "m0b", area: "marcas", texto: "Prepara un media kit con tus cifras y las marcas con las que has trabajado.", hechaEl: "2026-06-20" },
      { id: "m0c", area: "contenido", texto: "Prueba un formato fijo semanal en TikTok (reseña en 30 segundos).", hechaEl: "2026-07-02" },
    ],
  },
]

/** Los cambios de tarifa que ha propuesto a Astratic. */
export const demoCambiosTarifa: CambioTarifa[] = [
  { id: "ct-tiktok", formato: "tiktok", precio: 650, minimo: 520, antes: { precio: 590, minimo: 470 }, motivo: "Mis TikToks han pasado de 29.500 a 38.300 visualizaciones de media desde junio.", estado: "pendiente", propuestoEl: "2026-10-02" },
  { id: "ct-reel", formato: "reel", precio: 690, minimo: 550, antes: { precio: 620, minimo: 500 }, motivo: "Subida tras la auditoría de junio.", estado: "aceptado", propuestoEl: "2026-06-20", resueltoEl: "2026-06-23", respuesta: "Aceptado: va en línea con tu CPM de referencia." },
]

export const demoMarcas: Marca[] = [
  { id: "lumea", nombre: "Lumea Skin", sector: "Skincare", web: "https://example.com", instagram: "lumea.skin", tint: "rose", atribucion: "propia", atribucionHasta: "2027-03-12", notas: "Contestan rápido. Piden el guion siempre antes de grabar.", creadaEl: "2026-03-12T10:00:00" },
  { id: "botanica", nombre: "Botánica Lab", sector: "Skincare natural", web: "https://example.com", tint: "mint", atribucion: "red", notas: "Pagan tarde: la factura de verano lleva una semana vencida.", creadaEl: "2026-05-20T10:00:00" },
  { id: "vero", nombre: "Maison Vero", sector: "Maquillaje", web: "https://example.com", instagram: "maisonvero", tint: "peach", atribucion: "propia", atribucionHasta: "2027-01-20", notas: "Muy detallistas con el producto en plano: dos rondas casi siempre.", creadaEl: "2026-01-20T10:00:00" },
  { id: "glow", nombre: "Glow Studio", sector: "Protección solar", tint: "lavender", atribucion: "red", creadaEl: "2026-08-30T10:00:00" },
  { id: "nuura", nombre: "Nuura", sector: "Cuidado del cabello", tint: "sky", atribucion: "red", notas: "La lleva Astratic: hablo con ellos a través de la red.", creadaEl: "2026-10-06T09:40:00" },
  { id: "kalma", nombre: "Kalma Cosmetics", sector: "Maquillaje limpio", web: "https://example.com", instagram: "kalma.cosmetics", tint: "lime", atribucion: "propia", atribucionHasta: "2027-09-30", creadaEl: "2026-09-30T12:00:00" },
  { id: "aura", nombre: "Aura Hair", sector: "Cuidado del cabello", web: "https://example.com", tint: "sky", atribucion: "propia", atribucionHasta: "2027-09-25", creadaEl: "2026-09-25T10:00:00" },
  { id: "petalo", nombre: "Pétalo", sector: "Perfumería", instagram: "petalo.perfumes", tint: "rose", atribucion: "propia", atribucionHasta: "2027-10-05", creadaEl: "2026-10-05T20:30:00" },
  { id: "soleil", nombre: "Soleil Paris", sector: "Protección solar", tint: "peach", atribucion: "red", creadaEl: "2026-09-22T09:00:00" },
  { id: "dermanova", nombre: "Derma Nova", sector: "Dermocosmética", web: "https://example.com", tint: "lavender", atribucion: "propia", atribucionHasta: "2027-08-14", notas: "Quieren derechos ilimitados por poco dinero.", creadaEl: "2026-08-14T09:00:00" },
  { id: "bloom", nombre: "Bloom Beauty", sector: "Maquillaje", instagram: "bloom.beauty", tint: "mint", atribucion: "propia", atribucionHasta: "2027-07-02", creadaEl: "2026-07-02T09:00:00" },
  { id: "brote", nombre: "Aceites Brote", sector: "Aceites faciales", web: "https://example.com", instagram: "aceites.brote", tint: "lime", atribucion: "propia", atribucionHasta: "2027-10-02", notas: "Les escribí yo: uso su aceite de rosa mosqueta desde hace un año.", creadaEl: "2026-10-02T18:00:00" },
  { id: "nimbo", nombre: "Nimbo Color", sector: "Maquillaje", instagram: "nimbo.color", tint: "lavender", atribucion: "propia", atribucionHasta: "2027-09-15", notas: "Marca que me gustaría trabajar. Sin contacto todavía.", creadaEl: "2026-09-15T09:00:00" },
  { id: "mirra", nombre: "Atelier Mirra", sector: "Perfumería nicho", web: "https://example.com", tint: "peach", atribucion: "propia", atribucionHasta: "2027-09-10", creadaEl: "2026-09-10T09:00:00" },
  { id: "brisa", nombre: "Brisa Nails", sector: "Uñas", instagram: "brisa.nails", tint: "sky", atribucion: "propia", atribucionHasta: "2027-08-25", creadaEl: "2026-08-25T09:00:00" },
]

export const demoContactos: Contacto[] = [
  { id: "c-clara", marcaId: "lumea", nombre: "Clara Benet", cargo: "Marketing manager", email: "clara@example.com", telefono: "+34 600 000 101", principal: true, creadoEl: "2026-03-12T10:00:00" },
  { id: "c-jordi", marcaId: "lumea", nombre: "Jordi Pons", cargo: "Relaciones públicas", email: "jordi@example.com", creadoEl: "2026-04-02T10:00:00" },
  { id: "c-pau", marcaId: "botanica", nombre: "Pau Ribes", cargo: "Brand manager", email: "pau@example.com", principal: true, notas: "Hablar con él para lo de la factura vencida.", creadoEl: "2026-05-20T10:00:00" },
  { id: "c-ines", marcaId: "vero", nombre: "Inés Roldán", cargo: "Influencer marketing", email: "ines@example.com", instagram: "ines.roldan", principal: true, creadoEl: "2026-01-20T10:00:00" },
  { id: "c-nora", marcaId: "vero", nombre: "Nora Gil", cargo: "Producto", email: "nora@example.com", creadoEl: "2026-02-11T10:00:00" },
  { id: "c-marc", marcaId: "glow", nombre: "Marc Soler", cargo: "Marketing", email: "marc@example.com", principal: true, creadoEl: "2026-08-30T10:00:00" },
  { id: "c-laia", marcaId: "kalma", nombre: "Laia Font", cargo: "Fundadora", email: "laia@example.com", telefono: "+34 600 000 102", principal: true, notas: "Prefiere WhatsApp para lo rápido.", creadoEl: "2026-09-30T12:00:00" },
  { id: "c-diego", marcaId: "aura", nombre: "Diego Mas", cargo: "Marketing digital", email: "diego@example.com", principal: true, creadoEl: "2026-09-25T10:00:00" },
  { id: "c-sara", marcaId: "petalo", nombre: "Sara Vidal", cargo: "Comunicación", instagram: "sara.petalo", principal: true, creadoEl: "2026-10-05T20:30:00" },
  { id: "c-rocio", marcaId: "dermanova", nombre: "Rocío Peña", cargo: "Trade marketing", email: "rocio@example.com", principal: true, creadoEl: "2026-08-14T09:00:00" },
  { id: "c-alex", marcaId: "bloom", nombre: "Álex Ferrer", cargo: "Social media", email: "alex@example.com", principal: true, creadoEl: "2026-07-02T09:00:00" },
  { id: "c-lucia", marcaId: "brote", nombre: "Lucía Marín", cargo: "Fundadora", instagram: "lucia.brote", principal: true, creadoEl: "2026-10-02T18:00:00" },
  { id: "c-teo", marcaId: "mirra", nombre: "Teo Valls", cargo: "Brand manager", email: "teo@example.com", principal: true, creadoEl: "2026-09-10T09:00:00" },
  { id: "c-vera", marcaId: "brisa", nombre: "Vera Costa", cargo: "Influencer manager", email: "vera@example.com", principal: true, creadoEl: "2026-08-25T09:00:00" },
]

export const demoPropuestas: Propuesta[] = [
  {
    id: "p-nuura",
    marcaId: "nuura",
    campana: "Lanzamiento del champú sólido",
    estado: "nueva",
    origen: "red",
    piezas: [{ formato: "reel", cantidad: 1 }, { formato: "story", cantidad: 3 }],
    ofrecen: 1100,
    desde: "2026-10-20",
    hasta: "2026-10-31",
    ultimoContacto: "2026-10-06T09:40:00",
    siguientePaso: "Decir a Astratic si entro",
    siguienteFecha: "2026-10-09",
    notas: "Oportunidad de la red: la vende Astratic y cobro el 80 %. Producto en casa antes del 15.",
    creadaEl: "2026-10-06T09:40:00",
  },
  {
    id: "p-kalma",
    marcaId: "kalma",
    contactoId: "c-laia",
    campana: "Base de maquillaje Pure",
    estado: "hablando",
    origen: "marca",
    piezas: [{ formato: "reel", cantidad: 2 }],
    desde: "2026-11-10",
    hasta: "2026-12-10",
    ultimoContacto: "2026-10-04T17:10:00",
    siguientePaso: "Mandar tarifas y media kit",
    siguienteFecha: "2026-10-07",
    notas: "Quieren publicar antes de Navidad. Preguntar si habrá paid.",
    creadaEl: "2026-09-30T12:00:00",
  },
  {
    id: "p-petalo",
    marcaId: "petalo",
    contactoId: "c-sara",
    campana: "Colonia de otoño",
    estado: "nueva",
    origen: "mediakit",
    piezas: [{ formato: "story", cantidad: 1 }],
    ofrecen: 0,
    ultimoContacto: "2026-10-05T20:30:00",
    siguientePaso: "Responder: regalo sin fee solo con mención libre",
    siguienteFecha: "2026-10-08",
    creadaEl: "2026-10-05T20:30:00",
  },
  {
    id: "p-aura",
    marcaId: "aura",
    contactoId: "c-diego",
    campana: "Rutina anticaída",
    estado: "enviada",
    origen: "marca",
    piezas: [{ formato: "reel", cantidad: 1 }, { formato: "tiktok", cantidad: 1 }],
    presupuesto: {
      lineas: [{ formato: "reel", cantidad: 1, precio: 690 }, { formato: "tiktok", cantidad: 1, precio: 590 }],
      extras: ["derechos"],
      conPrecios: true,
      rondas: 2,
      validez: 15,
      pago: "30 días tras publicar",
      generadoEl: "2026-10-01T11:00:00",
    },
    desde: "2026-10-26",
    hasta: "2026-11-15",
    ultimoContacto: "2026-10-01T11:20:00",
    siguientePaso: "Seguimiento si no contestan",
    siguienteFecha: "2026-10-08",
    creadaEl: "2026-09-25T10:00:00",
  },
  {
    id: "p-soleil",
    marcaId: "soleil",
    campana: "SPF de ciudad",
    estado: "negociando",
    origen: "red",
    piezas: [{ formato: "reel", cantidad: 2 }],
    ofrecen: 900,
    presupuesto: {
      lineas: [{ formato: "reel", cantidad: 2, precio: 690 }],
      extras: [],
      conPrecios: false,
      rondas: 2,
      validez: 15,
      pago: "Factura Astratic",
      generadoEl: "2026-09-29T16:00:00",
    },
    desde: "2026-11-02",
    hasta: "2026-11-20",
    ultimoContacto: "2026-10-03T13:00:00",
    siguientePaso: "Contraoferta: 1.150 €",
    siguienteFecha: "2026-10-07",
    notas: "Ofrecen 900 € por dos reels: por debajo de mi mínimo (1.100 €).",
    creadaEl: "2026-09-22T09:00:00",
  },
  {
    id: "p-lumea",
    marcaId: "lumea",
    contactoId: "c-clara",
    campana: "Rutina de noche",
    estado: "ganada",
    origen: "marca",
    piezas: [{ formato: "reel", cantidad: 1 }, { formato: "story", cantidad: 3 }],
    presupuesto: {
      lineas: [{ formato: "reel", cantidad: 1, precio: 690 }, { formato: "story", cantidad: 3, precio: 130 }],
      extras: ["derechos"],
      conPrecios: true,
      rondas: 2,
      validez: 15,
      pago: "30 días tras publicar",
      generadoEl: "2026-09-12T10:00:00",
    },
    desde: "2026-10-01",
    hasta: "2026-10-20",
    ultimoContacto: "2026-09-18T12:00:00",
    collabId: "lumea",
    creadaEl: "2026-09-10T09:00:00",
  },
  {
    id: "p-dermanova",
    marcaId: "dermanova",
    contactoId: "c-rocio",
    campana: "Sérum reparador",
    estado: "perdida",
    origen: "marca",
    piezas: [{ formato: "reel", cantidad: 1 }],
    ofrecen: 400,
    ultimoContacto: "2026-09-14T10:00:00",
    motivoPerdida: "precio",
    notas: "Ofrecían 400 € por un reel con derechos ilimitados.",
    creadaEl: "2026-09-08T09:00:00",
  },
  {
    id: "p-bloom",
    marcaId: "bloom",
    contactoId: "c-alex",
    campana: "Labiales de otoño",
    estado: "perdida",
    origen: "marca",
    piezas: [{ formato: "post", cantidad: 1 }, { formato: "story", cantidad: 2 }],
    ultimoContacto: "2026-08-28T15:00:00",
    motivoPerdida: "sin-respuesta",
    creadaEl: "2026-08-20T09:00:00",
  },
]

/** Sus etiquetas, para trabajar por tandas: un día graba, otro edita, otro hace papeles. */
export const demoEtiquetasTarea: EtiquetaTarea[] = [
  { id: "e-grabar", nombre: "Grabar", tint: "rose" },
  { id: "e-editar", nombre: "Editar", tint: "lavender" },
  { id: "e-escribir", nombre: "Escribir", tint: "sky" },
  { id: "e-responder", nombre: "Responder", tint: "mint" },
  { id: "e-gestiones", nombre: "Gestiones", tint: "peach" },
]

type DatosTarea = Omit<Tarea, "orden" | "actividad" | "etiquetas" | "prioridad" | "estado" | "origen" | "creadaEl"> &
  Partial<Pick<Tarea, "etiquetas" | "prioridad" | "estado" | "origen" | "creadaEl" | "actividad">>

/** Las de ejemplo con lo repetido por defecto: por hacer, prioridad normal, a mano. */
const tarea = (t: DatosTarea, orden: number): Tarea => ({
  estado: "por-hacer",
  prioridad: "normal",
  origen: "manual",
  etiquetas: [],
  actividad: [],
  creadaEl: "2026-09-28T10:00:00",
  ...t,
  orden,
})

const datosTareas: DatosTarea[] = [
  // Campañas
  { id: "t1", titulo: "Subir la V2 del reel", estado: "en-curso", prioridad: "urgente", donde: { pagina: "campanas", tipo: "contenidos", collabId: "vero", piezaId: "vero-reel" }, fecha: "2026-10-05", fechaLimite: "2026-10-07", etiquetas: ["e-editar"], origen: "auto", notas: "<p>Ronda 1 de 2: dos notas de Inés en la V1.</p>" },
  { id: "t2", titulo: "Enviar el guion del reel 1 a la marca", prioridad: "alta", donde: { pagina: "campanas", tipo: "contenidos", collabId: "botanica", piezaId: "botanica-reel-1" }, fecha: "2026-10-06", fechaLimite: "2026-10-12", etiquetas: ["e-escribir"], origen: "auto" },
  { id: "t3", titulo: "Grabar el reel de la rutina de noche", prioridad: "urgente", donde: { pagina: "campanas", tipo: "contenidos", collabId: "lumea", piezaId: "lumea-reel" }, fecha: "2026-10-06T10:00", fechaLimite: "2026-10-08", etiquetas: ["e-grabar"], notas: "<p>Luz de la ventana, de 10 a 12. El sérum siempre con la etiqueta a cámara.</p>" },
  { id: "t3a", titulo: "Preparar el baño y la luz", estado: "hecha", hechaEl: "2026-10-06T09:40:00", padreId: "t3", donde: { pagina: "campanas", tipo: "contenidos", collabId: "lumea", piezaId: "lumea-reel" } },
  { id: "t3b", titulo: "Tener el sérum y la crema a mano", padreId: "t3", donde: { pagina: "campanas", tipo: "contenidos", collabId: "lumea", piezaId: "lumea-reel" } },
  { id: "t3c", titulo: "Grabar tres tomas del gancho", padreId: "t3", donde: { pagina: "campanas", tipo: "contenidos", collabId: "lumea", piezaId: "lumea-reel" } },
  { id: "t4", titulo: "Recoger el paquete en Correos", estado: "hecha", hechaEl: "2026-10-06T10:00:00", donde: { pagina: "campanas", tipo: "materiales", collabId: "lumea" }, fecha: "2026-10-06", etiquetas: ["e-gestiones"] },
  { id: "t5", titulo: "Reclamar la factura 2026-014 a Astratic", estado: "esperando", esperandoDesde: "2026-10-03", prioridad: "alta", donde: { pagina: "campanas", tipo: "cobros", collabId: "botanica-verano" }, fechaLimite: "2026-10-08", etiquetas: ["e-gestiones"], notas: "<p>Les escribí el viernes. Botánica Lab paga tarde.</p>" },
  { id: "t6", titulo: "Entregar la V1 del reel", prioridad: "alta", donde: { pagina: "campanas", tipo: "contenidos", collabId: "lumea", piezaId: "lumea-reel" }, fecha: "2026-10-08", fechaLimite: "2026-10-10", etiquetas: ["e-editar"], origen: "auto" },
  { id: "t7", titulo: "Grabar las 3 stories", donde: { pagina: "campanas", tipo: "contenidos", collabId: "lumea", piezaId: "lumea-stories" }, fecha: "2026-10-09", fechaLimite: "2026-10-11", etiquetas: ["e-grabar"] },
  { id: "t8", titulo: "Publicar el reel del SPF", prioridad: "alta", donde: { pagina: "campanas", tipo: "contenidos", collabId: "glow", piezaId: "glow-reel" }, fecha: "2026-10-12T19:00", fechaLimite: "2026-10-12", origen: "auto", notas: "<p>Entre las 18 y las 20 h, con el enlace de la bio actualizado.</p>" },
  { id: "t9", titulo: "Publicar el reel del look de otoño", donde: { pagina: "campanas", tipo: "contenidos", collabId: "vero", piezaId: "vero-reel" }, fecha: "2026-10-15", fechaLimite: "2026-10-15", origen: "auto" },
  { id: "t10", titulo: "Enviar los resultados del TikTok a Maison Vero", donde: { pagina: "campanas", tipo: "resultados", collabId: "vero" }, fechaLimite: "2026-10-09", etiquetas: ["e-escribir"], origen: "auto" },
  { id: "t11", titulo: "Publicar las 3 stories", donde: { pagina: "campanas", tipo: "contenidos", collabId: "lumea", piezaId: "lumea-stories" }, fecha: "2026-10-18", origen: "auto" },
  { id: "t12", titulo: "Enviar el guion del reel 2", donde: { pagina: "campanas", tipo: "contenidos", collabId: "botanica", piezaId: "botanica-reel-2" }, fecha: "2026-10-26", origen: "auto" },
  { id: "t13", titulo: "Firmar el contrato de Atelier Mirra", estado: "esperando", esperandoDesde: "2026-10-02", prioridad: "alta", donde: { pagina: "campanas", tipo: "contrato", collabId: "mirra" }, fechaLimite: "2026-10-09", etiquetas: ["e-gestiones"], notas: "<p>Les mandé mis cambios a la cláusula de exclusividad el viernes.</p>" },
  { id: "t14", titulo: "Facturar el primer plazo de Lumea", prioridad: "alta", donde: { pagina: "campanas", tipo: "cobros", collabId: "lumea" }, fecha: "2026-10-07", etiquetas: ["e-gestiones"], origen: "plantilla" },
  { id: "t14a", titulo: "Hacer la factura con los datos de Facturación", padreId: "t14", donde: { pagina: "campanas", tipo: "cobros", collabId: "lumea" } },
  { id: "t14b", titulo: "Subir el PDF", padreId: "t14", donde: { pagina: "campanas", tipo: "cobros", collabId: "lumea" } },
  { id: "t14c", titulo: "Enviarla a Clara", padreId: "t14", donde: { pagina: "campanas", tipo: "cobros", collabId: "lumea" } },
  { id: "t15", titulo: "Revisar el brief de Atelier Mirra", estado: "en-curso", donde: { pagina: "campanas", tipo: "general", collabId: "mirra" }, fecha: "2026-10-06", etiquetas: ["e-escribir"] },
  { id: "t16", titulo: "Pedir a Glow el código de descuento", estado: "esperando", esperandoDesde: "2026-10-05", donde: { pagina: "campanas", tipo: "materiales", collabId: "glow" }, fechaLimite: "2026-10-10", etiquetas: ["e-responder"] },
  { id: "t17", titulo: "Subir las capturas de estadísticas del TikTok", estado: "hecha", hechaEl: "2026-10-04T18:00:00", donde: { pagina: "campanas", tipo: "resultados", collabId: "vero" }, fecha: "2026-10-04" },
  { id: "t18", titulo: "Sesión de fotos del perfume", prioridad: "alta", donde: { pagina: "campanas", tipo: "contenidos", collabId: "mirra" }, fecha: "2026-10-13", fechaFin: "2026-10-14", etiquetas: ["e-grabar"] },
  { id: "t19", titulo: "Ir a la presentación de Glow en Madrid", estado: "cancelada", donde: { pagina: "campanas", tipo: "general", collabId: "glow" }, fecha: "2026-10-09T19:30" },
  // CRM
  { id: "t20", titulo: "Decir a Astratic si entro en la campaña de Nuura", prioridad: "urgente", donde: { pagina: "crm", tipo: "propuesta", registroId: "p-nuura" }, fechaLimite: "2026-10-09", etiquetas: ["e-responder"] },
  { id: "t21", titulo: "Mandar tarifas y media kit a Kalma", prioridad: "alta", donde: { pagina: "crm", tipo: "propuesta", registroId: "p-kalma" }, fecha: "2026-10-06", fechaLimite: "2026-10-07", etiquetas: ["e-responder"] },
  { id: "t22", titulo: "Contraoferta a Soleil: 1.150 €", estado: "esperando", esperandoDesde: "2026-10-01", donde: { pagina: "crm", tipo: "propuesta", registroId: "p-soleil" }, fechaLimite: "2026-10-07", etiquetas: ["e-responder"] },
  { id: "t23", titulo: "Seguimiento de la propuesta de Aura Hair", donde: { pagina: "crm", tipo: "propuesta", registroId: "p-aura" }, fecha: "2026-10-08", etiquetas: ["e-responder"] },
  { id: "t24", titulo: "Escribir a Aceites Brote si no contestan al DM", prioridad: "baja", donde: { pagina: "crm", tipo: "marca", registroId: "brote" }, fecha: "2026-10-05", etiquetas: ["e-responder"] },
  { id: "t25", titulo: "Buscar el email de quien lleva colaboraciones en Nimbo", prioridad: "baja", donde: { pagina: "crm", tipo: "marca", registroId: "nimbo" }, etiquetas: ["e-gestiones"] },
  { id: "t26", titulo: "Actualizar el media kit con las cifras del mes", donde: { pagina: "crm", tipo: "media-kit" }, fecha: "2026-10-10", repetir: { frecuencia: "mensual" }, etiquetas: ["e-escribir"] },
  { id: "t27", titulo: "Llamar a Laia para cerrar fechas", donde: { pagina: "crm", tipo: "contacto", registroId: "c-laia" }, fecha: "2026-10-07T12:30", etiquetas: ["e-responder"] },
  { id: "t28", titulo: "Plantilla para responder a los regalos sin fee", prioridad: "baja", donde: { pagina: "crm", tipo: "plantillas" }, etiquetas: ["e-escribir"] },
  // Personal
  { id: "t29", titulo: "Renovar el dominio de la web", donde: { pagina: "personal", tipo: "administracion" }, fechaLimite: "2026-10-20", etiquetas: ["e-gestiones"] },
  { id: "t30", titulo: "Pedir el certificado de Autocontrol", estado: "hecha", hechaEl: "2026-10-02T12:00:00", donde: { pagina: "personal", tipo: "astratic" }, fecha: "2026-10-02" },
  { id: "t31", titulo: "Pasar las facturas del trimestre a la gestoría", prioridad: "alta", donde: { pagina: "personal", tipo: "administracion" }, fechaLimite: "2026-10-15", repetir: { frecuencia: "trimestral" }, etiquetas: ["e-gestiones"], notas: "<p>IVA e IRPF del tercer trimestre: el plazo acaba el 20 de octubre.</p>" },
  { id: "t32", titulo: "Responder comentarios y mensajes", donde: { pagina: "personal", tipo: "personal" }, fecha: "2026-10-06T21:00", repetir: { frecuencia: "laborables" }, etiquetas: ["e-responder"] },
  { id: "t33", titulo: "Leer el capítulo de negociación de la Biblia", prioridad: "baja", donde: { pagina: "personal", tipo: "astratic" }, fecha: "2026-10-08" },
  { id: "t34", titulo: "Dentista", donde: { pagina: "personal", tipo: "personal" }, fecha: "2026-10-07T17:00" },
]

export const demoTareas: Tarea[] = datosTareas.map((t, i) => tarea(t, i + 1))

/** Tareas a medida para no escribir siempre lo mismo. */
export const demoPlantillasTarea: PlantillaTarea[] = [
  { id: "pt-factura", nombre: "Factura de campaña", titulo: "Hacer y enviar la factura", pagina: "campanas", tipo: "cobros", prioridad: "alta", etiquetas: ["e-gestiones"], subtareas: ["Hacer la factura con los datos de Facturación", "Subir el PDF", "Enviarla a la marca"] },
  { id: "pt-publicar", nombre: "Publicar una pieza", titulo: "Publicar", pagina: "campanas", tipo: "contenidos", prioridad: "alta", etiquetas: [], subtareas: ["Copiar el copy aprobado", "Comprobar #publi, mención y enlace", "Pegar el enlace de la publicación en la pieza"] },
  { id: "pt-propuesta", nombre: "Preparar propuesta", titulo: "Preparar la propuesta", pagina: "crm", tipo: "propuesta", prioridad: "normal", etiquetas: ["e-escribir"], subtareas: ["Leer bien lo que piden", "Calcular el presupuesto con mis tarifas", "Mandarla con el media kit"] },
  { id: "pt-gestoria", nombre: "Trimestre para la gestoría", titulo: "Pasar las facturas del trimestre a la gestoría", pagina: "personal", tipo: "administracion", prioridad: "alta", etiquetas: ["e-gestiones"], notas: "<p>IVA e IRPF: el plazo acaba el 20 de abril, julio y octubre y el 30 de enero.</p>", subtareas: ["Descargar las facturas emitidas", "Juntar los gastos con su ticket", "Enviarlo todo a la gestoría"] },
]

export const demoAvisoDestacado: Aviso = {
  id: "n0",
  tipo: "oportunidad",
  titulo: "Nueva oportunidad de la red: Nuura",
  descripcion: "1 reel + 3 stories · 1.100 € (880 € para ti) · del 20 al 31 de octubre",
  el: "2026-10-06T09:40:00",
  leido: false,
  href: "/workspace/crm?registro=p-nuura",
}

export const demoAvisos: Aviso[] = [
  { id: "n1", tipo: "cambios", titulo: "Maison Vero ha pedido cambios en el reel", descripcion: "2 notas en la V1", el: "2026-10-06T10:15:00", leido: false, href: "/workspace/collabs/vero/contenidos/vero-reel" },
  { id: "n2", tipo: "aprobado", titulo: "Lumea Skin ha aprobado el guion", el: "2026-10-05T18:20:00", leido: false, href: "/workspace/collabs/lumea/contenidos/lumea-reel" },
  { id: "n3", tipo: "cobro", titulo: "Cobro vencido: Botánica Lab", descripcion: "Factura 2026-014 · 760 € para ti", el: "2026-10-03T09:00:00", leido: true, href: "/workspace/collabs/botanica-verano" },
  { id: "n4", tipo: "astratic", titulo: "Tu auditoría de octubre está lista", el: "2026-10-01T12:00:00", leido: true, href: "/workspace/perfil" },
]

export const demoEnlaces: Enlace[] = [
  { id: "l1", etiqueta: "Linktree", url: "https://linktr.ee" },
  { id: "l2", etiqueta: "Drive · Collabs", url: "https://drive.google.com" },
  { id: "l3", etiqueta: "Canva · Plantillas", url: "https://www.canva.com" },
  { id: "l4", etiqueta: "CapCut", url: "https://www.capcut.com" },
  { id: "l5", etiqueta: "Notion · Ideas", url: "https://www.notion.so" },
  { id: "l6", etiqueta: "Metricool", url: "https://metricool.com" },
  { id: "l7", etiqueta: "Gestoría", url: "https://www.holded.com" },
  { id: "l8", etiqueta: "Google Calendar", url: "https://calendar.google.com" },
]

export const demoActividad: Actividad[] = [
  { id: "a1", quien: "Inés Roldán", que: "pidió cambios en la V1 del reel (2 notas)", el: "2026-10-06T10:15:00", collabId: "vero" },
  { id: "a2", quien: "Clara Benet", que: "aprobó el guion del reel", el: "2026-10-05T18:20:00", collabId: "lumea" },
  { id: "a3", quien: "Marta", que: "subió la V1 del reel y la envió a revisión", el: "2026-10-02T17:40:00", collabId: "vero" },
  { id: "a4", quien: "Marta", que: "publicó el TikTok del tutorial", el: "2026-10-02T19:00:00", collabId: "vero" },
  { id: "a5", quien: "Marta", que: "envió el guion del reel a revisión", el: "2026-10-03T19:05:00", collabId: "lumea" },
  { id: "a6", quien: "Astratic", que: "confirmó la collab y mandó el brief", el: "2026-09-28T10:30:00", collabId: "botanica" },
  { id: "a7", quien: "Marc Soler", que: "aprobó la V2 del reel", el: "2026-10-04T12:10:00", collabId: "glow" },
  { id: "a8", quien: "Astratic", que: "te propuso la campaña de Nuura", el: "2026-10-06T09:40:00", propuestaId: "p-nuura" },
  { id: "a9", quien: "Marta", que: "envió el presupuesto y el media kit", el: "2026-10-01T11:20:00", propuestaId: "p-aura" },
  { id: "a10", quien: "Laia Font", que: "pidió tarifas por email", el: "2026-10-04T17:10:00", propuestaId: "p-kalma" },
  { id: "a11", quien: "Astratic", que: "trasladó la oferta de Soleil: 900 € por dos reels", el: "2026-10-03T13:00:00", propuestaId: "p-soleil" },
  { id: "a12", quien: "Marta", que: "anotó la propuesta", el: "2026-10-05T20:30:00", propuestaId: "p-petalo" },
]

/** El seguimiento de cada marca: lo que ella apunta y lo que entra por email o por Astratic. */
export const demoInteracciones: Interaccion[] = [
  { id: "i1", tipo: "email", sentido: "recibido", el: "2026-10-06T09:40:00", nota: "Astratic me propone la campaña del champú sólido: 1 reel y 3 stories.", marcaId: "nuura", propuestaId: "p-nuura" },
  { id: "i2", tipo: "dm", sentido: "enviado", el: "2026-09-30T12:00:00", nota: "Primer mensaje por Instagram: les cuento que uso su base.", marcaId: "kalma", contactoId: "c-laia", propuestaId: "p-kalma" },
  { id: "i3", tipo: "email", sentido: "recibido", el: "2026-10-04T17:10:00", nota: "Piden tarifas para dos reels antes de Navidad.", marcaId: "kalma", contactoId: "c-laia", propuestaId: "p-kalma" },
  { id: "i4", tipo: "dm", sentido: "recibido", el: "2026-10-05T20:30:00", nota: "Llegan por el formulario del media kit: una story a cambio de producto.", marcaId: "petalo", contactoId: "c-sara", propuestaId: "p-petalo" },
  { id: "i5", tipo: "email", sentido: "recibido", el: "2026-09-25T10:00:00", nota: "Piden reel y TikTok para la rutina anticaída.", marcaId: "aura", contactoId: "c-diego", propuestaId: "p-aura" },
  { id: "i6", tipo: "email", sentido: "enviado", el: "2026-10-01T11:20:00", nota: "Envío el presupuesto (1.536 €) con el media kit.", marcaId: "aura", contactoId: "c-diego", propuestaId: "p-aura" },
  { id: "i7", tipo: "email", sentido: "enviado", el: "2026-09-29T16:00:00", nota: "Mando el presupuesto a Astratic, media kit sin precios.", marcaId: "soleil", propuestaId: "p-soleil" },
  { id: "i8", tipo: "email", sentido: "recibido", el: "2026-10-03T13:00:00", nota: "Astratic traslada la oferta: 900 € por dos reels.", marcaId: "soleil", propuestaId: "p-soleil" },
  { id: "i9", tipo: "email", sentido: "recibido", el: "2026-09-12T10:00:00", nota: "Aceptan el presupuesto.", marcaId: "lumea", contactoId: "c-clara", propuestaId: "p-lumea" },
  { id: "i10", tipo: "llamada", sentido: "enviado", el: "2026-09-18T12:00:00", nota: "Cerramos fechas: publicar entre el 1 y el 20 de octubre.", marcaId: "lumea", contactoId: "c-clara", propuestaId: "p-lumea" },
  { id: "i11", tipo: "email", sentido: "recibido", el: "2026-09-14T10:00:00", nota: "Ofrecen 400 € por un reel con derechos ilimitados.", marcaId: "dermanova", contactoId: "c-rocio", propuestaId: "p-dermanova" },
  { id: "i12", tipo: "email", sentido: "enviado", el: "2026-09-14T16:00:00", nota: "Les digo que no con esas condiciones.", marcaId: "dermanova", contactoId: "c-rocio", propuestaId: "p-dermanova" },
  { id: "i13", tipo: "email", sentido: "enviado", el: "2026-08-21T10:00:00", nota: "Envío tarifas y media kit.", marcaId: "bloom", contactoId: "c-alex", propuestaId: "p-bloom" },
  { id: "i14", tipo: "email", sentido: "enviado", el: "2026-08-28T15:00:00", nota: "Segundo seguimiento, sin respuesta.", marcaId: "bloom", contactoId: "c-alex", propuestaId: "p-bloom" },
  { id: "i15", tipo: "dm", sentido: "enviado", el: "2026-10-02T18:00:00", nota: "Primer mensaje: uso su aceite de rosa mosqueta, ¿hablamos?", marcaId: "brote", contactoId: "c-lucia" },
  { id: "i16", tipo: "email", sentido: "enviado", el: "2026-09-10T09:30:00", nota: "Primer contacto con media kit.", marcaId: "mirra", contactoId: "c-teo" },
  { id: "i17", tipo: "reunion", sentido: "enviado", el: "2026-09-03T11:00:00", nota: "Videollamada con Inés: presentan la colección de otoño.", marcaId: "vero", contactoId: "c-ines" },
]

export const demoPlantillas: Plantilla[] = [
  {
    id: "pl-primer-email",
    nombre: "Primer contacto a una marca",
    uso: "primer-contacto",
    canal: "email",
    asunto: "Colaboración con {{yo.nombre}} · {{marca.nombre}}",
    cuerpo: `Hola {{contacto.nombre}},

Soy {{yo.nombre}} ({{yo.handle}}), creadora de {{yo.nicho}} en {{yo.ciudad}}. Llevo tiempo usando {{marca.nombre}} y creo que encajaría muy bien con mi comunidad: {{yo.seguidores}} seguidores, sobre todo mujeres de 25 a 34 años en España.

Te dejo mi media kit con mis números y las marcas con las que he trabajado: {{mediakit.enlace}}

¿Te apetece que hablemos de alguna campaña?

Un abrazo,
{{yo.nombrePila}}`,
    favorita: true,
    usos: 14,
    ultimoUso: "2026-09-10T09:30:00",
    creadaEl: "2026-03-01T10:00:00",
    actualizadaEl: "2026-09-02T10:00:00",
  },
  {
    id: "pl-primer-dm",
    nombre: "Primer contacto por Instagram",
    uso: "primer-contacto",
    canal: "dm",
    cuerpo: `¡Hola! Soy {{yo.nombrePila}}, de {{yo.handle}} Uso {{marca.nombre}} desde hace meses y me encantaría hacer algo juntas. ¿Me pasáis el email de quien lleva colaboraciones? Os mando mi media kit.`,
    favorita: false,
    usos: 9,
    ultimoUso: "2026-10-02T18:00:00",
    creadaEl: "2026-03-01T10:00:00",
    actualizadaEl: "2026-06-12T10:00:00",
  },
  {
    id: "pl-tarifas",
    nombre: "Mandar tarifas y media kit",
    uso: "tarifas",
    canal: "email",
    asunto: "Tarifas y media kit · {{yo.nombre}}",
    cuerpo: `Hola {{contacto.nombre}},

¡Gracias por escribirme! Te paso mi media kit con mis números, la audiencia y las tarifas de salida: {{mediakit.enlace}}

Los packs, los derechos de uso y la exclusividad se presupuestan aparte según la campaña. Si me cuentas qué tenéis en mente para {{marca.nombre}} (formatos y fechas), te preparo una propuesta a medida.

Un abrazo,
{{yo.nombrePila}}`,
    favorita: true,
    usos: 11,
    ultimoUso: "2026-08-21T10:00:00",
    creadaEl: "2026-03-01T10:00:00",
    actualizadaEl: "2026-07-01T10:00:00",
  },
  {
    id: "pl-propuesta",
    nombre: "Enviar propuesta",
    uso: "propuesta",
    canal: "email",
    asunto: "Propuesta para {{propuesta.campana}} · {{yo.nombre}}",
    cuerpo: `Hola {{contacto.nombre}},

Como hablamos, te mando la propuesta para {{propuesta.campana}}: {{propuesta.piezas}} por {{propuesta.total}} (IVA aparte).

La tienes aquí, con el media kit y las condiciones: {{propuesta.enlace}}

El presupuesto vale {{propuesta.validez}}. Si os encaja, te mando el calendario de entregas en cuanto cerremos las fechas.

Un abrazo,
{{yo.nombrePila}}`,
    favorita: true,
    usos: 8,
    ultimoUso: "2026-10-01T11:20:00",
    creadaEl: "2026-03-01T10:00:00",
    actualizadaEl: "2026-09-20T10:00:00",
  },
  {
    id: "pl-propuesta-wa",
    nombre: "Propuesta por WhatsApp",
    uso: "propuesta",
    canal: "whatsapp",
    cuerpo: `¡Hola {{contacto.nombre}}! Te paso la propuesta para {{propuesta.campana}}: {{propuesta.piezas}} por {{propuesta.total}} + IVA. Aquí la tienes con el media kit: {{propuesta.enlace}}`,
    favorita: false,
    usos: 3,
    ultimoUso: "2026-07-15T10:00:00",
    creadaEl: "2026-05-01T10:00:00",
    actualizadaEl: "2026-05-01T10:00:00",
  },
  {
    id: "pl-seguimiento",
    nombre: "Seguimiento a los cinco días",
    uso: "seguimiento",
    canal: "email",
    asunto: "Re: Propuesta para {{propuesta.campana}}",
    cuerpo: `Hola {{contacto.nombre}},

Te escribo por si se perdió entre los emails: ¿habéis podido mirar la propuesta para {{propuesta.campana}}? Te la dejo otra vez aquí: {{propuesta.enlace}}

Si necesitáis ajustar formatos o fechas, lo vemos sin problema.

Un abrazo,
{{yo.nombrePila}}`,
    favorita: false,
    usos: 6,
    ultimoUso: "2026-08-28T15:00:00",
    creadaEl: "2026-03-01T10:00:00",
    actualizadaEl: "2026-03-01T10:00:00",
  },
  {
    id: "pl-contraoferta",
    nombre: "Contraoferta",
    uso: "negociacion",
    canal: "email",
    asunto: "Re: {{propuesta.campana}}",
    cuerpo: `Hola {{contacto.nombre}},

Gracias por la propuesta. Con {{propuesta.piezas}} no puedo bajar de {{propuesta.minimo}}: es lo que me permite dedicarle el tiempo que merece y cuidar el resultado.

Si el presupuesto es cerrado, puedo proponeros una alternativa con menos piezas que encaje en vuestra cifra. ¿Lo vemos?

Un abrazo,
{{yo.nombrePila}}`,
    favorita: false,
    usos: 4,
    ultimoUso: "2026-09-14T16:00:00",
    creadaEl: "2026-04-01T10:00:00",
    actualizadaEl: "2026-04-01T10:00:00",
  },
  {
    id: "pl-cierre",
    nombre: "Confirmar la collab",
    uso: "cierre",
    canal: "email",
    asunto: "¡Adelante con {{propuesta.campana}}!",
    cuerpo: `Hola {{contacto.nombre}},

¡Qué bien! Confirmo {{propuesta.piezas}} por {{propuesta.total}} para {{propuesta.campana}}.

Para empezar necesito el brief con los mensajes clave, el producto en casa y vuestra dirección de facturación. Os mando el guion para revisarlo antes de grabar.

Un abrazo,
{{yo.nombrePila}}`,
    favorita: false,
    usos: 5,
    ultimoUso: "2026-09-18T12:00:00",
    creadaEl: "2026-03-01T10:00:00",
    actualizadaEl: "2026-03-01T10:00:00",
  },
  {
    id: "pl-gracias",
    nombre: "Gracias y resultados",
    uso: "agradecimiento",
    canal: "email",
    asunto: "Resultados de {{propuesta.campana}}",
    cuerpo: `Hola {{contacto.nombre}},

¡Ya está todo publicado! Te paso los resultados de la primera semana en cuanto los tenga, con capturas de las estadísticas.

Ha sido un gusto trabajar con {{marca.nombre}}: aquí me tenéis para la próxima.

Un abrazo,
{{yo.nombrePila}}`,
    favorita: false,
    usos: 7,
    ultimoUso: "2026-09-02T10:00:00",
    creadaEl: "2026-03-01T10:00:00",
    actualizadaEl: "2026-03-01T10:00:00",
  },
]

export const demoMediaKit: MediaKit = {
  bloques: [
    { id: "portada", visible: true },
    { id: "cifras", visible: true },
    { id: "redes", visible: true },
    { id: "audiencia", visible: true },
    { id: "destacados", visible: true },
    { id: "marcas", visible: true },
    { id: "tarifas", visible: true },
    { id: "contacto", visible: true },
  ],
  titular: "Skincare honesto y maquillaje de diario para mujeres de 25 a 34 años",
  bio: "Rutinas de skincare reales y maquillaje para el día a día. Pruebo todo antes de recomendarlo y solo trabajo con marcas que usaría sin cobrar.",
  destacados: [
    { id: "d1", titulo: "Mi rutina de noche en 3 pasos", red: "instagram", url: "https://instagram.com", imagenUrl: foto("1570172619644-dfd03ed5d881", 600), visualizaciones: 182_000, marca: "Lumea Skin" },
    { id: "d2", titulo: "Maquillaje de diario en 5 minutos", red: "tiktok", url: "https://tiktok.com", imagenUrl: foto("1583241800698-e8ab01830a07", 600), visualizaciones: 246_000, marca: "Maison Vero" },
    { id: "d3", titulo: "El SPF que llevo todo el año", red: "instagram", url: "https://instagram.com", imagenUrl: foto("1487412947147-5cebf100ffc2", 600), visualizaciones: 97_000, marca: "Glow Studio" },
  ],
  actualizadoEl: "2026-09-28T10:00:00",
}
