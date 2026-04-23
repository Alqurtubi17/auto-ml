import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const adminPassword = await bcrypt.hash("adminlarik173864009", 10);
    const testPassword = await bcrypt.hash("testlarik173864009", 10);

    const admin = await prisma.user.upsert({
        where: { email: "admin@larikai.solutionist.id" },
        update: {},
        create: {
            name: "Chief Admin",
            email: "admin@larikai.solutionist.id",
            password: adminPassword,
            role: "ADMIN",
            emailVerified: new Date(),
        },
    });

    const testUser = await prisma.user.upsert({
        where: { email: "test@larikai.solutionist.id" },
        update: {},
        create: {
            name: "Testing User",
            email: "test@larikai.solutionist.id",
            password: testPassword,
            role: "USER",
            emailVerified: new Date(),
        },
    });

    console.log({ admin, testUser });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });