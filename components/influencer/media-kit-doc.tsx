import Image from "next/image"
import { BadgeCheckIcon, EyeIcon, HeartIcon, MailIcon, MapPinIcon, ShieldCheckIcon, UsersIcon, type LucideIcon } from "lucide-react"
import { cn } from "cn"
import { fmt } from "@/lib/format"
import { FORMATOS, type BloqueMediaKit, type MediaKit, type Perfil } from "@/lib/influencer/modelo"
import { cifrasDelPerfil, hojasDelMediaKit, presupuestoDelKit, type ContextoHojas } from "@/lib/influencer/media-kit"
import { tintClass, tintFor, tintSoftClass, tintTextClass, type Tint } from "@/lib/influencer/tints"
import { BrandMark } from "@/components/influencer/brand-mark"
import { seVe } from "@/lib/bloques"
import { nombreMes, soloFecha } from "@/lib/influencer/fechas"
import { SocialIcon, socialLabel } from "@/components/app/social-icons"
import { DocNotice, DocSimpleSection, DocTable, DocText } from "@/components/document/simple"
import { DocInfluencerSheet } from "@/components/influencer/doc-sheet"
import { AvatarInitials } from "@/components/app/avatar-initials"

type Props = {
  perfil: Perfil
  kit: MediaKit
  /** Los bloques a enseñar, en orden (`bloquesVisibles`). */
  bloques: BloqueMediaKit[]
  marcasTrabajadas: string[]
  /** El logo de cada marca con la que ha trabajado, por su nombre (las que no lo tienen, con sus iniciales). */
  logos?: Record<string, string | undefined>
  /** Texto del pie de cada hoja. */
  pie: string
}

/** El color de cada red en su tarjeta, como en el Inicio. */
const TINTE_RED: Record<string, Tint> = { instagram: "lavender", youtube: "rose", tiktok: "sky", linkedin: "sky" }

/**
 * El media kit en hojas A4, como un documento de diseño (Xavier, 2026-10-14): la portada con su imagen ancha y la
 * foto encima, como en LinkedIn; cada red en su tarjeta; y en cada bloque solo lo que no se ha escondido (`ocultos`).
 * Cada bloque visible va en el orden elegido, repartido en hojas sin partir ninguno. Lo usan el editor (vista previa),
 * `/media-kit` y el documento de cada propuesta.
 */
export function MediaKitHojas({ perfil, kit, bloques, marcasTrabajadas, logos, pie }: Props) {
  return (
    <>
      {hojasDelMediaKit(bloques, { perfil, kit, marcasTrabajadas }).map((hoja, i) => (
        <DocInfluencerSheet key={i} nombre={perfil.nombre} handle={perfil.handle} footer={pie}>
          {hoja.map((b) => (
            <BloqueDoc key={b} bloque={b} perfil={perfil} kit={kit} marcasTrabajadas={marcasTrabajadas} logos={logos} />
          ))}
        </DocInfluencerSheet>
      ))}
    </>
  )
}

/** Cuántas hojas ocupa, para la numeración del pie y la barra del documento. */
export function hojasMediaKit(bloques: BloqueMediaKit[], ctx: ContextoHojas) {
  return hojasDelMediaKit(bloques, ctx).length
}

function BloqueDoc({ bloque, perfil, kit, marcasTrabajadas, logos }: { bloque: BloqueMediaKit; perfil: Perfil; kit: MediaKit; marcasTrabajadas: string[]; logos?: Record<string, string | undefined> }) {
  const cifras = cifrasDelPerfil(perfil)
  const ver = (clave: string) => seVe(kit, clave)
  switch (bloque) {
    case "portada": {
      const conImagen = ver("portada.imagen")
      const linea = [ver("portada.usuario") && perfil.handle, ver("portada.nicho") && perfil.nicho].filter(Boolean).join(" · ")
      return (
        <div className="mt-[22px]">
          {conImagen && (
            <div className="relative h-[150px] overflow-hidden rounded-2xl bg-tint-lavender">
              {kit.portadaUrl ? (
                <Image src={kit.portadaUrl} alt="" fill sizes="680px" className="object-cover" />
              ) : (
                <span aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,var(--tint-sky),transparent_55%),radial-gradient(circle_at_85%_80%,var(--tint-rose),transparent_55%)]" />
              )}
            </div>
          )}
          <div className={cn("flex items-end gap-5", conImagen ? "-mt-[48px] px-5" : "")}>
            {ver("portada.foto") &&
              (kit.fotoUrl || perfil.fotoUrl ? (
                <span className="relative size-[112px] flex-none overflow-hidden rounded-full bg-muted ring-[5px] ring-card">
                  <Image src={kit.fotoUrl || perfil.fotoUrl || ""} alt={perfil.nombre} fill sizes="112px" className="object-cover" />
                </span>
              ) : (
                <AvatarInitials name={perfil.nombre} size="xl" className="size-[112px] flex-none rounded-full text-4xl ring-[5px] ring-card" />
              ))}
            <div className="min-w-0 pb-1.5">
              <h1 className="flex items-center gap-2 text-[26px] leading-[1.15] font-semibold tracking-[-0.02em]">
                {perfil.nombre}
                {ver("contacto.sello") && <BadgeCheckIcon className="size-5 flex-none text-brand" aria-label="Perfil auditado por Astratic" />}
              </h1>
              {(linea || ver("portada.ciudad")) && (
                <p className="mt-1 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                  {linea}
                  {ver("portada.ciudad") && perfil.ciudad && (
                    <span className="inline-flex items-center gap-1">
                      {linea && "·"} <MapPinIcon className="size-3" /> {perfil.ciudad}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
          <div className={cn(conImagen && "px-5")}>
            {ver("portada.titular") && kit.titular && <p className="mt-4 max-w-[540px] text-[15px] leading-[1.45] font-semibold">{kit.titular}</p>}
            {ver("portada.bio") && kit.bio && <p className="mt-1.5 max-w-[560px] text-[12px] leading-[1.6] text-muted-foreground">{kit.bio}</p>}
          </div>
        </div>
      )
    }
    case "cifras": {
      const items = [
        ver("cifras.seguidores") && { label: "Seguidores", value: fmt.compact(cifras.seguidores), icono: UsersIcon, tint: "lavender" as const },
        ver("cifras.visualizaciones") && { label: "Visualizaciones medias", value: fmt.compact(cifras.visualizaciones), icono: EyeIcon, tint: "sky" as const },
        ver("cifras.interaccion") && { label: "Interacción media", value: fmt.pct(cifras.interaccion), icono: HeartIcon, tint: "rose" as const },
        ver("cifras.espana") && { label: "Audiencia en España", value: fmt.pct(perfil.audiencia.espana), icono: MapPinIcon, tint: "mint" as const },
      ].filter((x) => x !== false)
      return items.length ? (
        <dl className="mt-[22px] grid grid-cols-4 gap-2.5">
          {items.map((c) => (
            <CifraColor key={c.label} {...c} />
          ))}
        </dl>
      ) : null
    }
    case "redes": {
      const cuentas = perfil.cuentas.filter((c) => ver(`redes.${c.red}`))
      if (!cuentas.length) return null
      return (
        <DocSimpleSection title="Mis redes">
          <div className="mt-2.5 grid grid-cols-3 gap-3">
            {cuentas.map((c) => (
              <div key={c.red} className={cn("rounded-xl p-3.5", tintSoftClass[TINTE_RED[c.red] ?? "peach"])}>
                <p className="flex items-center gap-1.5 text-[12px] font-semibold">
                  <SocialIcon network={c.red} className={cn("size-3.5", tintTextClass[TINTE_RED[c.red] ?? "peach"])} /> {socialLabel[c.red]}
                </p>
                <p className="truncate text-[10.5px] text-muted-foreground">{c.handle}</p>
                <p className="mt-2.5 text-[24px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{fmt.compact(c.seguidores)}</p>
                <p className="mt-1 text-[10.5px] text-muted-foreground">{c.red === "youtube" ? "suscriptores" : "seguidores"}</p>
                {(ver("redes.visualizaciones") || ver("redes.interaccion")) && (
                  <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-foreground/10 pt-2.5">
                    {ver("redes.visualizaciones") && (
                      <div>
                        <dt className="text-[10px] text-muted-foreground">Views medias</dt>
                        <dd className="text-[13px] font-semibold tabular-nums">{c.visualizacionesMedias ? fmt.compact(c.visualizacionesMedias) : "—"}</dd>
                      </div>
                    )}
                    {ver("redes.interaccion") && (
                      <div>
                        <dt className="text-[10px] text-muted-foreground">Interacción</dt>
                        <dd className="text-[13px] font-semibold tabular-nums">{c.interaccion ? fmt.pct(c.interaccion) : "—"}</dd>
                      </div>
                    )}
                  </dl>
                )}
              </div>
            ))}
          </div>
          {ver("redes.visualizaciones") && <DocText muted className="mt-2">Visualizaciones medias de las últimas publicaciones orgánicas.</DocText>}
        </DocSimpleSection>
      )
    }
    case "audiencia": {
      const partes = [
        ver("audiencia.mujeres") && <Barra key="m" label="Mujeres" valor={perfil.audiencia.mujeres} tint="rose" />,
        ver("audiencia.espana") && <Barra key="e" label="En España" valor={perfil.audiencia.espana} tint="mint" />,
        ver("audiencia.edades") && (
          <div key="a">
            <p className="text-[11px] text-muted-foreground">Edad principal</p>
            <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em]">{perfil.audiencia.edades}</p>
          </div>
        ),
      ].filter(Boolean)
      if (!partes.length) return null
      return (
        <DocSimpleSection title="Audiencia">
          <div className="mt-2.5 grid grid-cols-3 gap-6">{partes}</div>
        </DocSimpleSection>
      )
    }
    case "destacados": {
      const destacados = kit.destacados.slice(0, 3).filter((d) => ver(`destacados.${d.id}`))
      if (!destacados.length) return null
      return (
        <DocSimpleSection title="Contenidos destacados">
          <div className="mt-2.5 grid grid-cols-3 gap-4">
            {destacados.map((d) => (
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
    }
    case "marcas": {
      const marcas = marcasTrabajadas.filter((m) => ver(`marcas.${m}`))
      if (!marcas.length) return null
      return (
        <DocSimpleSection title="Marcas con las que he trabajado">
          <div className="mt-2.5 grid grid-cols-4 gap-2">
            {marcas.map((m) => (
              <span key={m} className="flex min-w-0 items-center gap-2 rounded-xl border px-2.5 py-2">
                <BrandMark name={m} tint={tintFor(m)} logoUrl={logos?.[m]} size="sm" className="rounded-lg" />
                <span className="truncate text-[11.5px] font-medium">{m}</span>
              </span>
            ))}
          </div>
        </DocSimpleSection>
      )
    }
    case "tarifas": {
      const tarifas = perfil.tarifas.filter((t) => ver(`tarifas.${t.formato}`))
      if (!tarifas.length) return null
      return (
        <DocSimpleSection title="Tarifas de salida">
          <DocTable
            columns={[{ label: "Formato" }, { label: "Precio", className: "w-[110px] text-right" }]}
            rows={tarifas.map((t) => [FORMATOS[t.formato].label, <span key="p" className="block text-right tabular-nums">{fmt.eur(t.precio)}</span>])}
          />
          {ver("tarifas.nota") && <DocText muted className="mt-2">IVA aparte. Packs, derechos de uso, exclusividad y paid se presupuestan según la campaña.</DocText>}
        </DocSimpleSection>
      )
    }
    case "presupuesto": {
      const { lineas, pack, descuento } = presupuestoDelKit(kit, perfil)
      if (!lineas.length && !pack) return null
      const precio = (antes: number, final: number) =>
        descuento ? (
          <span className="block text-right tabular-nums">
            <span className="mr-1.5 text-muted-foreground line-through">{fmt.eur(antes)}</span>
            {fmt.eur(final)}
          </span>
        ) : (
          <span className="block text-right tabular-nums">{fmt.eur(final)}</span>
        )
      return (
        <DocSimpleSection title="Presupuesto">
          {lineas.length > 0 && (
            <DocTable
              columns={[{ label: "Entregable" }, { label: "Precio", className: "w-[150px] text-right" }]}
              rows={lineas.map((l) => [FORMATOS[l.formato].label, <span key="p">{precio(l.precio, l.final)}</span>])}
            />
          )}
          {pack && (
            <div className={cn("mt-3 flex items-center justify-between gap-4 rounded-xl px-4 py-3", tintClass.lavender)}>
              <span className="text-[13px] font-semibold">{pack.nombre}</span>
              <span className="text-[16px] font-semibold tracking-[-0.01em]">{precio(pack.precio, pack.final)}</span>
            </div>
          )}
          {descuento && <p className={cn("mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold", tintClass.mint)}>{fmt.pct(descuento)} de descuento</p>}
          {ver("presupuesto.nota") && <DocText muted className="mt-2">IVA aparte. Derechos de uso, exclusividad y paid se presupuestan según la campaña.</DocText>}
        </DocSimpleSection>
      )
    }
    case "contacto":
      if (!ver("contacto.email") && !ver("contacto.sello")) return null
      return (
        <DocSimpleSection title="Hablamos">
          {ver("contacto.email") && (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold">
              <MailIcon className="size-3.5" /> {perfil.email}
            </p>
          )}
          {ver("contacto.sello") && (
            <DocNotice tone="info" icon={ShieldCheckIcon} className="mt-3">
              Perfil auditado por Astratic Network: tramo {perfil.tramo}, cifras verificadas en {nombreMes(soloFecha(kit.actualizadoEl))}. Todo el contenido patrocinado se marca como publicidad según el código de Autocontrol.
            </DocNotice>
          )}
        </DocSimpleSection>
      )
  }
}

function Barra({ label, valor, tint }: { label: string; valor: number; tint: Tint }) {
  return (
    <div className={tintTextClass[tint]}>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.01em] text-foreground tabular-nums">{fmt.pct(valor)}</p>
      <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-current/15">
        <span className="block h-full rounded-full bg-current" style={{ width: `${valor}%` }} />
      </span>
    </div>
  )
}

/** Una cifra clave en su tarjeta de color, con su icono (Xavier, 2026-10-16: «más color, como en el Inicio»). */
function CifraColor({ label, value, icono: Icono, tint }: { label: string; value: string; icono: LucideIcon; tint: Tint }) {
  return (
    <div className={cn("rounded-xl px-3.5 py-3", tintSoftClass[tint])}>
      <dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icono className={cn("size-3.5", tintTextClass[tint])} aria-hidden /> {label}
      </dt>
      <dd className="mt-1 text-[20px] leading-none font-semibold tracking-[-0.02em] tabular-nums">{value}</dd>
    </div>
  )
}
