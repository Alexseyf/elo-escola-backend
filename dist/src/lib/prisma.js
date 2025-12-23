"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const env_1 = require("../config/env");
const logLevels = env_1.env.NODE_ENV === 'development'
    ? ['info', 'warn', 'error']
    : ['error'];
exports.prisma = new client_1.PrismaClient({
    log: logLevels,
    datasources: {
        db: {
            url: env_1.env.DATABASE_URL,
        },
    },
});
