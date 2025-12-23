"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const zod_1 = require("zod");
const checkToken_1 = require("../src/shared/middlewares/checkToken");
const checkRoles_1 = require("../src/shared/middlewares/checkRoles");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const campoSchema = zod_1.z.object({
    campoExperiencia: zod_1.z.nativeEnum(client_1.CAMPO_EXPERIENCIA)
});
router.post("/", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN"]), async (req, res) => {
    const valida = campoSchema.safeParse(req.body);
    if (!valida.success) {
        res.status(400).json({ erro: valida.error });
        return;
    }
    try {
        const campo = await prisma.camposDeExperiencia.create({
            data: valida.data
        });
        res.status(201).json(campo);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
router.get("/", checkToken_1.checkToken, (0, checkRoles_1.checkRoles)(["ADMIN", "PROFESSOR"]), async (req, res) => {
    try {
        const campos = await prisma.camposDeExperiencia.findMany({
            orderBy: {
                id: 'asc'
            }
        });
        res.status(200).json(campos);
    }
    catch (error) {
        res.status(400).json(error);
    }
});
exports.default = router;
