import { describe, expect, it } from "vitest"
import { calendarioIcs } from "@/lib/influencer/ics"

describe("calendario .ics", () => {
  const ics = calendarioIcs({
    eventos: [{ id: "p1-publicacion", fecha: "2026-10-15", titulo: "Publicar, reel", contexto: "Lumea; Skin", tipo: "publicacion", href: "/workspace/collabs/lumea", hecho: false }],
    ahora: "2026-10-06T11:30:00",
    nombre: "Workspace",
    origen: "https://ws.test",
  })
  it("un evento de día entero por fecha, con fin al día siguiente", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20261015")
    expect(ics).toContain("DTEND;VALUE=DATE:20261016")
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true)
  })
  it("escapa comas y puntos y coma, y pliega las líneas largas", () => {
    expect(ics).toContain("SUMMARY:Publicar\\, reel · Lumea\\; Skin")
    expect(ics.split("\r\n").every((l) => l.length <= 75)).toBe(true)
  })
})
