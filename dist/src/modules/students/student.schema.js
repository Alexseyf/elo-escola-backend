"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentSchema = exports.createStudentSchema = void 0;
const zod_1 = require("zod");
exports.createStudentSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3).max(60),
    dataNasc: zod_1.z.string().datetime().or(zod_1.z.date()),
    turmaId: zod_1.z.number().int().positive(),
    isAtivo: zod_1.z.boolean().optional(),
    mensalidade: zod_1.z.number().positive().optional()
});
exports.updateStudentSchema = zod_1.z.object({
    nome: zod_1.z.string().min(3).max(60).optional(),
    dataNasc: zod_1.z.string().datetime().or(zod_1.z.date()).optional(),
    turmaId: zod_1.z.number().int().positive().optional(),
    isAtivo: zod_1.z.boolean().optional(),
    mensalidade: zod_1.z.number().positive().optional()
});
