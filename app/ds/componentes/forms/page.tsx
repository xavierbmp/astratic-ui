import { SearchIcon } from "lucide-react"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { FormDemo } from "@/components/docs/examples/form-demo"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

export const metadata = { title: "Formularios" }

const dialogExample = `const schema = z.object({
  name: z.string().min(2, "Escribe el nombre del registro"),
  category: z.enum(["cat-a", "cat-b", "cat-c"], { error: "Elige una categoría" }),
  value: z.number({ error: "Escribe un importe" }).positive("El importe debe ser mayor que 0"),
  active: z.boolean(),
})
type Values = z.infer<typeof schema>

const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { name: "", active: true } })
const { register, handleSubmit, formState, watch, setValue, reset } = form
const { errors, isDirty, isSubmitting } = formState

const onSubmit = handleSubmit(async (values) => {
  await createRecord(values)
  toast.success(\`Registro «\${values.name}» creado\`)
  setOpen(false)
  reset()
})

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-[480px]">
    <DialogHeader>
      <DialogTitle>Nuevo registro</DialogTitle>
      <DialogDescription>Aparece en el listado en cuanto lo crees.</DialogDescription>
    </DialogHeader>
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <FieldGroup>
        <Field data-invalid={!!errors.name || undefined}>
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.category || undefined}>
          <FieldLabel htmlFor="category">Categoría</FieldLabel>
          <Select value={watch("category") ?? ""} onValueChange={(v) => setValue("category", v as Values["category"], { shouldDirty: true, shouldValidate: true })}>
            <SelectTrigger id="category" className="w-full" aria-invalid={!!errors.category}>
              <SelectValue placeholder="Elige una categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <FieldError errors={[errors.category]} />
        </Field>

        <Field data-invalid={!!errors.value || undefined}>
          <FieldLabel htmlFor="value">Valor</FieldLabel>
          <InputGroup>
            <InputGroupInput id="value" type="number" aria-invalid={!!errors.value} {...register("value", { valueAsNumber: true })} />
            <InputGroupAddon align="inline-end"><InputGroupText>€</InputGroupText></InputGroupAddon>
          </InputGroup>
          <FieldDescription>Importe sin impuestos.</FieldDescription>
          <FieldError errors={[errors.value]} />
        </Field>

        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="active">Activo</FieldLabel>
            <FieldDescription>Visible en el listado desde el primer momento.</FieldDescription>
          </FieldContent>
          <Switch id="active" checked={watch("active")} onCheckedChange={(c) => setValue("active", c, { shouldDirty: true })} />
        </Field>
      </FieldGroup>

      <DialogFooter>
        <Button type="button" variant="ghost" disabled={isSubmitting} onClick={() => setOpen(false)}>Cancelar</Button>
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          <PlusIcon /> {isSubmitting ? "Creando…" : "Crear registro"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>`

const anatomy = `<Field>
  <FieldLabel htmlFor="email">Email de contacto</FieldLabel>
  <Input id="email" type="email" placeholder="nombre@empresa.com" {...register("email")} />
  <FieldDescription>Se usa como remitente de los avisos.</FieldDescription>
  <FieldError errors={[errors.email]} />
</Field>`

const controls = `<Field>
  <FieldLabel htmlFor="language">Idioma</FieldLabel>
  <Select value={watch("language")} onValueChange={(v) => setValue("language", v, { shouldDirty: true })}>
    <SelectTrigger id="language" className="w-56"><SelectValue /></SelectTrigger>
    <SelectContent>
      <SelectItem value="es">Español</SelectItem>
      <SelectItem value="en">English</SelectItem>
    </SelectContent>
  </Select>
</Field>

<FieldSet>
  <FieldLegend variant="label">Densidad</FieldLegend>
  <FieldDescription>Cómo de compactas se muestran las tablas y listas.</FieldDescription>
  <RadioGroup value={watch("density")} onValueChange={(v) => setValue("density", v, { shouldDirty: true })} className="mt-2">
    <Field orientation="horizontal">
      <RadioGroupItem value="comoda" id="d-comoda" />
      <FieldLabel htmlFor="d-comoda" className="font-normal">Cómoda</FieldLabel>
    </Field>
    <Field orientation="horizontal">
      <RadioGroupItem value="compacta" id="d-compacta" />
      <FieldLabel htmlFor="d-compacta" className="font-normal">Compacta</FieldLabel>
    </Field>
  </RadioGroup>
</FieldSet>

<Field orientation="horizontal">
  <FieldContent>
    <FieldLabel htmlFor="notify">Avisos por email</FieldLabel>
    <FieldDescription>Un email por cada cambio relevante.</FieldDescription>
  </FieldContent>
  <Switch id="notify" checked={watch("notify")} onCheckedChange={(c) => setValue("notify", c, { shouldDirty: true })} />
</Field>

<Field orientation="horizontal">
  <Checkbox id="terms" checked={watch("terms")} onCheckedChange={(c) => setValue("terms", c === true, { shouldDirty: true })} />
  <FieldLabel htmlFor="terms" className="font-normal">He leído el aviso de tratamiento de datos</FieldLabel>
</Field>`

export default function FormsPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Formularios"
      lead="Field de shadcn para la estructura, sus controles para la entrada y react-hook-form con zod para el estado y la validación. El mismo patrón sirve para el diálogo de alta y para la página de ajustes."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Crear y editar registros sencillos se hace en un <code>Dialog</code> de 480 px con los campos en una
            columna. Los registros complejos tienen página propia con secciones. La configuración del portal va en la
            página de ajustes: navegación vertical a la izquierda y un <code>Section</code> con campos y pie de guardado.
          </p>
          <p>
            En los tres casos la estructura de cada campo es la misma: <code>Field</code> con{" "}
            <code>FieldLabel</code> encima, el control, <code>FieldDescription</code> debajo si hace falta y{" "}
            <code>FieldError</code> debajo cuando falla.
          </p>
        </Prose>
        <Rules
          items={[
            <>Label encima, ayuda debajo, error debajo. Siempre en ese orden y siempre visibles: nada en tooltip.</>,
            <>
              Un <code>Field</code> por dato. Los relacionados se agrupan en <code>FieldGroup</code> (20 px entre
              campos) y los excluyentes en <code>FieldSet</code> con <code>FieldLegend</code>.
            </>,
            <>
              <code>Field orientation=&quot;horizontal&quot;</code> solo para switches, checkboxes y radios: el
              control a un lado y el texto al otro.
            </>,
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example
          title="Nuevo registro en un Dialog de 480 px"
          description="Nombre requerido, dos selects, importe con addon, notas y un switch. Envía vacío para ver los errores; al crear, toast y cierre."
          code={dialogExample}
        >
          <FormDemo />
        </Example>

        <Example title="Anatomía de un campo" description="Label, control, ayuda y error. El error solo aparece cuando falla y sustituye visualmente a la ayuda si hace falta." code={anatomy}>
          <FieldGroup className="max-w-sm">
            <Field>
              <FieldLabel htmlFor="fx-name">Nombre</FieldLabel>
              <Input id="fx-name" defaultValue="Registro 1" />
            </Field>
            <Field>
              <FieldLabel htmlFor="fx-email">Email de contacto</FieldLabel>
              <Input id="fx-email" type="email" placeholder="nombre@empresa.com" />
              <FieldDescription>Se usa como remitente de los avisos.</FieldDescription>
            </Field>
            <Field data-invalid>
              <FieldLabel htmlFor="fx-code">Código</FieldLabel>
              <Input id="fx-code" aria-invalid defaultValue="reg 1" />
              <FieldError>Usa letras, números y guiones: REG-0001</FieldError>
            </Field>
          </FieldGroup>
        </Example>

        <Example title="Selects, radios, switches y checkboxes" description="Controlados con watch y setValue. El select suelto de ajustes mide w-56; en un diálogo, 100 %." code={controls}>
          <div className="grid gap-6 md:grid-cols-2">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="fx-language">Idioma</FieldLabel>
                <Select defaultValue="es">
                  <SelectTrigger id="fx-language" className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <FieldSet>
                <FieldLegend variant="label">Densidad</FieldLegend>
                <FieldDescription>Cómo de compactas se muestran las tablas y listas.</FieldDescription>
                <RadioGroup defaultValue="comoda" className="mt-2">
                  <Field orientation="horizontal">
                    <RadioGroupItem value="comoda" id="fx-comoda" />
                    <FieldLabel htmlFor="fx-comoda" className="font-normal">
                      Cómoda
                    </FieldLabel>
                  </Field>
                  <Field orientation="horizontal">
                    <RadioGroupItem value="compacta" id="fx-compacta" />
                    <FieldLabel htmlFor="fx-compacta" className="font-normal">
                      Compacta
                    </FieldLabel>
                  </Field>
                </RadioGroup>
              </FieldSet>
            </FieldGroup>
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="fx-notify">Avisos por email</FieldLabel>
                  <FieldDescription>Un email por cada cambio relevante.</FieldDescription>
                </FieldContent>
                <Switch id="fx-notify" defaultChecked />
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="fx-terms" />
                <FieldLabel htmlFor="fx-terms" className="font-normal">
                  He leído el aviso de tratamiento de datos
                </FieldLabel>
              </Field>
              <Field>
                <FieldLabel htmlFor="fx-notes">Notas</FieldLabel>
                <Textarea id="fx-notes" rows={2} placeholder="Contexto útil para quien lo retome" />
              </Field>
              <Field>
                <FieldLabel htmlFor="fx-search">Buscar</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <SearchIcon />
                  </InputGroupAddon>
                  <InputGroupInput id="fx-search" type="search" placeholder="Nombre o código" />
                </InputGroup>
              </Field>
              <Field>
                <FieldLabel htmlFor="fx-value">Valor</FieldLabel>
                <InputGroup>
                  <InputGroupInput id="fx-value" type="number" placeholder="12000" />
                  <InputGroupAddon align="inline-end">
                    <InputGroupText>€</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </div>
        </Example>

        <SpecTable
          columns={["Tipo de dato", "Control", "Notas"]}
          rows={[
            ["Texto corto (nombre, código)", <code key="c">Input</code>, "100 % de ancho dentro del diálogo o del grupo."],
            ["Texto largo (notas, descripción)", <code key="c">Textarea</code>, "rows={3}. Límite con .max(240) y el error dice el máximo."],
            ["Importe, cantidad, porcentaje", <code key="c">InputGroup + InputGroupInput type=&quot;number&quot;</code>, "Addon con la unidad («€», «%», «h») a la derecha. register(…, { valueAsNumber: true }) y z.number()."],
            ["Email", <code key="c">Input type=&quot;email&quot;</code>, "z.email(\"Escribe un email válido\")."],
            ["Fecha", <code key="c">Input type=&quot;date&quot;</code>, "Para rangos, Calendar dentro de un Popover."],
            ["Una opción entre pocas (2 a 4)", <code key="c">RadioGroup</code>, "Dentro de FieldSet con FieldLegend; cada opción en Field horizontal."],
            ["Una opción entre muchas", <code key="c">Select</code>, "w-56 suelto en ajustes; w-full en diálogos. Con placeholder en SelectValue si no hay valor."],
            ["Varias opciones", <code key="c">Checkbox</code>, "Una por opción, dentro de FieldSet con FieldLegend."],
            ["Sí / no como preferencia", <code key="c">Switch</code>, "Field horizontal con FieldContent para etiqueta y ayuda."],
            ["Aceptar algo (aviso, condiciones)", <code key="c">Checkbox</code>, "Field horizontal. Nunca un Switch para un consentimiento."],
            ["Búsqueda", <code key="c">InputGroup + SearchIcon</code>, "En la toolbar ya existe como ToolbarSearch."],
          ]}
        />
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              Label encima, ayuda debajo, error debajo. El placeholder es un ejemplo del formato
              («nombre@empresa.com»), nunca la etiqueta.
            </>,
            <>
              Botones del pie: «Cancelar» ghost + acción principal («Crear registro», «Guardar cambios»). La principal
              se deshabilita hasta que el formulario cambie (<code>isDirty</code>) y los dos mientras se envía (
              <code>isSubmitting</code>).
            </>,
            <>
              El esquema zod se comparte con el servidor: se define una vez en <code>lib/</code> y lo usan el{" "}
              <code>zodResolver</code> del cliente y la acción o ruta que guarda.
            </>,
            <>
              Los mensajes dicen qué hacer, no qué falló: «Escribe un email válido», «Elige una categoría», «Máximo
              240 caracteres». Van en el propio esquema.
            </>,
            <>
              Se valida al enviar, no al teclear la primera vez. <code>noValidate</code> en el <code>form</code> para
              que no salgan los avisos del navegador; <code>aria-invalid</code> en el control y{" "}
              <code>data-invalid</code> en el <code>Field</code> para el estilo de error.
            </>,
            <>
              Al guardar: <code>toast.success</code>, se cierra el diálogo y la fila afectada se actualiza en su sitio.
              Si el servidor falla, <code>toast.error</code> con su mensaje y el diálogo se queda abierto con los
              datos.
            </>,
            <>
              Anchos: inputs al 100 % dentro de diálogos y de los bloques de ajustes (con <code>max-w-xl</code> en el
              grupo); <code>w-56</code> para selects sueltos en ajustes. Nunca dos campos por fila en un diálogo de 480
              px.
            </>,
            <>
              <code>Input</code> y <code>Textarea</code> van con <code>register</code>. Selects, switches, radios y
              checkboxes son controlados: <code>watch</code> + <code>setValue(…, {"{ shouldDirty: true }"})</code>, o{" "}
              <code>Controller</code>.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "Label encima, error debajo del control.",
            "«Cancelar» ghost + «Crear registro».",
            "z.string().min(2, \"Escribe el nombre\")",
            "Dialog de 480 px con los campos en una columna.",
          ]}
          donts={[
            "Placeholder como única etiqueta.",
            "Validar mientras se escribe la primera vez.",
            "Mensaje «Campo inválido» o «Error».",
            "Dos columnas de campos en un diálogo.",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <Prose>
          <p>
            Todos son componentes de shadcn sin cambios. Referencia:{" "}
            <a href="https://ui.shadcn.com/docs/components/field" target="_blank" rel="noreferrer">
              field
            </a>
            ,{" "}
            <a href="https://ui.shadcn.com/docs/components/input" target="_blank" rel="noreferrer">
              input
            </a>
            ,{" "}
            <a href="https://ui.shadcn.com/docs/components/input-group" target="_blank" rel="noreferrer">
              input-group
            </a>
            ,{" "}
            <a href="https://ui.shadcn.com/docs/components/select" target="_blank" rel="noreferrer">
              select
            </a>
            ,{" "}
            <a href="https://ui.shadcn.com/docs/components/switch" target="_blank" rel="noreferrer">
              switch
            </a>
            ,{" "}
            <a href="https://ui.shadcn.com/docs/components/checkbox" target="_blank" rel="noreferrer">
              checkbox
            </a>
            ,{" "}
            <a href="https://ui.shadcn.com/docs/components/radio-group" target="_blank" rel="noreferrer">
              radio-group
            </a>
            ,{" "}
            <a href="https://ui.shadcn.com/docs/components/textarea" target="_blank" rel="noreferrer">
              textarea
            </a>{" "}
            y{" "}
            <a href="https://ui.shadcn.com/docs/components/dialog" target="_blank" rel="noreferrer">
              dialog
            </a>
            . Para el estado del formulario,{" "}
            <a href="https://react-hook-form.com/docs/useform" target="_blank" rel="noreferrer">
              react-hook-form
            </a>{" "}
            y{" "}
            <a href="https://zod.dev" target="_blank" rel="noreferrer">
              zod
            </a>
            .
          </p>
          <p>
            Dos detalles del kit: <code>FieldError</code> acepta <code>errors={"{[formState.errors.campo]}"}</code> y
            no renderiza nada si no hay error; <code>SelectTrigger</code> tiene <code>size=&quot;sm&quot;</code> para
            la edición inline en el sheet.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add field input input-group select switch checkbox radio-group textarea dialog" />
        <CodeBlock lang="bash" code="npm i react-hook-form @hookform/resolvers zod" />
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/feedback", label: "Feedback", text: "Toast al guardar, error del servidor." },
            { href: "/ds/componentes/detail-sheet", label: "Sheet de detalle", text: "Edición inline de fase y responsable." },
            { href: "/ds/patrones/convenciones", label: "Convenciones", text: "Las reglas de formularios en la página." },
            { href: "/ds/patrones/copy", label: "Copy y formato", text: "Cómo se escriben etiquetas, ayudas y errores." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
