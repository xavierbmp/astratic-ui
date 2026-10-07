// Los campos por los que se filtra, se ordena y se agrupa el directorio de ideas y notas de
// Contenidos (constructor «Filtros», filtros rápidos y las vistas de la base). El estado se calcula:
// planificada o publicada sale del contenido que nació de la idea.
import type { CampoFiltrable } from "@/lib/filtros/core"
import { socialLabel, type SocialNetwork } from "@/components/app/social-icons"
import { ESTADOS_IDEA, FORMATOS, TIPOS_APUNTE, type Apunte, type Carpeta, type Contenido, type FechaClave, type Marca, type Pilar, type TipoApunte } from "@/lib/influencer/modelo"
import { caducaPronto, estadoDeIdea } from "@/lib/influencer/apuntes"
import { FORMATOS_PROPIOS } from "@/lib/influencer/planificacion"
import { opcionesDeCarpetas } from "@/lib/influencer/carpetas"
import { soloFecha } from "@/lib/influencer/fechas"

const REDES: SocialNetwork[] = ["instagram", "tiktok", "youtube"]

export type ContextoApuntes = { contenidos: Contenido[]; pilares: Pilar[]; carpetas: Carpeta[]; marcas: Marca[]; fechasClave: FechaClave[]; hoy: string }

export function camposApunte({ contenidos, pilares, carpetas, marcas, fechasClave, hoy }: ContextoApuntes): CampoFiltrable<Apunte>[] {
  return [
    { id: "titulo", label: "Título", tipo: "texto", grupo: "Datos", valor: (a) => a.titulo },
    { id: "tipo", label: "Tipo", tipo: "select", grupo: "Datos", opciones: (Object.keys(TIPOS_APUNTE) as TipoApunte[]).map((t) => ({ value: t, label: TIPOS_APUNTE[t] })), valor: (a) => a.tipo },
    { id: "estado", label: "Estado", tipo: "select", grupo: "Datos", opciones: ESTADOS_IDEA.map((e) => ({ value: e.id, label: e.label })), valor: (a) => estadoDeIdea(a, contenidos) },
    { id: "carpeta", label: "Carpeta", tipo: "select", grupo: "Datos", opciones: opcionesDeCarpetas(carpetas), valor: (a) => a.carpetaId ?? null },
    { id: "pilar", label: "Pilar", tipo: "select", grupo: "Contenido", opciones: pilares.map((p) => ({ value: p.id, label: p.nombre })), valor: (a) => a.pilarId ?? null },
    { id: "formato", label: "Formato", tipo: "select", grupo: "Contenido", opciones: FORMATOS_PROPIOS.map((f) => ({ value: f, label: FORMATOS[f].label })), valor: (a) => a.formato ?? null },
    { id: "redes", label: "Redes", tipo: "multiselect", grupo: "Contenido", opciones: REDES.map((r) => ({ value: r, label: socialLabel[r] })), valor: (a) => a.redes },
    { id: "marca", label: "Para la marca", tipo: "select", grupo: "Contenido", opciones: marcas.map((m) => ({ value: m.id, label: m.nombre })), valor: (a) => a.marcaId ?? null },
    { id: "fechaClave", label: "Fecha clave", tipo: "select", grupo: "Contenido", opciones: fechasClave.map((f) => ({ value: f.id, label: f.nombre })), valor: (a) => a.fechaClaveId ?? null },
    { id: "favorito", label: "Favorita", tipo: "booleano", grupo: "Datos", valor: (a) => a.favorito },
    { id: "caducaPronto", label: "Caduca pronto", tipo: "booleano", grupo: "Fechas", valor: (a) => caducaPronto(a, hoy) },
    { id: "caducaEl", label: "Caduca", tipo: "fecha", grupo: "Fechas", valor: (a) => a.caducaEl ?? null },
    { id: "referencias", label: "Referencias", tipo: "numero", grupo: "Datos", valor: (a) => a.referencias.length },
    { id: "actualizadoEl", label: "Editado", tipo: "fecha", grupo: "Fechas", valor: (a) => soloFecha(a.actualizadoEl) },
    { id: "creadoEl", label: "Creado", tipo: "fecha", grupo: "Fechas", valor: (a) => soloFecha(a.creadoEl) },
  ]
}
