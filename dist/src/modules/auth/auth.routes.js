"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../lib/prisma");
const env_1 = require("../../config/env");
const authRouter = (0, express_1.Router)();
exports.authRouter = authRouter;
authRouter.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    const msg = "Login ou senha incorretos";
    if (!email || !senha) {
        res.status(400).json({ status: "error", message: "Email e senha são obrigatórios" });
        return;
    }
    try {
        const usuario = await prisma_1.prisma.usuario.findFirst({
            where: {
                email: email,
                isAtivo: true
            },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                },
                school: true
            }
        });
        if (usuario && bcrypt_1.default.compareSync(senha, usuario.senha)) {
            if (!usuario.isAtivo) {
                res.status(401).json({ status: "error", message: "Usuário inativo. Contate a administração." });
                return;
            }
            const roles = usuario.roles.map(ur => ur.role.tipo);
            const token = jsonwebtoken_1.default.sign({
                userLogadoId: usuario.id,
                userLogadoNome: usuario.nome,
                schoolId: usuario.schoolId,
                roles: roles,
            }, env_1.env.JWT_KEY, { expiresIn: "30d" });
            const primeiroAcesso = !usuario.senhaAlterada;
            const resposta = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                roles: roles,
                token,
                primeiroAcesso,
                schoolSlug: usuario.school?.slug ?? null
            };
            res.status(200).json(resposta);
            await prisma_1.prisma.log.create({
                data: {
                    descricao: "Login Realizado",
                    complemento: `Usuário: ${usuario.email}`,
                    usuarioId: usuario.id,
                    schoolId: usuario.schoolId ?? undefined
                },
            });
            return;
        }
        res.status(400).json({ status: "error", message: msg });
    }
    catch (error) {
        console.error("Erro no Login:", error);
        res.status(500).json({ status: "error", message: "Erro interno no servidor ao realizar login" });
    }
});
