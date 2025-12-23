import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    schoolId?: string
    userLogadoId?: number
    userLogadoNome?: string
    roles?: any[]
    user?: any
  }
}
