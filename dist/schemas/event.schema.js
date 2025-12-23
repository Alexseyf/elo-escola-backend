"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createEventSchema = zod_1.z.object({
    titulo: zod_1.z.string().max(100),
    descricao: zod_1.z.string().max(500),
    data: zod_1.z.string().datetime(),
    horaInicio: zod_1.z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
    horaFim: zod_1.z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
    tipoEvento: zod_1.z.nativeEnum(client_1.TIPO_EVENTO),
    isAtivo: zod_1.z.boolean().default(true),
    turmaId: zod_1.z.number().int().positive(),
});
exports.updateEventSchema = exports.createEventSchema.partial();
