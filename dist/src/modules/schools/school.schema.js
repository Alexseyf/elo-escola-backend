"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSchoolSchema = void 0;
const zod_1 = require("zod");
exports.createSchoolSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).max(255),
    slug: zod_1.z.string().min(3).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
    adminUser: zod_1.z.object({
        nome: zod_1.z.string().min(3),
        email: zod_1.z.string().email(),
        senha: zod_1.z.string().min(6)
    })
});
