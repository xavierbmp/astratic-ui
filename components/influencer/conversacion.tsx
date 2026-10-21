"use client"

import { Conversacion as ConversacionBase, type PropsConversacion } from "@/components/app/conversacion"
import type { Comentario } from "@/lib/influencer/modelo"

const TEXTOS = {
  vacioRevisor: "Sin notas. Haz clic en la pieza o selecciona texto para añadir una.",
  vacioNotas: "Sin notas de la marca en esta versión.",
  vacioAutor: "Aquí aparecerán las notas de la marca.",
  placeholderRevisor: "Escribe una nota o haz clic en la pieza…",
  placeholderAutor: "Escribe a la marca…",
  mensajeAutor: "Mensaje para la marca",
}

/** La conversación de una versión entre ella, que hace la pieza, y la marca, que la revisa: la del madre con sus palabras. */
export function Conversacion(props: Omit<PropsConversacion<Comentario["lado"]>, "ladoAutor" | "textos">) {
  return <ConversacionBase {...props} ladoAutor="influencer" textos={TEXTOS} />
}
