"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../config/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const passwordUtils_1 = require("../utils/passwordUtils");
const emailService_1 = require("../utils/emailService");
class UserService {
    constructor(schoolId) {
        this.schoolId = schoolId;
    }
    async create(data) {
        const existingUser = await prisma_1.prisma.usuario.findUnique({
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
        const newUser = await prisma_1.prisma.usuario.create({
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
        return prisma_1.prisma.usuario.findMany({
            where: { schoolId: this.schoolId },
            include: {
                roles: {
                    include: { role: true }
                }
            }
        });
    }
    async findById(userId) {
        return prisma_1.prisma.usuario.findFirst({
            where: {
                id: userId,
                schoolId: this.schoolId
            },
            include: {
                roles: {
                    include: { role: true }
                }
            }
        });
    }
    async findByEmail(email) {
        return prisma_1.prisma.usuario.findUnique({
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
}
exports.UserService = UserService;
