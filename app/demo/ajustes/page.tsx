import { AjustesView, type SettingsValues } from "./ajustes-view"

export const metadata = { title: "Ajustes" }

const settings: SettingsValues = {
  name: "Portal Demo",
  email: "hola@empresa.com",
  description: "",
  language: "es",
  density: "comoda",
  notifyEmail: true,
  notifyDigest: false,
}

export default function AjustesPage() {
  return <AjustesView initialValues={settings} />
}
