// Datos de ejemplo del workspace de una influencer: una creadora inventada de beauty en el tramo
// 50K–100K, con marcas y campañas inventadas. Las fotos son de Unsplash (uso libre). Nada de aquí
// es real: el repo es público. Las fechas viven alrededor del 6 de octubre de 2026 (`HOY`).
import type {
  Actividad,
  Aviso,
  Collab,
  Enlace,
  Marca,
  Material,
  Perfil,
  Propuesta,
  Tarea,
  Version,
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
    { red: "instagram", handle: "@martaalbiol.beauty", url: "https://instagram.com", seguidores: 68_400, visualizacionesMedias: 24_100, interaccion: 4.8 },
    { red: "tiktok", handle: "@martaalbiol", url: "https://tiktok.com", seguidores: 41_200, visualizacionesMedias: 38_300, interaccion: 6.1 },
    { red: "youtube", handle: "Marta Albiol", url: "https://youtube.com", seguidores: 8_900, visualizacionesMedias: 6_200, interaccion: 3.2 },
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
}

export const demoMarcas: Marca[] = [
  { id: "lumea", nombre: "Lumea Skin", sector: "Skincare", web: "https://example.com", tint: "rose", atribucion: "propia", atribucionHasta: "2027-03-12", contactos: [{ id: "c-clara", nombre: "Clara Benet", cargo: "Marketing manager", email: "clara@example.com" }], notas: "Contestan rápido. Piden el guion siempre antes de grabar." },
  { id: "botanica", nombre: "Botánica Lab", sector: "Skincare natural", tint: "mint", atribucion: "red", contactos: [{ id: "c-pau", nombre: "Pau Ribes", cargo: "Brand manager", email: "pau@example.com" }], notas: "Pagan tarde: la factura de verano lleva una semana vencida." },
  { id: "vero", nombre: "Maison Vero", sector: "Maquillaje", tint: "peach", atribucion: "propia", atribucionHasta: "2027-01-20", contactos: [{ id: "c-ines", nombre: "Inés Roldán", cargo: "Influencer marketing", email: "ines@example.com" }], notas: "Muy detallistas con el producto en plano: dos rondas casi siempre." },
  { id: "glow", nombre: "Glow Studio", sector: "Protección solar", tint: "lavender", atribucion: "red", contactos: [{ id: "c-marc", nombre: "Marc Soler", cargo: "Marketing", email: "marc@example.com" }] },
  { id: "nuura", nombre: "Nuura", sector: "Cuidado del cabello", tint: "sky", atribucion: "red", contactos: [] },
  { id: "kalma", nombre: "Kalma Cosmetics", sector: "Maquillaje limpio", tint: "lime", atribucion: "propia", atribucionHasta: "2027-09-30", contactos: [{ id: "c-laia", nombre: "Laia Font", cargo: "Fundadora", email: "laia@example.com" }] },
  { id: "aura", nombre: "Aura Hair", sector: "Cuidado del cabello", tint: "sky", atribucion: "propia", atribucionHasta: "2027-09-25", contactos: [{ id: "c-diego", nombre: "Diego Mas", cargo: "Marketing digital", email: "diego@example.com" }] },
  { id: "petalo", nombre: "Pétalo", sector: "Perfumería", tint: "rose", atribucion: "propia", atribucionHasta: "2027-10-05", contactos: [{ id: "c-sara", nombre: "Sara Vidal", cargo: "Comunicación" }] },
  { id: "soleil", nombre: "Soleil Paris", sector: "Protección solar", tint: "peach", atribucion: "red", contactos: [] },
  { id: "dermanova", nombre: "Derma Nova", sector: "Dermocosmética", tint: "lavender", atribucion: "propia", atribucionHasta: "2027-08-14", contactos: [] },
  { id: "bloom", nombre: "Bloom Beauty", sector: "Maquillaje", tint: "mint", atribucion: "propia", atribucionHasta: "2027-07-02", contactos: [] },
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
    campana: "Rutina anticaída",
    estado: "enviada",
    origen: "marca",
    piezas: [{ formato: "reel", cantidad: 1 }, { formato: "tiktok", cantidad: 1 }],
    presupuesto: {
      lineas: [{ formato: "reel", cantidad: 1, precio: 690 }, { formato: "tiktok", cantidad: 1, precio: 590 }],
      extras: ["derechos"],
      conPrecios: true,
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
    campana: "Rutina de noche",
    estado: "ganada",
    origen: "marca",
    piezas: [{ formato: "reel", cantidad: 1 }, { formato: "story", cantidad: 3 }],
    presupuesto: {
      lineas: [{ formato: "reel", cantidad: 1, precio: 690 }, { formato: "story", cantidad: 3, precio: 130 }],
      extras: ["derechos"],
      conPrecios: true,
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
    campana: "Labiales de otoño",
    estado: "perdida",
    origen: "marca",
    piezas: [{ formato: "post", cantidad: 1 }, { formato: "story", cantidad: 2 }],
    ultimoContacto: "2026-08-28T15:00:00",
    motivoPerdida: "sin-respuesta",
    creadaEl: "2026-08-20T09:00:00",
  },
]

const GUION_LUMEA = `GANCHO (0–3 s)
«Esto es lo único que hago por la noche y mi piel nunca ha estado mejor.»

DESARROLLO (3–20 s)
Me desmaquillo con el bálsamo, lo masajeo 30 segundos y lo retiro con agua tibia. Enseño la textura en la mano. Luego el sérum de noche: dos gotas, de dentro hacia fuera.

MENSAJES DE LA MARCA
Fórmula con retinal al 0,1 %, apta para pieles sensibles. Resultados visibles en 4 semanas (estudio clínico de la marca).

LLAMADA A LA ACCIÓN
«Tenéis un 15 % con el código MARTA15 en el enlace de mi bio.»

TEXTO EN PANTALLA
«Rutina de noche en 3 pasos» · «Código MARTA15»

COPY DEL POST
Mi rutina de noche de verdad, sin diez pasos. #publi @lumea.skin #rutinadenoche #skincare

NOTAS DE RODAJE
Luz cálida del baño, plano cenital para las texturas. Enseñar el envase entero al menos 2 segundos.`

const GUION_BOTANICA = `GANCHO (0–3 s)
«Llevo 15 días con este sérum de vitamina C y esto es lo que ha pasado.»

DESARROLLO (3–25 s)
Primera impresión al abrirlo: color, textura y olor. Cómo lo aplico por la mañana antes del SPF. Qué he notado en la primera semana (luminosidad) y qué no (las manchas van a tardar más).

MENSAJES DE LA MARCA
Vitamina C estabilizada al 15 %, sin perfume, envase de vidrio reciclable.

LLAMADA A LA ACCIÓN
«El enlace está en mi bio; el reel de los resultados llega en dos semanas.»

COPY DEL POST
Primera impresión del sérum de vitamina C de @botanicalab. En 15 días os cuento los resultados. #publi #vitaminac`

const GUION_VERO = `GANCHO (0–3 s)
«Un look de otoño en 3 productos, y uno de ellos lo vais a querer.»

DESARROLLO (3–22 s)
Base ligera, la paleta Terracota en los párpados (enseño los 4 tonos de cerca) y el labial Castaña. Antes y después.

MENSAJES DE LA MARCA
Paleta Terracota: 4 tonos mate y satinados, edición limitada de otoño.

LLAMADA A LA ACCIÓN
«Todo en el enlace de mi bio.»

COPY DEL POST
Mi look de otoño con la colección nueva de @maisonvero. #publi #lookdeotoño`

const GUION_GLOW = `GANCHO (0–3 s)
«El SPF que por fin no me deja la cara blanca.»

DESARROLLO (3–18 s)
Aplicación con los dos dedos de producto, cómo queda bajo el maquillaje, y el truco para reaplicar a mediodía.

MENSAJES DE LA MARCA
SPF 50+ de amplio espectro, acabado invisible, sin fragancia.

LLAMADA A LA ACCIÓN
«Lanzamiento el 12 de octubre: enlace en la bio.»

COPY DEL POST
Mi SPF de cada día, desde hoy a la venta. @glowstudio #publi #spf50`

const version = (v: Omit<Version, "notas"> & { notas?: Version["notas"] }): Version => ({ notas: [], ...v })

export const demoCollabs: Collab[] = [
  {
    id: "lumea",
    marcaId: "lumea",
    campana: "Rutina de noche",
    tipo: "directa",
    estado: "en-curso",
    importe: 1296,
    tint: "rose",
    coverUrl: foto("1570172619644-dfd03ed5d881"),
    desde: "2026-10-01",
    hasta: "2026-10-20",
    brief: {
      objetivo: "Dar a conocer la rutina de noche de Lumea (bálsamo + sérum con retinal) entre mujeres de 25 a 40 con piel sensible.",
      mensajesClave: ["Retinal al 0,1 % apto para pieles sensibles", "Resultados visibles en 4 semanas", "Rutina de 3 pasos, sin complicaciones"],
      menciones: ["@lumea.skin"],
      hashtags: ["#publi", "#rutinadenoche", "#lumeaskin"],
      enlace: "https://example.com/rutina-de-noche",
      codigo: "MARTA15",
      exclusividad: "Skincare de noche · 2 meses",
      derechosUso: "Orgánico · 6 meses",
      rondasIncluidas: 2,
      claimsPermitidos: ["Apto para pieles sensibles", "Resultados visibles en 4 semanas (estudio clínico)"],
      claimsProhibidos: ["Elimina las arrugas", "Efecto bótox", "Cura el acné"],
      hacer: ["Enseñar el envase entero al menos 2 segundos", "Mostrar la textura en la mano", "Marcar como publicidad en la propia plataforma"],
      evitar: ["Comparar con otras marcas", "Aplicarlo cerca de los ojos en cámara"],
      producto: { estado: "recibido", detalle: "Bálsamo + sérum, recibidos el 3 de octubre" },
      contacto: { nombre: "Clara Benet", email: "clara@example.com" },
      condicionesPago: "30 días tras la publicación del reel",
    },
    piezas: [
      {
        id: "lumea-reel",
        collabId: "lumea",
        formato: "reel",
        unidades: 1,
        titulo: "Reel · Mi rutina de noche",
        publicacion: "2026-10-15",
        estado: "borrador",
        rondaActual: 1,
        portadaUrl: foto("1570172619644-dfd03ed5d881", 600),
        guion: [
          version({
            id: "lumea-reel-g1",
            tipo: "guion",
            numero: 1,
            estado: "aprobada",
            creadaEl: "2026-10-03T19:00:00",
            texto: GUION_LUMEA,
            enlace: { token: "rv-lumea-reel-g1", caduca: "2026-11-03" },
            notas: [
              { id: "n-lumea-1", autor: "Clara Benet", el: "2026-10-05T18:10:00", texto: "Perfecto. Solo una cosa: di «retinal», no «retinol», que es otro ingrediente.", ancla: { tipo: "texto", cita: "Fórmula con retinal al 0,1 %" }, resuelta: true, respuesta: "Cambiado, lo digo bien en el vídeo." },
            ],
            aprobada: { por: "Clara Benet", el: "2026-10-05T18:20:00" },
          }),
        ],
        video: [],
      },
      {
        id: "lumea-stories",
        collabId: "lumea",
        formato: "story",
        unidades: 3,
        titulo: "3 stories · Antes y después",
        publicacion: "2026-10-18",
        estado: "borrador",
        rondaActual: 1,
        guion: [
          version({
            id: "lumea-stories-g1",
            tipo: "guion",
            numero: 1,
            estado: "borrador",
            creadaEl: "2026-10-05T22:00:00",
            texto: "STORY 1\nEl paquete abierto, qué lleva y por qué lo he elegido.\n\nSTORY 2\nTextura del sérum en la mano y cómo lo aplico (sticker de enlace).\n\nSTORY 3\nPiel por la mañana + código MARTA15 en grande.",
          }),
        ],
        video: [],
      },
    ],
    cobro: { estado: "por-facturar" },
    propuestaId: "p-lumea",
    creadaEl: "2026-09-18T12:00:00",
  },
  {
    id: "botanica",
    marcaId: "botanica",
    campana: "Sérum de vitamina C",
    tipo: "red",
    estado: "en-curso",
    importe: 1900,
    importeNeto: 1520,
    tint: "mint",
    coverUrl: foto("1596462502278-27bfdc403348"),
    desde: "2026-10-05",
    hasta: "2026-11-05",
    brief: {
      objetivo: "Dos reels que enseñen la experiencia real con el sérum: la primera impresión y los resultados a los 15 días.",
      mensajesClave: ["Vitamina C estabilizada al 15 %", "Sin perfume", "Envase de vidrio reciclable"],
      menciones: ["@botanicalab"],
      hashtags: ["#publi", "#vitaminac", "#botanicalab"],
      enlace: "https://example.com/vitamina-c",
      derechosUso: "Orgánico · 3 meses",
      rondasIncluidas: 2,
      claimsPermitidos: ["Más luminosidad desde la primera semana", "Fórmula estabilizada"],
      claimsProhibidos: ["Quita las manchas", "Sustituye al SPF"],
      hacer: ["Grabar el segundo reel con el mismo encuadre que el primero", "Decir el porcentaje de vitamina C"],
      evitar: ["Mezclarlo en cámara con otros ácidos"],
      producto: { estado: "enviado", detalle: "Sale el 6 de octubre; llega en 48 h" },
      contacto: { nombre: "Pau Ribes", email: "pau@example.com" },
      condicionesPago: "Factura Astratic; cobro a 30 días tras el segundo reel",
    },
    piezas: [
      {
        id: "botanica-reel-1",
        collabId: "botanica",
        formato: "reel",
        unidades: 1,
        titulo: "Reel 1 · Primera impresión",
        publicacion: "2026-10-22",
        estado: "borrador",
        rondaActual: 1,
        portadaUrl: foto("1596462502278-27bfdc403348", 600),
        guion: [version({ id: "botanica-reel-1-g1", tipo: "guion", numero: 1, estado: "borrador", creadaEl: "2026-10-05T23:10:00", texto: GUION_BOTANICA })],
        video: [],
      },
      {
        id: "botanica-reel-2",
        collabId: "botanica",
        formato: "reel",
        unidades: 1,
        titulo: "Reel 2 · Resultados a los 15 días",
        publicacion: "2026-11-05",
        estado: "borrador",
        rondaActual: 1,
        guion: [],
        video: [],
      },
    ],
    cobro: { estado: "por-facturar" },
    creadaEl: "2026-09-28T10:00:00",
  },
  {
    id: "vero",
    marcaId: "vero",
    campana: "Colección otoño",
    tipo: "directa",
    estado: "en-curso",
    importe: 1650,
    tint: "peach",
    coverUrl: foto("1583241800698-e8ab01830a07"),
    desde: "2026-09-20",
    hasta: "2026-10-20",
    brief: {
      objetivo: "Presentar la colección de otoño (paleta Terracota y labial Castaña) con un look completo y un tutorial corto.",
      mensajesClave: ["Edición limitada de otoño", "4 tonos mate y satinados", "Larga duración sin retoques"],
      menciones: ["@maisonvero"],
      hashtags: ["#publi", "#lookdeotoño", "#maisonvero"],
      enlace: "https://example.com/otono",
      exclusividad: "Maquillaje de ojos · 1 mes",
      derechosUso: "Paid · 3 meses",
      rondasIncluidas: 2,
      claimsPermitidos: ["Larga duración", "Pigmentación alta"],
      claimsProhibidos: ["Hipoalergénico", "No testado en animales (sin certificado)"],
      hacer: ["Enseñar los 4 tonos de cerca", "Nombrar la paleta en pantalla"],
      evitar: ["Mezclar con productos de otras marcas en el mismo plano"],
      producto: { estado: "recibido" },
      contacto: { nombre: "Inés Roldán", email: "ines@example.com" },
      condicionesPago: "50 % al aprobar el guion, 50 % a 30 días tras publicar",
    },
    piezas: [
      {
        id: "vero-reel",
        collabId: "vero",
        formato: "reel",
        unidades: 1,
        titulo: "Reel · Look de otoño",
        publicacion: "2026-10-15",
        estado: "cambios",
        rondaActual: 1,
        portadaUrl: foto("1583241800698-e8ab01830a07", 600),
        guion: [
          version({ id: "vero-reel-g1", tipo: "guion", numero: 1, estado: "aprobada", creadaEl: "2026-09-26T18:00:00", texto: GUION_VERO, enlace: { token: "rv-vero-reel-g1", caduca: "2026-10-26" }, aprobada: { por: "Inés Roldán", el: "2026-09-28T10:30:00" } }),
        ],
        video: [
          version({
            id: "vero-reel-v1",
            tipo: "video",
            numero: 1,
            estado: "cambios",
            creadaEl: "2026-10-02T17:40:00",
            archivo: { nombre: "vero-look-otono-v1.mp4", tamano: 148_000_000, duracion: 27, posterUrl: foto("1583241800698-e8ab01830a07", 600) },
            enlace: { token: "rv-vero-reel-v1", caduca: "2026-11-02" },
            notas: [
              { id: "n-vero-1", autor: "Inés Roldán", el: "2026-10-06T10:12:00", texto: "El producto se ve poco en el primer plano. ¿Puedes acercar la paleta a cámara un segundo más?", ancla: { tipo: "segundo", segundo: 4 }, resuelta: false },
              { id: "n-vero-2", autor: "Inés Roldán", el: "2026-10-06T10:15:00", texto: "Añade el nombre «Terracota» en pantalla cuando enseñas los tonos.", ancla: { tipo: "segundo", segundo: 18 }, resuelta: false },
            ],
          }),
        ],
      },
      {
        id: "vero-tiktok",
        collabId: "vero",
        formato: "tiktok",
        unidades: 1,
        titulo: "TikTok · Tutorial en 30 segundos",
        publicacion: "2026-10-02",
        estado: "publicado",
        rondaActual: 1,
        portadaUrl: foto("1522335789203-aabd1fc54bc9", 600),
        guion: [],
        video: [
          version({ id: "vero-tiktok-v1", tipo: "video", numero: 1, estado: "aprobada", creadaEl: "2026-09-29T12:00:00", archivo: { nombre: "vero-tutorial-v1.mp4", tamano: 96_000_000, duracion: 31 }, aprobada: { por: "Inés Roldán", el: "2026-09-30T09:45:00" } }),
        ],
        publicada: { url: "https://tiktok.com", fecha: "2026-10-02", marcadaPubli: true },
      },
    ],
    cobro: { estado: "facturado", vencimiento: "2026-10-30", factura: "2026-017" },
    creadaEl: "2026-09-15T10:00:00",
  },
  {
    id: "glow",
    marcaId: "glow",
    campana: "Lanzamiento SPF",
    tipo: "red",
    estado: "en-curso",
    importe: 980,
    importeNeto: 784,
    tint: "lavender",
    coverUrl: foto("1487412947147-5cebf100ffc2"),
    desde: "2026-10-01",
    hasta: "2026-10-12",
    brief: {
      objetivo: "Acompañar el lanzamiento del SPF 50+ invisible el 12 de octubre con un reel de uso diario.",
      mensajesClave: ["SPF 50+ de amplio espectro", "Acabado invisible", "Sin fragancia"],
      menciones: ["@glowstudio"],
      hashtags: ["#publi", "#spf50", "#glowstudio"],
      enlace: "https://example.com/spf",
      derechosUso: "Orgánico · 3 meses",
      rondasIncluidas: 1,
      claimsPermitidos: ["Protección muy alta", "Acabado invisible en todos los tonos de piel"],
      claimsProhibidos: ["Protección total", "Bloqueador"],
      hacer: ["Publicar el 12 de octubre entre las 18 y las 20 h"],
      evitar: ["Enseñar el producto antes del día del lanzamiento"],
      producto: { estado: "recibido" },
      contacto: { nombre: "Marc Soler", email: "marc@example.com" },
      condicionesPago: "Factura Astratic; cobro a 30 días",
    },
    piezas: [
      {
        id: "glow-reel",
        collabId: "glow",
        formato: "reel",
        unidades: 1,
        titulo: "Reel · SPF cada día",
        publicacion: "2026-10-12",
        estado: "programado",
        rondaActual: 2,
        portadaUrl: foto("1487412947147-5cebf100ffc2", 600),
        guion: [version({ id: "glow-reel-g1", tipo: "guion", numero: 1, estado: "aprobada", creadaEl: "2026-09-27T10:00:00", texto: GUION_GLOW, aprobada: { por: "Marc Soler", el: "2026-09-29T11:00:00" } })],
        video: [
          version({
            id: "glow-reel-v1",
            tipo: "video",
            numero: 1,
            estado: "cambios",
            creadaEl: "2026-10-01T16:00:00",
            archivo: { nombre: "glow-spf-v1.mp4", tamano: 121_000_000, duracion: 22 },
            notas: [{ id: "n-glow-1", autor: "Marc Soler", el: "2026-10-02T09:30:00", texto: "Quita el plano del envase antiguo: en el lanzamiento va el nuevo.", ancla: { tipo: "segundo", segundo: 9 }, resuelta: true, respuesta: "Hecho en la V2." }],
          }),
          version({ id: "glow-reel-v2", tipo: "video", numero: 2, estado: "aprobada", creadaEl: "2026-10-03T18:30:00", archivo: { nombre: "glow-spf-v2.mp4", tamano: 119_000_000, duracion: 22 }, enlace: { token: "rv-glow-reel-v2", caduca: "2026-11-03" }, aprobada: { por: "Marc Soler", el: "2026-10-04T12:10:00" } }),
        ],
      },
    ],
    cobro: { estado: "por-facturar" },
    creadaEl: "2026-09-24T10:00:00",
  },
  {
    id: "botanica-verano",
    marcaId: "botanica",
    campana: "Sérum de verano",
    tipo: "red",
    estado: "por-cobrar",
    importe: 950,
    importeNeto: 760,
    tint: "mint",
    desde: "2026-07-01",
    hasta: "2026-07-20",
    brief: {
      objetivo: "Un reel de rutina de verano con el sérum hidratante.",
      mensajesClave: ["Hidratación ligera para el verano"],
      menciones: ["@botanicalab"],
      hashtags: ["#publi"],
      rondasIncluidas: 2,
      claimsPermitidos: [],
      claimsProhibidos: [],
      hacer: [],
      evitar: [],
      contacto: { nombre: "Pau Ribes", email: "pau@example.com" },
      condicionesPago: "30 días",
    },
    piezas: [
      { id: "botanica-verano-reel", collabId: "botanica-verano", formato: "reel", unidades: 1, titulo: "Reel · Rutina de verano", publicacion: "2026-07-18", estado: "resultados", rondaActual: 1, guion: [], video: [], publicada: { url: "https://instagram.com", fecha: "2026-07-18", marcadaPubli: true } },
    ],
    cobro: { estado: "vencido", vencimiento: "2026-09-30", factura: "2026-014" },
    creadaEl: "2026-06-20T10:00:00",
  },
  {
    id: "lumea-verano",
    marcaId: "lumea",
    campana: "Protección solar facial",
    tipo: "directa",
    estado: "cerrada",
    importe: 1150,
    tint: "rose",
    desde: "2026-06-01",
    hasta: "2026-06-20",
    brief: { objetivo: "Reel y stories del SPF facial.", mensajesClave: [], menciones: ["@lumea.skin"], hashtags: ["#publi"], rondasIncluidas: 2, claimsPermitidos: [], claimsProhibidos: [], hacer: [], evitar: [], contacto: { nombre: "Clara Benet", email: "clara@example.com" }, condicionesPago: "30 días" },
    piezas: [
      { id: "lumea-verano-reel", collabId: "lumea-verano", formato: "reel", unidades: 1, titulo: "Reel · SPF facial", publicacion: "2026-06-15", estado: "resultados", rondaActual: 1, guion: [], video: [], publicada: { url: "https://instagram.com", fecha: "2026-06-15", marcadaPubli: true } },
      { id: "lumea-verano-stories", collabId: "lumea-verano", formato: "story", unidades: 2, titulo: "2 stories · Reaplicar", publicacion: "2026-06-18", estado: "resultados", rondaActual: 1, guion: [], video: [], publicada: { url: "https://instagram.com", fecha: "2026-06-18", marcadaPubli: true } },
    ],
    cobro: { estado: "cobrado", vencimiento: "2026-07-15", factura: "2026-009" },
    creadaEl: "2026-05-12T10:00:00",
  },
  {
    id: "vero-primavera",
    marcaId: "vero",
    campana: "Colección primavera",
    tipo: "directa",
    estado: "cerrada",
    importe: 1400,
    tint: "peach",
    desde: "2026-04-01",
    hasta: "2026-04-20",
    brief: { objetivo: "Look de primavera con la colección nueva.", mensajesClave: [], menciones: ["@maisonvero"], hashtags: ["#publi"], rondasIncluidas: 2, claimsPermitidos: [], claimsProhibidos: [], hacer: [], evitar: [], contacto: { nombre: "Inés Roldán", email: "ines@example.com" }, condicionesPago: "30 días" },
    piezas: [
      { id: "vero-primavera-reel", collabId: "vero-primavera", formato: "reel", unidades: 1, titulo: "Reel · Look de primavera", publicacion: "2026-04-14", estado: "resultados", rondaActual: 2, guion: [], video: [], publicada: { url: "https://instagram.com", fecha: "2026-04-14", marcadaPubli: true } },
    ],
    cobro: { estado: "cobrado", vencimiento: "2026-05-14", factura: "2026-006" },
    creadaEl: "2026-03-10T10:00:00",
  },
]

export const demoMateriales: Material[] = [
  { id: "m-lumea-brief", collabId: "lumea", nombre: "Brief Rutina de noche.pdf", tipo: "pdf", origen: "marca", tamano: 2_400_000, url: "#", subidoEl: "2026-09-18T12:30:00", descripcion: "El brief completo de la marca" },
  { id: "m-lumea-logos", collabId: "lumea", nombre: "Logos Lumea.zip", tipo: "zip", origen: "marca", tamano: 8_100_000, url: "#", subidoEl: "2026-09-18T12:30:00" },
  { id: "m-lumea-producto-1", collabId: "lumea", nombre: "Sérum de noche · packshot.jpg", tipo: "imagen", origen: "marca", tamano: 1_900_000, url: "#", previewUrl: foto("1570172619644-dfd03ed5d881", 400), subidoEl: "2026-09-19T09:00:00" },
  { id: "m-lumea-producto-2", collabId: "lumea", nombre: "Bálsamo · textura.jpg", tipo: "imagen", origen: "marca", tamano: 2_200_000, url: "#", previewUrl: foto("1556228720-195a672e8a03", 400), subidoEl: "2026-09-19T09:00:00" },
  { id: "m-lumea-claims", collabId: "lumea", nombre: "Guía de claims y menciones.pdf", tipo: "pdf", origen: "marca", tamano: 640_000, url: "#", subidoEl: "2026-09-19T09:05:00" },
  { id: "m-lumea-landing", collabId: "lumea", nombre: "Landing de la campaña", tipo: "enlace", origen: "marca", url: "https://example.com/rutina-de-noche", subidoEl: "2026-09-19T09:05:00" },
  { id: "m-lumea-contrato", collabId: "lumea", nombre: "Contrato firmado.pdf", tipo: "pdf", origen: "mia", tamano: 310_000, url: "#", subidoEl: "2026-09-22T17:00:00" },
  { id: "m-vero-brief", collabId: "vero", nombre: "Brief Colección otoño.pdf", tipo: "pdf", origen: "marca", tamano: 3_100_000, url: "#", subidoEl: "2026-09-15T11:00:00" },
  { id: "m-vero-paleta", collabId: "vero", nombre: "Paleta Terracota · packshot.jpg", tipo: "imagen", origen: "marca", tamano: 2_700_000, url: "#", previewUrl: foto("1583241800698-e8ab01830a07", 400), subidoEl: "2026-09-15T11:00:00" },
  { id: "m-vero-referencias", collabId: "vero", nombre: "Referencias de la marca", tipo: "enlace", origen: "marca", url: "https://example.com/referencias", subidoEl: "2026-09-15T11:05:00", descripcion: "Looks que les gustan, para el tono" },
  { id: "m-vero-contrato", collabId: "vero", nombre: "Contrato firmado.pdf", tipo: "pdf", origen: "mia", tamano: 290_000, url: "#", subidoEl: "2026-09-17T10:00:00" },
  { id: "m-botanica-brief", collabId: "botanica", nombre: "Brief Sérum de vitamina C.pdf", tipo: "pdf", origen: "marca", tamano: 1_800_000, url: "#", subidoEl: "2026-09-28T10:30:00" },
  { id: "m-botanica-producto", collabId: "botanica", nombre: "Sérum · packshot.jpg", tipo: "imagen", origen: "marca", tamano: 2_000_000, url: "#", previewUrl: foto("1596462502278-27bfdc403348", 400), subidoEl: "2026-09-28T10:30:00" },
  { id: "m-glow-brief", collabId: "glow", nombre: "Brief Lanzamiento SPF.pdf", tipo: "pdf", origen: "marca", tamano: 1_200_000, url: "#", subidoEl: "2026-09-24T10:30:00" },
  { id: "m-glow-logo", collabId: "glow", nombre: "Logo Glow Studio.zip", tipo: "zip", origen: "marca", tamano: 4_400_000, url: "#", subidoEl: "2026-09-24T10:30:00" },
]

export const demoTareas: Tarea[] = [
  { id: "t1", titulo: "Subir la V2 del reel", hecha: false, fechaLimite: "2026-10-05", relacion: { tipo: "collab", id: "vero" }, origen: "auto", notas: "Ronda 1 de 2: dos notas de Inés en la V1." },
  { id: "t2", titulo: "Enviar el guion del reel 1 a la marca", hecha: false, fechaLimite: "2026-10-06", relacion: { tipo: "collab", id: "botanica" }, origen: "auto" },
  { id: "t3", titulo: "Grabar el reel de la rutina de noche", hecha: false, fechaLimite: "2026-10-06", relacion: { tipo: "collab", id: "lumea" }, origen: "manual" },
  { id: "t4", titulo: "Recoger el paquete en Correos", hecha: true, hechaEl: "2026-10-06T10:00:00", fechaLimite: "2026-10-06", relacion: { tipo: "collab", id: "lumea" }, origen: "manual" },
  { id: "t5", titulo: "Reclamar la factura 2026-014 a Astratic", hecha: false, fechaLimite: "2026-10-08", relacion: { tipo: "collab", id: "botanica-verano" }, origen: "manual" },
  { id: "t6", titulo: "Decir a Astratic si entro en la campaña de Nuura", hecha: false, fechaLimite: "2026-10-09", relacion: { tipo: "propuesta", id: "p-nuura" }, origen: "auto" },
  { id: "t7", titulo: "Grabar las 3 stories", hecha: false, fechaLimite: "2026-10-10", relacion: { tipo: "collab", id: "lumea" }, origen: "manual" },
  { id: "t8", titulo: "Entregar la V1 del reel", hecha: false, fechaLimite: "2026-10-09", relacion: { tipo: "collab", id: "lumea" }, origen: "auto" },
  { id: "t9", titulo: "Mandar tarifas y media kit a Kalma", hecha: false, fechaLimite: "2026-10-07", relacion: { tipo: "propuesta", id: "p-kalma" }, origen: "manual" },
  { id: "t10", titulo: "Contraoferta a Soleil: 1.150 €", hecha: false, fechaLimite: "2026-10-07", relacion: { tipo: "propuesta", id: "p-soleil" }, origen: "manual" },
  { id: "t11", titulo: "Publicar el reel del SPF", hecha: false, fechaLimite: "2026-10-12", relacion: { tipo: "collab", id: "glow" }, origen: "auto", notas: "Entre las 18 y las 20 h, con el enlace de la bio actualizado." },
  { id: "t12", titulo: "Publicar el reel del look de otoño", hecha: false, fechaLimite: "2026-10-15", relacion: { tipo: "collab", id: "vero" }, origen: "auto" },
  { id: "t13", titulo: "Enviar los resultados del TikTok a Maison Vero", hecha: false, fechaLimite: "2026-10-09", relacion: { tipo: "collab", id: "vero" }, origen: "auto" },
  { id: "t14", titulo: "Seguimiento de la propuesta de Aura Hair", hecha: false, fechaLimite: "2026-10-08", relacion: { tipo: "propuesta", id: "p-aura" }, origen: "manual" },
  { id: "t15", titulo: "Publicar las 3 stories", hecha: false, fechaLimite: "2026-10-18", relacion: { tipo: "collab", id: "lumea" }, origen: "auto" },
  { id: "t16", titulo: "Enviar el guion del reel 2", hecha: false, fechaLimite: "2026-10-26", relacion: { tipo: "collab", id: "botanica" }, origen: "auto" },
  { id: "t17", titulo: "Actualizar el media kit con las cifras de octubre", hecha: false, fechaLimite: "2026-10-10", origen: "manual" },
  { id: "t18", titulo: "Renovar el dominio de la web", hecha: false, fechaLimite: "2026-10-20", origen: "manual" },
  { id: "t19", titulo: "Pedir el certificado de Autocontrol", hecha: true, hechaEl: "2026-10-02T12:00:00", fechaLimite: "2026-10-02", origen: "manual" },
]

export const demoAvisoDestacado: Aviso = {
  id: "n0",
  tipo: "oportunidad",
  titulo: "Nueva oportunidad de la red: Nuura",
  descripcion: "1 reel + 3 stories · 1.100 € (880 € para ti) · del 20 al 31 de octubre",
  el: "2026-10-06T09:40:00",
  leido: false,
  href: "/workspace/propuestas?propuesta=p-nuura",
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

/** Cobrado en lo que va de año: en el portal saldrá de los cobros; aquí es una cifra fija. */
export const COBRADO_ESTE_ANO = 18_650
