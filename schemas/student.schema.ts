import { z } from 'zod'

export const createStudentSchema = z.object({
  nome: z.string().min(3).max(60),
  dataNasc: z.string().datetime().or(z.date()), // Accept string ISO or Date object
  turmaId: z.number().int().positive(),
  isAtivo: z.boolean().optional(),
  mensalidade: z.number().positive().optional()
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>

export const updateStudentSchema = z.object({
  nome: z.string().min(3).max(60).optional(),
  dataNasc: z.string().datetime().or(z.date()).optional(),
  turmaId: z.number().int().positive().optional(),
  isAtivo: z.boolean().optional(),
  mensalidade: z.number().positive().optional()
})

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>
