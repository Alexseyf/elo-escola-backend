"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignTeacherSchema = exports.createClassSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createClassSchema = zod_1.z.object({
    nome: zod_1.z.nativeEnum(client_1.TURMA)
});
exports.assignTeacherSchema = zod_1.z.object({
    turmaId: zod_1.z.number().int().positive()
});
