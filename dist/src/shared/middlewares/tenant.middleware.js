"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantMiddleware = void 0;
const prisma_1 = require("../../lib/prisma");
const AppError_1 = require("../errors/AppError");
const PUBLIC_ROUTES = [
    '/api/v1/login',
    '/api/v1/recupera-senha',
    '/api/v1/valida-senha',
    '/api/v1/schools',
    '/api/v1/platform/login',
];
const PLATFORM_ROUTES_PREFIX = '/api/v1/platform';
const tenantMiddleware = async (req, res, next) => {
    try {
        if (PUBLIC_ROUTES.includes(req.path)) {
            return next();
        }
        if (req.path.startsWith(PLATFORM_ROUTES_PREFIX)) {
            return next();
        }
        const tenantSlug = req.headers['x-tenant-id'];
        let schoolId = null;
        if (tenantSlug) {
            const school = await prisma_1.prisma.school.findUnique({
                where: { slug: tenantSlug }
            });
            if (school) {
                schoolId = school.id;
            }
            else {
                const schoolById = await prisma_1.prisma.school.findUnique({ where: { id: tenantSlug } });
                if (schoolById)
                    schoolId = schoolById.id;
            }
        }
        if (!schoolId) {
            const host = req.get('host') || '';
            const parts = host.split('.');
            if (parts.length > 2 || (parts.length === 2 && parts[1].includes('localhost'))) {
                const slug = parts[0];
                if (slug !== 'www' && slug !== 'api') {
                    const school = await prisma_1.prisma.school.findUnique({
                        where: { slug }
                    });
                    if (school) {
                        schoolId = school.id;
                    }
                }
            }
        }
        if (!schoolId) {
            throw new AppError_1.AppError("Tenant Identification Failed: Não foi possível identificar a escola a partir do cabeçalho 'x-tenant-id' ou do subdomínio.", 404);
        }
        res.locals.schoolId = schoolId;
        req.schoolId = schoolId;
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.tenantMiddleware = tenantMiddleware;
