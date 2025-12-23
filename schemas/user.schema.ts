import { z } from 'zod'
import { TIPO_USUARIO } from '@prisma/client'

export const createUserSchema = z.object({
  nome: z.string().min(3).max(60),
  email: z.string().email().max(40),
  senha: z.string().min(6).max(60).optional(),
  telefone: z.string().min(10).max(20),
  roles: z.array(z.nativeEnum(TIPO_USUARIO)).min(1),
  schoolId: z.string().uuid().optional() // For PLATFORM_ADMIN to specify target school
})

export type CreateUserInput = z.infer<typeof createUserSchema>

export const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1)
})

export type LoginInput = z.infer<typeof loginSchema>
