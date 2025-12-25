import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z.string().min(3).max(255),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  legalName: z.string().max(255).optional(),
  cnpj: z.string().length(14).optional(),
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color code").optional(),
  timezone: z.string().optional().default("America/Sao_Paulo"),
  subscriptionPlan: z.enum(['BASIC', 'PRO', 'PREMIUM']).optional().default('BASIC'),

  adminUser: z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    senha: z.string().min(6)
  })
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
