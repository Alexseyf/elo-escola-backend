import { z } from 'zod';

export const createSchoolSchema = z.object({
  name: z.string().min(3).max(255),
  slug: z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  adminUser: z.object({
    nome: z.string().min(3),
    email: z.string().email(),
    senha: z.string().min(6)
  })
});

export type CreateSchoolInput = z.infer<typeof createSchoolSchema>;
