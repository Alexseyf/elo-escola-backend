import { z } from 'zod'
import { TURMA } from '@prisma/client'

export const createClassSchema = z.object({
  nome: z.nativeEnum(TURMA)
})

export type CreateClassInput = z.infer<typeof createClassSchema>

export const assignTeacherSchema = z.object({
    turmaId: z.number().int().positive()
})

export type AssignTeacherInput = z.infer<typeof assignTeacherSchema>
