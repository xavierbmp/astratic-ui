import Link from "next/link"
import {
  ArchiveIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  CopyIcon,
  DownloadIcon,
  EllipsisIcon,
  LayersIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
} from "lucide-react"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ViewSwitcher } from "@/components/app/toolbar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const metadata = { title: "Botones" }

const variants = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const
const sizes = ["xs", "sm", "default", "lg"] as const
const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const

const matrix = `<Button><PlusIcon /> Nuevo registro</Button>
<Button variant="outline" size="sm"><DownloadIcon /> Exportar</Button>
<Button variant="ghost" size="xs">Ver todas</Button>
<Button variant="ghost" size="icon-sm" aria-label="Más acciones"><EllipsisIcon /></Button>`

const named = `<Button><PlusIcon /> Nuevo registro</Button>
<Button variant="outline"><DownloadIcon /> Exportar</Button>
<Button variant="outline"><LayersIcon /> Editar fases</Button>
<Button variant="ghost" size="sm"><ArrowRightIcon /> Avanzar fase</Button>
<Button variant="ghost" size="icon-sm" aria-label="Más acciones"><EllipsisIcon /></Button>
<Button variant="ghost" size="xs" asChild>
  <Link href="/demo/registros">Ver registros <ArrowUpRightIcon /></Link>
</Button>
<Button variant="link" asChild>
  <Link href="/demo/registros">Ver todos los registros</Link>
</Button>
<Button disabled><SaveIcon /> Guardando…</Button>`

const groups = `<ViewSwitcher views={["table", "list", "kanban"]} value={view} onChange={setView} />

<Tabs value={period} onValueChange={setPeriod}>
  <TabsList>
    <TabsTrigger value="mes">Mes</TabsTrigger>
    <TabsTrigger value="trimestre">Trimestre</TabsTrigger>
    <TabsTrigger value="ano">Año</TabsTrigger>
  </TabsList>
</Tabs>

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline"><EllipsisIcon /> Más acciones</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={duplicate}><CopyIcon /> Duplicar</DropdownMenuItem>
    <DropdownMenuItem onClick={archive}><ArchiveIcon /> Archivar</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive" onClick={() => setConfirm(true)}><Trash2Icon /> Eliminar</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`

export default function ButtonsPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Botones"
      lead="El Button de shadcn tal cual: seis variantes, cuatro tamaños de texto y cuatro de icono. Lo que fija el sistema es la jerarquía: una acción principal negra por página y el resto en outline, ghost o link."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Cualquier acción que el usuario ejecuta con un clic es un botón. Navegar es un enlace, aunque se vea como
            botón (<code>variant=&quot;link&quot;</code> o <code>asChild</code> con <code>Link</code>). Dónde va cada
            variante dentro de la página está en{" "}
            <Link href="/ds/patrones/convenciones#botones">Convenciones</Link>; aquí, el componente y cómo se nombra.
          </p>
        </Prose>
        <Rules
          items={[
            <>
              <strong>Una acción principal por página</strong>, <code>variant=&quot;default&quot;</code> (negro):
              crear el registro que la página gestiona. Va al final de la toolbar.
            </>,
            <>
              <strong>Outline</strong> para las secundarias con peso (Exportar, Editar fases, Configurar) en las
              acciones de página, en cabeceras de sección y en la cabecera del sheet.
            </>,
            <>
              <strong>Ghost</strong> dentro de listas y barras: acciones de fila, barra de selección, «Ver todas».
              Icono ghost para el menú «…» y para cerrar.
            </>,
            <>
              <strong>Destructive</strong> solo dentro de <code>ConfirmDialog</code>, que lo aplica con la prop{" "}
              <code>destructive</code>. Nunca un botón rojo suelto en la página.
            </>,
            <>
              <strong>Link</strong> para navegar desde texto. Con <code>asChild</code> y <code>Link</code> de Next
              para que sea un enlace real.
            </>,
            <>
              <strong>Secondary</strong> apenas se usa: queda para botones dentro de superficies ya grises (un pie de
              diálogo, una tarjeta muted) donde el outline no se distingue.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example title="Variantes por tamaños" description="Cada fila es una variante; cada columna, un tamaño: xs, sm, default, lg y los cuatro de icono." code={matrix}>
          <div className="flex flex-col gap-3">
            {variants.map((v) => (
              <div key={v} className="flex flex-wrap items-center gap-2">
                <span className="w-24 shrink-0 font-mono text-[11px] text-muted-foreground">{v}</span>
                {sizes.map((s) => (
                  <Button key={s} variant={v} size={s}>
                    <PlusIcon /> Nuevo registro
                  </Button>
                ))}
                {iconSizes.map((s) => (
                  <Button key={s} variant={v} size={s} aria-label="Más acciones">
                    <EllipsisIcon />
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </Example>

        <Example title="Bien nombrados" description="Icono lucide + verbo + objeto. Enlaces con asChild. La flecha de salir a otra página es la única que va detrás." code={named}>
          <div className="flex flex-wrap items-center gap-2">
            <Button>
              <PlusIcon /> Nuevo registro
            </Button>
            <Button variant="outline">
              <DownloadIcon /> Exportar
            </Button>
            <Button variant="outline">
              <LayersIcon /> Editar fases
            </Button>
            <Button variant="ghost" size="sm">
              <ArrowRightIcon /> Avanzar fase
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Más acciones">
              <EllipsisIcon />
            </Button>
            <Button variant="ghost" size="xs" asChild>
              <Link href="/demo/registros">
                Ver registros <ArrowUpRightIcon />
              </Link>
            </Button>
            <Button variant="link" asChild>
              <Link href="/demo/registros">Ver todos los registros</Link>
            </Button>
            <Button disabled>
              <SaveIcon /> Guardando…
            </Button>
          </div>
        </Example>

        <Example title="Grupos" description="ViewSwitcher para elegir una vista, Tabs para segmentar y DropdownMenu para «más acciones». Los dos primeros comparten forma: control segmentado gris con el activo en blanco." code={groups}>
          <div className="flex flex-wrap items-center gap-4">
            <ViewSwitcher views={["table", "list", "kanban"]} defaultValue="table" />
            <Tabs defaultValue="mes">
              <TabsList>
                <TabsTrigger value="mes">Mes</TabsTrigger>
                <TabsTrigger value="trimestre">Trimestre</TabsTrigger>
                <TabsTrigger value="ano">Año</TabsTrigger>
              </TabsList>
            </Tabs>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <EllipsisIcon /> Más acciones
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <CopyIcon /> Duplicar
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArchiveIcon /> Archivar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <Trash2Icon /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              <strong>Icono lucide + verbo + objeto:</strong> «Nuevo registro», «Exportar», «Avanzar fase». Nunca
              «OK», «Aceptar», «Click aquí».
            </>,
            <>
              El icono va <strong>siempre delante</strong> del verbo. La única excepción es la flecha de «siguiente» o
              de salir a otra página (<code>ArrowRightIcon</code>, <code>ArrowUpRightIcon</code>), que va detrás.
            </>,
            <>
              El tamaño del icono lo pone el botón: 16 px (<code>size-4</code>) en <code>default</code> y{" "}
              <code>lg</code>, 14 px (<code>size-3.5</code>) en <code>sm</code>, 12 px en <code>xs</code>. No se añade{" "}
              <code>size-*</code> al icono salvo para corregir un caso concreto.
            </>,
            <>
              Los botones de icono llevan <code>aria-label</code> obligatorio y <code>size=&quot;icon-*&quot;</code>.
              Los de texto no llevan tooltip.
            </>,
            <>
              <code>disabled</code> mientras se envía o cuando la acción no aplica. El texto cambia a gerundio
              («Guardando…») si la espera puede pasar de un segundo.
            </>,
            <>
              <code>asChild</code> para enlaces: el botón se convierte en el <code>a</code> de <code>Link</code>,
              navegable con teclado y abrible en otra pestaña.
            </>,
            <>
              Grupos: <code>ViewSwitcher</code> para elegir una vista, <code>Tabs</code> para segmentar contenido y{" "}
              <code>DropdownMenu</code> para «más acciones». Nunca una fila de botones outline pegados a mano.
            </>,
          ]}
        />
        <SpecTable
          columns={["Tamaño", "Altura", "Icono", "Dónde"]}
          rows={[
            [<code key="s">xs</code>, "24 px", "12 px", "«Ver todas» en cabeceras de sección, acciones dentro de chips y celdas densas."],
            [<code key="s">sm</code>, "28 px", "14 px", "Tablas, barra de selección, cabecera del sheet, cabeceras de sección."],
            [<code key="s">default</code>, "32 px", "16 px", "Toolbar, acciones de página, pies de sheet y de diálogo."],
            [<code key="s">lg</code>, "36 px", "16 px", "Pantallas de bienvenida y onboarding. Poco frecuente."],
            [<code key="s">icon-xs · icon-sm · icon · icon-lg</code>, "24 · 28 · 32 · 36 px", "12 · 16 · 16 · 16 px", "Menú «…», cerrar, conmutador de vistas. Siempre con aria-label."],
          ]}
        />
        <DoDont
          dos={[
            "Un botón negro por página, al final de la toolbar.",
            "<Button variant=\"outline\"><DownloadIcon /> Exportar</Button>",
            "Ghost sm con icono dentro de la barra de selección.",
            "Button asChild + Link para navegar.",
          ]}
          donts={[
            "Botones azules, verdes o de marca para acciones.",
            "Texto sin icono, o icono detrás del texto.",
            "Botón destructivo suelto en la página.",
            "«Aceptar», «OK», «Click aquí».",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <Prose>
          <p>
            Es el <code>Button</code> de shadcn sin cambios: <code>variant</code>, <code>size</code>,{" "}
            <code>asChild</code> y las props de <code>button</code>. La referencia completa está en{" "}
            <a href="https://ui.shadcn.com/docs/components/button" target="_blank" rel="noreferrer">
              ui.shadcn.com/docs/components/button
            </a>
            . <code>buttonVariants</code> se exporta para aplicar el estilo a otros elementos, como hace{" "}
            <code>ConfirmDialog</code> con la acción destructiva.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add button" />
        <Prose>
          <p>
            Viene con cualquier proyecto iniciado con shadcn. Los ítems del registry que lo necesitan lo declaran como{" "}
            <code>registryDependencies</code>, así que se instala solo con ellos.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "Qué variante va en cada sitio de la página." },
            { href: "/ds/componentes/toolbar", label: "Toolbar", text: "La acción principal y el conmutador de vistas." },
            { href: "/ds/componentes/feedback", label: "Feedback", text: "El botón destructivo dentro del diálogo." },
            { href: "/ds/fundamentos/iconos", label: "Iconos", text: "Lucide, tamaños y cuándo va un icono." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
