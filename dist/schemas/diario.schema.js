"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDiarioSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const periodoSonoSchema = zod_1.z.object({
    horaDormiu: zod_1.z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
    horaAcordou: zod_1.z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM"),
    tempoTotal: zod_1.z.string().regex(/^\d{2}:\d{2}$/, "Formato deve ser HH:MM")
});
const itemProvidenciaSchema = zod_1.z.nativeEnum(client_1.ITEM_PROVIDENCIA);
exports.createDiarioSchema = zod_1.z.object({
    data: zod_1.z.string().datetime(),
    observacoes: zod_1.z.string().max(500),
    alunoId: zod_1.z.number().int().positive(),
    disposicao: zod_1.z.nativeEnum(client_1.DISPOSICAO).optional(),
    lancheManha: zod_1.z.nativeEnum(client_1.REFEICAO).optional(),
    almoco: zod_1.z.nativeEnum(client_1.REFEICAO).optional(),
    lancheTarde: zod_1.z.nativeEnum(client_1.REFEICAO).optional(),
    leite: zod_1.z.nativeEnum(client_1.REFEICAO).optional(),
    evacuacao: zod_1.z.nativeEnum(client_1.EVACUACAO).optional(),
    periodosSono: zod_1.z.array(periodoSonoSchema).optional(),
    itensProvidencia: zod_1.z.array(itemProvidenciaSchema).optional()
});
