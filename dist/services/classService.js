"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassService = void 0;
const prisma_1 = require("../config/prisma");
class ClassService {
    constructor(schoolId) {
        this.schoolId = schoolId;
    }
    async getGroupByName(groupName) {
        const grupo = await prisma_1.prisma.grupoPorCampo.findUnique({
            where: { nome: groupName }
        });
        if (!grupo)
            throw new Error(`Grupo ${groupName} não encontrado`);
        return grupo.id;
    }
    mapClassToGroup(turma) {
        switch (turma) {
            case "BERCARIO2":
                return "BEBES";
            case "MATERNAL1":
            case "MATERNAL2":
                return "CRIANCAS_BEM_PEQUENAS";
            case "PRE1":
            case "PRE2":
                return "CRIANCAS_PEQUENAS";
            case "TURNOINVERSO":
                return "CRIANCAS_MAIORES";
            default:
                throw new Error("Turma desconhecida mapeamento de grupo");
        }
    }
    async create(data) {
        const existing = await prisma_1.prisma.turma.findFirst({
            where: {
                nome: data.nome,
                schoolId: this.schoolId
            }
        });
        if (existing) {
            throw new Error("Turma já existente");
        }
        const groupName = this.mapClassToGroup(data.nome);
        const grupoId = await this.getGroupByName(groupName);
        return prisma_1.prisma.turma.create({
            data: {
                nome: data.nome,
                grupoId: grupoId,
                schoolId: this.schoolId
            }
        });
    }
    async findAll() {
        return prisma_1.prisma.turma.findMany({
            where: { schoolId: this.schoolId },
            include: {
                professores: {
                    include: {
                        usuario: true
                    }
                },
                alunos: true
            }
        });
    }
    async findById(id) {
        return prisma_1.prisma.turma.findFirst({
            where: {
                id,
                schoolId: this.schoolId
            },
            include: {
                alunos: {
                    include: {
                        responsaveis: {
                            include: { usuario: true }
                        }
                    }
                }
            }
        });
    }
    async getTotalActiveStudents() {
        const turmas = await prisma_1.prisma.turma.findMany({
            where: { schoolId: this.schoolId },
            include: {
                _count: {
                    select: {
                        alunos: {
                            where: { isAtivo: true }
                        }
                    }
                }
            }
        });
        return turmas.map(t => ({
            id: t.id,
            nome: t.nome,
            totalAlunosAtivos: t._count.alunos
        }));
    }
    async addProfessor(turmaId, usuarioId) {
        const turma = await this.findById(turmaId);
        if (!turma)
            throw new Error("Turma não encontrada");
        const usuario = await prisma_1.prisma.usuario.findFirst({
            where: { id: usuarioId, schoolId: this.schoolId },
            include: { roles: { include: { role: true } } }
        });
        if (!usuario)
            throw new Error("Usuário não encontrado");
        const isProfessor = usuario.roles.some(ur => ur.role.tipo === "PROFESSOR");
        if (!isProfessor)
            throw new Error("O usuário deve ser um PROFESSOR");
        return prisma_1.prisma.professorTurma.create({
            data: {
                turmaId,
                usuarioId,
                schoolId: this.schoolId
            }
        });
    }
}
exports.ClassService = ClassService;
