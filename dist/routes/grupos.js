"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const checkToken_1 = require("../src/shared/middlewares/checkToken");
const checkRoles_1 = require("../src/shared/middlewares/checkRoles");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
router.get("/", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN", "PROFESSOR"]), async (req, res) => {
    try {
        const grupos = await prisma.grupoPorCampo.findMany({
            include: {
                _count: {
                    select: {
                        turmas: true,
                        objetivos: true
                    }
                }
            }
        });
        const gruposFormatados = grupos.map(grupo => ({
            id: grupo.id,
            nome: grupo.nome,
            totalTurmas: grupo._count.turmas,
            totalObjetivos: grupo._count.objetivos
        }));
        res.status(200).json(gruposFormatados);
    }
    catch (error) {
        console.error('Erro ao listar grupos:', error);
        res.status(400).json({
            erro: "Erro ao listar grupos",
            details: error instanceof Error ? error.message : "Erro interno do servidor"
        });
    }
});
exports.default = router;
