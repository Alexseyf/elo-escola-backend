"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const checkToken_1 = require("../src/shared/middlewares/checkToken");
const checkRoles_1 = require("../src/shared/middlewares/checkRoles");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const objetivoSchema = zod_1.z.object({
    codigo: zod_1.z.string().max(10),
    descricao: zod_1.z.string().max(500),
    grupoId: zod_1.z.number().int().positive(),
    campoExperienciaId: zod_1.z.number().int().positive()
});
router.post("/", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN"]), async (req, res) => {
    const valida = objetivoSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: "Dados inválidos", details: valida.error });
        return;
    }
    try {
        const grupo = await prisma.grupoPorCampo.findUnique({
            where: { id: valida.data.grupoId }
        });
        if (!grupo) {
            return res.status(400).json({ erro: "Grupo não encontrado" });
        }
        const campo = await prisma.camposDeExperiencia.findUnique({
            where: { id: valida.data.campoExperienciaId }
        });
        if (!campo) {
            return res.status(400).json({ erro: "Campo de experiência não encontrado" });
        }
        const existingObjetivo = await prisma.objetivo.findUnique({
            where: { codigo: valida.data.codigo }
        });
        if (existingObjetivo) {
            return res.status(400).json({ erro: "Já existe um objetivo com este código" });
        }
        const objetivo = await prisma.objetivo.create({
            data: valida.data,
            include: {
                grupo: true,
                campoExperiencia: true
            }
        });
        res.status(201).json(objetivo);
    }
    catch (error) {
        console.error('Erro ao criar objetivo:', error);
        res.status(400).json({
            erro: "Erro ao criar objetivo",
            details: error instanceof Error ? error.message : "Erro interno do servidor"
        });
    }
});
router.get("/turma/:turmaId", checkToken_1.checkToken, async (req, res) => {
    const turmaId = Number(req.params.turmaId);
    if (isNaN(turmaId) || turmaId <= 0) {
        return res.status(400).json({ erro: "turmaId inválido" });
    }
    try {
        const objetivos = await prisma.objetivo.findMany({
            where: {
                grupo: {
                    turmas: {
                        some: { id: turmaId }
                    }
                }
            },
            include: {
                grupo: true,
                campoExperiencia: true
            }
        });
        res.json(objetivos);
    }
    catch (error) {
        console.error('Erro ao buscar objetivos da turma:', error);
        res.status(500).json({ erro: "Erro ao buscar objetivos da turma" });
    }
});
router.get("/grupo-campo", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN", "PROFESSOR"]), async (req, res) => {
    const { grupoId, campoId } = req.query;
    if (!grupoId || !campoId) {
        return res.status(400).json({
            erro: "Parâmetros inválidos",
            details: "Os parâmetros 'grupoId' e 'campoId' são obrigatórios. Exemplo: /objetivos/grupo-campo?grupoId=1&campoId=1"
        });
    }
    const grupoIdNum = Number(grupoId);
    const campoIdNum = Number(campoId);
    if (isNaN(grupoIdNum) || isNaN(campoIdNum) || grupoIdNum <= 0 || campoIdNum <= 0) {
        return res.status(400).json({
            erro: "Parâmetros inválidos",
            details: "grupoId e campoId devem ser números positivos"
        });
    }
    try {
        const objetivos = await prisma.objetivo.findMany({
            where: {
                grupoId: grupoIdNum,
                campoExperienciaId: campoIdNum
            },
            include: {
                grupo: true,
                campoExperiencia: true
            }
        });
        res.status(200).json(objetivos);
    }
    catch (error) {
        console.error('Erro ao buscar objetivos por grupo e campo:', error);
        res.status(400).json({
            erro: "Erro ao buscar objetivos",
            details: error instanceof Error ? error.message : "Erro interno do servidor"
        });
    }
});
router.get("/", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN", "PROFESSOR"]), async (req, res) => {
    try {
        const objetivos = await prisma.objetivo.findMany({
            include: {
                grupo: true,
                campoExperiencia: true
            }
        });
        res.status(200).json(objetivos);
    }
    catch (error) {
        console.error('Erro ao listar objetivos:', error);
        res.status(400).json({
            erro: "Erro ao listar objetivos",
            details: error instanceof Error ? error.message : "Erro interno do servidor"
        });
    }
});
exports.default = router;
