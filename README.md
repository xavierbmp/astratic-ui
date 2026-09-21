# Astratic UI

Design system y kit de arranque de **Astratic Network Devs** para portales operativos (CRM, campañas, facturación, equipo, eventos). Código real sobre Next.js 16, Tailwind v4 y shadcn/ui, basado en los mockups de la propuesta a Twic y generalizado para cualquier cliente.

Este repositorio es cuatro cosas a la vez:

| Qué | Dónde |
|---|---|
| Documentación del design system | `app/ds` → `/ds` |
| Demo: un mini-portal con datos genéricos | `app/demo` → `/demo` |
| Plantilla que se clona para un proyecto nuevo | `components/app`, `lib`, `hooks`, `app/globals.css` |
| Registry de shadcn para instalar piezas en proyectos existentes | `registry.json` → `public/r/*.json` |

## Arrancar

```bash
npm install
npm run dev -- --port 3020
```

- `/` hub · `/ds` documentación · `/demo` demo.
- `npm run typecheck` · `npm run lint` · `npm run registry:build` (genera `public/r`).

## Usar en un proyecto

**Nuevo:** clona este repo y sigue `content/nuevo-proyecto.md` (también en `/ds/nuevo-proyecto`).

**Existente:** instala el tema y luego las piezas que necesites.

```bash
npx shadcn@latest add https://ui.astraticnetwork.com/r/theme.json
npx shadcn@latest add https://ui.astraticnetwork.com/r/operations-page.json
```

## Estructura

```
app/
  globals.css          tokens (claro y oscuro), acento brand, colores de estado
  layout.tsx           Geist, ThemeProvider, Toaster
  ds/                  documentación
  demo/                mini-portal de ejemplo
components/
  ui/                  shadcn/ui (preset Nova sobre Radix)
  app/                 kit de aplicación: app-shell, page-header, page-tabs, kpi, section,
                       work-grid, toolbar, filter-bar, quick-filters, filter-builder,
                       column-settings, data-table, record-list, kanban, insights-panel,
                       detail-sheet, inline-field, multi-select, step-timeline, html-frame,
                       bulk-bar, status-badge, states, confirm-dialog, config-button,
                       avatar-initials, social-icons, theme-toggle
  docs/                componentes de la documentación y ejemplos en vivo
lib/                   format, status, nav, demo-data
hooks/                 use-page-view, use-local-storage, use-mobile
content/               nuevo-proyecto.md
registry.json          definición del registry
.claude/rules/         reglas que se copian a cada portal
```

## Reglas en una frase

Una página de operación es: cabecera, de 3 a 5 cifras, toolbar encima del bloque (buscador · filtros · vistas · acción principal), **un** bloque de operación y un panel de información a la derecha; el detalle se abre en una ficha lateral por bloques, editable en el sitio. No hay página de Ajustes: cada cosa se configura donde se usa. Si un módulo tiene subpáginas, van como pestañas en la cabecera. Todo lo demás está en `/ds/patrones/convenciones` y `/ds/patrones/navegacion`.
