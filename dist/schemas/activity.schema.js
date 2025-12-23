"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActivitySchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createActivitySchema = zod_1.z.object({
    ano: zod_1.z.number().int().positive(),
    periodo: zod_1.z.nativeEnum(client_1.SEMESTRE),
    quantHora: zod_1.z.number().int().positive(),
    descricao: zod_1.z.string().min(1).max(500),
    data: zod_1.z.string().datetime(),
    turmaId: zod_1.z.number().int().positive(),
    campoExperiencia: zod_1.z.nativeEnum(client_1.CAMPO_EXPERIENCIA),
    objetivoId: zod_1.z.number().int().positive(),
    isAtivo: zod_1.z.boolean().optional()
});
