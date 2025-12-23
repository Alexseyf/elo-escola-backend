"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiarioService = void 0;
const prisma_1 = require("../config/prisma");
const normalizaData_1 = __importDefault(require("../utils/normalizaData"));
// ✅ P2.2 - Import TenantLogger
const logger_1 = require("../src/lib/logger");
class DiarioService {
    constructor(schoolId) {
        this.schoolId = schoolId;
        this.logger = (0, logger_1.createTenantLogger)(schoolId);
    }
    normalizeDate(dateStr) {
        return (0, normalizaData_1.default)(dateStr);
    }
    stringDateToDbDate(dateStr) {
        const normalized = this.normalizeDate(dateStr);
        const [ano, mes, dia] = normalized.split('-').map(Number);
        return new Date(ano, mes - 1, dia, 12, 0, 0);
    }
    async create(data) {
        this.logger.info('Criando diário', { alunoId: data.alunoId, data: data.data });
        const dataFormatada = this.normalizeDate(data.data);
        const aluno = await prisma_1.prisma.aluno.findUnique({
            where: { id: data.alunoId }
        });
        if (!aluno)
            throw new Error("Aluno não encontrado");
        if (aluno.schoolId !== this.schoolId)
            throw new Error("Aluno não pertence a esta escola");
        const dbDate = this.stringDateToDbDate(data.data);
        const existing = await prisma_1.prisma.diario.findFirst({
            where: {
                schoolId: this.schoolId,
                alunoId: data.alunoId,
                data: dbDate
            }
        });
        if (existing)
            throw new Error("Já existe um diário para este aluno nesta data");
        const { periodosSono, itensProvidencia, ...diarioData } = data;
        let itensProvidenciaIds = [];
        if (itensProvidencia && itensProvidencia.length > 0) {
            const itensEncontrados = await prisma_1.prisma.itemProvidencia.findMany({
                where: { nome: { in: itensProvidencia } },
                select: { id: true }
            });
            itensProvidenciaIds = itensEncontrados;
        }
        const diario = await prisma_1.prisma.diario.create({
            data: {
                ...diarioData,
                data: dbDate,
                schoolId: this.schoolId,
                periodosSono: periodosSono ? {
                    create: periodosSono.map(periodo => ({
                        ...periodo,
                        schoolId: this.schoolId
                    }))
                } : undefined,
                itensProvidencia: itensProvidenciaIds.length > 0 ? {
                    create: itensProvidenciaIds.map(item => ({
                        itemProvidenciaId: item.id,
                        schoolId: this.schoolId
                    }))
                } : undefined
            },
            include: {
                aluno: true,
                periodosSono: true,
                itensProvidencia: { include: { itemProvidencia: true } }
            }
        });
        this.logger.info('Diário criado com sucesso', { diarioId: diario.id, alunoId: diario.alunoId });
        return diario;
    }
    async findAllByAluno(alunoId) {
        const aluno = await prisma_1.prisma.aluno.findUnique({ where: { id: alunoId, schoolId: this.schoolId } });
        if (!aluno)
            throw new Error("Aluno não encontrado");
        return prisma_1.prisma.diario.findMany({
            where: { alunoId, schoolId: this.schoolId },
            orderBy: { data: 'desc' },
            include: {
                aluno: true,
                periodosSono: true,
                itensProvidencia: { include: { itemProvidencia: true } }
            }
        });
    }
    async findById(id) {
        return prisma_1.prisma.diario.findFirst({
            where: { id, schoolId: this.schoolId },
            include: {
                aluno: true,
                periodosSono: true,
                itensProvidencia: { include: { itemProvidencia: true } }
            }
        });
    }
    async update(id, data) {
        return await prisma_1.prisma.$transaction(async (tx) => {
            const diario = await tx.diario.findFirst({
                where: { id, schoolId: this.schoolId }
            });
            if (!diario) {
                throw new Error("Diário não encontrado");
            }
            const { periodosSono, itensProvidencia, ...diarioData } = data;
            const dbDate = this.stringDateToDbDate(data.data);
            let itensProvidenciaIds = [];
            if (itensProvidencia && itensProvidencia.length > 0) {
                const itensEncontrados = await tx.itemProvidencia.findMany({
                    where: { nome: { in: itensProvidencia } },
                    select: { id: true }
                });
                itensProvidenciaIds = itensEncontrados;
            }
            await tx.periodoSono.deleteMany({
                where: { diarioId: id, schoolId: this.schoolId }
            });
            await tx.diarioItemProvidencia.deleteMany({
                where: { diarioId: id, schoolId: this.schoolId }
            });
            const updated = await tx.diario.update({
                where: { id },
                data: {
                    ...diarioData,
                    data: dbDate,
                    periodosSono: periodosSono ? {
                        create: periodosSono.map(periodo => ({
                            ...periodo,
                            schoolId: this.schoolId
                        }))
                    } : undefined,
                    itensProvidencia: itensProvidenciaIds.length > 0 ? {
                        create: itensProvidenciaIds.map(item => ({
                            itemProvidenciaId: item.id,
                            schoolId: this.schoolId
                        }))
                    } : undefined
                },
                include: {
                    aluno: true,
                    periodosSono: true,
                    itensProvidencia: { include: { itemProvidencia: true } }
                }
            });
            return updated;
        });
    }
}
exports.DiarioService = DiarioService;
