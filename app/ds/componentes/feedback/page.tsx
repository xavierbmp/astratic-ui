import Link from "next/link"
import { TriangleAlertIcon } from "lucide-react"
import { DocPage, DocSection, DoDont, Example, NextLinks, Prose, Rules, SpecTable } from "@/components/docs/doc"
import { CodeBlock } from "@/components/docs/code-block"
import { ConfirmDialogDemo, ToastDemo } from "@/components/docs/examples/feedback-demo"
import { Alert, AlertAction, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export const metadata = { title: "Feedback" }

const toasts = `import { toast } from "sonner"

toast.success("Registro guardado")

toast.error("No se ha podido guardar el registro", {
  description: error.message,
})

toast.success("Registro archivado", {
  action: { label: "Deshacer", onClick: () => restore(id) },
})

toast.success("Exportación preparada", {
  description: "24 registros en CSV. El enlace caduca en 24 horas.",
})`

const confirm = `const [confirm, setConfirm] = React.useState(false)

<DropdownMenuItem variant="destructive" onClick={() => setConfirm(true)}>
  <Trash2Icon /> Eliminar
</DropdownMenuItem>

<ConfirmDialog
  open={confirm}
  onOpenChange={setConfirm}
  title={\`¿Eliminar \${record.name}?\`}
  description="Se borrará de forma permanente junto con su actividad y sus archivos. Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  destructive
  onConfirm={async () => {
    await deleteRecord(record.id)
    toast.success(\`\${record.name} eliminado\`)
  }}
/>`

const alert = `<PageBody>
  <PageHeader title="Registros" description="…" />
  <KpiRow>…</KpiRow>
  {!settings.senderEmail && (
    <Alert>
      <TriangleAlertIcon />
      <AlertTitle>Falta configurar el remitente de los avisos. Hasta entonces no se envía ningún email.</AlertTitle>
      <AlertAction>
        <Button variant="outline" size="xs" asChild>
          <Link href="/ajustes/notificaciones">Configurar</Link>
        </Button>
      </AlertAction>
    </Alert>
  )}
  <Toolbar>…</Toolbar>
  <WorkGrid>…</WorkGrid>
</PageBody>`

export default function FeedbackPage() {
  return (
    <DocPage
      eyebrow="Componentes"
      title="Feedback"
      lead="Cómo responde el portal a lo que hace el usuario: un toast para confirmar, un diálogo para lo irreversible y una alerta para lo que sigue pendiente. Nada de alert, confirm ni avisos de texto en la toolbar."
    >
      <DocSection id="uso" title="Cuándo se usa">
        <Prose>
          <p>
            Cada situación tiene un mecanismo y solo uno. Un toast confirma o avisa de algo que acaba de pasar y
            desaparece solo. Un <code>ConfirmDialog</code> frena una acción irreversible antes de ejecutarla. Un{" "}
            <code>Dialog</code> recoge datos para crear o editar. Un <code>Alert</code> se queda en la página mientras
            dure un problema de configuración.
          </p>
        </Prose>
        <SpecTable
          columns={["Situación", "Mecanismo", "Ejemplo"]}
          rows={[
            ["Acción completada", <code key="m">toast.success</code>, "«Registro guardado»"],
            ["Acción reversible completada", <code key="m">toast.success + action «Deshacer»</code>, "«Registro archivado» · Deshacer"],
            ["Acción que falla", <code key="m">toast.error + description</code>, "«No se ha podido guardar» y el mensaje del servidor"],
            ["Aviso sin consecuencias", <code key="m">toast</code>, "«Enlace copiado»"],
            ["Acción irreversible (eliminar, enviar a muchos, cobrar)", <code key="m">ConfirmDialog</code>, "«¿Eliminar 3 registros?» con destructive"],
            ["Crear o editar un registro", <code key="m">Dialog de 480 px</code>, "«Nuevo registro» (ver Formularios)"],
            ["Configuración incompleta que afecta a la página", <code key="m">Alert persistente</code>, "«Falta configurar el remitente» + Configurar"],
            ["Bloque que carga o falla", <code key="m">Skeleton · ErrorState</code>, "«No se ha podido cargar» + Reintentar (ver Estados)"],
          ]}
        />
      </DocSection>

      <DocSection id="ejemplo" title="Ejemplo">
        <Example title="Toasts" description="Abajo a la derecha, cuatro segundos. Texto en pasado con el objeto." code={toasts} lang="ts">
          <ToastDemo />
        </Example>
        <Example title="Confirmación destructiva" description="onConfirm es async: los dos botones se deshabilitan hasta que termina y el diálogo se cierra solo." code={confirm}>
          <ConfirmDialogDemo />
        </Example>
        <Example title="Alerta de configuración incompleta" description="Una línea, icono de aviso y la acción que lo resuelve a la derecha. Va entre las cifras y la toolbar." code={alert}>
          <Alert>
            <TriangleAlertIcon />
            <AlertTitle>Falta configurar el remitente de los avisos. Hasta entonces no se envía ningún email.</AlertTitle>
            <AlertAction>
              <Button variant="outline" size="xs" asChild>
                <Link href="/demo/ajustes">Configurar</Link>
              </Button>
            </AlertAction>
          </Alert>
        </Example>
      </DocSection>

      <DocSection id="reglas" title="Reglas">
        <Rules
          items={[
            <>
              Toasts abajo a la derecha (<code>Toaster position=&quot;bottom-right&quot;</code> en el layout raíz), 4
              segundos, uno por acción. Texto en pasado y con el objeto: «Registro archivado», «3 tareas completadas».
            </>,
            <>
              <code>toast.error</code> lleva el mensaje del servidor en <code>description</code>, tal cual llega. El
              título dice qué no se ha podido hacer.
            </>,
            <>
              Nunca <code>window.alert</code> ni <code>window.confirm</code>. Nunca avisos de texto en la toolbar ni
              encima de la tabla.
            </>,
            <>
              Confirmación solo para lo irreversible: eliminar, enviar a muchos destinatarios, cobrar. El título nombra
              lo que se borra y cuántos son; la descripción dice qué se pierde.
            </>,
            <>
              Lo reversible (archivar, completar, mover de fase) se ejecuta al momento y el toast ofrece «Deshacer».
              Sin diálogo.
            </>,
            <>
              <code>ConfirmDialog</code> con <code>destructive</code> cuando borra. <code>onConfirm</code> puede ser
              async: el diálogo deshabilita los dos botones mientras dura y se cierra al terminar.
            </>,
            <>
              Un <code>Alert</code> como máximo por página: una línea, <code>TriangleAlertIcon</code>, encima del
              bloque de operación y debajo de las cifras, con la acción que lo resuelve a la derecha. Desaparece
              cuando el problema se resuelve, no con una X.
            </>,
            <>
              El feedback de un formulario es el error bajo el campo, no un toast. El toast llega al guardar.
            </>,
          ]}
        />
        <DoDont
          dos={[
            "toast.success(\"Registro archivado\", { action: { label: \"Deshacer\", onClick } })",
            "ConfirmDialog destructive para eliminar, con el nombre de lo que se borra.",
            "Un Alert por página, con la acción que lo resuelve.",
            "toast.error con el mensaje del servidor en description.",
          ]}
          donts={[
            "window.confirm(\"¿Seguro?\")",
            "Toast que dura 10 segundos o no se cierra solo.",
            "Confirmación para archivar o completar.",
            "Texto rojo en la toolbar: «Hay 3 vencidos».",
          ]}
        />
      </DocSection>

      <DocSection id="props" title="Props">
        <div className="flex flex-col gap-2">
          <h3 className="font-mono text-[13px] font-semibold">ConfirmDialog</h3>
          <SpecTable
            columns={["Prop", "Tipo", "Descripción"]}
            rows={[
              ["open", <code key="t">boolean</code>, "Si está abierto. Controlado desde la página."],
              ["onOpenChange", <code key="t">(open: boolean) =&gt; void</code>, "Cancelar, Escape y clic fuera lo llaman con false."],
              ["title", <code key="t">ReactNode</code>, "Pregunta con el nombre de lo que se borra: «¿Eliminar Registro 7?»."],
              ["description", <code key="t">ReactNode</code>, "Qué se pierde y que no se puede deshacer."],
              ["confirmLabel", <code key="t">string · &quot;Confirmar&quot;</code>, "Verbo de la acción: «Eliminar», «Enviar», «Cobrar»."],
              ["destructive", <code key="t">boolean · false</code>, "Aplica buttonVariants({ variant: \"destructive\" }) al botón de confirmar."],
              ["onConfirm", <code key="t">() =&gt; void | Promise&lt;void&gt;</code>, "Se espera si es async; mientras, los dos botones quedan deshabilitados. Al resolver, cierra."],
            ]}
          />
        </div>
        <Prose>
          <p>
            <code>toast</code> es el de{" "}
            <a href="https://sonner.emilkowal.ski/toast" target="_blank" rel="noreferrer">
              sonner
            </a>{" "}
            (<code>success</code>, <code>error</code>, <code>description</code>, <code>action</code>);{" "}
            <code>Alert</code> y <code>Dialog</code> son los de shadcn:{" "}
            <a href="https://ui.shadcn.com/docs/components/alert" target="_blank" rel="noreferrer">
              alert
            </a>{" "}
            y{" "}
            <a href="https://ui.shadcn.com/docs/components/dialog" target="_blank" rel="noreferrer">
              dialog
            </a>
            .
          </p>
        </Prose>
      </DocSection>

      <DocSection id="instalar" title="Instalar">
        <CodeBlock lang="bash" code="npx shadcn@latest add https://ui.astraticnetwork.com/r/confirm-dialog.json" />
        <CodeBlock lang="bash" code="npx shadcn@latest add sonner alert dialog" />
        <Prose>
          <p>
            <code>Toaster</code> se monta una vez en el layout raíz: <code>&lt;Toaster position=&quot;bottom-right&quot; /&gt;</code>{" "}
            dentro del <code>ThemeProvider</code>, para que siga el tema.
          </p>
        </Prose>
      </DocSection>

      <DocSection id="siguiente" title="Relacionado">
        <NextLinks
          links={[
            { href: "/ds/componentes/forms", label: "Formularios", text: "El Dialog de 480 px y el error bajo el campo." },
            { href: "/ds/componentes/states", label: "Estados", text: "Cargando y error dentro del bloque." },
            { href: "/ds/componentes/bulk-bar", label: "Barra de selección", text: "Confirmar o deshacer sobre varios registros." },
            { href: "/ds/patrones/copy", label: "Copy y formato", text: "Cómo se escribe un toast y un mensaje de error." },
          ]}
        />
      </DocSection>
    </DocPage>
  )
}
