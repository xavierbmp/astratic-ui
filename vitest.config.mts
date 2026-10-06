import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// Tests unitarios de la lógica pura (`lib/`): filtros, vistas, tareas. Sin navegador ni React.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: { include: ["tests/unit/**/*.test.ts"], environment: "node" },
})
