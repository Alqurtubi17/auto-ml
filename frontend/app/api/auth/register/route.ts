import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!email || !password || !name) {
            return new NextResponse(JSON.stringify({ message: "Semua kolom wajib diisi" }), { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return new NextResponse(JSON.stringify({ message: "Email sudah terdaftar" }), { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        const verificationToken = await generateVerificationToken(email);

        await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

        return new NextResponse(JSON.stringify({ message: "Akun dibuat. Cek terminal untuk link verifikasi email." }), { status: 201 });

    } catch (error) {
        console.error(error);
        return new NextResponse(JSON.stringify({ message: "Terjadi kesalahan internal" }), { status: 500 });
    }
}