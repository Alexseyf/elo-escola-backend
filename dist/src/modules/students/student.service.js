"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const prisma_1 = require("../../lib/prisma");
const AppError_1 = require("../../shared/errors/AppError");
class StudentService {
    constructor(schoolId) {
        this.schoolId = schoolId;
    }
    async create(data) {
        const turma = await prisma_1.prisma.turma.findUnique({
            where: { id: data.turmaId }
        });
        if (!turma || turma.schoolId !== this.schoolId) {
            throw new AppError_1.AppError("Turma inválida ou não pertencente a esta escola");
        }
        return prisma_1.prisma.aluno.create({
            data: {
                nome: data.nome,
                dataNasc: typeof data.dataNasc === 'string' ? new Date(data.dataNasc) : data.dataNasc,
                turmaId: data.turmaId,
                isAtivo: data.isAtivo ?? true,
                mensalidade: data.mensalidade,
                schoolId: this.schoolId
            }
        });
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
                    include: {
                        usuario: true
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
                    include: {
                        usuario: true
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
            throw new AppError_1.AppError("Aluno não encontrado", 404);
        if (data.turmaId) {
            const turma = await prisma_1.prisma.turma.findUnique({ where: { id: data.turmaId } });
            if (!turma || turma.schoolId !== this.schoolId) {
                throw new AppError_1.AppError("Turma inválida");
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
            throw new AppError_1.AppError("Aluno não encontrado", 404);
        return prisma_1.prisma.aluno.update({
            where: { id },
            data: { isAtivo: false }
        });
    }
}
exports.StudentService = StudentService;
