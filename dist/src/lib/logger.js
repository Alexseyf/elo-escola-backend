"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantLogger = void 0;
exports.createTenantLogger = createTenantLogger;
class TenantLogger {
    constructor(schoolId) {
        this.schoolId = schoolId;
        if (!schoolId) {
            throw new Error('[TenantLogger] schoolId é obrigatório');
        }
    }
    log(level, message, context) {
        const timestamp = new Date().toISOString();
        const logData = {
            timestamp,
            level,
            schoolId: this.schoolId,
            message,
            ...context
        };
        if (process.env.NODE_ENV === 'production') {
            console.log(JSON.stringify(logData));
        }
        else {
            const contextStr = context ? JSON.stringify(context) : '';
            console.log(`[${timestamp}] [${level.toUpperCase()}] [School: ${this.schoolId}] ${message}`, contextStr);
        }
    }
    info(message, context) {
        this.log('info', message, context);
    }
    warn(message, context) {
        this.log('warn', message, context);
    }
    error(message, error, context) {
        this.log('error', message, {
            ...context,
            errorMessage: error?.message,
            errorStack: error?.stack,
            errorName: error?.name
        });
    }
    debug(message, context) {
        if (process.env.NODE_ENV !== 'production') {
            this.log('debug', message, context);
        }
    }
}
exports.TenantLogger = TenantLogger;
function createTenantLogger(schoolId) {
    return new TenantLogger(schoolId);
}
