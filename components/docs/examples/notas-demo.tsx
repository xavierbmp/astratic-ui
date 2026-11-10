"use client"

import { NotasClaude, nombreDeElemento, type NotaItem, type NotaNueva } from "@/components/app/notas-claude"

// La demo no guarda nada: las notas viven en memoria mientras la pestaña esté abierta. Datos inventados.
const hora = 3_600_000
let notas: NotaItem[] = [
  {
    id: "demo-1",
    texto: "Las tarifas de @creadora.demo: reel 450 €, story 120 €, TikTok 380 €.",
    autor: "Equipo",
    creada: new Date(Date.now() - 26 * hora).toISOString(),
    hecha: true,
    respuesta: "Apuntadas en su ficha de la base, en Tarifas.",
    respondida: new Date(Date.now() - 20 * hora).toISOString(),
    ruta: "/demo/correo?hilo=demo",
    pagina: "Correo · Demo",
    elemento: "Ficha del contacto",
  },
  {
    id: "demo-2",
    texto: "Esta marca ya trabaja con otra agencia: no volver a escribirle hasta enero.",
    autor: "Equipo",
    creada: new Date(Date.now() - 2 * hora).toISOString(),
    hecha: false,
    respuesta: null,
    respondida: null,
    ruta: "/demo/marcas",
    pagina: "Marcas · Demo",
    elemento: null,
  },
]

const espera = () => new Promise((ok) => setTimeout(ok, 300))

async function cargar() {
  await espera()
  return notas
}

async function enviar(n: NotaNueva) {
  await espera()
  notas = [...notas, { id: crypto.randomUUID(), texto: n.texto, autor: "Tú", creada: new Date().toISOString(), hecha: false, respuesta: null, respondida: null, ruta: n.ruta, pagina: n.pagina, elemento: n.elemento ? nombreDeElemento(n.elemento) : null }]
}

async function editar(id: string, texto: string) {
  await espera()
  notas = notas.map((n) => (n.id === id ? { ...n, texto, hecha: false } : n))
}

async function borrar(id: string) {
  await espera()
  notas = notas.filter((n) => n.id !== id)
}

/** El chat de la cabecera de /ds, con notas en memoria. */
export function DemoNotasClaude() {
  return <NotasClaude cargar={cargar} enviar={enviar} editar={editar} borrar={borrar} pendientes={notas.filter((n) => !n.hecha).length} />
}
