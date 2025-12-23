"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../config/prisma");
const tenant_middleware_1 = require("../src/shared/middlewares/tenant.middleware");
const router = (0, express_1.Router)();
router.post("/", tenant_middleware_1.tenantMiddleware, async (req, res) => {
    const { email, senha } = req.body;
    const schoolId = req.schoolId;
    const msg = "Login ou senha incorretos";
    if (!email || !senha) {
        res.status(400).json({ erro: "Email e senha são obrigatórios" });
        return;
    }
    if (!schoolId) {
        res.status(400).json({ erro: "Escola não identificada (Header ou Domínio)" });
        return;
    }
    try {
        const usuario = await prisma_1.prisma.usuario.findUnique({
            where: {
                email_schoolId: {
                    email: email,
                    schoolId: schoolId
                }
            },
            include: {
                roles: {
                    include: {
                        role: true
                    }
                }
            }
        });
        if (usuario && bcrypt_1.default.compareSync(senha, usuario.senha)) {
            if (!usuario.isAtivo) {
                return res.status(401).json({ erro: "Usuário inativo. Contate a administração." });
            }
            const roles = usuario.roles.map(ur => ur.role.tipo);
            const token = jsonwebtoken_1.default.sign({
                userLogadoId: usuario.id,
                userLogadoNome: usuario.nome,
                schoolId: usuario.schoolId,
                roles: roles,
            }, process.env.JWT_KEY, { expiresIn: "30d" });
            const primeiroAcesso = !usuario.senhaAlterada;
            const resposta = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                roles: roles,
                token,
                primeiroAcesso,
            };
            res.status(200).json(resposta);
            await prisma_1.prisma.log.create({
                data: {
                    descricao: "Login Realizado",
                    complemento: `Usuário: ${usuario.email}`,
                    usuarioId: usuario.id,
                    schoolId: usuario.schoolId
                },
            });
            return;
        }
        res.status(400).json({ erro: msg });
    }
    catch (error) {
        console.error("Erro no Login:", error);
        res.status(400).json({ erro: "Erro interno no login" });
    }
});
exports.default = router;
