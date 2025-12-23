"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const checkToken_1 = require("../src/shared/middlewares/checkToken");
const checkRoles_1 = require("../src/shared/middlewares/checkRoles");
const userService_1 = require("../services/userService");
const user_schema_1 = require("../schemas/user.schema");
const router = (0, express_1.Router)();
// Cria um usuário
router.post("/", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)([client_1.TIPO_USUARIO.ADMIN, client_1.TIPO_USUARIO.PLATFORM_ADMIN]), async (req, res) => {
    try {
        const isPlatformAdmin = req.roles?.includes(client_1.TIPO_USUARIO.PLATFORM_ADMIN);
        let schoolId;
        if (isPlatformAdmin) {
            schoolId = req.body.schoolId;
            if (!schoolId) {
                return res.status(400).json({
                    error: "PLATFORM_ADMIN deve fornecer 'schoolId' no body da requisição"
                });
            }
            const { prisma } = await Promise.resolve().then(() => __importStar(require('../src/lib/prisma')));
            const schoolExists = await prisma.school.findUnique({
                where: { id: schoolId }
            });
            if (!schoolExists) {
                return res.status(404).json({
                    error: `Escola com ID '${schoolId}' não encontrada`
                });
            }
        }
        else {
            schoolId = req.schoolId;
            if (!schoolId) {
                return res.status(400).json({
                    error: "Contexto da escola não identificado"
                });
            }
        }
        const { schoolId: _, ...bodyWithoutSchoolId } = req.body;
        const valida = user_schema_1.createUserSchema.safeParse(bodyWithoutSchoolId);
        if (!valida.success) {
            return res.status(400).json({ erro: valida.error });
        }
        const userService = new userService_1.UserService(schoolId);
        const newUser = await userService.create(valida.data);
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error("Erro ao criar usuário:", error);
        if (error.message === 'Email already registered for this school.') {
            return res.status(409).json({ erro: error.message });
        }
        res.status(400).json({ error: error.message || "Erro inesperado" });
    }
});
// Lista todos os usuários
router.get("/", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const userService = new userService_1.UserService(schoolId);
        const users = await userService.findAll();
        const formattedUsers = users.map(u => ({
            ...u,
            roles: u.roles.map(ur => ur.role.tipo)
        }));
        res.status(200).json(formattedUsers);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
// Busca o usuário logado
router.get("/usuario-logado", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const userId = req.userLogadoId;
        if (!userId)
            return res.status(401).json({ error: "Usuário não identificado" });
        const userService = new userService_1.UserService(schoolId);
        const usuario = await userService.findById(userId);
        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }
        const { senha, ...usuarioSemSenha } = usuario;
        const usuarioFormatado = {
            ...usuarioSemSenha,
            roles: usuario.roles.map(ur => ur.role.tipo)
        };
        res.status(200).json(usuarioFormatado);
    }
    catch (error) {
        console.error("Erro ao buscar usuário logado:", error);
        res.status(500).json({ erro: "Erro ao buscar dados do usuário" });
    }
});
// Busca um usuário por ID
router.get("/:usuarioId", checkToken_1.checkToken, async (req, res) => {
    try {
        const schoolId = req.schoolId;
        if (!schoolId)
            return res.status(400).json({ error: "Contexto da escola não identificado" });
        const usuarioId = parseInt(req.params.usuarioId);
        if (isNaN(usuarioId))
            return res.status(400).json({ erro: "ID inválido" });
        const userService = new userService_1.UserService(schoolId);
        const usuario = await userService.findById(usuarioId);
        if (!usuario)
            return res.status(404).json({ erro: "Usuário não encontrado" });
        const { senha, ...usuarioSemSenha } = usuario;
        const usuarioFormatado = {
            ...usuarioSemSenha,
            roles: usuario.roles.map(ur => ur.role.tipo)
        };
        res.status(200).json(usuarioFormatado);
    }
    catch (error) {
        res.status(500).json({ erro: "Erro interno" });
    }
});
exports.default = router;
