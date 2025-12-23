"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityService = void 0;
const prisma_1 = require("../config/prisma");
class ActivityService {
    constructor(schoolId) {
        this.schoolId = schoolId;
    }
    normalizeDate(dateStr) {
        if (dateStr.length === 10) {
            const [ano, mes, dia] = dateStr.split('-').map(Number);
            return new Date(Date.UTC(ano, mes - 1, dia, 3, 0, 0));
        }
        return new Date(dateStr);
    }
    async create(data, professorId) {
        const turma = await prisma_1.prisma.turma.findFirst({
            where: { id: data.turmaId, schoolId: this.schoolId }
        });
        if (!turma)
            throw new Error("Turma não encontrada");
        const objetivo = await prisma_1.prisma.objetivo.findUnique({ where: { id: data.objetivoId } });
        if (!objetivo)
            throw new Error("Objetivo não encontrado");
        return prisma_1.prisma.atividade.create({
            data: {
                ...data,
                data: this.normalizeDate(data.data),
                professorId,
                schoolId: this.schoolId,
                isAtivo: data.isAtivo !== undefined ? data.isAtivo : true
            },
            include: {
                professor: { select: { id: true, nome: true, email: true } },
                turma: { select: { id: true, nome: true } },
                objetivo: { select: { id: true, codigo: true, descricao: true } }
            }
        });
    }
    async findAll() {
        return prisma_1.prisma.atividade.findMany({
            where: { schoolId: this.schoolId },
            select: {
                id: true,
                ano: true,
                periodo: true,
                quantHora: true,
                data: true,
                campoExperiencia: true,
                turma: { select: { id: true, nome: true } }
            },
            orderBy: { data: 'desc' }
        });
    }
    async findById(id) {
        return prisma_1.prisma.atividade.findFirst({
            where: { id, schoolId: this.schoolId },
            include: {
                professor: { select: { id: true, nome: true, email: true, telefone: true } },
                turma: { select: { id: true, nome: true } },
                objetivo: { select: { id: true, codigo: true, descricao: true } }
            }
        });
    }
    async findByProfessor(professorId) {
        const vinculos = await prisma_1.prisma.professorTurma.findMany({
            where: { usuarioId: professorId, schoolId: this.schoolId },
            include: { turma: { select: { id: true, nome: true } } }
        });
        const turmaIds = vinculos.map(v => v.turmaId);
        if (turmaIds.length === 0)
            throw new Error("Nenhuma turma relacionada ao professor");
        const atividades = await prisma_1.prisma.atividade.findMany({
            where: {
                schoolId: this.schoolId,
                turmaId: { in: turmaIds },
                professorId
            },
            select: {
                id: true,
                ano: true,
                periodo: true,
                quantHora: true,
                data: true,
                campoExperiencia: true,
                turma: { select: { id: true, nome: true } },
                objetivo: { select: { id: true, codigo: true, descricao: true } }
            },
            orderBy: { data: 'desc' }
        });
        return {
            turmas: vinculos.map(v => v.turma),
            atividades
        };
    }
    async getReportByExperienceField() {
        const atividadesPorCampo = await prisma_1.prisma.atividade.groupBy({
            by: ['campoExperiencia'],
            where: { schoolId: this.schoolId },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } }
        });
        const atividadesPorCampoETurma = await prisma_1.prisma.atividade.groupBy({
            by: ['campoExperiencia', 'turmaId'],
            where: { schoolId: this.schoolId },
            _count: { id: true }
        });
        const turmas = await prisma_1.prisma.turma.findMany({
            where: { schoolId: this.schoolId },
            select: { id: true, nome: true }
        });
        const turmasMap = turmas.reduce((acc, t) => ({ ...acc, [t.id]: t.nome }), {});
        const relatorio = atividadesPorCampo.map(campo => {
            const detalhesPorTurma = atividadesPorCampoETurma
                .filter(item => item.campoExperiencia === campo.campoExperiencia)
                .map(item => ({
                turmaId: item.turmaId,
                turma: turmasMap[item.turmaId] || 'Desconhecida',
                total: item._count.id
            }))
                .sort((a, b) => b.total - a.total);
            return {
                campoExperiencia: campo.campoExperiencia,
                totalGeral: campo._count.id,
                detalhesPorTurma
            };
        });
        return {
            resumo: {
                totalAtividades: atividadesPorCampo.reduce((acc, c) => acc + c._count.id, 0),
                totalCampos: atividadesPorCampo.length
            },
            relatorio
        };
    }
}
exports.ActivityService = ActivityService;
