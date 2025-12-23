import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from 'express'
import { TIPO_USUARIO } from "@prisma/client"

type AuthRequest = Request & {
  schoolId?: string | null
  userLogadoId?: number
  userLogadoNome?: string
  roles?: TIPO_USUARIO[]
  user?: any
}

interface TokenI {
  userLogadoId: number
  userLogadoNome: string
  schoolId: string | null  // Pode ser null para PLATFORM_ADMIN
  roles: string[] 
}

export function checkToken(req: Request, res: Response, next: NextFunction) {
  
  const { authorization } = req.headers

  if (!authorization) {
    return res.status(401).json({ 
      error: "Token não informado"
    })
  }

  const token = authorization.split(" ")[1]

  try {
    const decode = jwt.verify(token, process.env.JWT_KEY as string) as TokenI
    const { userLogadoId, userLogadoNome, schoolId, roles } = decode

    const authReq = req as AuthRequest;


    // PLATFORM_ADMIN com schoolId nulo (Escopo Global)
    const isPlatformAdmin = roles?.includes(TIPO_USUARIO.PLATFORM_ADMIN);
    
    if (isPlatformAdmin && schoolId === null) {
      authReq.userLogadoId = userLogadoId;
      authReq.userLogadoNome = userLogadoNome;
      authReq.schoolId = undefined;
      authReq.roles = roles as TIPO_USUARIO[];
      return next();
    }

    // Para TODOS os usuários que não são PLATFORM_ADMIN, a validação estrita do tenant se aplica
    if (!authReq.schoolId) {
       return res.status(500).json({ 
         error: "Internal Error: Tenant context not initialized. Ensure tenantMiddleware runs before checkToken.",
         code: "TENANT_CONTEXT_MISSING"
       })
    }
    if (schoolId !== authReq.schoolId) {
       return res.status(403).json({ 
         error: "Token inválido para o contexto atual da escola",
         code: "TOKEN_SCHOOL_MISMATCH"
       })
    }

    authReq.userLogadoId   = userLogadoId
    authReq.userLogadoNome = userLogadoNome
    authReq.roles = roles as TIPO_USUARIO[]

    // IMPORTANTE: Não sobrescreva authReq.schoolId aqui!
    // Usar o valor definido pelo tenantMiddleware, não pelo token

    next()
  } catch (error: any) {
    return res.status(401).json({ 
      error: "Token inválido"
    })
  }
}
