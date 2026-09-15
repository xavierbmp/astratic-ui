import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { AvatarInitials, AvatarStack } from "@/components/app/avatar-initials"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const metadata = { title: "Avatares" }

const sizes = ["xs", "sm", "md", "lg", "xl"] as const

const example = `<AvatarInitials name="Usuario 1" size="md" />
<AvatarInitials name="Registro 12" size="md" variant="entity" />
<AvatarStack names={["Usuario 1", "Usuario 2", "Usuario 3", "Usuario 4", "Usuario 5"]} max={3} />`

const contexts = `<CellPrimary leading={<AvatarInitials name={r.name} variant="entity" />} title={r.name} subtitle={r.code} />

<span className="inline-flex items-center gap-2"><AvatarInitials name={r.owner} size="sm" /> {r.owner}</span>

<DetailHeader leading={<AvatarInitials name={record.name} size="lg" variant="entity" />} title={record.name} />

<AvatarInitials name={task.owner} size="xs" />`

const photo = `<Avatar size="lg">
  <AvatarImage src={user.photoUrl} alt={user.name} />
  <AvatarFallback>{initials(user.name)}</AvatarFallback>
</Avatar>`

function PropsTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="font-mono text-[13px] font-semibold">{children}</h3>
}

export default function AvatarsPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Avatares"
      lead="Iniciales sobre gris para personas y monograma sobre gris claro para registros y marcas, como en los mockups de la propuesta a Twic. El avatar identifica, no decora: nunca un color por persona."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Cualquier entidad que se repite en listas necesita un ancla visual: la persona responsable, el registro, la
            marca del cliente. <code>AvatarInitials</code> saca las iniciales del nombre con <code>initials()</code> de{" "}
            <code>lib/format.ts</code>: la primera letra de las dos primeras palabras, o la letra y el número si la
            segunda palabra es un número («Registro 12» da «R12»). <code>AvatarStack</code> apila varios con un «+N».
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Personas:</strong> <code>variant=&quot;person&quot;</code>, el valor por defecto. Iniciales sobre un
              gris un punto más oscuro que las superficies (<code>bg-foreground/[0.07]</code>), así se distinguen de las
              marcas sin usar color.
            </>,
            <>
              <strong>Registros y marcas:</strong> <code>variant=&quot;entity&quot;</code>. Cuadrado sobre{" "}
              <code>bg-muted</code> con el texto a 11 px en el tamaño <code>md</code>, igual que los logos de marca del kit
              de Twic.
            </>,
            <>
              <strong>Fotos reales</strong> solo en la ficha completa, con <code>Avatar</code> de shadcn y{" "}
              <code>AvatarFallback</code> con las iniciales.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example title="Los cinco tamaños, las dos variantes y una pila" description="xs 20 px · sm 24 px · md 32 px · lg 48 px · xl 64 px. El radio crece con el tamaño. Primera fila, personas; segunda, registros." code={example}>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end gap-4">
              {sizes.map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <AvatarInitials name="Usuario 1" size={s} />
                  <span className="font-mono text-[11px] text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-end gap-4">
              {sizes.map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <AvatarInitials name="Registro 12" size={s} variant="entity" />
                  <span className="font-mono text-[11px] text-muted-foreground">{s}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <AvatarStack names={["Usuario 1", "Usuario 2", "Usuario 3", "Usuario 4", "Usuario 5"]} />
              <AvatarStack names={["Usuario 1", "Usuario 2"]} size="md" />
              <AvatarStack names={["Usuario 1", "Usuario 2", "Usuario 3", "Usuario 4"]} max={2} size="xs" />
            </div>
          </div>
        </Example>

        <Example title="En contexto" description="Monograma de registro en la celda principal y en la cabecera del sheet; iniciales de persona junto al nombre del responsable." code={contexts}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <AvatarInitials name="Registro 12" size="md" variant="entity" />
              <span className="grid leading-tight">
                <span className="text-[13.5px] font-semibold">Registro 12</span>
                <span className="text-xs text-muted-foreground">REG-0012</span>
              </span>
            </div>
            <span className="inline-flex items-center gap-2 text-sm">
              <AvatarInitials name="Usuario 2" size="sm" /> Usuario 2
            </span>
            <div className="flex items-start gap-3">
              <AvatarInitials name="Registro 12" size="lg" variant="entity" />
              <span className="grid leading-tight">
                <span className="text-[15px] font-semibold">Registro 12</span>
                <span className="text-xs text-muted-foreground">REG-0012 · Categoría B</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              14 oct <AvatarInitials name="Usuario 3" size="xs" />
            </div>
          </div>
        </Example>

        <Example title="Foto real con fallback" description="Solo en la ficha. Avatar de shadcn: si la imagen no carga, se ven las iniciales." code={photo}>
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarImage src="" alt="Usuario 1" />
              <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <span className="grid leading-tight">
              <span className="text-[15px] font-semibold">Usuario 1</span>
              <span className="text-xs text-muted-foreground">Responsable de cuentas</span>
            </span>
          </div>
        </Example>

        <SpecTable
          columns={["Tamaño", "Píxeles", "Contexto"]}
          rows={[
            [<code key="s">xs</code>, "20 px", "Tarjetas kanban, campos del sheet, pies de tarjeta."],
            [<code key="s">sm</code>, "24 px", "Celdas secundarias («Responsable»), listas del panel de información, pilas."],
            [<code key="s">md</code>, "32 px", "Celda principal de la tabla (CellPrimary), listas, sidebar."],
            [<code key="s">lg</code>, "48 px", "Cabecera del sheet de detalle."],
            [<code key="s">xl</code>, "64 px", "Ficha de un registro o de una persona con página propia."],
          ]}
        />
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              Nunca colores por persona ni por inicial. El único contraste es el gris un punto más oscuro de las personas
              frente al gris claro de los registros y marcas.
            </>,
            <>
              El tamaño lo decide el contexto, no el gusto: <code>xs</code> en tarjetas kanban, <code>sm</code> en
              celdas secundarias y listas, <code>md</code> en la celda principal y el sidebar, <code>lg</code> en la
              cabecera del sheet, <code>xl</code> en la ficha.
            </>,
            <>
              Un avatar va acompañado del nombre salvo en <code>xs</code> y en pilas, donde <code>title</code> y{" "}
              <code>aria-label</code> hacen de tooltip nativo y de texto accesible.
            </>,
            <>
              <code>AvatarStack</code> con <code>max</code> 3 por defecto; a partir de ahí, «+N». Para más de seis
              personas, un contador con texto («8 participantes») dice más que una pila.
            </>,
            <>
              Fotos reales solo en la ficha, con <code>Avatar</code> de shadcn y <code>AvatarFallback</code> con las
              iniciales. Nunca fotos en tablas ni en tarjetas.
            </>,
            <>
              <code>AvatarInitials</code> es cuadrado con esquinas redondeadas; la foto de la ficha es circular. Por
              eso no se mezclan en la misma lista.
            </>,
            <>
              El único cuadrado negro del portal es el logo de la sidebar. Un registro nunca lleva monograma negro: competiría
              con el botón principal.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "AvatarInitials name={r.owner} size=\"sm\" junto al nombre.",
            "variant=\"entity\" para el monograma de un registro o una marca.",
            "AvatarStack names={contacts} max={3}.",
            "Avatar de shadcn con fallback de iniciales en la ficha.",
          ]}
          donts={[
            "Un color de fondo distinto por usuario.",
            "Monogramas negros o de color para registros.",
            "Fotos en celdas de tabla o en tarjetas kanban.",
            "Iniciales sin title ni aria-label cuando no hay nombre al lado.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <div className="flex flex-col gap-2">
          <PropsTitle>AvatarInitials</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["name", <code key="t">string</code>, "Nombre completo. Se usa para las iniciales, el title y el aria-label."],
              ["size", <code key="t">&quot;xs&quot; | &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot; | &quot;xl&quot; · &quot;md&quot;</code>, "20 · 24 · 32 · 48 · 64 px."],
              ["variant", <code key="t">&quot;person&quot; | &quot;entity&quot; · &quot;person&quot;</code>, "person para personas; entity para registros, marcas y cualquier cosa que no sea alguien."],
              ["className", <code key="t">string</code>, "Clases extra, por ejemplo ring-2 ring-background al apilar. Acepta las props de span."],
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PropsTitle>AvatarStack</PropsTitle>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["names", <code key="t">string[]</code>, "Nombres, en el orden en que se apilan."],
              ["max", <code key="t">number · 3</code>, "Cuántos se muestran antes del «+N»."],
              ["size", <code key="t">&quot;xs&quot; | &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot; | &quot;xl&quot; · &quot;sm&quot;</code>, "Tamaño de cada avatar de la pila."],
            ]}
          />
        </div>
        <Prose>
          <p>
            <code>initials(name)</code> se exporta desde <code>lib/format.ts</code> para usarla también en el{" "}
            <code>AvatarFallback</code> de shadcn (
            <a href="https://ui.shadcn.com/docs/components/avatar" target="_blank" rel="noreferrer">
              ui.shadcn.com/docs/components/avatar
            </a>
            ).
          </p>
        </Prose>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/avatar-initials.json" />
        <Prose>
          <p>
            Incluye <code>lib/format.ts</code>. Para las fotos de la ficha, además <code>npx shadcn@latest add avatar</code>.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/detail-sheet", label: "Sheet de detalle", text: "El monograma lg en la cabecera." },
            { href: "/ds/componentes/data-table", label: "Tabla de datos", text: "CellPrimary con el avatar md." },
            { href: "/ds/componentes/kanban", label: "Kanban", text: "El xs en el pie de cada tarjeta." },
            { href: "/ds/componentes/shell", label: "Shell de aplicación", text: "El usuario actual en el sidebar." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
