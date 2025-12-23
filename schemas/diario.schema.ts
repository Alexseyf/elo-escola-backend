import { z } from 'zod'
import { DISPOSICAO, EVACUACAO, REFEICAO, ITEM_PROVIDENCIA } from '@prisma/client'

const periodoSonoSchema = z.object({
  horaDormiu: z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
  horaAcordou: z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
  tempoTotal: z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM")
})

const itemProvidenciaSchema = z.nativeEnum(ITEM_PROVIDENCIA)

export const createDiarioSchema = z.object({
  data: z.string().datetime(),
  observacoes: z.string().max(500),
  alunoId: z.number().int().positive(),
  disposicao: z.nativeEnum(DISPOSICAO).optional(),
  lancheManha: z.nativeEnum(REFEICAO).optional(),
  almoco: z.nativeEnum(REFEICAO).optional(),
  lancheTarde: z.nativeEnum(REFEICAO).optional(),
  leite: z.nativeEnum(REFEICAO).optional(),
  evacuacao: z.nativeEnum(EVACUACAO).optional(),
  periodosSono: z.array(periodoSonoSchema).optional(),
  itensProvidencia: z.array(itemProvidenciaSchema).optional()
})

export type CreateDiarioInput = z.infer<typeof createDiarioSchema>
