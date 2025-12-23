export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
    schoolId: string;
    [key: string]: any;
}

export class TenantLogger {
    constructor(private schoolId: string) {
        if (!schoolId) {
            throw new Error('[TenantLogger] schoolId é obrigatório');
        }
    }

    private log(level: LogLevel, message: string, context?: Record<string, any>) {
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
        } else {
            const contextStr = context ? JSON.stringify(context) : '';
            console.log(
                `[${timestamp}] [${level.toUpperCase()}] [School: ${this.schoolId}] ${message}`,
                contextStr
            );
        }
    }


    info(message: string, context?: Record<string, any>) {
        this.log('info', message, context);
    }
    warn(message: string, context?: Record<string, any>) {
        this.log('warn', message, context);
    }

    error(message: string, error?: Error | any, context?: Record<string, any>) {
        this.log('error', message, {
            ...context,
            errorMessage: error?.message,
            errorStack: error?.stack,
            errorName: error?.name
        });
    }

    debug(message: string, context?: Record<string, any>) {
        if (process.env.NODE_ENV !== 'production') {
            this.log('debug', message, context);
        }
    }
}

export function createTenantLogger(schoolId: string): TenantLogger {
    return new TenantLogger(schoolId);
}
