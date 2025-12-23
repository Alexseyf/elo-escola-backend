"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsavelAlunoService = void 0;
const prisma_1 = require("../config/prisma");
class ResponsavelAlunoService {
    constructor(schoolId) {
        this.schoolId = schoolId;
    }
    async checkAccess(usuarioId, alunoId) {
        const relation = await prisma_1.prisma.responsavelAluno.findFirst({
            where: {
                usuarioId,
                alunoId,
                schoolId: this.schoolId
            }
        });
        return !!relation;
    }
    async findRelation(usuarioId, alunoId) {
        return prisma_1.prisma.responsavelAluno.findFirst({
            where: {
                usuarioId,
                alunoId,
                schoolId: this.schoolId
            },
            include: {
                aluno: {
                    select: {
                        id: true,
                        nome: true,
                        turmaId: true
                    }
                },
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        telefone: true
                    }
                }
            }
        });
    }
    async findAlunosByResponsavel(usuarioId) {
        const relations = await prisma_1.prisma.responsavelAluno.findMany({
            where: {
                usuarioId,
                schoolId: this.schoolId
            },
            include: {
                aluno: {
                    include: {
                        turma: true
                    }
                }
            }
        });
        return relations.map(r => r.aluno);
    }
    async findResponsaveisByAluno(alunoId) {
        const relations = await prisma_1.prisma.responsavelAluno.findMany({
            where: {
                alunoId,
                schoolId: this.schoolId
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true,
                        telefone: true,
                        isAtivo: true
                    }
                }
            }
        });
        return relations.map(r => r.usuario);
    }
    async create(usuarioId, alunoId) {
        const [usuario, aluno] = await Promise.all([
            prisma_1.prisma.usuario.findFirst({ where: { id: usuarioId, schoolId: this.schoolId } }),
            prisma_1.prisma.aluno.findFirst({ where: { id: alunoId, schoolId: this.schoolId } })
        ]);
        if (!usuario) {
            throw new Error('Responsável não encontrado nesta escola');
        }
        if (!aluno) {
            throw new Error('Aluno não encontrado nesta escola');
        }
        return prisma_1.prisma.responsavelAluno.create({
            data: {
                usuarioId,
                alunoId,
                schoolId: this.schoolId
            },
            include: {
                usuario: {
                    select: {
                        id: true,
                        nome: true,
                        email: true
                    }
                },
                aluno: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        });
    }
    async remove(usuarioId, alunoId) {
        const relation = await this.findRelation(usuarioId, alunoId);
        if (!relation) {
            throw new Error('Relação não encontrada nesta escola');
        }
        return prisma_1.prisma.responsavelAluno.delete({
            where: {
                id: relation.id
            }
        });
    }
}
exports.ResponsavelAlunoService = ResponsavelAlunoService;
