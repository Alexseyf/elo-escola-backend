import { TIPO_USUARIO } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      schoolId?: string | null; // Nulo para PLATFORM_ADMIN escopo global
      userLogadoId?: number;
      userLogadoNome?: string;
      roles?: TIPO_USUARIO[];
    }
  }
}

export {};
