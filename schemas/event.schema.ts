import { z } from 'zod'
import { TIPO_EVENTO } from '@prisma/client'

export const createEventSchema = z.object({
  titulo: z.string().max(100),
  descricao: z.string().max(500),
  data: z.string().datetime(),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
  tipoEvento: z.nativeEnum(TIPO_EVENTO),
  isAtivo: z.boolean().default(true),
  turmaId: z.number().int().positive(),
})

export const updateEventSchema = createEventSchema.partial()

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
