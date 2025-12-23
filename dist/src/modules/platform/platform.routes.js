"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../../lib/prisma");
const client_1 = require("@prisma/client");
const checkToken_1 = require("../../shared/middlewares/checkToken");
const checkRoles_1 = require("../../shared/middlewares/checkRoles");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }
    try {
        const usuario = await prisma_1.prisma.usuario.findFirst({
            where: {
                email,
                roles: {
                    some: {
                        role: { tipo: client_1.TIPO_USUARIO.PLATFORM_ADMIN }
                    }
                }
            },
            include: {
                roles: { include: { role: true } }
            }
        });
        if (!usuario || !bcrypt_1.default.compareSync(senha, usuario.senha)) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }
        if (!usuario.isAtivo) {
            return res.status(401).json({ erro: 'Usuário inativo' });
        }
        const roles = usuario.roles.map(ur => ur.role.tipo);
        const token = jsonwebtoken_1.default.sign({
            userLogadoId: usuario.id,
            userLogadoNome: usuario.nome,
            schoolId: null,
            roles: roles,
        }, process.env.JWT_KEY, { expiresIn: '30d' });
        res.status(200).json({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            roles,
            token,
            primeiroAcesso: !usuario.senhaAlterada,
            scope: 'platform',
        });
        await prisma_1.prisma.log.create({
            data: {
                descricao: 'Platform Login',
                complemento: `PLATFORM_ADMIN: ${usuario.email}`,
                usuarioId: usuario.id,
                schoolId: usuario.schoolId ?? undefined
            }
        }).catch(() => {
        });
    }
    catch (error) {
        console.error('Erro no Platform Login:', error);
        res.status(500).json({ erro: 'Erro interno' });
    }
});
router.get('/schools', checkToken_1.checkToken, (0, checkRoles_1.checkRoles)([client_1.TIPO_USUARIO.PLATFORM_ADMIN]), async (req, res) => {
    try {
        const schools = await prisma_1.prisma.school.findMany({
            include: {
                _count: {
                    select: {
                        usuarios: true,
                        alunos: true,
                        turmas: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(schools);
    }
    catch (error) {
        console.error('Erro ao listar escolas:', error);
        res.status(500).json({ erro: 'Erro interno' });
    }
});
router.get('/users', checkToken_1.checkToken, (0, checkRoles_1.checkRoles)([client_1.TIPO_USUARIO.PLATFORM_ADMIN]), async (req, res) => {
    try {
        const users = await prisma_1.prisma.usuario.findMany({
            include: {
                school: { select: { id: true, name: true, slug: true } },
                roles: { include: { role: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        const formattedUsers = users.map(u => ({
            ...u,
            senha: undefined,
            roles: u.roles.map(ur => ur.role.tipo)
        }));
        res.status(200).json(formattedUsers);
    }
    catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ erro: 'Erro interno' });
    }
});
router.get('/metrics', checkToken_1.checkToken, (0, checkRoles_1.checkRoles)([client_1.TIPO_USUARIO.PLATFORM_ADMIN]), async (req, res) => {
    try {
        const [schoolCount, userCount, studentCount, activeSchools] = await Promise.all([
            prisma_1.prisma.school.count(),
            prisma_1.prisma.usuario.count(),
            prisma_1.prisma.aluno.count(),
            prisma_1.prisma.school.count({ where: { active: true } })
        ]);
        res.status(200).json({
            totalSchools: schoolCount,
            activeSchools,
            totalUsers: userCount,
            totalStudents: studentCount
        });
    }
    catch (error) {
        console.error('Erro ao obter métricas:', error);
        res.status(500).json({ erro: 'Erro interno' });
    }
});
exports.platformRouter = router;
