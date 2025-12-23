"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRoles = void 0;
const checkRoles = (allowedRoles) => {
    return (req, res, next) => {
        try {
            const authReq = req;
            const userRoles = authReq.roles;
            if (!userRoles) {
                return res.status(403).json({
                    erro: "Acesso negado. Roles não identificadas."
                });
            }
            const hasRequiredRole = userRoles.some(role => allowedRoles.includes(role));
            if (!hasRequiredRole) {
                return res.status(403).json({
                    erro: "Acesso negado. Você não tem permissão para acessar este recurso."
                });
            }
            if (authReq.userLogadoId && authReq.userLogadoNome) {
                authReq.user = {
                    id: authReq.userLogadoId,
                    nome: authReq.userLogadoNome,
                    roles: userRoles
                };
            }
            next();
        }
        catch (error) {
            console.error("CheckRoles Error:", error);
            return res.status(500).json({ erro: "Erro interno na verificação de permissões" });
        }
    };
};
exports.checkRoles = checkRoles;
