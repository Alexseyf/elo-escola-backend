"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsavelService = void 0;
const prisma_1 = require("../config/prisma");
class ResponsavelService {
    constructor(schoolId) {
        this.schoolId = schoolId;
    }
    async getAlunosByResponsavel(responsavelId) {
        const usuario = await prisma_1.prisma.usuario.findUnique({
            where: {
                id: responsavelId,
            },
            include: { roles: { include: { role: true } } }
        });
        if (!usuario)
            throw new Error("Responsável não encontrado");
        if (usuario.schoolId !== this.schoolId)
            throw new Error("Responsável não pertence a esta escola");
        const isResponsavel = usuario.roles.some(ur => ur.role.tipo === "RESPONSAVEL");
        if (!isResponsavel)
            throw new Error("Usuário não é um responsável");
        const vinculos = await prisma_1.prisma.responsavelAluno.findMany({
            where: { usuarioId: responsavelId },
            include: {
                aluno: {
                    include: { turma: true }
                }
            }
        });
        return vinculos
            .map(v => v.aluno)
            .filter(a => a.schoolId === this.schoolId);
    }
}
exports.ResponsavelService = ResponsavelService;
