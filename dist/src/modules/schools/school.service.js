"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolService = void 0;
const prisma_1 = require("../../lib/prisma");
const AppError_1 = require("../../shared/errors/AppError");
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
class SchoolService {
    /**
     * Creates a new School (Tenant) and its first Admin User.
     * This is a "Platform Level" operation, so it doesn't take a schoolId context in constructor usually,
     * or it acts in a global context.
     */
    async createSchool(data) {
        // 1. Validate Slug Uniqueness
        const existingSchool = await prisma_1.prisma.school.findUnique({
            where: { slug: data.slug }
        });
        if (existingSchool) {
            throw new AppError_1.AppError(`School with slug '${data.slug}' already exists`, 409);
        }
        // 2. Validate Email Uniqueness (Global check for safety, though schema is unique per school)
        // It's good practice to avoid reuse of emails across tenants for admins if we ever want a unified login.
        // For now, let's just check if this email exists in *any* school to warn? 
        // Or stick to the requirement: Create school + admin.
        // Let's rely on transaction failure if unique constraint is violated, 
        // but effectively we are creating a new schoolId, so constraint [email, schoolId] won't trigger unless we bug out.
        const hashedPassword = await bcrypt_1.default.hash(data.adminUser.senha, 10);
        return prisma_1.prisma.$transaction(async (tx) => {
            // Create School
            const school = await tx.school.create({
                data: {
                    name: data.name,
                    slug: data.slug,
                    active: true
                }
            });
            // Create Admin Role if not exists (it should exist from seed, but safety first)
            const adminRole = await tx.role.upsert({
                where: { tipo: client_1.TIPO_USUARIO.ADMIN },
                update: {},
                create: { tipo: client_1.TIPO_USUARIO.ADMIN }
            });
            // Create User
            const user = await tx.usuario.create({
                data: {
                    nome: data.adminUser.nome,
                    email: data.adminUser.email,
                    senha: hashedPassword,
                    telefone: '', // prompt didn't require it, let's leave empty or default
                    schoolId: school.id,
                    isAtivo: true,
                    roles: {
                        create: {
                            roleId: adminRole.id
                        }
                    }
                }
            });
            return {
                school,
                admin: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email
                }
            };
        });
    }
}
exports.SchoolService = SchoolService;
