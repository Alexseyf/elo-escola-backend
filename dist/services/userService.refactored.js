"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const tenant_prisma_1 = require("../src/lib/tenant-prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const passwordUtils_1 = require("../utils/passwordUtils");
const emailService_1 = require("../utils/emailService");
class UserService {
    constructor(schoolId, roles = []) {
        this.schoolId = schoolId;
        this.roles = roles;
        this.prisma = (0, tenant_prisma_1.createTenantPrismaClient)({
            schoolId: this.schoolId,
            isPlatformAdmin: (0, tenant_prisma_1.isPlatformAdminRole)(this.roles),
            enableQueryLog: process.env.NODE_ENV === 'development'
        });
    }
    async create(data) {
        const existingUser = await this.prisma.usuario.findUnique({
            where: {
                email_schoolId: {
                    email: data.email,
                    schoolId: this.schoolId
                }
            }
        });
        if (existingUser) {
            throw new Error('Email already registered for this school.');
        }
        const passwordRaw = data.senha || (0, passwordUtils_1.generateDefaultPassword)(data.email);
        const salt = bcrypt_1.default.genSaltSync(12);
        const hash = bcrypt_1.default.hashSync(passwordRaw, salt);
        const newUser = await this.prisma.usuario.create({
            data: {
                nome: data.nome,
                email: data.email,
                senha: hash,
                telefone: data.telefone,
                senhaAlterada: !!data.senha,
                schoolId: this.schoolId,
                roles: {
                    create: data.roles.map(role => ({
                        role: {
                            connectOrCreate: {
                                where: { tipo: role },
                                create: { tipo: role }
                            }
                        }
                    }))
                }
            }
        });
        if (!data.senha) {
            await (0, emailService_1.enviarEmailSenhaPadrao)(newUser.email, newUser.nome, passwordRaw);
        }
        const { senha, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }
    async findAll() {
        return this.prisma.usuario.findMany({
            include: {
                roles: {
                    include: { role: true }
                }
            }
        });
    }
    async findById(userId) {
        return this.prisma.usuario.findFirst({
            where: { id: userId },
            include: {
                roles: {
                    include: { role: true }
                }
            }
        });
    }
    async findByEmail(email) {
        return this.prisma.usuario.findUnique({
            where: {
                email_schoolId: {
                    email,
                    schoolId: this.schoolId
                }
            },
            include: {
                roles: {
                    include: { role: true }
                }
            }
        });
    }
    async update(userId, data) {
        const user = await this.findById(userId);
        if (!user) {
            throw new Error('User not found in this school');
        }
        const updateData = {
            nome: data.nome,
            email: data.email,
            telefone: data.telefone,
        };
        if (data.senha) {
            const salt = bcrypt_1.default.genSaltSync(12);
            updateData.senha = bcrypt_1.default.hashSync(data.senha, salt);
            updateData.senhaAlterada = true;
        }
        return this.prisma.usuario.update({
            where: { id: userId },
            data: updateData,
            include: {
                roles: {
                    include: { role: true }
                }
            }
        });
    }
    async delete(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new Error('User not found in this school');
        }
        return this.prisma.usuario.delete({
            where: { id: userId }
        });
    }
    async deactivate(userId) {
        return this.update(userId, { isAtivo: false });
    }
    async disconnect() {
        await this.prisma.$disconnect();
    }
}
exports.UserService = UserService;
