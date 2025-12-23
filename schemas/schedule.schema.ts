import { z } from 'zod'
import { TIPO_EVENTO } from '@prisma/client'

export const createScheduleSchema = z.object({
  titulo: z.string().max(100),
  descricao: z.string().max(500),
  data: z.string().datetime(),
  tipoEvento: z.nativeEnum(TIPO_EVENTO),
  isAtivo: z.boolean().default(true),
})

export const updateScheduleSchema = createScheduleSchema.partial()

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>
