"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const usuarios_1 = __importDefault(require("./routes/usuarios"));
const usuarios_2 = __importDefault(require("./routes/usuarios"));
const turmas_1 = __importDefault(require("./routes/turmas"));
const alunos_1 = __importDefault(require("./routes/alunos"));
const professores_1 = __importDefault(require("./routes/professores"));
const responsaveis_1 = __importDefault(require("./routes/responsaveis"));
const diarios_1 = __importDefault(require("./routes/diarios"));
const cronogramas_1 = __importDefault(require("./routes/cronogramas"));
const eventos_1 = __importDefault(require("./routes/eventos"));
const atividades_1 = __importDefault(require("./routes/atividades"));
const login_1 = __importDefault(require("./routes/login"));
const recuperaSenha_1 = __importDefault(require("./routes/recuperaSenha"));
const validaSenha_1 = __importDefault(require("./routes/validaSenha"));
const campos_1 = __importDefault(require("./routes/campos"));
const objetivos_1 = __importDefault(require("./routes/objetivos"));
const grupos_1 = __importDefault(require("./routes/grupos"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("./swagger.json"));
const tenant_middleware_1 = require("./src/shared/middlewares/tenant.middleware"); // Importa tenant middleware
const platform_routes_1 = require("./src/modules/platform/platform.routes"); // Rotas da plataforma para PLATFORM_ADMIN (não é necessário tenant context)
const app = (0, express_1.default)();
const port = 3000;
// Adiciona 'x-tenant-id' aos allowedHeaders
app.use((0, cors_1.default)({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'x-tenant-id',
    ],
    exposedHeaders: ['Authorization'],
    credentials: true, // Permitir cookies se necessário
}));
app.use(express_1.default.json());
// O login e a recuperação de senha podem funcionar inicialmente sem o tenant
// (O tenant pode ser resolvido APÓS o login, com base no schoolId do usuário)
app.use("/login", login_1.default);
app.use("/recupera-senha", recuperaSenha_1.default);
app.use("/valida-senha", validaSenha_1.default);
// Rotas para PLATFORM_ADMIN - exigem autenticação, mas não tenant context
// Permitem o gerenciamento global da plataforma (criação de escolas, visualização de todos os usuários, etc.)
app.use("/api/v1/platform", platform_routes_1.platformRouter);
// Documentação Swagger
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.get('/', (req, res) => {
    res.send('API - Escola Educação Infantil');
});
// Garante que TODAS as rotas protegidas identifiquem o tenant (escola) corretamente
// Todas as rotas registradas APÓS este middleware exigirão:
// - Cabeçalho x-tenant-id válido OU
// - Subdomínio válido que corresponda a um slug da escola
app.use(tenant_middleware_1.tenantMiddleware);
// Todas as rotas abaixo deste ponto terão res.locals.schoolId disponível
app.use("/usuarios", usuarios_1.default);
app.use('/usuarios', usuarios_2.default);
app.use('/turmas', turmas_1.default);
app.use('/alunos', alunos_1.default);
app.use('/professores', professores_1.default);
app.use('/responsaveis', responsaveis_1.default);
app.use('/diarios', diarios_1.default);
app.use('/cronogramas', cronogramas_1.default);
app.use('/eventos', eventos_1.default);
app.use('/atividades', atividades_1.default);
app.use('/objetivos', objetivos_1.default);
app.use('/grupos', grupos_1.default);
app.use("/campos", campos_1.default);
// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    res.status(500).json({
        error: 'Algo deu errado!',
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => {
        console.log(`Servidor rodando na porta ${port}`);
    });
}
exports.default = app;
