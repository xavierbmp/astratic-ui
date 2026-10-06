import Image from "next/image"
import { MailIcon, ShieldCheckIcon } from "lucide-react"
import { fmt } from "@/lib/format"
import { FORMATOS, type BloqueMediaKit, type MediaKit, type Perfil } from "@/lib/influencer/modelo"
import { cifrasDelPerfil, hojasDelMediaKit } from "@/lib/influencer/media-kit"
import { nombreMes, soloFecha } from "@/lib/influencer/fechas"
import { SocialIcon, socialLabel } from "@/components/app/social-icons"
import { DocKeyFacts, DocNotice, DocSimpleSection, DocTable, DocText } from "@/components/document/simple"
import { DocInfluencerSheet } from "@/components/influencer/doc-sheet"

type Props = {
  perfil: Perfil
  kit: MediaKit
  /** Los bloques a enseñar, en orden (`bloquesVisibles`). */
  bloques: BloqueMediaKit[]
  marcasTrabajadas: string[]
  /** Texto del pie de cada hoja. */
  pie: string
}

/**
 * El media kit en hojas A4: cada bloque visible en el orden elegido, repartido en hojas sin partir
 * ninguno. Lo usan el editor (vista previa), `/media-kit` y el documento de cada propuesta.
 */
export function MediaKitHojas({ perfil, kit, bloques, marcasTrabajadas, pie }: Props) {
  return (
    <>
      {hojasDelMediaKit(bloques).map((hoja, i) => (
        <DocInfluencerSheet key={i} nombre={perfil.nombre} handle={perfil.handle} footer={pie}>
          {hoja.map((b) => (
            <BloqueDoc key={b} bloque={b} perfil={perfil} kit={kit} marcasTrabajadas={marcasTrabajadas} />
          ))}
        </DocInfluencerSheet>
      ))}
    </>
  )
}

/** Cuántas hojas ocupa, para la numeración del pie y la barra del documento. */
export function hojasMediaKit(bloques: BloqueMediaKit[]) {
  return hojasDelMediaKit(bloques).length
}

function BloqueDoc({ bloque, perfil, kit, marcasTrabajadas }: { bloque: BloqueMediaKit; perfil: Perfil; kit: MediaKit; marcasTrabajadas: string[] }) {
  const cifras = cifrasDelPerfil(perfil)
  switch (bloque) {
    case "portada":
      return (
        <div className="mt-[30px] flex items-start gap-6">
          <span className="relative size-[132px] flex-none overflow-hidden rounded-2xl bg-muted">
            <Image src={perfil.fotoUrl} alt={perfil.nombre} fill sizes="132px" className="object-cover" />
          </span>
          <div className="min-w-0 pt-1">
            <h1 className="text-[28px] leading-[1.15] font-semibold tracking-[-0.02em]">{perfil.nombre}</h1>
            <p className="mt-1 text-[12.5px] text-muted-foreground">
              {perfil.handle} · {perfil.nicho} · {perfil.ciudad}
            </p>
            <p className="mt-3 max-w-[470px] text-[14px] leading-[1.45] font-semibold">{kit.titular}</p>
            <p className="mt-1.5 max-w-[470px] text-[12px] leading-[1.6] text-muted-foreground">{kit.bio}</p>
          </div>
        </div>
      )
    case "cifras":
      return (
        <DocKeyFacts
          className="mt-[22px]"
          items={[
            { label: "Seguidores", value: fmt.compact(cifras.seguidores) },
            { label: "Visualizaciones medias", value: fmt.compact(cifras.visualizaciones) },
            { label: "Interacción media", value: fmt.pct(cifras.interaccion) },
            { label: "Audiencia en España", value: fmt.pct(perfil.audiencia.espana) },
          ]}
        />
      )
    case "redes":
      return (
        <DocSimpleSection title="Mis redes">
          <DocTable
            columns={[{ label: "Red" }, { label: "Seguidores", className: "w-[100px] text-right" }, { label: "Visualizaciones medias", className: "w-[150px] text-right" }, { label: "Interacción", className: "w-[90px] text-right" }]}
            rows={perfil.cuentas.map((c) => [
              <span key="r" className="inline-flex items-center gap-1.5 font-medium">
                <SocialIcon network={c.red} className="size-3" /> {socialLabel[c.red]} <span className="font-normal text-muted-foreground">{c.handle}</span>
              </span>,
              <span key="s" className="block text-right tabular-nums">{fmt.num(c.seguidores)}</span>,
              <span key="v" className="block text-right tabular-nums">{fmt.num(c.visualizacionesMedias)}</span>,
              <span key="i" className="block text-right tabular-nums">{fmt.pct(c.interaccion)}</span>,
            ])}
          />
          <DocText muted className="mt-2">Visualizaciones medias de las últimas publicaciones, sin contar las promocionadas.</DocText>
        </DocSimpleSection>
      )
    case "audiencia":
      return (
        <DocSimpleSection title="Audiencia">
          <div className="mt-2.5 grid grid-cols-3 gap-6">
            <Barra label="Mujeres" valor={perfil.audiencia.mujeres} />
            <Barra label="En España" valor={perfil.audiencia.espana} />
            <div>
              <p className="text-[11px] text-muted-foreground">Edad principal</p>
              <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em]">{perfil.audiencia.edades}</p>
            </div>
          </div>
        </DocSimpleSection>
      )
    case "destacados":
      return (
        <DocSimpleSection title="Contenidos destacados">
          <div className="mt-2.5 grid grid-cols-3 gap-4">
            {kit.destacados.slice(0, 3).map((d) => (
              <figure key={d.id} className="min-w-0">
                <span className="relative block aspect-[4/5] overflow-hidden rounded-xl bg-muted">
                  <Image src={d.imagenUrl} alt="" fill sizes="190px" className="object-cover" />
                </span>
                <figcaption className="mt-1.5">
                  <p className="truncate text-[11.5px] font-semibold">{d.titulo}</p>
                  <p className="truncate text-[10.5px] text-muted-foreground">
                    {socialLabel[d.red]} · {fmt.compact(d.visualizaciones)} visualizaciones{d.marca ? ` · ${d.marca}` : ""}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </DocSimpleSection>
      )
    case "marcas":
      return (
        <DocSimpleSection title="Marcas con las que he trabajado">
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {marcasTrabajadas.map((m) => (
              <span key={m} className="rounded-md border px-2 py-0.5 text-[11.5px] font-medium">
                {m}
              </span>
            ))}
          </div>
        </DocSimpleSection>
      )
    case "tarifas":
      return (
        <DocSimpleSection title="Tarifas de salida">
          <DocTable
            columns={[{ label: "Formato" }, { label: "Precio", className: "w-[110px] text-right" }]}
            rows={perfil.tarifas.map((t) => [FORMATOS[t.formato].label, <span key="p" className="block text-right tabular-nums">{fmt.eur(t.precio)}</span>])}
          />
          <DocText muted className="mt-2">IVA aparte. Packs, derechos de uso, exclusividad y paid se presupuestan según la campaña.</DocText>
        </DocSimpleSection>
      )
    case "contacto":
      return (
        <DocSimpleSection title="Hablamos">
          <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold">
            <MailIcon className="size-3.5" /> {perfil.email}
          </p>
          <DocNotice tone="info" icon={ShieldCheckIcon} className="mt-3">
            Perfil auditado por Astratic Network: tramo {perfil.tramo}, cifras verificadas en {nombreMes(soloFecha(kit.actualizadoEl))}. Todo el contenido patrocinado se marca como publicidad según el código de Autocontrol.
          </DocNotice>
        </DocSimpleSection>
      )
  }
}

function Barra({ label, valor }: { label: string; valor: number }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em] tabular-nums">{fmt.pct(valor)}</p>
      <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted">
        <span className="block h-full rounded-full bg-foreground" style={{ width: `${valor}%` }} />
      </span>
    </div>
  )
}
