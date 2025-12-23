"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const prisma_1 = require("../config/prisma");
const normalizaData_1 = __importDefault(require("../utils/normalizaData"));
class ScheduleService {
    constructor(schoolId) {
        this.schoolId = schoolId;
    }
    normalizeDate(dateStr) {
        const dataFormatada = (0, normalizaData_1.default)(dateStr);
        return new Date(dataFormatada);
    }
    async create(data, criadorId) {
        return prisma_1.prisma.cronograma.create({
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
        if (filters.isAtivo !== undefined)
            where.isAtivo = filters.isAtivo;
        return prisma_1.prisma.cronograma.findMany({
            where,
            include: {
                criador: { select: { id: true, nome: true, email: true } }
            },
            orderBy: { data: 'asc' }
        });
    }
    async findById(id) {
        return prisma_1.prisma.cronograma.findFirst({
            where: { id, schoolId: this.schoolId },
            include: {
                criador: { select: { id: true, nome: true, email: true } }
            }
        });
    }
    async update(id, data) {
        const schedule = await this.findById(id);
        if (!schedule)
            throw new Error("Cronograma não encontrado");
        const updateData = { ...data };
        if (data.data)
            updateData.data = this.normalizeDate(data.data);
        return prisma_1.prisma.cronograma.update({
            where: { id },
            data: updateData
        });
    }
    async delete(id) {
        const schedule = await this.findById(id);
        if (!schedule)
            throw new Error("Cronograma não encontrado");
        return prisma_1.prisma.cronograma.update({
            where: { id },
            data: { isAtivo: false }
        });
    }
}
exports.ScheduleService = ScheduleService;
