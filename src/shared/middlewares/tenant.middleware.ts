import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../lib/prisma';
import { AppError } from '../errors/AppError';

const PUBLIC_ROUTES = [
  '/api/v1/login',
  '/api/v1/recupera-senha',
  '/api/v1/valida-senha',
  '/api/v1/schools',
  '/api/v1/platform/login',
];

const PLATFORM_ROUTES_PREFIX = '/api/v1/platform';

export const tenantMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (PUBLIC_ROUTES.includes(req.path)) {
      return next();
    }
    if (req.path.startsWith(PLATFORM_ROUTES_PREFIX)) {
      return next();
    }

    const tenantSlug = req.headers['x-tenant-id'] as string;
    let schoolId: string | null = null;

    if (tenantSlug) {
        const school = await prisma.school.findUnique({
            where: { slug: tenantSlug }
        });
        
        if (school) {
            schoolId = school.id;
        } else {
             const schoolById = await prisma.school.findUnique({ where: { id: tenantSlug } });
             if (schoolById) schoolId = schoolById.id;
        }
    }
    if (!schoolId) {
      const host = req.get('host') || '';
      const parts = host.split('.');
      
      if (parts.length > 2 || (parts.length === 2 && parts[1].includes('localhost'))) { 
        const slug = parts[0];
        if (slug !== 'www' && slug !== 'api') {
          const school = await prisma.school.findUnique({
             where: { slug }
          });
          if (school) {
            schoolId = school.id;
          }
        }
      }
    }

    if (!schoolId) {
      throw new AppError("Tenant Identification Failed: Não foi possível identificar a escola a partir do cabeçalho 'x-tenant-id' ou do subdomínio.", 404);
    }

    res.locals.schoolId = schoolId;
    (req as any).schoolId = schoolId;
    next();

  } catch (error) {
    next(error);
  }
};
