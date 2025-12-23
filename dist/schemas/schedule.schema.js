"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateScheduleSchema = exports.createScheduleSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createScheduleSchema = zod_1.z.object({
    titulo: zod_1.z.string().max(100),
    descricao: zod_1.z.string().max(500),
    data: zod_1.z.string().datetime(),
    tipoEvento: zod_1.z.nativeEnum(client_1.TIPO_EVENTO),
    isAtivo: zod_1.z.boolean().default(true),
});
exports.updateScheduleSchema = exports.createScheduleSchema.partial();
