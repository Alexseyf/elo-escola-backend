"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const prisma_1 = require("../config/prisma");
const logger_1 = require("../src/lib/logger");
class StudentService {
    constructor(schoolId) {
        this.schoolId = schoolId;
        this.logger = (0, logger_1.createTenantLogger)(schoolId);
    }
    async create(data) {
        this.logger.info('Criando aluno', { nome: data.nome, turmaId: data.turmaId });
        try {
            const turma = await prisma_1.prisma.turma.findFirst({
                where: {
                    id: data.turmaId,
                    schoolId: this.schoolId
                }
            });
            if (!turma) {
                this.logger.warn('Turma não encontrada', { turmaId: data.turmaId });
                throw new Error("Turma não encontrada nesta escola");
            }
            const aluno = await prisma_1.prisma.aluno.create({
                data: {
                    nome: data.nome,
                    dataNasc: typeof data.dataNasc === 'string' ? new Date(data.dataNasc) : data.dataNasc,
                    turmaId: data.turmaId,
                    isAtivo: data.isAtivo ?? true,
                    mensalidade: data.mensalidade,
                    schoolId: this.schoolId
                }
            });
            this.logger.info('Aluno criado com sucesso', { alunoId: aluno.id, nome: aluno.nome });
            return aluno;
        }
        catch (error) {
            this.logger.error('Erro ao criar aluno', error, { nome: data.nome });
            throw error;
        }
    }
    async findAll(onlyActive = false) {
        return prisma_1.prisma.aluno.findMany({
            where: {
                schoolId: this.schoolId,
                ...(onlyActive ? { isAtivo: true } : {})
            },
            include: {
                turma: true,
                responsaveis: {
                    where: { schoolId: this.schoolId },
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nome: true,
                                email: true,
                                telefone: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                nome: 'asc'
            }
        });
    }
    async findById(id) {
        return prisma_1.prisma.aluno.findFirst({
            where: {
                id,
                schoolId: this.schoolId
            },
            include: {
                turma: true,
                responsaveis: {
                    where: { schoolId: this.schoolId },
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                nome: true,
                                email: true,
                                telefone: true
                            }
                        }
                    }
                },
                diario: {
                    orderBy: {
                        data: 'desc'
                    },
                    take: 10,
                    include: {
                        periodosSono: true,
                        itensProvidencia: {
                            include: {
                                itemProvidencia: true
                            }
                        }
                    }
                }
            }
        });
    }
    async update(id, data) {
        const exists = await this.findById(id);
        if (!exists)
            throw new Error("Aluno não encontrado");
        if (data.turmaId) {
            const turma = await prisma_1.prisma.turma.findFirst({
                where: {
                    id: data.turmaId,
                    schoolId: this.schoolId
                }
            });
            if (!turma) {
                throw new Error("Turma não encontrada nesta escola");
            }
        }
        const updateData = { ...data };
        if (data.dataNasc && typeof data.dataNasc === 'string') {
            updateData.dataNasc = new Date(data.dataNasc);
        }
        return prisma_1.prisma.aluno.update({
            where: { id },
            data: updateData
        });
    }
    async softDelete(id) {
        const exists = await this.findById(id);
        if (!exists)
            throw new Error("Aluno não encontrado");
        return prisma_1.prisma.aluno.update({
            where: { id },
            data: { isAtivo: false }
        });
    }
    async addResponsavel(alunoId, usuarioId) {
        const aluno = await this.findById(alunoId);
        if (!aluno)
            throw new Error("Aluno não encontrado");
        const usuario = await prisma_1.prisma.usuario.findFirst({
            where: { id: usuarioId, schoolId: this.schoolId },
            include: { roles: { include: { role: true } } }
        });
        if (!usuario)
            throw new Error("Usuário não encontrado");
        const isResponsavel = usuario.roles.some(ur => ur.role.tipo === "RESPONSAVEL");
        if (!isResponsavel)
            throw new Error("O usuário deve ter a role RESPONSAVEL");
        return prisma_1.prisma.responsavelAluno.create({
            data: {
                alunoId,
                usuarioId,
                schoolId: this.schoolId
            }
        });
    }
    async removeResponsavel(alunoId, usuarioId) {
        const relation = await prisma_1.prisma.responsavelAluno.findFirst({
            where: {
                alunoId,
                usuarioId,
                schoolId: this.schoolId
            }
        });
        if (!relation)
            throw new Error("Relação não encontrada");
        return prisma_1.prisma.responsavelAluno.delete({
            where: { id: relation.id }
        });
    }
    async getReportsByClass() {
        const turmas = await prisma_1.prisma.turma.findMany({
            where: { schoolId: this.schoolId },
            include: {
                alunos: {
                    where: { isAtivo: true },
                    select: { id: true, nome: true, mensalidade: true }
                }
            }
        });
        const resultado = turmas.map(turma => {
            const totalMensalidade = turma.alunos.reduce((total, aluno) => {
                return total + (aluno.mensalidade || 0);
            }, 0);
            return {
                turmaId: turma.id,
                turmaNome: turma.nome,
                quantidadeAlunos: turma.alunos.length,
                totalMensalidade,
                alunos: turma.alunos
            };
        });
        const totalGeral = resultado.reduce((total, turma) => total + turma.totalMensalidade, 0);
        return { turmas: resultado, totalGeral };
    }
}
exports.StudentService = StudentService;
