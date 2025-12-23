import { Request, Response, NextFunction } from "express"
import { TIPO_USUARIO } from "@prisma/client"

interface AuthenticatedRequest extends Request {
  userLogadoId?: number
  userLogadoNome?: string
  schoolId?: string
  roles?: TIPO_USUARIO[]
  user?: any
}

export const checkRoles = (allowedRoles: TIPO_USUARIO[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const userRoles = authReq.roles; 

      if (!userRoles) {
        return res.status(403).json({ 
          erro: "Acesso negado. Roles não identificadas." 
        })
      }

      const hasRequiredRole = userRoles.some(role => allowedRoles.includes(role))

      if (!hasRequiredRole) {
        return res.status(403).json({ 
          erro: "Acesso negado. Você não tem permissão para acessar este recurso." 
        })
      }

      if (authReq.userLogadoId && authReq.userLogadoNome) {
           authReq.user = {
               id: authReq.userLogadoId,
               nome: authReq.userLogadoNome,
               roles: userRoles
           }
      }

      next()
    } catch (error) {
      console.error("CheckRoles Error:", error);
      return res.status(500).json({ erro: "Erro interno na verificação de permissões" })
    }
  }
}