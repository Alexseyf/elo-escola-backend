"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../errors/AppError");
const errorMiddleware = (err, req, res, next) => {
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            status: 'validation_error',
            errors: err.errors,
        });
    }
    console.error('[INTERNAL ERROR]', err);
    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
    });
};
exports.errorMiddleware = errorMiddleware;
