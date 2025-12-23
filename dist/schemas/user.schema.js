"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createUserSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3).max(60),
    email: zod_1.z.string().email().max(40),
    senha: zod_1.z.string().min(6).max(60).optional(),
    telefone: zod_1.z.string().min(10).max(20),
    roles: zod_1.z.array(zod_1.z.nativeEnum(client_1.TIPO_USUARIO)).min(1),
    schoolId: zod_1.z.string().uuid().optional() // For PLATFORM_ADMIN to specify target school
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    senha: zod_1.z.string().min(1)
});
