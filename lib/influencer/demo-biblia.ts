// La Academia de la red (la Biblia en el código): la guía que escribe Astratic para sus creadoras. En el portal vendrá de la base
// de datos y Astratic la editará desde su lado; aquí va el texto de la primera versión. Cada frase
// tiene que ser cierta hoy: nada de cifras de mercado sin fuente.
import type { CapituloBiblia, LecturasBiblia } from "@/lib/influencer/modelo"

const parrafo = (texto: string) => ({ tipo: "parrafo" as const, texto })
const lista = (...items: string[]) => ({ tipo: "lista" as const, items })
const consejo = (texto: string) => ({ tipo: "consejo" as const, texto })
const enlace = (texto: string, href: string) => ({ tipo: "enlace" as const, texto, href })

export const demoCapitulosBiblia: CapituloBiblia[] = [
  {
    id: "perfil-y-bio",
    titulo: "Tu perfil y tu bio",
    resumen: "Lo que mira una marca antes de escribirte y cómo dejarlo claro en diez segundos.",
    minutos: 4,
    esencial: true,
    actualizadoEl: "2026-09-20",
    secciones: [
      { titulo: "Lo que mira una marca", bloques: [parrafo("Antes de escribirte, quien lleva las colaboraciones de una marca abre tu perfil y decide rápido. Mira tu foto, la primera línea de la bio y tus últimos reels, y se pregunta si se entiende a qué te dedicas. Si duda, pasa a la siguiente.")] },
      {
        titulo: "La bio",
        bloques: [
          lista(
            "En la primera línea, a qué te dedicas y para quién («Skincare real para pieles sensibles»).",
            "Tu ciudad, si quieres trabajar con marcas o eventos de aquí.",
            "Un email de contacto visible. Muchas marcas no escriben por mensaje directo.",
            "La mención de la red de Astratic, que forma parte del acuerdo.",
          ),
        ],
      },
      { titulo: "Las historias destacadas", bloques: [parrafo("Úsalas como escaparate. Una con tu formato estrella, otra con las colaboraciones que ya has hecho y otra con reseñas o favoritos. Con eso una marca ve en un minuto cómo trabajas.")] },
      { titulo: "Para comprobarlo", bloques: [consejo("Mira tu perfil desde una cuenta que no te siga. Es lo que ve la marca."), enlace("Tu perfil en el workspace", "/workspace/perfil")] },
    ],
  },
  {
    id: "como-te-encuentran",
    titulo: "Cómo te encuentran las marcas",
    resumen: "Por dónde llegan las propuestas, qué hace la red por ti y qué puedes hacer tú.",
    minutos: 4,
    actualizadoEl: "2026-09-20",
    secciones: [
      {
        titulo: "Por dónde llegan",
        bloques: [
          lista(
            "Te ven en su feed, en el de la competencia o en el de otra creadora que ya trabaja con ellos.",
            "Te buscan por hashtags, por ubicación o con herramientas de búsqueda de perfiles.",
            "Se las presenta una agencia o una red como Astratic.",
          ),
        ],
      },
      { titulo: "Lo que hace la red", bloques: [parrafo("Astratic presenta tu perfil a marcas que buscan tu nicho y tu tamaño. Cuando hay una oportunidad, te entra en el CRM en la columna «Nueva» con la etiqueta «Red Astratic», y te llega un aviso al Inicio.")] },
      {
        titulo: "Lo que puedes hacer tú",
        bloques: [
          lista(
            "Etiqueta a las marcas que usas de verdad, sin pedir nada a cambio.",
            "Ten el media kit al día y mándalo en el primer mensaje.",
            "Apunta en el CRM las marcas con las que te gustaría trabajar y escribe tú primero, con las plantillas de mensajes.",
          ),
          consejo("Cada marca que traes tú queda registrada a tu nombre en el CRM durante 12 meses."),
          enlace("Ir a las marcas del CRM", "/workspace/crm/marcas"),
        ],
      },
    ],
  },
  {
    id: "precio-y-negociar",
    titulo: "Poner precio y negociar",
    resumen: "Tus tarifas, el CPM para saber si un precio tiene sentido y qué hacer cuando no hay presupuesto.",
    minutos: 6,
    esencial: true,
    actualizadoEl: "2026-10-01",
    secciones: [
      { titulo: "Tus tarifas", bloques: [parrafo("En Perfil y tarifas tienes tu precio de salida y tu mínimo por formato, pactados con Astratic. El de salida es lo que pides de entrada. El mínimo es lo más bajo que aceptas, y el portal te avisa si una propuesta se queda por debajo.")] },
      { titulo: "El CPM", bloques: [parrafo("Es lo que paga la marca por cada mil visualizaciones. Un reel de 600 € con 20.000 visualizaciones de media sale a 30 € de CPM. En la pestaña Tarifas ves el de cada formato al lado del CPM de referencia de tu tramo, y así sabes si estás cara o barata.")] },
      {
        titulo: "Lo que se cobra aparte",
        bloques: [
          lista(
            "Derechos de uso, si la marca va a usar tu contenido en su web, en sus redes o en anuncios.",
            "Exclusividad, si te pide no trabajar con la competencia durante un tiempo.",
            "Urgencia, si hay que grabar y entregar en menos de una semana.",
            "Rondas de cambios de más. Lo normal es incluir dos.",
          ),
        ],
      },
      { titulo: "Cuando dicen que no hay presupuesto", bloques: [parrafo("Antes de bajar el precio, quita algo. Menos piezas, sin derechos de uso o sin exclusiva. Si aun así no llega a tu mínimo, se puede decir que no con educación y dejar la puerta abierta para la siguiente campaña.")] },
      { titulo: "Antes de dar una cifra", bloques: [consejo("Pide el brief por escrito. Sin saber qué piden, cualquier precio es a ciegas."), enlace("Ver tus tarifas y el simulador", "/workspace/perfil/tarifas")] },
    ],
  },
  {
    id: "regalos",
    titulo: "Regalos de producto",
    resumen: "Cuándo aceptar uno, qué te pueden pedir a cambio y cómo se marca si publicas.",
    minutos: 3,
    actualizadoEl: "2026-09-20",
    secciones: [
      { titulo: "Un regalo también cuenta", bloques: [parrafo("Si una marca te manda producto y publicas sobre él, eso se considera publicidad aunque no haya dinero de por medio. Se marca igual que una colaboración pagada.")] },
      {
        titulo: "Cuándo aceptarlo",
        bloques: [
          lista(
            "Si el producto te encaja y lo usarías igual.",
            "Si no te piden piezas a cambio. Si las piden, ya es una colaboración y tiene precio.",
            "Si te abre la puerta de una marca con la que quieres trabajar.",
          ),
        ],
      },
      { titulo: "En el workspace", bloques: [parrafo("Créalo como collab de tipo «Regalo». Así la marca queda registrada y, si publicas, las piezas llevan su seguimiento como cualquier otra."), consejo("Un regalo no obliga a publicar. Si el producto no te convence, se agradece y listo.")] },
    ],
  },
  {
    id: "publicidad",
    titulo: "La publicidad, bien marcada",
    resumen: "Cuándo hay que marcar un contenido como publicidad, cómo hacerlo y lo que no vale.",
    minutos: 5,
    esencial: true,
    actualizadoEl: "2026-10-01",
    secciones: [
      { titulo: "Cuándo", bloques: [parrafo("Siempre que haya algo a cambio. Dinero, producto, un viaje, un descuento o un enlace de afiliado. Da igual que la marca no lo pida. Lo recoge el Código de Conducta sobre el uso de influencers en la publicidad, de Autocontrol, la AEA e IAB Spain.")] },
      {
        titulo: "Cómo",
        bloques: [
          lista(
            "Con una palabra clara en español, como «publi», «publicidad» o «colaboración pagada», que se vea sin tener que buscarla.",
            "Con la etiqueta de colaboración pagada de la propia red social cuando la tenga.",
            "Si compartes el contenido en otra red, la marca de publicidad va también allí.",
          ),
        ],
      },
      { titulo: "Lo que no vale", bloques: [parrafo("Una etiqueta en inglés como «#ad» no sirve en español. Tampoco esconder la mención entre muchos hashtags al final del texto.")] },
      { titulo: "Menores e inteligencia artificial", bloques: [parrafo("Si en el contenido salen menores o usas imágenes o voces hechas con inteligencia artificial, coméntalo con la marca y con Astratic antes de grabar. Son casos con normas propias y conviene revisarlos uno a uno.")] },
      {
        titulo: "El curso de Autocontrol",
        bloques: [
          parrafo("Autocontrol tiene un curso online y gratuito para influencers. Si lo apruebas entras en su listado de certificadas, y en el workspace lo enseñamos en tu perfil y en tu media kit."),
          consejo("El editor de guion te avisa antes de enviar si falta la marca de publicidad o si has puesto «#ad»."),
          enlace("Marcar el sello en tu perfil", "/workspace/perfil"),
        ],
      },
    ],
  },
  {
    id: "derechos-y-contratos",
    titulo: "Derechos de uso, exclusividad y contratos",
    resumen: "Qué puede hacer la marca con tu contenido, qué cuesta una exclusividad y qué mirar antes de firmar.",
    minutos: 5,
    actualizadoEl: "2026-09-28",
    secciones: [
      { titulo: "Derechos de uso", bloques: [parrafo("Que la marca comparta tu publicación es lo habitual. Usar tu vídeo en su web, en anuncios o durante meses es otra cosa y se pacta aparte, con los canales y el plazo por escrito.")] },
      { titulo: "Exclusividad", bloques: [parrafo("Si te piden no trabajar con la competencia, cierras puertas durante ese tiempo y eso se cobra. Pacta la categoría lo más concreta posible («sérums faciales» mejor que «belleza») y los meses.")] },
      {
        titulo: "Qué mirar en un contrato",
        bloques: [
          lista(
            "Cuántas rondas de cambios entran en el precio.",
            "En qué canales y durante cuánto tiempo puede usar la marca tu contenido.",
            "Si hay exclusividad, de qué y hasta cuándo.",
            "Cuándo te pagan. Más de 60 días es mucho esperar.",
            "Qué pasa si la marca cancela la campaña.",
          ),
        ],
      },
      { titulo: "En el workspace", bloques: [parrafo("Cada collab tiene su pestaña Contrato, con plantillas, cláusulas tipo y una revisión que señala lo que conviene vigilar. Si la marca te manda su PDF, súbelo ahí y repasa la lista antes de firmar.")] },
    ],
  },
  {
    id: "facturar",
    titulo: "Facturar y cobrar",
    resumen: "Qué lleva una factura, la retención, dónde se hacen y qué hacer cuando no pagan.",
    minutos: 6,
    esencial: true,
    actualizadoEl: "2026-10-05",
    secciones: [
      { titulo: "Antes de la primera", bloques: [parrafo("Para cobrar una collab hay que emitir factura. Si aún no estás dada de alta como autónoma o con una sociedad, habla con Astratic o con una gestoría antes de aceptar la primera.")] },
      {
        titulo: "Lo que lleva una factura",
        bloques: [
          lista(
            "Tus datos fiscales y los de quien paga, la marca o Astratic en las collabs de la red.",
            "El concepto, con la campaña y las piezas.",
            "La base, el IVA (el 21 % en general) y la retención de IRPF si te toca.",
            "El vencimiento y el IBAN donde te pagan.",
          ),
        ],
      },
      { titulo: "La retención", bloques: [parrafo("Si tu actividad lleva retención, quien te paga se queda el 15 % para Hacienda, o el 7 % el año en que empiezas y los dos siguientes. Tu gestoría te dice si es tu caso.")] },
      { titulo: "Dónde se hacen", bloques: [parrafo("El workspace no emite facturas. Las haces con tu programa de facturación y aquí las apuntas con su PDF para seguirlas hasta cobrarlas. Desde 2027 esos programas tienen que cumplir Verifactu, las sociedades desde enero y las autónomas desde julio.")] },
      { titulo: "Cuando no pagan", bloques: [parrafo("En Cobros ves lo vencido nada más entrar. «Reclamar el pago» te abre el email ya escrito, con la factura y el importe, y deja apuntado cuándo lo reclamaste."), consejo("Pon tus datos fiscales y tu IBAN en Ajustes una vez. Salen solos en los datos para copiar de cada factura."), enlace("Ir a Cobros", "/workspace/cobros")] },
    ],
  },
  {
    id: "la-red",
    titulo: "Trabajar con la red de Astratic",
    resumen: "Cómo llegan las collabs de la red, cómo se cobran y qué pasa con tus marcas.",
    minutos: 4,
    actualizadoEl: "2026-09-20",
    secciones: [
      { titulo: "Cómo funciona", bloques: [parrafo("Astratic presenta perfiles de la red a marcas. Cuando una te elige, la collab entra en tu workspace como «De la red». Astratic factura a la marca y tú le facturas a Astratic tu 80 %.")] },
      { titulo: "Tus marcas siguen siendo tuyas", bloques: [parrafo("Las marcas que traes tú quedan registradas a tu nombre durante 12 meses, y lo ves en la ficha de cada una en el CRM. Además, no hay exclusiva. Puedes trabajar con quien quieras, también fuera de la red.")] },
      { titulo: "La auditoría", bloques: [parrafo("Cada pocos meses Astratic revisa tu perfil, te pone un tramo y un CPM de referencia y te deja una lista de mejoras. La tienes en Perfil y tarifas, y cada mejora se marca al hacerla."), consejo("Si tus cifras cambian mucho, pide que te adelanten la auditoría. Con un tramo nuevo se revisan tus tarifas."), enlace("Ver tu auditoría", "/workspace/perfil/auditoria")] },
    ],
  },
]

/** La lista de antes de publicar cualquier pieza de una collab. */
export const demoAntesDePublicar: string[] = [
  "La marca ha aprobado esta versión, la del vídeo y la del texto.",
  "Se ve que es publicidad, con «publi» o la etiqueta de colaboración pagada.",
  "Están las menciones, los hashtags y el código que pide el brief.",
  "El enlace de la bio o de la story lleva a donde dice la marca.",
  "La fecha y la hora son las pactadas.",
  "Has guardado el archivo final por si la marca lo pide después.",
]

/** Lo que ya ha leído la creadora de ejemplo. */
export const demoLecturasBiblia: LecturasBiblia = { "perfil-y-bio": "2026-06-11", "como-te-encuentran": "2026-06-11", "la-red": "2026-06-12" }
