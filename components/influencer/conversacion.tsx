"use client"

import { Conversacion as ConversacionBase, type PropsConversacion } from "@/components/app/conversacion"
import type { Comentario } from "@/lib/influencer/modelo"

const TEXTOS = {
  vacioRevisor: "Aún no hay notas. Pulsa en la pieza o selecciona texto para dejar una justo ahí.",
  vacioNotas: "La marca no ha dejado notas en esta versión.",
  vacioAutor: "Cuando la marca revise, sus notas aparecen aquí, cada una en su sitio.",
  placeholderRevisor: "Escribe o pulsa en la pieza para dejar una nota…",
  placeholderAutor: "Escribe a la marca…",
  mensajeAutor: "Mensaje para la marca",
}

/** La conversación de una versión entre ella, que hace la pieza, y la marca, que la revisa: la del madre con sus palabras. */
export function Conversacion(props: Omit<PropsConversacion<Comentario["lado"]>, "ladoAutor" | "textos">) {
  return <ConversacionBase {...props} ladoAutor="influencer" textos={TEXTOS} />
}
