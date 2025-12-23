"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkToken = checkToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
function checkToken(req, res, next) {
    const { authorization } = req.headers;
    if (!authorization) {
        return res.status(401).json({
            error: "Token não informado"
        });
    }
    const token = authorization.split(" ")[1];
    try {
        const decode = jsonwebtoken_1.default.verify(token, process.env.JWT_KEY);
        const { userLogadoId, userLogadoNome, schoolId, roles } = decode;
        const authReq = req;
        // PLATFORM_ADMIN com schoolId nulo (Escopo Global)
        const isPlatformAdmin = roles?.includes(client_1.TIPO_USUARIO.PLATFORM_ADMIN);
        if (isPlatformAdmin && schoolId === null) {
            authReq.userLogadoId = userLogadoId;
            authReq.userLogadoNome = userLogadoNome;
            authReq.schoolId = undefined;
            authReq.roles = roles;
            return next();
        }
        // Para TODOS os usuários que não são PLATFORM_ADMIN, a validação estrita do tenant se aplica
        if (!authReq.schoolId) {
            return res.status(500).json({
                error: "Internal Error: Tenant context not initialized. Ensure tenantMiddleware runs before checkToken.",
                code: "TENANT_CONTEXT_MISSING"
            });
        }
        if (schoolId !== authReq.schoolId) {
            return res.status(403).json({
                error: "Token inválido para o contexto atual da escola",
                code: "TOKEN_SCHOOL_MISMATCH"
            });
        }
        authReq.userLogadoId = userLogadoId;
        authReq.userLogadoNome = userLogadoNome;
        authReq.roles = roles;
        // IMPORTANTE: Não sobrescreva authReq.schoolId aqui!
        // Usar o valor definido pelo tenantMiddleware, não pelo token
        next();
    }
    catch (error) {
        return res.status(401).json({
            error: "Token inválido"
        });
    }
}
