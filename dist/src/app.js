"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const error_middleware_1 = require("./shared/middlewares/error.middleware");
const tenant_middleware_1 = require("./shared/middlewares/tenant.middleware");
const AppError_1 = require("./shared/errors/AppError");
// Rotas
const student_routes_1 = require("./modules/students/student.routes");
const school_routes_1 = require("./modules/schools/school.routes");
const auth_routes_1 = require("./modules/auth/auth.routes");
const turmas_routes_1 = require("./modules/turmas/turmas.routes");
const platform_routes_1 = require("./modules/platform/platform.routes");
exports.app = (0, express_1.default)();
// Middleware Global
exports.app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin', 'x-tenant-id'],
    exposedHeaders: ['Authorization', 'Access-Control-Allow-Origin'],
}));
exports.app.use(express_1.default.json());
// Rotas da plataforma (ANTES do middleware de tenant - sem contexto de tenant necessário)
exports.app.use('/api/v1/platform', platform_routes_1.platformRouter);
// Multi-Tenant Middleware - Aplicado a rotas com escopo definido pelo tenant
exports.app.use(tenant_middleware_1.tenantMiddleware);
// Rotas com escopo definido para o tenant (Requer tenant context)
exports.app.use('/api/v1', auth_routes_1.authRouter);
exports.app.use('/api/v1/students', student_routes_1.studentsRouter);
exports.app.use('/api/v1/schools', school_routes_1.schoolsRouter);
exports.app.use('/api/v1/turmas', turmas_routes_1.turmasRouter);
// Rota base
exports.app.get('/', (req, res) => {
    res.send({
        message: 'School SaaS API is Running'
    });
});
// Tratamento de 404
exports.app.all('*', (req, res, next) => {
    next(new AppError_1.AppError(`Route ${req.originalUrl} not found`, 404));
});
// Tratamento global de erros
exports.app.use(error_middleware_1.errorMiddleware);
