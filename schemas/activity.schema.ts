import { z } from 'zod'
import { SEMESTRE, CAMPO_EXPERIENCIA } from '@prisma/client'

export const createActivitySchema = z.object({
  ano: z.number().int().positive(),
  periodo: z.nativeEnum(SEMESTRE),
  quantHora: z.number().int().positive(),
  descricao: z.string().min(1).max(500),
  data: z.string().datetime(),
  turmaId: z.number().int().positive(),
  campoExperiencia: z.nativeEnum(CAMPO_EXPERIENCIA),
  objetivoId: z.number().int().positive(),
  isAtivo: z.boolean().optional()
})

export type CreateActivityInput = z.infer<typeof createActivitySchema>
