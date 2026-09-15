import type { LucideIcon } from "lucide-react"

export type NavItem = {
  id: string
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

export type NavGroup = {
  label?: string
  items: NavItem[]
}

export type Brand = {
  name: string
  tagline?: string
  monogram: string
}

export type CurrentUser = {
  name: string
  role: string
}
