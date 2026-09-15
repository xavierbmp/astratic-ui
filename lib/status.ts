export type StatusTone = "success" | "info" | "warning" | "danger" | "neutral"

export const statusToneClass: Record<StatusTone, string> = {
  success: "bg-success-soft text-success",
  info: "bg-info-soft text-info",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-secondary text-secondary-foreground",
}

export const statusDotClass: Record<StatusTone, string> = {
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-muted-foreground",
}

export const statusTextClass: Record<StatusTone, string> = {
  success: "text-success",
  info: "text-info",
  warning: "text-warning",
  danger: "text-danger",
  neutral: "text-muted-foreground",
}

export const statusMeaning: Record<StatusTone, string> = {
  success: "Hecho, activo, firmado, cobrado",
  info: "En curso, enviado, informativo",
  warning: "Pendiente, necesita atención, en pausa",
  danger: "Error, vencido, atrasado, descartado",
  neutral: "Borrador, nuevo, sin estado",
}
