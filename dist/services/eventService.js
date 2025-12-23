"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const prisma_1 = require("../config/prisma");
const normalizaData_1 = __importDefault(require("../utils/normalizaData"));
class EventService {
    constructor(schoolId) {
        this.schoolId = schoolId;
    }
    normalizeDate(dateStr) {
        const dataFormatada = (0, normalizaData_1.default)(dateStr);
        return new Date(dataFormatada);
    }
    async create(data, criadorId) {
        const turma = await prisma_1.prisma.turma.findFirst({
            where: { id: data.turmaId, schoolId: this.schoolId }
        });
        if (!turma)
            throw new Error("Turma não encontrada ou não pertence a esta escola");
        return prisma_1.prisma.evento.create({
            data: {
                ...data,
                data: this.normalizeDate(data.data),
                criadorId,
                schoolId: this.schoolId
            }
        });
    }
    async findAll(filters) {
        const where = { schoolId: this.schoolId };
        if (filters.data)
            where.data = this.normalizeDate(filters.data);
        if (filters.tipoEvento)
            where.tipoEvento = filters.tipoEvento;
        if (filters.turmaId)
            where.turmaId = filters.turmaId;
        if (filters.isAtivo !== undefined)
            where.isAtivo = filters.isAtivo;
        return prisma_1.prisma.evento.findMany({
            where,
            include: {
                turma: true,
                criador: {
                    select: { id: true, nome: true, email: true }
                }
            },
            orderBy: { data: 'asc' }
        });
    }
    async findById(id) {
        return prisma_1.prisma.evento.findFirst({
            where: { id, schoolId: this.schoolId },
            include: {
                turma: true,
                criador: { select: { id: true, nome: true, email: true } }
            }
        });
    }
    async update(id, data) {
        const event = await this.findById(id);
        if (!event)
            throw new Error("Evento não encontrado");
        if (data.turmaId) {
            const turma = await prisma_1.prisma.turma.findFirst({
                where: { id: data.turmaId, schoolId: this.schoolId }
            });
            if (!turma)
                throw new Error("Turma não encontrada");
        }
        const updateData = { ...data };
        if (data.data)
            updateData.data = this.normalizeDate(data.data);
        return prisma_1.prisma.evento.update({
            where: { id },
            data: updateData
        });
    }
    async delete(id) {
        const event = await this.findById(id);
        if (!event)
            throw new Error("Evento não encontrado");
        return prisma_1.prisma.evento.update({
            where: { id },
            data: { isAtivo: false }
        });
    }
    async findByTurma(turmaId) {
        const turma = await prisma_1.prisma.turma.findFirst({ where: { id: turmaId, schoolId: this.schoolId } });
        if (!turma)
            throw new Error("Turma não encontrada");
        return prisma_1.prisma.evento.findMany({
            where: {
                turmaId,
                schoolId: this.schoolId,
                isAtivo: true
            },
            include: {
                criador: { select: { id: true, nome: true, email: true } }
            },
            orderBy: { data: 'asc' }
        });
    }
}
exports.EventService = EventService;
