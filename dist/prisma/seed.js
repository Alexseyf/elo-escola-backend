"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting seeding...');
    const allRoles = [
        client_1.TIPO_USUARIO.PLATFORM_ADMIN,
        client_1.TIPO_USUARIO.ADMIN,
        client_1.TIPO_USUARIO.PROFESSOR,
        client_1.TIPO_USUARIO.RESPONSAVEL
    ];
    for (const roleTipo of allRoles) {
        await prisma.role.upsert({
            where: { tipo: roleTipo },
            update: {},
            create: { tipo: roleTipo }
        });
    }
    console.log('✅ Roles criadas/verificadas');
    const platformEmail = 'root@user.com';
    let platformUser = await prisma.usuario.findFirst({
        where: {
            email: platformEmail,
            schoolId: null
        }
    });
    if (!platformUser) {
        console.log(`Creating Platform Admin user: ${platformEmail}`);
        const hashedPassword = await bcrypt_1.default.hash('Alex@123', 10);
        const platformAdminRole = await prisma.role.findUnique({
            where: { tipo: client_1.TIPO_USUARIO.PLATFORM_ADMIN }
        });
        if (!platformAdminRole) {
            throw new Error('Role PLATFORM_ADMIN não encontrada!');
        }
        platformUser = await prisma.usuario.create({
            data: {
                nome: 'Super Admin',
                email: platformEmail,
                senha: hashedPassword,
                telefone: '000000000',
                isAtivo: true,
                senhaAlterada: false,
                roles: {
                    create: {
                        roleId: platformAdminRole.id
                    }
                }
            }
        });
        console.log('✅ Platform Admin criado!');
        console.log(`📧 Email: ${platformEmail}`);
        console.log('🔑 Password: Alex@123');
        console.log('🌍 Escopo: GLOBAL (sem escola vinculada)');
    }
    else {
        console.log(`⚠️ Platform Admin já existe: ${platformEmail}`);
    }
    console.log('🎉 Seeding completed!');
}
main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
